/* Optimiseur de quota gratuit : neuf réflexes pondérés selon leur effet réel
   sur la consommation. Estimation indicative, les quotas ne sont pas publics. */
(function () {
  var list = document.getElementById('qt-check');
  var out = document.getElementById('qt-out');
  if (!list || !out) return;

  var boxes = [].slice.call(list.querySelectorAll('input[type="checkbox"]'));
  var scoreEl = document.getElementById('qt-score');
  var meterEl = document.getElementById('qt-meter');
  var labelEl = document.getElementById('qt-label2');

  function palier(n) {
    if (n >= 85) return 'usage déjà très économe';
    if (n >= 60) return 'bonnes habitudes';
    if (n >= 30) return 'marge de progression';
    if (n > 0) return 'des gains faciles à prendre';
    return 'à optimiser';
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

    restants.sort(function (a, b) { return b.p - a.p; });

    var txt = 'Économie de quota : ' + total + '/100 (' + palier(total) + ')\n';

    if (!restants.length) {
      txt += '\nVous appliquez déjà tous les réflexes. Si vous atteignez encore la limite '
           + 'régulièrement, ce n\'est plus une question d\'habitudes : votre usage justifie '
           + "l'abonnement Pro.";
    } else {
      txt += '\nVos prochains réflexes, du plus efficace au moins efficace :\n';
      restants.slice(0, 3).forEach(function (r, i) {
        txt += '\n' + (i + 1) + '. ' + r.txt + '\n';
      });
      if (total < 40) {
        txt += '\nÀ ce niveau, la limite que vous rencontrez vient surtout de vos habitudes, '
             + "pas du plan gratuit lui-même. Commencez par le premier point de la liste : "
             + "c'est celui qui change le plus de choses.";
      } else {
        txt += '\nVous êtes déjà économe. Si la limite vous gêne encore malgré ces réflexes, '
             + "c'est le signe d'un usage professionnel régulier, et l'abonnement devient "
             + 'rentable face au temps perdu à attendre.';
      }
    }

    txt += '\n\nRappel : le quota se compte en volume de texte traité, pas en nombre de '
         + "messages. Une conversation longue renvoie tout son historique à chaque échange.";

    out.textContent = txt;
  }

  list.addEventListener('change', render);

  var copy = document.getElementById('qt-copy');
  if (copy) copy.addEventListener('click', function () {
    var done = function () {
      copy.textContent = 'Copié ✓'; copy.classList.add('ok');
      setTimeout(function () { copy.textContent = 'Copier mes réflexes'; copy.classList.remove('ok'); }, 1800);
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
