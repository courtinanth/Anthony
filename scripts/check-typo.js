#!/usr/bin/env node
'use strict';

/**
 * check-typo.js : interdit le tiret cadratin sur tout le site.
 *
 * Le tiret cadratin (-, U+2014) n'appartient pas aux conventions retenues pour
 * ce site. En français il se remplace par deux-points, une virgule, ou des
 * parenthèses selon le rôle qu'il jouait.
 *
 * Le contrôle porte sur tout ce qui est servi ou lu : HTML, CSS, JS, données,
 * y compris les commentaires de code et les fichiers générés, pour que le
 * caractère ne puisse pas revenir par un script de génération.
 *
 * Usage :
 *   node scripts/check-typo.js            rapport
 *   node scripts/check-typo.js --corrige  applique les remplacements évidents
 *   node scripts/check-typo.js --corrige --dry-run
 */

const fs = require('fs');
const path = require('path');

const RACINE = path.join(__dirname, '..');
const args = process.argv.slice(2);
const corrige = args.includes('--corrige');
const dryRun = args.includes('--dry-run');

const IGNORES = new Set(['.git', 'node_modules', '_refonte', 'fonts', 'images', 'img']);
const EXTENSIONS = /\.(html|css|js|json|txt|xml|md|toml)$/;

// Le caractère à traquer, écrit par son code pour que ce fichier-ci reste
// lui-même conforme au contrôle qu'il applique.
const CADRATIN = String.fromCharCode(0x2014);

function fichiers(dossier = RACINE, acc = []) {
    for (const e of fs.readdirSync(dossier, { withFileTypes: true })) {
        if (IGNORES.has(e.name)) continue;
        const abs = path.join(dossier, e.name);
        if (e.isDirectory()) fichiers(abs, acc);
        else if (EXTENSIONS.test(e.name)) acc.push(abs);
    }
    return acc;
}

/**
 * Remplacements automatiques, du plus spécifique au plus général :
 *   entouré d'espaces   ->  deux-points  (le cas dominant, une glose)
 *   espace d'un seul côté -> rien        (le tiret ouvrait une apposition)
 *   collé aux deux mots ->  tiret simple
 *
 * Une relecture reste nécessaire sur les textes visibles : le deux-points ne
 * convient pas partout, et deux gloses dans la même phrase donnent une lecture
 * lourde.
 */
function corriger(texte) {
    return texte
        .split(' ' + CADRATIN + ' ').join(' : ')
        .split(CADRATIN + ' ').join('')
        .split(' ' + CADRATIN).join('')
        .split(CADRATIN).join('-');
}

const trouves = [];
let corriges = 0;

for (const abs of fichiers()) {
    const rel = path.relative(RACINE, abs);
    let contenu;
    try {
        contenu = fs.readFileSync(abs, 'utf8');
    } catch {
        continue;
    }
    if (!contenu.includes(CADRATIN)) continue;

    let i = -1;
    while ((i = contenu.indexOf(CADRATIN, i + 1)) !== -1) {
        trouves.push({
            fichier: rel,
            extrait: contenu.slice(Math.max(0, i - 45), i + 45).replace(/\s+/g, ' ').trim(),
        });
    }

    if (corrige) {
        const neuf = corriger(contenu);
        if (neuf !== contenu) {
            corriges++;
            if (!dryRun) fs.writeFileSync(abs, neuf, 'utf8');
        }
    }
}

const parFichier = new Map();
for (const t of trouves) parFichier.set(t.fichier, (parFichier.get(t.fichier) || 0) + 1);

if (corrige) {
    console.log(
        `${dryRun ? '[dry-run] ' : ''}${trouves.length} tirets cadratins dans ` +
            `${parFichier.size} fichiers ; ${corriges} fichiers ${dryRun ? 'seraient réécrits' : 'réécrits'}.`
    );
    process.exit(0);
}

if (trouves.length === 0) {
    console.log('TYPOGRAPHIE OK : aucun tiret cadratin.');
    process.exit(0);
}

console.log(`ÉCHEC : ${trouves.length} tirets cadratins dans ${parFichier.size} fichiers.`);
for (const [f, n] of [...parFichier].sort((a, b) => b[1] - a[1]).slice(0, 20)) {
    console.log(`  ${String(n).padStart(4)}  ${f}`);
}
if (parFichier.size > 20) console.log(`  ... et ${parFichier.size - 20} autres fichiers`);
console.log('');
console.log('Exemples :');
for (const t of trouves.slice(0, 6)) console.log(`  ${t.fichier}\n    ${t.extrait}`);
console.log('');
console.log('Corriger : node scripts/check-typo.js --corrige');
process.exit(1);
