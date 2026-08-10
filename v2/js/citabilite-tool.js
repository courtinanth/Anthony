/* Testeur de citabilité : applique au texte collé les critères qu'un système
   d'extraction utilise pour retenir un passage. Tout se fait dans le navigateur. */
(function () {
  var qEl = document.getElementById('ct-q');
  var tEl = document.getElementById('ct-t');
  var out = document.getElementById('ct-out');
  if (!tEl || !out) return;

  var scoreEl = document.getElementById('ct-score');
  var meterEl = document.getElementById('ct-meter');
  var labelEl = document.getElementById('ct-label');

  var VIDES = ['à l\'heure du', 'dans un monde', 'de nos jours', 'force est de constater',
               'il est important de', 'nul doute que', 'plus que jamais', 'incontournable'];

  function motsCles(q) {
    return q.toLowerCase()
      .replace(/[^a-zà-ÿ0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(function (m) { return m.length > 3; });
  }

  function analyse(q, t) {
    var ok = [], ko = [], score = 0;
    var phrases = t.split(/(?<=[.!?])\s+/).filter(function (p) { return p.trim().length > 10; });
    var deuxPremieres = phrases.slice(0, 2).join(' ').toLowerCase();
    var mots = t.trim().split(/\s+/);

    // 1. La réponse est-elle en tête ?
    if (q.trim()) {
      var cles = motsCles(q);
      var trouves = cles.filter(function (m) { return deuxPremieres.indexOf(m) !== -1; });
      var ratio = cles.length ? trouves.length / cles.length : 0;
      if (ratio >= 0.6) { score += 30; ok.push('Les termes de la question apparaissent dès les deux premières phrases'); }
      else if (ratio >= 0.3) { score += 15; ko.push('Les deux premières phrases ne reprennent que partiellement la question'); }
      else ko.push('La réponse n\'est pas en tête : reformulez la première phrase pour répondre directement');
    } else {
      score += 15;
      ko.push('Renseignez la question ciblée pour un contrôle complet');
    }

    // 2. Longueur des phrases
    var longues = phrases.filter(function (p) { return p.trim().split(/\s+/).length > 35; }).length;
    if (phrases.length && longues / phrases.length < 0.15) { score += 15; ok.push('Phrases courtes, faciles à extraire'); }
    else ko.push(longues + ' phrase(s) de plus de 35 mots : découpez-les');

    // 3. Chiffres et dates
    var chiffres = (t.match(/\b\d[\d\s.,]*\s*(%|€|\$|euros?|dollars?|ans?|mois|jours?|heures?|points?)\b/gi) || []).length;
    var annees = (t.match(/\b20[12]\d\b/g) || []).length;
    if (chiffres >= 2 && annees >= 1) { score += 20; ok.push('Contient des chiffres et une date : très favorable à la citation'); }
    else if (chiffres >= 1 || annees >= 1) { score += 10; ko.push('Ajoutez des données chiffrées ET datées : c\'est ce qui déclenche la recherche web'); }
    else ko.push('Aucun chiffre daté : c\'est le manque le plus pénalisant');

    // 4. Ouvertures non autonomes
    var liants = phrases.filter(function (p) {
      return /^\s*(c'est pourquoi|en effet|ainsi|donc|par conséquent|de plus|en outre|cependant|or\b)/i.test(p.trim());
    }).length;
    if (liants === 0) { score += 15; ok.push('Aucun paragraphe ne dépend du précédent pour se comprendre'); }
    else ko.push(liants + ' phrase(s) commencent par un mot de liaison : elles ne tiennent pas seules');

    // 5. Formules creuses
    var creux = VIDES.filter(function (v) { return t.toLowerCase().indexOf(v) !== -1; });
    if (!creux.length) { score += 10; ok.push('Pas de formule creuse détectée'); }
    else ko.push('Formules à supprimer : ' + creux.slice(0, 3).join(', '));

    // 6. Densité utile
    if (mots.length >= 80) { score += 10; ok.push('Longueur suffisante pour être analysée'); }
    else ko.push('Texte court : collez au moins l\'introduction complète');

    return { score: Math.max(0, Math.min(100, score)), ok: ok, ko: ko };
  }

  function palier(n) {
    if (n >= 85) return 'très citable';
    if (n >= 65) return 'citable, à peaufiner';
    if (n >= 40) return 'peu citable en l\'état';
    return 'à reprendre';
  }

  function render() {
    var t = tEl.value.trim();
    if (!t) {
      scoreEl.textContent = '0';
      meterEl.style.width = '0%';
      labelEl.textContent = 'en attente';
      out.textContent = '';
      return;
    }
    var r = analyse(qEl ? qEl.value : '', t);
    scoreEl.textContent = r.score;
    meterEl.style.width = r.score + '%';
    labelEl.textContent = palier(r.score);

    var s = 'Citabilité : ' + r.score + '/100 (' + palier(r.score) + ')\n';
    if (r.ok.length) {
      s += '\nCe qui va :\n';
      r.ok.forEach(function (x) { s += '  ✔ ' + x + '\n'; });
    }
    if (r.ko.length) {
      s += '\nÀ corriger :\n';
      r.ko.forEach(function (x) { s += '  ✘ ' + x + '\n'; });
    }
    out.textContent = s;
  }

  [qEl, tEl].forEach(function (e) { if (e) e.addEventListener('input', render); });

  var copy = document.getElementById('ct-copy');
  if (copy) copy.addEventListener('click', function () {
    var done = function () {
      copy.textContent = 'Copié ✓'; copy.classList.add('ok');
      setTimeout(function () { copy.textContent = "Copier l'analyse"; copy.classList.remove('ok'); }, 1800);
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
