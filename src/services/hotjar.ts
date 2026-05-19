import { defineService, loadScript, deleteCookies } from './utils'

export function hotjar(siteId: number, { version = 6, id = 'hotjar' } = {}) {
  return defineService({
    id,
    name: 'Hotjar',
    category: 'analytics',
    description: 'Enregistrement de sessions et heatmaps.',
    cookieNames: ['_hjSessionUser_*', '_hjSession_*', '_hjid'],
    onAccept() {
      if (window.hj) return
      window._hjSettings = { hjid: siteId, hjsv: version }
      const hj = Object.assign(
        (...args: unknown[]) => { (hj.q ??= []).push(args) },
        { q: [] as unknown[][] },
      )
      window.hj = hj
      loadScript(`https://static.hotjar.com/c/hotjar-${siteId}.js?sv=${version}`)
    },
    onRefuse() {
      deleteCookies(['_hjid'])
    },
  })
}

declare global {
  interface Window {
    hj?: ((...args: unknown[]) => void) & { q?: unknown[][] }
    _hjSettings?: { hjid: number; hjsv: number }
  }
}
