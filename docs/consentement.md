# Consentement & RGPD

TAE s'occupe de l'essentiel sans configuration :

- rien ne se charge avant le choix du visiteur ;
- « Tout refuser » est aussi simple que « Tout accepter » ;
- le choix est mémorisé, puis redemandé au bout de 6 mois ;
- le visiteur peut changer d'avis à tout moment ;
- [Consent Mode v2](#google-consent-mode-v2) est géré automatiquement.

## Durée de validité

Un choix (accepté ou refusé) est conservé **180 jours** (~6 mois, recommandation CNIL), puis le service repasse en attente et la bannière réapparaît. Réglable avec `consentMaxAge` (en jours, `0` = jamais). Incrémentez `consentVersion` pour redemander le consentement à tout le monde.

## Information

`banner: { privacyUrl: '/confidentialite' }` ajoute un lien vers votre politique de confidentialité dans la bannière. Le panneau liste aussi les cookies de chaque service.

## Retrait du consentement

Retirer son consentement doit être aussi simple que le donner. Un bouton flottant « Gérer mes cookies » apparaît une fois le choix fait et rouvre le panneau (désactivable avec `banner: { reopenButton: false }`). Vous pouvez aussi rouvrir le panneau depuis votre propre lien, par exemple en pied de page :

```ts
const { banner } = createTaE({ services: [...] })

document.querySelector('#manage-cookies')?.addEventListener('click', () => {
  banner.show({ customize: true }) // rouvre directement le panneau
})
```

### Rechargement de la page

Un script tiers déjà chargé ne peut pas être déchargé. Quand un service marqué `requiresReload` (GA4, GTM, Hotjar, Matomo, Facebook Pixel, LinkedIn, Clarity, Crisp, reCAPTCHA) est refusé alors qu'il était actif dans la page, la page est rechargée une fois les choix enregistrés. YouTube, Google Maps et Chicken Player n'en ont pas besoin.

Pour gérer cela vous-même, passez `reloadOnRevoke: false` et coupez le tracker en écoutant `consent:change`. Si votre `onConsentChange` envoie une requête (preuve de consentement, par exemple), utilisez `navigator.sendBeacon` ou `fetch(..., { keepalive: true })` pour qu'elle survive au rechargement.

### Suppression des cookies

À chaque refus, TAE supprime les cookies du service sur l'hôte courant et ses domaines parents, ainsi que les clés de localStorage et sessionStorage connues. Les cookies posés sur le domaine d'un tiers (`fr`, `NID`, `_GRECAPTCHA`…) ne peuvent pas être supprimés depuis votre site : la protection, c'est de ne charger le script qu'après consentement.

## Google Consent Mode v2

Rien à configurer. Dès qu'un service Google (`ga4`, `gtm`) est présent, TAE s'occupe de tout :

1. il envoie `consent default` avec les 4 signaux (`analytics_storage`, `ad_storage`, `ad_user_data`, `ad_personalization`) à `denied`, avant tout chargement de tag Google ;
2. il envoie `consent update` à chaque choix du visiteur (et au chargement, avec le choix restauré), toujours avant de démarrer le service ;
3. les scripts Google ne se chargent qu'après consentement : rien ne part avant le choix (mode « Basic »).

| Service | Signaux accordés quand il est accepté |
|---|---|
| `ga4(...)` | `analytics_storage` |
| `gtm(...)` | `analytics_storage` |
| `gtm(..., { ads: true })` | `ad_storage`, `ad_user_data`, `ad_personalization` |

À savoir :

- N'ajoutez pas vous-même de snippet gtag / GTM ni de `gtag('consent', 'default', …)` dans la page : TAE s'en charge, et un tag chargé avant lui partirait sans consentement.
- Dans GTM, les balises Google (GA4, Ads…) lisent le consentement toutes seules. Pour les balises non Google (Meta, Hotjar…), activez « Consentement supplémentaire requis » dans GTM, sinon elles partent dès que le conteneur est chargé.
- Le mode « Advanced » (tags Google chargés avant consentement, pings sans cookies) n'est volontairement pas proposé : TAE ne charge rien avant le choix.
- Pour un service personnalisé qui parle à Google, déclarez `consentSignals: [...]` : les signaux sont l'union de ceux des services acceptés.

Les services tiers qui ont leur propre API de consentement sont gérés de la même façon, sans rien faire : Microsoft Clarity (`consentv2`) et Meta Pixel (`consent`).
