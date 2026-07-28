# Prompt à envoyer à Claude Code

> **Mode d'emploi** — Place d'abord les 4 fichiers livrés à la racine du repo, dans un dossier `_refonte/` :
> `01-AUDIT-ET-STRATEGIE.md`, `02-CHARTE-GRAPHIQUE.md`, `03-redirections-301.csv`, `04-netlify-_redirects.txt`.
> Puis ouvre Claude Code dans le repo et colle tout ce qui suit le trait horizontal.
> Le prompt est découpé en 7 phases. **Ne lance pas les 7 d'un coup** : demande une phase, valide, passe à la suivante. La phase 0 seule est déjà un gros gain.

---

Tu travailles sur le repo de mon site `anthony-courtin.com`. C'est un site **statique HTML/CSS/JS vanilla déployé sur Netlify** (pas d'Apache malgré le `.htaccess` présent, pas de framework, pas de bundler). Les pages sont produites par des scripts Node à la racine qui lisent `data/*.js` et `templates/*.html` et écrivent dans `villes/`.

Le brief complet est dans `_refonte/` : lis `01-AUDIT-ET-STRATEGIE.md` et `02-CHARTE-GRAPHIQUE.md` **en entier avant de toucher au moindre fichier**. Ils font autorité sur toutes les décisions produit. Ce prompt décrit l'exécution.

## Contexte en une phrase

Le site compte 850 pages `villes/{service}-{ville}.html` au contenu strictement identique (100 % de similarité une fois le nom de ville neutralisé). On les remplace par **26 pages `/consultant-seo-{ville}`** réellement différenciées, avec redirections 301, et on refait la charte graphique de zéro.

## Règles générales

