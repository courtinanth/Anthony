/* Assemble les pages v2 depuis les fragments + le header/footer de index.html.
   Usage : node build-pages.js (depuis v2/_fragments/) */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const idx = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

const header = idx.match(/<a class="skip-link"[\s\S]*?<\/header>/)[0];
const footer = idx.match(/<footer class="site">[\s\S]*?<\/footer>/)[0];

const PAGES = [
  /* ---- pages piliers ---- */
  { frag: 'seo.html', out: 'seo.html', url: '/seo',
    title: 'Consultant SEO partout en France | Anthony Courtin',
    desc: "Audit, SEO technique, netlinking et SEO local : une méthode mesurée pour gagner des positions durables sur Google. Consultant partout en France.",
    crumb: 'SEO',
    service: { name: 'SEO : audit, technique, netlinking, SEO local', type: 'Search engine optimization' } },
  { frag: 'geo.html', out: 'geo.html', url: '/geo',
    title: 'Consultant GEO : être cité par ChatGPT | Anthony Courtin',
    desc: "Faites citer votre marque par ChatGPT, Perplexity et les AI Overviews : audit de visibilité IA, stratégie GEO et contenu citable. Partout en France.",
    crumb: 'GEO',
    service: { name: 'GEO : visibilité dans les moteurs de réponse IA', type: 'Generative engine optimization' } },
  { frag: 'automatisation-ia.html', out: 'automatisation-ia.html', url: '/automatisation-ia',
    title: 'Automatisation IA sur mesure pour PME | Anthony Courtin',
    desc: "Agents IA, programmes sur mesure avec Claude Code, pipelines de contenu : automatisez vos process marketing et gagnez des dizaines d'heures par mois.",
    crumb: 'Automatisation IA',
    service: { name: 'Automatisation IA : agents, programmes sur mesure, pipelines', type: 'Marketing automation' } },
  /* ---- sous-pages SEO ---- */
  { frag: 'audit-seo.html', out: 'audit-seo.html', url: '/audit-seo',
    title: "Audit SEO : plan d'action priorisé | Anthony Courtin",
    desc: "Audit SEO technique, sémantique et popularité, livré avec un plan d'action priorisé par impact. Restitution en visio, devis gratuit, partout en France.",
    crumb: 'Audit SEO', parent: { name: 'SEO', url: '/seo' },
    service: { name: 'Audit SEO complet', type: 'Search engine optimization audit' } },
  { frag: 'seo-local.html', out: 'seo-local.html', url: '/seo-local',
    title: 'SEO local : fiche Google et pack local | Anthony Courtin',
    desc: "Fiche Google Business optimisée, stratégie d'avis et pages locales propres : dominez les recherches locales et Google Maps dans votre zone de chalandise.",
    crumb: 'SEO local', parent: { name: 'SEO', url: '/seo' },
    service: { name: 'SEO local', type: 'Local SEO' } },
  /* ---- sous-pages GEO ---- */
  { frag: 'audit-visibilite-ia.html', out: 'audit-visibilite-ia.html', url: '/audit-visibilite-ia',
    title: 'Audit de visibilité IA (ChatGPT, Gemini) | Anthony Courtin',
    desc: "Que disent les IA de votre marque ? Panel de requêtes métier, part de voix face aux concurrents et plan d'action GEO priorisé, restitué en visio.",
    crumb: 'Audit de visibilité IA', parent: { name: 'GEO', url: '/geo' },
    service: { name: 'Audit de visibilité IA', type: 'AI visibility audit' } },
  /* ---- sous-pages Automatisation ---- */
  /* ---- pages transverses ---- */
  { frag: 'tarifs.html', out: 'tarifs.html', url: '/tarifs',
    title: 'Tarifs SEO, GEO & automatisation IA | Anthony Courtin',
    desc: "Audit, accompagnement mensuel SEO + GEO ou projet d'automatisation IA : décrivez votre besoin, réponse sous 24 h et devis précis gratuit sous 48 h.",
    crumb: 'Tarifs' },
  { frag: 'realisations.html', out: 'realisations.html', url: '/realisations',
    title: 'Réalisations & cas clients SEO, GEO, IA | Anthony Courtin',
    desc: "+184 % de trafic organique, top 3 des marques citées par les IA, 30 h automatisées par mois : des cas clients mesurés, contextes et périodes indiqués.",
    crumb: 'Réalisations' },
  { frag: 'videos.html', out: 'videos.html', url: '/videos',
    title: 'Vidéos SEO, GEO & IA | Anthony Courtin',
    desc: "Mes dernières vidéos YouTube : SEO, GEO, automatisation IA et coulisses de mes missions. Des tutos concrets, applicables le jour même.",
    crumb: 'Vidéos', videos: true },
  { frag: 'a-propos.html', out: 'a-propos.html', url: '/a-propos',
    title: 'À propos : Anthony Courtin, consultant SEO, GEO & IA',
    desc: "8 ans de SEO, plus de 50 clients accompagnés partout en France, et une conviction : la visibilité de demain se joue autant dans ChatGPT que sur Google.",
    crumb: 'À propos' },
  { frag: 'contact.html', out: 'contact.html', url: '/contact',
    title: 'Contact | Anthony Courtin, consultant SEO, GEO & IA',
    desc: "Décrivez votre projet SEO, GEO ou automatisation IA : premier échange gratuit, réponse sous 24 h. Intervention partout en France, à distance ou sur site.",
    crumb: 'Contact' },
  /* Pages légales. Elles vivaient encore dans l'ancien gabarit (css/style.css,
     sans le header ni le footer v2) et annonçaient un Google Analytics qui
     n'existe pas. Elles passent ici pour suivre le site automatiquement. */
  { frag: 'mentions-legales.html', out: 'mentions-legales.html', url: '/mentions-legales',
    title: 'Mentions légales | Anthony Courtin',
    desc: "Éditeur, hébergeur, propriété intellectuelle et responsabilité du site anthony-courtin.com, et la mesure d'audience soumise à votre consentement.",
    crumb: 'Mentions légales' },
  { frag: 'confidentialite.html', out: 'confidentialite.html', url: '/confidentialite',
    title: 'Politique de confidentialité | Anthony Courtin',
    desc: "Ce que je collecte, pourquoi, combien de temps je le garde et comment retirer votre consentement. Un seul traceur, aucun profilage, aucune revente.",
    crumb: 'Confidentialité' },
  { frag: 'merci.html', out: 'merci.html', url: '/merci',
    title: 'Merci, message bien reçu | Anthony Courtin',
    desc: "Votre message est bien parti, réponse sous 24 h ouvrées.", crumb: 'Merci', noindex: true },
  { frag: '404.html', out: '404.html', url: '/404',
    title: 'Page introuvable | Anthony Courtin',
    desc: "Cette page n'existe pas ou a été déplacée.", crumb: '404', noindex: true },
  { frag: 'blog-index.html', out: 'blog/index.html', url: '/blog/',
    title: 'Blog SEO, GEO & IA | Anthony Courtin',
    desc: "Guides pratiques SEO, GEO et automatisation IA : des retours d'expérience concrets, appliqués sur de vraies missions, actionnables dès la lecture.",
    crumb: 'Blog' },
];

