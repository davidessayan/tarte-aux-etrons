import type { ConsentEventMap } from './types'

export type Listener<T> = T extends void ? () => void : (payload: T) => void

export class EventBus {
  private readonly listeners = new Map<string, Set<(payload: unknown) => void>>()

  on<K extends keyof ConsentEventMap>(event: K, listener: Listener<ConsentEventMap[K]>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    const set = this.listeners.get(event)!
    set.add(listener as (payload: unknown) => void)
    return () => this.off(event, listener)
  }

  off<K extends keyof ConsentEventMap>(event: K, listener: Listener<ConsentEventMap[K]>): void {
    this.listeners.get(event)?.delete(listener as (payload: unknown) => void)
  }

  emit<K extends keyof ConsentEventMap>(
    event: K,
    ...args: ConsentEventMap[K] extends void ? [] : [ConsentEventMap[K]]
  ): void {
    this.listeners.get(event)?.forEach((listener) => listener(args[0]))
  }
}
