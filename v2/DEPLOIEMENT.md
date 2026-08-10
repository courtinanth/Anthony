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

## Partie YouTube retirée (août 2026, chaîne pas encore lancée)
La page /videos et toutes ses références (menus, footer, accueil, à-propos, blog, sitemap.xml, llms.txt) ont été retirées le temps que la chaîne ait du contenu. Le fragment `_fragments/videos.html` est conservé. `_redirects` contient une 302 `/videos → /` temporaire et bloque `/_fragments/*`.
Pour tout réactiver : suivre le commentaire dans `_fragments/build-pages.js` (rétablir l'entrée /videos, les liens, le sitemap, llms.txt), supprimer la 302, puis relancer le build.
(Les tarifs ont été retirés : tout est "sur devis", le formulaire t'envoie un mail via formsubmit.co et redirige vers /merci.)

## Après déploiement
1. Search Console : soumettre le nouveau sitemap.xml, surveiller la couverture 30 jours.
2. Les articles de blog gardent l'ancien design (URLs et contenu préservés) : à rhabiller dans un second temps.
3. Regénérer une page : éditer son fragment dans `v2/_fragments/` puis `node v2/_fragments/build-pages.js`.
