export { createTaE } from './factory'
export { ConsentManager } from './core/consent-manager'
export { Banner } from './ui/banner'
export {
  ga4,
  gtm,
  youtube,
  hotjar,
  chickenplayer,
  facebookPixel,
  linkedinInsight,
  googleMaps,
  matomo,
  recaptchaV3,
  microsoftClarity,
  crisp,
} from './services'
export {
  defineService,
  loadScript,
  deleteCookies,
  deleteCookiesMatching,
  clearStorageMatching,
} from './services/utils'
export { fr, frPoop, en, enPoop } from './locales'
export { poopTheme, seriousTheme } from './themes'
export type { CreateTaEOptions } from './factory'
export type { GtmOptions } from './services/gtm'
export type { HotjarOptions } from './services/hotjar'
export type {
  TaEConfig,
  ConsentState,
  ConsentStatus,
  ServiceDefinition,
  ServiceCategory,
  ConsentSignal,
  ConsentEventMap,
  BannerLabels,
  ThemeVars,
} from './core/types'
export type { BannerOptions } from './ui/banner'
