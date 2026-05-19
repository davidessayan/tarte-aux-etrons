import { ConsentManager } from './core/consent-manager'
import { Banner, type BannerOptions } from './ui/banner'
import type { TaEConfig } from './core/types'

export interface CreateTaEOptions extends TaEConfig {
  banner?: Omit<BannerOptions, 'manager'>
}

export function createTaE(options: CreateTaEOptions): { manager: ConsentManager; banner: Banner } {
  const { banner: bannerOptions, ...managerConfig } = options

  const manager = new ConsentManager(managerConfig)
  const banner = new Banner({ manager, ...bannerOptions })

  banner.mount()
  manager.init()

  return { manager, banner }
}
