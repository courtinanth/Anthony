#!/usr/bin/env node
'use strict';

/**
 * check-redirects.js : vérifie le fichier _redirects contre un serveur réel.
 *
 * Contrôles, tous bloquants :
 *   1. chaque source répond bien avec le statut annoncé (301 ou 410)
 *   2. chaque destination répond en 200, jamais en 3xx (aucune chaîne)
 *   3. aucune destination n'est la home (une ancienne URL doit atterrir sur une
 *      page qui parle réellement de son sujet)
 *   4. aucune boucle de redirection
 *
 * Usage :
 *   node scripts/check-redirects.js [--base http://localhost:8888] [--json]
 *
 * La base peut pointer sur `netlify dev` en local ou sur une deploy preview.
 */

const fs = require('fs');
const path = require('path');
const L = require('./lib/slugs.js');

const args = process.argv.slice(2);
const lireArg = (nom, defaut) => {
    const i = args.indexOf(nom);
    return i !== -1 && args[i + 1] ? args[i + 1] : defaut;
};
const BASE = lireArg('--base', 'http://localhost:8888').replace(/\/$/, '');
const enJson = args.includes('--json');
const CONCURRENCE = 24;

/** Parse _redirects en ignorant commentaires, lignes vides et wildcards. */
function lireRegles() {
    const brut = fs.readFileSync(path.join(L.RACINE, '_redirects'), 'utf8');
    const regles = [];
    const wildcards = [];
    for (const ligne of brut.split('\n')) {
        const l = ligne.trim();
        if (!l || l.startsWith('#')) continue;
        const [source, destination, drapeau = '200'] = l.split(/\s+/);
        const statut = parseInt(drapeau, 10) || 200;
        const regle = { source, destination, statut, force: drapeau.endsWith('!') };
        if (source.includes('*') || source.includes(':')) wildcards.push(regle);
        else regles.push(regle);
    }
    return { regles, wildcards };
}

/** Une requête sans suivi de redirection. */
async function tete(url) {
    try {
        const r = await fetch(url, { redirect: 'manual' });
        return { statut: r.status, location: r.headers.get('location') };
    } catch (e) {
        return { statut: 0, erreur: e.message };
    }
}

/** Suit la chaîne et renvoie le nombre de sauts + le statut final. */
async function suivre(url, maxSauts = 5) {
    const vus = [];
    let courant = url;
    for (let i = 0; i <= maxSauts; i++) {
        if (vus.includes(courant)) return { sauts: i, final: 0, boucle: true, chemin: vus };
        vus.push(courant);
        const r = await tete(courant);
        if (r.statut >= 300 && r.statut < 400 && r.location) {
            courant = r.location.startsWith('http') ? r.location : BASE + r.location;
            continue;
        }
        return { sauts: i, final: r.statut, boucle: false, chemin: vus };
    }
    return { sauts: maxSauts + 1, final: 0, boucle: false, tropLong: true, chemin: vus };
}

/** Exécute les tâches par lots pour ne pas saturer le serveur local. */
async function parLots(items, taille, fn) {
    const out = [];
    for (let i = 0; i < items.length; i += taille) {
        out.push(...(await Promise.all(items.slice(i, i + taille).map(fn))));
    }
    return out;
}

(async () => {
    const { regles, wildcards } = lireRegles();

    // Les destinations distinctes : chacune doit répondre 200, une seule fois testée.
    const destinations = [...new Set(regles.map((r) => r.destination))];

    console.error(
        `Base : ${BASE}\n` +
            `${regles.length} règles explicites, ${wildcards.length} wildcards, ` +
            `${destinations.length} destinations distinctes.\n`
    );

    const erreurs = [];

    // --- 1 & 4. sources : statut attendu, pas de boucle ---
    const resSources = await parLots(regles, CONCURRENCE, async (r) => {
        const rep = await tete(BASE + r.source);
        return { regle: r, rep };
    });
    for (const { regle, rep } of resSources) {
        if (rep.statut !== regle.statut) {
            erreurs.push({
                type: 'statut-source',
                source: regle.source,
                attendu: regle.statut,
                obtenu: rep.statut,
            });
        }
    }

    // --- 2 & 3. destinations : 200, jamais 3xx, jamais la home ---
    const resDest = await parLots(destinations, CONCURRENCE, async (d) => {
        const chaine = await suivre(BASE + d);
        return { destination: d, chaine };
    });
    for (const { destination, chaine } of resDest) {
        if (chaine.boucle) {
            erreurs.push({ type: 'boucle', destination, chemin: chaine.chemin });
            continue;
        }
        if (chaine.sauts > 0) {
            erreurs.push({ type: 'chaine', destination, sauts: chaine.sauts });
        }
        if (chaine.final !== 200) {
            erreurs.push({ type: 'destination-non-200', destination, statut: chaine.final });
        }
    }

    // Atterrir sur la home est un échec : une ancienne URL doit arriver sur une
    // page qui parle de son sujet. Seule exception, la normalisation
    // /index.html -> / , qui n'est pas une perte de contexte.
    for (const r of regles) {
        const versHome = r.destination === '/' || r.destination === '/index.html';
        const normalisation = /(^|\/)index\.html$/.test(r.source);
        if (versHome && !normalisation) {
            erreurs.push({ type: 'destination-home', source: r.source });
        }
    }

    // --- wildcards : testés par échantillon ---
    const echantillons = [
        { url: '/templates/audit-seo-arcachon', attendu: 410, regle: '/templates/*' },
        { url: '/templates/audit-seo.html', attendu: 410, regle: '/templates/*' },
        { url: '/build/templates/audit-seo.html', attendu: 410, regle: '/build/*' },
        // Les .html de villes/ restent servis en 200 : ils portent un canonical
        // vers l'URL propre et disparaissent en phase 4. Ce 200 est attendu.
        { url: '/villes/audit-seo-talence.html', attendu: 200, regle: 'villes/ non redirigé' },
    ];
    const resWc = await parLots(echantillons, CONCURRENCE, async (e) => ({
        ...e,
        rep: await tete(BASE + e.url),
    }));
    for (const e of resWc) {
        if (e.rep.statut !== e.attendu) {
            erreurs.push({
                type: 'wildcard',
                regle: e.regle,
                source: e.url,
                attendu: e.attendu,
                obtenu: e.rep.statut,
            });
        }
    }

    const rapport = {
        base: BASE,
        reglesTestees: regles.length,
        destinationsTestees: destinations.length,
        echantillonsWildcard: echantillons.length,
        erreurs,
        vert: erreurs.length === 0,
    };

    if (enJson) {
        process.stdout.write(JSON.stringify(rapport, null, 2) + '\n');
    } else if (erreurs.length === 0) {
        console.log('RAPPORT 100 % VERT');
        console.log(`  ${regles.length} sources -> statut attendu`);
        console.log(`  ${destinations.length} destinations -> 200 direct, aucune chaîne`);
        console.log(`  ${echantillons.length} wildcards -> conformes`);
        console.log('  aucune boucle, aucune destination = home');
    } else {
        const parType = {};
        for (const e of erreurs) parType[e.type] = (parType[e.type] || 0) + 1;
        console.log(`ÉCHEC : ${erreurs.length} erreurs`);
        for (const [t, n] of Object.entries(parType)) console.log(`  ${t} : ${n}`);
        console.log('');
        for (const e of erreurs.slice(0, 25)) console.log('  ' + JSON.stringify(e));
        if (erreurs.length > 25) console.log(`  … et ${erreurs.length - 25} autres`);
    }

    process.exit(erreurs.length ? 1 : 0);
})();
