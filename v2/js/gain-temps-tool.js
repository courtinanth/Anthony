/* Estimation des heures récupérables par automatisation.
   Les heures par tâche sont des ordres de grandeur constatés en mission,
   ajustés selon la taille de l'entreprise. Tout se calcule côté navigateur. */
(function () {
  var list = document.getElementById('gt-check');
  var out = document.getElementById('gt-out');
  if (!list || !out) return;

  var boxes = [].slice.call(list.querySelectorAll('input[type="checkbox"]'));
  var taille = 1, cout = 35;

  // Coefficient de volume : une PME traite plus de cas qu'un indépendant.
  var COEF = { 1: 0.5, 2: 1, 3: 1.6 };

  function render() {
    var h = 0, choisies = [];
    boxes.forEach(function (b) {
      if (b.checked) {
        var v = parseFloat(b.dataset.h) || 0;
        h += v;
        choisies.push({ h: v, txt: b.parentNode.textContent.trim() });
      }
    });

    // Les heures saisies sont hebdomadaires : on passe au mois (4,3 semaines)
    // puis on applique le coefficient de taille, et on retire 25 % de résiduel
    // (supervision et cas particuliers, qui ne disparaissent jamais).
    var mensuel = Math.round(h * 4.3 * COEF[taille] * 0.75);
    var euros = mensuel * cout;

    document.getElementById('gt-h').textContent = mensuel;
    document.getElementById('gt-eur').textContent = mensuel ? ' (' + euros.toLocaleString('fr-FR') + ' € par mois)' : '';
    document.getElementById('gt-meter').style.width = Math.min(100, Math.round(mensuel / 30 * 100)) + '%';

    if (!choisies.length) {
      out.textContent = '';
      return;
    }

    choisies.sort(function (a, b) { return b.h - a.h; });

    var txt = 'Potentiel estimé : ' + mensuel + ' heures par mois\n'
      + 'Valorisation à ' + cout + ' € de l\'heure : ' + euros.toLocaleString('fr-FR') + ' € par mois\n'
      + 'Soit ' + (euros * 12).toLocaleString('fr-FR') + ' € sur un an\n\n'
      + 'Commencez par celle-ci :\n\n'
      + '  ' + choisies[0].txt + '\n\n';

    if (choisies.length > 1) {
      txt += 'Puis, par ordre de gain :\n';
      choisies.slice(1, 4).forEach(function (c, i) { txt += '  ' + (i + 2) + '. ' + c.txt + '\n'; });
      if (choisies.length > 4) txt += '  (et ' + (choisies.length - 4) + ' autre(s))\n';
    }

    txt += '\nAvant de vous lancer :\n'
      + '  1. Chronométrez le temps réel passé sur cette tâche pendant deux semaines.\n'
      + '  2. Vérifiez que vous savez décrire les étapes par écrit.\n'
      + '  3. Décidez à l\'avance de ce que le temps gagné servira à faire.\n'
      + '\nHypothèses retenues :\n'
      + '  volume ajusté selon la taille : x' + COEF[taille] + '\n'
      + '  25 % de temps résiduel conservé (supervision et cas particuliers)\n'
      + '  maintenance non déduite : comptez une demi-journée par trimestre\n'
      + '\nCe sont des ordres de grandeur constatés en mission, pas une mesure de votre activité.';

    out.textContent = txt;
  }

  list.addEventListener('change', render);

  var gt = document.getElementById('gt-taille');
  if (gt) gt.addEventListener('click', function (e) {
    var b = e.target.closest('.chip'); if (!b) return;
    gt.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('on'); });
    b.classList.add('on'); taille = parseInt(b.dataset.v, 10) || 1; render();
  });

  var gc = document.getElementById('gt-cout');
  if (gc) gc.addEventListener('click', function (e) {
    var b = e.target.closest('.chip'); if (!b) return;
    gc.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('on'); });
    b.classList.add('on'); cout = parseInt(b.dataset.v, 10) || 35; render();
  });

  var copy = document.getElementById('gt-copy');
  if (copy) copy.addEventListener('click', function () {
    var done = function () {
      copy.textContent = 'Copié ✓'; copy.classList.add('ok');
      setTimeout(function () { copy.textContent = 'Copier mon estimation'; copy.classList.remove('ok'); }, 1800);
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
