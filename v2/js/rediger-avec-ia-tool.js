/* Détecteur de texte non retravaillé pour l'article rediger-avec-ia.
   100 % navigateur, aucun appel réseau. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var liste = $('rai-check'), score = $('rai-score'), meter = $('rai-meter'),
      out = $('rai-out'), copy = $('rai-copy');
  if (!liste || !out) return;

  var cases = Array.prototype.slice.call(liste.querySelectorAll('input[type="checkbox"]'));

  function calcul() {
    var coches = cases.filter(function (c) { return c.checked; });
    var n = coches.length;
    score.textContent = n + ' signe' + (n > 1 ? 's' : '');
    if (meter) meter.style.width = Math.round((n / cases.length) * 100) + '%';

    var titre, texte;
    if (n === 0) {
      titre = 'Rien à signaler';
      texte = "Le texte porte les marques d'un vrai travail éditorial. Passez à la vérification des faits, qui est l'autre moitié du travail.";
    } else if (n <= 2) {
      titre = 'Retouches ponctuelles';
      texte = "Deux ou trois passages à reprendre, pas davantage. Corrigez les signes cochés et le texte tiendra.";
    } else if (n <= 5) {
      titre = 'Reprise éditoriale nécessaire';
      texte = "Le texte est utilisable comme matière première mais pas comme livrable. Reprenez-le paragraphe par paragraphe en supprimant plutôt qu'en ajoutant.";
    } else {
      titre = 'À réécrire depuis le plan';
      texte = "Trop de signes se cumulent : corriger coûtera plus cher que reprendre. Gardez le plan et la documentation, jetez la rédaction.";
    }

    out.textContent = '';
    var t = document.createElement('strong'); t.textContent = titre;
    var p = document.createElement('p'); p.textContent = texte;
    out.appendChild(t); out.appendChild(p);

    if (coches.length) {
      var h = document.createElement('p'); h.textContent = 'À traiter en priorité :';
      var ul = document.createElement('ul');
      coches.forEach(function (c) {
        var li = document.createElement('li');
        li.textContent = c.dataset.fix || '';
        ul.appendChild(li);
      });
      out.appendChild(h); out.appendChild(ul);
    }
    return { n: n, titre: titre, texte: texte, coches: coches };
  }

  function copier() {
    var r = calcul();
    var texte = ['Contrôle du texte : ' + r.n + ' signe(s) relevé(s)', '', r.titre, r.texte, '']
      .concat(r.coches.length
        ? ['Corrections :'].concat(r.coches.map(function (c) { return '- ' + (c.dataset.fix || ''); }))
        : ['Aucune correction nécessaire.'])
      .concat(['', 'Source : anthony-courtin.com/blog/rediger-avec-ia']).join('\n');
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
