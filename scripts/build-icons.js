#!/usr/bin/env node
'use strict';

/**
 * build-icons.js : assemble img/icons.svg, sprite unique référencé par <use>.
 *
 * Remplace deux choses :
 *   - les emoji utilisés comme icônes de service (🔍 ⚙️ 🔗 📍 ✍️ 🎭), qui
 *     rendent différemment sur chaque système et sont lus à voix haute par les
 *     lecteurs d'écran ;
 *   - le SVG LinkedIn inline, dupliqué deux fois par page sur tout le site.
 *
 * Source : lucide-static (ISC), en dépendance de dev. Le paquet n'est pas
 * livré : seules les définitions retenues finissent dans le sprite.
 *
 * Usage :
 *   node scripts/build-icons.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const RACINE = path.join(__dirname, '..');
const SOURCE = path.join(RACINE, 'node_modules', 'lucide-static', 'icons');
const SORTIE = path.join(RACINE, 'img', 'icons.svg');
const dryRun = process.argv.includes('--dry-run');

// nom dans le sprite -> fichier Lucide. Le commentaire dit où il sert.
const ICONES = {
    'audit': 'search',                  // silo audit SEO
    'technique': 'sliders-horizontal',  // SEO technique / on-page
    'netlinking': 'link-2',             // netlinking
    'local': 'map-pin',                 // SEO local
    'redaction': 'pen-line',            // rédaction SEO
    'blackhat': 'venetian-mask',        // black hat (article de blog)
    'soleil': 'sun',                    // bascule de thème
    'lune': 'moon',
    'menu': 'menu',                     // burger
    'fermer': 'x',
    'chevron-bas': 'chevron-down',
    'chevron-droite': 'chevron-right',
    'check': 'check',                   // listes de bénéfices
    'fleche-droite': 'arrow-right',     // liens d'action
    'mail': 'mail',
    'telephone': 'phone',
    'etoile': 'star',                   // note Trustfolio
    'citation': 'quote',                // témoignages
};

/**
 * LinkedIn : Lucide a retiré les marques de son jeu depuis la v1.
 * On reprend le glyphe officiel déjà présent sur le site. Il est plein
 * (fill) là où les icônes Lucide sont au trait : c'est traité dans le CSS
 * par .c-icone--plein.
 */
const LINKEDIN =
    '<path fill="currentColor" stroke="none" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037' +
    '-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 ' +
    '4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 ' +
    '1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 ' +
    '0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729' +
    'C24 .774 23.2 0 22.222 0h.003z"/>';

if (!fs.existsSync(SOURCE)) {
    console.error('lucide-static introuvable. Installer :\n  npm i -D lucide-static');
    process.exit(2);
}

/** Extrait le contenu utile d'un SVG Lucide, sans sa balise racine. */
function corpsSvg(fichier) {
    const svg = fs.readFileSync(fichier, 'utf8');
    const debut = svg.indexOf('>', svg.indexOf('<svg')) + 1;
    const fin = svg.lastIndexOf('</svg>');
    return svg
        .slice(debut, fin)
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

const symboles = [];
const manquantes = [];

for (const [nom, fichier] of Object.entries(ICONES)) {
    const chemin = path.join(SOURCE, `${fichier}.svg`);
    if (!fs.existsSync(chemin)) {
        manquantes.push(`${nom} (${fichier})`);
        continue;
    }
    symboles.push(`<symbol id="${nom}" viewBox="0 0 24 24">${corpsSvg(chemin)}</symbol>`);
}

symboles.push(`<symbol id="linkedin" viewBox="0 0 24 24">${LINKEDIN}</symbol>`);

if (manquantes.length) {
    console.error(`Icônes introuvables dans lucide-static : ${manquantes.join(', ')}`);
    process.exit(1);
}

// Les attributs de trait sont portés par la racine : le CSS n'a plus qu'à
// régler `stroke: currentColor` sur .c-icone.
const sprite = [
    '<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">',
    '<!-- Généré par scripts/build-icons.js : ne pas éditer. Icônes Lucide (ISC). -->',
    ...symboles,
    '</svg>',
    '',
].join('\n');

if (!dryRun) {
    fs.mkdirSync(path.dirname(SORTIE), { recursive: true });
    fs.writeFileSync(SORTIE, sprite, 'utf8');
}

const ko = Buffer.byteLength(sprite, 'utf8') / 1024;
console.log(`${dryRun ? '[dry-run] ' : ''}img/icons.svg : ${symboles.length} icônes, ${ko.toFixed(1)} Ko`);
console.log(`  ${Object.keys(ICONES).join(', ')}, linkedin`);
