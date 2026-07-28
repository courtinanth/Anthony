#!/usr/bin/env node
'use strict';

/**
 * fix-internal-links.js — réécrit tous les liens internes en chemin absolu
 * sans extension.
 *
 *   ../audit-seo-bordeaux.html   ->  /audit-seo-bordeaux
 *   ../index.html                ->  /
 *   villes/agence-seo-talence.html -> /villes/agence-seo-talence
 *   ../villes/audit-seo-mrignac.html -> /villes/audit-seo-merignac   (slug remappé)
 *
 * Pourquoi : le site sert aujourd'hui chaque page sur deux URL en 200
 * (/contact et /contact.html). Les liens relatifs en .html désignent la
 * variante non canonique et diluent le maillage interne.
 *
 * Le fichier de vérification Google (googled…​.html) est exclu : son URL doit
 * rester en .html.
 *
 * Usage :
 *   node scripts/fix-internal-links.js            réécrit
 *   node scripts/fix-internal-links.js --dry-run  rapport seul
 */

const fs = require('fs');
const path = require('path');
const L = require('./lib/slugs.js');

const dryRun = process.argv.includes('--dry-run');
const verbeux = process.argv.includes('--verbose');

const EXCLUS_CIBLE = new Set(['/googled3845672a2c3301a.html']);
const DOSSIERS_IGNORES = new Set(['.git', 'node_modules', '_refonte', 'scripts']);

const table = L.tableSlugsCasses();

/** Liste récursive des fichiers .html du site. */
function fichiersHtml(dossier = L.RACINE, acc = []) {
    for (const e of fs.readdirSync(dossier, { withFileTypes: true })) {
        if (DOSSIERS_IGNORES.has(e.name)) continue;
        const abs = path.join(dossier, e.name);
        if (e.isDirectory()) fichiersHtml(abs, acc);
        else if (e.name.endsWith('.html')) acc.push(abs);
    }
    return acc;
}

/**
 * Transforme une URL de lien en chemin absolu sans extension.
 * Renvoie null si le lien ne doit pas être touché.
 */
