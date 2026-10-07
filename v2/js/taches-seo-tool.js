/* Tableau filtrable des tâches SEO : à déléguer à l'IA, mixte, ou à garder
   (article seo-ia). Filtrage et copie dans le navigateur, aucune donnée n'est envoyée. */
(function () {
  var table = document.getElementById('ts-table');
  var groupe = document.getElementById('ts-filtre');
  if (!table || !groupe) return;

  var lignes = [].slice.call(table.querySelectorAll('tbody tr'));
  var nbEl = document.getElementById('ts-nb');
  var meterEl = document.getElementById('ts-meter');
  var labelEl = document.getElementById('ts-label');
  var copy = document.getElementById('ts-copy');
  var courant = 'all';

  var LIBELLE = {
    all: '',
    ia: ' : ce que je délègue sans hésiter',
    mixte: " : l'IA propose, vous décidez",
    humain: ' : ce qui ne se délègue pas'
  };

  function filtrer(cat) {
    var n = 0;
    courant = cat;
    lignes.forEach(function (tr) {
      var visible = (cat === 'all' || tr.dataset.cat === cat);
      tr.hidden = !visible;
      if (visible) n++;
    });
    nbEl.textContent = n;
    meterEl.style.width = Math.round(n / lignes.length * 100) + '%';
    labelEl.textContent = LIBELLE[cat] || '';
  }

  function texteListe() {
    var visibles = lignes.filter(function (tr) { return !tr.hidden; });
    var titre = courant === 'all' ? 'Tâches SEO et IA : la grille complète'
      : 'Tâches SEO' + (LIBELLE[courant] || '');
    var out = [titre, ''];
    visibles.forEach(function (tr) {
      var c = tr.querySelectorAll('td');
      out.push('- ' + c[0].textContent.trim() + ' (' + c[1].textContent.trim() + ')');
      out.push('  IA : ' + c[2].textContent.trim());
      out.push('  Garde-fou : ' + c[3].textContent.trim());
    });
    out.push('', 'Source : anthony-courtin.com/blog/seo-ia');
    return out.join('\n');
  }

  groupe.addEventListener('click', function (e) {
    var b = e.target.closest('.chip');
    if (!b) return;
    groupe.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('on'); });
    b.classList.add('on');
    filtrer(b.dataset.v);
  });

  if (copy) copy.addEventListener('click', function () {
    var texte = texteListe();
    var fini = function (ok) {
      copy.textContent = ok ? 'Copié ✓' : 'Copie impossible';
      if (ok) copy.classList.add('ok');
      setTimeout(function () {
        copy.textContent = 'Copier la liste affichée';
        copy.classList.remove('ok');
      }, 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texte).then(function () { fini(true); }, function () { fini(false); });
    } else { fini(false); }
  });

  filtrer('all');
})();
