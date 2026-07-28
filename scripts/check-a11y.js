#!/usr/bin/env node
'use strict';

/**
 * check-a11y.js — audit d'accessibilité réel, via axe-core dans Chromium.
 *
 * Pourquoi un vrai navigateur : les violations qui comptent (contraste calculé,
 * nom accessible, ordre de focus, cibles tactiles) dépendent du rendu. Un
 * contrôle sur le HTML source ne les voit pas. Screaming Frog ne peut pas les
 * mesurer ici non plus, son audit passe par l'API Lighthouse de Google, qui ne
 * sait pas atteindre localhost.
 *
 * Périmètre : un échantillon représentatif plutôt que les 713 pages, puisque
 * les pages villes partagent le même gabarit. Passer --toutes pour tout auditer.
 *
 * Usage :
 *   node scripts/check-a11y.js [--base http://localhost:8888] [--toutes] [--json]
 *
 * Nécessite `npx netlify dev --dir . --port 8888 --offline` en parallèle.
 */

const fs = require('fs');
const path = require('path');
const L = require('./lib/slugs.js');

const args = process.argv.slice(2);
const lireArg = (n, d) => {
    const i = args.indexOf(n);
    return i !== -1 && args[i + 1] ? args[i + 1] : d;
};
const BASE = lireArg('--base', 'http://localhost:8888').replace(/\/$/, '');
const enJson = args.includes('--json');
const toutes = args.includes('--toutes');

// Les règles de la charte : WCAG 2.1 AA, plus les bonnes pratiques.
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'];

/** Une page par gabarit, plus les pages singulières. */
function echantillon() {
    if (toutes) {
        const out = ['/'];
        for (const f of L.fichiersVilles()) out.push('/villes/' + f.replace(/\.html$/, ''));
        for (const f of fs.readdirSync(L.RACINE)) {
            if (f.endsWith('.html') && !f.startsWith('googled')) {
                out.push(f === 'index.html' ? '/' : '/' + f.replace(/\.html$/, ''));
            }
        }
        return [...new Set(out)];
    }
    return [
        '/dev/styleguide',                     // tous les composants du design system
        '/',                                   // home
        '/contact',                            // formulaire
        '/audit-seo-bordeaux',                 // page service racine
        '/agences-seo',                        // tableau d'agences
        '/blog/',                              // liste d'articles
        '/blog/guide-seo-local-2026',          // article
        '/villes/audit-seo-merignac',          // gabarit ville, silo service
        '/villes/agence-seo-arcachon',         // gabarit ville, silo agence
        '/plan-du-site',                       // page à forte densité de liens
        '/mentions-legales',                   // page de texte
        '/404',                                // page d'erreur
    ];
}

(async () => {
    let chromium, AxeBuilder;
    try {
        ({ chromium } = require('playwright'));
        AxeBuilder = require('@axe-core/playwright').default;
    } catch (e) {
        console.error(
            'Dépendances manquantes. Installer :\n  npm i -D @axe-core/playwright playwright\n  npx playwright install chromium'
        );
        process.exit(2);
    }

    try {
        await fetch(BASE + '/');
    } catch {
        console.error(`Serveur injoignable sur ${BASE}.\nLancer : npx netlify dev --dir . --port 8888 --offline`);
        process.exit(2);
    }

    const pages = echantillon();
    const navigateur = await chromium.launch();
    const resultats = [];

    // Les deux thèmes sont audités : un contraste peut passer en clair et
    // échouer en sombre. C'est exactement ce qui est arrivé au bouton primaire.
    for (const theme of ['light', 'dark']) {
        for (const chemin of pages) {
            const ctx = await navigateur.newContext({
                viewport: { width: 1280, height: 900 },
                colorScheme: theme,
            });
            const page = await ctx.newPage();
            try {
                await page.goto(BASE + chemin, { waitUntil: 'domcontentloaded', timeout: 20000 });
                const r = await new AxeBuilder({ page }).withTags(TAGS).analyze();
                resultats.push({
                    chemin,
                    theme,
                    violations: r.violations.map((v) => ({
                        regle: v.id,
                        impact: v.impact,
                        description: v.help,
                        noeuds: v.nodes.length,
                        exemple: v.nodes[0] ? v.nodes[0].html.slice(0, 120) : null,
                        tags: v.tags.filter((t) => t.startsWith('wcag')),
                    })),
                });
            } catch (e) {
                resultats.push({ chemin, theme, erreur: e.message });
            }
            await ctx.close();
        }
    }
    await navigateur.close();

    // Agrégation par règle : c'est ce qui se corrige, pas la page.
    const parRegle = new Map();
    for (const r of resultats) {
        for (const v of r.violations || []) {
            const e = parRegle.get(v.regle) || {
                regle: v.regle,
                impact: v.impact,
                description: v.description,
                pages: 0,
                noeuds: 0,
                exemple: v.exemple,
                wcag: v.tags,
            };
            e.pages++;
            e.noeuds += v.noeuds;
            parRegle.set(v.regle, e);
        }
    }
    const ordre = { critical: 0, serious: 1, moderate: 2, minor: 3 };
    const regles = [...parRegle.values()].sort(
        (a, b) => (ordre[a.impact] ?? 9) - (ordre[b.impact] ?? 9) || b.noeuds - a.noeuds
    );

    const bloquantes = regles.filter((r) => r.impact === 'critical' || r.impact === 'serious');
    const rapport = {
        base: BASE,
        pagesAuditees: pages.length,
        reglesEnEchec: regles.length,
        violationsTotales: regles.reduce((a, r) => a + r.noeuds, 0),
        bloquantes: bloquantes.length,
        regles,
        erreurs: resultats.filter((r) => r.erreur),
    };

    if (enJson) {
        process.stdout.write(JSON.stringify(rapport, null, 2) + '\n');
    } else {
        console.log('');
        console.log(`pages auditées      : ${rapport.pagesAuditees} × 2 thèmes`);
        console.log(`règles en échec     : ${rapport.reglesEnEchec}`);
        console.log(`éléments en faute   : ${rapport.violationsTotales}`);
        console.log('');
        if (regles.length === 0) {
            console.log('Aucune violation WCAG 2.1 AA détectée.');
        } else {
            console.log('IMPACT    PAGES  ÉLÉM.  RÈGLE');
            for (const r of regles) {
                console.log(
                    `${(r.impact || '?').padEnd(9)} ${String(r.pages).padStart(5)} ${String(r.noeuds).padStart(6)}  ${r.regle}`
                );
                console.log(`                        ${r.description}`);
                if (r.exemple) console.log(`                        ex. ${r.exemple}`);
            }
        }
        for (const e of rapport.erreurs) console.log(`\nERREUR ${e.chemin} : ${e.erreur}`);
    }

    process.exit(bloquantes.length ? 1 : 0);
})();
