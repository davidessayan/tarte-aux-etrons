import { defineService, loadScript, deleteCookies } from './utils'

export function microsoftClarity(projectId: string, id = 'clarity') {
  return defineService({
    id,
    name: 'Microsoft Clarity',
    category: 'analytics',
    description: 'Enregistrement de sessions et heatmaps comportementaux.',
    cookieNames: ['_clck', '_clsk', 'CLID', 'MUID', 'MR', 'ANONCHK', 'SM'],
    onAccept() {
      if (window.clarity) {
        window.clarity('consent')
        return
      }
      window.clarity = Object.assign(
        (...args: unknown[]) => { (window.clarity!.q ??= []).push(args) },
        { q: [] as unknown[][] },
      ) as ClarityFn
      loadScript(`https://www.clarity.ms/tag/${projectId}`)
      window.clarity('consent')
    },
    onRefuse() {
      deleteCookies(['_clck', '_clsk', 'CLID', 'MUID', 'MR', 'ANONCHK', 'SM'])
    },
  })
}

type ClarityFn = ((...args: unknown[]) => void) & { q?: unknown[][] }

declare global {
  interface Window {
    clarity?: ClarityFn
  }
}