function reecrire(lien, urlDuFichier) {
    // On ne touche ni aux absolus externes, ni aux ancres, ni aux protocoles.
    if (!lien || /^(https?:|mailto:|tel:|#|\/\/|data:)/i.test(lien)) return null;

    const [, chemin, suffixe = ''] = lien.match(/^([^?#]*)([?#].*)?$/);
    if (!chemin) return null;

    // Résolution du relatif par rapport au dossier de la page courante.
    const base = path.posix.dirname(urlDuFichier);
    let absolu = path.posix.resolve(base, chemin);

    if (EXCLUS_CIBLE.has(absolu)) return null;

    // Remappage des slugs cassés vers le slug canonique, que le lien porte
    // l'extension ou non.
    const m = absolu.match(/^\/villes\/([^/]+?)(\.html)?$/);
    if (m) {
        const decoupe = L.decouper(m[1]);
        if (decoupe && table.has(decoupe.slug)) {
            absolu = `/villes/${decoupe.service}-${table.get(decoupe.slug).canonique}${m[2] || ''}`;
        }
    }

    // index.html désigne la racine de son dossier, pas « /dossier/index ».
    if (absolu.endsWith('/index.html')) absolu = absolu.slice(0, -'index.html'.length);
    else absolu = absolu.replace(/\.html$/, '');

    // Une URL qui désigne un dossier doit garder son slash final : le canonical
    // de blog/index.html est « /blog/ », et « /blog » comme « /blog/ » répondent
    // tous deux en 200. Sans ce rattrapage on recrée un duplicate — d'autant que
    // path.posix.resolve() supprime le slash final de « ../blog/ ».
    if (
        !absolu.endsWith('/') &&
        fs.existsSync(path.join(L.RACINE, absolu, 'index.html'))
    ) {
        absolu += '/';
    }

    return absolu + suffixe;
}

/**
 * Les URL absolues du site écrites en dur (formulaires Netlify « _next »,
 * boutons de partage Twitter/LinkedIn) pointent vers la variante .html.
 * On les nettoie aussi, sinon un partage social propage l'URL non canonique.
 */
function nettoyerUrlsAbsolues(contenu) {
    return contenu.replace(
        /(https:\/\/anthony-courtin\.com)(\/[A-Za-z0-9\-_/]*?)\.html/g,
        (entier, hote, chemin) => {
            if (EXCLUS_CIBLE.has(chemin + '.html')) return entier;
            if (chemin.endsWith('/index')) return hote + chemin.slice(0, -'index'.length);
            return hote + chemin;
        }
    );
}

const fichiers = fichiersHtml();
let fichiersModifies = 0;
let liensReecrits = 0;
let liensRemappes = 0;
let urlsAbsoluesNettoyees = 0;
const nonResolus = [];

for (const abs of fichiers) {
    const rel = path.relative(L.RACINE, abs);
    let urlDuFichier = '/' + rel.split(path.sep).join('/');

    // Les templates de build/templates/ ne sont pas des pages : leurs liens
    // relatifs (« ../contact.html ») sont écrits du point de vue de la page
    // GÉNÉRÉE, qui atterrit dans villes/. On résout donc depuis villes/,
    // sinon « ../ » remonterait à /build et produirait des URL absurdes.
    if (rel.startsWith('build' + path.sep + 'templates' + path.sep)) {
        urlDuFichier = '/villes/' + path.basename(rel);
    }
    const avant = fs.readFileSync(abs, 'utf8');
    let compteur = 0;

    let apres = avant.replace(/(href|src)="([^"]*)"/g, (entier, attr, lien) => {
        const neuf = reecrire(lien, urlDuFichier);
        if (neuf === null || neuf === lien) return entier;
        compteur++;
        if (/mrignac|bgles|-mdoc|-prs-|hlne|-andr-|loubs|lge-|lognan|canjan|czac|cron|ambs|ars$|monsgur|la-brde|la-role|belin-bliet|villenave-d-ornon/.test(lien)) {
            liensRemappes++;
        }
        return `${attr}="${neuf}"`;
    });

    const avantAbsolues = apres;
    apres = nettoyerUrlsAbsolues(apres);
    if (apres !== avantAbsolues) {
        urlsAbsoluesNettoyees += (avantAbsolues.match(/anthony-courtin\.com\/[A-Za-z0-9\-_/]*\.html/g) || []).length;
        compteur++;
    }

    if (compteur === 0) continue;
    fichiersModifies++;
    liensReecrits += compteur;
    if (!dryRun) fs.writeFileSync(abs, apres, 'utf8');
    if (verbeux) console.log(`  ${rel} : ${compteur} liens`);
}

// Contrôle : plus aucun lien interne ne doit pointer vers un fichier absent.
if (!dryRun) {
    for (const abs of fichiersHtml()) {
        const contenu = fs.readFileSync(abs, 'utf8');
        for (const [, lien] of contenu.matchAll(/href="(\/[^"#?]*)"/g)) {
            if (/^\/(css|js|images|img|fonts)\//.test(lien)) continue;
            const candidats = [
                path.join(L.RACINE, lien + '.html'),
                path.join(L.RACINE, lien, 'index.html'),
                path.join(L.RACINE, lien),
            ];
            if (!candidats.some((c) => fs.existsSync(c))) {
                nonResolus.push({ fichier: path.relative(L.RACINE, abs), lien });
            }
        }
    }
}

console.log(`${dryRun ? '[dry-run] ' : ''}fichiers scannés   : ${fichiers.length}`);
console.log(`${dryRun ? '[dry-run] ' : ''}fichiers modifiés   : ${fichiersModifies}`);
console.log(`${dryRun ? '[dry-run] ' : ''}liens réécrits      : ${liensReecrits}`);
console.log(`${dryRun ? '[dry-run] ' : ''}dont slugs remappés : ${liensRemappes}`);
console.log(`${dryRun ? '[dry-run] ' : ''}URL absolues .html  : ${urlsAbsoluesNettoyees}`);

if (nonResolus.length) {
    const uniques = [...new Set(nonResolus.map((n) => n.lien))];
    console.log(`\nLIENS INTERNES SANS CIBLE : ${nonResolus.length} occurrences, ${uniques.length} URL`);
    for (const u of uniques.slice(0, 20)) {
        const n = nonResolus.filter((x) => x.lien === u).length;
        console.log(`  ${u}  (${n}×, ex. ${nonResolus.find((x) => x.lien === u).fichier})`);
    }
    if (uniques.length > 20) console.log(`  … et ${uniques.length - 20} autres`);
    process.exit(1);
}
