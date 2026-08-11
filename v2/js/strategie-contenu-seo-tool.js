/* Planificateur de production éditoriale pour l'article strategie-contenu-seo.
   100 % navigateur, aucun appel réseau. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var volume = $('scs-volume'), maturite = $('scs-maturite'), objectif = $('scs-objectif'),
      total = $('scs-total'), meter = $('scs-meter'), out = $('scs-out'), copy = $('scs-copy');
  if (!volume || !out) return;

  /* Répartition en pourcentage selon la maturité du site, puis ajustée par l'objectif. */
  var BASE = {
    neuf:    { pilier: 50, conversion: 20, notoriete: 10, mise_a_jour: 20 },
    lance:   { pilier: 30, conversion: 30, notoriete: 20, mise_a_jour: 20 },
    installe:{ pilier: 15, conversion: 30, notoriete: 25, mise_a_jour: 30 }
  };

  var TYPES = [
    { k: 'pilier', nom: 'Pages piliers', desc: "Les guides de fond qui couvrent un sujet entier et vers lesquels tout le reste pointe." },
    { k: 'conversion', nom: 'Contenus de conversion', desc: "Pages qui répondent à une intention commerciale : comparatifs, prix, cas clients." },
    { k: 'notoriete', nom: 'Contenus de notoriété', desc: "Données propriétaires, prises de position, retours d'expérience. Ce que vous seul pouvez écrire." },
    { k: 'mise_a_jour', nom: 'Mises à jour', desc: "Reprise des pages existantes qui rapportent déjà. Le meilleur rendement du lot." }
  ];

  function repartir() {
    var n = Math.max(1, Math.min(60, parseInt(volume.value, 10) || 1));
    var base = BASE[maturite.value] || BASE.lance;
    var part = {};
    TYPES.forEach(function (t) { part[t.k] = base[t.k]; });

    /* L'objectif déplace 10 points d'un poste vers un autre. */
    if (objectif.value === 'trafic') { part.pilier += 10; part.conversion -= 10; }
    if (objectif.value === 'leads') { part.conversion += 10; part.notoriete -= 10; }
    if (objectif.value === 'marque') { part.notoriete += 10; part.pilier -= 10; }

    /* Conversion en nombre entier de contenus, le reste allant au poste le plus fort. */
    var brut = TYPES.map(function (t) { return { t: t, exact: (n * Math.max(0, part[t.k])) / 100 }; });
    var attribue = brut.map(function (b) { return Object.assign({}, b, { n: Math.floor(b.exact) }); });
    var reste = n - attribue.reduce(function (s, b) { return s + b.n; }, 0);
    attribue.sort(function (a, b) { return (b.exact - b.n) - (a.exact - a.n); });
    for (var i = 0; i < reste; i++) { attribue[i % attribue.length].n += 1; }

    return { n: n, lignes: attribue.filter(function (b) { return b.n > 0; }) };
  }

  function calcul() {
    var r = repartir();
    total.textContent = r.n + ' par mois';
    if (meter) meter.style.width = Math.min(100, Math.round((r.n / 20) * 100)) + '%';

    out.textContent = '';
    var ul = document.createElement('ul');
    r.lignes.forEach(function (l) {
      var li = document.createElement('li');
      var b = document.createElement('strong');
      b.textContent = l.n + ' × ' + l.t.nom + '. ';
      li.appendChild(b);
      li.appendChild(document.createTextNode(l.t.desc));
      ul.appendChild(li);
    });
    out.appendChild(ul);

    var note = document.createElement('p');
    note.textContent = r.n < 2
      ? "À moins de deux contenus par mois, concentrez tout sur un seul sujet à la fois : mieux vaut couvrir un thème entièrement que dix à moitié."
      : "Comptez trois à six mois avant de voir bouger les positions, et jugez sur les pages, pas sur le total du site.";
    out.appendChild(note);

    return r;
  }

  function copier() {
    var r = calcul();
    var texte = ['Plan de production : ' + r.n + ' contenu(s) par mois', '']
      .concat(r.lignes.map(function (l) { return '- ' + l.n + ' x ' + l.t.nom + ' : ' + l.t.desc; }))
      .concat(['', 'Source : anthony-courtin.com/blog/strategie-contenu-seo']).join('\n');
    var fini = function (ok) {
      if (!copy) return;
      var a = copy.textContent;
      copy.textContent = ok ? 'Copié' : 'Copie impossible';
      setTimeout(function () { copy.textContent = a; }, 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texte).then(function () { fini(true); }, function () { fini(false); });
    } else { fini(false); }
  }

  [volume, maturite, objectif].forEach(function (el) {
    el.addEventListener('input', calcul);
    el.addEventListener('change', calcul);
  });
  if (copy) copy.addEventListener('click', copier);
  calcul();
})();
