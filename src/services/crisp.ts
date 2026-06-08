import { defineService, loadScript } from './utils'

export function crisp(websiteId: string, id = 'crisp') {
  return defineService({
    id,
    name: 'Crisp',
    category: 'functional',
    description: 'Chat en direct pour le support client.',
    cookieNames: [],
    onAccept() {
      if (window.CRISP_WEBSITE_ID) return
      window.$crisp = []
      window.CRISP_WEBSITE_ID = websiteId
      loadScript('https://client.crisp.chat/l.js')
    },
    onRefuse() {
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
