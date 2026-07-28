# Scripts

Node natif, aucune dépendance de production. Tous acceptent `--dry-run` quand ils
écrivent, et sont idempotents : les relancer ne change rien de plus.

## Outils de la refonte (`scripts/`)

| Script | Rôle |
|---|---|
| `lib/slugs.js` | Bibliothèque partagée : liste des 100 villes, `slugify()` canonique, `slugifyCasse()` qui reproduit l'ancien bug, table de correspondance. |
| `audit-slugs.js` | Inventorie les fichiers de `villes/` dont le slug ne correspond pas à `slugify(nom)`. `--json` pour le manifeste, `--supprime` pour nettoyer. |
| `build-redirects.js` | Génère `_redirects`. **Ne pas éditer `_redirects` à la main.** |
| `check-redirects.js` | Teste `_redirects` contre un serveur réel. `--base` pour viser une deploy preview. |
| `fix-internal-links.js` | Réécrit tous les liens internes en chemin absolu sans extension. |
| `fix-og-url.js` | Aligne `og:url` et `twitter:url` sur le `rel=canonical`, ajoute le canonical manquant. |
| `fix-iframe-titles.js` | Ajoute un `title` aux iframes qui n'en ont pas (WCAG 4.1.2). |
| `check-similarity.js` | Jaccard sur shingles de 6 mots entre pages villes. Échoue au-delà de 0,75. |
| `check-a11y.js` | axe-core dans Chromium, WCAG 2.1 AA. `--toutes` pour auditer tout le site. |
| `verify.js` | Contrôle de fin de phase, à lancer avant tout déploiement. |

### Vérifier les redirections en local

```bash
npx netlify dev --dir . --port 8888 --offline
```

puis, dans un autre terminal :

```bash
node scripts/check-redirects.js
```

### Auditer l'accessibilité

Même serveur requis. La première fois seulement :

```bash
npx playwright install chromium
```

```bash
node scripts/check-a11y.js
```

Baseline mesurée en fin de phase 0, avant refonte graphique : 4 règles en échec,
121 éléments sur 11 pages types : dont **84 violations de contraste** (`color-contrast`,
impact *serious*), présentes sur les 11 pages. C'est le chiffre que la phase 1 doit
ramener à zéro.

## Générateurs de pages (racine du repo)

Conservés parce qu'ils produisent le site actuel. Ils seront remplacés en phase 3
par `scripts/build-cities.js`.

| Script | Rôle |
|---|---|
| `generate-cities-bulk.js` | Génère les 6 silos de `villes/` depuis `build/templates/` et `data/cities-*.js`. |
| `generate-top10.js` | Génère les pages `agence-seo-{ville}` depuis `data/top10-agencies.js`. |
| `generate-sitemap-index.js` | Produit `sitemap.xml` et les sitemaps par silo. |
| `generate-html-sitemap.js` | Produit `plan-du-site.html`. |

## `_archive/`

18 patches one-shot déjà appliqués, conservés pour l'historique. Ils ciblent une
arborescence qui n'existe plus (`templates/`, `admin/`, liens relatifs en `.html`) :
**ne pas les relancer**, ils casseraient le site.

## Design system (phase 1)

Les sources CSS sont dans `css/src/`, une par couche. **`css/main.css` est
généré : ne pas l'éditer.**

```bash
node scripts/build-css.js
```

| Script | Rôle |
|---|---|
| `lib/contraste.js` | Calcul de luminance et de ratio WCAG 2.1. |
| `build-css.js` | Concatène `css/src/*.css` en un `css/main.css` allégé. Échoue si le budget de 25 Ko est dépassé ou si une valeur hexadécimale traîne hors de `tokens.css`. |
| `build-icons.js` | Assemble `img/icons.svg` depuis `lucide-static`. |
| `check-contrast.js` | Vérifie les 46 paires texte/fond du design system, **dans les deux thèmes**, sans navigateur. |
| `check-targets.js` | Vérifie que les cibles interactives font ≥ 44 × 44 px, dans les deux thèmes. |

### Pourquoi une concaténation et pas des `@import`

En CSS, `@import` est bloquant *et* sérialisé : le navigateur télécharge
`main.css`, l'analyse, puis découvre et télécharge chaque fichier importé l'un
après l'autre. Sur une cible LCP < 2 s, c'est un aller-retour réseau par
fichier. Un seul fichier, une seule requête.

### Le bloc de mode sombre

Il est écrit **une seule fois** dans `css/src/tokens.css`, entre les marqueurs
`@sombre:debut` et `@sombre:fin`. `build-css.js` l'émet pour les deux sélecteurs
(`prefers-color-scheme` et `[data-theme="dark"]`), qui ne peuvent donc pas
diverger.

### Règle de token

Les composants n'utilisent **que** les rôles sémantiques (`--texte`,
`--surface-page`, `--accent`, `--accent-surface`…), jamais `--n-*` ni
`--accent-*` en direct. C'est ce qui permet au mode sombre de tout remapper
sans réécrire une règle.

`--accent` et `--accent-surface` sont volontairement distincts : en mode sombre
l'accent doit s'éclaircir pour rester lisible sur fond noir, ce qui le rend
inutilisable comme fond sous du texte blanc (3,48:1).
