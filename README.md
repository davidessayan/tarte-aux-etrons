# 💩 tarte-aux-etrons

> Parce que les cookies, c'est de la merde.

Une bannière de consentement RGPD en une ligne. TypeScript, zéro dépendance, Consent Mode v2 inclus, et un thème qui assume.

[![npm](https://img.shields.io/npm/v/tarte-aux-etrons)](https://www.npmjs.com/package/tarte-aux-etrons)
[![license](https://img.shields.io/npm/l/tarte-aux-etrons)](https://github.com/davidessayan/tarte-aux-etrons/blob/main/LICENSE)

[📖 Documentation](https://tarteauxetrons.creative-bones.com/docs) · [🛝 Playground](https://tarteauxetrons.creative-bones.com)

## Installation

```bash
npm install tarte-aux-etrons
```

## Démarrage rapide

```ts
import { createTaE, ga4 } from 'tarte-aux-etrons'

createTaE({
  services: [ga4('G-XXXXXXXXXX')],
})
```

C'est tout. La bannière s'affiche, le choix est mémorisé, et GA4 ne se charge que si le visiteur accepte.

## Sans tortiller du c**

Tout ça marche sans configuration :

- **Rien ne se charge avant le choix** du visiteur.
- **Refuser est aussi simple qu'accepter** : mêmes boutons, un clic.
- **Changer d'avis est facile** : un bouton « Gérer mes cookies » reste disponible. Un service retiré est coupé et ses cookies nettoyés.
- **Consent Mode v2** (GA4, GTM) géré automatiquement.
- **Le choix expire au bout de 6 mois**, comme le recommande maître CNIL.

## Services

Un appel par service, rien d'autre à configurer :

| Service | Appel |
|---|---|
| Google Analytics 4 | `ga4('G-XXXXXXXXXX')` |
| Google Tag Manager | `gtm('GTM-XXXXXXX')` · `gtm('GTM-XXXXXXX', { ads: true })` |
| Hotjar | `hotjar(1234567)` |
| Matomo | `matomo('https://analytics.monsite.fr', 1)` |
| Microsoft Clarity | `microsoftClarity('abcdefghij')` |
| Facebook Pixel | `facebookPixel('1234567890123456')` |
| LinkedIn Insight Tag | `linkedinInsight('1234567')` |
| Google reCAPTCHA v3 | `recaptchaV3('6LeXXXX…')` |
| Crisp | `crisp('xxxxxxxx-xxxx-…')` |
| YouTube | `youtube()` |
| Google Maps | `googleMaps()` |
| Chicken Player | `chickenplayer()` |

YouTube et Google Maps demandent `data-src` au lieu de `src` sur vos iframes. Il manque un service ? [Créez le vôtre](https://tarteauxetrons.creative-bones.com/docs/latest/api/#creer-un-service-personnalise) en quelques lignes.

## TAE pour un client sérieux, c'est faisable

```ts
import { createTaE, ga4, youtube, en } from 'tarte-aux-etrons'

createTaE({
  services: [ga4('G-XXXXXXXXXX'), youtube()],
  banner: {
    preset: 'serious',               // 💩 par défaut, ou le thème bleu sobre
    labels: en,                      // fr, frPoop, en, enPoop… ou les vôtres
    privacyUrl: '/privacy',          // lien vers votre politique de confidentialité
  },
})
```

## Aller plus loin

- [Services en détail](https://tarteauxetrons.creative-bones.com/docs/latest/services/) : options, prérequis et particularités de chaque service
- [Personnalisation](https://tarteauxetrons.creative-bones.com/docs/latest/personnalisation/) : thèmes, couleurs, textes et langues
- [Consentement & RGPD](https://tarteauxetrons.creative-bones.com/docs/latest/consentement/) : Consent Mode, durée de validité, retrait du consentement
- [API & avancé](https://tarteauxetrons.creative-bones.com/docs/latest/api/) : événements, état du consentement, service personnalisé, sans bannière

Navigateurs modernes (ES2020+), compatible avec tous les frameworks et le SSR. ESM + CJS, types inclus.

## Shitmap

- `isPerfect()` : savoir si tous les services ont été acceptés (ou refusés)
- Plus de services d'étrons : Google Fonts, Cloudflare Turnstile, TrustPilot, Brevo, Intercom…

## Licence

MIT
