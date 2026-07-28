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
| `verify.js` | Contrôle de fin de phase, à lancer avant tout déploiement. |

### Vérifier les redirections en local

```bash
npx netlify dev --dir . --port 8888 --offline
```

puis, dans un autre terminal :

```bash
node scripts/check-redirects.js
```

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
