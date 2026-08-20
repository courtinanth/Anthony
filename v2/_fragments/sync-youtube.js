/* Synchronisation de la chaîne YouTube.

   Le site est statique et sa CSP n'autorise ni script tiers ni image externe
   (`img-src 'self' data:`, `connect-src 'self'`). Impossible, donc, d'aller
   chercher les vidéos depuis le navigateur : tout se joue ici, au build.

   Ce script :
     - récupère la liste des vidéos de la chaîne (flux RSS officiel, avec repli
       sur la page /videos quand le flux est en retard sur une publication) ;
     - complète chaque vidéo avec son titre, sa date, sa durée et son résumé ;
     - télécharge sa miniature dans /images/youtube/ (obligatoire : la CSP
       interdit i.ytimg.com) ;
     - réécrit le carrousel de l'accueil et de la page /videos ;
     - met à jour sitemap.xml, puis relance build-pages.js.

   youtube.json sert de mémoire : ce qui a été vu une fois n'est jamais perdu,
   même si YouTube ne répond pas. Une panne réseau laisse donc le site intact
   au lieu de le vider.

   Usage :
     node sync-youtube.js            synchronise et réécrit les pages
     node sync-youtube.js --dry      montre ce qui changerait, n'écrit rien
     node sync-youtube.js --offline  régénère les pages depuis youtube.json
     node sync-youtube.js --refresh  reprend les métadonnées de toutes les
                                     vidéos, y compris déjà connues (titre
                                     corrigé, description réécrite sur YouTube)
*/

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const FRAGMENTS = __dirname;
const ROOT = path.resolve(FRAGMENTS, '..');
const CACHE = path.join(FRAGMENTS, 'youtube.json');
const INDEX = path.join(ROOT, 'index.html');
const FRAG_VIDEOS = path.join(FRAGMENTS, 'videos.html');
const SITEMAP = path.join(ROOT, 'sitemap.xml');
const THUMBS = path.join(ROOT, 'images', 'youtube');
const ORIGIN = 'https://anthony-courtin.com';

/* Nombre de vidéos affichées sur l'accueil. Au-delà, le carrousel devient un
   catalogue : c'est le rôle de /videos. */
const MAX_ACCUEIL = 8;

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/122.0 Safari/537.36';

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const offline = args.includes('--offline');
const refresh = args.includes('--refresh');

const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

const dateFr = iso => {
  const [a, m, j] = iso.slice(0, 10).split('-');
  return `${Number(j)} ${MOIS[Number(m) - 1]} ${a}`;
};

const escape = s => String(s)
  .replace(/&(?!(?:amp|lt|gt|quot|#\d+);)/g, '&amp;')
  .replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* mm:ss, ou h:mm:ss au-delà de l'heure. */
const duree = s => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  const pad = n => String(n).padStart(2, '0');
  return h ? `${h}:${pad(m)}:${pad(r)}` : `${m}:${pad(r)}`;
};

/* ---- 1. cache ---- */

if (!fs.existsSync(CACHE)) {
  console.error(`${path.relative(ROOT, CACHE)} est introuvable : impossible de savoir quelle chaîne suivre.`);
  process.exit(1);
}
const cache = JSON.parse(fs.readFileSync(CACHE, 'utf8'));
const cacheAvant = JSON.stringify(cache, null, 2);
const { chaine } = cache;
cache.videos = cache.videos || [];
cache.masquees = cache.masquees || [];

const connues = new Map(cache.videos.map(v => [v.id, v]));
/* Ce qui n'était pas encore là au démarrage : sert au message de commit. */
const nouvelles = [];

/* ---- 2. réseau ---- */

async function texte(url) {
  const r = await fetch(url, {
    headers: { 'User-Agent': UA, 'Accept-Language': 'fr-FR,fr;q=0.9' },
    signal: AbortSignal.timeout(20000)
  });
  if (!r.ok) throw new Error(`HTTP ${r.status} sur ${url}`);
  return r.text();
}

/* Le flux RSS de YouTube (15 dernières vidéos) est la source officielle, mais
   il met parfois une heure ou deux à voir une publication toute fraîche. La
   page /videos de la chaîne, elle, est à jour immédiatement : on s'en sert en
   complément, jamais à la place. Les deux listes sont fusionnées. */
async function listerIds() {
  const ids = [];
  const ajouter = id => { if (/^[\w-]{11}$/.test(id) && !ids.includes(id)) ids.push(id); };

  try {
    const rss = await texte(`https://www.youtube.com/feeds/videos.xml?channel_id=${chaine.id}`);
    for (const m of rss.matchAll(/<yt:videoId>([^<]+)<\/yt:videoId>/g)) ajouter(m[1]);
    console.log(`Flux RSS : ${ids.length} vidéo(s).`);
  } catch (e) {
    console.warn(`Flux RSS indisponible (${e.message}).`);
  }

  const avantPage = ids.length;
  try {
    const page = await texte(`https://www.youtube.com/channel/${chaine.id}/videos`);
    for (const m of page.matchAll(/"videoId":"([\w-]{11})"/g)) ajouter(m[1]);
    console.log(`Page de la chaîne : ${ids.length - avantPage} vidéo(s) que le flux n'avait pas.`);
  } catch (e) {
    console.warn(`Page de la chaîne indisponible (${e.message}).`);
  }

  return ids;
}

const champ = (html, cle) => {
  const m = html.match(new RegExp(`"${cle}":"((?:\\\\.|[^"\\\\])*)"`));
  if (!m) return null;
  try { return JSON.parse(`"${m[1]}"`); } catch { return null; }
};

/* Date au calendrier de Paris, pas à celui du serveur de YouTube. publishDate
   arrive avec le décalage de la côte ouest : une vidéo mise en ligne à 1 h du
   matin heure française y est encore datée de la veille. */
const dateParis = iso => new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit'
}).format(new Date(iso));

