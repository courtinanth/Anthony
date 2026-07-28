/**
 * Bascule de thème clair / sombre.
 *
 * Trois états possibles :
 *   - aucun choix stocké  -> on suit prefers-color-scheme (défaut)
 *   - "light" / "dark"    -> le choix de l'utilisateur gagne sur le système
 *
 * L'attribut data-theme est posé sur <html> par le script inline du <head>
 * (voir themeInline dans build/partials) AVANT le premier rendu : sans ça, une
 * page sombre s'affiche une fraction de seconde en clair au chargement.
 * Ce fichier-ci ne gère que le bouton.
 */
(function () {
  'use strict';

  var CLE = 'ac-theme';
  var racine = document.documentElement;

  function systemeSombre() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  /** Thème réellement appliqué, choix stocké ou préférence système. */
  function themeCourant() {
    var stocke = null;
    try { stocke = localStorage.getItem(CLE); } catch (e) { /* mode privé */ }
    if (stocke === 'dark' || stocke === 'light') return stocke;
    return systemeSombre() ? 'dark' : 'light';
  }

  function appliquer(theme, bouton) {
    racine.setAttribute('data-theme', theme);
    try { localStorage.setItem(CLE, theme); } catch (e) { /* mode privé */ }
    if (bouton) majBouton(bouton, theme);
  }

  function majBouton(bouton, theme) {
    var versSombre = theme === 'light';
    bouton.setAttribute(
      'aria-label',
      versSombre ? 'Activer le thème sombre' : 'Activer le thème clair'
    );
    bouton.setAttribute('aria-pressed', String(theme === 'dark'));
    var usage = bouton.querySelector('use');
    if (usage) {
      usage.setAttribute('href', versSombre ? '/img/icons.svg#lune' : '/img/icons.svg#soleil');
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var bouton = document.querySelector('[data-theme-toggle]');
    if (!bouton) return;

    majBouton(bouton, themeCourant());

    bouton.addEventListener('click', function () {
      appliquer(themeCourant() === 'dark' ? 'light' : 'dark', bouton);
    });

    // Si l'utilisateur n'a rien choisi, on continue de suivre le système
    // quand il change (bascule automatique jour/nuit de l'OS).
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var ecouter = mq.addEventListener ? mq.addEventListener.bind(mq, 'change') : mq.addListener.bind(mq);
    ecouter(function () {
      var stocke = null;
      try { stocke = localStorage.getItem(CLE); } catch (e) { /* mode privé */ }
      if (!stocke) majBouton(bouton, systemeSombre() ? 'dark' : 'light');
    });
  });
})();
