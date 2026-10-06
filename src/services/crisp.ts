import { defineService, loadScript, deleteCookiesMatching, clearStorageMatching } from './utils'

export function crisp(websiteId: string, id = 'crisp') {
  return defineService({
    id,
    name: 'Crisp',
    category: 'functional',
    description: 'Chat en direct pour le support client.',
    cookieNames: [],
    requiresReload: true,
    onAccept() {
      if (window.CRISP_WEBSITE_ID) return
      window.$crisp = []
      window.CRISP_WEBSITE_ID = websiteId
      loadScript('https://client.crisp.chat/l.js')
    },
    onRefuse() {
      // Crisp stocke sa session côté navigateur : à purger même quand le script n'est pas chargé
      clearStorageMatching(['crisp-client'])
      deleteCookiesMatching(['crisp-client'])
      if (!window.$crisp) return
      window.$crisp.push(['do', 'session:reset'])
      window.$crisp.push(['do', 'chatbox:hide'])
    },
  })
}

declare global {
  interface Window {
    $crisp?: unknown[][]
    CRISP_WEBSITE_ID?: string
  }
}
