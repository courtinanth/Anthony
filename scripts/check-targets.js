#!/usr/bin/env node
'use strict';

/**
 * check-targets.js — vérifie que les cibles interactives font au moins
 * 44 × 44 px, exigence de la charte §7.
 *
 * Deux exemptions, toutes deux prévues par WCAG 2.5.8 :
 *   - un lien à l'intérieur d'un bloc de texte (sa taille suit la ligne) ;
 *   - un lien dont la zone cliquable réelle est étendue par un pseudo-élément,
 *     comme .c-card__lien dont le ::after couvre toute la carte. Mesurer la
 *     boîte du <a> donnerait un faux positif.
 *
 * Usage :
 *   node scripts/check-targets.js [--base http://localhost:8888] [--json]
 */

const args = process.argv.slice(2);
const lireArg = (n, d) => {
    const i = args.indexOf(n);
    return i !== -1 && args[i + 1] ? args[i + 1] : d;
};
const BASE = lireArg('--base', 'http://localhost:8888').replace(/\/$/, '');
const enJson = args.includes('--json');
const MINI = 44;

const PAGES = ['/dev/styleguide'];

(async () => {
    let chromium;
    try {
        ({ chromium } = require('playwright'));
    } catch {
        console.error('playwright manquant : npm i -D playwright && npx playwright install chromium');
        process.exit(2);
    }

    try {
        await fetch(BASE + '/');
    } catch {
        console.error(`Serveur injoignable sur ${BASE}.`);
        process.exit(2);
    }

    const navigateur = await chromium.launch();
    const petites = [];

    for (const theme of ['light', 'dark']) {
        for (const chemin of PAGES) {
            const ctx = await navigateur.newContext({
                viewport: { width: 1280, height: 900 },
                colorScheme: theme,
            });
            const page = await ctx.newPage();
            await page.goto(BASE + chemin, { waitUntil: 'networkidle' });

            const trouvees = await page.evaluate((mini) => {
                var SEL = 'a,button,input,select,textarea,summary,[tabindex]:not([tabindex="-1"])';
                var out = [];
                document.querySelectorAll(SEL).forEach(function (el) {
                    var b = el.getBoundingClientRect();
                    if (b.width === 0 && b.height === 0) return;
                    if (el.closest('p, li, td, blockquote, .c-breadcrumb, .c-toc, .c-footer')) return;

                    // Zone cliquable étendue par un ::after qui couvre le parent.
                    var apres = getComputedStyle(el, '::after');
                    if (apres && apres.content !== 'none' && apres.position === 'absolute') {
                        var parent = el.closest('.c-card') || el.parentElement;
                        if (parent) {
                            var pb = parent.getBoundingClientRect();
                            if (pb.height >= mini && pb.width >= mini) return;
                        }
                    }

                    if (b.height < mini || b.width < mini) {
                        out.push({
                            tag: el.tagName.toLowerCase(),
                            classe: String(el.className || '').slice(0, 50),
                            texte: (el.textContent || '').trim().slice(0, 40),
                            l: Math.round(b.width),
                            h: Math.round(b.height),
                        });
                    }
                });
                return out;
            }, MINI);

            for (const t of trouvees) petites.push({ ...t, theme, chemin });
            await ctx.close();
        }
    }
    await navigateur.close();

    if (enJson) {
        process.stdout.write(JSON.stringify({ mini: MINI, petites }, null, 2) + '\n');
    } else if (petites.length === 0) {
        console.log(`CIBLES TACTILES OK — toutes ≥ ${MINI} × ${MINI} px, sur les deux thèmes.`);
    } else {
        console.log(`ÉCHEC — ${petites.length} cibles sous ${MINI} px :`);
        for (const p of petites) {
            console.log(`  ${p.theme}  ${p.tag}.${p.classe}  ${p.l}×${p.h}  « ${p.texte} »`);
        }
    }

    process.exit(petites.length ? 1 : 0);
})();
