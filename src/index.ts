export { createTaE } from './factory'
export { ConsentManager } from './core/consent-manager'
export { Banner } from './ui/banner'
export { ga4, gtm, youtube, hotjar, chickenplayer } from './services'
export { defineService, loadScript, deleteCookies } from './services/utils'
export { fr, frPoop, en, enPoop } from './locales'
export { poopTheme, seriousTheme } from './themes'
export type { CreateTaEOptions } from './factory'
export type {
  TaEConfig,
  ConsentState,
  ConsentStatus,
  ServiceDefinition,
  ServiceCategory,
  ConsentEventMap,
  BannerLabels,
  ThemeVars,
} from './core/types'
export type { BannerOptions } from './ui/banner'
