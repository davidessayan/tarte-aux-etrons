import { defineService, loadScript, deleteCookies } from './utils'
import { ensureGtag } from '../core/consent-mode'

export function ga4(measurementId: string, id = 'ga4') {
  // Le cookie de session est nommé d'après l'ID sans son préfixe « G- » (G-ABC123 → _ga_ABC123)
  const sessionCookie = `_ga_${measurementId.replace(/^G-/, '')}`
  const disableKey = `ga-disable-${measurementId}` as const
  let configured = false

  return defineService({
    id,
    name: 'Google Analytics 4',
    category: 'analytics',
    description: "Mesure l'audience et le comportement des visiteurs.",
    cookieNames: ['_ga', '_gid', sessionCookie],
    consentSignals: ['analytics_storage'],
    requiresReload: true,
    onAccept() {
      window[disableKey] = false
      if (configured) return
      configured = true

      const gtag = ensureGtag()
      // `js` n'est envoyé qu'une fois, même avec plusieurs propriétés GA4
      if (!window.dataLayer.some((entry) => (entry as ArrayLike<unknown>)[0] === 'js')) {
        gtag('js', new Date())
      }
      loadScript(`https://www.googletagmanager.com/gtag/js?id=${measurementId}`)
      gtag('config', measurementId)
    },
    onRefuse() {
      // Coupe la collecte si gtag est déjà chargé (opt-out documenté par Google)
      window[disableKey] = true
      deleteCookies(['_ga', '_gid', sessionCookie])
    },
  })
}

declare global {
  interface Window {
    [disableKey: `ga-disable-${string}`]: boolean | undefined
  }
}
