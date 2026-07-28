# Charte graphique & design system — anthony-courtin.com v2

---

## 1. Pourquoi changer

La charte actuelle est un thème sombre indigo → cyan (`#6366f1` → `#22d3ee`) sur fond `#0a0a0f`, en Inter, sans mode clair possible. Trois problèmes :

1. **Indifférenciation.** C'est la palette par défaut de toute landing page SaaS depuis 2022. Sur une SERP où tes concurrents directs sont des freelances en bleu et blanc, tu ne te distingues d'aucun.
2. **Conversion.** Le dark mode forcé sur un site de service B2B local pénalise la lecture longue et les formulaires. Aucun des cinq premiers résultats sur « consultant seo bordeaux » n'est en dark.
3. **Dette.** 49 Ko de CSS, 176 classes dont 18 mortes, 7 breakpoints différents, aucun mobile-first.

La nouvelle direction : **clair par défaut, éditorial, avec un accent grenat**. Chaud plutôt que froid, imprimé plutôt que dashboard. Ça évoque Bordeaux sans tomber dans le cliché de la grappe de raisin, et surtout ça ne ressemble à aucun autre consultant SEO.

---

## 2. Couleurs

### Neutres — échelle chaude

| Token | Valeur | Usage |
|---|---|---|
| `--n-0` | `#FFFFFF` | surfaces élevées, cartes |
| `--n-50` | `#FAF9F7` | fond de page |
| `--n-100` | `#F2F0EC` | fond de section alternée |
| `--n-200` | `#E4E1DA` | bordures |
| `--n-300` | `#CBC6BC` | bordures fortes, séparateurs |
| `--n-400` | `#9C958A` | texte désactivé |
| `--n-500` | `#6E675C` | texte secondaire |
| `--n-700` | `#413C34` | texte courant appuyé |
| `--n-900` | `#1C1A16` | titres, texte principal |
| `--n-950` | `#12100D` | fond du mode sombre |

### Accent — Grenat

| Token | Valeur | Contraste / blanc | Usage |
|---|---|---|---|
| `--accent-50` | `#FDF2F5` | — | fonds de badge, surlignage |
| `--accent-200` | `#F2C9D5` | — | bordures d'état |
| `--accent-500` | `#B3234D` | 5,4:1 ✅ AA | liens, icônes, hover |
| `--accent-600` | `#8E1F3C` | 8,1:1 ✅ AAA | **couleur primaire — CTA, H1 accentué** |
| `--accent-800` | `#5E1428` | 12,6:1 ✅ | états pressés |

### Sémantiques

| Token | Valeur | Usage |
|---|---|---|
| `--success` | `#1E6F5C` | métriques positives, courbes de résultats |
| `--warning` | `#9A6300` | avertissements |
| `--danger` | `#A32218` | erreurs de formulaire |
| `--info` | `#20556E` | encarts pédagogiques |

### Règles

