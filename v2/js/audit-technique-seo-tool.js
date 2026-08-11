/* Priorisation des problèmes techniques par impact.
   Article audit-technique-seo. 100 % navigateur, aucun appel réseau. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var liste = $('ats-check'), score = $('ats-score'), meter = $('ats-meter'),
      out = $('ats-out'), copy = $('ats-copy');
  if (!liste || !out) return;

  var cases = Array.prototype.slice.call(liste.querySelectorAll('input[type="checkbox"]'));

  function libelle(c) {
    var l = c.closest('label');
    return l ? l.textContent.trim() : '';
  }

  function calcul() {
    var coches = cases.filter(function (c) { return c.checked; });
    var poids = coches.reduce(function (s, c) { return s + (parseInt(c.dataset.p, 10) || 0); }, 0);
    var max = cases.reduce(function (s, c) { return s + (parseInt(c.dataset.p, 10) || 0); }, 0);

    score.textContent = poids + ' pts';
    if (meter) meter.style.width = Math.round((poids / max) * 100) + '%';

    /* Tri décroissant par poids : l'ordre de traitement, pas l'ordre de la liste. */
    var ordre = coches.slice().sort(function (a, b) {
      return (parseInt(b.dataset.p, 10) || 0) - (parseInt(a.dataset.p, 10) || 0);
    });

    out.textContent = '';
    if (!ordre.length) {
      var vide = document.createElement('p');
      vide.textContent = "Cochez les problèmes relevés sur votre site. L'outil les reclasse par impact réel, qui n'est pas l'ordre dans lequel un rapport d'outil vous les présente.";
      out.appendChild(vide);
      return { poids: poids, ordre: ordre };
    }

    var titre = document.createElement('strong');
    titre.textContent = poids >= 30 ? 'Chantier lourd : traitez dans cet ordre'
      : poids >= 15 ? 'Situation courante : trois priorités'
      : 'Peu de dette technique, corrigez au fil de l\'eau';
    out.appendChild(titre);

    var ol = document.createElement('ol');
    ordre.forEach(function (c) {
      var li = document.createElement('li');
      li.textContent = libelle(c) + ' (' + c.dataset.p + ' pts)';
      ol.appendChild(li);
    });
    out.appendChild(ol);

    return { poids: poids, ordre: ordre };
  }

  function copier() {
    var r = calcul();
    var texte = ['Priorisation de mon audit technique : ' + r.poids + ' points', '']
      .concat(r.ordre.length
        ? r.ordre.map(function (c, i) { return (i + 1) + '. ' + libelle(c) + ' (' + c.dataset.p + ' pts)'; })
        : ['Aucun problème coché.'])
      .concat(['', 'Source : anthony-courtin.com/blog/audit-technique-seo']).join('\n');
    var fini = function (ok) {
      if (!copy) return;
      var a = copy.textContent;
      copy.textContent = ok ? 'Copié' : 'Copie impossible';
      setTimeout(function () { copy.textContent = a; }, 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texte).then(function () { fini(true); }, function () { fini(false); });
    } else { fini(false); }
  }

  cases.forEach(function (c) { c.addEventListener('change', calcul); });
  if (copy) copy.addEventListener('click', copier);
  calcul();
})();
