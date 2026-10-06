export type ConsentStatus = 'pending' | 'accepted' | 'refused'

export interface ServiceConsent {
  status: ConsentStatus
  updatedAt: number
}

export interface ConsentState {
  version: number
  updatedAt: number
  services: Record<string, ServiceConsent>
}

/** Signaux Google Consent Mode v2. */
export type ConsentSignal =
  | 'analytics_storage'
  | 'ad_storage'
  | 'ad_user_data'
  | 'ad_personalization'

export interface ServiceDefinition {
  id: string
  name: string
  category: ServiceCategory
  description: string
  cookieNames?: string[]
  /**
   * Le script chargé par `onAccept` ne peut pas être déchargé : retirer le consentement
   * d'un service déjà actif dans la page nécessite un rechargement (voir `reloadOnRevoke`).
   */
  requiresReload?: boolean
  /**
   * Signaux Consent Mode accordés quand le service est accepté. Dès qu'un service en déclare,
   * TAE gère Consent Mode tout seul (défaut « denied » puis mises à jour).
   */
  consentSignals?: ConsentSignal[]
  onAccept: () => void
  onRefuse: () => void
}

export type ServiceCategory =
  | 'analytics'
  | 'advertising'
  | 'social'
  | 'functional'
  | 'other'

export interface TaEConfig {
  services: ServiceDefinition[]
  storageKey?: string
  consentVersion?: number
  /** Durée de validité d'un choix, en jours (défaut : 180, soit ~6 mois, recommandation CNIL). `0` = sans expiration. */
  consentMaxAge?: number
  /** Recharge la page quand un service `requiresReload` déjà actif est refusé (défaut : true). */
  reloadOnRevoke?: boolean
  onReady?: (state: ConsentState) => void
  onConsentChange?: (serviceId: string, status: ConsentStatus) => void
  onBulkChange?: (action: 'swallow-all' | 'flush-all', state: ConsentState) => void
}

export interface BannerLabels {
  title: string
  description: string
  acceptAll: string
  refuseAll: string
  customize: string
  customizeClose: string
  save: string
  privacyPolicy: string
  cookiesLabel: string
  reopen: string
  categoryLabels: Record<ServiceCategory, string>
}

export interface ThemeVars {
  accent?: string
  accentHover?: string
  accentLight?: string
  accentMid?: string
  bg?: string
  border?: string
  stripeA?: string
  stripeB?: string
  text?: string
  textMuted?: string
  textSubtle?: string
  serviceBg?: string
  serviceBorder?: string
  radius?: string
}

export type ConsentEventMap = {
  ready: ConsentState
  'consent:change': { serviceId: string; status: ConsentStatus; state: ConsentState }
  'consent:bulk': { action: 'swallow-all' | 'flush-all'; state: ConsentState }
  'banner:show': void
  'banner:hide': void
}
