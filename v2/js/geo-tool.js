/* Audit GEO express : 12 critères pondérés, un score et les trois prochains
   chantiers. Tout se calcule dans le navigateur, aucun appel réseau. */
(function () {
  var list = document.getElementById('geo-check');
  var out = document.getElementById('geo-out');
  if (!list || !out) return;

  var boxes = [].slice.call(list.querySelectorAll('input[type="checkbox"]'));
  var scoreEl = document.getElementById('geo-score');
  var meterEl = document.getElementById('geo-meter');
  var labelEl = document.getElementById('geo-label');

  function palier(n) {
    if (n >= 85) return 'solide, passez à la mesure';
    if (n >= 65) return 'bonne base, il reste des angles morts';
    if (n >= 40) return 'les fondations sont là';
    if (n > 0)   return 'beaucoup à gagner rapidement';
    return 'à construire';
  }

  function render() {
    var total = 0, restants = [];

    boxes.forEach(function (b) {
      var p = parseInt(b.dataset.p, 10) || 0;
      if (b.checked) total += p;
      else restants.push({ p: p, txt: b.parentNode.textContent.trim() });
    });

    scoreEl.textContent = total;
    meterEl.style.width = Math.min(total, 100) + '%';
    labelEl.textContent = palier(total);

    // Les chantiers restants, du plus lourd au plus léger
    restants.sort(function (a, b) { return b.p - a.p; });
    var top = restants.slice(0, 3);

    if (!top.length) {
      out.textContent = 'Les douze critères sont couverts. Le chantier suivant n\'est plus '
        + 'l\'optimisation mais la mesure : constituez un panel de questions métier et '
        + 'suivez chaque semaine ce que répondent ChatGPT, Perplexity et Gemini.';
      return;
    }

    var txt = 'Score GEO : ' + total + '/100 (' + palier(total) + ')\n\n'
      + 'Vos trois prochains chantiers, par impact décroissant :\n';
    top.forEach(function (r, i) {
      txt += '\n' + (i + 1) + '. ' + r.txt + '\n   (+' + r.p + ' points)\n';
    });
    out.textContent = txt;
  }

  list.addEventListener('change', render);

  var copy = document.getElementById('geo-copy');
  if (copy) copy.addEventListener('click', function () {
    var done = function () {
      copy.textContent = 'Copié ✓'; copy.classList.add('ok');
      setTimeout(function () {
        copy.textContent = 'Copier mon plan d\'action';
        copy.classList.remove('ok');
      }, 1800);
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
