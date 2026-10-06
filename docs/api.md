# API & avancé

## Les briques

| Brique | Rôle |
|---|---|
| `createTaE()` | Câble le manager et la bannière dans le bon ordre, en une ligne. |
| `ConsentManager` | Le cerveau : état, stockage, événements. |
| `Banner` | L'interface : bannière et panneau de personnalisation. |
| Services | Définissent quoi charger et nettoyer selon le consentement. |

## Options de `createTaE`

```ts
createTaE({
  // Obligatoire
  services: ServiceDefinition[],

  // Optionnel : consentement
  storageKey?: string,       // clé localStorage, défaut: 'tae_consent'
  consentVersion?: number,   // incrémenter pour forcer un re-consentement
  consentMaxAge?: number,    // validité d'un choix en jours, défaut: 180 (0 = jamais)
  reloadOnRevoke?: boolean,  // recharge la page au retrait d'un service `requiresReload` actif, défaut: true
  onReady?: (state) => void,
  onConsentChange?: (serviceId, status) => void,
  onBulkChange?: (action, state) => void, // action: 'swallow-all' | 'flush-all'

  // Optionnel : bannière
  banner?: {
    target?: HTMLElement,              // où monter la bannière, défaut: document.body
    preset?: 'poop' | 'serious',
    vars?: ThemeVars,
    labels?: Partial<BannerLabels>,
    privacyUrl?: string,               // lien vers la politique de confidentialité
    reopenButton?: boolean,            // bouton flottant « Gérer mes cookies », défaut: true
  },
})
```

`createTaE` renvoie `{ manager, banner }`.

## Vérifier le consentement

```ts
manager.isDigested('ga4')  // boolean : consentement donné
manager.isFlushed('ga4')   // boolean : refusé
manager.isFloating('ga4')  // boolean : pas encore décidé

manager.getServiceStatus('ga4') // 'accepted' | 'refused' | 'pending'
manager.getState()              // ConsentState complet
```

## Agir sur le consentement

```ts
manager.swallowAll()   // accepte tous les services
manager.flushAll()     // refuse tous les services
manager.swallow('ga4') // accepte un service précis
manager.flush('ga4')   // refuse un service précis
manager.plunge()       // réinitialise tout + réaffiche la bannière 🪠

banner.show({ customize: true }) // rouvre la bannière directement sur le panneau
```

## Événements

```ts
const { manager } = createTaE({ services: [...] })

// Changement individuel (clic sur un toggle dans le panneau)
manager.on('consent:change', ({ serviceId, status, state }) => {
  console.log(`${serviceId} → ${status}`) // 'accepted' | 'refused'
})

// Changement en masse (boutons « Tout accepter » / « Tout refuser »)
manager.on('consent:bulk', ({ action, state }) => {
  console.log(action) // 'swallow-all' | 'flush-all'
})

// Prêt (appelé une fois à l'init, avec l'état restauré du storage)
manager.on('ready', (state) => {
  console.log(state)
})
```

`manager.on()` retourne une fonction de désabonnement :

```ts
const unsubscribe = manager.on('consent:change', handler)
// Plus tard :
unsubscribe()
```

## Créer un service personnalisé

```ts
import { defineService } from 'tarte-aux-etrons'

const myPixel = defineService({
  id: 'my-pixel',
  name: 'Mon Pixel',
  category: 'advertising', // 'analytics' | 'advertising' | 'social' | 'functional' | 'other'
  description: 'Suit les conversions.',
  cookieNames: ['_mypixel'],   // affichés au visiteur dans le panneau
  requiresReload: true,        // optionnel : le script chargé ne peut pas être déchargé
  consentSignals: ['ad_storage', 'ad_user_data', 'ad_personalization'], // optionnel : Consent Mode
  onAccept() {
    // Charger le script, initialiser le tracker, etc.
  },
  onRefuse() {
    // Nettoyer les cookies, désactiver le tracker, etc.
  },
})
```

Utilitaires pour écrire vos services :

```ts
import { loadScript, deleteCookies, deleteCookiesMatching, clearStorageMatching } from 'tarte-aux-etrons'

// Charge un script (idempotent : pas de double chargement)
loadScript('https://example.com/tracker.js')

// Supprime des cookies par nom exact (hôte courant + domaines parents)
deleteCookies(['_tracker', '_tracker_session'])

// Supprime tous les cookies dont le nom commence par l'un des préfixes
// Utile pour les cookies à suffixe dynamique (_pk_id.1.xxxx, _hjSession_abc...)
deleteCookiesMatching(['_tracker_', '_tracker_sess'])

// Supprime les clés localStorage / sessionStorage commençant par l'un des préfixes
clearStorageMatching(['_tracker'])
```

## Sans bannière

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

## Compatibilité

- **Navigateurs** : tous les navigateurs modernes (ES2020+)
- **Frameworks** : framework-agnostic, fonctionne avec React, Vue, Svelte, Next.js, Nuxt, vanilla JS...
- **SSR** : `ConsentManager.init()` ne s'exécute pas côté serveur (`typeof window === 'undefined'` guard)
- **Bundle** : ESM + CJS, types `.d.ts` inclus
