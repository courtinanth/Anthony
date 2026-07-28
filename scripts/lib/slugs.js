'use strict';

// Bibliothèque partagée : liste des villes et règles de slug.
// Utilisée par audit-slugs.js, fix-internal-links.js, fix-og-url.js et verify.js.

const fs = require('fs');
const path = require('path');

const RACINE = path.join(__dirname, '..', '..');

// Les 6 silos de services + le silo agence-seo, du plus long au plus court :
// l'ordre compte pour découper « {service}-{ville} » sans ambiguïté.
const SERVICES = [
    'optimisation-on-page',
    'black-hat-seo',
    'redaction-seo',
    'agence-seo',
    'audit-seo',
    'seo-local',
    'netlinking',
];

/**
 * Slug canonique : translittère les accents au lieu de les supprimer.
 * Mérignac -> merignac, Villenave-d'Ornon -> villenave-dornon
 */
function slugify(texte) {
    return texte
        .toLowerCase()
        .normalize('NFD')                     // sépare la lettre de son accent
        .replace(/[̀-ͯ]/g, '')      // supprime l'accent, garde la lettre
        .replace(/['’]/g, '')            // l'apostrophe disparaît sans laisser de tiret
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Slug cassé : reproduit le bug de l'ancienne implémentation, qui supprimait
 * la lettre accentuée entière. Mérignac -> mrignac, Bègles -> bgles.
 * Sert uniquement à retrouver quelles URL historiques doivent être redirigées.
 */
function slugifyCasse(texte) {
    return texte
        .toLowerCase()
        .replace(/[^\x00-\x7f]/g, '')      // le bug : tout caractère non-ASCII saute
        .replace(/[^a-z0-9]+/g, '-')       // l'apostrophe devient un tiret
        .replace(/^-+|-+$/g, '');
}

/** Charge les 100 villes depuis les deux fichiers de données historiques. */
function chargerVilles() {
    const noms = [];
    for (const fichier of ['data/cities-top10.js', 'data/cities-extended.js']) {
        for (const ville of require(path.join(RACINE, fichier))) {
            noms.push(ville.name);
        }
    }
    noms.push('Bordeaux'); // traitée à part par les générateurs, absente des deux fichiers
    return noms;
}

/**
 * Table des slugs cassés -> slug canonique, déduite des noms de villes.
 * Une entrée n'existe que si les deux règles divergent réellement.
 */
function tableSlugsCasses() {
    const table = new Map();
    for (const nom of chargerVilles()) {
        const bon = slugify(nom);
        const casse = slugifyCasse(nom);
        if (casse !== bon) table.set(casse, { canonique: bon, nom });
    }
    return table;
}

/** Ensemble des slugs canoniques valides. */
function slugsCanoniques() {
    return new Set(chargerVilles().map(slugify));
}

/** Découpe « audit-seo-merignac » en { service, slug }. */
function decouper(base) {
    const service = SERVICES.find((s) => base.startsWith(s + '-'));
    if (!service) return null;
    return { service, slug: base.slice(service.length + 1) };
}

/** Liste les fichiers de villes/ (noms de fichiers, pas les chemins). */
function fichiersVilles() {
    return fs
        .readdirSync(path.join(RACINE, 'villes'))
        .filter((f) => f.endsWith('.html'))
        .sort();
}

module.exports = {
    RACINE,
    SERVICES,
    slugify,
    slugifyCasse,
    chargerVilles,
    tableSlugsCasses,
    slugsCanoniques,
    decouper,
    fichiersVilles,
};
