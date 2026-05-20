import { createTaE, ga4, gtm, youtube, chickenplayer, frPoop } from '../src/index'

const { manager } = createTaE({
  consentVersion: 1,
  services: [
    ga4('G-XXXXXXXXXX'),
    gtm('GTM-XXXXXXX'),
    youtube(),
    chickenplayer(),
  ],
  onConsentChange(serviceId, status) {
    console.log(`[tae] ${serviceId} → ${status}`)
  },
  banner: {
    preset: 'poop',
    labels: frPoop,
    // Exemples de surcharge — décommentez pour tester :
    // labels: { ...frPoop, title: 'Vos cookies, votre choix' },
    // vars: { ...poopTheme, accent: '#e11d48', stripeA: '#e11d48', stripeB: '#f97316' },
  },
})

manager.on('ready', updateStateDisplay)
manager.on('consent:change', updateStateDisplay)
manager.on('consent:bulk', ({ action }) => {
  console.log(`[tae] bulk → ${action}`)
  updateStateDisplay()
})

document.getElementById('btn-reset')?.addEventListener('click', () => manager.plunge())
document.getElementById('btn-accept')?.addEventListener('click', () => manager.swallowAll())
document.getElementById('btn-refuse')?.addEventListener('click', () => manager.flushAll())

function updateStateDisplay() {
  const pre = document.getElementById('state-output')
  if (!pre) return
  pre.textContent = JSON.stringify(manager.getState(), null, 2)
}
