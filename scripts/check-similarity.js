#!/usr/bin/env node
'use strict';

/**
 * check-similarity.js : mesure la duplication entre les pages de villes/.
 *
 * Similarité de Jaccard sur des shingles de 6 mots, calculée sur le CORPS de
 * page uniquement : header, nav, footer, scripts et styles sont retirés, sinon
 * la coque commune écrase le signal.
 *
 * Deux mesures sont produites :
 *   - brute       : le texte tel quel
 *   - neutralisée : les noms de villes et codes postaux remplacés par un jeton.
 *     C'est celle qui compte. Deux pages identiques à un nom de ville près sont
 *     exactement ce que Google appelle du doorway.
 *
 * Seuil d'échec : 0,75 (règle du brief). Objectif : au moins 40 % de contenu
 * non partagé entre deux pages.
 *
 * Usage :
 *   node scripts/check-similarity.js [--seuil 0.75] [--top 20] [--json]
 */

const fs = require('fs');
const path = require('path');
const L = require('./lib/slugs.js');

const args = process.argv.slice(2);
const lireArg = (n, d) => {
    const i = args.indexOf(n);
    return i !== -1 && args[i + 1] ? args[i + 1] : d;
};
const SEUIL = parseFloat(lireArg('--seuil', '0.75'));
const TOP = parseInt(lireArg('--top', '20'), 10);
const enJson = args.includes('--json');
const TAILLE_SHINGLE = 6;

const villes = L.chargerVilles();
// Du plus long au plus court : « Saint-Médard-en-Jalles » avant « Saint-Médard ».
const motifsVilles = villes
    .slice()
    .sort((a, b) => b.length - a.length)
    .map((n) => new RegExp(n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'));

/** Extrait le texte du corps, sans la coque commune. */
function corps(html) {
    let s = html;
    s = s.replace(/<script[\s\S]*?<\/script>/gi, ' ');
    s = s.replace(/<style[\s\S]*?<\/style>/gi, ' ');
    s = s.replace(/<head[\s\S]*?<\/head>/gi, ' ');
    s = s.replace(/<header[\s\S]*?<\/header>/gi, ' ');
    s = s.replace(/<nav[\s\S]*?<\/nav>/gi, ' ');
    s = s.replace(/<footer[\s\S]*?<\/footer>/gi, ' ');
    s = s.replace(/<!--[\s\S]*?-->/g, ' ');
    s = s.replace(/<[^>]+>/g, ' ');
    s = s.replace(/&[a-z]+;|&#\d+;/gi, ' ');
    return s.replace(/\s+/g, ' ').trim().toLowerCase();
}

/** Remplace noms de villes et codes postaux par un jeton neutre. */
function neutraliser(texte) {
    let s = texte;
    for (const m of motifsVilles) s = s.replace(m, ' §ville§ ');
    s = s.replace(/\b33\d{3}\b/g, ' §cp§ ');
    return s.replace(/\s+/g, ' ').trim();
}

function shingles(texte) {
    const mots = texte.split(' ').filter(Boolean);
    const set = new Set();
    for (let i = 0; i + TAILLE_SHINGLE <= mots.length; i++) {
        set.add(mots.slice(i, i + TAILLE_SHINGLE).join(' '));
    }
    return set;
}

function jaccard(a, b) {
    if (a.size === 0 || b.size === 0) return 0;
    const [petit, grand] = a.size < b.size ? [a, b] : [b, a];
    let inter = 0;
    for (const x of petit) if (grand.has(x)) inter++;
    return inter / (a.size + b.size - inter);
}

const fichiers = L.fichiersVilles();
const docs = [];
for (const f of fichiers) {
    const html = fs.readFileSync(path.join(L.RACINE, 'villes', f), 'utf8');
    const texte = corps(html);
    const neutre = neutraliser(texte);
    docs.push({
        fichier: f,
        service: (L.decouper(f.replace(/\.html$/, '')) || {}).service || '?',
        mots: texte.split(' ').filter(Boolean).length,
        brut: shingles(texte),
        neutre: shingles(neutre),
    });
}

console.error(`${docs.length} pages analysées, comparaison de ${(docs.length * (docs.length - 1)) / 2} paires…`);

const paires = [];
let sommeNeutre = 0;
let nbPaires = 0;
let auDessusSeuil = 0;

for (let i = 0; i < docs.length; i++) {
    for (let j = i + 1; j < docs.length; j++) {
        const sNeutre = jaccard(docs[i].neutre, docs[j].neutre);
        sommeNeutre += sNeutre;
        nbPaires++;
        if (sNeutre >= SEUIL) auDessusSeuil++;
        if (sNeutre >= SEUIL) {
            paires.push({
                a: docs[i].fichier,
                b: docs[j].fichier,
                memeService: docs[i].service === docs[j].service,
                neutre: sNeutre,
                brut: jaccard(docs[i].brut, docs[j].brut),
            });
        }
    }
}

paires.sort((x, y) => y.neutre - x.neutre);

const motsTries = docs.map((d) => d.mots).sort((a, b) => a - b);
const rapport = {
    pages: docs.length,
    paires: nbPaires,
    seuil: SEUIL,
    pairesAuDessusDuSeuil: auDessusSeuil,
    partAuDessusDuSeuil: +(auDessusSeuil / nbPaires * 100).toFixed(1),
    similariteMoyenneNeutralisee: +(sommeNeutre / nbPaires).toFixed(3),
    motsParPage: {
        min: motsTries[0],
        median: motsTries[Math.floor(motsTries.length / 2)],
        max: motsTries[motsTries.length - 1],
    },
    pires: paires.slice(0, TOP),
};

if (enJson) {
    process.stdout.write(JSON.stringify(rapport, null, 2) + '\n');
} else {
    console.log('');
    console.log(`pages                        : ${rapport.pages}`);
    console.log(`mots par page (min/med/max)  : ${rapport.motsParPage.min} / ${rapport.motsParPage.median} / ${rapport.motsParPage.max}`);
    console.log(`similarité moyenne (neutre)  : ${rapport.similariteMoyenneNeutralisee}`);
    console.log(`paires ≥ ${SEUIL}                 : ${auDessusSeuil} sur ${nbPaires} (${rapport.partAuDessusDuSeuil} %)`);
    console.log('');
    console.log(`Les ${Math.min(TOP, paires.length)} pires paires :`);
    for (const p of rapport.pires) {
        console.log(
            `  ${p.neutre.toFixed(3)} (brut ${p.brut.toFixed(3)}) ${p.memeService ? 'même service ' : 'inter-silo  '} ` +
                `${p.a} ↔ ${p.b}`
        );
    }
}

process.exit(auDessusSeuil > 0 ? 1 : 0);
