import { defineService, loadScript } from './utils'

export interface GtmOptions {
  /** Id du service (défaut : 'gtm', ou 'gtm-ads' avec `ads`). */
  id?: string
  /** Pour les balises publicitaires du conteneur (Google Ads, remarketing…) plutôt que la mesure d'audience. */
  ads?: boolean
}

/**
 * Un conteneur GTM contient des balises de finalités différentes : on le déclare une fois par
 * finalité (`gtm('GTM-X')` pour l'audience, `gtm('GTM-X', { ads: true })` pour la pub).
 * Il n'est chargé qu'une fois ; les signaux Consent Mode suivent ce que le visiteur accepte.
 */
export function gtm(containerId: string, options: string | GtmOptions = {}) {
  const { ads = false, id = ads ? 'gtm-ads' : 'gtm' } = typeof options === 'string' ? { id: options } : options

  return defineService({
    id,
    name: ads ? 'Google Tag Manager (publicité)' : 'Google Tag Manager',
    category: ads ? 'advertising' : 'analytics',
    description: ads
      ? 'Balises publicitaires et de remarketing déployées via Google Tag Manager.'
      : "Balises de mesure d'audience déployées via Google Tag Manager.",
    consentSignals: ads
      ? ['ad_storage', 'ad_user_data', 'ad_personalization']
      : ['analytics_storage'],
    requiresReload: true,
    onAccept() {
      const src = `https://www.googletagmanager.com/gtm.js?id=${containerId}`
      if (window.google_tag_manager?.[containerId] || document.querySelector(`script[src="${src}"]`)) return

      window.dataLayer ??= []
      window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' })
      loadScript(src)
    },
    onRefuse() {},
  })
}

declare global {
  interface Window {
    google_tag_manager?: Record<string, unknown>
  }
}
