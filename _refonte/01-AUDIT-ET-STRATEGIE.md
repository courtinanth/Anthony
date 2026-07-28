# anthony-courtin.com — Audit & stratégie de refonte

_Juillet 2026 — audit du repo `courtinanth/Anthony`, données GSC 28/04 → 27/07/2026, analyse SERP FR._

---

## 1. Le constat en cinq chiffres

| | |
|---|---|
| **850** | pages dans `/villes/` (7 silos × ~125 fichiers) |
| **100 %** | de similarité de contenu entre deux pages du même silo, une fois le nom de ville neutralisé |
| **32** | clics organiques en 90 jours, pour 24 323 impressions → **CTR 0,13 %** |
| **75 %** | des pages villes font moins de 10 impressions sur 90 jours |
| **60 %** | des impressions viennent de requêtes « **agence / consultant SEO + ville** », pas des 6 silos de services |

Le site est un cas d'école de ce que Google appelle depuis 2026 le **doorway abuse** dans ses Spam Policies : « créer des pages substantiellement similaires ciblant des villes spécifiques ». Ce n'est pas une hypothèse : les corps de page sont **strictement identiques chaîne pour chaîne** entre Mérignac, Pessac, Talence et Langon.

Le symptôme le plus parlant : **372 pages affirment que leur ville est « la deuxième ville de Gironde par sa population, située à l'ouest de Bordeaux »** — y compris Pessac, Langon et Coutras.

Ta décision de tout regrouper est la bonne. Ce document précise jusqu'où aller.

---

## 2. Problèmes techniques à corriger au passage

Ce sont des bugs, indépendants de la stratégie éditoriale. Ils dégradent tous le crawl.

**Slugs cassés — 156 pages en duplicate exact.**
Une ancienne version du `slugify()` supprimait les lettres accentuées au lieu de les translittérer. Résultat : `audit-seo-mrignac` **et** `audit-seo-merignac` coexistent, pour 25 villes × 6 services. Aucun slug cassé n'est dans les sitemaps, mais **181 fichiers HTML pointent vers eux** — donc Google les crawle. Cas extrême : Villenave-d'Ornon existe en 3 variantes (`villenave-dornon`, `villenave-d-ornon`, `villenave-dornon` selon la source), soit 11 URLs pour une seule ville.

**Le dossier `templates/` est publiquement accessible — 594 pages fantômes.**
`netlify.toml` ne définit aucun `publish`, donc la racine du repo est déployée telle quelle. `/templates/audit-seo-arcachon` répond en 200. Ce dossier n'est ni dans `robots.txt` ni dans un sitemap, mais il est crawlable et en duplicate quasi-exact avec `/villes/`. **Seuls 6 fichiers de `templates/` sont de vrais templates source** ; les 594 autres sont un artefact de build oublié.

**Chaîne de redirection sur chaque lien interne.**
Tous les liens du header et du footer pointent vers des `.html` (`../audit-seo-bordeaux.html`), que `netlify.toml` redirige ensuite en 301 vers l'URL propre. Avec 84 liens internes par page × 850 pages, c'est du gaspillage de crawl à grande échelle.

**Bug Open Graph.** `og:url` vaut `https://anthony-courtin.com/audit-seo` sur **toutes** les pages villes, au lieu de l'URL de la page.

**Données structurées trompeuses.** Chaque page ville génère un `ProfessionalService` avec `address.addressLocality = "{Ville}"` et un `telephone: "+33600000000"` (placeholder). Générer une adresse postale par ville est exactement le signal qui accompagne les pénalités doorway. Il ne doit exister **qu'une seule `PostalAddress` sur tout le site** ; la variation géographique passe par `areaServed`.

**`.htaccess` inutile.** Le site est sur **Netlify**, pas Apache. Le `.htaccess` est un vestige mort. Les redirections doivent aller dans `_redirects` ou `netlify.toml`.

**`/admin/` est une maquette sans backend.** `auth.js` ne contient que 11 appels `localStorage`, zéro `fetch()`. Aucune authentification réelle. À supprimer ou à sortir du repo public.

---

## 3. Ce que disent réellement les données GSC

### Les requêtes ne correspondent pas à l'architecture

| Intention | Impressions | Poids |
|---|---|---|
| **agence / consultant / expert SEO + ville** | ~14 600 | **60 %** |
| seo local / référencement local | 2 528 | 10 % |
| audit seo + ville | 1 873 | 7,7 % |
| black hat seo | 1 703 | 7 % |
| netlinking / achat de liens | 356 | 1,5 % |
| **rédaction seo / rédacteur** | 44 | **0,2 %** |
| optimisation on-page | 30 | **0,1 %** |

Le silo `redaction-seo` génère 4 650 impressions **sans qu'une seule requête « rédaction » n'existe** : ces pages rankent sur « agence seo {ville} ». Six silos se disputent la même SERP — c'est de la cannibalisation pure. Sur `agence seo talence` (1 741 impressions), plusieurs URLs du site se battent entre elles.

