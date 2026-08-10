/* Grille d'éligibilité d'un process à l'automatisation par agent IA.
   Cinq critères pondérés, un verdict argumenté. Aucun appel réseau. */
(function () {
  var out = document.getElementById('ag-out');
  if (!out) return;

  var rep = { 'ag-freq': 0, 'ag-verif': 0, 'ag-risque': 2, 'ag-doc': 0, 'ag-api': 0 };

  // La vérifiabilité et la fréquence pèsent le plus : ce sont les deux facteurs
  // qui décident de la fiabilité et de la rentabilité d'un agent.
  var POIDS = { 'ag-verif': 28, 'ag-freq': 24, 'ag-doc': 20, 'ag-api': 16, 'ag-risque': 12 };

  function score() {
    var s = 0;
    Object.keys(POIDS).forEach(function (k) { s += (rep[k] / 2) * POIDS[k]; });
    return Math.round(s);
  }

  function palier(n) {
    if (n >= 75) return 'excellent candidat';
    if (n >= 55) return 'bon candidat';
    if (n >= 35) return 'candidat à préparer';
    return 'à écarter pour l\'instant';
  }

  function conseils() {
    var c = [];
    if (rep['ag-doc'] === 0) c.push("Écrivez le process avant toute chose. Un agent ne devine pas des étapes que personne n'a formalisées : c'est la première cause d'échec des projets.");
    if (rep['ag-verif'] === 0) c.push("Définissez un critère de réussite vérifiable. Sans lui, l'agent ne saura pas s'il a réussi, et vous non plus.");
    if (rep['ag-api'] === 0) c.push("Vérifiez si vos outils exposent une interface programmable. Sans accès, un agent ne peut rien faire d'utile sur vos systèmes.");
    if (rep['ag-freq'] === 0) c.push("La tâche est trop rare pour rentabiliser un agent. Gardez-la manuelle et cherchez un candidat plus fréquent.");
    if (rep['ag-risque'] === 0) c.push("Enjeu élevé : gardez impérativement une validation humaine avant toute action définitive, et faites tourner l'agent en observation plusieurs semaines.");
    return c;
  }

  function render() {
    var s = score();
    document.getElementById('ag-score').textContent = s;
    document.getElementById('ag-meter').style.width = s + '%';
    document.getElementById('ag-label').textContent = palier(s);

    var txt = 'Éligibilité : ' + s + '/100 (' + palier(s) + ')\n\n';

    if (s >= 75) {
      txt += "Ce process réunit les conditions d'un agent fiable : il revient souvent, "
           + "son résultat se vérifie, et les outils sont accessibles. Comptez deux à cinq "
           + "jours pour une première version utile.\n";
    } else if (s >= 55) {
      txt += "Bon candidat, à condition de traiter les points ci-dessous avant de commencer. "
           + "Ne lancez pas la construction tant qu'ils ne sont pas réglés.\n";
    } else if (s >= 35) {
      txt += "Ce process demande une préparation avant d'être automatisable. Le travail "
           + "de clarification à faire a de la valeur en lui-même, indépendamment de l'agent.\n";
    } else {
      txt += "Ce process n'est pas un bon candidat aujourd'hui. Cherchez plutôt une tâche "
           + "fréquente, dont le résultat se vérifie facilement et dont l'erreur est sans "
           + "conséquence grave.\n";
    }

    var c = conseils();
    if (c.length) {
      txt += '\nÀ traiter avant de commencer :\n';
      c.forEach(function (x, i) { txt += '\n' + (i + 1) + '. ' + x + '\n'; });
    } else {
      txt += '\nAucun point bloquant. Commencez par la version la plus simple possible, '
           + "et faites-la tourner en observation deux semaines avant de lui confier des "
           + 'actions définitives.';
    }

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

  var copy = document.getElementById('ag-copy');
  if (copy) copy.addEventListener('click', function () {
    var done = function () {
      copy.textContent = 'Copié ✓'; copy.classList.add('ok');
      setTimeout(function () { copy.textContent = 'Copier le verdict'; copy.classList.remove('ok'); }, 1800);
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
