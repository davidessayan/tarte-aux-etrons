# Services

Tous les services s'appellent de la même façon : les identifiants du fournisseur, puis (optionnel) un `id` custom en dernier argument, utile pour déclarer deux instances (`ga4('G-X')` et `ga4('G-Y', 'ga4-blog')`).

```ts
import {
  ga4, gtm, hotjar, matomo, microsoftClarity, facebookPixel, linkedinInsight,
  recaptchaV3, crisp, youtube, googleMaps, chickenplayer,
} from 'tarte-aux-etrons'
```

Un script n'est chargé qu'après consentement. Si un service est refusé alors qu'il était actif dans la page, la page est rechargée : voir [Consentement & RGPD](consentement.md#retrait-du-consentement).

## Google Analytics 4

```ts
ga4('G-XXXXXXXXXX')
ga4('G-YYYYYYYYYY', 'ga4-blog') // 2e propriété sur le même site
```

Plusieurs propriétés fonctionnent : un seul `gtag('js')` est envoyé et chaque propriété est configurée. Sur refus, `window['ga-disable-G-XXXXXXXXXX']` est positionné et les cookies `_ga*` sont supprimés. [Consent Mode v2](consentement.md#google-consent-mode-v2) est géré automatiquement.

## Google Tag Manager

```ts
gtm('GTM-XXXXXXX')                      // mesure d'audience
gtm('GTM-XXXXXXX', { ads: true })       // publicité / remarketing
gtm('GTM-XXXXXXX', { id: 'gtm-shop' })  // id custom (ou gtm('GTM-XXXXXXX', 'gtm-shop'))
```

Un conteneur contient des balises de finalités différentes : déclarez-le une fois par finalité. Le visiteur voit deux choix distincts (« audience » et « publicité »), le conteneur n'est chargé qu'une seule fois et [Consent Mode](consentement.md#google-consent-mode-v2) reçoit les bons signaux. Si votre conteneur ne contient que de l'audience, `gtm('GTM-XXXXXXX')` suffit.

## Hotjar

```ts
hotjar(1234567)
hotjar(1234567, 'hotjar-custom')                      // id custom
hotjar(1234567, { version: 6, id: 'hotjar-custom' })  // ou avec options
```

## Matomo

```ts
matomo('https://analytics.monsite.fr', 1)
matomo('https://analytics.monsite.fr', 1, 'matomo-custom') // id custom
```

Le slash final de l'URL est normalisé automatiquement.

## Microsoft Clarity

```ts
microsoftClarity('abcdefghij')
```

TAE appelle `clarity('consentv2', …)` pour vous (`granted` sur acceptation, `denied` sur refus), comme l'exige Microsoft pour l'EEE, le Royaume-Uni et la Suisse. Sur retrait du consentement, la page est rechargée et Clarity n'est plus chargé.

## Facebook Pixel

```ts
facebookPixel('1234567890123456')
```

## LinkedIn Insight Tag

```ts
linkedinInsight('1234567')
```

## Google reCAPTCHA v3

```ts
recaptchaV3('6LeXXXXXXXXXXXXXXXXXXXXXXXX')
```

Une fois chargé, `grecaptcha.execute()` reste disponible pour vos formulaires. Le cookie `_GRECAPTCHA` est posé sur le domaine de Google : il ne peut pas être supprimé depuis votre site. Prévoyez un repli pour vos formulaires si le visiteur refuse.

## Crisp

```ts
crisp('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx')
```

Crisp stocke sa session côté navigateur (localStorage), ce qui relève du même régime que les cookies. Sur retrait du consentement, la session est réinitialisée, les clés `crisp-client*` du localStorage et du sessionStorage sont purgées, et la page est rechargée.

## YouTube

```ts
youtube()
```

Utilisez `data-src` au lieu de `src` sur vos iframes : TAE active le chargement une fois le consentement donné.

```html
<iframe
  data-src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"
  width="560" height="315"
  allowfullscreen
></iframe>
```

Fonctionne aussi avec `youtube.com` dans l'URL. Sur refus, le `src` est vidé pour stopper le chargement.

## Google Maps

```ts
googleMaps()
```

Même principe que YouTube :

```html
<iframe
  data-src="https://www.google.com/maps/embed?pb=..."
  width="600" height="450"
  allowfullscreen loading="lazy"
></iframe>
```

## Chicken Player

Intégration native avec [chicken-player](https://www.npmjs.com/package/chicken-player) : gère le consentement pour YouTube, Vimeo et Dailymotion embarqués via le player.

```ts
chickenplayer()
```

Côté player, activez la gestion du consentement et listez les plateformes concernées :

```ts
import ChickenPlayer from 'chicken-player'

new ChickenPlayer({
  cookies: {
    active: true,
    types: ['youtube', 'vimeo', 'dailymotion'],
  },
})
```

Sur acceptation, TAE dispatche `chickenPlayer.cookies.consent` et le player déverrouille les vidéos. Sur refus, `chickenPlayer.cookies.reject` : le player réaffiche le message de consentement.

## Un service qui manque ?

[Créez le vôtre](api.md#creer-un-service-personnalise) en quelques lignes.
