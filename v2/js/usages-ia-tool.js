/* Tableau filtrable des usages de l'IA générative par fonction.
   Filtrage instantané côté navigateur, aucune donnée n'est envoyée. */
(function () {
  var table = document.getElementById('ug-table');
  var groupe = document.getElementById('ug-filtre');
  if (!table || !groupe) return;

  var lignes = [].slice.call(table.querySelectorAll('tbody tr'));
  var nbEl = document.getElementById('ug-nb');
  var meterEl = document.getElementById('ug-meter');
  var labelEl = document.getElementById('ug-label');

  var LIBELLE = {
    all: '',
    marketing: " : produire et diffuser",
    direction: " : comprendre et décider",
    support: " : répondre plus vite",
    administratif: " : saisir moins",
    technique: " : construire",
    rh: " : accompagner"
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
