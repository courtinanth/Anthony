/* Exemples d'IA générative filtrables par type de contenu (texte, image,
   vidéo, son, code), avec copie de la sélection.
   Filtrage instantané côté navigateur, aucune donnée n'est envoyée. */
(function () {
  var table = document.getElementById('ug-table');
  var groupe = document.getElementById('ug-filtre');
  if (!table || !groupe) return;

  var lignes = [].slice.call(table.querySelectorAll('tbody tr'));
  var nbEl = document.getElementById('ug-nb');
  var meterEl = document.getElementById('ug-meter');
  var labelEl = document.getElementById('ug-label');
  var copyBtn = document.getElementById('ug-copy');

  var LIBELLE = {
    all: '',
    texte: ' : écrire, résumer, traduire',
    image: ' : illustrer, décliner, retoucher',
    video: ' : générer et animer des plans',
    son: ' : voix, musique, réunions',
    code: ' : écrire et corriger du code'
  };

  var courant = 'all';

  function filtrer(cat) {
    courant = cat;
    var n = 0;
    lignes.forEach(function (tr) {
      var visible = (cat === 'all' || tr.dataset.cat === cat);
      tr.hidden = !visible;
      if (visible) n++;
    });
    nbEl.textContent = n;
    meterEl.style.width = Math.round(n / lignes.length * 100) + '%';
    labelEl.textContent = LIBELLE[cat] || '';
  }

  function texteSelection() {
    var out = ["Exemples d'IA générative" + (courant === 'all' ? '' : LIBELLE[courant]), ''];
    lignes.forEach(function (tr) {
      if (tr.hidden) return;
      var c = tr.querySelectorAll('td');
      out.push('- ' + c[0].textContent.trim() + ' (' + c[1].textContent.trim() + ')');
      out.push('  Outils : ' + c[2].textContent.trim());
      out.push('  Garde-fou : ' + c[3].textContent.trim());
    });
    out.push('', 'Source : anthony-courtin.com/blog/ia-generative');
    return out.join('\n');
  }

  groupe.addEventListener('click', function (e) {
    var b = e.target.closest('.chip');
    if (!b) return;
    groupe.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('on'); });
    b.classList.add('on');
    filtrer(b.dataset.v);
  });

  if (copyBtn) copyBtn.addEventListener('click', function () {
    var txt = texteSelection();
    var done = function () {
      copyBtn.textContent = 'Copié ✓'; copyBtn.classList.add('ok');
      setTimeout(function () { copyBtn.textContent = 'Copier ces exemples'; copyBtn.classList.remove('ok'); }, 1800);
    };
    if (navigator.clipboard) navigator.clipboard.writeText(txt).then(done, function () {});
    else {
      var i = document.createElement('textarea');
      i.value = txt; document.body.appendChild(i);
      i.select(); document.execCommand('copy'); i.remove(); done();
    }
  });

  filtrer('all');
})();
