# Gabarit d'article de blog — v2

L'article de référence est **`prompt-chatgpt.html`**. Pour créer un nouvel article :
on le duplique, on remplace les blocs, on ne touche ni au CSS ni au JS.

Fichiers partagés :

| Fichier | Rôle |
|---|---|
| `/css/main.css` | tokens du site (couleurs, polices, header, footer) |
| `/css/blog-article.css` | tout l'habillage de l'article |
| `/js/site.js` | nav, burger, mega-menu |
| `/js/blog-article.js` | sommaire auto, scrollspy, partage, boutons IA, barre de lecture, YouTube, avis |

Aucun script tiers, aucune dépendance. Le seul JS spécifique à un article est
celui de son **outil interactif**, en fin de page.

---

## Ce qu'on reprend de Café du Musée

| Élément CDM | Équivalent ici | Remarque |
|---|---|---|
| `cdm-article-layout` 3 colonnes | `.art-layout` | gauche 236 px · centre fluide · droite 304 px |
| `cdm-rail-left` (sommaire + partage, sticky) | `.rail-left` | identique |
| `cdm-rail-right` (résumé IA + articles liés) | `.rail-right` | identique |
| `cdm-ai-box` « Résumé IA » | `.ai-box` | + version mobile rendue côté serveur |
| `cdm-ai-actions` « Résumer avec » | `.ai-actions` | 6 IA au lieu de 6, mêmes principes |
| `cdm-auteur` | `.author-box` | **avec le lien LinkedIn**, comme demandé |
| `cdm-avis-block` (note + commentaires) | `.reviews` | étoiles + formulaire, envoi Netlify Forms |
| `cdm-cta-band` | `.cta-band` | pointe vers `/formation-ia-entreprise` |
| — | `.tool` | **nouveau** : l'outil interactif de l'article |

Les couleurs viennent intégralement du design system v2 (sapin `--pine-*`,
lime `--lime`, crème `--cream`). Aucune couleur en dur.

---

## Les blocs, dans l'ordre du fichier

### 1. `<head>`
À remplacer à chaque article : `title`, `meta description`, `canonical`, les 4 `og:*`,
`article:published_time` / `modified_time`, et le bloc **JSON-LD**.

Le JSON-LD contient toujours 4 nœuds :
`BlogPosting` · `Person` (Anthony, `@id` stable) · `BreadcrumbList` · `FAQPage`.
Le `FAQPage` doit reprendre **mot pour mot** les questions/réponses de la section FAQ
visible : une FAQ balisée mais absente du HTML est une pénalité, pas un bonus.

### 2. `.art-top` — en-tête sombre
Fil d'Ariane, catégorie, `h1`, chapô, ligne de méta (auteur, date, durée, mise à jour),
puis la barre **« Résumer avec »**.

Les `href` des 6 boutons IA sont générés par `blog-article.js` à partir du `canonical`.
On ne les écrit jamais à la main. Pour ajouter ou retirer une IA, il suffit
d'ajouter un `<li>` avec le bon `data-ai` (`chatgpt`, `claude`, `perplexity`,
`gemini`, `mistral`, `grok`) — la table est en haut du JS.

### 3. `.rail-left`
Sommaire (`<details open>` + `<nav id="toc">`) et bloc partage.
Le sommaire est **construit automatiquement** depuis les `h2`/`h3` du corps :
on n'écrit jamais le sommaire à la main, et les `id` d'ancres sont générés
si absents. Les titres à l'intérieur de `.takeaways`, `.tool`, `.cta-band`,
`.reviews` et `.author-box` sont ignorés.

### 4. `.ai-box` (résumé IA)
**Deux copies du même texte** : une dans `.rail-right` (desktop) et une en
`.ai-box-mobile` (mobile). Les deux sont dans le HTML servi, donc lisibles par
Google et par les crawlers de LLM.

Règle de rédaction : 2 à 3 phrases, 250 à 400 signes, **au présent, sans « cet article »**.
C'est ce paragraphe qui a le plus de chances d'être repris tel quel dans une réponse IA.

