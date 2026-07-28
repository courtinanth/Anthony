#!/usr/bin/env node
'use strict';

/**
 * check-contrast.js : vérifie toutes les paires texte/fond du design system,
 * dans les deux thèmes, par calcul.
 *
 * Ce contrôle existe parce qu'une paire peut passer en mode clair et échouer
 * en mode sombre sans que rien ne le signale : c'est arrivé au bouton primaire,
 * dont le fond servait aussi de couleur de texte (3,48:1 en sombre).
 *
 * Le script lit les tokens directement dans css/src/tokens.css et résout les
 * var() lui-même : aucun navigateur nécessaire, il tourne en une fraction de
 * seconde et peut donc bloquer chaque build.
 *
 * Usage :
 *   node scripts/check-contrast.js [--json]
 */

const fs = require('fs');
const path = require('path');
const { ratio, niveau } = require('./lib/contraste.js');

const RACINE = path.join(__dirname, '..');
const enJson = process.argv.includes('--json');

const css = fs.readFileSync(path.join(RACINE, 'css', 'src', 'tokens.css'), 'utf8');

/** Découpe le fichier en trois jeux de déclarations : socle, clair, sombre. */
function extraireTokens() {
    const iSombre = css.indexOf('/* @sombre:debut */');
    const partieClaire = css.slice(0, iSombre);
    const partieSombre = css.slice(iSombre, css.indexOf('/* @sombre:fin */'));

    const lire = (texte) => {
        // Les commentaires sont retirés AVANT le parsing : plusieurs d'entre
        // eux citent un token (« 2,8:1 sur --n-50 : … »), ce que la regex
        // prendrait pour une déclaration et qui ferait silencieusement sauter
        // des paires du contrôle.
        const propre = texte.replace(/\/\*[\s\S]*?\*\//g, '');
        const out = new Map();
        for (const m of propre.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
            out.set(m[1], m[2].trim());
        }
        return out;
    };

    const clair = lire(partieClaire);
    const sombre = new Map(clair);
    for (const [k, v] of lire(partieSombre)) sombre.set(k, v);
    return { clair, sombre };
}

/** Résout récursivement les var() jusqu'à une valeur hexadécimale. */
function resoudre(nom, tokens, profondeur = 0) {
    if (profondeur > 12) return null;
    let v = tokens.get(nom);
    if (!v) return null;
    v = v.replace(/\/\*[\s\S]*?\*\//g, '').trim();
    if (v.startsWith('#')) return v;
    const m = v.match(/^var\((--[a-z0-9-]+)\)$/i);
    if (m) return resoudre(m[1], tokens, profondeur + 1);
    // color-mix() et consorts : non résolus, donc non testés ici.
    return null;
}

/**
 * Les paires réellement utilisées par les composants.
 * usage : 'corps' (4,5:1), 'grand' (3:1), 'interface' (3:1).
 */
const PAIRES = [
    ['texte', 'surface-page', 'corps', 'texte courant sur le fond de page'],
    ['texte', 'surface-alt', 'corps', 'texte courant sur section alternée'],
    ['texte', 'surface-raised', 'corps', 'texte courant sur carte'],
    ['texte-fort', 'surface-page', 'corps', 'titres'],
    ['texte-fort', 'surface-raised', 'corps', 'titres sur carte'],
    ['texte-doux', 'surface-page', 'corps', 'texte secondaire'],
    ['texte-doux', 'surface-alt', 'corps', 'texte secondaire sur section alternée'],
    ['texte-doux', 'surface-raised', 'corps', 'texte secondaire sur carte'],
    ['texte-inverse', 'surface-inverse', 'corps', 'bandeau CTA inversé'],

    ['accent', 'surface-page', 'corps', 'liens'],
    ['accent', 'surface-alt', 'corps', 'liens sur section alternée'],
    ['accent', 'surface-raised', 'corps', 'liens sur carte'],
    ['accent-hover', 'surface-page', 'corps', 'liens au survol'],

    ['sur-accent', 'accent-surface', 'corps', 'texte du bouton primaire'],
    ['sur-accent', 'accent-surface-hover', 'corps', 'bouton primaire au survol'],
    ['sur-accent', 'accent-surface-actif', 'corps', 'bouton primaire pressé'],

    ['bordure-champ', 'surface-page', 'interface', 'bordure de champ de formulaire'],
    ['bordure-champ', 'surface-raised', 'interface', 'bordure de champ sur carte'],

    ['success', 'surface-page', 'corps', 'métrique positive'],
    ['warning', 'surface-page', 'corps', 'avertissement'],
    ['danger', 'surface-page', 'corps', 'erreur de formulaire'],
    ['info', 'surface-page', 'corps', 'encart pédagogique'],
    ['danger', 'surface-raised', 'corps', 'erreur de formulaire sur carte'],
];

const { clair, sombre } = extraireTokens();
const resultats = [];

for (const [nomTheme, tokens] of [['clair', clair], ['sombre', sombre]]) {
    for (const [avant, arriere, usage, libelle] of PAIRES) {
        const cAvant = resoudre('--' + avant, tokens);
        const cArriere = resoudre('--' + arriere, tokens);
        if (!cAvant || !cArriere) {
            resultats.push({ theme: nomTheme, avant, arriere, usage, libelle, ignore: true });
            continue;
        }
        const r = ratio(cAvant, cArriere);
        resultats.push({
            theme: nomTheme,
            avant, arriere, usage, libelle,
            valeurs: `${cAvant} / ${cArriere}`,
            ratio: +r.toFixed(2),
            niveau: niveau(r, usage),
        });
    }
}

const echecs = resultats.filter((r) => r.niveau === 'ÉCHEC');
const ignores = resultats.filter((r) => r.ignore);

if (enJson) {
    process.stdout.write(JSON.stringify({ resultats, echecs: echecs.length }, null, 2) + '\n');
} else {
    for (const theme of ['clair', 'sombre']) {
        console.log(`\n=== MODE ${theme.toUpperCase()} ===`);
        console.log('RATIO   NIVEAU  PAIRE');
        for (const r of resultats.filter((x) => x.theme === theme && !x.ignore)) {
            const marque = r.niveau === 'ÉCHEC' ? '!!' : '  ';
            console.log(
                `${marque} ${String(r.ratio).padStart(5)}  ${r.niveau.padEnd(6)}  ` +
                    `--${r.avant} sur --${r.arriere}`
            );
            if (r.niveau === 'ÉCHEC') console.log(`        ${r.libelle} : ${r.valeurs}`);
        }
    }
    console.log('');
    if (ignores.length) {
        console.log(`${ignores.length} paires non testées (valeur non résolue, ex. color-mix) :`);
        for (const i of ignores) console.log(`  ${i.theme} : --${i.avant} sur --${i.arriere}`);
        console.log('');
    }
    console.log(
        echecs.length === 0
            ? `CONTRASTES VERTS : ${resultats.length - ignores.length} paires vérifiées sur les deux thèmes.`
            : `ÉCHEC : ${echecs.length} paires sous le seuil.`
    );
}

process.exit(echecs.length ? 1 : 0);
