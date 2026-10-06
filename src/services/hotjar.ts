import { defineService, loadScript, deleteCookiesMatching, clearStorageMatching } from './utils'

export interface HotjarOptions {
  version?: number
  /** Id du service (défaut : 'hotjar'). */
  id?: string
}

export function hotjar(siteId: number, options: string | HotjarOptions = {}) {
  const { version = 6, id = 'hotjar' } = typeof options === 'string' ? { id: options } : options

  return defineService({
    id,
    name: 'Hotjar',
    category: 'analytics',
    description: 'Enregistrement de sessions et heatmaps.',
    cookieNames: ['_hjSessionUser_*', '_hjSession_*', '_hjid', '_hjFirstSeen', '_hjIncludedInPageviewSample', '_hjAbsoluteSessionInProgress'],
    requiresReload: true,
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
      deleteCookiesMatching(['_hj'])
      clearStorageMatching(['_hj'])
    },
  })
}

declare global {
  interface Window {
    hj?: ((...args: unknown[]) => void) & { q?: unknown[][] }
    _hjSettings?: { hjid: number; hjsv: number }
  }
}
