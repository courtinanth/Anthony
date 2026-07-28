#!/usr/bin/env node
'use strict';

/**
 * build-css.js — assemble css/src/*.css en un seul css/main.css.
 *
 * Pourquoi concaténer plutôt que @import : en CSS, @import est bloquant ET
 * sérialisé — le navigateur doit télécharger main.css, l'analyser, puis
 * découvrir et télécharger chaque fichier importé, l'un après l'autre. Sur une
 * cible LCP < 2 s, ça coûte un aller-retour réseau par fichier. Un seul
 * fichier = une seule requête.
 *
 * Le script fait aussi une chose que le CSS ne sait pas faire : le bloc de
 * mode sombre est écrit une seule fois dans tokens.css, entre les marqueurs
 * @sombre:debut et @sombre:fin, puis émis pour les DEUX sélecteurs
 * (préférence système et bascule manuelle). Ils ne peuvent donc pas diverger.
 *
 * Usage :
 *   node scripts/build-css.js            écrit css/main.css
 *   node scripts/build-css.js --dry-run  affiche le bilan sans écrire
 */

const fs = require('fs');
const path = require('path');

const RACINE = path.join(__dirname, '..');
const SRC = path.join(RACINE, 'css', 'src');
const SORTIE = path.join(RACINE, 'css', 'main.css');
const BUDGET_KO = 25;

const dryRun = process.argv.includes('--dry-run');

// L'ordre des couches, tel que déclaré en tête de fichier.
const COUCHES = ['reset', 'tokens', 'base', 'layout', 'components', 'utilities'];

/** Développe le bloc @sombre en deux règles jumelles. */
function developperModeSombre(css) {
    const debut = css.indexOf('/* @sombre:debut */');
    const fin = css.indexOf('/* @sombre:fin */');
    if (debut === -1 || fin === -1) return css;

    const corps = css
        .slice(debut + '/* @sombre:debut */'.length, fin)
        .replace(/^\s*\n/, '')
        .replace(/\s*$/, '');

    // Réindente proprement pour chaque niveau d'imbrication.
    const reindenter = (texte, niveau) =>
        texte
            .split('\n')
            .map((l) => (l.trim() ? ' '.repeat(niveau) + l.trim().replace(/^\s+/, '') : ''))
            .join('\n');

    const genere = [
        '  /* Généré par scripts/build-css.js depuis le bloc @sombre de css/src/tokens.css. */',
        '',
        '  @media (prefers-color-scheme: dark) {',
        '    :root:not([data-theme="light"]) {',
        reindenter(corps, 6),
        '    }',
        '  }',
        '',
        '  :root[data-theme="dark"] {',
        reindenter(corps, 4),
        '  }',
    ].join('\n');

    return css.slice(0, debut) + genere + css.slice(fin + '/* @sombre:fin */'.length);
}

/**
 * Retire commentaires et blancs superflus. Écrit à la main plutôt qu'avec une
 * dépendance : le besoin tient en trente lignes, et le CSS livré doit rester
 * lisible en cas de débogage (on garde les sauts de ligne entre règles).
 * L'analyse est caractère par caractère pour ne jamais toucher au contenu
 * d'une chaîne — un « /* » dans un content: ne doit pas ouvrir un commentaire.
 */
function alleger(css) {
    let out = '';
    let i = 0;
    let chaine = null;
    while (i < css.length) {
        const c = css[i];
        const suivant = css[i + 1];
        if (chaine) {
            out += c;
            if (c === '\\') { out += suivant ?? ''; i += 2; continue; }
            if (c === chaine) chaine = null;
            i++;
            continue;
        }
        if (c === '"' || c === "'") { chaine = c; out += c; i++; continue; }
        if (c === '/' && suivant === '*') {
            const fin = css.indexOf('*/', i + 2);
            i = fin === -1 ? css.length : fin + 2;
            continue;
        }
        out += c;
        i++;
    }
    return out
        .replace(/[ \t]+/g, ' ')          // blancs multiples
        .replace(/ *\n[ \n]*/g, '\n')     // lignes vides laissées par les commentaires
        .replace(/ ?([{:;,]) ?/g, '$1')   // blancs autour de la ponctuation
        .replace(/;\}/g, '}')             // dernier point-virgule d'un bloc
        .replace(/\n\}/g, '}')
        .replace(/\}\n?/g, '}\n')
        .trim();
}

const entete = [
    '/* =========================================================================',
    '   anthony-courtin.com — feuille de style unique',
    '   GÉNÉRÉ par scripts/build-css.js — ne pas éditer.',
    '   Les sources sont dans css/src/, une par couche.',
    '   ========================================================================= */',
    '',
    `@layer ${COUCHES.join(', ')};`,
    '',
].join('\n');

const morceaux = [entete];
const tailles = [];

for (const couche of COUCHES) {
    const fichier = path.join(SRC, `${couche}.css`);
    if (!fs.existsSync(fichier)) {
        console.error(`Manquant : css/src/${couche}.css`);
        process.exit(1);
    }
    let css = fs.readFileSync(fichier, 'utf8');
    if (couche === 'tokens') css = developperModeSombre(css);
    tailles.push({ couche, octets: Buffer.byteLength(css, 'utf8') });
    morceaux.push(css.trimEnd(), '');
}

const brut = morceaux.join('\n');
const resultat = entete + alleger(brut.slice(entete.length)) + '\n';
const octets = Buffer.byteLength(resultat, 'utf8');
const ko = octets / 1024;
const koBrut = Buffer.byteLength(brut, 'utf8') / 1024;
const koGzip = require('zlib').gzipSync(resultat).length / 1024;

// Contrôle : aucune valeur hexadécimale hors de la couche tokens.
const fautives = [];
for (const couche of COUCHES) {
    if (couche === 'tokens') continue;
    const css = fs.readFileSync(path.join(SRC, `${couche}.css`), 'utf8');
    for (const ligne of css.split('\n')) {
        const sansCommentaire = ligne.replace(/\/\*.*?\*\//g, '');
        const m = sansCommentaire.match(/#[0-9a-fA-F]{3,8}\b/);
        if (m && !/url\(|['"]#/.test(sansCommentaire)) {
            fautives.push({ couche, ligne: ligne.trim().slice(0, 80), valeur: m[0] });
        }
    }
}

if (!dryRun) fs.writeFileSync(SORTIE, resultat, 'utf8');

console.log(`${dryRun ? '[dry-run] ' : ''}css/main.css`);
console.log(`  sources commentées : ${koBrut.toFixed(1)} Ko`);
console.log(`  livré (allégé)     : ${ko.toFixed(1)} Ko   (budget ${BUDGET_KO} Ko)`);
console.log(`  sur le réseau (gzip) : ${koGzip.toFixed(1)} Ko`);
console.log('  par couche, en source :');
for (const t of tailles) {
    console.log(`    ${t.couche.padEnd(12)} ${(t.octets / 1024).toFixed(1).padStart(6)} Ko`);
}

if (fautives.length) {
    console.log(`\nVALEURS HEXADÉCIMALES HORS TOKENS : ${fautives.length}`);
    for (const f of fautives.slice(0, 10)) console.log(`  ${f.couche}.css  ${f.valeur}  ${f.ligne}`);
    process.exit(1);
}

if (ko > BUDGET_KO) {
    console.log(`\nBUDGET DÉPASSÉ : ${ko.toFixed(1)} Ko > ${BUDGET_KO} Ko`);
    process.exit(1);
}
