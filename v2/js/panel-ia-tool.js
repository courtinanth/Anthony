/* Générateur de panel de questions pour un audit de visibilité IA.
   Compose les quatre familles de questions (recommandation, comparaison,
   expertise, marque) à partir de l'activité saisie. Aucun appel réseau. */
(function () {
  var out = document.getElementById('pi-out');
  if (!out) return;

  var type = 'service';

  function val(id) {
    var e = document.getElementById(id);
    return e ? e.value.trim() : '';
  }

  function modeles(metier, zone, marque, t) {
    var oz = zone ? ' à ' + zone : '';
    var dz = zone ? ' dans ' + zone : '';

    var reco = [
      'Quels sont les meilleurs ' + metier + oz + ' ?',
      'Peux-tu me recommander un ' + metier + oz + ' ?',
      'Qui contacter pour ' + metier + oz + ' ?',
      'Quel ' + metier + ' choisir quand on est une PME' + dz + ' ?',
      'Quelles sont les entreprises les plus reconnues en ' + metier + oz + ' ?'
    ];

    var compa = [
      'Comment choisir son ' + metier + ' ?',
      'Quels critères pour comparer des ' + metier + ' ?',
      'Combien coûte un ' + metier + oz + ' ?',
      'Quelle différence entre un ' + metier + ' indépendant et une agence ?',
      'Faut-il internaliser ou externaliser ' + metier + ' ?'
    ];

    var exp = [
      'Quelles erreurs éviter quand on fait appel à un ' + metier + ' ?',
      'Combien de temps prend une prestation de ' + metier + ' ?',
      'Quelles questions poser avant de signer avec un ' + metier + ' ?',
      'Quels résultats attendre d\'un ' + metier + ' la première année ?',
      'Quelles sont les tendances du secteur ' + metier + ' en 2026 ?'
    ];

    if (t === 'produit') {
      exp = exp.concat([
        'Quels sont les meilleurs produits pour ' + metier + ' ?',
        'Comment comparer les offres de ' + metier + ' ?'
      ]);
    }
    if (t === 'local') {
      reco = reco.concat([
        'Quel ' + metier + ' est ouvert le samedi' + dz + ' ?',
        'Quel ' + metier + oz + ' a les meilleurs avis ?'
      ]);
    }

    var mq = marque ? [
      'Que penses-tu de ' + marque + ' ?',
      'Que fait ' + marque + ' exactement ?',
      'Quels sont les concurrents de ' + marque + ' ?',
      marque + ' est-il fiable ?',
      'Quels sont les tarifs de ' + marque + ' ?'
    ] : [];

    return [
      ['Questions de recommandation (les plus importantes commercialement)', reco],
      ['Questions de comparaison', compa],
      ['Questions d\'expertise', exp],
      ['Questions de marque', mq]
    ];
  }

  function render() {
    var metier = val('pi-metier');
    var zone = val('pi-zone');
    var marque = val('pi-marque');

    if (!metier) {
      out.textContent = '';
      document.getElementById('pi-nb').textContent = '0';
      document.getElementById('pi-meter').style.width = '0%';
      return;
    }

    var blocs = modeles(metier.toLowerCase(), zone, marque, type);
    var n = 0;
    var txt = 'Panel de questions pour un audit de visibilité IA\n'
            + 'Activité : ' + metier + (zone ? ' | Zone : ' + zone : '') + '\n\n'
            + 'Protocole : posez chaque question en navigation privée, sans compte '
            + 'connecté, à ChatGPT, Perplexity et Gemini. Notez si votre marque est '
            + 'citée, quels concurrents apparaissent, et quelles sources sont liées. '
            + 'Répétez la mesure à trois jours d\'intervalle.\n';

    blocs.forEach(function (b) {
      if (!b[1].length) return;
      txt += '\n' + b[0] + '\n';
      b[1].forEach(function (q) { n++; txt += '  ' + n + '. ' + q + '\n'; });
    });

    if (!marque) {
      txt += '\nAstuce : renseignez le nom de votre marque pour ajouter les cinq '
           + 'questions qui révèlent ce que les moteurs savent de vous.\n';
    }

    out.textContent = txt;
    document.getElementById('pi-nb').textContent = n;
    document.getElementById('pi-meter').style.width = Math.min(100, Math.round(n / 20 * 100)) + '%';
  }

  ['pi-metier', 'pi-zone', 'pi-marque'].forEach(function (id) {
    var e = document.getElementById(id);
    if (e) e.addEventListener('input', render);
  });

  var g = document.getElementById('pi-type');
  if (g) g.addEventListener('click', function (e) {
    var b = e.target.closest('.chip');
    if (!b) return;
    g.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('on'); });
    b.classList.add('on');
    type = b.dataset.v;
    render();
  });

  var copy = document.getElementById('pi-copy');
  if (copy) copy.addEventListener('click', function () {
    var done = function () {
      copy.textContent = 'Copié ✓'; copy.classList.add('ok');
      setTimeout(function () { copy.textContent = 'Copier mon panel'; copy.classList.remove('ok'); }, 1800);
    };
    if (navigator.clipboard) navigator.clipboard.writeText(out.textContent).then(done, function () {});
    else {
      var i = document.createElement('textarea');
      i.value = out.textContent; document.body.appendChild(i);
      i.select(); document.execCommand('copy'); i.remove(); done();
    }
  });

  render();
})();
