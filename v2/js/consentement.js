/* ============================================================
   Gestion du consentement aux traceurs.

   Le site ne charge Google Analytics qu'après un clic explicite sur
   « Accepter ». Avant ce clic, aucun script Google n'est appelé et aucun
   cookie n'est déposé : le refus est l'état par défaut, y compris pour qui
   ferme la page sans rien choisir.

   Deux catégories seulement, parce qu'il n'y en a que deux :
     - nécessaires : le choix de consentement lui-même et le brouillon d'un
       avis en cours de rédaction. Exemptés de consentement, non
       désactivables, jamais envoyés à un serveur.
     - mesure d'audience : Google Analytics 4.

   « Refuser tout » est au même niveau visuel que « Accepter tout », comme
   l'exige la CNIL : refuser doit coûter le même nombre de clics
   qu'accepter. Le choix est révocable à tout moment par le lien
   « Gérer mes cookies » du pied de page.
   ============================================================ */
(function () {
  'use strict';

  /* L'identifiant de mesure GA4, au format G-XXXXXXXXXX.
     Tant qu'il est vide, le gestionnaire fonctionne normalement mais aucun
     script Google n'est chargé : c'est la seule ligne à renseigner le jour
     où la propriété est créée. */
  var MESURE = '';

  var CLE = 'ac-consentement';
  var VERSION = 1;
  /* Validité du choix : 6 mois, la recommandation de la CNIL. Passé ce
     délai, la question est reposée une fois. */
  var VALIDITE = 182 * 24 * 60 * 60 * 1000;

  var memoire;
  try { memoire = window.localStorage; } catch (e) { memoire = null; }

  function lire() {
    if (!memoire) return null;
    try {
      var brut = JSON.parse(memoire.getItem(CLE) || 'null');
      if (!brut || brut.version !== VERSION || !brut.date) return null;
      if (Date.parse(brut.date) + VALIDITE < Date.now()) return null;
      return brut;
    } catch (e) { return null; }
  }

  function enregistrer(mesure) {
    if (memoire) {
      try {
        memoire.setItem(CLE, JSON.stringify({
          version: VERSION, date: new Date().toISOString(), mesure: !!mesure
        }));
      } catch (e) {}
    }
    appliquer(!!mesure);
  }

  /* ---------- Google Analytics, chargé au plus tôt au consentement ---------- */

  var gaCharge = false;

  function gtag() { window.dataLayer.push(arguments); }

  function appliquer(mesure) {
    if (!MESURE) return;
    window.dataLayer = window.dataLayer || [];

    if (!gaCharge) {
      /* Consent Mode : tout est refusé tant que rien n'a été accepté. Cette
         valeur par défaut doit être posée avant le chargement de gtag.js. */
      gtag('consent', 'default', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied'
      });
      if (!mesure) return;

      var s = document.createElement('script');
      s.async = true;
      s.src = 'https://www.googletagmanager.com/gtag/js?id=' + MESURE;
      document.head.appendChild(s);
      gtag('js', new Date());
      /* 13 mois : la durée maximale recommandée par la CNIL, là où GA4
         retiendrait 2 ans par défaut. C'est la durée annoncée dans la
         politique de confidentialité, les deux doivent rester alignées. */
      gtag('config', MESURE, { cookie_expires: 34128000 });
      gaCharge = true;
    }

    gtag('consent', 'update', { analytics_storage: mesure ? 'granted' : 'denied' });
  }

  /* ---------- Le panneau ---------- */

  var boite = null;

  function fermer() {
    if (!boite) return;
    var b = boite;
    boite = null;
    b.classList.remove('on');
    setTimeout(function () { b.remove(); }, 320);
  }

  function bloc(mesureActive) {
    return '' +
      '<p class="cc-t">Vos données, votre choix</p>' +
      '<p class="cc-p">Je mesure l\'audience de ce site pour savoir quels contenus ' +
      'vous servent vraiment. Cette mesure dépose des cookies, et elle ne démarre ' +
      'que si vous l\'acceptez. Rien d\'autre n\'est suivi, aucune publicité, ' +
      'aucune revente.</p>' +

      '<div class="cc-detail" id="cc-detail" hidden>' +
        '<div class="cc-cat">' +
          '<div class="cc-cat-h">' +
            '<span class="cc-cat-n">Strictement nécessaires</span>' +
            '<span class="cc-fixe">Toujours actifs</span>' +
          '</div>' +
          '<p>Votre choix de consentement, et le brouillon d\'un avis que vous ' +
          'seriez en train de rédiger. Stockés sur votre appareil, jamais envoyés.</p>' +
        '</div>' +
        '<div class="cc-cat">' +
          '<div class="cc-cat-h">' +
            '<label class="cc-sw" for="cc-mesure">' +
              '<input type="checkbox" id="cc-mesure"' + (mesureActive ? ' checked' : '') + '>' +
              '<span class="cc-piste" aria-hidden="true"></span>' +
              '<span class="cc-cat-n">Mesure d\'audience</span>' +
            '</label>' +
          '</div>' +
          '<p>Google Analytics 4 : pages vues, provenance, appareil. Cookies ' +
          '<code>_ga</code> et <code>_ga_&lt;id&gt;</code>, conservés 13 mois. ' +
          'Adresse IP tronquée par Google.</p>' +
        '</div>' +
      '</div>' +

      '<div class="cc-actions">' +
        '<button type="button" class="cc-b cc-refus" data-cc="refus">Refuser tout</button>' +
        '<button type="button" class="cc-b cc-ok" data-cc="tout">Accepter tout</button>' +
        '<button type="button" class="cc-lien" data-cc="perso" aria-expanded="false" aria-controls="cc-detail">Personnaliser</button>' +
        '<button type="button" class="cc-b cc-enr" data-cc="enregistrer" hidden>Enregistrer mes choix</button>' +
        '<a class="cc-lien" href="/confidentialite">En savoir plus</a>' +
      '</div>';
  }

  function ouvrir(choix) {
    if (boite) return;

    boite = document.createElement('aside');
    boite.className = 'cc';
    boite.setAttribute('role', 'dialog');
    boite.setAttribute('aria-label', 'Consentement aux cookies');
    boite.innerHTML = bloc(choix ? !!choix.mesure : false);
    document.body.appendChild(boite);
    requestAnimationFrame(function () { boite.classList.add('on'); });

    var detail = boite.querySelector('#cc-detail');
    var perso = boite.querySelector('[data-cc="perso"]');
    var enr = boite.querySelector('[data-cc="enregistrer"]');

    boite.addEventListener('click', function (e) {
      var b = e.target.closest('[data-cc]');
      if (!b) return;
      var action = b.dataset.cc;

      if (action === 'perso') {
        var ouvert = detail.hidden;
        detail.hidden = !ouvert;
        perso.setAttribute('aria-expanded', String(ouvert));
        enr.hidden = !ouvert;
        return;
      }
      if (action === 'tout') { enregistrer(true); fermer(); return; }
      if (action === 'refus') { enregistrer(false); fermer(); return; }
      if (action === 'enregistrer') {
        enregistrer(boite.querySelector('#cc-mesure').checked);
        fermer();
      }
    });
  }

  /* ---------- Démarrage ---------- */

  var choix = lire();
  if (choix) appliquer(!!choix.mesure);

  /* Le lien « Gérer mes cookies » du pied de page rouvre le panneau, avec
     l'état courant pré-coché et le détail déjà déplié. */
  document.addEventListener('click', function (e) {
    var l = e.target.closest('[data-gerer-cookies]');
    if (!l) return;
    e.preventDefault();
    if (boite) { fermer(); return; }
    ouvrir(lire());
    var p = boite && boite.querySelector('[data-cc="perso"]');
    if (p) p.click();
  });

  if (!choix) {
    /* Laisser la page se poser d'abord : le panneau ne bloque rien et ne
       doit pas entrer dans le premier rendu. */
    var lancer = function () { setTimeout(function () { ouvrir(null); }, 900); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', lancer);
    else lancer();
  }
})();