function esc(s){return s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;')}

function faqLd(html, url){
  const items = [];
  const re = /<button class="faq-q"[^>]*>([\s\S]*?)<span class="plus">[\s\S]*?<div class="faq-a"><p>([\s\S]*?)<\/p><\/div>/g;
  let m;
  while ((m = re.exec(html))) {
    const strip = s => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    items.push({
      '@type': 'Question', name: strip(m[1]),
      acceptedAnswer: { '@type': 'Answer', text: strip(m[2]) }
    });
  }
  if (!items.length) return null;
  return { '@type': 'FAQPage', '@id': 'https://anthony-courtin.com' + url + '#faq', mainEntity: items };
}

/* Les vidéos de la chaîne, décrites une par une pour Google et pour les IA :
   un VideoObject porte la durée, la date et la miniature, qu'aucune balise de
   la page ne dit autrement. La liste vient de youtube.json, tenue à jour par
   sync-youtube.js. */
function videoLd(url){
  const cache = path.join(__dirname, 'youtube.json');
  if (!fs.existsSync(cache)) return [];
  const { videos = [] } = JSON.parse(fs.readFileSync(cache, 'utf8'));
  const iso = s => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
    return 'PT' + (h ? h + 'H' : '') + (m ? m + 'M' : '') + (r || (!h && !m) ? r + 'S' : '');
  };
  return videos.map(v => ({
    '@type': 'VideoObject',
    '@id': 'https://anthony-courtin.com' + url + '#' + v.id,
    name: v.titre,
    description: v.accroche || v.titre,
    thumbnailUrl: 'https://anthony-courtin.com/images/youtube/' + v.id + '.jpg',
    uploadDate: v.publie || v.date,
    duration: iso(v.secondes),
    url: 'https://www.youtube.com/watch?v=' + v.id,
    embedUrl: 'https://www.youtube.com/embed/' + v.id,
    publisher: { '@id': 'https://anthony-courtin.com/#person' }
  }));
}

