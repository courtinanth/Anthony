'use strict';

// Calcul de contraste WCAG 2.1 (luminance relative + ratio).
// Utilisé par check-contrast.js et verify.js : la charte impose de vérifier
// les paires par calcul, jamais à l'œil.

/** '#RRGGBB' ou '#RGB' -> [r, g, b] sur 0-255. */
function versRgb(hex) {
    let h = hex.trim().replace('#', '');
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    if (!/^[0-9a-f]{6}$/i.test(h)) throw new Error(`Couleur invalide : ${hex}`);
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

/** Luminance relative, formule WCAG 2.1. */
function luminance(hex) {
    const [r, g, b] = versRgb(hex).map((v) => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Ratio de contraste entre deux couleurs, de 1 à 21. */
function ratio(a, b) {
    const la = luminance(a);
    const lb = luminance(b);
    const [clair, sombre] = la > lb ? [la, lb] : [lb, la];
    return (clair + 0.05) / (sombre + 0.05);
}

/**
 * Niveau atteint pour un usage donné.
 * 'corps'     : texte courant, seuil AA 4,5 / AAA 7
 * 'grand'     : texte >= 24px ou >= 18,66px gras, seuil AA 3 / AAA 4,5
 * 'interface' : bordures de champ, icônes porteuses de sens, seuil 3
 */
function niveau(r, usage = 'corps') {
    const seuils = {
        corps: { AA: 4.5, AAA: 7 },
        grand: { AA: 3, AAA: 4.5 },
        interface: { AA: 3, AAA: 3 },
    }[usage];
    if (r >= seuils.AAA) return 'AAA';
    if (r >= seuils.AA) return 'AA';
    return 'ÉCHEC';
}

module.exports = { versRgb, luminance, ratio, niveau };