### 5. `.takeaways` — « À retenir »
4 à 6 puces, en tête d'article, chacune autoportante. Même logique : c'est le bloc
le plus cité par les moteurs de réponse. À écrire en dernier, une fois l'article fini.

### 6. `.video-embed` — la vidéo YouTube
Façade cliquable (`<div class="yt-lite" data-yt="ID_YOUTUBE">`). Aucun script YouTube
n'est chargé avant le clic : zéro impact sur le LCP, zéro cookie tiers avant action.
`data-yt` = l'identifiant de la vidéo, pas l'URL complète.

### 7. `.art-body` — le corps
Éléments disponibles : `h2`, `h3`, `h4`, listes, `blockquote`,
`.table-wrap > table`, `pre/code`, `figure`,
et trois encarts : `.callout--info`, `.callout--tip`, `.callout--warn`.

Largeur de lecture bloquée à 72 caractères. Ne pas la changer.

### 8. `.tool` — l'outil interactif
Un par article. Structure fixe :

```html
<div class="tool" id="outil-XXX">
  <div class="tool-head">…icône + titre…</div>
  <div class="tool-body">…champs, sortie, actions…</div>
  <div class="tool-foot">…mention « rien n'est envoyé »…</div>
</div>
```

Briques prêtes à l'emploi dans le CSS : `.field`, `.field-row`, `.chips/.chip`,
`.tool-out`, `.score`, `.meter`, `.btn-sm` (`.primary` / `.ghost` / `.ok`).

**Trois règles non négociables :**
1. **100 % côté navigateur.** Aucun appel réseau, aucune donnée qui sort. C'est écrit
   dans le pied de l'outil, et ça doit rester vrai.
2. **Utile sans inscription.** L'outil n'est pas un péage : il fonctionne tout de suite.
3. **Il produit quelque chose qu'on emporte** — un texte à copier, un score, un
   fichier, un lien pré-rempli vers ChatGPT ou Claude. C'est ce qui fait revenir.

### 9. `.faq`
`<details>` natifs. Chaque question doit exister à l'identique dans le JSON-LD `FAQPage`.

### 10. `.cta-band`, `.author-box`, `.reviews`, `.related`
Blocs quasi constants d'un article à l'autre. Sur `.reviews`, deux attributs à
adapter :

- `data-slug` — l'identifiant de l'article (sert au brouillon local) ;
- `data-reviews` — le JSON des avis **déjà validés**, injecté au build.

---

## Les avis lecteurs

Le site est statique : il n'y a pas de base de données.

1. Le formulaire poste sur **Netlify Forms** (`name="avis"`, `data-netlify="true"`,
   honeypot `societe`). Rien à héberger, rien à maintenir.
2. À l'envoi, l'avis est aussi stocké en `localStorage` et affiché immédiatement
   avec la mention *« en attente de validation »*. Le lecteur voit que c'est parti.
3. Les avis validés sont recopiés dans `data-reviews` au build :
   `[{"note":5,"nom":"Julie","texte":"…","date":"12 août 2026"}]`.

Tant qu'il n'y a aucun avis validé, **ne pas ajouter de balisage `AggregateRating`** :
une note agrégée sans avis publics est un motif d'action manuelle Google.

---

## Checklist avant publication

- [ ] `canonical`, `og:url` et le `@id` du JSON-LD pointent vers la même URL
- [ ] `title` ≤ 60 signes, `meta description` ≤ 155 signes
- [ ] Résumé IA présent en **deux** exemplaires (rail droit + mobile)
- [ ] Bloc « À retenir » rédigé après l'article
- [ ] Questions de la FAQ identiques dans le HTML et le JSON-LD
- [ ] `data-yt` renseigné, vignette vidéo en 1280 × 720
- [ ] Outil interactif testé sans réseau
- [ ] 3 à 5 liens internes dans le corps, dont un vers le pilier de la semaine
- [ ] Images en AVIF/WebP avec `width`, `height` et `loading="lazy"` (sauf visuel de tête)
- [ ] `data-slug` de `.reviews` = le slug de l'URL