/* Les derniers articles parus, repris tels quels de la grille du blog.
   Les recopier dans un fragment les figerait : ils seraient encore là trois
   publications plus tard, et un article programmé pourrait s'afficher avant
   sa date. Le marqueur les fait suivre l'index, qui fait foi. */
function derniersArticles(html, n){
  const idx = fs.readFileSync(path.join(__dirname, 'blog-index.html'), 'utf8');
  const cartes = (idx.match(/<a class="post-card[\s\S]*?<\/a>/g) || []).slice(0, n);
  return html.replace('<!-- derniers-articles -->', cartes.join('\n').trim());
}

for (const p of PAGES) {
  let frag = fs.readFileSync(path.join(__dirname, p.frag), 'utf8');
  if (frag.includes('<!-- derniers-articles -->')) frag = derniersArticles(frag, 3);
  const fullUrl = 'https://anthony-courtin.com' + p.url;
  const graph = [
    { '@type': 'WebPage', '@id': fullUrl, url: fullUrl, name: p.title,
      description: p.desc, inLanguage: 'fr-FR',
      isPartOf: { '@id': 'https://anthony-courtin.com/#website' },
      about: { '@id': 'https://anthony-courtin.com/#person' } },
    { '@type': 'BreadcrumbList', itemListElement: (p.parent ? [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://anthony-courtin.com/' },
      { '@type': 'ListItem', position: 2, name: p.parent.name, item: 'https://anthony-courtin.com' + p.parent.url },
      { '@type': 'ListItem', position: 3, name: p.crumb, item: fullUrl } ] : [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://anthony-courtin.com/' },
      { '@type': 'ListItem', position: 2, name: p.crumb, item: fullUrl } ]) }
  ];
  if (p.service) graph.push({
    '@type': 'Service', '@id': fullUrl + '#service',
    name: p.service.name, serviceType: p.service.type,
    provider: { '@id': 'https://anthony-courtin.com/#person' },
    areaServed: { '@type': 'Country', name: 'France' }, url: fullUrl });
  const faq = faqLd(frag, p.url);
  if (faq) graph.push(faq);
  if (p.videos) for (const v of videoLd(p.url)) graph.push(v);

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<script src="/js/js-flag.js?v=1"></script>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(p.title)}</title>
<meta name="description" content="${esc(p.desc)}">
${p.noindex ? '<meta name="robots" content="noindex, follow">' : '<meta name="robots" content="index, follow">'}
<link rel="canonical" href="${fullUrl}">
<link rel="icon" href="/images/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<script src="/js/favicon-anim.js?v=2" defer></script>
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(p.title)}">
<meta property="og:description" content="${esc(p.desc)}">
<meta property="og:url" content="${fullUrl}">
<meta property="og:image" content="https://anthony-courtin.com/images/anthony-consultant-seo.png">
<meta property="og:locale" content="fr_FR">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700&family=Instrument+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/main.css?v=12">
<script type="application/ld+json">
${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 1)}
</script>
</head>
<body>

${header}

<main id="main">
${frag}
</main>

${footer}

<script src="/js/site.js?v=7" defer></script>
<script src="/js/consentement.js?v=1" defer></script>
</body>
</html>
`;
  const outPath = path.join(ROOT, p.out);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html);
  console.log('OK', p.out);
}
