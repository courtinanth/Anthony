#!/usr/bin/env node
'use strict';

/**
 * build-redirects.js : génère le fichier _redirects de la phase 0.
 *
 * Contenu, dans l'ordre d'évaluation de Netlify (première règle qui matche gagne) :
 *   1. 410 sur /templates/* et /build/*  : artefacts de build, aucune valeur SEO
 *   2. 301 des slugs cassés vers leur slug canonique, en deux formes :
 *      l'URL propre ET l'URL en .html, pour qu'aucune requête ne fasse deux sauts
 *   3. 301 explicites .html -> URL propre pour les pages hors villes/
 *      (le motif générique /*.html ne matche pas chez Netlify, voir plus bas)
 *
 * Ce fichier est remplacé en phase 4 par le plan complet de _refonte/.
 *
 * Usage :
 *   node scripts/build-redirects.js            écrit _redirects
 *   node scripts/build-redirects.js --dry-run  affiche sans écrire
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const L = require('./lib/slugs.js');

const dryRun = process.argv.includes('--dry-run');

// On réutilise le manifeste d'audit-slugs.js plutôt que de recalculer :
// une seule source de vérité pour la liste des redirections.
const manifeste = JSON.parse(
    execFileSync('node', [path.join(__dirname, 'audit-slugs.js'), '--json'], {
        encoding: 'utf8',
        maxBuffer: 32 * 1024 * 1024,
    })
);

const regles = [...manifeste.aCorriger, ...manifeste.sansFichier]
    .map((e) => ({ source: e.source, destination: e.destination }))
    .sort((a, b) => a.source.localeCompare(b.source));

// Dédoublonnage : une variante cassée peut apparaître dans les deux listes.
const vues = new Set();
const uniques = regles.filter((r) => {
    if (vues.has(r.source)) return false;
    vues.add(r.source);
    return true;
});

/**
 * Pages hors villes/ à rediriger de leur .html vers l'URL propre.
 * Exclusions : le fichier de vérification Google, qui doit rester joignable en
 * .html, et 404.html, que Netlify sert directement.
 */
function pagesPropres() {
    const EXCLUS = new Set(['googled3845672a2c3301a.html', '404.html']);
    const out = [];
    const ajouter = (dossier) => {
        const abs = dossier ? path.join(L.RACINE, dossier) : L.RACINE;
        for (const f of fs.readdirSync(abs).sort()) {
            if (!f.endsWith('.html') || EXCLUS.has(f)) continue;
            const prefixe = dossier ? `/${dossier}/` : '/';
            const source = prefixe + f;
            // index.html pointe vers la racine du dossier, pas vers « /index »
            const destination = f === 'index.html' ? prefixe : prefixe + f.replace(/\.html$/, '');
            out.push({ source, destination });
        }
    };
    ajouter('');
    ajouter('blog');
    return out;
}

const lignes = [];

// Largeur de colonne calculée sur la plus longue source réellement présente :
// un padEnd() à largeur fixe collerait source et destination dès qu'une source
// dépasse la largeur, et Netlify rejette alors la règle.
const LARGEUR = Math.max(
    ...uniques.map((r) => r.source.length + 5),
    ...uniques.map((r) => r.destination.length),
    24
) + 2;
const col = (s) => s.padEnd(LARGEUR);

lignes.push('# ============================================================');
lignes.push('# anthony-courtin.com : redirections, phase 0 (assainissement)');
lignes.push('# Généré par scripts/build-redirects.js : ne pas éditer à la main.');
lignes.push('# Remplacé en phase 4 par _refonte/04-netlify-_redirects.txt.');
lignes.push('# ============================================================');
lignes.push('');
lignes.push('# --- 1. Artefacts de build : supprimés, donc 410 Gone ---');
lignes.push(col('/templates/*') + col('/404.html') + '410!');
lignes.push(col('/build/*') + col('/404.html') + '410!');
lignes.push('');
lignes.push(`# --- 2. Slugs cassés -> slugs canoniques (${uniques.length} villes×services) ---`);
lignes.push('# Les accents étaient supprimés au lieu d\'être translittérés :');
lignes.push('# /villes/audit-seo-mrignac -> /villes/audit-seo-merignac');
lignes.push('# Les deux formes sont listées pour éviter toute chaîne de redirection.');
for (const r of uniques) {
    lignes.push(col(r.source) + col(r.destination) + '301!');
    lignes.push(col(r.source + '.html') + col(r.destination) + '301!');
}
lignes.push('');
lignes.push('# --- 3. URL en .html -> URL propre ---');
lignes.push('# ATTENTION : le motif « /*.html » ne fonctionne PAS. Netlify n\'accepte');
lignes.push('# le splat qu\'en fin de motif ; « /*.html » est accepté au parsing mais ne');
lignes.push('# matche jamais. La règle équivalente qui vivait dans netlify.toml était');
lignes.push('# donc morte : chaque page est aujourd\'hui servie en 200 à la fois sur');
lignes.push('# /contact et /contact.html. Les règles ci-dessous sont donc explicites.');
lignes.push('#');
lignes.push('# Les pages de villes/ ne sont pas listées : elles portent toutes un');
lignes.push('# canonical vers l\'URL propre et disparaissent en phase 4. Les lister');
lignes.push('# ajouterait 694 règles pour un mois d\'existence.');
for (const p of pagesPropres()) {
    lignes.push(col(p.source) + col(p.destination) + '301!');
}
lignes.push('');

const contenu = lignes.join('\n');
const cible = path.join(L.RACINE, '_redirects');

if (dryRun) {
    process.stdout.write(contenu);
    console.error(
        `\n[dry-run] ${uniques.length * 2 + 2 + pagesPropres().length} règles ; _redirects non écrit.`
    );
} else {
    fs.writeFileSync(cible, contenu, 'utf8');
    console.log(`_redirects écrit : ${uniques.length * 2 + 2 + pagesPropres().length} règles.`);
    console.log(`  410 : 2 (/templates/*, /build/*)`);
    console.log(`  301 slugs cassés : ${uniques.length * 2} (${uniques.length} URL × 2 formes)`);
    console.log(`  301 .html -> URL propre : ${pagesPropres().length}`);
}
