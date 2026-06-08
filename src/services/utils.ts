import type { ServiceDefinition } from '../core/types'

/**
 * Charge un script externe une seule fois (idempotent).
 */
export function loadScript(src: string): void {
  if (typeof document === 'undefined') return
  if (document.querySelector(`script[src="${src}"]`)) return

  const script = document.createElement('script')
  script.src = src
  script.async = true
  document.head.appendChild(script)
}

/**
 * Supprime des cookies côté client (racine + sous-domaine).
 * Ne peut pas supprimer les cookies HttpOnly.
 */
export function deleteCookies(names: string[]): void {
  if (typeof document === 'undefined') return
  const expired = 'expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/'
  names.forEach((name) => {
    document.cookie = `${name}=; ${expired}`
    document.cookie = `${name}=; ${expired}; domain=.${location.hostname}`
  })
}

/**
 * Supprime tous les cookies dont le nom commence par l'un des préfixes donnés.
 * Couvre les cookies à suffixe dynamique (ex. _pk_id.1.xxxx, _hjSession_abc).
 */
export function deleteCookiesMatching(prefixes: string[]): void {
  if (typeof document === 'undefined') return
  const expired = 'expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/'
  document.cookie.split(';').forEach((pair) => {
    const name = pair.split('=')[0].trim()
    if (prefixes.some((prefix) => name.startsWith(prefix))) {
      document.cookie = `${name}=; ${expired}`
      document.cookie = `${name}=; ${expired}; domain=.${location.hostname}`
    }
  })
}

/**
 * Helper typé pour définir un service. Fournit l'autocomplétion et
 * garantit la conformité à ServiceDefinition sans boilerplate.
 */
export function defineService(definition: ServiceDefinition): ServiceDefinition {
  return definition
}
