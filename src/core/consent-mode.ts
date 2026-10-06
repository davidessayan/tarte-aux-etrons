import type { ConsentSignal } from './types'

export const CONSENT_SIGNALS: ConsentSignal[] = [
  'analytics_storage',
  'ad_storage',
  'ad_user_data',
  'ad_personalization',
]

/**
 * Définit le `gtag` standard s'il n'existe pas encore.
 * gtag.js et GTM lisent l'objet `arguments` dans le dataLayer, pas un tableau.
 */
export function ensureGtag(): (...args: unknown[]) => void {
  window.dataLayer ??= []
  window.gtag ??= function () { window.dataLayer.push(arguments) }
  return window.gtag
}

/** Tous les signaux à « denied » : à envoyer avant le chargement de tout tag Google. */
export function consentDefault(): void {
  ensureGtag()('consent', 'default', Object.fromEntries(CONSENT_SIGNALS.map((s) => [s, 'denied'])))
}

export function consentUpdate(granted: ConsentSignal[]): void {
  ensureGtag()(
    'consent',
    'update',
    Object.fromEntries(CONSENT_SIGNALS.map((s) => [s, granted.includes(s) ? 'granted' : 'denied'])),
  )
}

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}
