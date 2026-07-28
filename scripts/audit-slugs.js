#!/usr/bin/env node
'use strict';

/**
 * audit-slugs.js : inventaire des slugs non conformes de villes/
 *
 * Un slug est conforme s'il vaut slugify(nom de la ville), c'est-à-dire avec
 * translittération des accents (normalize('NFD')). L'ancienne implémentation
 * supprimait la lettre accentuée : audit-seo-mrignac au lieu de audit-seo-merignac.
 *
 * Usage :
 *   node scripts/audit-slugs.js              rapport lisible
 *   node scripts/audit-slugs.js --json       manifeste machine sur stdout
 *   node scripts/audit-slugs.js --supprime   supprime les fichiers non conformes
 *   node scripts/audit-slugs.js --supprime --dry-run   montre sans écrire
 *
 * Le script est en lecture seule tant que --supprime n'est pas passé.
 */

const fs = require('fs');
const path = require('path');
const L = require('./lib/slugs.js');

const args = process.argv.slice(2);
const enJson = args.includes('--json');
const supprime = args.includes('--supprime');
const dryRun = args.includes('--dry-run');

const canoniques = L.slugsCanoniques();
const table = L.tableSlugsCasses();

const conformes = [];
const aCorriger = [];
const inexpliques = [];

for (const fichier of L.fichiersVilles()) {
    const base = fichier.replace(/\.html$/, '');
    const decoupe = L.decouper(base);

    if (!decoupe) {
        inexpliques.push({ fichier, raison: 'préfixe de service inconnu' });
        continue;
    }

    const { service, slug } = decoupe;

    if (canoniques.has(slug)) {
        conformes.push(fichier);
        continue;
    }

    const cible = table.get(slug);
    if (!cible) {
        inexpliques.push({ fichier, raison: `slug « ${slug} » sans ville correspondante` });
        continue;
    }

    const fichierCible = `${service}-${cible.canonique}.html`;
    aCorriger.push({
        fichier,
        slug,
        service,
        ville: cible.nom,
        slugCanonique: cible.canonique,
        fichierCible,
        cibleExiste: fs.existsSync(path.join(L.RACINE, 'villes', fichierCible)),
        source: `/villes/${base}`,
        destination: `/villes/${service}-${cible.canonique}`,
    });
}

// Les variantes cassées jamais générées : pas de fichier à supprimer, mais
// l'URL a pu être indexée par le passé : on les redirige quand même.
const sansFichier = [];
for (const [casse, info] of table) {
    const presente = aCorriger.some((e) => e.slug === casse);
    if (presente) continue;
    for (const service of L.SERVICES) {
        const fichierCible = `${service}-${info.canonique}.html`;
        if (!fs.existsSync(path.join(L.RACINE, 'villes', fichierCible))) continue;
        sansFichier.push({
            slug: casse,
            service,
            ville: info.nom,
            slugCanonique: info.canonique,
            source: `/villes/${service}-${casse}`,
            destination: `/villes/${service}-${info.canonique}`,
        });
    }
}

const manifeste = {
    total: conformes.length + aCorriger.length + inexpliques.length,
    conformes: conformes.length,
    aCorriger,
    sansFichier,
    inexpliques,
};

if (enJson) {
    process.stdout.write(JSON.stringify(manifeste, null, 2) + '\n');
} else {
    const slugsCasses = [...new Set(aCorriger.map((e) => e.slug))].sort();
    console.log(`villes/ : ${manifeste.total} fichiers`);
    console.log(`  conformes      : ${conformes.length}`);
    console.log(`  non conformes  : ${aCorriger.length} fichiers, ${slugsCasses.length} slugs`);
    console.log(`  inexpliqués    : ${inexpliques.length}`);
    console.log('');
    console.log('SLUG CASSÉ                  n   SLUG CANONIQUE            CIBLE');
    for (const slug of slugsCasses) {
        const entrees = aCorriger.filter((e) => e.slug === slug);
        const manquantes = entrees.filter((e) => !e.cibleExiste);
        const etat = manquantes.length ? `MANQUANTE (${manquantes.length})` : 'présente';
        console.log(
            `${slug.padEnd(27)} ${String(entrees.length).padEnd(3)} ` +
                `${entrees[0].slugCanonique.padEnd(25)} ${etat}`
        );
    }
    if (sansFichier.length) {
        console.log('');
        console.log(
            `${sansFichier.length} redirections préventives (variante cassée jamais générée) : ` +
                [...new Set(sansFichier.map((e) => e.slug))].join(', ')
        );
    }
    if (inexpliques.length) {
        console.log('');
        console.log('INEXPLIQUÉS : à traiter à la main :');
        for (const e of inexpliques) console.log(`  ${e.fichier} : ${e.raison}`);
    }
}

if (supprime) {
    const bloquants = aCorriger.filter((e) => !e.cibleExiste);
    if (bloquants.length) {
        console.error(
            `\nABANDON : ${bloquants.length} fichiers n'ont pas de cible canonique sur le disque.`
        );
        process.exit(1);
    }
    for (const e of aCorriger) {
        const chemin = path.join(L.RACINE, 'villes', e.fichier);
        if (dryRun) {
            console.log(`[dry-run] rm villes/${e.fichier}`);
        } else if (fs.existsSync(chemin)) {
            fs.unlinkSync(chemin);
        }
    }
    console.log(
        `\n${dryRun ? '[dry-run] ' : ''}${aCorriger.length} fichiers ` +
            `${dryRun ? 'seraient supprimés' : 'supprimés'}.`
    );
}

process.exit(inexpliques.length ? 1 : 0);
