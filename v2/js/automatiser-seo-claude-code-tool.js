/* Générateur de fichier SKILL.md (format Agent Skills).
   Article claude-skills. 100 % navigateur, aucun appel réseau. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var out = $('sk-out');
  if (!out) return;

  var champs = {
    exemple: $('sk-exemple'), nom: $('sk-nom'), cible: $('sk-cible'),
    quoi: $('sk-quoi'), quand: $('sk-quand'), etapes: $('sk-etapes'),
    format: $('sk-format'), regles: $('sk-regles'), manuel: $('sk-manuel')
  };
  var optCode = $('sk-opt-code'), checks = $('sk-checks'),
      score = $('sk-score'), meter = $('sk-meter'),
      copy = $('sk-copy'), dl = $('sk-dl');
  var chipsBox = $('sk-fichiers');
  var chips = chipsBox ? Array.prototype.slice.call(chipsBox.querySelectorAll('.chip')) : [];
  var titrePreset = '';

  var EXEMPLES = {
    balises: {
      nom: 'controle-balises-seo',
      titre: 'Contrôle des balises SEO',
      quoi: "Contrôle les balises title et meta description d'un site et propose des corrections",
      quand: 'pour un audit de balises, de titles ou de meta descriptions',
      etapes: "Lire l'export de crawl fourni (CSV) ou crawler les URL indiquées\nRepérer les titles absents, en double, de moins de 30 ou de plus de 60 caractères\nFaire de même pour les meta descriptions (plus de 155 caractères)\nProposer une réécriture pour chaque page fautive, avec le nombre de caractères",
      format: 'Un tableau : URL, problème, balise actuelle, proposition, nombre de caractères. Puis les cinq pages à traiter en premier.',
      regles: "Ne modifier aucun fichier sans validation explicite\nLe title contient la requête visée par la page, au début si possible\nSignaler les cas ambigus dans une liste à arbitrer au lieu de trancher",
      fichiers: ['references']
    },
    maillage: {
      nom: 'audit-maillage-interne',
      titre: 'Audit du maillage interne',
      quoi: 'Analyse le maillage interne à partir d\'un crawl, repère les pages orphelines ou trop profondes et propose des liens',
      quand: 'pour un audit de liens internes ou de maillage',
      etapes: "Extraire la liste des URL avec leurs liens entrants\nIdentifier les pages orphelines et celles à plus de trois clics de l'accueil\nProposer trois liens entrants par page prioritaire, avec la page source et l'ancre\nVérifier qu'aucune proposition ne pointe vers une page en erreur ou redirigée",
      format: 'Un tableau : page cible, page source, ancre proposée, emplacement suggéré.',
      regles: "Aucune ancre générique : l'ancre décrit la page cible\nPas plus de trois nouveaux liens par page source\nNe modifier aucun contenu sans validation explicite",
      fichiers: []
    },
    redirections: {
      nom: 'plan-redirections',
      titre: 'Plan de redirections',
      quoi: "Établit le plan de redirections 301 d'une migration, une ancienne URL vers une destination précise",
      quand: "lors d'une refonte, d'un changement de structure ou d'URL",
      etapes: "Récupérer la liste complète des anciennes URL avec leur trafic\nRapprocher chaque ancienne adresse de son équivalent le plus proche\nLister à part les URL sans correspondance évidente\nGénérer le fichier de redirections\nContrôler l'absence de chaîne et de boucle",
      format: 'Le fichier de redirections, puis la liste des URL à arbitrer avec leur trafic.',
      regles: "Une ancienne URL, une destination précise, une seule redirection\nAucune règle globale qui envoie un dossier entier vers une catégorie\nSignaler les cas ambigus au lieu de trancher",
      fichiers: ['scripts'],
      manuel: true
    },
    cr: {
      nom: 'compte-rendu-reunion',
      titre: 'Compte rendu de réunion',
      quoi: 'Transforme des notes brutes de réunion en compte rendu structuré avec un tableau des actions',
      quand: "pour un compte rendu, une synthèse de réunion ou des notes à mettre au propre",
      etapes: "Identifier le contexte, les participants et la date\nExtraire les décisions prises\nLister les actions avec un responsable et une échéance\nRelever les points restés ouverts",
      format: 'Contexte en deux lignes, décisions, tableau des actions (action, responsable, échéance), points à trancher.',
      regles: "N'inventer aucune décision absente des notes\nÉcrire « non précisé » quand un responsable ou une échéance manque\nUne page maximum",
      fichiers: ['assets']
    },
    charte: {
      nom: 'charte-editoriale',
      titre: 'Charte éditoriale',
      quoi: "Applique la charte éditoriale de l'entreprise à tout texte rédigé ou relu",
      quand: 'pour un e-mail, un post, une page web ou une relecture',
      etapes: "Lire la charte dans references/charte.md\nRédiger ou relire le texte en appliquant le ton et le vocabulaire\nVérifier la liste des mots interdits\nSignaler les passages qui contredisent la charte",
      format: 'Le texte final, puis la liste des modifications faites et pourquoi.',
      regles: "Vouvoyer le lecteur\nÉcrire les nombres en chiffres à partir de 10\nAucun superlatif sans preuve",
      fichiers: ['references']
    }
  };

  function enKebab(s) {
    return (s || '').toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
      .slice(0, 64).replace(/-$/, '');
  }
  function sansPoint(s) { return (s || '').trim().replace(/[\s.;:!?]+$/, ''); }
  function majuscule(s) { s = (s || '').trim(); return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  function lignes(s) {
    return (s || '').split('\n').map(function (l) { return l.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '').trim(); })
      .filter(Boolean);
  }
  function yamlTexte(s) { return '"' + s.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"'; }
  function fichiersChoisis() {
    return chips.filter(function (c) { return c.classList.contains('on'); }).map(function (c) { return c.dataset.v; });
  }

  function description() {
    var q = sansPoint(champs.quoi.value), w = sansPoint(champs.quand.value);
    var d = q ? majuscule(q) + '.' : '';
    if (w) {
      var debut = /^(à utiliser|a utiliser|utiliser)/i.test(w) ? majuscule(w) : 'À utiliser ' + w;
      d += (d ? ' ' : '') + debut + '.';
    }
    return d;
  }

  function construire() {
    var cible = champs.cible.value;
    var nomSaisi = champs.nom.value.trim();
    var nom = enKebab(nomSaisi) || 'mon-skill';
    var desc = description();
    var etapes = lignes(champs.etapes.value);
    var regles = lignes(champs.regles.value);
    var format = champs.format.value.trim();
    var fichiers = fichiersChoisis();
    var manuel = cible === 'code' && champs.manuel && champs.manuel.checked;

    if (optCode) optCode.style.display = cible === 'code' ? '' : 'none';

    var titre = titrePreset || (/[\s\u00C0-\u017F]/.test(nomSaisi) ? majuscule(nomSaisi.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').toLowerCase()) : majuscule(nom.replace(/-/g, ' ')));
    var t = ['---', 'name: ' + nom, 'description: ' + yamlTexte(desc || 'Décrivez ici ce que fait le skill et quand l\'utiliser.')];
    if (manuel) t.push('disable-model-invocation: true');
    t.push('---', '', '# ' + titre, '');
    if (sansPoint(champs.quand.value)) {
      t.push('## Quand l\'utiliser', majuscule(sansPoint(champs.quand.value)) + '.', '');
    }
    t.push('## Étapes');
    if (etapes.length) etapes.forEach(function (e, i) { t.push((i + 1) + '. ' + majuscule(sansPoint(e)) + '.'); });
    else t.push('1. Décrivez la première étape.');
    t.push('');
    if (format) t.push('## Format du résultat', format, '');
    if (regles.length) {
      t.push('## Règles');
      regles.forEach(function (r) { t.push('- ' + majuscule(sansPoint(r)) + '.'); });
      t.push('');
    }
    if (fichiers.length) {
      t.push('## Fichiers joints');
      if (fichiers.indexOf('references') > -1) t.push('- Référence détaillée : lire references/REFERENCE.md quand la tâche le demande.');
      if (fichiers.indexOf('scripts') > -1) t.push('- Scripts : exécuter les fichiers du dossier scripts/ sans les réécrire.');
      if (fichiers.indexOf('assets') > -1) t.push('- Modèles : partir des fichiers du dossier assets/ pour le livrable.');
      t.push('');
    }
    var texte = t.join('\n').replace(/\n+$/, '\n');
    out.textContent = texte;

    /* Vérifications */
    var v = [], pts = 0;
    var nomOk = nomSaisi && nomSaisi === nom;
    if (!nomSaisi) v.push(['À revoir', 'Donnez un nom au skill : le fichier utilise « mon-skill » par défaut.']);
    else if (!nomOk) v.push(['Corrigé', 'Nom converti au format requis : « ' + nom + ' » (minuscules, chiffres, tirets, 64 caractères maximum).']);
    else v.push(['OK', 'Nom valide : « ' + nom + ' ».']);
    if (nomSaisi) pts += 15;
    if (/claude|anthropic/.test(nom)) v.push(['À revoir', 'Les mots « claude » et « anthropic » sont réservés dans le nom.']);

    var lg = desc.length;
    if (!lg) v.push(['À revoir', 'La description est vide : Claude ne saura pas quand utiliser le skill.']);
    else if (lg > 1024) v.push(['À revoir', 'Description de ' + lg + ' caractères : la limite de la spécification est 1 024.']);
    else if (lg > 200) v.push(['Attention', 'Description de ' + lg + ' caractères : au-delà de 200, l\'import dans l\'application Claude peut être refusé.']);
    else v.push(['OK', 'Description de ' + lg + ' caractères, compatible avec toutes les surfaces.']);
    if (sansPoint(champs.quoi.value).length >= 20) pts += 20;
    if (sansPoint(champs.quand.value).length >= 10) pts += 20; else v.push(['À revoir', 'Précisez quand utiliser le skill, avec les mots de vos demandes.']);
    if (lg && lg <= 1024) pts += 5;

    if (etapes.length >= 3) pts += 15; else v.push(['À revoir', 'Listez au moins trois étapes, une par ligne.']);
    if (format) pts += 10; else v.push(['Conseil', 'Décrivez le format du résultat : c\'est ce qui rend le livrable régulier.']);
    if (regles.length) pts += 15; else v.push(['Conseil', 'Ajoutez au moins une règle, par exemple : signaler les cas ambigus au lieu de trancher.']);

    if (cible === 'app') {
      v.push(['Installer', 'Créez un dossier « ' + nom + ' », placez-y ce fichier SKILL.md, compressez le dossier en ZIP (le dossier à la racine du ZIP), puis Personnaliser > Compétences > + > Créer une compétence > Télécharger une compétence.']);
    } else if (cible === 'code') {
      v.push(['Installer', 'Enregistrez le fichier dans ~/.claude/skills/' + nom + '/SKILL.md (tous vos projets) ou .claude/skills/' + nom + '/SKILL.md (ce projet). Tapez /skills pour vérifier, /' + nom + ' pour le lancer.']);
    } else {
      v.push(['Installer', 'Zippez le dossier « ' + nom + ' » et envoyez-le par les endpoints /v1/skills, puis déclarez-le dans le container de la requête avec l\'outil d\'exécution de code. Pas d\'accès à Internet côté API.']);
    }
    if (fichiers.length) v.push(['Rappel', 'Créez aussi les dossiers annoncés : ' + fichiers.map(function (f) { return f + '/'; }).join(', ') + '.']);

    pts = Math.min(100, pts);
    if (score) score.textContent = pts;
    if (meter) meter.style.width = pts + '%';
    if (checks) {
      checks.textContent = '';
      v.forEach(function (c) {
        var li = document.createElement('li');
        var b = document.createElement('strong'); b.textContent = c[0] + ' : ';
        li.appendChild(b); li.appendChild(document.createTextNode(c[1]));
        checks.appendChild(li);
      });
    }
    return texte;
  }

  function remplir(cle) {
    var e = EXEMPLES[cle];
    if (!e) {
      ['nom', 'quoi', 'quand', 'etapes', 'format', 'regles'].forEach(function (k) { champs[k].value = ''; });
      chips.forEach(function (c) { c.classList.remove('on'); c.setAttribute('aria-pressed', 'false'); });
      if (champs.manuel) champs.manuel.checked = false;
      titrePreset = '';
    } else {
      titrePreset = e.titre || '';
      champs.nom.value = e.nom; champs.quoi.value = e.quoi; champs.quand.value = e.quand;
      champs.etapes.value = e.etapes; champs.format.value = e.format; champs.regles.value = e.regles;
      chips.forEach(function (c) {
        var on = e.fichiers.indexOf(c.dataset.v) > -1;
        c.classList.toggle('on', on); c.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      if (champs.manuel) champs.manuel.checked = !!e.manuel;
      if (e.manuel) champs.cible.value = 'code';
    }
    construire();
  }

  function retour(btn, ok) {
    if (!btn) return;
    var a = btn.textContent;
    btn.textContent = ok ? 'Copié' : 'Copie impossible';
    if (ok) btn.classList.add('ok');
    setTimeout(function () { btn.textContent = a; btn.classList.remove('ok'); }, 1800);
  }
  function copier() {
    var texte = construire();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texte).then(function () { retour(copy, true); }, function () { retour(copy, false); });
    } else {
      var i = document.createElement('textarea'); i.value = texte; document.body.appendChild(i); i.select();
      var ok = false; try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
      i.remove(); retour(copy, ok);
    }
  }
  function telecharger() {
    var texte = construire();
    var blob = new Blob([texte], { type: 'text/markdown;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = 'SKILL.md';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  chips.forEach(function (c) {
    c.setAttribute('aria-pressed', 'false');
    c.addEventListener('click', function () {
      var on = !c.classList.contains('on');
      c.classList.toggle('on', on); c.setAttribute('aria-pressed', on ? 'true' : 'false');
      construire();
    });
  });
  ['nom', 'quoi', 'quand', 'etapes', 'format', 'regles'].forEach(function (k) {
    if (champs[k]) champs[k].addEventListener('input', construire);
  });
  champs.nom.addEventListener('input', function () { titrePreset = ''; construire(); });
  champs.cible.addEventListener('change', construire);
  if (champs.manuel) champs.manuel.addEventListener('change', construire);
  if (champs.exemple) champs.exemple.addEventListener('change', function () { remplir(champs.exemple.value); });
  if (copy) copy.addEventListener('click', copier);
  if (dl) dl.addEventListener('click', telecharger);

  remplir('balises');
  if (champs.exemple) champs.exemple.value = 'balises';
})();
