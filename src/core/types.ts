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

export interface ServiceDefinition {
  id: string
  name: string
  category: ServiceCategory
  description: string
  cookieNames?: string[]
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
  onReady?: (state: ConsentState) => void
  onConsentChange?: (serviceId: string, status: ConsentStatus) => void
  onBulkChange?: (action: 'accept-all' | 'refuse-all', state: ConsentState) => void
}

export interface BannerLabels {
  title: string
  description: string
  acceptAll: string
  refuseAll: string
  customize: string
  save: string
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
  'consent:bulk': { action: 'accept-all' | 'refuse-all'; state: ConsentState }
  'banner:show': void
  'banner:hide': void
}