/* Les métadonnées vivent dans le JSON embarqué de la page de lecture. On les
   lit dans le bloc "videoDetails" et nulle part ailleurs : la page contient
   une douzaine de clés "title", dont celles des vidéos suggérées, et rien ne
   garantit que celle du lecteur reste la première. */
async function metadonnees(id) {
  const html = await texte(`https://www.youtube.com/watch?v=${id}`);
  const debut = html.indexOf('"videoDetails":{');
  if (debut === -1) throw new Error('bloc videoDetails introuvable (page de consentement ou vidéo privée ?)');
  const details = html.slice(debut, debut + 60000);

  /* La page de la chaîne peut lister une vidéo mise en avant qui n'est pas la
     sienne, et une URL peut rediriger. On vérifie donc que la page décrit bien
     la vidéo demandée, et qu'elle appartient bien à la chaîne suivie. */
  if (champ(details, 'videoId') !== id) throw new Error('la page décrit une autre vidéo');
  if (champ(details, 'channelId') !== chaine.id) throw new Error('vidéo publiée par une autre chaîne');

  const titre = champ(details, 'title');
  const secondes = Number(champ(details, 'lengthSeconds'));
  const description = champ(details, 'shortDescription') || '';
  /* publishDate n'apparaît qu'une fois dans la page, dans le microformat. */
  const publie = champ(html, 'publishDate') || champ(html, 'uploadDate');

  if (!titre || !publie || !secondes) {
    throw new Error(`métadonnées incomplètes (titre:${!!titre} date:${!!publie} durée:${!!secondes})`);
  }

  return {
    id,
    titre: titre.trim(),
    date: dateParis(publie),
    /* Horodatage complet conservé pour le JSON-LD : Google veut un uploadDate
       daté à l'heure et au fuseau, pas seulement au jour. */
    publie,
    secondes,
    /* La description YouTube contient liens, hashtags et sommaire : on ne garde
       que le premier paragraphe, qui sert d'accroche sous le titre. */
    accroche: description.split('\n').map(l => l.trim()).find(Boolean) || ''
  };
}

/* La CSP impose des images servies par le site. maxresdefault n'existe pas pour
   toutes les vidéos ; mqdefault, oui, et reste en 16/9 (hqdefault est en 4/3,
   avec des bandes noires). */
