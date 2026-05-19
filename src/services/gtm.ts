import { defineService, loadScript } from './utils'

export function gtm(containerId: string, id = 'gtm') {
  return defineService({
    id,
    name: 'Google Tag Manager',
    category: 'functional',
    description: 'Gestionnaire de balises pour déployer des scripts tiers.',
    cookieNames: ['_gtm*'],
    onAccept() {
      if (window.google_tag_manager?.[containerId]) return
      window.dataLayer ??= []
      window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' })
      loadScript(`https://www.googletagmanager.com/gtm.js?id=${containerId}`)
    },
    onRefuse() {},
  })
}

declare global {
  interface Window {
    dataLayer: unknown[]
    google_tag_manager?: Record<string, unknown>
  }
}
