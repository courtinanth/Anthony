/* Évaluateur d'opportunité de backlink : cinq critères pondérés, un score et un
   verdict qui tient compte du prix demandé. Tout se calcule dans le navigateur. */
(function () {
  var out = document.getElementById('bl-out');
  if (!out) return;

  var rep = { 'bl-thema': 0, 'bl-trafic': 0, 'bl-place': 0, 'bl-nature': 0, 'bl-prix': 0 };

  // Pondérations : la thématique et le trafic pèsent le plus, conformément à
  // ce que l'article explique. L'emplacement et la nature du site suivent.
  var POIDS = { 'bl-thema': 30, 'bl-trafic': 28, 'bl-place': 22, 'bl-nature': 20 };

  var PRIX_LABEL = ['gratuit ou en échange', 'moins de 200 €', 'de 200 à 600 €', 'plus de 600 €'];

  function qualite() {
    var q = 0;
    ['bl-thema', 'bl-trafic', 'bl-place', 'bl-nature'].forEach(function (k) {
      q += (rep[k] / 2) * POIDS[k];
    });
    return Math.round(q);
  }

  function palier(n) {
    if (n >= 80) return 'lien de premier choix';
    if (n >= 60) return 'bon lien';
    if (n >= 35) return 'lien moyen';
    return 'lien sans effet attendu';
  }

  function verdict(q, prix) {
    if (q < 35) {
      return prix === 0
        ? "Même gratuit, ce lien n'apportera rien à votre référencement. Acceptez-le seulement s'il amène du trafic réel ou s'il sert la relation."
        : "Ne payez pas pour ce lien. Les critères qui comptent ne sont pas réunis : vous achèteriez une ligne dans un rapport, pas une progression.";
    }
    if (q < 60) {
      if (prix >= 2) return "Lien correct mais nettement surévalué au prix demandé. Négociez, ou gardez ce budget pour une source mieux ciblée.";
      return "Lien acceptable à ce prix, à condition qu'il s'inscrive dans un ensemble varié. Ne construisez pas une campagne entière sur ce profil de sources.";
    }
    if (q < 80) {
      if (prix === 3) return "Bon lien, mais à plus de 600 € vérifiez d'abord que la page qui vous citera reçoit elle-même des visites. Sinon, négociez.";
      return "Bon lien, cohérent avec son prix. Veillez simplement à varier l'ancre et à pointer vers une page stratégique plutôt que l'accueil.";
    }
    return "Excellente opportunité. Ce profil de source est exactement ce qu'il faut viser : proche thématiquement, avec une audience réelle et un lien intégré au contenu.";
  }

  function render() {
    var q = qualite();
    var prix = rep['bl-prix'];

    document.getElementById('bl-score').textContent = q;
    document.getElementById('bl-meter').style.width = q + '%';
    document.getElementById('bl-label').textContent = palier(q);

    var txt = 'Qualité du lien : ' + q + '/100 (' + palier(q) + ')\n'
      + 'Prix demandé : ' + PRIX_LABEL[prix] + '\n\n'
      + verdict(q, prix) + '\n\n'
      + 'Détail par critère :\n'
      + '  thématique      : ' + ['aucun rapport', 'secteur voisin', 'même thématique'][rep['bl-thema']] + '\n'
      + '  trafic du site  : ' + ['quasi nul', 'quelques milliers', 'important'][rep['bl-trafic']] + '\n'
      + '  emplacement     : ' + ['pied de page', 'fin d\'article', 'cœur du contenu'][rep['bl-place']] + '\n'
      + '  nature du site  : ' + ['articles sponsorisés uniquement', 'blog généraliste', 'référence du secteur'][rep['bl-nature']] + '\n\n'
      + "Rappel : un lien isolé ne fait jamais de mal. C'est un ensemble de liens "
      + "médiocres acquis rapidement qui constitue un signal négatif.";

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

  var copy = document.getElementById('bl-copy');
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
