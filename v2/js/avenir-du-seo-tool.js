/* Diagnostic de préparation pour l'article avenir-du-seo.
   100 % navigateur, aucun appel réseau. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var liste = $('avs-check'), score = $('avs-score'), meter = $('avs-meter'),
      out = $('avs-out'), copy = $('avs-copy');
  if (!liste || !score) return;

  var cases = Array.prototype.slice.call(liste.querySelectorAll('input[type="checkbox"]'));

  var PALIERS = [
    { min: 8, titre: 'Vous êtes en avance',
      texte: "Votre site coche l'essentiel de ce qui comptera dans les deux ans. Le travail restant est d'entretien : mesurer les citations dans les moteurs de réponse et tenir la fraîcheur des pages qui portent le trafic." },
    { min: 6, titre: 'Bonne base, deux chantiers devant vous',
      texte: "Les fondations tiennent. Ce qui manque relève surtout de la citabilité : structurer les réponses pour qu'un modèle puisse les reprendre sans les déformer, et rendre vos données vérifiables." },
    { min: 4, titre: 'Vous êtes dans la moyenne, donc exposé',
      texte: "Votre SEO fonctionne selon les règles d'hier. C'est exactement le profil qui perd du trafic quand les réponses générées absorbent les clics d'information. Priorisez la valeur propriétaire : ce que vous seul pouvez écrire." },
    { min: 0, titre: 'Le rattrapage commence par les bases',
      texte: "Avant de parler d'IA, il reste du SEO classique à faire : indexation, intention de recherche, contenu qui répond vraiment. Ces fondations n'ont pas disparu, elles conditionnent tout le reste." }
  ];

  function calcul() {
    var n = cases.filter(function (c) { return c.checked; }).length;
    score.textContent = n + ' / ' + cases.length;
    if (meter) meter.style.width = Math.round((n / cases.length) * 100) + '%';

    var p = PALIERS[PALIERS.length - 1];
    for (var i = 0; i < PALIERS.length; i++) { if (n >= PALIERS[i].min) { p = PALIERS[i]; break; } }

    if (out) {
      out.textContent = '';
      var t = document.createElement('strong'); t.textContent = p.titre;
      var d = document.createElement('p'); d.textContent = p.texte;
      out.appendChild(t); out.appendChild(d);
    }
    return { n: n, p: p };
  }

  function copier() {
    var r = calcul();
    var manquants = cases.filter(function (c) { return !c.checked; })
      .map(function (c) { var l = c.closest('label'); return '- ' + (l ? l.textContent.trim() : ''); });
    var texte = ['Diagnostic : ' + r.n + ' critère(s) sur ' + cases.length, '', r.p.titre, r.p.texte, '',
      manquants.length ? 'Ce qui reste à faire :' : 'Rien ne manque.']
      .concat(manquants)
      .concat(['', 'Source : anthony-courtin.com/blog/avenir-du-seo']).join('\n');
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
