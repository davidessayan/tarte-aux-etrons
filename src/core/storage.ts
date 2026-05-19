import type { ConsentState } from './types'

const DEFAULT_KEY = 'tae_consent'

function isValidConsentState(data: unknown): data is ConsentState {
  if (typeof data !== 'object' || data === null) return false
  const d = data as Record<string, unknown>
  return (
    typeof d['version'] === 'number' &&
    typeof d['updatedAt'] === 'number' &&
    typeof d['services'] === 'object' &&
    d['services'] !== null
  )
}

export class ConsentStorage {
  private key: string

  constructor(key = DEFAULT_KEY) {
    this.key = key
  }

  load(): ConsentState | null {
    try {
      const raw = localStorage.getItem(this.key)
      if (!raw) return null
      const parsed: unknown = JSON.parse(raw)
      return isValidConsentState(parsed) ? parsed : null
    } catch {
      return null
    }
  }

  save(state: ConsentState): void {
    try {
      localStorage.setItem(this.key, JSON.stringify(state))
    } catch {
      // localStorage indisponible (SSR, navigation privée stricte)
    }
  }

  clear(): void {
    try {
      localStorage.removeItem(this.key)
    } catch {
      // noop
    }
  }
}
