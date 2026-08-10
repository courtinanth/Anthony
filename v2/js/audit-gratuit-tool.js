/* Parcours d'audit gratuit : suivi de progression et détail de l'étape en cours.
   Tout reste dans le navigateur, rien n'est envoyé. */
(function () {
  var list = document.getElementById('ag2-check');
  var out = document.getElementById('ag2-out');
  if (!list || !out) return;

  var boxes = [].slice.call(list.querySelectorAll('input[type="checkbox"]'));
  var TOTAL = boxes.reduce(function (s, b) { return s + (parseInt(b.dataset.m, 10) || 0); }, 0);

  var DETAIL = {
    depart: "Notez le trafic organique des trois derniers mois, le nombre de pages indexées "
      + "et vos positions sur dix requêtes prioritaires.\n\nC'est l'étape que tout le monde saute, "
      + "et celle qui manque quand il faut prouver l'effet des corrections six mois plus tard.",
    index: "Search Console, rapport d'indexation des pages.\n\nRegardez le nombre de pages indexées, "
      + "puis la liste des non indexées avec leur motif. Traitez en priorité : les pages exclues par "
      + "une balise noindex qui devraient être visibles, les pages explorées mais non indexées, "
      + "et les erreurs serveur.",
    crawl: "Lancez un crawler sur votre domaine et laissez-le terminer.\n\nQuatre choses à relever : "
      + "les codes de réponse autres que 200, les balises title manquantes ou dupliquées, les pages "
      + "sans H1, et la profondeur de vos pages importantes. Au-delà de trois clics depuis l'accueil, "
      + "une page stratégique est mal placée.",
    croise: "L'étape la plus rentable de tout l'audit.\n\nExportez les pages trouvées par le crawler "
      + "d'un côté, les pages qui reçoivent des impressions dans la Search Console de l'autre. "
      + "Comparez. Ce qui est dans la première liste et pas dans la seconde constitue vos pages "
      + "invisibles : c'est là que se cache votre potentiel.",
    perf: "Testez vos trois pages les plus importantes, pas seulement l'accueil.\n\nRegardez le temps "
      + "d'affichage du plus grand élément, la stabilité visuelle pendant le chargement et le rendu "
      + "sur téléphone. Les gains les plus faciles : compresser les images, différer les scripts "
      + "non essentiels, déclarer les dimensions des images.",
    plan: "Ne corrigez pas dans l'ordre où vous avez trouvé les problèmes.\n\nClassez ainsi : "
      + "1. ce qui bloque l'indexation, 2. ce qui touche beaucoup de pages d'un coup comme un gabarit, "
      + "3. ce qui concerne vos pages les plus rentables, 4. le reste.\n\nC'est cette hiérarchisation "
      + "qui transforme une liste d'alertes en plan d'action."
  };

  function render() {
    var reste = 0, faits = 0, courante = null;
    boxes.forEach(function (b) {
      var m = parseInt(b.dataset.m, 10) || 0;
      if (b.checked) faits += m;
      else {
        reste += m;
        if (!courante) courante = b;
      }
    });

    document.getElementById('ag2-reste').textContent = reste;
    document.getElementById('ag2-meter').style.width = Math.round(faits / TOTAL * 100) + '%';
    document.getElementById('ag2-label2').textContent =
      reste === 0 ? ' (audit terminé)' : ' sur ' + TOTAL;

    if (!courante) {
      out.textContent = "Audit terminé.\n\nVous avez maintenant une liste de problèmes classés par "
        + "impact et une situation de départ chiffrée. Corrigez d'abord ce qui bloque l'indexation, "
        + "puis remesurez dans un mois avec les mêmes indicateurs qu'à l'étape 1.\n\n"
        + "Si tout est au vert et que le trafic stagne, le problème n'est plus technique : "
        + "il est sémantique ou concurrentiel.";
      return;
    }

    var k = courante.dataset.k;
    var titre = courante.parentNode.textContent.trim();
    out.textContent = 'Étape en cours : ' + titre + '\n'
      + 'Durée estimée : ' + courante.dataset.m + ' minutes\n\n'
      + (DETAIL[k] || '');
  }

  list.addEventListener('change', render);

  var copy = document.getElementById('ag2-copy');
  if (copy) copy.addEventListener('click', function () {
    var txt = "Audit SEO gratuit : la marche à suivre\n\n";
    boxes.forEach(function (b, i) {
      txt += (b.checked ? '[x] ' : '[ ] ') + b.parentNode.textContent.trim()
           + ' (' + b.dataset.m + ' min)\n';
      var d = DETAIL[b.dataset.k];
      if (d) txt += '    ' + d.replace(/\n+/g, '\n    ') + '\n\n';
    });
    var done = function () {
      copy.textContent = 'Copié ✓'; copy.classList.add('ok');
      setTimeout(function () { copy.textContent = 'Copier la marche à suivre'; copy.classList.remove('ok'); }, 1800);
    };
    if (navigator.clipboard) navigator.clipboard.writeText(txt).then(done, function () {});
    else {
      var i = document.createElement('textarea');
      i.value = txt; document.body.appendChild(i);
      i.select(); document.execCommand('copy'); i.remove(); done();
    }
  });

  render();
})();
