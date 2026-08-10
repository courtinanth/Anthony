/* Tableau filtrable des tâches SEO : à déléguer à l'IA, mixte, ou à garder.
   Filtrage instantané côté navigateur, aucune donnée n'est envoyée. */
(function () {
  var table = document.getElementById('ts-table');
  var groupe = document.getElementById('ts-filtre');
  if (!table || !groupe) return;

  var lignes = [].slice.call(table.querySelectorAll('tbody tr'));
  var nbEl = document.getElementById('ts-nb');
  var meterEl = document.getElementById('ts-meter');
  var labelEl = document.getElementById('ts-label');

  var LIBELLE = {
    all: '',
    ia: ' : ce que je délègue sans hésiter',
    mixte: " : l'IA propose, vous décidez",
    humain: ' : ce qui ne se délègue pas'
  };

  function filtrer(cat) {
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

  groupe.addEventListener('click', function (e) {
    var b = e.target.closest('.chip');
    if (!b) return;
    groupe.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('on'); });
    b.classList.add('on');
    filtrer(b.dataset.v);
  });

  filtrer('all');
})();
