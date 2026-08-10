/* Estimation de l'occupation d'une fenêtre de contexte.
   Base : 1 000 tokens pour environ 750 mots en français, 500 mots par page.
   Tout se calcule dans le navigateur. */
(function () {
  var out = document.getElementById('cx-out');
  if (!out) return;

  var fenetre = 200000;
  var MOTS_PAR_PAGE = 500;
  var MOTS_PAR_MSG = 180;      // longueur moyenne d'un échange, question et réponse
  var TOKENS_PAR_MOT = 1 / 0.75;

  function num(id) {
    var e = document.getElementById(id);
    var v = e ? parseInt(e.value, 10) : 0;
    return isNaN(v) || v < 0 ? 0 : v;
  }

  function fr(n) { return Math.round(n).toLocaleString('fr-FR'); }

  function render() {
    var pages = num('cx-pages'), msg = num('cx-msg');
    var motsDoc = pages * MOTS_PAR_PAGE;
    var motsHist = msg * MOTS_PAR_MSG;
    var tokens = Math.round((motsDoc + motsHist) * TOKENS_PAR_MOT);
    var pct = fenetre ? Math.round(tokens / fenetre * 100) : 0;

    document.getElementById('cx-pct').textContent = pct;
    document.getElementById('cx-meter').style.width = Math.min(100, pct) + '%';
    document.getElementById('cx-label').textContent =
      pct === 0 ? '' : (pct > 100 ? ' (dépassement)' : (pct > 70 ? ' (fenêtre presque pleine)' : ''));

    if (!pages && !msg) { out.textContent = ''; return; }

    var txt = 'Occupation estimée de la fenêtre\n\n'
      + '  documents  : ' + fr(motsDoc) + ' mots, soit ' + fr(motsDoc * TOKENS_PAR_MOT) + ' tokens\n'
      + '  historique : ' + fr(motsHist) + ' mots, soit ' + fr(motsHist * TOKENS_PAR_MOT) + ' tokens\n'
      + '  total      : ' + fr(tokens) + ' tokens sur ' + fr(fenetre) + ' (' + pct + ' %)\n\n';

    if (pct > 100) {
      txt += "Vous dépassez la fenêtre. Le modèle écartera une partie du contenu, en général "
           + "les échanges les plus anciens. Réduisez : ne joignez que les pages utiles, ou "
           + "démarrez une conversation neuve.\n";
    } else if (pct > 70) {
      txt += "La fenêtre est presque pleine. À ce niveau, l'information utile commence à se "
           + "diluer et les réponses perdent en précision. Isolez les pages qui contiennent "
           + "réellement la réponse plutôt que de tout fournir.\n";
    } else if (pct > 25) {
      txt += "Occupation confortable. Vous avez de la marge pour poursuivre la conversation "
           + "sans saturer, mais gardez en tête que chaque échange ajoute au total.\n";
    } else {
      txt += "Occupation faible : vous pouvez fournir davantage de matière sans risque. "
           + "C'est souvent là que se trouve le gain, la plupart des demandes manquant de "
           + "contexte plutôt que d'en avoir trop.\n";
    }

    if (msg >= 20) {
      txt += "\nAttention à l'historique : " + msg + " échanges représentent déjà "
           + fr(motsHist * TOKENS_PAR_MOT) + " tokens renvoyés à chaque nouveau message. "
           + "Ouvrir une conversation neuve par sujet est le geste qui économise le plus.\n";
    }

    txt += '\nHypothèses : 500 mots par page, 180 mots par échange, '
         + '1 000 tokens pour 750 mots en français. Ce sont des ordres de grandeur, '
         + 'la découpe réelle en tokens varie selon le texte.';

    out.textContent = txt;
  }

  ['cx-pages', 'cx-msg'].forEach(function (id) {
    var e = document.getElementById(id);
    if (e) e.addEventListener('input', render);
  });

  var g = document.getElementById('cx-fen');
  if (g) g.addEventListener('click', function (e) {
    var b = e.target.closest('.chip'); if (!b) return;
    g.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('on'); });
    b.classList.add('on'); fenetre = parseInt(b.dataset.v, 10) || 200000; render();
  });

  var copy = document.getElementById('cx-copy');
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
