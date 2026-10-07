/* Rédacteur de consigne pour Claude Cowork, avec un test « Cowork, chat ou Claude Code ? ».
   Article claude-cowork. 100 % navigateur, aucun appel réseau. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };

  function retour(btn, ok, libelle) {
    if (!btn) return;
    btn.textContent = ok ? 'Copié' : 'Copie impossible';
    if (ok) btn.classList.add('ok');
    setTimeout(function () { btn.textContent = libelle; btn.classList.remove('ok'); }, 1800);
  }
  function copierTexte(texte, btn, libelle) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texte).then(function () { retour(btn, true, libelle); }, function () { retour(btn, false, libelle); });
    } else {
      var i = document.createElement('textarea'); i.value = texte; document.body.appendChild(i); i.select();
      var ok = false; try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      i.remove(); retour(btn, ok, libelle);
    }
  }

  /* Un bouton « Copier la consigne » sous chaque exemple de l'article */
  Array.prototype.forEach.call(document.querySelectorAll('.art-body pre.prompt'), function (pre) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'btn-sm ghost';
    b.textContent = 'Copier la consigne';
    b.addEventListener('click', function () { copierTexte(pre.textContent.trim(), b, 'Copier la consigne'); });
    pre.insertAdjacentElement('afterend', b);
  });

  var out = $('cw-out');
  if (!out) return;

  var liste = $('cw-check');
  var cases = liste ? Array.prototype.slice.call(liste.querySelectorAll('input[type="checkbox"]')) : [];
  var gardeBox = $('cw-garde');
  var chips = gardeBox ? Array.prototype.slice.call(gardeBox.querySelectorAll('.chip')) : [];
  var champs = {
    resultat: $('cw-resultat'), sources: $('cw-sources'), livrable: $('cw-livrable'),
    dest: $('cw-dest'), etapes: $('cw-etapes'), freq: $('cw-freq')
  };
  var verdict = $('cw-verdict'), verdictSub = $('cw-verdict-sub'), meter = $('cw-meter'),
      alertes = $('cw-alertes'), copy = $('cw-copy'), lien = $('cw-claude');

  function coche(k) {
    return cases.some(function (c) { return c.dataset.k === k && c.checked; });
  }
  function nettoie(s) { return (s || '').trim().replace(/[\s.;:]+$/, ''); }
  function lignes(s) {
    return (s || '').split('\n').map(function (l) { return l.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '').trim(); })
      .filter(Boolean);
  }

  function diagnostic() {
    if (coche('code')) {
      return { nom: 'Claude Code', sous: 'est plus adapté : la tâche porte sur du code', pct: 100, cible: 'code' };
    }
    var pts = (coche('etapes') ? 30 : 0) + (coche('fichiers') ? 25 : 0) + (coche('livrable') ? 25 : 0) + (coche('web') ? 20 : 0);
    if (coche('court')) pts -= 40;
    pts = Math.max(0, Math.min(100, pts));
    if (pts >= 50) return { nom: 'Cowork', sous: 'est le bon outil pour cette tâche', pct: pts, cible: 'cowork' };
    if (pts >= 25) return { nom: 'Chat', sous: "d'abord, puis Cowork si un fichier devient nécessaire", pct: pts, cible: 'mixte' };
    return { nom: 'Chat', sous: 'suffit : inutile de lancer une tâche', pct: pts, cible: 'chat' };
  }

  function construire() {
    var d = diagnostic();
    if (verdict) verdict.textContent = d.nom;
    if (verdictSub) verdictSub.textContent = d.sous;
    if (meter) meter.style.width = d.pct + '%';

    var resultat = nettoie(champs.resultat.value);
    var sources = nettoie(champs.sources.value);
    var livrable = champs.livrable.value;
    var dest = nettoie(champs.dest.value);
    var etapes = lignes(champs.etapes.value);
    var freq = champs.freq.value;
    var gardes = chips.filter(function (c) { return c.classList.contains('on'); }).map(function (c) { return c.dataset.v; });

    var t = [];
    t.push('Objectif : ' + (resultat || '[décrivez le résultat attendu]') + '.');
    t.push('');
    t.push('Sources à utiliser : ' + (sources || '[dossiers, fichiers, sites ou connecteurs]') + '.');
    t.push('Livrable : ' + livrable + (dest ? ', enregistré dans ' + dest : '') + '.');
    if (etapes.length) {
      t.push('');
      t.push('Étapes et contraintes :');
      etapes.forEach(function (e) { t.push('- ' + nettoie(e) + '.'); });
    }
    if (gardes.length) {
      t.push('');
      t.push('Règles :');
      gardes.forEach(function (g) { t.push('- ' + g); });
    }
    if (freq) {
      t.push('');
      t.push('Cette tâche reviendra ' + freq + ' : une fois le premier résultat validé, propose-moi la version à planifier avec /schedule.');
    }
    t.push('');
    t.push("Avant de commencer, résume ta compréhension de la tâche en trois lignes et pose-moi les questions nécessaires.");
    var texte = t.join('\n');
    out.textContent = texte;
    if (lien) lien.href = 'https://claude.ai/new?q=' + encodeURIComponent(texte);

    /* Points de vigilance */
    var a = [];
    if (d.cible === 'code') a.push("Ce travail relève de Claude Code, qui travaille dans le dépôt de code avec vos outils de développement.");
    if (d.cible === 'chat') a.push("Une question simple consomme moins de quota dans une conversation classique qu'en tâche Cowork.");
    if (coche('fichiers')) a.push("Fichiers locaux : gardez l'application Claude de bureau ouverte et connectez un dossier dédié, sans données sensibles.");
    if (coche('web')) a.push("Navigation : restez en mode d'approbation manuel, une page peut contenir des instructions malveillantes (injection de prompt).");
    if (gardes.indexOf('Ne supprime aucun fichier.') < 0) a.push("Aucune consigne n'interdit la suppression : Claude demandera votre accord, lisez chaque demande.");
    if (gardes.indexOf("N'envoie, ne publie et n'achète rien.") < 0) a.push("Rien n'interdit l'envoi de messages ou les achats : ajoutez ce garde-fou sauf besoin explicite.");
    if (freq) a.push("Tâche planifiée : elle tournera sans surveillance. Pas de fichiers sensibles, pas d'envoi de messages, pas d'achats.");
    if (!resultat) a.push("Décrivez le résultat attendu : c'est la ligne qui conditionne tout le reste.");
    if (alertes) {
      alertes.textContent = '';
      (a.length ? a : ['Rien à signaler : relisez le plan proposé par Claude avant de le laisser travailler.']).forEach(function (x) {
        var li = document.createElement('li'); li.textContent = x; alertes.appendChild(li);
      });
    }
    return texte;
  }

  chips.forEach(function (c) {
    c.setAttribute('aria-pressed', c.classList.contains('on') ? 'true' : 'false');
    c.addEventListener('click', function () {
      var on = !c.classList.contains('on');
      c.classList.toggle('on', on); c.setAttribute('aria-pressed', on ? 'true' : 'false');
      construire();
    });
  });
  cases.forEach(function (c) { c.addEventListener('change', construire); });
  ['resultat', 'sources', 'dest', 'etapes'].forEach(function (k) { if (champs[k]) champs[k].addEventListener('input', construire); });
  ['livrable', 'freq'].forEach(function (k) { if (champs[k]) champs[k].addEventListener('change', construire); });
  if (copy) copy.addEventListener('click', function () { copierTexte(construire(), copy, 'Copier la consigne'); });

  construire();
})();
