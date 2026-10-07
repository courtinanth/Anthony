/* Analyseur de rédaction SEO pour l'article contenu-seo.
   Vérifie les emplacements du mot-clé, la longueur et la lisibilité d'un texte collé.
   100 % navigateur, aucun appel réseau : le texte ne quitte pas la page. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var kw = $('cse-kw'), fmt = $('cse-format'), title = $('cse-title'), meta = $('cse-meta'),
      texte = $('cse-texte'), score = $('cse-score'), meter = $('cse-meter'), out = $('cse-out'),
      copy = $('cse-copy'), demo = $('cse-demo');
  if (!kw || !texte || !out) return;

  var LONGUEURS = {
    article: [1500, 2500, '1 500 à 2 500 mots'],
    guide: [2500, 4000, '2 500 à 4 000 mots'],
    service: [800, 1500, '800 à 1 500 mots'],
    produit: [300, 900, '300 à 900 mots']
  };
  var VIDES = ['le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'et', 'ou', 'au', 'aux', 'en', 'pour', 'par',
               'sur', 'avec', 'sans', 'dans', 'que', 'qui', 'quoi', 'comment', 'est', 'ce', 'se', 'son', 'sa',
               'ses', 'vos', 'votre', 'mon', 'ma', 'mes', 'quel', 'quelle'];

  function norm(s) {
    return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/['’]/g, ' ').replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function significatifs(k) {
    return norm(k).split(' ').filter(function (w) { return w.length > 1 && VIDES.indexOf(w) < 0; });
  }
  /* 2 : expression exacte, 1 : tous les mots importants présents, 0 : absent */
  function presence(txt, k) {
    var t = ' ' + norm(txt) + ' ', n = norm(k);
    if (!n) return 0;
    if (t.indexOf(' ' + n + ' ') >= 0) return 2;
    var m = significatifs(k);
    if (m.length && m.every(function (w) { return t.indexOf(' ' + w) >= 0; })) return 1;
    return 0;
  }
  function occurrences(txt, k) {
    var t = ' ' + norm(txt) + ' ', n = ' ' + norm(k) + ' ', c = 0, i = 0;
    if (n.trim() === '') return 0;
    while ((i = t.indexOf(n, i)) >= 0) { c++; i += n.length - 1; }
    return c;
  }
  function mots(s) { return (s || '').split(/\s+/).filter(Boolean); }

  function decouper(brut) {
    var r = { h1: [], h2: [], h3: [], paras: [] }, cur = [];
    function vider() { if (cur.length) { r.paras.push(cur.join(' ')); cur = []; } }
    brut.split(/\r?\n/).forEach(function (l) {
      var m = l.match(/^\s*(#{1,6})\s+(.*)$/);
      if (m) {
        vider();
        var niv = m[1].length;
        (niv === 1 ? r.h1 : niv === 2 ? r.h2 : r.h3).push(m[2].trim());
      } else if (!l.trim()) {
        vider();
      } else {
        cur.push(l.trim());
      }
    });
    vider();
    return r;
  }

  function analyser() {
    var k = (kw.value || '').trim();
    var t = (title.value || '').trim();
    var md = (meta.value || '').trim();
    var d = decouper(texte.value || '');
    var corps = d.paras.join(' ');
    var w = mots(corps);
    var n = w.length;
    var cible = LONGUEURS[fmt.value] || LONGUEURS.article;
    var res = [];

    function ajoute(poids, etat, msg) { res.push({ p: poids, e: etat, m: msg }); }

    if (!k) return null;

    /* Balise title */
    if (!t) ajoute(2, 'ko', 'Balise title absente.');
    else {
      var lt = t.length;
      if (lt > 65) ajoute(1, 'warn', 'Title de ' + lt + ' caractères : la fin risque d\'être coupée dans Google.');
      else if (lt < 30) ajoute(1, 'warn', 'Title de ' + lt + ' caractères : trop court pour porter une promesse.');
      else ajoute(1, 'ok', 'Title de ' + lt + ' caractères.');
      var pt = presence(t, k);
      if (pt === 2 && norm(t).indexOf(norm(k)) <= 12) ajoute(2, 'ok', 'Mot-clé au début du title.');
      else if (pt === 2) ajoute(2, 'warn', 'Mot-clé présent dans le title, mais pas au début.');
      else if (pt === 1) ajoute(2, 'warn', 'Les mots du mot-clé sont dans le title, pas l\'expression.');
      else ajoute(2, 'ko', 'Mot-clé absent du title.');
    }

    /* Meta description */
    if (!md) ajoute(1, 'ko', 'Meta description absente : Google prendra un extrait de la page.');
    else {
      var lm = md.length;
      if (lm >= 120 && lm <= 155) ajoute(1, 'ok', 'Meta description de ' + lm + ' caractères.');
      else ajoute(1, 'warn', 'Meta description de ' + lm + ' caractères (repère : 120 à 155).');
      if (presence(md, k)) ajoute(1, 'ok', 'Mot-clé présent dans la meta description.');
      else ajoute(1, 'warn', 'Mot-clé absent de la meta description.');
    }

    /* H1 */
    if (!d.h1.length) ajoute(1, 'warn', 'Aucun H1 détecté (ligne commençant par #).');
    else if (d.h1.length > 1) ajoute(1, 'ko', d.h1.length + ' H1 détectés : gardez-en un seul.');
    else if (presence(d.h1[0], k)) ajoute(2, 'ok', 'Mot-clé présent dans le H1.');
    else ajoute(2, 'ko', 'Mot-clé absent du H1.');

    if (!n) {
      ajoute(3, 'ko', 'Aucun texte détecté : collez le corps de l\'article.');
    } else {
      /* Introduction */
      if (presence(w.slice(0, 100).join(' '), k)) ajoute(2, 'ok', 'Mot-clé dans les 100 premiers mots.');
      else ajoute(2, 'ko', 'Mot-clé absent des 100 premiers mots : la réponse arrive trop tard.');

      /* Intertitres */
      var inter = d.h2.concat(d.h3);
      var minH2 = n > 600 ? 3 : 2;
      if (d.h2.length >= minH2) ajoute(1, 'ok', d.h2.length + ' intertitres H2.');
      else ajoute(1, 'warn', d.h2.length + ' intertitre(s) H2 pour ' + n + ' mots : structurez davantage (lignes ##).');
      if (d.h2.some(function (h) { return presence(h, k) > 0; })) ajoute(2, 'ok', 'Mot-clé ou ses mots dans au moins un H2.');
      else ajoute(2, 'ko', 'Aucun H2 ne reprend le mot-clé.');
      var questions = inter.filter(function (h) { return /\?\s*$/.test(h); }).length;
      if (questions) ajoute(1, 'ok', questions + ' intertitre(s) formulé(s) comme une question.');
      else ajoute(1, 'warn', 'Aucun intertitre en forme de question : reprenez celles du bloc « Autres questions posées ».');

      /* Longueur */
      if (n < cible[0]) ajoute(2, 'warn', n + ' mots, sous le repère de ' + cible[2] + ' : vérifiez les questions non traitées.');
      else if (n > cible[1]) ajoute(2, 'warn', n + ' mots, au-dessus du repère de ' + cible[2] + ' : cherchez les paragraphes supprimables.');
      else ajoute(2, 'ok', n + ' mots, dans le repère de ' + cible[2] + '.');

      /* Lisibilité */
      var longs = d.paras.filter(function (p) { return mots(p).length > 120; }).length;
      if (longs) ajoute(1, 'warn', longs + ' paragraphe(s) de plus de 120 mots : coupez-les.');
      else ajoute(1, 'ok', 'Aucun paragraphe de plus de 120 mots.');
      var phrases = corps.split(/[.!?…]+\s+/).filter(function (p) { return p.trim(); });
      var longues = phrases.filter(function (p) { return mots(p).length > 30; }).length;
      var part = phrases.length ? Math.round((longues / phrases.length) * 100) : 0;
      if (part > 15) ajoute(1, 'warn', part + ' % de phrases de plus de 30 mots : raccourcissez.');
      else ajoute(1, 'ok', part + ' % de phrases de plus de 30 mots.');

      /* Répétition */
      var occ = occurrences(corps, k);
      var dens = Math.round(((occ * Math.max(1, mots(k).length)) / n) * 1000) / 10;
      if (n >= 300 && dens > 3) ajoute(1, 'warn', 'Expression répétée ' + occ + ' fois (' + String(dens).replace('.', ',') + ' % du texte) : la répétition se lit, variez.');
      else ajoute(1, 'ok', 'Expression exacte présente ' + occ + ' fois : pas de sur-optimisation visible.');
    }

    var total = 0, obtenu = 0;
    res.forEach(function (r) { total += r.p; obtenu += r.e === 'ok' ? r.p : r.e === 'warn' ? r.p / 2 : 0; });
    return { res: res, note: total ? Math.round((obtenu / total) * 100) : 0, n: n, k: k };
  }

  function rendre() {
    var a = analyser();
    out.textContent = '';
    if (!a) {
      out.textContent = 'Indiquez le mot-clé principal, la balise title et la meta description, puis collez votre texte : le diagnostic se met à jour à chaque frappe.';
      score.textContent = '0';
      if (meter) meter.style.width = '0%';
      return null;
    }
    score.textContent = String(a.note);
    if (meter) meter.style.width = a.note + '%';
    var signe = { ok: '✔ ', warn: '▲ ', ko: '✘ ' };
    var ordre = { ko: 0, warn: 1, ok: 2 };
    a.res.slice().sort(function (x, y) { return ordre[x.e] - ordre[y.e]; }).forEach(function (r) {
      var p = document.createElement('div');
      p.textContent = signe[r.e] + r.m;
      out.appendChild(p);
    });
    return a;
  }

  function copier() {
    var a = rendre();
    if (!a) return;
    var texteCopie = 'Diagnostic de rédaction SEO pour « ' + a.k + ' » : ' + a.note + ' / 100\n\n' +
      out.innerText + '\n\nAnalyseur : anthony-courtin.com/blog/contenu-seo';
    var fini = function (ok) {
      if (!copy) return;
      var x = copy.textContent;
      copy.textContent = ok ? 'Copié' : 'Copie impossible';
      setTimeout(function () { copy.textContent = x; }, 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texteCopie).then(function () { fini(true); }, function () { fini(false); });
    } else { fini(false); }
  }

  function exemple() {
    kw.value = 'nettoyer un four';
    fmt.value = 'article';
    title.value = 'Nettoyer un four : la méthode en 5 étapes, sans produit chimique';
    meta.value = 'Nettoyer un four sans produit chimique : 5 étapes avec du bicarbonate et du vinaigre, le temps de pose et les erreurs qui abîment la vitre.';
    texte.value = [
      '# Nettoyer un four : la méthode en 5 étapes',
      'Pour nettoyer un four sans produit chimique, étalez une pâte de bicarbonate et d\'eau, laissez poser une nuit, puis essuyez et rincez au vinaigre blanc. Voici les 5 étapes, le matériel et les erreurs à éviter.',
      '',
      '## De quoi avez-vous besoin ?',
      'Du bicarbonate de soude, du vinaigre blanc, une éponge non abrasive et un vaporisateur.',
      '',
      '## Comment nettoyer un four en 5 étapes ?',
      'Retirez les grilles, préparez la pâte, appliquez-la sur les parois froides, laissez poser douze heures, puis essuyez et vaporisez le vinaigre.',
      '',
      '## Les erreurs à éviter',
      'Ne grattez jamais la vitre avec une lame : les rayures sont définitives.'
    ].join('\n');
    rendre();
  }

  [kw, title, meta, texte].forEach(function (el) { el.addEventListener('input', rendre); });
  fmt.addEventListener('change', rendre);
  if (copy) copy.addEventListener('click', copier);
  if (demo) demo.addEventListener('click', exemple);
  rendre();
})();
