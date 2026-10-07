/* Simulateur de fan-out pour le Mode IA de Google.
   À partir d'un sujet, propose la question complète qu'un internaute poserait
   au Mode IA et les sous-questions que Google est susceptible d'explorer
   (hypothèses, pas la liste réelle de Google). Produit des liens de test
   et une grille de suivi CSV. Article mode-ia-google.
   100 % navigateur : aucun appel réseau, le fichier est créé sur place. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var sujetEl = $('md-sujet'), zoneEl = $('md-zone'), marqueEl = $('md-marque'),
      chips = $('md-type'), liste = $('md-liste'), out = $('md-out'),
      nb = $('md-nb'), meter = $('md-meter'), copy = $('md-copy'), csv = $('md-csv');
  if (!sujetEl || !out || !liste) return;

  var type = 'comparer';
  var annee = new Date().getFullYear();

  function v(el) { return el ? el.value.trim() : ''; }

  function questions(s, z, m) {
    var az = z ? ' à ' + z : '';
    var complete, sous, couvrir;

    if (type === 'comprendre') {
      complete = 'Explique-moi simplement : ' + s + '. Comment ça fonctionne, quels avantages, quelles limites et quelles erreurs éviter ? Termine par les trois premières étapes pour commencer.';
      sous = [
        s + ' : définition simple et exemples',
        s + ' : comment ça fonctionne',
        s + ' : avantages et inconvénients',
        s + ' : erreurs fréquentes à éviter',
        s + ' : étapes pour commencer',
        s + ' en ' + annee + ' : ce qui a changé'
      ];
      couvrir = ['Une définition en deux phrases dès le début', 'Un exemple concret', 'Les limites, dites franchement', 'Les étapes numérotées'];
    } else if (type === 'acheter') {
      complete = 'Je veux acheter : ' + s + az + '. Quel budget prévoir, quelles garanties vérifier et quelles offres ont le meilleur rapport qualité-prix ? Présente les options dans un tableau.';
      sous = [
        s + ' : prix moyen et fourchette de tarifs',
        s + ' : où acheter ou souscrire' + az,
        s + ' : avis clients et retours d\'expérience',
        s + ' : garanties et conditions à vérifier',
        s + ' : meilleur rapport qualité-prix',
        s + ' : questions à poser avant de signer'
      ];
      couvrir = ['Des prix chiffrés et datés', 'Un tableau des offres', 'Les garanties et conditions', 'Des avis vérifiables'];
    } else if (type === 'local') {
      var lz = z ? ' à ' + z : ' près de chez moi';
      complete = 'Je cherche : ' + s + lz + '. Quels professionnels ont les meilleurs avis, quels prix sont pratiqués et comment choisir ? Donne-moi une liste comparée.';
      sous = [
        s + lz + ' : meilleurs professionnels',
        s + lz + ' : prix constatés',
        s + lz + ' : avis clients',
        s + lz + ' : disponibilité et délais',
        s + lz + ' : comment choisir',
        s + lz + ' : horaires et contact'
      ];
      couvrir = ['Une fiche Google Business complète et à jour', 'Des avis récents avec vos réponses', 'Une page locale avec zone, prix indicatifs et délais', 'Nom, adresse et téléphone identiques partout'];
    } else {
      complete = 'Je cherche : ' + s + az + '. Compare les meilleures options selon le prix, les avis et les fonctionnalités, présente le résultat dans un tableau et dis-moi laquelle choisir pour une petite entreprise.';
      sous = [
        s + ' : meilleures options en ' + annee,
        s + ' : critères pour comparer',
        s + ' : comparatif des prix',
        s + ' : avis des utilisateurs',
        s + ' : alternatives possibles',
        s + ' : gratuit ou payant, que choisir ?'
      ];
      couvrir = ['Un tableau comparatif avec vos critères', 'Des prix publics et datés', 'Un verdict par profil d\'acheteur', 'Les limites de chaque option, y compris la vôtre'];
    }

    if (m) {
      sous = sous.concat([
        m + ' : avis',
        m + ' : prix',
        m + ' ou ses concurrents pour ' + s + ' : lequel choisir ?',
        m + ' est-il fiable ?'
      ]);
    }
    return { complete: complete, sous: sous, couvrir: couvrir };
  }

  function lienModeIA(q) { return 'https://www.google.com/search?udm=50&q=' + encodeURIComponent(q).replace(/%20/g, '+'); }

  function lien(texte, href) {
    var a = document.createElement('a');
    a.href = href; a.target = '_blank'; a.rel = 'noopener nofollow';
    a.textContent = texte;
    return a;
  }

  var dernier = null;

  function render() {
    var s = v(sujetEl), z = v(zoneEl), m = v(marqueEl);
    liste.textContent = '';
    if (!s) {
      out.textContent = '';
      if (nb) nb.textContent = '0';
      if (meter) meter.style.width = '0%';
      dernier = null;
      return;
    }
    var r = questions(s, z, m);
    var toutes = [r.complete].concat(r.sous);
    dernier = toutes;

    toutes.forEach(function (q, i) {
      var li = document.createElement('li');
      var t = document.createElement(i === 0 ? 'strong' : 'span');
      t.textContent = q;
      li.appendChild(t);
      li.appendChild(document.createTextNode(' '));
      li.appendChild(lien('Tester en Mode IA', lienModeIA(q)));
      liste.appendChild(li);
    });

    var txt = 'Simulation de fan-out Mode IA : ' + s + (z ? ' (' + z + ')' : '') + '\n\n'
      + 'Question complète à poser au Mode IA :\n' + r.complete + '\n\n'
      + 'Sous-questions probables (hypothèses, pas la liste réelle de Google) :\n';
    r.sous.forEach(function (q, i) { txt += '  ' + (i + 1) + '. ' + q + '\n'; });
    txt += '\nÀ couvrir sur votre page pour être cité :\n';
    r.couvrir.forEach(function (c) { txt += '  - ' + c + '\n'; });
    txt += '\nProtocole de suivi :\n'
      + '  1. Posez chaque question en Mode IA, toujours avec la même formulation.\n'
      + '  2. Notez si votre marque est citée, quels concurrents et quelles sources apparaissent.\n'
      + '  3. Recommencez chaque mois avec le même panel, et comparez les valeurs absolues.\n'
      + '\nSource : anthony-courtin.com/blog/mode-ia-google';
    out.textContent = txt;

    if (nb) nb.textContent = toutes.length;
    if (meter) meter.style.width = Math.min(100, Math.round(toutes.length / 11 * 100)) + '%';
  }

  function celluleCsv(x) {
    x = String(x);
    return /[";\n]/.test(x) ? '"' + x.replace(/"/g, '""') + '"' : x;
  }

  function telecharger() {
    if (!dernier) { sujetEl.focus(); return; }
    var lignes = [['Question', 'Lien Mode IA', 'Date du relevé', 'Marque citée (oui/non)', 'Concurrents cités', 'Sources citées', 'Notes']];
    dernier.forEach(function (q) { lignes.push([q, lienModeIA(q), '', '', '', '', '']); });
    var contenu = '﻿' + lignes.map(function (l) { return l.map(celluleCsv).join(';'); }).join('\r\n');
    var blob = new Blob([contenu], { type: 'text/csv;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = 'suivi-mode-ia.csv';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function copier() {
    var valeur = out.textContent;
    if (!valeur) { sujetEl.focus(); return; }
    var fini = function () {
      copy.textContent = 'Copié ✓'; copy.classList.add('ok');
      setTimeout(function () { copy.textContent = 'Copier les questions'; copy.classList.remove('ok'); }, 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(valeur).then(fini, function () {});
    } else {
      var t = document.createElement('textarea');
      t.value = valeur; document.body.appendChild(t);
      t.select(); document.execCommand('copy'); t.remove(); fini();
    }
  }

  [sujetEl, zoneEl, marqueEl].forEach(function (el) { if (el) el.addEventListener('input', render); });
  if (chips) chips.addEventListener('click', function (e) {
    var b = e.target.closest('.chip'); if (!b) return;
    chips.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('on'); });
    b.classList.add('on'); type = b.dataset.v; render();
  });
  if (copy) copy.addEventListener('click', copier);
  if (csv) csv.addEventListener('click', telecharger);

  render();
})();