async function miniature(id) {
  fs.mkdirSync(THUMBS, { recursive: true });
  const dest = path.join(THUMBS, `${id}.jpg`);
  /* Une vignette déjà là ne se retélécharge pas, sauf --refresh : c'est le seul
     moyen de récupérer une vignette remplacée après coup sur YouTube. */
  if (fs.existsSync(dest) && !refresh) return false;

  for (const nom of ['maxresdefault', 'mqdefault']) {
    const r = await fetch(`https://i.ytimg.com/vi/${id}/${nom}.jpg`, {
      headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(20000)
    });
    if (!r.ok) continue;
    const buf = Buffer.from(await r.arrayBuffer());
    /* YouTube renvoie une image grise de 1 ko plutôt qu'un 404 quand la taille
       demandée n'existe pas : on la reconnaît à son poids. */
    if (buf.length < 3000) continue;
    if (!dry) fs.writeFileSync(dest, buf);
    console.log(`  miniature ${id} (${nom}, ${Math.round(buf.length / 1024)} ko)`);
    return true;
  }
  throw new Error(`aucune miniature exploitable pour ${id}`);
}

/* ---- 3. synchronisation ---- */

async function synchroniser() {
  const ids = await listerIds();
  if (!ids.length) {
    console.warn('Aucune vidéo remontée par YouTube. Le cache existant fait foi.');
    return;
  }

  for (const id of ids) {
    if (cache.masquees.includes(id)) continue;
    if (connues.has(id) && !refresh) continue;
    try {
      const v = await metadonnees(id);
      const etat = connues.has(id) ? 'mise à jour' : 'nouvelle';
      if (!connues.has(id)) nouvelles.push(v);
      connues.set(id, { ...connues.get(id), ...v });
      console.log(`  ${etat} : ${v.date}  ${v.titre}`);
    } catch (e) {
      /* Une vidéo illisible ne doit pas faire échouer les autres : si elle est
         déjà connue on garde l'ancienne fiche, sinon on la reverra demain. */
      console.warn(`  ${id} ignorée : ${e.message}`);
    }
  }

  cache.videos = [...connues.values()]
    .filter(v => !cache.masquees.includes(v.id))
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));

  for (const v of cache.videos) {
    try { await miniature(v.id); }
    catch (e) { console.warn(`  ${e.message}`); }
  }
}

/* ---- 4. rendu ---- */

const urlVideo = id => `https://www.youtube.com/watch?v=${id}`;

/* Une carte = un lien vers YouTube. Pas d'iframe : la CSP interdit les cadres
   tiers, et une vue comptée sur YouTube vaut mieux qu'une vue perdue ici.
   Les conteneurs sont des <div> et non des <span> : un <h3> et un <p> ne sont
   pas du contenu de phrase, un <a> peut les porter, un <span> non. */
function carte(v, i, pressee) {
  /* Sur /videos, les deux premières miniatures sont visibles d'emblée : les
     différer retarderait le plus gros élément affiché. Sur l'accueil, la
     section est loin sous la ligne de flottaison, tout part en différé. */
  const chargement = pressee && i < 2 ? 'eager' : 'lazy';
  const brut = v.accroche.length > 130 ? v.accroche.slice(0, 127).trimEnd() + '…' : v.accroche;
  const accroche = v.accroche ? `\n              <p>${escape(brut)}</p>` : '';
  return `        <li class="yt-card">
          <a href="${urlVideo(v.id)}" target="_blank" rel="noopener">
            <div class="yt-thumb">
              <img src="/images/youtube/${v.id}.jpg" alt="" width="1280" height="720" loading="${chargement}" decoding="async">
              <span class="yt-dur"><span class="sr-only">Durée : </span>${duree(v.secondes)}</span>
            </div>
            <div class="yt-body">
              <h3>${escape(v.titre)}</h3>${accroche}
              <time datetime="${v.date}">${dateFr(v.date)}</time>
              <span class="sr-only">Voir sur YouTube, dans un nouvel onglet.</span>
            </div>
          </a>
        </li>`;
}

/* Rail à défilement natif : sans JavaScript il reste utilisable au doigt, à la
   molette et au clavier (les cartes sont des liens, le navigateur fait défiler
   le conteneur en les atteignant). site.js n'ajoute que les flèches, qui
   arrivent [hidden] pour ne jamais s'afficher inertes. */
function carrousel(videos, pressee) {
  return `  <div class="yt-carousel rv">
    <div class="yt-rail">
      <ul class="yt-set">
${videos.map((v, i) => carte(v, i, pressee)).join('\n')}
      </ul>
    </div>
  </div>`;
}

