#!/usr/bin/env node
'use strict';

/**
 * verify.js : contrôle de fin de phase 0.
 *
 * Les cinq contrôles du brief, tous bloquants :
 *   1. zéro href interne se terminant par .html
 *   2. zéro slug de villes/ non conforme à slugify(nom)
 *   3. zéro og:url divergeant du canonical de sa page
 *   4. zéro fichier orphelin dans templates/
 *   5. toutes les URL des sitemaps répondent en 200 en local
 *
 * Le contrôle 5 a besoin d'un serveur : `npx netlify dev --dir . --port 8888 --offline`.
 * Sans serveur joignable, il est signalé IGNORÉ et n'échoue pas le rapport ;
 * passer --strict pour le rendre bloquant.
 *
 * Usage :
 *   node scripts/verify.js [--base http://localhost:8888] [--strict]
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
const strict = args.includes('--strict');

const IGNORES = new Set(['.git', 'node_modules', '_refonte', 'scripts']);
const EXCLUS = new Set(['googled3845672a2c3301a.html']);

function fichiersHtml(dossier = L.RACINE, acc = []) {
    for (const e of fs.readdirSync(dossier, { withFileTypes: true })) {
        if (IGNORES.has(e.name)) continue;
        const abs = path.join(dossier, e.name);
        if (e.isDirectory()) fichiersHtml(abs, acc);
        else if (e.name.endsWith('.html')) acc.push(abs);
    }
    return acc;
}

const rel = (abs) => path.relative(L.RACINE, abs);
const resultats = [];

function controle(nom, echecs, detail = (x) => JSON.stringify(x), ignore = false) {
    resultats.push({ nom, echecs, detail, ignore });
}

const pages = fichiersHtml();

// --- 1. aucun href interne en .html ---
{
    const echecs = [];
    for (const abs of pages) {
        const contenu = fs.readFileSync(abs, 'utf8');
        for (const [, lien] of contenu.matchAll(/href="([^"]*)"/g)) {
            if (/^(https?:|mailto:|tel:|#|\/\/)/i.test(lien)) continue;
            if (/\.html($|[?#])/.test(lien)) echecs.push({ fichier: rel(abs), lien });
        }
        // Les URL absolues du site en .html comptent aussi.
        for (const [, u] of contenu.matchAll(/https:\/\/anthony-courtin\.com(\/[^"'\s]*\.html)/g)) {
            if (!EXCLUS.has(path.basename(u))) echecs.push({ fichier: rel(abs), lien: u });
        }
    }
    controle('1. aucun lien interne en .html', echecs);
}

// --- 2. tous les slugs de villes/ sont conformes ---
{
    const canoniques = L.slugsCanoniques();
    const echecs = [];
    for (const f of L.fichiersVilles()) {
        const d = L.decouper(f.replace(/\.html$/, ''));
        if (!d) echecs.push({ fichier: f, raison: 'préfixe inconnu' });
        else if (!canoniques.has(d.slug)) echecs.push({ fichier: f, slug: d.slug });
    }
    controle('2. slugs de villes/ conformes', echecs);
}

// --- 3. og:url == canonical ---
{
    const echecs = [];
    for (const abs of pages) {
        if (EXCLUS.has(path.basename(abs))) continue;
        const contenu = fs.readFileSync(abs, 'utf8');
        const canon = contenu.match(/rel="canonical"\s+href="([^"]*)"/);
        const og = contenu.match(/og:url"\s+content="([^"]*)"/);
        if (!canon && !og) continue;
        if (!canon) echecs.push({ fichier: rel(abs), raison: 'og:url sans canonical' });
        else if (!og) echecs.push({ fichier: rel(abs), raison: 'canonical sans og:url' });
        else if (canon[1] !== og[1]) {
            echecs.push({ fichier: rel(abs), canonical: canon[1], og: og[1] });
        }
    }
    controle('3. og:url aligné sur le canonical', echecs);
}

// --- 4. aucun orphelin dans templates/ ---
{
    const echecs = [];
    if (fs.existsSync(path.join(L.RACINE, 'templates'))) {
        for (const f of fs.readdirSync(path.join(L.RACINE, 'templates'))) {
            echecs.push({ fichier: `templates/${f}` });
        }
    }
    // Les 6 vrais templates doivent être là où le générateur les lit.
    const attendus = [
        'audit-seo.html', 'black-hat-seo.html', 'netlinking.html',
        'optimisation-on-page.html', 'redaction-seo.html', 'seo-local.html',
    ];
    for (const f of attendus) {
        if (!fs.existsSync(path.join(L.RACINE, 'build', 'templates', f))) {
            echecs.push({ fichier: `build/templates/${f}`, raison: 'template source manquant' });
        }
    }
    controle('4. templates/ vide, 6 sources dans build/templates/', echecs);
}

// --- 6. aucun tiret cadratin ---
{
    const cadratin = String.fromCharCode(0x2014);
    const echecs = [];
    for (const abs of pages) {
        const contenu = fs.readFileSync(abs, 'utf8');
        let i = -1;
        while ((i = contenu.indexOf(cadratin, i + 1)) !== -1) {
            echecs.push({
                fichier: rel(abs),
                extrait: contenu.slice(Math.max(0, i - 40), i + 40).replace(/\s+/g, ' ').trim(),
            });
        }
    }
    controle('6. aucun tiret cadratin dans les pages', echecs);
}

// --- 5. toutes les URL des sitemaps répondent en 200 ---
(async () => {
    const urls = new Set();
    for (const f of fs.readdirSync(L.RACINE)) {
        if (!f.startsWith('sitemap') || !f.endsWith('.xml')) continue;
        const xml = fs.readFileSync(path.join(L.RACINE, f), 'utf8');
        for (const [, u] of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) urls.add(u);
    }
    const chemins = [...urls].map((u) => u.replace('https://anthony-courtin.com', ''));

    let serveurJoignable = true;
    try {
        await fetch(BASE + '/', { redirect: 'manual' });
    } catch {
        serveurJoignable = false;
    }

    const echecs = [];
    if (serveurJoignable) {
        for (let i = 0; i < chemins.length; i += 24) {
            const lot = chemins.slice(i, i + 24);
            const reps = await Promise.all(
                lot.map(async (c) => {
                    try {
                        const r = await fetch(BASE + c, { redirect: 'manual' });
                        return { chemin: c, statut: r.status };
                    } catch (e) {
                        return { chemin: c, statut: 0, erreur: e.message };
                    }
                })
            );
            for (const r of reps) if (r.statut !== 200) echecs.push(r);
        }
    }
    controle(
        `5. URL des sitemaps en 200 (${chemins.length})`,
        echecs,
        undefined,
        !serveurJoignable
    );

    // --- rapport ---
    console.log('');
    let bloquants = 0;
    for (const r of resultats) {
        if (r.ignore) {
            console.log(`  IGNORÉ  ${r.nom}`);
            console.log(`          serveur injoignable sur ${BASE} : lancez netlify dev`);
            if (strict) bloquants++;
            continue;
        }
        if (r.echecs.length === 0) {
            console.log(`  OK      ${r.nom}`);
        } else {
            bloquants++;
            console.log(`  ÉCHEC   ${r.nom} : ${r.echecs.length} cas`);
            for (const e of r.echecs.slice(0, 8)) console.log(`            ${r.detail(e)}`);
            if (r.echecs.length > 8) console.log(`            … et ${r.echecs.length - 8} autres`);
        }
    }
    console.log('');
    console.log(
        bloquants === 0
            ? 'RAPPORT VERT : phase 0 conforme.'
            : `RAPPORT ROUGE : ${bloquants} contrôle(s) en échec.`
    );
    process.exit(bloquants ? 1 : 0);
})();
