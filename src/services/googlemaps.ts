import { defineService } from './utils'

export function googleMaps(id = 'google-maps') {
  return defineService({
    id,
    name: 'Google Maps',
    category: 'functional',
    description: 'Cartes interactives intégrées via Google Maps.',
    cookieNames: ['NID', 'CONSENT', 'SOCS'],
    onAccept() {
      document.querySelectorAll<HTMLIFrameElement>('iframe[data-src*="google.com/maps"]').forEach((iframe) => {
        iframe.src = iframe.dataset.src!
      })
    },
    onRefuse() {
      document.querySelectorAll<HTMLIFrameElement>('iframe[src*="google.com/maps"]').forEach((iframe) => {
        iframe.dataset.src = iframe.src
        iframe.src = ''
      })
    },
  })
}
