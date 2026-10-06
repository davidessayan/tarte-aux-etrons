# Personnalisation

## Thèmes

```ts
createTaE({
  services: [...],
  banner: {
    preset: 'poop',    // 💩 brun ambré (défaut)
    // preset: 'serious', // bleu sobre
  },
})
```

## Changer les couleurs

Partez d'un thème et surchargez ce que vous voulez :

```ts
import { poopTheme } from 'tarte-aux-etrons'

createTaE({
  services: [...],
  banner: {
    vars: {
      ...poopTheme,          // base
      accent: '#e11d48',     // juste la couleur principale
      stripeA: '#e11d48',
      stripeB: '#f97316',
    },
  },
})
```

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

Ou directement en CSS :

```css
.tae-banner,
.tae-reopen {
  --tae-accent: #e11d48;
  --tae-bg: #fff1f2;
  --tae-border: #fecdd3;
}
```

## Langues et textes

Des locales prêtes à l'emploi sont fournies :

| Export | Langue | Style |
|---|---|---|
| `fr` | Français | Sobre |
| `frPoop` | Français | 💩 |
| `en` | Anglais | Sobre |
| `enPoop` | Anglais | 💩 |

```ts
import { createTaE, ga4, en } from 'tarte-aux-etrons'

createTaE({ services: [ga4('G-XXX')], banner: { labels: en } })

// Surcharge partielle
createTaE({
  services: [ga4('G-XXX')],
  banner: { labels: { ...en, title: 'Your cookies, your choice' } },
})
```

### Créer sa propre locale

```ts
import type { BannerLabels } from 'tarte-aux-etrons'

const de: BannerLabels = {
  title: 'Diese Website verwendet Cookies',
  description: 'Wählen Sie aus, was Sie akzeptieren.',
  acceptAll: 'Alle akzeptieren',
  refuseAll: 'Alle ablehnen',
  customize: 'Anpassen',
  customizeClose: 'Schließen',
  save: 'Meine Auswahl speichern',
  privacyPolicy: 'Datenschutzerklärung',
  cookiesLabel: 'Cookies:',
  reopen: 'Cookies verwalten',
  categoryLabels: {
    analytics: 'Analyse',
    advertising: 'Werbung',
    social: 'Soziale Medien',
    functional: 'Funktional',
    other: 'Sonstiges',
  },
}
```

## Information et retrait

- `banner: { privacyUrl: '/confidentialite' }` ajoute un lien vers votre politique de confidentialité dans la bannière.
- `banner: { reopenButton: false }` retire le bouton flottant « Gérer mes cookies » si vous préférez votre propre lien. Voir [Retrait du consentement](consentement.md#retrait-du-consentement).
- `banner: { target: element }` choisit où monter la bannière (par défaut `document.body`).
