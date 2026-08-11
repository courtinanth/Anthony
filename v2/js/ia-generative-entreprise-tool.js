/* Feuille de route de déploiement pour l'article ia-generative-entreprise.
   100 % navigateur, aucun appel réseau. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var taille = $('ige-taille'), maturite = $('ige-maturite'), priorite = $('ige-priorite'),
      duree = $('ige-duree'), meter = $('ige-meter'), out = $('ige-out'), copy = $('ige-copy');
  if (!taille || !out) return;

  var PHASES = [
    { nom: 'Cadrage', base: 2,
      quoi: "Choisir un seul processus mesurable, relever le temps qu'il coûte aujourd'hui, désigner un responsable. Sans chiffre de départ, aucun résultat ne sera démontrable." },
    { nom: 'Pilote', base: 4,
      quoi: "Trois à cinq personnes volontaires, sur le processus choisi, avec des données réelles. L'objectif n'est pas de réussir, c'est d'apprendre où ça coince." },
    { nom: 'Cadre et sécurité', base: 3,
      quoi: "Écrire ce qui est autorisé, ce qui ne l'est pas et où vont les données. Une page suffit, mais elle doit exister avant l'ouverture à tous." },
    { nom: 'Formation', base: 3,
      quoi: "Former sur les cas réels du métier, pas sur l'outil. Deux heures par équipe valent mieux qu'une journée générique suivie par personne." },
    { nom: 'Déploiement', base: 6,
      quoi: "Ouvrir progressivement, équipe par équipe, en gardant le premier groupe comme référent interne. Mesurer à nouveau le temps du processus." }
  ];

  function coef() {
    var t = parseFloat(taille.value) || 1;
    var m = parseFloat(maturite.value) || 1;
    return t * m;
  }

  function calcul() {
    var c = coef();
    var lignes = PHASES.map(function (p) {
      return { nom: p.nom, sem: Math.max(1, Math.round(p.base * c)), quoi: p.quoi };
    });
    var total = lignes.reduce(function (s, l) { return s + l.sem; }, 0);

    duree.textContent = total + ' semaines';
    if (meter) meter.style.width = Math.min(100, Math.round((total / 40) * 100)) + '%';

    out.textContent = '';
    var ol = document.createElement('ol');
    lignes.forEach(function (l) {
      var li = document.createElement('li');
      var b = document.createElement('strong');
      b.textContent = l.nom + ', ' + l.sem + ' semaine' + (l.sem > 1 ? 's' : '') + '. ';
      li.appendChild(b);
      li.appendChild(document.createTextNode(l.quoi));
      ol.appendChild(li);
    });
    out.appendChild(ol);

    var p = document.createElement('p');
    var pr = priorite.options[priorite.selectedIndex].text.toLowerCase();
    p.textContent = "Commencez le pilote sur " + pr + " : c'est le terrain que vous avez désigné comme prioritaire, et un premier résultat visible y aura le plus d'effet d'entraînement.";
    out.appendChild(p);

    return { total: total, lignes: lignes };
  }

  function copier() {
    var r = calcul();
    var texte = ['Feuille de route de déploiement : ' + r.total + ' semaines', '']
      .concat(r.lignes.map(function (l, i) { return (i + 1) + '. ' + l.nom + ' (' + l.sem + ' sem.) : ' + l.quoi; }))
      .concat(['', 'Source : anthony-courtin.com/blog/ia-generative-entreprise']).join('\n');
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

  [taille, maturite, priorite].forEach(function (el) { el.addEventListener('change', calcul); });
  if (copy) copy.addEventListener('click', copier);
  calcul();
})();
