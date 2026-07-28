#!/usr/bin/env node
'use strict';

/**
 * build-a-rediger.js : produit _refonte/a-rediger.md, le brief de rédaction
 * des 26 angles locaux.
 *
 * Un document par ville avec les seules données réellement sourcées, et trois
 * questions destinées à faire écrire un paragraphe qu'aucun script ne pourrait
 * générer. C'est ce paragraphe qui distingue une page locale légitime d'une
 * doorway : le reste du gabarit est partagé.
 *
 * Toute donnée non récupérable est affichée « non disponible » plutôt que
 * comblée. Voir le plafond de l'API entreprises dans fetch-insee.js.
 *
 * Usage :
 *   node scripts/build-a-rediger.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const L = require('./lib/slugs.js');

const dryRun = process.argv.includes('--dry-run');
const SORTIE = path.join(L.RACINE, '_refonte', 'a-rediger.md');

const cheminVilles = path.join(L.RACINE, 'data', 'cities.json');
if (!fs.existsSync(cheminVilles)) {
    console.error('data/cities.json manquant. Lancer d’abord :\n  node scripts/build-cities-data.js');
    process.exit(2);
}

const villes = JSON.parse(fs.readFileSync(cheminVilles, 'utf8')).filter((v) => v.keep);
const nb = (n) => n.toLocaleString('fr-FR');
const INDISPO = '**non disponible**';

const l = [];

l.push('# Villes à rédiger : les 26 angles locaux');
l.push('');
l.push('Généré par `scripts/build-a-rediger.js`. Pour chaque ville, un paragraphe de');
l.push('120 à 180 mots à écrire à la main dans `editorial.localAngle` de');
l.push('`data/cities.json`.');
l.push('');
l.push('C’est ce paragraphe qui distingue une page locale légitime d’une doorway :');
l.push('tout le reste du gabarit est partagé entre les 26 pages.');
l.push('');
l.push('**Aucun chiffre inventé.** Les données ci-dessous viennent de');
l.push('`geo.api.gouv.fr` pour la population et le code INSEE, et de');
l.push('`recherche-entreprises.api.gouv.fr`, adossée à SIRENE, pour les');
l.push('établissements actifs et les sections d’activité. Tout champ marqué');
l.push('« non disponible » doit rester vide sur la page plutôt qu’être comblé.');
l.push('');
l.push('Deux limites connues :');
l.push('');
l.push('- l’API entreprises plafonne à 10 000 résultats, donc le nombre');
l.push('  d’établissements est inexploitable pour les six plus grosses communes ;');
l.push('- le temps de trajet depuis Bordeaux n’a aucune source automatique fiable.');
l.push('  La distance à vol d’oiseau est calculée sur les coordonnées INSEE, elle');
l.push('  est exacte, mais ce n’est pas un temps de trajet.');

for (const tier of [1, 2, 3]) {
    const duTier = villes.filter((v) => v.tier === tier);
    if (!duTier.length) continue;

    l.push('');
    l.push('---');
    l.push('');
    l.push(`## Tier ${tier} (${duTier.length} villes)`);

    for (const v of duTier) {
        l.push('');
        l.push(`### ${v.name}`);
        l.push('');
        l.push(
            `\`/consultant-seo-${v.slug}\` · ${v.zone || 'zone non renseignée'} · ` +
                `${v.zip || 'code postal inconnu'} · INSEE ${v.insee || 'inconnu'}`
        );
        l.push('');
        l.push('| Donnée | Valeur | Source |');
        l.push('|---|---|---|');
        l.push(
            `| Population | ${v.economy.population != null ? nb(v.economy.population) : INDISPO} | geo.api.gouv.fr |`
        );

        if (v.economy.businessCount != null) {
            l.push(
                `| Établissements actifs | ${nb(v.economy.businessCount)} | recherche-entreprises.api.gouv.fr |`
            );
        } else if (v.economy.businessCountCapped) {
            l.push(`| Établissements actifs | ${INDISPO}, API plafonnée à 10 000 | à sourcer autrement |`);
        } else {
            l.push(`| Établissements actifs | ${INDISPO} | |`);
        }

        l.push(
            `| Distance de Bordeaux | ${v.distanceBordeauxKm != null ? v.distanceBordeauxKm + ' km à vol d’oiseau' : INDISPO} | coordonnées INSEE |`
        );
        l.push(`| Temps de trajet | ${INDISPO} | à mesurer toi-même |`);

        l.push('');
        if (v.economy.topSectors && v.economy.topSectors.length) {
            l.push('**Secteurs dominants**');
            l.push('');
            v.economy.topSectors.forEach((s, i) => {
                l.push(`${i + 1}. ${s.libelle} : ${nb(s.nombre)} établissements`);
            });
        } else {
            l.push('**Secteurs dominants** : non disponibles pour cette commune.');
        }

        l.push('');
        if (v.coveredCommunes.length) {
            l.push(`**Communes couvertes (${v.coveredCommunes.length})**`);
            l.push('');
            l.push(v.coveredCommunes.join(', ') + '.');
        } else {
            l.push('**Communes couvertes** : aucune. Cette ville ne récupère aucune commune supprimée.');
        }

        l.push('');
        l.push(`**Villes voisines maillées** : ${v.neighbourCities.join(', ') || 'aucune'}`);

        l.push('');
        l.push('**Trois questions pour t’aider à écrire**');
        l.push('');
        l.push(`1. Quel type de client t’appelle depuis ${v.name}, et pour quel problème concret ?`);

        const premier = v.economy.topSectors && v.economy.topSectors[0];
        l.push(
            premier
                ? `2. Le premier secteur ici est « ${premier.libelle} ». Est-ce que ça correspond à ce que tu vois sur le terrain, ou la demande réelle est-elle ailleurs ?`
                : '2. Quel est le tissu économique de la commune, tel que tu le constates toi-même ?'
        );
        l.push(
            `3. Qu’est-ce qui change concrètement pour un client ${v.nameInLocative} par rapport à Bordeaux : concurrence, zone de chalandise, saisonnalité ?`
        );
    }
}

l.push('');

const contenu = l.join('\n');

if (!dryRun) {
    fs.mkdirSync(path.dirname(SORTIE), { recursive: true });
    fs.writeFileSync(SORTIE, contenu, 'utf8');
}

const sansEtab = villes.filter((v) => v.economy.businessCount == null);
console.log(`${dryRun ? '[dry-run] ' : ''}_refonte/a-rediger.md : ${villes.length} villes, ${contenu.split('\n').length} lignes`);
console.log(`  villes sans nombre d’établissements : ${sansEtab.length} (${sansEtab.map((v) => v.name).join(', ')})`);
console.log(`  mots à écrire au total : environ ${villes.length * 150}`);
