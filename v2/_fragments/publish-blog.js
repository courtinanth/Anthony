/* Publication programmée du blog.

   Chaque article de v2/blog/ porte sa date dans le JSON-LD ("datePublished").
   Ce script considère qu'un article est publié dès que cette date est atteinte,
   puis il reconstruit :
     - la grille de cartes de _fragments/blog-index.html
     - les entrées /blog/... de sitemap.xml
     - les pages assemblées, via build-pages.js

   Il ne touche ni à git ni au déploiement : le commit reste une décision manuelle.

   Usage :
     node publish-blog.js              publie ce qui est dû aujourd'hui
     node publish-blog.js --dry        montre ce qui changerait, n'écrit rien
     node publish-blog.js --date=2026-09-30   simule une date (test du calendrier)
*/

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const FRAGMENTS = __dirname;
const ROOT = path.resolve(FRAGMENTS, '..');
const BLOG = path.join(ROOT, 'blog');
const INDEX_FRAG = path.join(FRAGMENTS, 'blog-index.html');
const SITEMAP = path.join(ROOT, 'sitemap.xml');
const ORIGIN = 'https://anthony-courtin.com';

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const dateArg = (args.find(a => a.startsWith('--date=')) || '').slice(7);

/* Date de Paris, pas d'UTC. Un article daté du 17 doit sortir le 17 heure française :
   toISOString() renverrait encore le 16 entre minuit et 2 h. */
const dateParis = () => new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit'
}).format(new Date());

const today = dateArg || dateParis();

if (!/^\d{4}-\d{2}-\d{2}$/.test(today)) {
  console.error(`Date invalide : ${today}. Format attendu : YYYY-MM-DD.`);
  process.exit(1);
}

const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

const dateFr = iso => {
  const [a, m, j] = iso.split('-');
  return `${Number(j)} ${MOIS[Number(m) - 1]} ${a}`;
};

const grab = (html, re) => {
  const m = html.match(re);
  return m ? m[1].trim() : null;
};

/* ---- 1. lecture des articles ---- */

const articles = [];
const incomplets = [];

for (const file of fs.readdirSync(BLOG).sort()) {
  if (!file.endsWith('.html') || file === 'index.html') continue;
  const slug = file.replace(/\.html$/, '');
  const html = fs.readFileSync(path.join(BLOG, file), 'utf8');

  const art = {
    slug,
    date: grab(html, /"datePublished"\s*:\s*"([^"]+)"/),
    cat: grab(html, /class="art-cat">([^<]+)</),
    titre: grab(html, /<h1[^>]*class="art-title"[^>]*>([^<]+)<\/h1>/),
    desc: grab(html, /<meta\s+name="description"\s+content="([^"]+)"/)
  };

  const manquants = Object.entries(art)
    .filter(([, v]) => !v).map(([k]) => k);
  if (manquants.length) { incomplets.push({ slug, manquants }); continue; }

  /* lastmod : la dernière retouche connue, jamais une date future.
     Un dateModified programmé ne doit pas s'annoncer avant d'avoir eu lieu. */
  const modifie = grab(html, /"dateModified"\s*:\s*"([^"]+)"/);
  art.lastmod = modifie && modifie > art.date && modifie <= today ? modifie : art.date;

  articles.push(art);
}

if (incomplets.length) {
  console.error('Articles ignorés, champs introuvables :');
  for (const { slug, manquants } of incomplets) {
    console.error(`  ${slug} : ${manquants.join(', ')}`);
  }
  console.error('Corrigez ces fichiers, ils ne seront ni indexés ni listés.');
  process.exit(1);
}

const publies = articles
  .filter(a => a.date <= today)
  .sort((a, b) => b.date.localeCompare(a.date));

const aVenir = articles
  .filter(a => a.date > today)
  .sort((a, b) => a.date.localeCompare(b.date));

/* ---- 2. grille de cartes ---- */

