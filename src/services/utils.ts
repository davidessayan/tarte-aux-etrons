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
 * Expire un cookie sur l'hôte courant et sur chacun de ses domaines parents
 * (ex. sur www.site.fr : www.site.fr puis site.fr), là où les trackers le posent.
 */
function expireCookie(name: string): void {
  const expired = 'expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/'
  document.cookie = `${name}=; ${expired}`
  const labels = location.hostname.split('.')
  for (let i = 0; i < labels.length - 1; i++) {
    document.cookie = `${name}=; ${expired}; domain=.${labels.slice(i).join('.')}`
  }
}

/**
 * Supprime des cookies côté client (hôte courant + domaines parents).
 * Ne peut pas supprimer les cookies HttpOnly ni ceux posés sur le domaine d'un tiers.
 */
export function deleteCookies(names: string[]): void {
  if (typeof document === 'undefined') return
  names.forEach(expireCookie)
}

/**
 * Supprime tous les cookies dont le nom commence par l'un des préfixes donnés.
 * Couvre les cookies à suffixe dynamique (ex. _pk_id.1.xxxx, _hjSession_abc).
 */
export function deleteCookiesMatching(prefixes: string[]): void {
  if (typeof document === 'undefined') return
  document.cookie.split(';').forEach((pair) => {
    const name = pair.split('=')[0].trim()
    if (prefixes.some((prefix) => name.startsWith(prefix))) expireCookie(name)
  })
}

/**
 * Supprime du localStorage et du sessionStorage les clés commençant par l'un des préfixes donnés.
 * Les traceurs (Hotjar, Crisp…) y stockent aussi des identifiants : même régime que les cookies.
 */
export function clearStorageMatching(prefixes: string[]): void {
  if (typeof window === 'undefined') return
  for (const storage of [() => window.localStorage, () => window.sessionStorage]) {
    try {
      const area = storage()
      Object.keys(area)
        .filter((key) => prefixes.some((prefix) => key.startsWith(prefix)))
        .forEach((key) => area.removeItem(key))
    } catch {
      // storage indisponible (navigation privée stricte, iframe sandboxée)
    }
  }
}

/**
 * Helper typé pour définir un service. Fournit l'autocomplétion et
 * garantit la conformité à ServiceDefinition sans boilerplate.
 */
export function defineService(definition: ServiceDefinition): ServiceDefinition {
  return definition
}
