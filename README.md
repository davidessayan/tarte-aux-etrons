# 💩 tarte-aux-etrons

> Parce que les cookies, c'est de la merde.

Une lib RGPD/cookie consent moderne, typée TypeScript, sans dépendances, et qui assume totalement son thème.

[![npm](https://img.shields.io/npm/v/tarte-aux-etrons)](https://www.npmjs.com/package/tarte-aux-etrons)
[![license](https://img.shields.io/npm/l/tarte-aux-etrons)](./LICENSE)

---

## Pourquoi ?

Parce que les cookies, c'est de la merde. Alors autant en faire un truc agréable.

`tarte-aux-etrons` est une lib légère, typée TypeScript, sans dépendances, avec une API pensée pour ne pas vous pourrir la vie.

---

## Installation

```bash
npm install tarte-aux-etrons
# ou
pnpm add tarte-aux-etrons
# ou
yarn add tarte-aux-etrons
```

---

## Démarrage rapide

Le plus court chemin vers une bannière RGPD qui tourne :

```ts
import { createTaE, ga4 } from 'tarte-aux-etrons'

createTaE({
  services: [ga4('G-XXXXXXXXXX')],
})
```

C'est tout. La bannière 💩 s'affiche, le consentement est persisté en localStorage, GA4 se charge si l'utilisateur accepte.

---

## Concepts clés

| Concept | Rôle |
|---|---|
| **`ConsentManager`** | Cerveau. Gère l'état, le storage, les événements. |
| **`Banner`** | UI. Affiche la bannière et le panneau de personnalisation. |
| **`createTaE()`** | Factory. Câble les deux dans le bon ordre en une ligne. |
| **Services** | Définissent quoi charger/nettoyer selon le consentement. |

---

## Services disponibles

### Google Analytics 4

```ts
import { ga4 } from 'tarte-aux-etrons'

ga4('G-XXXXXXXXXX')

// Plusieurs propriétés GA4 sur le même site
ga4('G-XXXXXXXXXX')              // id: 'ga4' (défaut)
ga4('G-YYYYYYYYYY', 'ga4-blog') // id custom pour éviter les conflits
```

### Google Tag Manager

```ts
import { gtm } from 'tarte-aux-etrons'

gtm('GTM-XXXXXXX')
gtm('GTM-XXXXXXX', 'gtm-shop') // id custom
```

### YouTube

```ts
import { youtube } from 'tarte-aux-etrons'

youtube()
```

Utilisez `data-src` au lieu de `src` sur vos iframes YouTube — la lib active le chargement une fois le consentement donné :

```html
<iframe
  data-src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"
  width="560" height="315"
  allowfullscreen
></iframe>
```

Fonctionne aussi avec `youtube.com` dans l'URL. Sur refus, le `src` est vidé pour stopper le chargement.

### Hotjar

```ts
import { hotjar } from 'tarte-aux-etrons'

hotjar(1234567)
hotjar(1234567, { version: 6, id: 'hotjar-custom' })
```

---

## Créer un service personnalisé

```ts
import { defineService } from 'tarte-aux-etrons'

const myPixel = defineService({
  id: 'my-pixel',
  name: 'Mon Pixel',
  category: 'advertising', // 'analytics' | 'advertising' | 'social' | 'functional' | 'other'
  description: 'Suit les conversions.',
  cookieNames: ['_mypixel'],
  onAccept() {
    // Charger le script, initialiser le tracker, etc.
  },
  onRefuse() {
    // Nettoyer les cookies, désactiver le tracker, etc.
  },
})
```

**Utilitaires disponibles** pour écrire vos services :

```ts
import { loadScript, deleteCookies } from 'tarte-aux-etrons'

// Charge un script (idempotent — pas de double chargement)
loadScript('https://example.com/tracker.js')

// Supprime des cookies côté client (racine + sous-domaine)
deleteCookies(['_tracker', '_tracker_session'])
```

---

## Thème et personnalisation

### Presets

```ts
createTaE({
  services: [...],
  banner: {
    preset: 'poop',    // 💩 brun ambré — défaut
    preset: 'serious', // bleu sobre
    preset: 'none',    // aucun style — apportez le vôtre
  },
})
```

### Surcharge de tokens CSS

```ts
import { poopTheme } from 'tarte-aux-etrons'

createTaE({
  services: [...],
  banner: {
    vars: {
      ...poopTheme,          // base poop
      accent: '#e11d48',     // juste la couleur principale
      stripeA: '#e11d48',
      stripeB: '#f97316',
    },
  },
})
```

**Tokens disponibles :**

| Token | Variable CSS | Description |
|---|---|---|
| `accent` | `--tae-accent` | Couleur principale (boutons, toggles) |
| `accentHover` | `--tae-accent-hover` | Hover sur la couleur principale |
| `accentLight` | `--tae-accent-light` | Fond de hover sur les services |
| `accentMid` | `--tae-accent-mid` | Couleur des catégories |
| `bg` | `--tae-bg` | Fond de la bannière |
| `border` | `--tae-border` | Bordures |
| `stripeA` | `--tae-stripe-a` | Début du dégradé de la bande |
| `stripeB` | `--tae-stripe-b` | Fin du dégradé de la bande |
| `text` | `--tae-text` | Texte principal |
| `textMuted` | `--tae-text-muted` | Texte secondaire |
| `textSubtle` | `--tae-text-subtle` | Texte tertiaire (descriptions) |
| `serviceBg` | `--tae-service-bg` | Fond des cards de service |
| `serviceBorder` | `--tae-service-border` | Bordure des cards de service |
| `radius` | `--tae-radius` | Border-radius de la bannière |

**Surcharge CSS directe** (contrôle total) :

```css
.tae-banner {
  --tae-accent: #e11d48;
  --tae-bg: #fff1f2;
  --tae-border: #fecdd3;
}
```

---

## Localisation

Des locales prêtes à l'emploi sont fournies. Importez, étendez, ou remplacez.

```ts
import { createTaE, ga4, frPoop, en } from 'tarte-aux-etrons'

// Locale 💩 française (défaut du preset 'poop')
createTaE({ services: [ga4('G-XXX')], banner: { labels: frPoop } })

// Locale anglaise sobre
createTaE({ services: [ga4('G-XXX')], banner: { labels: en } })

// Override partiel
createTaE({
  services: [ga4('G-XXX')],
  banner: {
    labels: { ...frPoop, title: 'Vos cookies, votre choix' },
  },
})
```

**Locales disponibles :**

| Export | Langue | Style |
|---|---|---|
| `fr` | Français | Sobre |
| `frPoop` | Français | 💩 |
| `en` | Anglais | Sobre |
| `enPoop` | Anglais | 💩 |

**Créer sa propre locale :**

```ts
import type { BannerLabels } from 'tarte-aux-etrons'

const de: BannerLabels = {
  title: 'Diese Website verwendet Cookies',
  description: 'Wählen Sie aus, was Sie akzeptieren.',
  acceptAll: 'Alle akzeptieren',
  refuseAll: 'Alle ablehnen',
  customize: 'Anpassen',
  save: 'Meine Auswahl speichern',
  categoryLabels: {
    analytics: 'Analyse',
    advertising: 'Werbung',
    social: 'Soziale Medien',
    functional: 'Funktional',
    other: 'Sonstiges',
  },
}
```

---

## Événements

### Écouter les changements

```ts
const { manager } = createTaE({ services: [...] })

// Changement individuel (clic sur un toggle dans le panneau)
manager.on('consent:change', ({ serviceId, status, state }) => {
  console.log(`${serviceId} → ${status}`) // 'accepted' | 'refused'
})

// Changement en masse (boutons "Tout accepter" / "Tout refuser")
manager.on('consent:bulk', ({ action, state }) => {
  console.log(action) // 'swallow-all' | 'flush-all'
})

// Prêt (appelé une fois à l'init, avec l'état restauré du storage)
manager.on('ready', (state) => {
  console.log(state)
})
```

### Désabonnement

`manager.on()` retourne une fonction de désabonnement :

```ts
const unsubscribe = manager.on('consent:change', handler)
// Plus tard :
unsubscribe()
```

---

## Vérifier le consentement à la demande

```ts
manager.isDigested('ga4')  // boolean — consentement donné
manager.isFlushed('ga4')   // boolean — refusé
manager.isFloating('ga4')  // boolean — pas encore décidé

manager.getServiceStatus('ga4') // 'accepted' | 'refused' | 'pending'
manager.getState()              // ConsentState complet
```

---

## Actions programmatiques

```ts
manager.swallowAll() // Accepte tous les services
manager.flushAll()   // Refuse tous les services
manager.swallow('ga4') // Accepte un service précis
manager.flush('ga4')   // Refuse un service précis
manager.plunge()       // Réinitialise tout + réaffiche la bannière 🪠
```

---

## Utilisation avancée — sans bannière

Vous pouvez utiliser le `ConsentManager` seul et construire votre propre UI :

```ts
import { ConsentManager, ga4 } from 'tarte-aux-etrons'

const manager = new ConsentManager({
  services: [ga4('G-XXXXXXXXXX')],
  consentVersion: 1,
  onReady(state) { /* état restauré */ },
  onConsentChange(serviceId, status) { /* changement individuel */ },
  onBulkChange(action, state) { /* swallowAll / flushAll */ },
})

manager.init() // À appeler après avoir monté votre UI
```

---

## API complète — `createTaE(options)`

```ts
createTaE({
  // Obligatoire
  services: ServiceDefinition[],

  // Optionnel — ConsentManager
  storageKey?: string,       // clé localStorage, défaut: 'tae_consent'
  consentVersion?: number,   // incrémenter pour forcer un re-consentement
  onReady?: (state) => void,
  onConsentChange?: (serviceId, status) => void,
  onBulkChange?: (action, state) => void, // action: 'swallow-all' | 'flush-all'

  // Optionnel — Bannière
  banner?: {
    target?: HTMLElement,              // où monter la bannière, défaut: document.body
    preset?: 'poop' | 'serious' | 'none',
    vars?: ThemeVars,
    labels?: Partial<BannerLabels>,
  },
})
```

---

## Compatibilité

- **Navigateurs** : tous les navigateurs modernes (ES2020+)
- **Frameworks** : framework-agnostic — fonctionne avec React, Vue, Svelte, Next.js, Nuxt, vanilla JS...
- **SSR** : `ConsentManager.init()` ne s'exécute pas côté serveur (`typeof window === 'undefined'` guard)
- **Bundle** : ESM + CJS, types `.d.ts` inclus

---

## Licence

MIT
