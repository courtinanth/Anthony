# Mise en prod du site v2

## Ce qui part en prod
`netlify.toml` pointe désormais sur `publish = "v2"`. Au prochain déploiement (git push ou `publish_site.bat`), le site v2 remplace l'ancien. L'ancien site reste intact dans la racine du repo (rollback = remettre `publish = "."`).

## Structure v2
22 pages : accueil (avec générateur de llms.txt fonctionnel), 3 piliers (/seo, /geo, /automatisation-ia), 10 sous-pages services (/audit-seo, /seo-technique, /netlinking, /seo-local, /strategie-geo, /audit-visibilite-ia, /contenu-citable, /agents-ia, /workflows, /pipeline-contenu), /tarifs (sur devis, aucun montant affiché), /realisations, /videos, /a-propos, /contact (+ /merci), /blog/ (3 articles conservés), 404.
Chaque lien du mega menu pointe vers une vraie page. Les 709 URLs de l'ancien site sont toutes couvertes par une 301 (ou 410 pour les artefacts) vers la page la plus pertinente, vérifié par script.
SEO/IA : JSON-LD sur toutes les pages (Person, Service, FAQPage, BreadcrumbList), llms.txt, robots.txt ouvrant GPTBot/ClaudeBot/PerplexityBot/Google-Extended, sitemap.xml, contenu 100 % HTML statique lisible sans JS.
Redirections : `_redirects` gère tout l'ancien site (694 pages villes → /seo, services locaux → /seo, black hat → /blog/, templates/build/admin → 410).

## À valider AVANT de déployer
1. **Cas clients** (/realisations et accueil) : +184 %, top 3, −30 h/mois, ×3 : remplace par tes vrais chiffres.
2. **Photo à propos** : `images/anthony.avif` est réutilisée, change-la si tu veux.

## YouTube : section et page /videos (réactivées le 20 août 2026)
La chaîne (`UCAImExPZLxM8dqJsfptlzMQ`, @AnthonyCourtin4) est lancée : la section carrousel de l'accueil et la page /videos sont de retour, ainsi que leurs liens (menu Ressources, menu mobile, footer, sitemap.xml, llms.txt). La 302 `/videos → /` a été supprimée de `_redirects`, qui continue de bloquer `/_fragments/*`.

**Rien n'est à faire à la publication d'une vidéo.** Le workflow GitHub « Synchroniser YouTube » tourne toutes les six heures : il interroge la chaîne, télécharge la miniature dans `images/youtube/`, régénère le carrousel, la page /videos et le sitemap, puis committe. Netlify déploie sur le push. Pour ne pas attendre : onglet Actions → « Synchroniser YouTube » → Run workflow.

À la main, depuis `v2/_fragments/` :
```
node sync-youtube.js            # synchronise et réécrit les pages
node sync-youtube.js --dry      # montre ce qui changerait
node sync-youtube.js --refresh  # reprend aussi les titres/descriptions déjà connus
node sync-youtube.js --offline  # régénère depuis youtube.json, sans réseau
```
`_fragments/youtube.json` est la mémoire du script : une vidéo vue une fois n'est jamais perdue, même si YouTube ne répond pas. Pour retirer une vidéo du site sans la dépublier, ajouter son identifiant dans `masquees`.

Les cartes renvoient vers YouTube plutôt que d'intégrer un lecteur : la CSP interdit les cadres tiers, et une vue comptée sur YouTube vaut mieux qu'une vue perdue ici. Les miniatures sont auto-hébergées pour la même raison (`img-src 'self'`).
(Les tarifs ont été retirés : tout est "sur devis", le formulaire t'envoie un mail via formsubmit.co et redirige vers /merci.)

## Après déploiement
1. Search Console : soumettre le nouveau sitemap.xml, surveiller la couverture 30 jours.
2. Les articles de blog gardent l'ancien design (URLs et contenu préservés) : à rhabiller dans un second temps.
3. Regénérer une page : éditer son fragment dans `v2/_fragments/` puis `node v2/_fragments/build-pages.js`.
