import { defineService, loadScript, deleteCookies } from './utils'

export function linkedinInsight(partnerId: string, id = 'linkedin-insight') {
  return defineService({
    id,
    name: 'LinkedIn Insight Tag',
    category: 'advertising',
    description: 'Mesure les conversions et retargeting publicitaire LinkedIn.',
    cookieNames: ['li_sugr', 'UserMatchHistory', 'bcookie', 'lidc', 'li_gc'],
    onAccept() {
      if (window._linkedin_partner_id) return
      window._linkedin_partner_id = partnerId
      window._linkedin_data_partner_ids ??= []
      window._linkedin_data_partner_ids.push(partnerId)
      loadScript('https://snap.licdn.com/li.lms-analytics/insight.min.js')
    },
    onRefuse() {
      deleteCookies(['li_sugr', 'UserMatchHistory', 'bcookie', 'lidc', 'li_gc'])
    },
  })
}

declare global {
  interface Window {
    _linkedin_partner_id?: string
    _linkedin_data_partner_ids?: string[]
  }
}