const escape = s => s.replace(/&(?!(?:amp|lt|gt|quot|#\d+);)/g, '&amp;')
  .replace(/</g, '&lt;').replace(/>/g, '&gt;');

let frag = fs.readFileSync(INDEX_FRAG, 'utf8');

/* Les accroches de cartes sont écrites à la main et plus courtes que les meta
   descriptions. On garde celle qui existe déjà, la meta ne sert qu'aux nouvelles. */
const accroches = new Map();
for (const m of frag.matchAll(/<a class="post-card[^"]*" href="\/blog\/([^"]+)">[\s\S]*?<p>([\s\S]*?)<\/p>/g)) {
  accroches.set(m[1], m[2].trim());
}

const carte = (a, i) => {
  const delai = i === 0 ? '' : ` rv-d${((i - 1) % 2) + 1}`;
  const accroche = accroches.get(a.slug) || escape(a.desc);
  return `      <a class="post-card rv${delai}" href="/blog/${a.slug}">
        <span class="cat">${escape(a.cat)}</span>
        <h3>${escape(a.titre)}</h3>
        <p>${accroche}</p>
        <time datetime="${a.date}">${dateFr(a.date)}</time>
      </a>`;
};

const grille = `    <div class="post-grid">\n${publies.map(carte).join('\n')}\n    </div>`;
const reGrille = /[ \t]*<div class="post-grid">[\s\S]*?<\/div>/;
if (!reGrille.test(frag)) {
  console.error('Bloc .post-grid introuvable dans blog-index.html. Rien n\'a été modifié.');
  process.exit(1);
}
const fragAvant = frag;
frag = frag.replace(reGrille, grille);

/* ---- 3. sitemap ---- */

let sitemap = fs.readFileSync(SITEMAP, 'utf8');
const sitemapAvant = sitemap;

/* Un lastmod ne recule jamais : ce serait dire à Google que la page a rajeuni. */
const lastmodExistants = new Map();
for (const m of sitemap.matchAll(/<loc>[^<]*\/blog\/([^<\/]+)<\/loc><lastmod>([^<]+)<\/lastmod>/g)) {
  lastmodExistants.set(m[1], m[2]);
}
const lastmodDe = a => {
  const ancien = lastmodExistants.get(a.slug);
  return ancien && ancien > a.lastmod ? ancien : a.lastmod;
};
const ligne = a => `  <url><loc>${ORIGIN}/blog/${a.slug}</loc><lastmod>${lastmodDe(a)}</lastmod><priority>0.6</priority></url>`;

const lignes = sitemap.split('\n');
const gardees = lignes.filter(l => !/<loc>[^<]*\/blog\/[^<\/]+<\/loc>/.test(l));
const posFermeture = gardees.findIndex(l => l.includes('</urlset>'));
if (posFermeture === -1) {
  console.error('Balise </urlset> introuvable dans sitemap.xml. Rien n\'a été modifié.');
  process.exit(1);
}
gardees.splice(posFermeture, 0, ...publies.map(ligne));
sitemap = gardees.join('\n');

/* ---- 4. écriture ---- */

const changeIndex = frag !== fragAvant;
const changeSitemap = sitemap !== sitemapAvant;

console.log(`Date de référence : ${today}`);
console.log(`Publiés : ${publies.length} article(s)`);
for (const a of publies) console.log(`  ${a.date}  ${a.slug}`);
if (aVenir.length) {
  console.log(`À venir : ${aVenir.length} article(s), prochain le ${aVenir[0].date} (${aVenir[0].slug})`);
}

if (!changeIndex && !changeSitemap) {
  console.log('Index et sitemap déjà à jour, rien à faire.');
  process.exit(0);
}

if (dry) {
  console.log('\n--dry : aucun fichier écrit.');
  console.log(`index du blog : ${changeIndex ? 'à mettre à jour' : 'inchangé'}`);
  console.log(`sitemap.xml   : ${changeSitemap ? 'à mettre à jour' : 'inchangé'}`);
  process.exit(0);
}

if (changeIndex) fs.writeFileSync(INDEX_FRAG, frag);
if (changeSitemap) fs.writeFileSync(SITEMAP, sitemap);

execFileSync('node', ['build-pages.js'], { cwd: FRAGMENTS, stdio: 'inherit' });

/* Les articles qui n'avaient pas encore de carte : c'est la nouveauté du jour.
   Repris par la CI pour écrire un message de commit qui dise quelque chose. */
const nouveaux = publies.filter(a => !accroches.has(a.slug)).map(a => a.slug);
console.log(`\nnouveaux: ${nouveaux.join(', ') || '(aucun, mise à jour de l\'existant)'}`);

if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT,
    `nouveaux=${nouveaux.join(' ')}\nmodifie=1\n`);
}

console.log('\nFichiers mis à jour. Relisez le diff, puis committez si tout est bon :');
console.log('  git diff v2/_fragments/blog-index.html v2/sitemap.xml v2/blog/index.html');