**Conséquence directe sur le naming.** Tu as choisi `/consultant-seo-{ville}`, et c'est cohérent avec ton positionnement d'indépendant. Mais « agence seo {ville} » pèse 41 % des impressions contre 8,5 % pour « consultant seo {ville} ». Le compromis : URL et H1 en « consultant », mais le `<title>` et un H2 doivent couvrir l'intention « agence » — d'où le format de title recommandé plus bas.

### Concentration du trafic

Les **7 premières villes concentrent 69,6 %** des impressions du réseau : Arcachon (4 251), Talence (3 140), Pessac (3 048), Mérignac (2 838), Saint-Médard-en-Jalles (2 361), Lège-Cap-Ferret (2 202), La Teste-de-Buch (1 822).

Autrement dit : **693 pages sur 700 servent à presque rien**, et elles diluent le PageRank interne des 7 qui comptent.

### Pages déjà bien positionnées — à ne surtout pas casser

Ces URLs sont entre la position 3 et 8. Leur redirection doit pointer vers la page ville correspondante, jamais vers la home :

`/villes/agence-seo-soulac-sur-mer` (pos 3,0) · `/villes/redaction-seo-eysines` (3,9) · `/villes/agence-seo-floirac` (4,7) · `/villes/agence-seo-lege-cap-ferret` (4,8) · `/villes/gujan-mestras` (5,2) · `/villes/redaction-seo-lge-cap-ferret` (6,1) · `/villes/agence-seo-la-teste-de-buch` (6,4) · `/villes/agence-seo-talence` (7,5) · `/villes/agence-seo-arcachon` (7,6 — 1 243 impressions).

---

## 4. L'architecture cible

```
/                                       page pilier — Consultant SEO Bordeaux
/consultant-seo-{ville}         × 26    requêtes géolocalisées
/zones-d-intervention                   page pivot navigable, liée depuis le menu
/audit-seo                              service transverse
/seo-local                              service transverse
/seo-technique                          service transverse (on-page + technique fusionnés)
/redaction-seo                          service transverse
/netlinking                             service transverse (intention nationale)
/tarifs                                 page monétaire — requête à fort volume, aujourd'hui absente
/a-propos                               E-E-A-T : parcours, certifications, preuves
/agences-seo                            conservée — actif éditorial réel (547 impressions)
/blog/                                  informationnel (dont black hat requalifié en article)
/contact
```

**De 850 pages villes à 26.** Passer sous la barre des ~30 pages villes est ce qui distingue une page locale légitime d'une doorway. La règle : si tu ne peux pas écrire un paragraphe factuel non générique sur une ville, elle ne mérite pas de page.

### Les 26 villes retenues

Sélection faite sur les impressions GSC réelles. Elles couvrent **96 % des impressions villes** du site actuel.

**Tier 1 — piliers (≥ 1 500 impressions)**
Bordeaux · Arcachon · Talence · Pessac · Mérignac · Saint-Médard-en-Jalles · Lège-Cap-Ferret · La Teste-de-Buch

**Tier 2 — solides (250 – 650)**
Floirac · Gradignan · Libourne · Lormont · Bègles · Villenave-d'Ornon · Le Bouscat · Eysines · Coutras · Arès · Saint-Aubin-de-Médoc · Lacanau

**Tier 3 — couverture territoriale**
Soulac-sur-Mer (pos 6,1 — meilleur potentiel de gain rapide) · Le Taillan-Médoc · Bruges (pos 9,3) · Cestas · Langon · Bazas

Les trois dernières sont des choix de couverture plutôt que de volume pur : sans Langon et Bazas, le Sud-Gironde n'a aucune page ; sans Cestas, tout le sud de la métropole retombe sur Bordeaux.

**Les 74 autres villes ne disparaissent pas du site.** Chaque page ville liste les communes qu'elle couvre (« Interventions à Lormont, et aussi à Cenon, Bassens, Carbon-Blanc, Ambarès… »). C'est ce qui rend les 301 légitimes : la page de destination parle réellement de la commune redirigée.

---

## 5. Le template de page ville

Structure calée sur les 7 pages du top 10 « consultant seo bordeaux ». Cible : **1 800 – 2 500 mots pour Bordeaux, 1 200 – 1 500 pour les autres**.

