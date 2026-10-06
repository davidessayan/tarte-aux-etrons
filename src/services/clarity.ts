import { defineService, loadScript, deleteCookies } from './utils'

export function microsoftClarity(projectId: string, id = 'clarity') {
  return defineService({
    id,
    name: 'Microsoft Clarity',
    category: 'analytics',
    description: 'Enregistrement de sessions et heatmaps comportementaux.',
    cookieNames: ['_clck', '_clsk', 'CLID', 'MUID', 'MR', 'ANONCHK', 'SM'],
    requiresReload: true,
    onAccept() {
      if (!window.clarity) {
        window.clarity = Object.assign(
          (...args: unknown[]) => { (window.clarity!.q ??= []).push(args) },
          { q: [] as unknown[][] },
        ) as ClarityFn
        loadScript(`https://www.clarity.ms/tag/${projectId}`)
      }
      window.clarity('consentv2', consent('granted'))
    },
    onRefuse() {
      // Clarity supprime ses cookies, clôt la session et repasse en mode sans consentement
      window.clarity?.('consentv2', consent('denied'))
      deleteCookies(['_clck', '_clsk', 'CLID', 'MUID', 'MR', 'ANONCHK', 'SM'])
    },
  })
}

// Clarity n'active ses cookies que si les deux signaux sont accordés
const consent = (value: 'granted' | 'denied') => ({ ad_Storage: value, analytics_Storage: value })

type ClarityFn = ((...args: unknown[]) => void) & { q?: unknown[][] }

declare global {
  interface Window {
    clarity?: ClarityFn
  }
}
