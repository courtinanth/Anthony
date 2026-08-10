/* Pré-audit SEO : 24 vérifications réparties sur trois piliers, un score global
   et le pilier le plus faible mis en avant. Tout se calcule dans le navigateur. */
(function () {
  var out = document.getElementById('as-out');
  if (!out) return;

  var PILIERS = [
    { id: 'as-tech',    nom: 'technique',              conseil: "Commencez par là : tant qu'une page n'est pas explorée et indexable, aucun contenu ne peut se classer." },
    { id: 'as-contenu', nom: 'contenu',                conseil: "Vos pages sont accessibles mais ne disent pas assez clairement de quoi elles parlent. Reprenez les balises title et les H1 en priorité." },
    { id: 'as-pop',     nom: 'popularité et structure', conseil: "Le socle est sain : l'enjeu devient le maillage interne et les liens entrants, c'est-à-dire la notoriété de vos pages." }
  ];

  var scoreEl = document.getElementById('as-score');
  var meterEl = document.getElementById('as-meter');
  var labelEl = document.getElementById('as-label');

  function palier(n) {
    if (n >= 21) return 'socle solide';
    if (n >= 15) return 'quelques angles morts';
    if (n >= 8)  return 'des corrections rentables à faire';
    if (n > 0)   return 'chantier prioritaire';
    return 'à diagnostiquer';
  }

  function render() {
    var total = 0, lignes = [], faible = null, manquants = [];

    PILIERS.forEach(function (p) {
      var g = document.getElementById(p.id);
      if (!g) return;
      var boxes = [].slice.call(g.querySelectorAll('input[type="checkbox"]'));
      var ok = boxes.filter(function (b) { return b.checked; }).length;
      total += ok;
      lignes.push('  ' + p.nom + ' : ' + ok + '/' + boxes.length);
      if (!faible || ok < faible.ok) faible = { ok: ok, p: p };
      boxes.forEach(function (b) {
        if (!b.checked) manquants.push(b.parentNode.textContent.trim());
      });
    });

    scoreEl.textContent = total;
    meterEl.style.width = Math.round(total / 24 * 100) + '%';
    labelEl.textContent = palier(total);

    var txt = 'Pré-audit SEO : ' + total + '/24 (' + palier(total) + ')\n\n'
      + 'Par pilier :\n' + lignes.join('\n') + '\n';

    if (!manquants.length) {
      txt += '\nLes 24 vérifications sont couvertes. Le socle technique et éditorial est sain : '
           + "l'étape suivante est la mesure et l'analyse sémantique face aux concurrents déjà classés.";
    } else {
      txt += '\nPilier à traiter en premier : ' + faible.p.nom + '.\n' + faible.p.conseil
           + '\n\nÀ corriger, dans l\'ordre :\n';
      manquants.slice(0, 5).forEach(function (m, i) { txt += '\n' + (i + 1) + '. ' + m; });
      if (manquants.length > 5) txt += '\n\n(et ' + (manquants.length - 5) + ' autre'
        + (manquants.length - 5 > 1 ? 's' : '') + ' point'
        + (manquants.length - 5 > 1 ? 's' : '') + ' non coché'
        + (manquants.length - 5 > 1 ? 's' : '') + ')';
    }
    out.textContent = txt;
  }

  PILIERS.forEach(function (p) {
    var g = document.getElementById(p.id);
    if (g) g.addEventListener('change', render);
  });

  var copy = document.getElementById('as-copy');
  if (copy) copy.addEventListener('click', function () {
    var done = function () {
      copy.textContent = 'Copié ✓'; copy.classList.add('ok');
      setTimeout(function () { copy.textContent = 'Copier mon diagnostic'; copy.classList.remove('ok'); }, 1800);
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
