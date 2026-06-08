import { defineService, loadScript, deleteCookies } from './utils'

export function recaptchaV3(siteKey: string, id = 'recaptcha') {
  return defineService({
    id,
    name: 'Google reCAPTCHA',
    category: 'functional',
    description: 'Protection anti-spam et anti-bot sur les formulaires.',
    cookieNames: ['_GRECAPTCHA'],
    onAccept() {
      if (window.grecaptcha) return
      loadScript(`https://www.google.com/recaptcha/api.js?render=${siteKey}`)
    },
    onRefuse() {
      deleteCookies(['_GRECAPTCHA'])
    },
  })
}

declare global {
  interface Window {
    grecaptcha?: {
      ready(callback: () => void): void
      execute(siteKey: string, options?: { action?: string }): Promise<string>
    }
  }
}
