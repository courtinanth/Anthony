/* Grille de décision MCP pour l'article mcp-model-context-protocol.
   100 % navigateur, aucun appel réseau. */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var liste = $('mcp-check');
  var score = $('mcp-score');
  var meter = $('mcp-meter');
  var out = $('mcp-out');
  var copy = $('mcp-copy');
  if (!liste || !score) return;

  var cases = Array.prototype.slice.call(liste.querySelectorAll('input[type="checkbox"]'));

  var PALIERS = [
    { min: 5, titre: 'Un serveur MCP se justifie clairement',
      texte: "Vous cochez l'essentiel des critères. Écrire un serveur MCP vous fera gagner du temps dès la deuxième intégration, et le travail sera réutilisable par tous les clients compatibles : Claude, ChatGPT, votre éditeur." },
    { min: 3, titre: 'MCP est pertinent, mais commencez petit',
      texte: "Le besoin est réel sans être encore structurant. Exposez d'abord deux ou trois outils sur un serveur minimal, mesurez l'usage réel pendant quelques semaines, puis élargissez seulement ce qui sert." },
    { min: 1, titre: "Un appel d'API direct suffit probablement",
      texte: "À ce niveau de besoin, brancher directement l'API du service dans votre script coûte moins cher en temps qu'un serveur MCP. Gardez MCP en tête pour le jour où vous voudrez rendre l'accès réutilisable." },
    { min: 0, titre: 'Rien ne justifie MCP pour le moment',
      texte: "Aucun signal ne pousse vers un protocole d'intégration. Revenez à cette grille quand un modèle devra lire vos données ou déclencher une action dans un outil tiers." }
  ];

  function calcul() {
    var n = 0;
    for (var i = 0; i < cases.length; i++) { if (cases[i].checked) n++; }

    score.textContent = n + ' / ' + cases.length;
    if (meter) meter.style.width = Math.round((n / cases.length) * 100) + '%';

    var p = PALIERS[PALIERS.length - 1];
    for (var j = 0; j < PALIERS.length; j++) {
      if (n >= PALIERS[j].min) { p = PALIERS[j]; break; }
    }

    if (out) {
      out.textContent = '';
      var t = document.createElement('strong');
      t.textContent = p.titre;
      var d = document.createElement('p');
      d.textContent = p.texte;
      out.appendChild(t);
      out.appendChild(d);
    }
    return { n: n, p: p };
  }

  function copier() {
    var r = calcul();
    var coches = cases.filter(function (c) { return c.checked; })
      .map(function (c) {
        var l = c.closest('label');
        return '- ' + (l ? l.textContent.trim() : '');
      });

    var texte = ['Grille de décision MCP : ' + r.n + ' critère(s) sur ' + cases.length, '']
      .concat(coches.length ? coches : ['Aucun critère coché'])
      .concat(['', r.p.titre, r.p.texte, '', 'Source : anthony-courtin.com/blog/mcp-model-context-protocol'])
      .join('\n');

    var fini = function (ok) {
      if (!copy) return;
      var avant = copy.textContent;
      copy.textContent = ok ? 'Copié' : 'Copie impossible';
      setTimeout(function () { copy.textContent = avant; }, 1800);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texte).then(function () { fini(true); }, function () { fini(false); });
    } else {
      fini(false);
    }
  }

  cases.forEach(function (c) { c.addEventListener('change', calcul); });
  if (copy) copy.addEventListener('click', copier);

  calcul();
})();
