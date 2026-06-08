import { defineService, loadScript, deleteCookiesMatching } from './utils'

export function matomo(siteUrl: string, siteId: number, id = 'matomo') {
  const url = siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`
  return defineService({
    id,
    name: 'Matomo',
    category: 'analytics',
    description: "Mesure d'audience auto-hébergée, respectueuse de la vie privée.",
    cookieNames: ['_pk_id.*', '_pk_ses.*', '_pk_ref.*'],
    onAccept() {
      if (window._paq) return
      window._paq = []
      window._paq.push(['setTrackerUrl', `${url}matomo.php`])
      window._paq.push(['setSiteId', String(siteId)])
      window._paq.push(['trackPageView'])
      window._paq.push(['enableLinkTracking'])
      loadScript(`${url}matomo.js`)
    },
    onRefuse() {
      deleteCookiesMatching(['_pk_id', '_pk_ses', '_pk_ref'])
    },
  })
}

declare global {
  interface Window {
    _paq?: unknown[][]
  }
}
