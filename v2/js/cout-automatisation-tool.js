/* Comparateur no-code / code sur mesure sur 36 mois.
   Les hypothèses sont affichées avec le résultat : un calculateur dont on ne
   voit pas les hypothèses ne sert à rien. Tout est calculé côté navigateur. */
(function () {
  var out = document.getElementById('nc-out');
  if (!out) return;

  var rep = { 'nc-nb': 3, 'nc-ex': 2000, 'nc-cx': 1, 'nc-eq': 0 };

  // Hypothèses, volontairement conservatrices et affichées à l'utilisateur.
  var TJM = 550;          // coût d'une journée de prestation
  var MOIS = 36;

  function euros(n) {
    return Math.round(n / 100) * 100 + ' €';
  }

  function calcul() {
    var nb = rep['nc-nb'], ex = rep['nc-ex'], cx = rep['nc-cx'], eq = rep['nc-eq'];

    // --- Plateforme no-code hébergée ---
    // abonnement indexé sur le volume d'exécutions
    var absMois = ex <= 2000 ? 25 : (ex <= 20000 ? 60 : 200);
    var noCodeAbo = absMois * MOIS;
    // mise en place : ~0,4 jour par automatisation, majorée par la complexité
    var noCodeSetup = nb * 0.4 * cx * TJM;
    // maintenance : plus la logique est complexe, plus ça casse
    var noCodeMaint = nb * 0.12 * cx * TJM * (MOIS / 12);
    // une équipe non technique dépend d'un prestataire pour les corrections
    if (eq === 0) noCodeMaint *= 1.5;
    var noCodeTotal = noCodeAbo + noCodeSetup + noCodeMaint;

    // --- Code sur mesure ---
    // serveur modeste, coût quasi fixe quel que soit le volume
    var codeHeb = 12 * MOIS;
    // développement : plus long au départ
    var codeSetup = nb * 0.7 * cx * TJM;
    // maintenance plus faible : versionné et testé
    var codeMaint = nb * 0.06 * cx * TJM * (MOIS / 12);
    if (eq === 0) codeMaint *= 1.4;
    var codeTotal = codeHeb + codeSetup + codeMaint;

    return {
      noCode: noCodeTotal, code: codeTotal, absMois: absMois,
      nb: nb, cx: cx, eq: eq,
      ecart: Math.abs(noCodeTotal - codeTotal),
      gagnant: codeTotal < noCodeTotal ? 'code' : 'nocode'
    };
  }

  function render() {
    var r = calcul();
    var proche = r.ecart / Math.max(r.noCode, r.code) < 0.15;

    var reco, sub, fill;
    if (proche) {
      reco = 'Les deux se valent';
      sub = ", choisissez selon votre équipe";
      fill = '50%';
    } else if (r.gagnant === 'code') {
      reco = 'Code sur mesure';
      sub = ', plus rentable sur 3 ans';
      fill = '85%';
    } else {
      reco = r.eq === 0 ? 'n8n cloud' : 'n8n auto-hébergé';
      sub = ', le meilleur rapport pour votre cas';
      fill = '33%';
    }
    document.getElementById('nc-reco').textContent = reco;
    document.getElementById('nc-sub').textContent = sub;
    document.getElementById('nc-meter').style.width = fill;

    var txt = 'Estimation sur 36 mois\n\n'
      + '  Plateforme no-code : ' + euros(r.noCode) + '\n'
      + '  Code sur mesure    : ' + euros(r.code) + '\n\n'
      + 'Recommandation : ' + reco + '\n\n';

    if (proche) {
      txt += "L'écart est faible. Dans ce cas, le critère qui tranche n'est pas le coût "
           + "mais l'autonomie : si votre équipe doit pouvoir modifier les automatisations "
           + "elle-même, prenez le visuel.\n";
    } else if (r.gagnant === 'code') {
      txt += "Votre volume et votre complexité font basculer le calcul : l'abonnement et la "
           + "maintenance des workflows visuels dépassent le coût d'un programme versionné.\n";
    } else {
      txt += "Votre besoin reste dans ce que le no-code fait bien : peu d'automatisations, "
           + "logique simple. Développer sur mesure coûterait plus cher pour le même service.\n";
    }

    txt += '\nHypothèses retenues :\n'
      + '  abonnement estimé à ' + r.absMois + ' € par mois\n'
      + '  journée de prestation à ' + TJM + ' €\n'
      + '  ' + r.nb + ' automatisation' + (r.nb > 1 ? 's' : '') + ' à faire vivre\n'
      + '  maintenance annuelle plus élevée en no-code sur les logiques complexes\n'
      + '\nCes montants sont des ordres de grandeur, pas un devis.';

    out.textContent = txt;
  }

  Object.keys(rep).forEach(function (id) {
    var g = document.getElementById(id);
    if (!g) return;
    g.addEventListener('click', function (e) {
      var b = e.target.closest('.chip');
      if (!b) return;
      g.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('on'); });
      b.classList.add('on');
      rep[id] = parseInt(b.dataset.v, 10) || 0;
      render();
    });
  });

  var copy = document.getElementById('nc-copy');
  if (copy) copy.addEventListener('click', function () {
    var done = function () {
      copy.textContent = 'Copié ✓'; copy.classList.add('ok');
      setTimeout(function () { copy.textContent = "Copier l'estimation"; copy.classList.remove('ok'); }, 1800);
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
