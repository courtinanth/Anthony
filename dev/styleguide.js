/**
 * Génère les échantillons du styleguide et affiche le ratio de contraste
 * réellement calculé pour chaque couleur. Page de développement uniquement.
 */
(function () {
  'use strict';

  var NEUTRES = ['n-0', 'n-50', 'n-100', 'n-200', 'n-300', 'n-400', 'n-500', 'n-700', 'n-900', 'n-950'];
  var ACCENT = ['accent-50', 'accent-200', 'accent-400', 'accent-500', 'accent-600', 'accent-800'];
  var SEMANTIQUES = ['success', 'warning', 'danger', 'info'];
  var ICONES = [
    'audit', 'technique', 'netlinking', 'local', 'redaction', 'blackhat',
    'soleil', 'lune', 'menu', 'fermer', 'chevron-bas', 'chevron-droite',
    'check', 'fleche-droite', 'mail', 'telephone', 'etoile', 'citation'
  ];

  function valeurToken(nom) {
    return getComputedStyle(document.documentElement).getPropertyValue('--' + nom).trim();
  }

  /** '#rrggbb' ou 'rgb(...)' -> [r,g,b] */
  function versRgb(couleur) {
    if (couleur.charAt(0) === '#') {
      var h = couleur.slice(1);
      if (h.length === 3) h = h.charAt(0) + h.charAt(0) + h.charAt(1) + h.charAt(1) + h.charAt(2) + h.charAt(2);
      return [0, 2, 4].map(function (i) { return parseInt(h.substr(i, 2), 16); });
    }
    var m = couleur.match(/-?\d+(\.\d+)?/g);
    return m ? m.slice(0, 3).map(Number) : [0, 0, 0];
  }

  function luminance(couleur) {
    var c = versRgb(couleur).map(function (v) {
      var s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }

  function ratio(a, b) {
    var la = luminance(a), lb = luminance(b);
    var haut = Math.max(la, lb), bas = Math.min(la, lb);
    return (haut + 0.05) / (bas + 0.05);
  }

  function echantillon(nom) {
    var valeur = valeurToken(nom);
    var fond = getComputedStyle(document.body).backgroundColor;
    var r = ratio(valeur, fond);
    var verdict = r >= 4.5 ? 'AA texte' : r >= 3 ? 'AA interface' : 'décoratif';

    var bloc = document.createElement('div');
    bloc.className = 'c-card';
    bloc.style.padding = 'var(--sp-3)';
    bloc.style.gap = 'var(--sp-2)';

    var pastille = document.createElement('div');
    pastille.style.height = '3rem';
    pastille.style.borderRadius = 'var(--r-md)';
    pastille.style.background = 'var(--' + nom + ')';
    pastille.style.border = '1px solid var(--bordure)';

    var titre = document.createElement('p');
    titre.className = 'u-sm u-fort';
    titre.style.margin = '0';
    titre.textContent = '--' + nom;

    var meta = document.createElement('p');
    meta.className = 'u-xs u-doux';
    meta.style.margin = '0';
    meta.textContent = valeur.toUpperCase() + ' · ' + r.toFixed(2) + ':1 · ' + verdict;

    bloc.appendChild(pastille);
    bloc.appendChild(titre);
    bloc.appendChild(meta);
    return bloc;
  }

  function remplir(cle, noms) {
    var hote = document.querySelector('[data-echantillons="' + cle + '"]');
    if (!hote) return;
    hote.textContent = '';
    noms.forEach(function (n) { hote.appendChild(echantillon(n)); });
  }

  function remplirIcones() {
    var hote = document.querySelector('[data-echantillons="icones"]');
    if (!hote) return;
    hote.textContent = '';
    ICONES.forEach(function (nom) {
      var bloc = document.createElement('div');
      bloc.style.textAlign = 'center';
      bloc.style.minWidth = '5rem';
      bloc.innerHTML =
        '<svg class="c-icone c-icone--lg" aria-hidden="true" style="margin-inline:auto">' +
        '<use href="/img/icons.svg#' + nom + '"></use></svg>' +
        '<span class="u-xs u-doux">' + nom + '</span>';
      hote.appendChild(bloc);
    });
  }

  function tout() {
    remplir('neutres', NEUTRES);
    remplir('accent', ACCENT);
    remplir('semantiques', SEMANTIQUES);
    remplirIcones();
  }

  document.addEventListener('DOMContentLoaded', function () {
    tout();
    // Les ratios changent avec le thème : on les recalcule à chaque bascule.
    new MutationObserver(tout).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
  });
})();
