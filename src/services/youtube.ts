import { defineService } from './utils'

export function youtube(id = 'youtube') {
  return defineService({
    id,
    name: 'YouTube',
    category: 'social',
    description: 'Lecteur vidéo YouTube avec suivi intégré.',
    cookieNames: ['VISITOR_INFO1_LIVE', 'YSC', 'yt-remote-*'],
    onAccept() {
      document.querySelectorAll<HTMLIFrameElement>('iframe[data-src*="youtube"]').forEach((iframe) => {
        iframe.src = iframe.dataset.src!
      })
    },
    onRefuse() {
      document.querySelectorAll<HTMLIFrameElement>('iframe[data-src*="youtube"]').forEach((iframe) => {
        iframe.src = ''
      })
    },
  })
}
