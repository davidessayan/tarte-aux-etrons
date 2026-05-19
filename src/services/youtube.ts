import { defineService } from './utils'

export function youtube(id = 'youtube') {
  return defineService({
    id,
    name: 'YouTube',
    category: 'social',
    description: 'Lecteur vidéo YouTube avec suivi intégré.',
    cookieNames: ['VISITOR_INFO1_LIVE', 'YSC', 'yt-remote-*'],
    onAccept() {
      document.querySelectorAll<HTMLElement>('[data-tae-youtube]').forEach((el) => {
        const videoId = el.dataset.taeYoutube
        if (!videoId) return

        const iframe = document.createElement('iframe')
        iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}`
        iframe.width = el.dataset.width ?? '560'
        iframe.height = el.dataset.height ?? '315'
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
        iframe.allowFullscreen = true
        iframe.style.border = 'none'
        el.replaceWith(iframe)
      })
    },
    onRefuse() {},
  })
}
