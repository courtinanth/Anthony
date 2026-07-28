#!/usr/bin/env node
'use strict';

/**
 * build-cities-data.js : construit data/cities.json, source de vérité unique.
 *
 * Remplace data/cities-top10.js + data/cities-extended.js, en fusionnant :
 *   - le zonage et les codes postaux des fichiers historiques ;
 *   - les données publiques de data/insee-gironde.json (fetch-insee.js) ;
 *   - la sélection des 26 villes conservées, décidée au §4 de
 *     _refonte/01-AUDIT-ET-STRATEGIE.md.
 *
 * Les villes voisines sont calculées à la distance réelle entre centres
 * communaux, pas listées à la main : c'est ce qui garantit que le maillage
 * pointe bien vers les communes les plus proches.
 *
 * Rien n'est inventé. Un champ non récupérable reste null et sera signalé par
 * la génération de page. Voir la note sur le plafond de l'API entreprises
 * dans fetch-insee.js.
 *
 * Usage :
 *   node scripts/build-cities-data.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const L = require('./lib/slugs.js');

const dryRun = process.argv.includes('--dry-run');
const SORTIE = path.join(L.RACINE, 'data', 'cities.json');

// Les 26 villes conservées, §4 de l'audit. Ne pas modifier sans validation.
const TIERS = {
    1: ['Bordeaux', 'Arcachon', 'Talence', 'Pessac', 'Mérignac',
        'Saint-Médard-en-Jalles', 'Lège-Cap-Ferret', 'La Teste-de-Buch'],
    2: ['Floirac', 'Gradignan', 'Libourne', 'Lormont', 'Bègles',
        'Villenave-d’Ornon', 'Le Bouscat', 'Eysines', 'Coutras', 'Arès',
        'Saint-Aubin-de-Médoc', 'Lacanau'],
    3: ['Soulac-sur-Mer', 'Le Taillan-Médoc', 'Bruges', 'Cestas', 'Langon', 'Bazas'],
};

// Communes ayant fusionné depuis la création du site : le slug historique du
// site ne correspond plus à aucune commune de geo.api.gouv.fr.
const FUSIONS = {
    cadillac: { versSlug: 'cadillac-sur-garonne', note: 'Cadillac a fusionné avec Béguey en 2024 pour former Cadillac-sur-Garonne.' },
};

const tierDe = (nom) => {
    for (const [t, liste] of Object.entries(TIERS)) {
        if (liste.some((n) => L.slugify(n) === L.slugify(nom))) return Number(t);
    }
    return null;
};

/** Distance à vol d'oiseau entre deux points, en kilomètres. */
function distanceKm(a, b) {
    if (a.lat == null || b.lat == null) return null;
    const R = 6371;
    const rad = (d) => (d * Math.PI) / 180;
    const dLat = rad(b.lat - a.lat);
    const dLng = rad(b.lng - a.lng);
    const h =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return +(2 * R * Math.asin(Math.sqrt(h))).toFixed(1);
}

/** Article contracté correct : « à Bordeaux », « au Bouscat », « à La Teste ». */
function locatif(nom) {
    if (/^Le /.test(nom)) return 'au ' + nom.slice(3);
    if (/^Les /.test(nom)) return 'aux ' + nom.slice(4);
    return 'à ' + nom;
}

// --- chargement des sources -------------------------------------------------

const cheminInsee = path.join(L.RACINE, 'data', 'insee-gironde.json');
if (!fs.existsSync(cheminInsee)) {
    console.error('data/insee-gironde.json manquant. Lancer d’abord :\n  node scripts/fetch-insee.js');
    process.exit(2);
}
const insee = JSON.parse(fs.readFileSync(cheminInsee, 'utf8'));

const historique = new Map();
for (const f of ['data/cities-top10.js', 'data/cities-extended.js']) {
    for (const v of require(path.join(L.RACINE, f))) {
        historique.set(L.slugify(v.name), { zip: v.zip, zone: v.zone, rang: v.rank });
    }
}
historique.set('bordeaux', { zip: '33000', zone: 'Métropole', rang: 1 });

// --- construction ------------------------------------------------------------

const villes = [];
const alertes = [];

