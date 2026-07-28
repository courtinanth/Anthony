#!/usr/bin/env node
'use strict';

/**
 * fix-iframe-titles.js — ajoute un attribut title aux iframes qui n'en ont pas.
 *
 * Les 700 iframes Google Maps du site n'ont aucun title. Un lecteur d'écran
 * annonce alors « cadre », sans dire de quoi il s'agit : c'est un échec
 * WCAG 2.1 (4.1.2 Nom, rôle, valeur) sur chaque page du site.
 *
 * Le libellé est déduit du paramètre q= de l'URL Maps (« Mairie de Mérignac »).
 *
 * Note : ces iframes sont remplacées en phase 1 par une image statique
 * cliquable (~700 Ko et plusieurs requêtes tierces par page aujourd'hui).
 * Ce correctif rend le site conforme d'ici là.
 *
 * Usage :
 *   node scripts/fix-iframe-titles.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const L = require('./lib/slugs.js');

const dryRun = process.argv.includes('--dry-run');
const IGNORES = new Set(['.git', 'node_modules', '_refonte', 'scripts']);

function fichiersHtml(dossier = L.RACINE, acc = []) {
    for (const e of fs.readdirSync(dossier, { withFileTypes: true })) {
        if (IGNORES.has(e.name)) continue;
        const abs = path.join(dossier, e.name);
        if (e.isDirectory()) fichiersHtml(abs, acc);
        else if (e.name.endsWith('.html')) acc.push(abs);
    }
    return acc;
}

/** Déduit un libellé lisible depuis l'URL de l'iframe. */
function libelle(balise) {
    const src = (balise.match(/src="([^"]*)"/) || [])[1] || '';
    if (/maps\.google\.|google\.[a-z.]+\/maps/.test(src)) {
        const q = (src.match(/[?&]q=([^&"]*)/) || [])[1];
        if (q) {
            let lieu = decodeURIComponent(q.replace(/\+/g, ' ')).trim();
            lieu = lieu.replace(/^Mairie de\s+/i, '');
            return `Carte Google Maps — ${lieu}`;
        }
        return 'Carte Google Maps';
    }
    return null;
}

let fichiersModifies = 0;
let ajoutes = 0;
const sansLibelle = [];

for (const abs of fichiersHtml()) {
    const avant = fs.readFileSync(abs, 'utf8');
    let compteur = 0;

    // [\s\S] car six iframes sont écrites sur plusieurs lignes.
    const apres = avant.replace(/<iframe\b[\s\S]*?>/g, (balise) => {
        if (/\stitle\s*=/.test(balise)) return balise;
        const texte = libelle(balise);
        if (!texte) {
            sansLibelle.push(path.relative(L.RACINE, abs));
            return balise;
        }
        compteur++;
        // Insertion juste après « <iframe », avant les autres attributs.
        return balise.replace(/^<iframe\b/, `<iframe title="${texte}"`);
    });

    if (compteur === 0) continue;
    fichiersModifies++;
    ajoutes += compteur;
    if (!dryRun) fs.writeFileSync(abs, apres, 'utf8');
}

console.log(`${dryRun ? '[dry-run] ' : ''}fichiers modifiés : ${fichiersModifies}`);
console.log(`${dryRun ? '[dry-run] ' : ''}title ajoutés     : ${ajoutes}`);
if (sansLibelle.length) {
    console.log(`\niframes sans libellé déductible : ${sansLibelle.length}`);
    for (const f of [...new Set(sansLibelle)].slice(0, 10)) console.log(`  ${f}`);
}