const FLECHES = `        <div class="yt-controls">
          <button class="yt-nav prev" type="button" aria-label="Vidéos précédentes" hidden>←</button>
          <button class="yt-nav next" type="button" aria-label="Vidéos suivantes" hidden>→</button>
        </div>`;

function sectionAccueil(videos) {
  const n = videos.length;
  const compte = n > MAX_ACCUEIL
    ? `Les ${MAX_ACCUEIL} dernières, et tout le reste sur la page vidéos.`
    : n > 1 ? `${n} vidéos publiées, une nouvelle chaque semaine.`
      : 'La chaîne démarre : une nouvelle vidéo chaque semaine.';

  return `<section class="section yt-sec" id="videos" aria-labelledby="yt-title" data-carousel>
  <div class="wrap">
    <div class="section-head rv">
      <div>
        <span class="eyebrow">YouTube</span>
        <h2 id="yt-title">Le SEO à l'ère de l'IA,<br>en vidéo.</h2>
      </div>
      <div class="yt-aside">
        <p>SEO, GEO, automatisation : des tutos concrets, applicables le jour même. ${compte}</p>
${FLECHES}
      </div>
    </div>
  </div>

${carrousel(videos.slice(0, MAX_ACCUEIL), false)}

  <div class="wrap yt-footer rv">
    <a class="btn btn-lime" href="${chaine.url}?sub_confirmation=1" target="_blank" rel="noopener">S'abonner à la chaîne <span class="ar">→</span></a>
    <a class="btn btn-outline" href="/videos">Toutes les vidéos <span class="ar">→</span></a>
  </div>
</section>`;
}

function fragmentVideos(videos) {
  const n = videos.length;
  return `<section class="page-hero">
  <div class="wrap">
    <nav class="crumbs" aria-label="Fil d'ariane"><a href="/">Accueil</a><span>›</span><span>Vidéos</span></nav>
    <span class="eyebrow">YouTube</span>
    <h1>Le SEO à l'ère de l'IA,<br><em>en vidéo.</em></h1>
    <p class="lede">SEO, GEO, automatisation IA et coulisses de mes missions. Des tutos concrets que vous pouvez appliquer le jour même, zéro blabla.</p>
    <div class="hero-ctas">
      <a class="btn btn-lime" href="${chaine.url}?sub_confirmation=1" target="_blank" rel="noopener">S'abonner à la chaîne <span class="ar">→</span></a>
    </div>
  </div>
</section>

<section class="section yt-sec" style="padding-top:90px;border-radius:0" aria-labelledby="yt-title" data-carousel>
  <div class="wrap">
    <div class="section-head rv">
      <div>
        <span class="eyebrow">${n > 1 ? 'Toutes les vidéos' : 'Dernière vidéo'}</span>
        <h2 id="yt-title">${n > 1 ? `${n} vidéos à regarder` : 'La première est en ligne'}</h2>
      </div>
      <div class="yt-aside">
        <p>Chaque vidéo part d'un cas réel rencontré en mission. Une nouvelle chaque semaine.</p>
${FLECHES}
      </div>
    </div>
  </div>

${carrousel(videos, true)}

  <div class="wrap yt-footer rv">
    <a class="btn btn-lime" href="${chaine.url}?sub_confirmation=1" target="_blank" rel="noopener">S'abonner sur YouTube <span class="ar">→</span></a>
    <span>Une nouvelle vidéo chaque semaine.</span>
  </div>
</section>

<section class="section blog-sec">
  <div class="wrap">
    <div class="section-head rv">
      <div><span class="eyebrow">À lire aussi</span><h2>Les mêmes sujets, à lire</h2></div>
      <a class="btn btn-dark" href="/blog/">Voir le blog <span class="ar">→</span></a>
    </div>
    <div class="post-grid">
      <!-- derniers-articles -->
    </div>
  </div>
</section>

<div class="final">
  <div class="final-box rv">
    <span class="eyebrow">Contact</span>
    <h2>Un sujet que vous aimeriez<br>voir <em>traité en vidéo ?</em></h2>
    <p>Proposez-le, les meilleures questions deviennent des vidéos.</p>
    <a class="btn btn-lime" href="/contact">Proposer un sujet <span class="ar">→</span></a>
  </div>
</div>
`;
}