for (const nom of L.chargerVilles()) {
    const slug = L.slugify(nom);
    const h = historique.get(slug) || {};
    let geo = insee[slug];

    // Rattrapage des fusions de communes.
    let noteFusion = null;
    if (geo && geo.erreur && FUSIONS[slug]) {
        noteFusion = FUSIONS[slug].note;
        alertes.push(`${nom} : ${noteFusion}`);
        geo = null;
    } else if (geo && geo.erreur) {
        alertes.push(`${nom} : introuvable dans geo.api.gouv.fr, données géographiques nulles.`);
        geo = null;
    }

    const tier = tierDe(nom);
    villes.push({
        slug,
        name: nom,
        nameInLocative: locatif(nom),
        zip: h.zip || (geo && geo.codesPostaux && geo.codesPostaux[0]) || null,
        insee: geo ? geo.insee : null,
        zone: h.zone || null,
        tier,
        keep: tier !== null,
        lat: geo ? geo.lat : null,
        lng: geo ? geo.lng : null,
        distanceBordeauxKm: null,   // calculé plus bas
        travelFromBordeaux: null,   // temps de trajet : demande une source routière
        coveredCommunes: [],        // rempli plus bas pour les villes conservées
        neighbourCities: [],        // idem
        economy: {
            businessCount: geo ? geo.etablissementsActifs : null,
            businessCountCapped: geo ? !!geo.plafonneParApi : false,
            topSectors: geo && geo.secteursDominants ? geo.secteursDominants : [],
            population: geo ? geo.population : null,
            source: geo && geo.source ? geo.source : null,
        },
        editorial: {
            localAngle: '',                 // 120 à 180 mots, écrits par Anthony
            faqLocal: [{ q: '', a: '' }],
        },
        competition: [],
        caseStudyId: null,
        notes: noteFusion,
    });
}

// --- distances et maillage ---------------------------------------------------

const parSlug = new Map(villes.map((v) => [v.slug, v]));
const bordeaux = parSlug.get('bordeaux');

for (const v of villes) {
    v.distanceBordeauxKm = v.slug === 'bordeaux' ? 0 : distanceKm(bordeaux, v);
}

const conservees = villes.filter((v) => v.keep);

for (const v of villes) {
    if (v.lat == null) continue;

    // Villes voisines : les 5 villes CONSERVÉES les plus proches. C'est le
    // maillage affiché sur la page, il ne doit pointer que vers des pages
    // qui existent après la phase 4.
    v.neighbourCities = conservees
        .filter((a) => a.slug !== v.slug && a.lat != null)
        .map((a) => ({ slug: a.slug, km: distanceKm(v, a) }))
        .sort((a, b) => a.km - b.km)
        .slice(0, 5)
        .map((a) => a.slug);
}

// Communes couvertes : chaque ville supprimée est rattachée à la ville
// conservée la plus proche. C'est ce qui rend les 301 légitimes, la page de
// destination parlant réellement de la commune redirigée.
for (const v of villes) {
    if (v.keep || v.lat == null) continue;
    const plusProche = conservees
        .filter((a) => a.lat != null)
        .map((a) => ({ slug: a.slug, km: distanceKm(v, a) }))
        .sort((a, b) => a.km - b.km)[0];
    if (plusProche) parSlug.get(plusProche.slug).coveredCommunes.push(v.name);
}
for (const v of conservees) v.coveredCommunes.sort((a, b) => a.localeCompare(b, 'fr'));

villes.sort((a, b) => (a.tier || 9) - (b.tier || 9) || a.name.localeCompare(b.name, 'fr'));

// --- rapport ------------------------------------------------------------------

const sansPop = conservees.filter((v) => v.economy.population == null);
const sansEtab = conservees.filter((v) => v.economy.businessCount == null);

console.log(`villes totales        : ${villes.length}`);
console.log(`conservées (keep)     : ${conservees.length}`);
for (const t of [1, 2, 3]) {
    console.log(`  tier ${t}             : ${conservees.filter((v) => v.tier === t).length}`);
}
console.log(`population manquante  : ${sansPop.length}`);
console.log(`établissements nuls   : ${sansEtab.length}  ${sansEtab.map((v) => v.name).join(', ')}`);
console.log(`communes rattachées   : ${villes.filter((v) => !v.keep).length}`);

if (alertes.length) {
    console.log('\nÀ VÉRIFIER :');
    for (const a of alertes) console.log(`  ${a}`);
}

if (conservees.length !== 26) {
    console.error(`\nERREUR : ${conservees.length} villes conservées au lieu de 26.`);
    process.exit(1);
}

if (!dryRun) {
    fs.writeFileSync(SORTIE, JSON.stringify(villes, null, 2) + '\n', 'utf8');
    console.log('\ndata/cities.json écrit.');
}
