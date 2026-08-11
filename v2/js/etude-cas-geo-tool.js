/* Grille de crédibilité d'une étude de cas GEO.
   Article etude-cas-geo. 100 % navigateur, aucun appel réseau. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var liste = $('ecg-check'), score = $('ecg-score'), meter = $('ecg-meter'),
      out = $('ecg-out'), copy = $('ecg-copy');
  if (!liste || !out) return;

  var cases = Array.prototype.slice.call(liste.querySelectorAll('input[type="checkbox"]'));

  function calcul() {
    var n = cases.filter(function (c) { return c.checked; }).length;
    score.textContent = n + ' / ' + cases.length;
    if (meter) meter.style.width = Math.round((n / cases.length) * 100) + '%';

    var titre, texte;
    if (n >= 7) {
      titre = 'Étude de cas solide';
      texte = "Les conditions de la mesure sont posées et le résultat est reproductible. Vous pouvez vous en servir comme repère pour votre propre projet.";
    } else if (n >= 5) {
      titre = 'Crédible, avec des zones d\'ombre';
      texte = "L'essentiel tient, mais il manque de quoi juger la part du hasard. Demandez la période de mesure et le point de départ avant d'en tirer une conclusion.";
    } else if (n >= 3) {
      titre = 'À prendre avec précaution';
      texte = "Trop d'éléments manquent pour distinguer le résultat de la coïncidence. C'est un témoignage commercial, pas une démonstration.";
    } else {
      titre = 'Aucune valeur démonstrative';
      texte = "Sans point de départ, sans période et sans méthode, un chiffre de progression ne veut rien dire. Ne fondez aucune décision là-dessus.";
    }

    out.textContent = '';
    var t = document.createElement('strong'); t.textContent = titre;
    var p = document.createElement('p'); p.textContent = texte;
    out.appendChild(t); out.appendChild(p);

    var manquants = cases.filter(function (c) { return !c.checked; });
    if (manquants.length) {
      var h = document.createElement('p'); h.textContent = 'Ce qui manque pour conclure :';
      var ul = document.createElement('ul');
      manquants.forEach(function (c) {
        var l = c.closest('label');
        var li = document.createElement('li');
        li.textContent = l ? l.textContent.trim() : '';
        ul.appendChild(li);
      });
      out.appendChild(h); out.appendChild(ul);
    }
    return { n: n, titre: titre, texte: texte, manquants: manquants };
  }

  function copier() {
    var r = calcul();
    var texte = ['Grille de crédibilité : ' + r.n + ' / ' + cases.length, '', r.titre, r.texte, '']
      .concat(r.manquants.length
        ? ['Ce qui manque :'].concat(r.manquants.map(function (c) { var l = c.closest('label'); return '- ' + (l ? l.textContent.trim() : ''); }))
        : ['Rien ne manque.'])
      .concat(['', 'Source : anthony-courtin.com/blog/etude-cas-geo']).join('\n');
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
