/* Pré-audit SEO au format rapport : 24 vérifications sur trois piliers, un score,
   puis un pré-rapport (synthèse, score par pilier, plan d'action par priorité, suivi).
   Article audit-seo-methode. Tout se calcule dans le navigateur, rien n'est envoyé. */
(function () {
  var out = document.getElementById('as-out');
  if (!out) return;

  var PILIERS = [
    { id: 'as-tech',    nom: 'Technique',               conseil: "Commencez par là : tant qu'une page n'est pas explorée et indexable, aucun contenu ne peut se classer." },
    { id: 'as-contenu', nom: 'Contenu',                 conseil: "Vos pages ne disent pas assez clairement de quoi elles parlent. Reprenez les balises title et les H1 en priorité." },
    { id: 'as-pop',     nom: 'Popularité et structure', conseil: "Vos pages manquent de soutien : renforcez d'abord le maillage interne, qui ne dépend que de vous, puis les liens entrants." }
  ];

  var PRIO = {
    1: 'Priorité 1 : bloque l\'indexation, à corriger d\'abord',
    2: 'Priorité 2 : touche beaucoup de pages, à traiter ce mois-ci',
    3: 'Priorité 3 : à planifier dans le trimestre'
  };

  var scoreEl = document.getElementById('as-score');
  var meterEl = document.getElementById('as-meter');
  var labelEl = document.getElementById('as-label');
  var siteEl = document.getElementById('as-site');

  function palier(n) {
    if (n >= 21) return 'socle solide';
    if (n >= 15) return 'quelques angles morts';
    if (n >= 8)  return 'des corrections rentables à faire';
    if (n > 0)   return 'chantier prioritaire';
    return 'à diagnostiquer';
  }

  function dateDuJour() {
    try { return new Date().toLocaleDateString('fr-FR'); } catch (e) { return ''; }
  }

  function render() {
    var total = 0, max = 0, lignes = [], faible = null;
    var actions = { 1: [], 2: [], 3: [] };

    PILIERS.forEach(function (p) {
      var g = document.getElementById(p.id);
      if (!g) return;
      var boxes = [].slice.call(g.querySelectorAll('input[type="checkbox"]'));
      var ok = boxes.filter(function (b) { return b.checked; }).length;
      total += ok;
      max += boxes.length;
      lignes.push('- ' + p.nom + ' : ' + ok + '/' + boxes.length);
      if (!faible || ok < faible.ok) faible = { ok: ok, p: p };
      boxes.forEach(function (b) {
        if (b.checked) return;
        var n = parseInt(b.dataset.prio, 10);
        if (!actions[n]) n = 3;
        actions[n].push(b.dataset.a || b.parentNode.textContent.trim());
      });
    });

    scoreEl.textContent = total;
    meterEl.style.width = (max ? Math.round(total / max * 100) : 0) + '%';
    labelEl.textContent = palier(total);

    var site = siteEl && siteEl.value.trim() ? siteEl.value.trim() : 'non renseigné';
    var txt = 'PRÉ-RAPPORT D\'AUDIT SEO\n'
      + 'Site : ' + site + '\n'
      + 'Date : ' + dateDuJour() + '\n\n'
      + '1. SYNTHÈSE\n'
      + 'Score : ' + total + '/' + max + ' (' + palier(total) + ').\n';

    if (total === max) {
      txt += 'Les ' + max + ' vérifications sont couvertes. Le socle technique et éditorial est sain : '
        + "l'étape suivante est l'analyse sémantique face aux concurrents déjà classés.\n";
    } else {
      txt += 'Pilier le plus faible : ' + faible.p.nom.toLowerCase() + '.\n' + faible.p.conseil + '\n';
    }

    txt += '\n2. SCORE PAR PILIER\n' + lignes.join('\n') + '\n';

    txt += '\n3. PLAN D\'ACTION PRIORISÉ\n';
    var vide = true;
    [1, 2, 3].forEach(function (n) {
      if (!actions[n].length) return;
      vide = false;
      txt += '\n' + PRIO[n] + '\n';
      actions[n].forEach(function (a) { txt += '- ' + a + '\n'; });
    });
    if (vide) txt += 'Aucune action ouverte sur ces 24 points.\n';

    txt += '\n4. SUIVI\n'
      + 'Avant toute correction, notez dans la Search Console : clics organiques des 3 derniers mois, '
      + 'pages indexées, positions sur vos 10 requêtes prioritaires. '
      + 'Refaites ce pré-audit dans 3 mois avec les mêmes indicateurs.\n\n'
      + 'Grille : anthony-courtin.com/blog/audit-seo-methode';

    out.textContent = txt;
  }

  PILIERS.forEach(function (p) {
    var g = document.getElementById(p.id);
    if (g) g.addEventListener('change', render);
  });
  if (siteEl) siteEl.addEventListener('input', render);

  var copy = document.getElementById('as-copy');
  if (copy) copy.addEventListener('click', function () {
    var label = copy.textContent;
    var done = function () {
      copy.textContent = 'Copié ✓'; copy.classList.add('ok');
      setTimeout(function () { copy.textContent = label; copy.classList.remove('ok'); }, 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(out.textContent).then(done, function () {});
    } else {
      var i = document.createElement('textarea');
      i.value = out.textContent; document.body.appendChild(i);
      i.select(); document.execCommand('copy'); i.remove(); done();
    }
  });

  render();
})();