- **Une branche par phase**, format `refonte/phase-N-description`. Jamais de commit direct sur `main`.
- **Ne supprime aucun fichier avant que sa redirection soit en place et testée.** L'ordre compte.
- Tout script que tu écris va dans `scripts/`, est idempotent, et accepte un flag `--dry-run` qui affiche ce qu'il ferait sans écrire.
- Aucune dépendance npm nouvelle sans me demander. Node natif de préférence.
- Français dans tout le contenu visible ; commentaires de code en français aussi.
- **Ne fabrique aucune donnée.** Si une statistique locale (nombre d'entreprises, population) n'est pas disponible dans une source que tu peux citer, laisse un marqueur `<!-- TODO-DATA: ... -->` et signale-le. Une page ne part pas en production avec des chiffres inventés.
- À la fin de chaque phase : un récapitulatif en 10 lignes maximum, la liste des fichiers touchés, et ce qui reste en suspens.

---

## PHASE 0 — Assainissement technique (aucun changement de contenu)

Objectif : corriger les bugs qui gaspillent le budget de crawl, **sans toucher à la stratégie éditoriale**. Cette phase est déployable seule et sans risque.

1. **Supprimer les 594 pages fantômes de `templates/`.** Seuls 6 fichiers sont de vrais templates source (`audit-seo.html`, `optimisation-on-page.html`, `netlinking.html`, `seo-local.html`, `redaction-seo.html`, `black-hat-seo.html`) — ils sont lus par `generate-cities-bulk.js`. Les 594 autres sont un artefact de build, accessibles publiquement (`/templates/audit-seo-arcachon` répond en 200) et en duplicate avec `/villes/`. Déplace les 6 vrais templates dans `build/templates/`, supprime le reste, ajoute `templates/` et `build/` au `.gitignore` du publish Netlify, et ajoute une règle 410 sur `/templates/*`.

2. **Éliminer les slugs cassés.** 25 villes accentuées existent en double : `audit-seo-mrignac` (lettre accentuée supprimée) et `audit-seo-merignac` (correct). Écris `scripts/audit-slugs.js` qui liste tous les fichiers dont le slug ne correspond pas à `slugify(name)` avec `.normalize('NFD')`. Ajoute une 301 de chaque slug cassé vers le propre, puis supprime les fichiers cassés. Traite le cas particulier de Villenave-d'Ornon, qui existe en 3 variantes (`villenave-dornon`, `villenave-d-ornon`) : le slug canonique est **`villenave-dornon`**.

3. **Supprimer les chaînes de redirection internes.** Tous les liens du header et du footer pointent vers des `.html` (`../audit-seo-bordeaux.html`), que `netlify.toml` redirige ensuite en 301. Avec 84 liens internes par page × 850 pages, c'est massif. Réécris tous les `href` internes vers les **URL propres sans extension et en chemin absolu** (`/audit-seo-bordeaux`, pas `../audit-seo-bordeaux.html`).

4. **Corriger `og:url`.** Il vaut `https://anthony-courtin.com/audit-seo` sur toutes les pages villes au lieu de l'URL de la page. Corrige dans les templates ET dans les fichiers déjà générés.

5. **Nettoyer les scripts racine.** 14 scripts sont des patches one-shot obsolètes (`add-blog-link.js`, `fix-canonicals.js`, `final-footer-update.js`, `update-footers.js`…). Déplace-les dans `scripts/_archive/`. Garde actifs et documente : `generate-cities-bulk.js`, `generate-top10.js`, `generate-sitemap-index.js`, `generate-html-sitemap.js`. Supprime `generate-cities.js` et `generate-sitemap.js` (remplacés).

6. **Supprimer `.htaccess`** — vestige Apache inutilisé sur Netlify. Toutes les redirections vivent désormais dans `_redirects`.

7. **Sortir `/admin/` du repo public.** `auth.js` ne contient que du `localStorage`, zéro backend, zéro authentification réelle. Supprime le dossier (il est dans l'historique git si besoin) et retire les lignes correspondantes de `robots.txt`.

**Vérification de fin de phase** — écris `scripts/verify.js` qui, sur l'ensemble du repo, contrôle et affiche un rapport :
- zéro `href` interne se terminant par `.html`
- zéro slug non conforme à `slugify(name)`
- zéro `og:url` ne correspondant pas au canonical de la page
- zéro fichier orphelin dans `templates/`
- toutes les URL du sitemap répondent en 200 en local

---

## PHASE 1 — Design system

Implémente intégralement `_refonte/02-CHARTE-GRAPHIQUE.md`.

1. **Reconstruis le CSS de zéro** dans `css/` avec des cascade layers :
   `@layer reset, tokens, base, layout, components, utilities`
   Fichiers : `tokens.css` (toutes les custom properties), `base.css`, `layout.css`, `components.css`, `utilities.css`, plus un `main.css` qui les importe. **Ne migre pas l'ancien `style.css`** : il fait 49 Ko avec 18 classes mortes et 7 breakpoints incohérents. Repars des tokens du document. Cible : **moins de 25 Ko non compressé**.

2. **Auto-héberge les polices.** Télécharge Fraunces (variable, `opsz`+`wght`) et Inter (variable) en WOFF2 dans `fonts/`, avec `@font-face`, `font-display: swap` et `preload`. Supprime tous les appels à `fonts.googleapis.com` et les `preconnect` associés.

3. **Construis les composants** listés au §6 de la charte, en BEM allégé (`.c-btn`, `.c-card__title`, `.c-btn--primary`). Chacun doit être démontré dans une page de showcase `dev/styleguide.html` — non déployée (exclue du sitemap, `noindex`), mais indispensable pour que je valide visuellement.

4. **Mode sombre** via `prefers-color-scheme` **et** `[data-theme]` avec bascule manuelle persistée en `localStorage`.

5. **Nouveau header et nouveau footer.**
   - Header : 6 entrées (Services ▾, Zones d'intervention, Tarifs, Blog, À propos, Contact en bouton primaire). Burger accessible sous 768 px : `aria-expanded`, piège de focus, fermeture par `Échap`.
   - Footer : 4 colonnes, **~20 liens** au lieu de 68. Le maillage villes passe par `/zones-d-intervention`, plus par le footer.
   - Icônes dans un **sprite SVG unique** (`img/icons.svg` + `<use>`), au lieu du SVG LinkedIn inline dupliqué deux fois par page.

6. **Supprime tous les emoji** utilisés comme icônes (🔍 ⚙️ 🔗 📍 ✍️ 🎭) et remplace-les par des icônes Lucide auto-hébergées, 24 px, trait 1,5 px, `currentColor`.

**Vérification** — ajoute à `scripts/verify.js` :
- aucune valeur hexadécimale hors de `tokens.css`
- toutes les paires texte/fond ≥ 4,5:1 (écris le calcul de contraste, ne te fie pas à l'œil)
- toutes les cibles interactives ≥ 44×44 px
- un seul `<h1>` par page, aucun niveau de titre sauté
- un audit Lighthouse (ou `pa11y` si tu peux l'exécuter) sur `dev/styleguide.html`, la home et une page ville

---

## PHASE 2 — Nouveau modèle de données ville

1. **Crée `data/cities.json`** — source de vérité unique, remplaçant `cities-extended.js` + `cities-top10.js`. Un objet par ville :

```json
{
  "slug": "merignac",
  "name": "Mérignac",
  "nameInLocative": "à Mérignac",
  "zip": "33700",
  "insee": "33281",
  "zone": "Métropole",
  "tier": 1,
  "keep": true,
  "lat": 44.8386, "lng": -0.6455,
  "travelFromBordeaux": "15 min",
  "coveredCommunes": ["Le Haillan", "Eysines", "Saint-Jean-d'Illac"],
  "neighbourCities": ["pessac", "eysines", "saint-medard-en-jalles", "le-bouscat"],
  "economy": {
    "businessCount": null,
    "topSectors": [],
    "microBusinessShare": null,
    "population": null,
    "source": null
  },
  "editorial": {
    "localAngle": "",
    "faqLocal": [{ "q": "", "a": "" }]
  },
  "competition": [],
  "caseStudyId": "zone-metropole-ouest"
}
```

Les 26 villes conservées (`keep: true`) sont listées au §4 de `01-AUDIT-ET-STRATEGIE.md`. Les 74 autres restent dans le fichier avec `keep: false` — elles servent à générer les listes « communes couvertes » et la page `/zones-d-intervention`.

2. **Remplis `economy` avec de vraies données.** Utilise l'API publique de l'INSEE / `geo.api.gouv.fr` (population, code INSEE) et la base SIRENE pour le nombre d'établissements actifs et les secteurs dominants. Écris `scripts/fetch-insee.js`. **Si une donnée n'est pas récupérable, laisse `null`** et fais échouer la génération de la page concernée avec un message explicite. Aucun chiffre inventé, aucun placeholder en production.

3. **`editorial.localAngle` reste vide** — c'est moi qui l'écris (120-180 mots par ville, 26 paragraphes). Génère un fichier `_refonte/a-rediger.md` listant les 26 villes avec, pour chacune, les données INSEE récupérées et 3 questions pour m'aider à rédiger.

4. **Récupère le contenu des pages `agence-seo-{ville}`** avant de les supprimer. Ce sont les pages les mieux positionnées du site (position moyenne 10,0) et elles contiennent le top 10 des agences par ville. Extrais ces données dans `data/agencies-by-city.json` : elles alimenteront la section « Le paysage SEO local à {Ville} » du nouveau template. **Ne jette rien.**

---

## PHASE 3 — Template de page ville et nouvelles pages

1. **Crée `build/templates/consultant-seo-ville.html`** avec les 15 sections décrites au §5 de `01-AUDIT-ET-STRATEGIE.md`, dans cet ordre. Distingue clairement les blocs partagés des blocs variables.

2. **Écris `scripts/build-cities.js`** qui génère `/consultant-seo-{slug}.html` à la racine (pas dans `/villes/`) pour les 26 villes où `keep: true`.

3. **Balisage de chaque page :**
   - `<title>` : `Consultant SEO {Ville} ({zip}) — Référencement naturel & audit | Anthony Courtin`
     (l'URL et le H1 disent « consultant », mais « agence seo {ville} » pèse 41 % des impressions réelles : le title doit couvrir les deux intentions)
   - `canonical` absolu vers `/consultant-seo-{slug}`
   - `og:url` correct, `og:image` par ville si disponible sinon le visuel par défaut
   - **Un seul bloc JSON-LD `@graph`** contenant : `ProfessionalService` (@id `/#business`), `Person` (@id `/#anthony`), `WebPage`, `BreadcrumbList`, `FAQPage`
   - **Critique** : `ProfessionalService` ne contient **qu'une seule `PostalAddress`, celle de Bordeaux**, identique sur toutes les pages. La variation géographique passe **exclusivement** par `areaServed: [{ "@type": "City", "name": "…" }]`. Générer une adresse par ville est le signal qui accompagne les pénalités doorway — c'est ce que fait le site aujourd'hui, c'est à supprimer.
   - Supprime le `telephone: "+33600000000"` placeholder : soit un vrai numéro, soit pas de propriété.
   - `AggregateRating` **uniquement** si les avis sont réellement affichés sur la page.

4. **Contrôle anti-duplicate — bloquant.** Écris `scripts/check-similarity.js` qui calcule la similarité de Jaccard sur des shingles de 6 mots entre les corps de page (hors header, nav, footer) de toutes les paires de pages villes. **Si une paire dépasse 0,75, la génération échoue.** Objectif : au moins 40 % de contenu non partagé entre deux pages. C'est le garde-fou qui empêche de recréer le problème actuel à une autre échelle.

5. **Crée les pages transverses** : `/audit-seo`, `/seo-local`, `/seo-technique`, `/redaction-seo`, `/netlinking`, `/tarifs`, `/a-propos`, `/zones-d-intervention`. Contenu rédactionnel : propose-moi un plan détaillé par page **avant** d'écrire quoi que ce soit — je validerai. `/tarifs` est prioritaire, c'est la requête à plus fort volume commercial aujourd'hui absente du site.

6. **`/zones-d-intervention`** est la page pivot : une carte de la Gironde, les 26 villes groupées par zone, et pour chacune les communes couvertes. Elle est liée depuis le menu principal. C'est ce qui rend les pages villes navigables autrement que par le sitemap — un des critères qui distingue une page locale légitime d'une doorway.

---

## PHASE 4 — Redirections

1. **Applique `_refonte/04-netlify-_redirects.txt`** comme fichier `_redirects` à la racine du publish. **855 règles 301 explicites** (850 pages villes + 5 pages services racine), un bloc `410` sur `/templates/*`, et un filet de sécurité `/villes/*`. Les 855 règles pointent vers 29 destinations distinctes : les 26 pages villes, `/netlinking`, `/seo-technique` et un article de blog. Le détail ligne à ligne et les motifs sont dans `03-redirections-301.csv` (1 455 lignes, les 600 pages de `templates/` y étant détaillées alors que `_redirects` les couvre par wildcard).

2. **Vérifie avant de supprimer quoi que ce soit.** Écris `scripts/check-redirects.js` qui teste les 855 règles sur le build local ou une preview Netlify, et vérifie que :
   - chaque source renvoie bien un 301 (ou 410 pour `templates/`)
   - chaque destination répond en **200**, jamais en 3xx (aucune chaîne de redirection)
   - **aucune destination n'est la home** — chaque ancienne URL doit atterrir sur une page qui parle réellement de sa commune
   - aucune boucle

3. **Ce n'est qu'après un rapport 100 % vert** que tu supprimes les 850 fichiers de `villes/` et les 5 pages services racine.

4. **Régénère les sitemaps.** Un seul `sitemap.xml`, sans index (on passe de 709 à ~40 URL). Avec des `lastmod` réels — aujourd'hui ils sont tous figés au 2026-02-23. Mets à jour `robots.txt` et `plan-du-site.html`.

---

## PHASE 5 — Refonte des pages existantes

Applique le nouveau design system à la home, `/agences-seo`, `/contact`, `/blog/` et aux 3 articles, `/mentions-legales`, `/confidentialite`.

- La home devient la page pilier « Consultant SEO Bordeaux » et absorbe le contenu de `/audit-seo-bordeaux` et `/seo-local-bordeaux` qui pointent désormais sur elle.
- `/agences-seo` est conservée : c'est un actif éditorial réel (547 impressions). Nouvelle charte, contenu mis à jour.
- Requalifie l'ancien `/black-hat-seo` en article de blog `/blog/black-hat-seo-ce-quil-faut-savoir`, en angle informationnel et distancié — ne pas revendiquer une pratique black hat sur des pages commerciales, c'est un handicap E-E-A-T direct.
- Remplace les iframes Google Maps par une image statique cliquable : ~700 Ko et plusieurs requêtes tierces par page aujourd'hui.

---

## PHASE 6 — Vérification finale

Écris `scripts/audit-final.js` qui produit un rapport unique. Il doit être **entièrement vert** avant que je déploie.

**SEO**
- un seul H1 par page, hiérarchie de titres sans saut
- title 30-65 caractères, meta description 120-158, tous uniques
- canonical absolu, cohérent, auto-référent
- JSON-LD valide (schéma validé programmatiquement), une seule `PostalAddress` sur l'ensemble du site
- zéro lien interne cassé, zéro chaîne de redirection
- similarité inter-pages villes < 0,75 partout
- toutes les URL du sitemap en 200, toutes les pages du site dans le sitemap

**Performance** — Lighthouse sur la home, 3 pages villes, 1 page service, 1 article : LCP < 2,0 s · INP < 200 ms · CLS < 0,05 · CSS < 25 Ko · zéro requête tierce bloquante.

**Accessibilité** — WCAG 2.1 AA sur les mêmes pages : contrastes, focus visible, cibles ≥ 44 px, landmarks, labels de formulaire, `prefers-reduced-motion`.

**Contenu** — zéro `TODO-DATA` restant, zéro lorem, zéro placeholder, zéro chiffre non sourcé.

Puis affiche un tableau récapitulatif : **avant / après** sur le nombre de pages, le poids CSS, les liens internes par page, le nombre d'URL au sitemap, et la liste des 20 URL les mieux positionnées avec leur nouvelle destination — que je vérifie une dernière fois à la main.

---

## Ce que tu ne fais pas sans me demander

- Modifier la sélection des 26 villes
- Écrire le contenu de `editorial.localAngle` (les 26 paragraphes locaux)
- Rédiger les pages transverses sans plan validé au préalable
- Ajouter une dépendance npm
- Changer une couleur, une police ou un token de la charte
- Déployer

Commence par lire les deux documents de `_refonte/`, puis propose-moi ton plan pour la **phase 0 uniquement**, avec la liste exacte des fichiers que tu vas modifier ou supprimer. Attends ma validation avant d'écrire.
