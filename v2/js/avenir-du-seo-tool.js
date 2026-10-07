/* SEO ou GEO : par quoi commencer ? (article avenir-du-seo, « GEO vs SEO »).
   Deux scores (socle SEO, couche GEO), une priorité et trois actions à copier.
   100 % navigateur, aucun appel réseau. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var liste = $('avs-check'), out = $('avs-out'), copy = $('avs-copy');
  var scoreSeo = $('avs-seo'), scoreGeo = $('avs-geo');
  var meterSeo = $('avs-meter-seo'), meterGeo = $('avs-meter-geo');
  if (!liste || !out || !scoreSeo || !scoreGeo) return;

  var cases = Array.prototype.slice.call(liste.querySelectorAll('input[type="checkbox"]'));

  var VERDICTS = {
    seo: {
      titre: 'Priorité au SEO',
      texte: "Le socle n'est pas encore en place. Les moteurs génératifs puisent leurs sources dans les index de recherche : sans indexation ni positions, aucune optimisation GEO ne sera vue. Commencez par le SEO, la couche GEO viendra ensuite."
    },
    geo: {
      titre: 'Priorité au GEO',
      texte: "Votre socle SEO tient. Le gain le plus rapide est maintenant la citation : des pages faciles à reprendre, des preuves datées et une marque visible en dehors de votre site."
    },
    deux: {
      titre: 'SEO et GEO en place : mesurez et entretenez',
      texte: "Les deux couches sont solides. Le travail devient régulier : mettre à jour les pages qui rapportent, suivre les impressions IA dans la Search Console et relever chaque mois votre panel de questions."
    }
  };

  function scoreDe(axe) {
    return cases.reduce(function (t, c) {
      return t + (c.dataset.axe === axe && c.checked ? (parseInt(c.dataset.p, 10) || 0) : 0);
    }, 0);
  }

  function manquants(axe) {
    return cases.filter(function (c) { return c.dataset.axe === axe && !c.checked; })
      .sort(function (a, b) { return (parseInt(b.dataset.p, 10) || 0) - (parseInt(a.dataset.p, 10) || 0); })
      .map(function (c) { return c.dataset.a; });
  }

  function calcul() {
    var s = scoreDe('seo'), g = scoreDe('geo');
    scoreSeo.textContent = s;
    scoreGeo.textContent = g;
    if (meterSeo) meterSeo.style.width = s + '%';
    if (meterGeo) meterGeo.style.width = g + '%';

    var cle = s < 60 ? 'seo' : (g < 60 ? 'geo' : 'deux');
    var ordre = cle === 'geo' ? manquants('geo').concat(manquants('seo'))
                              : manquants('seo').concat(manquants('geo'));
    var actions = ordre.slice(0, 3);
    if (!actions.length) {
      actions = ['Relever chaque mois votre panel de questions dans ChatGPT, Perplexity et Google.',
                 'Mettre à jour en priorité les pages qui génèrent du chiffre d\'affaires.'];
    }

    out.textContent = '';
    var t = document.createElement('strong'); t.textContent = VERDICTS[cle].titre;
    var d = document.createElement('p'); d.textContent = VERDICTS[cle].texte;
    var ol = document.createElement('ol');
    actions.forEach(function (a) { var li = document.createElement('li'); li.textContent = a; ol.appendChild(li); });
    out.appendChild(t); out.appendChild(d); out.appendChild(ol);

    return { s: s, g: g, v: VERDICTS[cle], actions: actions };
  }

  function copier() {
    var r = calcul();
    var texte = ['Socle SEO : ' + r.s + '/100 · Couche GEO : ' + r.g + '/100', '',
      r.v.titre, r.v.texte, '', 'Mes trois prochaines actions :']
      .concat(r.actions.map(function (a, i) { return (i + 1) + '. ' + a; }))
      .concat(['', 'Source : anthony-courtin.com/blog/avenir-du-seo']).join('\n');
    var fini = function (ok) {
      if (!copy) return;
      var a = copy.textContent;
      copy.textContent = ok ? 'Copié ✓' : 'Copie impossible';
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
