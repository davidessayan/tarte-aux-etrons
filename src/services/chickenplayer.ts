import { defineService } from './utils'

export function chickenplayer(id = 'chickenplayer') {
  return defineService({
    id,
    name: 'Chicken Player',
    category: 'social',
    description: 'Lecteur vidéo avec support YouTube, Vimeo et Dailymotion.',
    cookieNames: [
      // YouTube
      'VISITOR_INFO1_LIVE', 'YSC', 'yt-remote-*',
      // Vimeo
      'vuid', 'player',
      // Dailymotion
      'dmvk', 'v1st', 'ts',
    ],
    onAccept() {
      window.dispatchEvent(new Event('chickenPlayer.cookies.consent'))
    },
    onRefuse() {
      window.dispatchEvent(new Event('chickenPlayer.cookies.reject'))
    },
  })
}
