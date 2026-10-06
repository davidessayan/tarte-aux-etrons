import type {
  TaEConfig,
  ConsentState,
  ConsentStatus,
  ServiceDefinition,
  ConsentEventMap,
} from './types'
import { ConsentStorage } from './storage'
import { EventBus, type Listener } from './events'
import { CONSENT_SIGNALS, consentDefault, consentUpdate } from './consent-mode'

const DAY_MS = 24 * 60 * 60 * 1000

export class ConsentManager {
  private config: Required<TaEConfig>
  private state: ConsentState
  private storage: ConsentStorage
  private activated = new Set<string>()
  private expired: string[] = []
  private reloadTimer: ReturnType<typeof setTimeout> | null = null
  private usesConsentMode: boolean
  private signalsSent = ''
  readonly events: EventBus

  constructor(config: TaEConfig) {
    this.config = {
      storageKey: 'tae_consent',
      consentVersion: 1,
      consentMaxAge: 180,
      reloadOnRevoke: true,
      onReady: () => {},
      onConsentChange: () => {},
      onBulkChange: () => {},
      ...config,
    }
    this.usesConsentMode = this.config.services.some((s) => s.consentSignals?.length)
    this.storage = new ConsentStorage(this.config.storageKey)
    this.events = new EventBus()
    this.state = this.initState()
  }

  private initState(): ConsentState {
    const saved = this.storage.load()

    if (saved && saved.version === this.config.consentVersion) {
      return this.dropExpired(saved)
    }

    return {
      version: this.config.consentVersion,
      updatedAt: Date.now(),
      services: {},
    }
  }

  // Les choix plus vieux que `consentMaxAge` repassent en `pending` (re-demande du consentement)
  private dropExpired(saved: ConsentState): ConsentState {
    const maxAge = this.config.consentMaxAge * DAY_MS
    if (maxAge <= 0) return saved

    const now = Date.now()
    const services: ConsentState['services'] = {}
    for (const [id, consent] of Object.entries(saved.services)) {
      if (now - consent.updatedAt > maxAge) this.expired.push(id)
      else services[id] = consent
    }
    return { ...saved, services }
  }

  init(): void {
    if (typeof window === 'undefined') return

    // Consent Mode : « denied » partout puis l'état restauré, avant que le moindre tag ne démarre
    if (this.usesConsentMode) {
      consentDefault()
      this.syncConsentMode()
    }

    this.config.services.forEach((service) => {
      const status = this.getServiceStatus(service.id)
      if (status === 'accepted') this.activate(service)
      if (status === 'refused') service.onRefuse()
    })

    // Nettoie les traces des choix expirés : le service est de nouveau en attente de décision
    this.expired.forEach((id) => {
      this.config.services.find((s) => s.id === id)?.onRefuse()
    })

    this.config.onReady(this.state)
    this.events.emit('ready', this.state)

    if (this.needsBanner()) {
      this.events.emit('banner:show')
    }
  }

  getServiceStatus(serviceId: string): ConsentStatus {
    return this.state.services[serviceId]?.status ?? 'pending'
  }

  isDigested(serviceId: string): boolean {
    return this.getServiceStatus(serviceId) === 'accepted'
  }

  isFlushed(serviceId: string): boolean {
    return this.getServiceStatus(serviceId) === 'refused'
  }

  isFloating(serviceId: string): boolean {
    return this.getServiceStatus(serviceId) === 'pending'
  }

  getState(): ConsentState {
    return { ...this.state }
  }

  needsBanner(): boolean {
    return this.config.services.some((s) => this.isFloating(s.id))
  }

  swallowAll(): void {
    this.applyAll('accepted')
    this.persist()
    this.config.services.forEach((s) => this.config.onConsentChange(s.id, 'accepted'))
    this.config.onBulkChange('swallow-all', this.state)
    this.events.emit('consent:bulk', { action: 'swallow-all', state: this.state })
    this.events.emit('banner:hide')
  }

  flushAll(): void {
    this.applyAll('refused')
    this.persist()
    this.config.services.forEach((s) => this.config.onConsentChange(s.id, 'refused'))
    this.config.onBulkChange('flush-all', this.state)
    this.events.emit('consent:bulk', { action: 'flush-all', state: this.state })
    this.events.emit('banner:hide')
  }

  swallow(serviceId: string): void {
    this.setConsent(serviceId, 'accepted')
  }

  flush(serviceId: string): void {
    this.setConsent(serviceId, 'refused')
  }

  plunge(): void {
    // Stoppe les services déjà actifs avant de vider l'état
    this.config.services.forEach((s) => {
      if (this.isDigested(s.id)) this.deactivate(s)
    })

    this.storage.clear()
    this.state = {
      version: this.config.consentVersion,
      updatedAt: Date.now(),
      services: {},
    }
    this.syncConsentMode()
    this.events.emit('banner:show')
  }

  on<K extends keyof ConsentEventMap>(event: K, listener: Listener<ConsentEventMap[K]>): () => void {
    return this.events.on(event, listener)
  }

  off<K extends keyof ConsentEventMap>(event: K, listener: Listener<ConsentEventMap[K]>): void {
    this.events.off(event, listener)
  }

  getServices(): ServiceDefinition[] {
    return this.config.services
  }

  private applyConsent(serviceId: string, status: ConsentStatus): void {
    const service = this.config.services.find((s) => s.id === serviceId)
    if (!service) return

    this.record(serviceId, status)
    this.syncConsentMode()
    this.dispatch(service, status)
  }

  // En rafale, les signaux sont envoyés une seule fois, avant le démarrage du premier service
  private applyAll(status: ConsentStatus): void {
    this.config.services.forEach((s) => this.record(s.id, status))
    this.syncConsentMode()
    this.config.services.forEach((s) => this.dispatch(s, status))
  }

  private record(serviceId: string, status: ConsentStatus): void {
    this.state.services[serviceId] = { status, updatedAt: Date.now() }
    this.state.updatedAt = Date.now()
  }

  private dispatch(service: ServiceDefinition, status: ConsentStatus): void {
    if (status === 'accepted') this.activate(service)
    if (status === 'refused') this.deactivate(service)
  }

  // Signaux accordés = union de ceux des services acceptés. N'envoie que si ça a changé.
  private syncConsentMode(): void {
    if (!this.usesConsentMode) return

    const granted = CONSENT_SIGNALS.filter((signal) =>
      this.config.services.some((s) => this.isDigested(s.id) && s.consentSignals?.includes(signal)),
    )
    const key = granted.join()
    if (key === this.signalsSent) return

    this.signalsSent = key
    consentUpdate(granted)
  }

  private activate(service: ServiceDefinition): void {
    service.onAccept()
    this.activated.add(service.id)
  }

  // Un service déjà actif dans cette page ne peut pas toujours être déchargé : on recharge
  private deactivate(service: ServiceDefinition): void {
    service.onRefuse()
    const wasActive = this.activated.delete(service.id)
    if (wasActive && service.requiresReload) this.scheduleReload()
  }

  // Différé : laisse finir les retraits en rafale (panneau) et leur persistance avant de recharger
  private scheduleReload(): void {
    if (!this.config.reloadOnRevoke || typeof window === 'undefined' || this.reloadTimer) return
    this.reloadTimer = setTimeout(() => window.location.reload(), 0)
  }

  private setConsent(serviceId: string, status: ConsentStatus): void {
    this.applyConsent(serviceId, status)
    this.persist()
    this.config.onConsentChange(serviceId, status)
    this.events.emit('consent:change', { serviceId, status, state: this.state })
  }

  private persist(): void {
    this.storage.save(this.state)
  }
}
