import { defineService, loadScript, deleteCookies } from './utils'

export function ga4(measurementId: string, id = 'ga4') {
  return defineService({
    id,
    name: 'Google Analytics 4',
    category: 'analytics',
    description: "Mesure l'audience et le comportement des visiteurs.",
    cookieNames: ['_ga', '_gid', `_ga_${measurementId}`],
    onAccept() {
      if (window.gtag) return
      loadScript(`https://www.googletagmanager.com/gtag/js?id=${measurementId}`)
      window.dataLayer ??= []
      window.gtag = function () { window.dataLayer.push(arguments) }
      window.gtag('js', new Date())
      window.gtag('config', measurementId)
    },
    onRefuse() {
      deleteCookies(['_ga', '_gid', `_ga_${measurementId}`])
    },
  })
}

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}
