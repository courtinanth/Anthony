/* Calculateur d'heures récupérables par automatisation IA (article automatisations-gain-temps).
   Le calcul part des minutes hebdomadaires saisies par le lecteur, pas de moyennes
   supposées. Il classe les tâches et propose par laquelle commencer.
   100 % navigateur, aucun appel réseau. */
(function () {
  'use strict';
  var list = document.getElementById('gt-list');
  var out = document.getElementById('gt-out');
  if (!list || !out) return;

  var inputs = [].slice.call(list.querySelectorAll('input[type="number"]'));
  var part = 75, cout = 35;
  var SEMAINES_PAR_MOIS = 52 / 12;

  function libelle(inp) {
    var l = list.querySelector('label[for="' + inp.id + '"]');
    return l ? l.textContent.trim() : inp.id;
  }

  function fmt(n) { return n.toLocaleString('fr-FR', { maximumFractionDigits: 1 }); }

  function render() {
    var taches = [];
    inputs.forEach(function (inp) {
      var m = parseFloat(inp.value);
      if (!(m > 0)) return;
      taches.push({
        nom: libelle(inp),
        heures: m * SEMAINES_PAR_MOIS / 60,
        simple: inp.dataset.simple === '1',
        outil: inp.dataset.outil || ''
      });
    });

    var total = taches.reduce(function (s, t) { return s + t.heures; }, 0);
    var recup = Math.round(total * part / 100);
    var euros = recup * cout;

    document.getElementById('gt-h').textContent = recup;
    document.getElementById('gt-eur').textContent = recup ? '(' + euros.toLocaleString('fr-FR') + ' € par mois)' : '';
    document.getElementById('gt-meter').style.width = Math.min(100, Math.round(recup / 40 * 100)) + '%';

    if (!taches.length) { out.textContent = ''; return; }

    taches.sort(function (a, b) { return b.heures - a.heures; });

    // Première tâche conseillée : la plus lourde parmi les simples, sinon la plus lourde.
    var simples = taches.filter(function (t) { return t.simple; });
    var depart = simples.length ? simples[0] : taches[0];

    var txt = 'Temps actuel sur ces tâches : ' + fmt(total) + ' h par mois\n'
      + 'Récupérable (hypothèse ' + part + ' %) : ' + recup + ' h par mois\n'
      + 'Valeur à ' + cout + ' € de l\'heure : ' + euros.toLocaleString('fr-FR') + ' € par mois, '
      + (euros * 12).toLocaleString('fr-FR') + ' € par an\n\n'
      + 'Vos tâches, de la plus lourde à la plus légère :\n';
    taches.forEach(function (t, i) {
      txt += '  ' + (i + 1) + '. ' + t.nom + ' : ' + fmt(t.heures) + ' h par mois' + (t.simple ? ' (simple)' : '') + '\n';
    });

    txt += '\nPar où commencer :\n  ' + depart.nom + '\n  Avec : ' + depart.outil + '\n';
    if (depart !== taches[0]) {
      txt += '  Pourquoi pas « ' + taches[0].nom + ' » ? Elle pèse plus lourd, mais elle est plus délicate. '
        + 'Gardez-la pour la deuxième automatisation, une fois la première en service.\n';
    }

    txt += '\nAvant de vous lancer :\n'
      + '  1. Chronométrez le temps réel pendant deux semaines : les temps déclarés sont rarement justes.\n'
      + '  2. Écrivez les étapes de la tâche telles que vous les faites aujourd\'hui.\n'
      + '  3. Faites tourner l\'automatisation en parallèle deux semaines, sans envoi automatique.\n'
      + '  4. Décidez à quoi servira le temps gagné.\n'
      + '\nCalcul établi à partir de vos temps. La maintenance (quelques heures par trimestre) n\'est pas déduite.';

    out.textContent = txt;
  }

  list.addEventListener('input', render);

  function chips(id, set) {
    var g = document.getElementById(id);
    if (!g) return;
    g.addEventListener('click', function (e) {
      var b = e.target.closest('.chip'); if (!b) return;
      g.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('on'); });
      b.classList.add('on'); set(parseInt(b.dataset.v, 10)); render();
    });
  }
  chips('gt-part', function (v) { part = v || 75; });
  chips('gt-cout', function (v) { cout = v || 35; });

  var copy = document.getElementById('gt-copy');
  if (copy) copy.addEventListener('click', function () {
    if (!out.textContent) return;
    var done = function () {
      copy.textContent = 'Copié ✓'; copy.classList.add('ok');
      setTimeout(function () { copy.textContent = 'Copier mon plan'; copy.classList.remove('ok'); }, 1800);
    };
    var texte = 'PLAN D\'AUTOMATISATION IA\n\n' + out.textContent
      + '\n\nCalculateur : anthony-courtin.com/blog/automatisations-gain-temps';
    if (navigator.clipboard) navigator.clipboard.writeText(texte).then(done, function () {});
    else {
      var i = document.createElement('textarea');
      i.value = texte; document.body.appendChild(i);
      i.select(); document.execCommand('copy'); i.remove(); done();
    }
  });

  render();
})();
