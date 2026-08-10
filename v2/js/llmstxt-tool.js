/* Validateur de fichier llms.txt : contrôle la structure décrite par la
   spécification llmstxt.org (titre, résumé en citation, sections, liens
   commentés). Tout se fait dans le navigateur, rien n'est envoyé. */
(function () {
  var input = document.getElementById('lt-in');
  var out = document.getElementById('lt-out');
  if (!input || !out) return;

  var scoreEl = document.getElementById('lt-score');
  var meterEl = document.getElementById('lt-meter');
  var labelEl = document.getElementById('lt-label');

  function analyse(txt) {
    var lignes = txt.split('\n');
    var ok = [], ko = [], score = 0;

    // 1. Titre de niveau 1
    var h1 = lignes.filter(function (l) { return /^#\s+\S/.test(l); });
    if (h1.length === 1) { score += 20; ok.push('Titre de niveau 1 présent et unique'); }
    else if (h1.length === 0) ko.push('Aucun titre de niveau 1 : commencez par « # Nom du site »');
    else { score += 8; ko.push(h1.length + ' titres de niveau 1 : il n\'en faut qu\'un seul'); }

    // 2. Résumé en citation
    var quote = lignes.filter(function (l) { return /^>\s*\S/.test(l); });
    if (quote.length) {
      var motsQuote = quote.join(' ').replace(/^>\s*/gm, '').trim().split(/\s+/).length;
      if (motsQuote >= 10) { score += 20; ok.push('Résumé en citation présent (' + motsQuote + ' mots)'); }
      else { score += 10; ko.push('Résumé en citation trop court : visez 20 à 40 mots'); }
    } else {
      ko.push('Pas de résumé : ajoutez une ligne « > Ce que fait le site, pour qui. »');
    }

    // 3. Sections de niveau 2
    var h2 = lignes.filter(function (l) { return /^##\s+\S/.test(l); });
    if (h2.length >= 2) { score += 20; ok.push(h2.length + ' sections thématiques'); }
    else if (h2.length === 1) { score += 10; ko.push('Une seule section : groupez vos liens par thème'); }
    else ko.push('Aucune section de niveau 2 : ajoutez « ## Services », « ## Ressources »');

    // 4. Liens markdown
    var liens = txt.match(/^\s*-\s*\[[^\]]+\]\([^)]+\)/gm) || [];
    if (liens.length >= 5) { score += 15; ok.push(liens.length + ' liens au format markdown'); }
    else if (liens.length) { score += 7; ko.push('Seulement ' + liens.length + ' lien(s) : visez 10 à 30 pages essentielles'); }
    else ko.push('Aucun lien au format « - [Titre](url) : description »');

    if (liens.length > 40) {
      score -= 10;
      ko.push(liens.length + ' liens, c\'est trop : un sommaire qui liste tout ne hiérarchise plus rien');
    }

    // 5. Descriptions après les liens
    var avecDesc = (txt.match(/^\s*-\s*\[[^\]]+\]\([^)]+\)\s*[:\-–]\s*\S/gm) || []).length;
    if (liens.length) {
      var ratio = avecDesc / liens.length;
      if (ratio >= 0.9) { score += 20; ok.push('Tous les liens sont commentés'); }
      else if (ratio >= 0.5) { score += 10; ko.push(Math.round((1 - ratio) * 100) + ' % des liens n\'ont pas de description'); }
      else ko.push('La plupart des liens n\'ont pas de description : c\'est ce qui fait la valeur du fichier');
    }

    // 6. Contrôles de forme
    var httpAbs = (txt.match(/\]\(https?:\/\//g) || []).length;
    if (liens.length && httpAbs < liens.length) {
      score -= 5;
      ko.push('Certains liens ne sont pas des URL absolues commençant par https');
    }
    if (/<[a-z]+[\s>]/i.test(txt)) {
      score -= 5;
      ko.push('Du HTML a été détecté : le fichier doit être en markdown pur');
    }

    return { score: Math.max(0, Math.min(100, score)), ok: ok, ko: ko };
  }

  // Le cas « champ vide » est traité en amont dans render() : ici, du texte a
  // toujours été saisi, donc un score nul veut dire « à reprendre », pas « en attente ».
  function palier(n) {
    if (n >= 90) return 'conforme';
    if (n >= 70) return 'correct, à peaufiner';
    if (n >= 40) return 'incomplet';
    return 'à reprendre entièrement';
  }

  function render() {
    var txt = input.value.trim();
    if (!txt) {
      scoreEl.textContent = '0';
      meterEl.style.width = '0%';
      labelEl.textContent = 'en attente';
      out.textContent = '';
      return;
    }
    var r = analyse(txt);
    scoreEl.textContent = r.score;
    meterEl.style.width = r.score + '%';
    labelEl.textContent = palier(r.score);

    var s = 'Validation llms.txt : ' + r.score + '/100 (' + palier(r.score) + ')\n';
    if (r.ok.length) {
      s += '\nConforme :\n';
      r.ok.forEach(function (x) { s += '  ✔ ' + x + '\n'; });
    }
    if (r.ko.length) {
      s += '\nÀ corriger :\n';
      r.ko.forEach(function (x) { s += '  ✘ ' + x + '\n'; });
    } else {
      s += '\nRien à corriger. Pensez simplement à le mettre à jour quand vos pages changent.\n';
    }
    out.textContent = s;
  }

  input.addEventListener('input', render);

  var copy = document.getElementById('lt-copy');
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
