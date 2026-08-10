/* Estimation de l'exposition du trafic aux résumés générés de Google.
   Les hypothèses sont affichées avec le résultat. Aucun appel réseau. */
(function () {
  var out = document.getElementById('ao-out');
  if (!out) return;

  var type = 'info', pos = 1;

  // Part des requêtes déclenchant un résumé, par famille. Ordres de grandeur
  // observés en mission, volontairement prudents.
  var DECLENCHE = { info: 0.65, compa: 0.45, marque: 0.10, local: 0.25 };
  // Part des clics perdus parmi les requêtes concernées.
  var PERTE = { info: 0.35, compa: 0.20, marque: 0.05, local: 0.15 };
  var LIB = {
    info: 'questions et définitions',
    compa: 'comparatifs et avis',
    marque: 'marque et achat direct',
    local: 'recherches locales'
  };

  function num(id) {
    var e = document.getElementById(id);
    var v = e ? parseFloat(e.value) : 0;
    return isNaN(v) || v < 0 ? 0 : v;
  }

  function render() {
    var imp = num('ao-imp'), clics = num('ao-clic');
    var perteEl = document.getElementById('ao-perte');
    var meterEl = document.getElementById('ao-meter');
    var labelEl = document.getElementById('ao-label');

    if (!clics) {
      perteEl.textContent = '0';
      meterEl.style.width = '0%';
      labelEl.textContent = '';
      out.textContent = '';
      return;
    }

    // Une position lointaine est moins exposée : ces clics sont déjà rares.
    var facteurPos = pos === 1 ? 1 : (pos === 2 ? 0.7 : 0.4);
    var exposes = Math.round(clics * DECLENCHE[type]);
    var perdus = Math.round(exposes * PERTE[type] * facteurPos);
    var ctr = imp ? (clics / imp * 100) : 0;

    perteEl.textContent = perdus;
    meterEl.style.width = Math.min(100, Math.round(perdus / clics * 100 * 2)) + '%';
    labelEl.textContent = ' (' + Math.round(perdus / clics * 100) + ' % de vos clics)';

    var txt = 'Exposition estimée aux résumés générés\n\n'
      + '  clics mensuels actuels     : ' + clics + '\n'
      + '  clics sur requêtes exposées: ' + exposes + '\n'
      + '  clics potentiellement perdus: ' + perdus
      + ' (' + Math.round(perdus / clics * 100) + ' %)\n';

    if (imp) txt += '  taux de clic actuel        : ' + ctr.toFixed(2) + ' %\n';

    txt += '\nLecture :\n';
    if (type === 'marque') {
      txt += "Votre trafic vient surtout de requêtes de marque ou d'achat direct, sur "
           + "lesquelles les résumés se déclenchent peu. Vous êtes parmi les moins exposés : "
           + "surveillez, mais ne refondez rien.\n";
    } else if (type === 'info') {
      txt += "Votre trafic repose sur des questions informationnelles, la famille la plus "
           + "exposée. C'est aussi celle où la restructuration en questions et réponses "
           + "donne les meilleurs résultats.\n";
    } else if (type === 'compa') {
      txt += "Les comparatifs résistent mieux que les définitions : le résumé sert souvent "
           + "d'introduction et le lecteur clique quand même pour décider. Renforcez ce qui "
           + "aide à trancher : tableaux, prix, critères.\n";
    } else {
      txt += "Sur le local, l'enjeu se déplace vers la fiche Google Business et les avis, "
           + "davantage que vers le site lui-même.\n";
    }

    txt += '\nPlan d\'action :\n'
      + '  1. Vérifier dans la Search Console les requêtes à impressions stables et clics en baisse.\n'
      + '  2. Restructurer les pages exposées en questions suivies de réponses courtes.\n'
      + '  3. Renforcer les contenus qui aident à décider : prix, comparatifs, cas réels.\n'
      + '  4. Suivre le taux de clic à position constante, pas seulement les sessions.\n'
      + '\nHypothèses retenues :\n'
      + '  famille de requêtes : ' + LIB[type] + '\n'
      + '  part des requêtes déclenchant un résumé : ' + Math.round(DECLENCHE[type] * 100) + ' %\n'
      + '  part de clics perdus sur ces requêtes : ' + Math.round(PERTE[type] * 100) + ' %\n'
      + '  ajustement selon la position moyenne : x' + facteurPos + '\n'
      + '\nCe sont des ordres de grandeur observés en mission, pas une mesure de votre site. '
      + 'Seule la Search Console donne votre chiffre réel.';

    out.textContent = txt;
  }

  ['ao-imp', 'ao-clic'].forEach(function (id) {
    var e = document.getElementById(id);
    if (e) e.addEventListener('input', render);
  });

  var gt = document.getElementById('ao-type');
  if (gt) gt.addEventListener('click', function (e) {
    var b = e.target.closest('.chip'); if (!b) return;
    gt.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('on'); });
    b.classList.add('on'); type = b.dataset.v; render();
  });

  var gp = document.getElementById('ao-pos');
  if (gp) gp.addEventListener('click', function (e) {
    var b = e.target.closest('.chip'); if (!b) return;
    gp.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('on'); });
    b.classList.add('on'); pos = parseInt(b.dataset.v, 10) || 1; render();
  });

  var copy = document.getElementById('ao-copy');
  if (copy) copy.addEventListener('click', function () {
    var done = function () {
      copy.textContent = 'Copié ✓'; copy.classList.add('ok');
      setTimeout(function () { copy.textContent = "Copier l'estimation"; copy.classList.remove('ok'); }, 1800);
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
