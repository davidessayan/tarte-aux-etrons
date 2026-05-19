import type {
  TaEConfig,
  ConsentState,
  ConsentStatus,
  ServiceDefinition,
  ConsentEventMap,
} from './types'
import { ConsentStorage } from './storage'
import { EventBus, type Listener } from './events'

export class ConsentManager {
  private config: Required<TaEConfig>
  private state: ConsentState
  private storage: ConsentStorage
  readonly events: EventBus

  constructor(config: TaEConfig) {
    this.config = {
      storageKey: 'tae_consent',
      consentVersion: 1,
      onReady: () => {},
      onConsentChange: () => {},
      onBulkChange: () => {},
      ...config,
    }
    this.storage = new ConsentStorage(this.config.storageKey)
    this.events = new EventBus()
    this.state = this.initState()
  }

  private initState(): ConsentState {
    const saved = this.storage.load()

    if (saved && saved.version === this.config.consentVersion) {
      return saved
    }

    return {
      version: this.config.consentVersion,
      updatedAt: Date.now(),
      services: {},
    }
  }

  init(): void {
    if (typeof window === 'undefined') return

    this.config.services.forEach((service) => {
      const status = this.getServiceStatus(service.id)
      if (status === 'accepted') service.onAccept()
      if (status === 'refused') service.onRefuse()
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
    this.config.services.forEach((s) => this.applyConsent(s.id, 'accepted'))
    this.persist()
    this.config.services.forEach((s) => this.config.onConsentChange(s.id, 'accepted'))
    this.config.onBulkChange('swallow-all', this.state)
    this.events.emit('consent:bulk', { action: 'swallow-all', state: this.state })
    this.events.emit('banner:hide')
  }

  flushAll(): void {
    this.config.services.forEach((s) => this.applyConsent(s.id, 'refused'))
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
      if (this.isDigested(s.id)) s.onRefuse()
    })

    this.storage.clear()
    this.state = {
      version: this.config.consentVersion,
      updatedAt: Date.now(),
      services: {},
    }
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

    this.state.services[serviceId] = { status, updatedAt: Date.now() }
    this.state.updatedAt = Date.now()

    if (status === 'accepted') service.onAccept()
    if (status === 'refused') service.onRefuse()
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
