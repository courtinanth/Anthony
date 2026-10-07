/* Matrice de priorisation des processus à automatiser (article automatisation-processus).
   Classe jusqu'à cinq processus selon le volume, la variabilité, l'impact d'une
   erreur et l'accès aux logiciels, propose une approche pour chacun et prépare
   la fiche de relevé du premier candidat.
   100 % navigateur, aucun appel réseau. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var rows = $('ap-rows'), out = $('ap-out'), add = $('ap-add'), copy = $('ap-copy');
  if (!rows || !out) return;

  var MAX = 5;
  var POINTS = {
    var: { faible: 25, moyenne: 15, forte: 5 },
    imp: { faible: 20, moyen: 10, grave: 3 },
    acc: { api: 20, partiel: 10, aucun: 4 }
  };
  var RELEVES = [
    ['Volume mensuel', 'sur un mois entier, pas une semaine extrapolée'],
    ['Temps unitaire', 'chronométré trois fois, sur trois personnes si possible'],
    ['Délai de bout en bout', 'du déclencheur au résultat, attentes comprises'],
    ['Taux d\'erreur ou de reprise', 'pour cent occurrences'],
    ['Qui fait quoi', 'les personnes impliquées et leur part du travail']
  ];

  function lireLigne(fs, i) {
    var v = {};
    fs.querySelectorAll('[data-k]').forEach(function (el) { v[el.dataset.k] = el.value.trim(); });
    v.nom = v.nom || ('Processus ' + (i + 1));
    v.vol = parseFloat(v.vol) || 0;
    v.min = parseFloat(v.min) || 0;
    return v;
  }

  function evaluer(p) {
    p.heures = p.vol * p.min / 60;
    var gain = Math.min(35, Math.round(p.heures * 35 / 20));
    p.score = gain + (POINTS.var[p.var] || 0) + (POINTS.imp[p.imp] || 0) + (POINTS.acc[p.acc] || 0);

    var a;
    if (p.acc === 'aucun') a = 'RPA en dépannage (Power Automate pour le bureau), ou changement d\'outil';
    else if (p.var === 'forte') a = 'Plateforme no-code avec une étape IA, voire un agent, sous validation humaine';
    else if (p.don === 'libre') a = 'Plateforme no-code (Make, n8n, Zapier) avec une étape IA pour lire ou classer';
    else if (p.var === 'faible' && p.acc === 'api') a = 'Fonction native de vos logiciels, sinon automatisation no-code simple';
    else a = 'Plateforme no-code avec conditions (Make, n8n, Zapier)';
    if (p.imp === 'grave') a += ' ; validation humaine avant toute action définitive';
    p.approche = a;

    if (p.score >= 70) p.verdict = 'à automatiser en premier';
    else if (p.score >= 50) p.verdict = 'bon candidat, à préparer';
    else if (p.score >= 30) p.verdict = 'à clarifier avant d\'automatiser';
    else p.verdict = 'à laisser manuel pour l\'instant';
    return p;
  }

  function fmt(n) { return n.toLocaleString('fr-FR', { maximumFractionDigits: 1 }); }

  function calculer() {
    var liste = [];
    rows.querySelectorAll('.ap-row').forEach(function (fs, i) {
      var p = lireLigne(fs, i);
      if (!p.vol && !p.min && !fs.querySelector('[data-k="nom"]').value.trim()) return;
      liste.push(evaluer(p));
    });
    liste.sort(function (a, b) { return b.score - a.score || b.heures - a.heures; });
    return liste;
  }

  function render() {
    var liste = calculer();
    var top = liste[0];
    $('ap-score').textContent = top ? top.score : 0;
    $('ap-meter').style.width = (top ? top.score : 0) + '%';
    $('ap-label').textContent = top ? (top.verdict) : 'pour le premier candidat';

    if (!liste.length) { out.textContent = ''; return ''; }

    var t = 'CLASSEMENT DES PROCESSUS\n\n';
    liste.forEach(function (p, i) {
      t += (i + 1) + '. ' + p.nom + ' : ' + p.score + '/100, ' + p.verdict + '\n'
        + '   Temps actuel : ' + fmt(p.heures) + ' h par mois\n'
        + '   Approche : ' + p.approche + '\n\n';
    });

    t += 'FICHE DE RELEVÉ AVANT AUTOMATISATION : ' + top.nom + '\n'
      + 'Date du relevé : \n';
    RELEVES.forEach(function (r) {
      t += '- ' + r[0] + ' (' + r[1] + ')\n    Avant : \n    Après : \n';
    });
    t += '- Ce qui a changé par ailleurs sur la période : \n'
      + '- À quoi servira le temps gagné : \n\n'
      + 'Prochaine étape : cartographier « ' + top.nom + ' » étape par étape, '
      + 'puis faire tourner l\'automatisation en parallèle deux à quatre semaines.';

    out.textContent = t;
    return t;
  }

  function renumeroter(fs, n) {
    fs.querySelector('legend').textContent = 'Processus ' + n;
    fs.querySelectorAll('[id]').forEach(function (el) {
      var base = el.id.replace(/-\d+$/, '');
      el.id = base + '-' + n;
    });
    fs.querySelectorAll('label[for]').forEach(function (l) {
      l.htmlFor = l.htmlFor.replace(/-\d+$/, '') + '-' + n;
    });
  }

  if (add) add.addEventListener('click', function () {
    var n = rows.querySelectorAll('.ap-row').length;
    if (n >= MAX) return;
    var fs = rows.querySelector('.ap-row').cloneNode(true);
    fs.querySelectorAll('input').forEach(function (el) { el.value = ''; });
    fs.querySelectorAll('select').forEach(function (el) { el.selectedIndex = 0; });
    renumeroter(fs, n + 1);
    rows.appendChild(fs);
    if (n + 1 >= MAX) { add.disabled = true; add.textContent = 'Cinq processus au maximum'; }
    var champ = fs.querySelector('input');
    if (champ) champ.focus();
  });

  rows.addEventListener('input', render);
  rows.addEventListener('change', render);

  if (copy) copy.addEventListener('click', function () {
    var t = render();
    if (!t) return;
    t += '\n\nMatrice : anthony-courtin.com/blog/automatisation-processus';
    var fini = function () {
      copy.textContent = 'Copié ✓'; copy.classList.add('ok');
      setTimeout(function () { copy.textContent = 'Copier la matrice'; copy.classList.remove('ok'); }, 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(fini, function () {});
    else {
      var i = document.createElement('textarea');
      i.value = t; document.body.appendChild(i);
      i.select(); document.execCommand('copy'); i.remove(); fini();
    }
  });

  render();
})();
