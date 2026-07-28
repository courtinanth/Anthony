#!/usr/bin/env node
'use strict';

/**
 * fetch-insee.js : récupère les données publiques par commune de Gironde.
 *
 * Sources, toutes publiques et sans clé :
 *   - geo.api.gouv.fr : code INSEE, population légale, coordonnées du centre.
 *   - recherche-entreprises.api.gouv.fr (adossée à SIRENE) : nombre
 *     d'établissements actifs et répartition par section d'activité.
 *
 * PLAFOND IMPORTANT : l'API entreprises ne renvoie jamais plus de
 * 10 000 résultats. Pour Bordeaux, Mérignac et les autres grosses communes,
 * `total_results` vaut exactement 10000, ce qui n'est pas leur nombre réel
 * d'établissements. Ces valeurs sont mises à null plutôt que recopiées : une
 * page ne part pas en production avec un chiffre plafonné présenté comme réel.
 *
 * Usage :
 *   node scripts/fetch-insee.js            écrit data/insee-gironde.json
 *   node scripts/fetch-insee.js --dry-run  affiche sans écrire
 */

const fs = require('fs');
const path = require('path');
const L = require('./lib/slugs.js');

const dryRun = process.argv.includes('--dry-run');
const SORTIE = path.join(L.RACINE, 'data', 'insee-gironde.json');
const PLAFOND_API = 10000;

// Sections NAF, pour nommer les secteurs dominants en clair.
const SECTIONS = {
    A: 'Agriculture, sylviculture et pêche',
    B: 'Industries extractives',
    C: 'Industrie manufacturière',
    D: 'Production et distribution d’énergie',
    E: 'Eau, assainissement, déchets',
    F: 'Construction',
    G: 'Commerce, réparation d’automobiles',
    H: 'Transports et entreposage',
    I: 'Hébergement et restauration',
    J: 'Information et communication',
    K: 'Activités financières et d’assurance',
    L: 'Activités immobilières',
    M: 'Activités spécialisées, scientifiques et techniques',
    N: 'Services administratifs et de soutien',
    O: 'Administration publique',
    P: 'Enseignement',
    Q: 'Santé humaine et action sociale',
    R: 'Arts, spectacles et loisirs',
    S: 'Autres activités de services',
};

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

async function json(url, tentatives = 3) {
    for (let i = 0; i < tentatives; i++) {
        try {
            const r = await fetch(url, { headers: { 'User-Agent': 'anthony-courtin.com/refonte' } });
            if (r.status === 429) {
                await dormir(1500 * (i + 1));
                continue;
            }
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return await r.json();
        } catch (e) {
            if (i === tentatives - 1) throw e;
            await dormir(800 * (i + 1));
        }
    }
}

/** Population, code INSEE et coordonnées, pour toute la Gironde. */
async function communesGironde() {
    const url =
        'https://geo.api.gouv.fr/communes?codeDepartement=33' +
        '&fields=nom,code,codesPostaux,population,centre&format=json';
    const brut = await json(url);
    const par = new Map();
    for (const c of brut) {
        par.set(L.slugify(c.nom), {
            nom: c.nom,
            insee: c.code,
            codesPostaux: c.codesPostaux || [],
            population: typeof c.population === 'number' ? c.population : null,
            lat: c.centre ? +c.centre.coordinates[1].toFixed(4) : null,
            lng: c.centre ? +c.centre.coordinates[0].toFixed(4) : null,
        });
    }
    return par;
}

/** Nombre d'établissements actifs, ou null si la valeur est plafonnée. */
async function etablissements(insee) {
    const base = 'https://recherche-entreprises.api.gouv.fr/search';
    const total = await json(`${base}?code_commune=${insee}&per_page=1&etat_administratif=A`);
    const brut = total.total_results;

    if (brut >= PLAFOND_API) {
        return { nombre: null, plafonne: true, secteurs: [] };
    }

    // Répartition par section : une requête par section, comptage seul.
    const secteurs = [];
    for (const [code, libelle] of Object.entries(SECTIONS)) {
        const r = await json(
            `${base}?code_commune=${insee}&per_page=1&etat_administratif=A` +
                `&section_activite_principale=${code}`
        );
        if (r.total_results > 0) {
            secteurs.push({ code, libelle, nombre: r.total_results });
        }
        await dormir(120);
    }
    secteurs.sort((a, b) => b.nombre - a.nombre);

    return { nombre: brut, plafonne: false, secteurs: secteurs.slice(0, 5) };
}

(async () => {
    console.error('Récupération des communes de Gironde…');
    const communes = await communesGironde();
    console.error(`  ${communes.size} communes.`);

    // On ne sollicite l'API entreprises que pour les villes réellement
    // utilisées par le site : 534 communes × 20 requêtes serait abusif.
    const nomsUtiles = L.chargerVilles();
    const resultat = {};
    let plafonnees = 0;
    let manquantes = 0;

    for (const nom of nomsUtiles) {
        const slug = L.slugify(nom);
        const geo = communes.get(slug);
        if (!geo) {
            console.error(`  ABSENTE de geo.api.gouv.fr : ${nom} (${slug})`);
            manquantes++;
            resultat[slug] = { nom, erreur: 'commune introuvable' };
            continue;
        }

        let eco;
        try {
            eco = await etablissements(geo.insee);
        } catch (e) {
            console.error(`  échec API entreprises pour ${nom} : ${e.message}`);
            eco = { nombre: null, plafonne: false, secteurs: [], erreur: e.message };
        }
        if (eco.plafonne) plafonnees++;

        resultat[slug] = {
            nom: geo.nom,
            insee: geo.insee,
            codesPostaux: geo.codesPostaux,
            population: geo.population,
            lat: geo.lat,
            lng: geo.lng,
            etablissementsActifs: eco.nombre,
            plafonneParApi: eco.plafonne,
            secteursDominants: eco.secteurs,
            source: {
                geo: 'geo.api.gouv.fr',
                entreprises: eco.plafonne ? null : 'recherche-entreprises.api.gouv.fr',
                recupereLe: null, // horodaté à l'écriture, voir plus bas
            },
        };
        process.stderr.write('.');
    }
    process.stderr.write('\n');

    const horodatage = new Date().toISOString().slice(0, 10);
    for (const v of Object.values(resultat)) {
        if (v.source) v.source.recupereLe = horodatage;
    }

    const sansPopulation = Object.values(resultat).filter((v) => v.population == null).length;

    console.log(`communes traitées          : ${Object.keys(resultat).length}`);
    console.log(`introuvables               : ${manquantes}`);
    console.log(`population manquante       : ${sansPopulation}`);
    console.log(`établissements plafonnés   : ${plafonnees}  (mis à null, non exploitables)`);

    if (plafonnees) {
        console.log('');
        console.log('Communes dont le nombre d’établissements est inexploitable :');
        for (const [slug, v] of Object.entries(resultat)) {
            if (v.plafonneParApi) console.log(`  ${v.nom} (${slug})`);
        }
        console.log('');
        console.log('L’API publique plafonne à 10 000 résultats. Pour ces communes il');
        console.log('faut une autre source (SIRENE avec clé, ou statistiques locales');
        console.log('INSEE). En attendant, la donnée reste nulle : aucun chiffre inventé.');
    }

    if (!dryRun) {
        fs.mkdirSync(path.dirname(SORTIE), { recursive: true });
        fs.writeFileSync(SORTIE, JSON.stringify(resultat, null, 2) + '\n', 'utf8');
        console.log(`\ndata/insee-gironde.json écrit.`);
    }
})();
