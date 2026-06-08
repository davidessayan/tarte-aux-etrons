import { defineService, loadScript, deleteCookies } from './utils'

export function facebookPixel(pixelId: string, id = 'facebook-pixel') {
  return defineService({
    id,
    name: 'Facebook Pixel',
    category: 'advertising',
    description: 'Mesure les conversions et cible les publicités Facebook/Meta.',
    cookieNames: ['_fbp', 'fr'],
    onAccept() {
      if (window.fbq) return
      const fbq = Object.assign(
        (...args: unknown[]) => {
          if (fbq.callMethod) fbq.callMethod(...args)
          else (fbq.queue ??= []).push(args)
        },
        { push: (...args: unknown[]) => fbq(...args), loaded: true, version: '2.0', queue: [] as unknown[][] },
      ) as FbqFunction
      window.fbq = fbq
      window._fbq ??= fbq
      fbq('init', pixelId)
      fbq('track', 'PageView')
      loadScript('https://connect.facebook.net/en_US/fbevents.js')
    },
    onRefuse() {
      deleteCookies(['_fbp', 'fr'])
    },
  })
}

type FbqFunction = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void
  push: (...args: unknown[]) => void
  loaded: boolean
  version: string
  queue: unknown[][]
}

declare global {
  interface Window {
    fbq?: FbqFunction
    _fbq?: FbqFunction
  }
}