/* ---- 5. écriture ---- */

function remplacerEntreBalises(html, contenu, fichier) {
  const re = /(<!-- yt:debut -->)[\s\S]*?(<!-- yt:fin -->)/;
  if (!re.test(html)) {
    console.error(`Balises <!-- yt:debut --> / <!-- yt:fin --> introuvables dans ${fichier}. Rien n'a été modifié.`);
    process.exit(1);
  }
  return html.replace(re, `$1\n${contenu}\n$2`);
}

function majSitemap(sitemap, lastmod) {
  const ligne = `  <url><loc>${ORIGIN}/videos</loc><lastmod>${lastmod}</lastmod><priority>0.7</priority></url>`;
  const lignes = sitemap.split('\n').filter(l => !/<loc>[^<]*\/videos<\/loc>/.test(l));
  const fin = lignes.findIndex(l => l.includes('</urlset>'));
  if (fin === -1) {
    console.error('Balise </urlset> introuvable dans sitemap.xml. Rien n\'a été modifié.');
    process.exit(1);
  }
  /* /videos se range avec les autres pages transverses, avant les articles. */
  const avantBlog = lignes.findIndex(l => l.includes('/blog/'));
  lignes.splice(avantBlog === -1 ? fin : avantBlog, 0, ligne);
  return lignes.join('\n');
}

(async () => {
  if (!offline) await synchroniser();
  else console.log('--offline : régénération depuis youtube.json, aucun appel réseau.');

  const videos = cache.videos;
  if (!videos.length) {
    console.error('Aucune vidéo connue : rien à afficher. Vérifiez chaine.id dans youtube.json.');
    process.exit(1);
  }

  console.log(`\n${videos.length} vidéo(s) en ligne :`);
  for (const v of videos) console.log(`  ${v.date}  ${duree(v.secondes).padStart(7)}  ${v.titre}`);

  const index = fs.readFileSync(INDEX, 'utf8');
  const indexApres = remplacerEntreBalises(index, sectionAccueil(videos), 'index.html');

  const fragAvant = fs.existsSync(FRAG_VIDEOS) ? fs.readFileSync(FRAG_VIDEOS, 'utf8') : '';
  const fragApres = fragmentVideos(videos);

  const sitemapAvant = fs.readFileSync(SITEMAP, 'utf8');
  const sitemapApres = majSitemap(sitemapAvant, videos[0].date);

  const cacheApres = JSON.stringify(cache, null, 2) + '\n';

  const changements = [
    ['index.html', index !== indexApres],
    ['_fragments/videos.html', fragAvant !== fragApres],
    ['sitemap.xml', sitemapAvant !== sitemapApres],
    ['_fragments/youtube.json', cacheAvant !== JSON.stringify(cache, null, 2)]
  ].filter(([, change]) => change).map(([f]) => f);

  if (!changements.length) {
    console.log('\nTout est déjà à jour, rien à écrire.');
    process.exit(0);
  }

  if (dry) {
    console.log(`\n--dry : aucun fichier écrit. À mettre à jour : ${changements.join(', ')}`);
    process.exit(0);
  }

  fs.writeFileSync(CACHE, cacheApres);
  fs.writeFileSync(INDEX, indexApres);
  fs.writeFileSync(FRAG_VIDEOS, fragApres);
  fs.writeFileSync(SITEMAP, sitemapApres);

  execFileSync('node', ['build-pages.js'], { cwd: FRAGMENTS, stdio: 'inherit' });

  console.log(`\nMis à jour : ${changements.join(', ')} (+ pages régénérées).`);

  if (process.env.GITHUB_OUTPUT) {
    /* Un titre peut contenir un retour à la ligne : il casserait le format
       clé=valeur de GITHUB_OUTPUT. */
    const propre = t => t.replace(/\s+/g, ' ').trim();
    fs.appendFileSync(process.env.GITHUB_OUTPUT,
      `total=${videos.length}\nnouvelles=${nouvelles.map(v => propre(v.titre)).join(' · ')}\n`);
  }
})().catch(e => {
  console.error(`\nÉchec : ${e.message}`);
  process.exit(1);
});
