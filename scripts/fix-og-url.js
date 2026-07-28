#!/usr/bin/env node
'use strict';

/**
 * fix-og-url.js : aligne og:url (et twitter:url si présent) sur le canonical.
 *
 * Sur les pages de villes/, og:url valait l'URL du SILO et non celle de la page :
 * les 99 pages audit-seo-{ville} annonçaient toutes og:url=/audit-seo.
 * Un partage social de n'importe quelle page ville pointait donc vers la même URL.
 *
 * L'URL de référence est le rel=canonical de la page quand il existe, sinon
 * elle est dérivée du chemin du fichier. Le canonical manquant est ajouté.
 *
 * Usage :
 *   node scripts/fix-og-url.js            corrige
 *   node scripts/fix-og-url.js --dry-run  rapport seul
 */

const fs = require('fs');
const path = require('path');
const L = require('./lib/slugs.js');

const dryRun = process.argv.includes('--dry-run');
const HOTE = 'https://anthony-courtin.com';

// Pages hors périmètre : vérification Google et page d'erreur.
const EXCLUS = new Set(['googled3845672a2c3301a.html', '404.html']);
const DOSSIERS_IGNORES = new Set(['.git', 'node_modules', '_refonte', 'scripts', 'build']);

function fichiersHtml(dossier = L.RACINE, acc = []) {
    for (const e of fs.readdirSync(dossier, { withFileTypes: true })) {
        if (DOSSIERS_IGNORES.has(e.name)) continue;
        const abs = path.join(dossier, e.name);
        if (e.isDirectory()) fichiersHtml(abs, acc);
        else if (e.name.endsWith('.html') && !EXCLUS.has(e.name)) acc.push(abs);
    }
    return acc;
}

/** URL canonique déduite de l'emplacement du fichier. */
function urlDepuisChemin(rel) {
    const url = '/' + rel.split(path.sep).join('/');
    if (url.endsWith('/index.html')) return HOTE + url.slice(0, -'index.html'.length);
    return HOTE + url.replace(/\.html$/, '');
}

let corriges = 0;
let canonicalAjoutes = 0;
let dejaBons = 0;
const divergences = [];

for (const abs of fichiersHtml()) {
    const rel = path.relative(L.RACINE, abs);
    let contenu = fs.readFileSync(abs, 'utf8');
    const attendueParChemin = urlDepuisChemin(rel);

    const mCanon = contenu.match(/<link\s+rel="canonical"\s+href="([^"]*)"\s*\/?>/i);
    const reference = mCanon ? mCanon[1] : attendueParChemin;

    // Un canonical qui ne correspond pas à l'emplacement du fichier est un
    // signal à remonter, pas à corriger en silence.
    if (mCanon && mCanon[1] !== attendueParChemin) {
        divergences.push({ fichier: rel, canonical: mCanon[1], attendu: attendueParChemin });
    }

    let modifie = false;

    // 1. og:url
    const mOg = contenu.match(/<meta\s+property="og:url"\s+content="([^"]*)"\s*\/?>/i);
    if (mOg) {
        if (mOg[1] !== reference) {
            contenu = contenu.replace(
                mOg[0],
                `<meta property="og:url" content="${reference}">`
            );
            modifie = true;
        } else dejaBons++;
    } else if (contenu.includes('property="og:title"')) {
        // og:url absent alors que le bloc Open Graph existe : on l'insère
        // juste avant og:title pour rester lisible.
        contenu = contenu.replace(
            /(<meta\s+property="og:title")/i,
            `<meta property="og:url" content="${reference}">\n    $1`
        );
        modifie = true;
    }

    // 2. twitter:url, quand la balise existe
    const mTw = contenu.match(/<meta\s+(?:property|name)="twitter:url"\s+content="([^"]*)"\s*\/?>/i);
    if (mTw && mTw[1] !== reference) {
        contenu = contenu.replace(mTw[0], `<meta property="twitter:url" content="${reference}">`);
        modifie = true;
    }

    // 3. canonical manquant
    if (!mCanon) {
        contenu = contenu.replace(
            /(<\/title>)/i,
            `$1\n    <link rel="canonical" href="${attendueParChemin}">`
        );
        canonicalAjoutes++;
        modifie = true;
    }

    if (!modifie) continue;
    corriges++;
    if (!dryRun) fs.writeFileSync(abs, contenu, 'utf8');
}

console.log(`${dryRun ? '[dry-run] ' : ''}pages corrigées      : ${corriges}`);
console.log(`${dryRun ? '[dry-run] ' : ''}og:url déjà corrects : ${dejaBons}`);
console.log(`${dryRun ? '[dry-run] ' : ''}canonical ajoutés    : ${canonicalAjoutes}`);

if (divergences.length) {
    console.log(`\nCANONICAL DIVERGEANT DE L'EMPLACEMENT : ${divergences.length}`);
    for (const d of divergences.slice(0, 15)) {
        console.log(`  ${d.fichier}\n    canonical : ${d.canonical}\n    attendu   : ${d.attendu}`);
    }
    if (divergences.length > 15) console.log(`  … et ${divergences.length - 15} autres`);
}