- **Un seul accent.** Pas de dégradé bicolore. Les dégradés sont réservés aux visuels de données, jamais au texte ni aux boutons.
- **Le grenat ne dépasse jamais 10 % de la surface visible d'un écran.** Il signale l'action, il ne décore pas.
- Toute paire texte/fond doit atteindre **4,5:1** (texte courant) ou **3:1** (texte ≥ 24 px et éléments d'interface). À vérifier automatiquement, pas à l'œil.
- **Ne jamais coder une couleur en dur.** Toute valeur hexadécimale hors du bloc `:root` est un bug.

### Mode sombre

Supporté via `prefers-color-scheme` **et** un attribut `[data-theme="dark"]` avec bascule manuelle persistée. Le mode sombre inverse l'échelle neutre et remonte l'accent à `--accent-500` (le `--accent-600` manque de contraste sur fond sombre).

---

## 3. Typographie

**Display — Fraunces** (variable, `opsz` + `wght`). Un serif contemporain à empattements marqués : signale l'expertise éditoriale, ce qui est exactement le métier. Utilisé sur H1, H2 et les chiffres-clés uniquement.

**Texte — Inter** (variable). Conservé : déjà en place, excellente lisibilité, aucun risque.

Les deux polices sont **auto-hébergées en WOFF2 variable** (`/fonts/`), avec `font-display: swap` et `preload` sur les deux fichiers. On supprime l'appel à `fonts.googleapis.com` : c'est une requête bloquante vers un tiers, et un point de friction RGPD.

### Échelle — fluide, `clamp()`

| Token | Valeur | Usage |
|---|---|---|
| `--fs-xs` | `0.8125rem` | légendes, méta |
| `--fs-sm` | `0.9375rem` | annotations, labels |
| `--fs-base` | `clamp(1rem, 0.97rem + 0.15vw, 1.0625rem)` | corps |
| `--fs-lg` | `clamp(1.125rem, 1.08rem + 0.22vw, 1.25rem)` | chapô |
| `--fs-xl` | `clamp(1.375rem, 1.28rem + 0.45vw, 1.625rem)` | H3 |
| `--fs-2xl` | `clamp(1.75rem, 1.55rem + 0.9vw, 2.25rem)` | H2 |
| `--fs-3xl` | `clamp(2.25rem, 1.85rem + 1.9vw, 3.25rem)` | H1 |
| `--fs-display` | `clamp(2.75rem, 2.1rem + 3.1vw, 4.5rem)` | hero home |

**Interlignage** : `--lh-tight: 1.12` (titres) · `--lh-snug: 1.35` (chapô) · `--lh-base: 1.65` (corps).
**Mesure** : le corps de texte ne dépasse jamais **68 caractères** (`max-width: 68ch`).
**Interlettrage** : `-0.02em` sur les titres en Fraunces, `0` sur le corps.

---

## 4. Espacement, rayons, ombres

**Espacement — échelle en base 4**, une seule série, sans exception :
`--sp-1: 4px` · `2: 8` · `3: 12` · `4: 16` · `5: 24` · `6: 32` · `7: 48` · `8: 64` · `9: 96` · `10: 128`

**Rythme vertical de section** : `padding-block: clamp(var(--sp-8), 8vw, var(--sp-10))`.

**Rayons** : `--r-sm: 6px` · `--r-md: 10px` · `--r-lg: 16px` · `--r-xl: 24px` · `--r-full: 999px`.
Les cartes utilisent `--r-lg`, les boutons `--r-md`, les badges `--r-full`.

**Ombres — discrètes, teintées de l'accent** (jamais du noir pur) :
```
--sh-1: 0 1px 2px rgba(28,26,22,.06), 0 1px 3px rgba(28,26,22,.04);
--sh-2: 0 4px 12px rgba(28,26,22,.07), 0 1px 3px rgba(28,26,22,.05);
--sh-3: 0 12px 32px rgba(28,26,22,.10), 0 2px 8px rgba(28,26,22,.05);
--sh-focus: 0 0 0 3px var(--accent-200), 0 0 0 5px var(--accent-600);
```

**Container** : `--container: 1120px` · `--container-narrow: 720px` (contenu éditorial) · gouttière `--sp-5` mobile / `--sp-6` desktop.

---

## 5. Breakpoints

**Mobile-first, `min-width` uniquement, quatre valeurs et pas une de plus** :

```
--bp-sm: 40rem;   /* 640px  */
--bp-md: 48rem;   /* 768px  */
--bp-lg: 64rem;   /* 1024px */
--bp-xl: 80rem;   /* 1280px */
```

Les 7 breakpoints actuels (`480`, `600`, `640`, `768`, `968`, `1099`, `1100`) sont remplacés par ces quatre. Privilégier les grilles intrinsèques (`grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr))`) qui suppriment le besoin de media query.

---

## 6. Composants

Nomenclature **BEM allégée** : `.c-{composant}`, `.c-{composant}__{élément}`, `.c-{composant}--{variante}`. Utilitaires préfixés `.u-`.

| Composant | Variantes | Notes |
|---|---|---|
| `c-btn` | `--primary` `--ghost` `--link` · tailles `--sm` `--lg` | Hauteur minimale **44 px** (cible tactile). `--primary` = fond `--accent-600`, texte blanc. |
| `c-card` | `--service` `--case` `--agency` `--stat` | Toute la carte est cliquable via un pseudo-élément, pas via un `<div onclick>`. |
| `c-hero` | `--home` `--city` `--service` | Le hero ville contient H1 + chapô + 2 CTA + bandeau de preuve. |
| `c-proof` | `--rating` `--logos` `--stats` | Note Trustfolio, logos clients, chiffres. |
| `c-stat` | — | Chiffre en Fraunces, libellé en Inter `--fs-sm`. |
| `c-steps` | — | Méthode en 4 étapes, `<ol>` sémantique. |
| `c-faq` | — | `<details>/<summary>` natifs. Réponses **présentes dans le HTML** (exigence FAQPage). |
| `c-table` | `--compare` `--agencies` | Scroll horizontal encapsulé, en-têtes `scope`. |
| `c-form` | — | Labels visibles, jamais de placeholder seul. Erreurs liées par `aria-describedby`. |
| `c-breadcrumb` | — | `<nav aria-label="Fil d'Ariane">` + `BreadcrumbList` JSON-LD. |
| `c-citymesh` | — | Maillage vers 4-6 villes voisines. **Remplace le footer à 68 liens.** |
| `c-cta` | `--band` `--inline` | |
| `c-header` / `c-footer` | — | Voir ci-dessous. |
| `c-callout` | `--info` `--warning` | Encarts pédagogiques dans le blog. |
| `c-toc` | — | Sommaire d'article, sticky ≥ `--bp-lg`. |

### Header

Nav principale ramenée à **6 entrées** : Services (menu déroulant vers les 5 pages transverses) · Zones d'intervention · Tarifs · Blog · À propos · **Contact** (bouton primaire).

Les 7 liens de silos actuels disparaissent de la nav. Tous les `href` pointent vers les **URL propres sans `.html`** — c'est ce qui supprime la chaîne de redirection sur chaque lien du site.

Sticky avec réduction de hauteur au scroll. Burger sous `--bp-md`, avec `aria-expanded`, piège de focus et fermeture par `Échap`.

### Footer

Le footer actuel fait 68 liens et 7 919 caractères, avec le SVG LinkedIn inline dupliqué (header + footer) sur 850 pages, soit ~1,2 Mo de redondance.

Nouveau footer, **4 colonnes, ~20 liens** : Services (5) · Zones (lien vers `/zones-d-intervention` + les 8 villes Tier 1) · Ressources (Blog, Agences SEO Gironde, Tarifs) · Contact (NAP complet, LinkedIn, mentions, confidentialité).

Le maillage vers les 26 villes se fait par la page pivot `/zones-d-intervention`, pas par le footer. Les icônes passent dans un **sprite SVG unique** (`<use href="/img/icons.svg#linkedin">`).

---

## 7. Accessibilité — WCAG 2.1 AA

Non négociable, et accessoirement corrélé au SEO.

- Contraste **4,5:1** minimum sur le texte, **3:1** sur les composants d'interface et les bordures de champ.
- **Focus visible partout** : `--sh-focus`, jamais de `outline: none` sans remplacement.
- Cibles tactiles **≥ 44 × 44 px**.
- Hiérarchie de titres stricte : **un seul H1**, aucun niveau sauté.
- Landmarks : `<header>`, `<nav>`, `<main id="main-content">`, `<footer>`. Skip-link conservé (il existe déjà, c'est bien).
- Images : `alt` descriptif, `alt=""` si décoratif. `width`/`height` toujours renseignés (CLS).
- Formulaires : label visible, erreurs textuelles liées par `aria-describedby`, jamais la couleur seule comme porteuse d'information.
- `prefers-reduced-motion: reduce` → toutes les animations passent à `0.01ms`.
- L'iframe Google Maps a un `title` et un `loading="lazy"` — ou mieux, elle est remplacée par une image statique cliquable (elle coûte aujourd'hui ~700 Ko et plusieurs requêtes tierces par page).

---

## 8. Performance

Objectifs : **LCP < 2,0 s · INP < 200 ms · CLS < 0,05 · CSS < 25 Ko** (contre 49 Ko + 12 Ko aujourd'hui).

- CSS en cascade layers : `@layer reset, tokens, base, layout, components, utilities`.
- CSS critique inliné dans le `<head>` (hero + header), le reste chargé en différé.
- Purge des 18 classes mortes identifiées (`w3`, `linkedin-feed`, `trustfolio-badge`, `mt-4`…).
- Images en `<picture>` AVIF + WebP, `loading="lazy"` sauf le LCP, `fetchpriority="high"` sur le visuel du hero.
- Zéro dépendance tierce bloquante. Pas de framework — le site est statique, il doit le rester.
- Sprite SVG unique au lieu des icônes inline dupliquées.

---

## 9. Ton & iconographie

**Voix** : directe, chiffrée, sans superlatif. « +150 % de trafic en 8 mois sur un site de 40 pages » plutôt que « des résultats exceptionnels ». Pas de promesse de position — c'est un signal d'amateurisme identifié dans l'analyse SERP, et 4 des 9 pages du top 10 s'en démarquent explicitement.

**Emoji : à supprimer.** Le site actuel utilise 🔍 ⚙️ 🔗 📍 ✍️ 🎭 comme icônes de service. Remplacer par un jeu d'icônes **linéaires, 1,5 px, 24 px de base**, `currentColor` — Lucide convient et s'auto-héberge en SVG.

**Photo** : une photo d'Anthony en situation, pas un portrait sur fond neutre. 8 des 9 pages du top 10 affichent le consultant ; c'est le signal E-E-A-T le moins cher à produire.

**Captures de résultats** : screenshots Search Console réels et anonymisés. C'est le seul élément visuel qui convertit vraiment sur ce marché — et l'un des rares que la concurrence bordelaise n'exploite qu'à moitié.
