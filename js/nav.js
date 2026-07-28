/**
 * Navigation : burger accessible sous 768 px, et réduction du header au scroll.
 *
 * Exigences de la charte §6 : aria-expanded, piège de focus, fermeture par Échap.
 */
(function () {
  'use strict';

  var SELECTEURS_FOCUSABLES =
    'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

  document.addEventListener('DOMContentLoaded', function () {
    var burger = document.querySelector('[data-burger]');
    var nav = document.querySelector('[data-nav]');
    var header = document.querySelector('[data-header]');

    if (burger && nav) {
      var ouvert = false;

      var majIcone = function () {
        var usage = burger.querySelector('use');
        if (usage) usage.setAttribute('href', ouvert ? '/img/icons.svg#fermer' : '/img/icons.svg#menu');
      };

      var basculer = function (etat) {
        ouvert = etat;
        burger.setAttribute('aria-expanded', String(ouvert));
        burger.setAttribute('aria-label', ouvert ? 'Fermer le menu' : 'Ouvrir le menu');
        nav.hidden = !ouvert;
        majIcone();
        // On ne bloque le défilement que sur mobile, où la nav couvre l'écran.
        document.body.style.overflow = ouvert ? 'hidden' : '';
        if (ouvert) {
          var premier = nav.querySelector(SELECTEURS_FOCUSABLES);
          if (premier) premier.focus();
        }
      };

      burger.addEventListener('click', function () { basculer(!ouvert); });

      document.addEventListener('keydown', function (e) {
        if (!ouvert) return;

        if (e.key === 'Escape') {
          basculer(false);
          burger.focus();
          return;
        }

        // Piège de focus : Tab ne doit pas sortir du panneau ouvert.
        if (e.key !== 'Tab') return;
        var cibles = Array.prototype.filter.call(
          nav.querySelectorAll(SELECTEURS_FOCUSABLES),
          function (el) { return el.offsetParent !== null; }
        );
        cibles.unshift(burger);
        if (!cibles.length) return;
        var premier = cibles[0];
        var dernier = cibles[cibles.length - 1];
        if (e.shiftKey && document.activeElement === premier) {
          e.preventDefault();
          dernier.focus();
        } else if (!e.shiftKey && document.activeElement === dernier) {
          e.preventDefault();
          premier.focus();
        }
      });

      // Repasser en desktop doit remettre la nav visible et débloquer le corps.
      var mq = window.matchMedia('(min-width: 48rem)');
      var surChangement = function (e) {
        if (e.matches && ouvert) basculer(false);
        if (e.matches) nav.hidden = false;
        else if (!ouvert) nav.hidden = true;
      };
      if (mq.addEventListener) mq.addEventListener('change', surChangement);
      else mq.addListener(surChangement);
      surChangement(mq);
    }

    // Réduction de hauteur au scroll, sans écouteur bloquant.
    if (header) {
      var dernier = 0;
      var enAttente = false;
      window.addEventListener(
        'scroll',
        function () {
          if (enAttente) return;
          enAttente = true;
          requestAnimationFrame(function () {
            var y = window.scrollY;
            if ((y > 80) !== (dernier > 80)) {
              header.setAttribute('data-reduit', String(y > 80));
            }
            dernier = y;
            enAttente = false;
          });
        },
        { passive: true }
      );
    }
  });
})();