| # | Section | Partagé / Variable |
|---|---|---|
| 1 | Hero — H1 « Consultant SEO {Ville} », promesse chiffrée, double CTA | partagé + nom de ville |
| 2 | Bandeau preuve — note Trustfolio 5/5 (41 avis), logos clients, « +50 projets » | partagé |
| 3 | **« Le marché de {Ville} en chiffres »** — entreprises actives, top 3 secteurs, part de TPE, population (source INSEE/SIRENE, libre) | **variable, données réelles** |
| 4 | **« Ce qui compte pour être visible à {Ville} »** — 120-180 mots écrits à la main par ville | **variable, rédigé** |
| 5 | Mes services — 5 cartes (audit, SEO local, technique, contenu, netlinking), 80-120 mots chacune, lien vers la page transverse | partagé |
| 6 | Méthode en 4 étapes | partagé |
| 7 | **« Concurrence SEO mesurée à {Ville} »** — pour 3-5 requêtes locales : nb de résultats, avis moyens des 3 fiches du pack local, site optimisé en P1 ou non | **variable, données réelles** |
| 8 | **« Le paysage SEO local à {Ville} »** — absorbe le contenu des pages `agence-seo-{ville}` : les agences/consultants présents, leur positionnement | **variable, existant** |
| 9 | Cas client de la zone — secteur, point de départ, actions, résultat chiffré, période | variable par zone (1 cas / 3-4 villes) |
| 10 | Freelance ou agence à {Ville} ? — tableau comparatif | partagé |
| 11 | Tarifs — fourchettes explicites + lien `/tarifs` | partagé |
| 12 | À propos — photo, parcours, certifications, LinkedIn | partagé |
| 13 | **FAQ** — 5 questions génériques + **2 spécifiques à la ville** | mixte |
| 14 | Zone d'intervention — communes couvertes, temps de trajet, maillage vers 4-6 villes voisines | **variable** |
| 15 | CTA final + formulaire | partagé |

**Règle de non-régression : au minimum 40 % de contenu non partagé entre deux pages villes.** À vérifier par script (Jaccard sur shingles de 6 mots) avant mise en ligne. Si deux pages dépassent 0,75 de similarité, l'une des deux ne mérite pas d'exister.

**Règle de silo : une page ville ne développe jamais un service en profondeur.** Elle le résume en 100 mots et pointe vers `/audit-seo`, `/netlinking`, etc. Sinon on recrée 850 duplicats à un autre niveau.

Le point 8 répond directement à ta demande de réutiliser le top 10 existant : les 100 pages `agence-seo-{ville}` sont les mieux positionnées du site (position moyenne 10,0). Leur contenu ne doit pas être jeté, il doit être condensé en une section de la page ville.

### Balisage

**Title** — couvre les deux intentions : `Consultant SEO {Ville} (33xxx) — Référencement naturel & audit | Anthony Courtin`

**Un seul `@graph` JSON-LD par page :**

- `ProfessionalService` — **une seule `PostalAddress`, celle de Bordeaux**, la géo variable passe dans `areaServed: [City]`
- `Person` (Anthony Courtin) — `knowsAbout`, `sameAs` LinkedIn
- `WebPage` + `isPartOf WebSite`
- `BreadcrumbList` — Accueil › Zones d'intervention › {Ville} (absent aujourd'hui)
- `FAQPage` — 5 à 8 questions, réponses visibles dans le HTML
- `AggregateRating` **uniquement** si les avis sont réellement affichés sur la page

---

## 6. Redirections

Fichiers livrés : `03-redirections-301.csv` (1 455 lignes) et `04-netlify-_redirects.txt`.

| Type | Volume | Destination |
|---|---|---|
| Pages villes | 850 | `/consultant-seo-{ville la plus proche conservée}` en 301 |
| Pages services racine | 5 | page ville pilier ou service transverse |
| `templates/` | 594 | **410 Gone** — artefact de build, aucune valeur |
| Filet de sécurité | `/villes/*` | `/consultant-seo-bordeaux` |

Le rattachement des 74 villes supprimées est fait par table explicite de commune limitrophe (Cenon → Lormont, Le Haillan → Eysines, Léognan → Cestas…), avec repli par zone. **Aucune ville conservée ne se retrouve sans redirection entrante, et aucune redirection ne pointe vers la home.**

À faire côté Search Console après déploiement : soumettre le nouveau sitemap, laisser les anciens 30 jours, puis surveiller le rapport de couverture.

---

## 7. Séquence recommandée

1. **Corriger la technique d'abord** (slugs, `templates/`, `og:url`, liens `.html`) — sans toucher au contenu. Mesurer 2 semaines.
2. **Construire les 8 pages Tier 1** avec le nouveau template et la nouvelle charte. Déployer les redirections des villes rattachées à ces 8.
3. **Mesurer 6 à 8 semaines** sur Arcachon, Lège-Cap-Ferret, Eysines, Soulac — les 4 déjà en position 3-6, donc les plus rapides à valider le modèle.
4. **Étendre aux Tier 2 et 3** seulement si les Tier 1 progressent.
5. Publier `/tarifs` — c'est la page à plus fort volume commercial actuellement absente du site.

Ne pas tout déployer d'un coup. Un basculement de 850 → 26 pages en une fois rend impossible d'attribuer une variation de trafic à une cause précise.
