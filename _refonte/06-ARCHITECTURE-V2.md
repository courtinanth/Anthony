# Architecture v2 — Pivot national & portfolio

_Juillet 2026. Ce document remplace les sections « architecture cible » et « villes retenues » de `01-AUDIT-ET-STRATEGIE.md`. Le reste de l'audit (bugs techniques, doorway, balisage) reste valable et prioritaire._

---

## 1. Le pivot

| | Avant | Après |
|---|---|---|
| Positionnement | Consultant SEO local Gironde | Consultant **SEO · GEO · Automatisation IA**, national |
| Rôle du site | Acquisition SEO local | **Hybride** : portfolio/vitrine (support YouTube) + pages services vendeuses |
| Géo | 850 pages villes Gironde | Villes françaises **> 100 000 habitants** uniquement |
| Contenu | Pages services × villes | Réalisations, vidéos YouTube, articles, services |

---

## 2. Arborescence cible

```
/                               home portfolio-hybride (cf. maquettes A & B)
/seo                            service — audit, technique, netlinking, local
/geo                            service — visibilité IA (ChatGPT, Perplexity, AI Overviews)
/automatisation-ia              service — agents, workflows, pipelines de contenu
/tarifs                         page monétaire (toujours absente, toujours prioritaire)
/realisations/                  portfolio — 1 page par cas client
/videos                         hub YouTube (embeds + transcriptions → SEO)
/blog/                          articles SEO / GEO / IA
/a-propos                       E-E-A-T : parcours, certifications, presse, chaîne
/contact
/consultant-seo-{ville}   × ~30 villes > 100k hab
/zones-d-intervention           page pivot listant les villes
```

Le silo Black Hat est requalifié en article de blog (déjà prévu dans l'audit v1).
`/agences-seo` (Gironde) : à requalifier ou 301 vers `/consultant-seo-bordeaux` — l'actif éditorial est local, il ne colle plus au national. À trancher.

## 3. Les villes retenues (> 100 000 habitants)

La France compte ~45 communes > 100k, mais 10 d'entre elles sont des communes de banlieue (Villeurbanne, Roubaix, Tourcoing, Boulogne-Billancourt, Montreuil, Argenteuil, Nanterre, Vitry-sur-Seine, Créteil, Saint-Denis 93). **Leur créer une page recréerait le problème doorway** : personne ne cherche « consultant seo vitry-sur-sur-seine » en volume, et le contenu serait dupliqué avec la métropole voisine.

**Recommandation : ~30 pages, une par aire urbaine, les communes de banlieue étant couvertes par la page de leur métropole** (mention `areaServed` + paragraphe zone d'intervention).

**Tier 1 — top 10 (à construire d'abord)**
Paris · Marseille · Lyon · Toulouse · Nice · Nantes · Montpellier · Strasbourg · Bordeaux · Lille

**Tier 2**
Rennes · Toulon · Reims · Saint-Étienne · Dijon · Le Havre · Grenoble · Angers · Nîmes · Clermont-Ferrand

**Tier 3**
Aix-en-Provence · Le Mans · Brest · Tours · Amiens · Annecy · Limoges · Metz · Perpignan · Besançon · Orléans · Rouen · Caen · Mulhouse · Nancy · Avignon · Poitiers · Dunkerque

_(La Réunion : Saint-Denis et Saint-Paul > 100k — à inclure seulement si tu veux réellement adresser les DOM.)_

**Vérifier les populations INSEE au moment de la génération** (millésime le plus récent) plutôt que de figer cette liste.

⚠️ **Leçon de l'audit v1 : ces pages ne doivent pas être des clones.** Règle inchangée : ≥ 40 % de contenu non partagé entre deux pages villes (données marché locales, concurrence SEO mesurée, cas client de la zone), sinon la page ne mérite pas d'exister. Le template de page ville de `01-AUDIT-ET-STRATEGIE.md` §5 reste le bon, en remplaçant les données Gironde par les données de chaque métropole. Bordeaux reste la seule `PostalAddress` ; le national passe par `areaServed`.

## 4. Redirections — mise à jour

Les fichiers `03-redirections-301.csv` / `04-netlify-_redirects.txt` (v1) rattachaient les 850 pages villes aux 26 villes girondines. **Caduc** : seule Bordeaux survit.

| Source | Destination |
|---|---|
| `/villes/*-bordeaux` et communes de la métropole | `/consultant-seo-bordeaux` |
| Toutes les autres pages `/villes/*` (Gironde hors métropole) | `/consultant-seo-bordeaux` |
| `/audit-seo-bordeaux`, `/seo-local-bordeaux` | `/consultant-seo-bordeaux` |
| `/optimisation-on-page`, `/redaction-seo` | `/seo` |
| `/netlinking-bordeaux` | `/seo` |
| `/black-hat-seo` (+ villes) | article blog black hat |
| `/templates/*` | 410 Gone (inchangé) |
| `/linkedin-posts` | `/a-propos` ou suppression |

À régénérer via `scripts/build-redirects.js` adapté. Les corrections techniques v1 (slugs accentués, `og:url`, liens `.html`, `.htaccess`, `/admin/`) restent à faire **avant** le basculement.

## 5. Charte graphique

`02-CHARTE-GRAPHIQUE.md` (light éditorial, Fraunces + Inter, accent grenat) = **Template A**, adapté au nouveau positionnement.
**Template B** propose une alternative light « studio suisse » : Space Grotesk + IBM Plex Mono, grille apparente, accent bleu Klein `#1D3FFF`, sections numérotées.

Maquettes : `maquettes/template-a-editorial.html` · `maquettes/template-b-studio.html`

## 6. Séquence

1. Corriger la technique v1 (slugs, templates/, og:url, liens .html).
2. Choisir la DA → décliner la home + les 3 pages services + gabarit article/réalisation.
3. Construire `/consultant-seo-bordeaux` (seule page locale existante à fort historique) + Tier 1.
4. Déployer les 301 (nouveau fichier `_redirects`).
5. Lancer `/videos` en même temps que la chaîne YouTube ; chaque vidéo = embed + transcription + article compagnon.
6. Étendre Tier 2/3 si Tier 1 progresse.
