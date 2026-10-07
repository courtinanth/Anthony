/* Grille d'audit SEO local pour l'article audit-seo-local-guide.
   Le lecteur indique sa situation et coche les points conformes :
   l'outil calcule un score global et par bloc, classe les corrections
   (blocages, gains rapides, routines, chantiers) et permet de copier
   le plan ou de télécharger la grille en CSV.
   100 % navigateur, aucun appel réseau. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var racine = $('outil-audit-local');
  var profil = $('al-profil'), out = $('al-out'), score = $('al-score'),
      sub = $('al-sub'), meter = $('al-meter'), copy = $('al-copy'), csv = $('al-csv');
  if (!racine || !profil || !out) return;

  var BLOCS = {
    fiche: 'Fiche Google',
    nap: 'NAP et citations',
    avis: 'Avis',
    pages: 'Pages locales',
    tech: 'Technique',
    suivi: 'Concurrence et suivi'
  };

  var GROUPES = [
    { cle: 'blocage', titre: 'Blocages, à traiter avant tout le reste' },
    { cle: 'rapide', titre: 'Gains rapides, une heure de travail ou moins' },
    { cle: 'routine', titre: 'Routines à installer dès cette semaine' },
    { cle: 'chantier', titre: 'Chantiers à planifier sur deux ou trois mois' }
  ];

  /* impact et effort de 1 à 3 ; groupe = case de la matrice impact et effort */
  var POINTS = {
    validee:    { bloc: 'fiche', impact: 3, effort: 1, groupe: 'blocage', action: "Revendiquez et faites valider la fiche avec votre propre compte, puis ajoutez votre prestataire comme gestionnaire si besoin." },
    doublon:    { bloc: 'fiche', impact: 3, effort: 2, groupe: 'blocage', action: "Repérez les fiches en double (ancienne adresse, ancien nom, même téléphone) et demandez leur fusion ou leur suppression." },
    nom:        { bloc: 'fiche', impact: 2, effort: 1, groupe: 'rapide', action: "Ramenez le nom de la fiche au nom réel de l'enseigne, sans ville, prestation ni slogan." },
    categorie:  { bloc: 'fiche', impact: 3, effort: 1, groupe: 'blocage', action: "Choisissez la catégorie principale la plus précise, après avoir relevé celle des trois premiers du pack sur votre requête principale." },
    adresse:    { bloc: 'fiche', impact: 3, effort: 1, groupe: 'rapide', action: {
      vitrine: "Vérifiez l'adresse complète et placez le repère de la carte sur la bonne entrée.",
      zone: "Masquez l'adresse et déclarez une zone de service réaliste, limitée aux communes réellement servies.",
      multi: "Vérifiez que chaque établissement a sa propre fiche, à sa propre adresse, avec son propre téléphone."
    } },
    horaires:   { bloc: 'fiche', impact: 2, effort: 1, groupe: 'rapide', action: "Corrigez les horaires habituels et ajoutez les horaires exceptionnels des prochains jours fériés et congés." },
    lien:       { bloc: 'fiche', impact: 2, effort: 1, groupe: 'rapide', action: "Faites pointer le lien de la fiche vers la bonne page du site, en https, avec des paramètres UTM pour la mesure." },
    services:   { bloc: 'fiche', impact: 2, effort: 1, groupe: 'rapide', action: "Renseignez en entier les services, les produits et les attributs (paiement, accessibilité, rendez-vous)." },
    napref:     { bloc: 'nap', impact: 2, effort: 1, groupe: 'rapide', action: "Rédigez la forme de référence de vos nom, adresse et téléphone, puis utilisez-la partout." },
    napsite:    { bloc: 'nap', impact: 2, effort: 1, groupe: 'rapide', action: "Alignez pied de page, page contact, mentions légales et balisage du site sur la forme de référence." },
    annuaires:  { bloc: 'nap', impact: 2, effort: 2, groupe: 'chantier', action: "Corrigez vos coordonnées sur les annuaires généralistes et les plateformes de votre secteur, en commençant par les plus consultées." },
    anciennes:  { bloc: 'nap', impact: 2, effort: 2, groupe: 'chantier', action: "Listez les mentions de votre ancienne adresse ou de votre ancien numéro et faites-les corriger." },
    volume:     { bloc: 'avis', impact: 3, effort: 3, groupe: 'routine', action: "Comblez l'écart d'avis avec les trois premiers du pack par une demande systématique, sans chercher à tout rattraper en un mois." },
    recence:    { bloc: 'avis', impact: 2, effort: 2, groupe: 'routine', action: "Visez un flux d'avis régulier chaque mois plutôt qu'une campagne ponctuelle." },
    reponses:   { bloc: 'avis', impact: 2, effort: 1, groupe: 'routine', action: "Répondez à tous les avis, anciens et négatifs compris, sur un ton factuel." },
    collecte:   { bloc: 'avis', impact: 3, effort: 1, groupe: 'routine', action: "Envoyez le lien d'avis de la fiche à tous les clients après chaque prestation, sans trier les clients satisfaits." },
    pageloc:    { bloc: 'pages', impact: 3, effort: 2, groupe: 'chantier', action: "Créez une page par établissement ou par zone réellement servie, accessible depuis le menu." },
    contenu:    { bloc: 'pages', impact: 3, effort: 3, groupe: 'chantier', action: "Donnez à chaque page locale un contenu propre : prestations, réalisations, équipe, accès, délais." },
    index:      { bloc: 'pages', impact: 3, effort: 1, groupe: 'blocage', action: "Vérifiez l'indexation des pages locales dans la Search Console et levez les blocages (noindex, robots.txt, canonical)." },
    schema:     { bloc: 'tech', impact: 1, effort: 1, groupe: 'rapide', action: "Ajoutez un balisage LocalBusiness cohérent avec la fiche et validez-le avec le test des résultats enrichis." },
    mobile:     { bloc: 'tech', impact: 2, effort: 2, groupe: 'chantier', action: "Corrigez la vitesse et l'affichage mobile des pages locales, avec un téléphone cliquable visible sans défiler." },
    concurrents:{ bloc: 'suivi', impact: 2, effort: 1, groupe: 'rapide', action: "Relevez catégorie, avis, note et photos des trois premiers du pack sur chaque requête cible." },
    grille:     { bloc: 'suivi', impact: 1, effort: 2, groupe: 'chantier', action: "Relevez vos positions depuis plusieurs points de la zone pour voir où vous disparaissez." },
    stats:      { bloc: 'suivi', impact: 2, effort: 1, groupe: 'rapide', action: "Notez chaque mois les appels, les itinéraires et les clics vers le site dans les performances de la fiche." },
    ia:         { bloc: 'suivi', impact: 1, effort: 1, groupe: 'rapide', action: "Posez à ChatGPT, Perplexity et Gemini les questions de vos clients et notez qui est cité." }
  };

  /* le libellé du point « adresse » change avec la situation */
  var LIBELLE_ADRESSE = {
    vitrine: "Adresse complète et repère placé sur la bonne entrée",
    zone: "Adresse masquée et zone de service réaliste",
    multi: "Une fiche par établissement, chacune avec sa propre adresse"
  };

  function actionDe(p) {
    return typeof p.action === 'string' ? p.action : (p.action[profil.value] || p.action.vitrine);
  }

  function lire() {
    var items = racine.querySelectorAll('li[data-k]'), lignes = [];
    for (var i = 0; i < items.length; i++) {
      var cle = items[i].getAttribute('data-k');
      var p = POINTS[cle];
      if (!p) continue;
      var boite = items[i].querySelector('input');
      var texte = items[i].querySelector('span');
      lignes.push({
        cle: cle, p: p,
        ok: !!(boite && boite.checked),
        libelle: texte ? texte.textContent.trim() : cle
      });
    }
    return lignes;
  }

  function majLibelle() {
    var li = racine.querySelector('li[data-k="adresse"] span');
    if (li) li.textContent = LIBELLE_ADRESSE[profil.value] || LIBELLE_ADRESSE.vitrine;
  }

  function trier(a, b) {
    if (b.p.impact !== a.p.impact) return b.p.impact - a.p.impact;
    return a.p.effort - b.p.effort;
  }

  function calcul() {
    majLibelle();
    var lignes = lire();
    var total = lignes.length, acquis = 0, parBloc = {};
    lignes.forEach(function (l) {
      if (!parBloc[l.p.bloc]) parBloc[l.p.bloc] = { ok: 0, n: 0 };
      parBloc[l.p.bloc].n++;
      if (l.ok) { acquis++; parBloc[l.p.bloc].ok++; }
    });
    var part = total ? Math.round((acquis / total) * 100) : 0;
    score.textContent = part + ' %';
    if (sub) sub.textContent = 'des points clés conformes (' + acquis + ' sur ' + total + ')';
    if (meter) meter.style.width = part + '%';

    var txt = [];
    txt.push('Score global : ' + part + ' % (' + acquis + ' points conformes sur ' + total + ')');
    txt.push(Object.keys(BLOCS).filter(function (b) { return parBloc[b]; }).map(function (b) {
      return BLOCS[b] + ' ' + parBloc[b].ok + '/' + parBloc[b].n;
    }).join(' · '));
    txt.push('');

    var aFaire = lignes.filter(function (l) { return !l.ok; });
    if (!aFaire.length) {
      txt.push("Tous les points clés sont conformes. Passez à l'entretien : avis chaque mois, horaires exceptionnels, relevé trimestriel des positions et des appels.");
    } else {
      var n = 0;
      GROUPES.forEach(function (g) {
        var liste = aFaire.filter(function (l) { return l.p.groupe === g.cle; }).sort(trier);
        if (!liste.length) return;
        txt.push(g.titre.toUpperCase());
        liste.forEach(function (l) { n++; txt.push(n + '. ' + actionDe(l.p)); });
        txt.push('');
      });
    }
    out.textContent = txt.join('\n').replace(/\n+$/, '');
    return { lignes: lignes, texte: out.textContent };
  }

  function retour(bouton, ok, libelle) {
    if (!bouton) return;
    bouton.textContent = ok ? 'Copié' : 'Copie impossible';
    if (ok) bouton.classList.add('ok');
    setTimeout(function () { bouton.textContent = libelle; bouton.classList.remove('ok'); }, 1800);
  }

  function copier() {
    var r = calcul();
    var texte = "Plan d'action d'audit SEO local\n\n" + r.texte +
      '\n\nGrille : anthony-courtin.com/blog/audit-seo-local-guide';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texte).then(function () { retour(copy, true, 'Copier le plan'); },
        function () { retour(copy, false, 'Copier le plan'); });
    } else {
      var t = document.createElement('textarea');
      t.value = texte; document.body.appendChild(t); t.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      t.remove();
      retour(copy, ok, 'Copier le plan');
    }
  }

  function cellule(v) {
    var s = String(v);
    return /[";\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }

  function telecharger() {
    var r = calcul();
    var noms = { blocage: 'Blocage', rapide: 'Gain rapide', routine: 'Routine', chantier: 'Chantier' };
    var rows = [['Bloc', 'Point', 'Statut', 'Priorité', 'Impact (1 à 3)', 'Effort (1 à 3)', 'Action si non conforme']];
    r.lignes.forEach(function (l) {
      rows.push([BLOCS[l.p.bloc], l.libelle, l.ok ? 'Conforme' : 'À corriger', noms[l.p.groupe],
        l.p.impact, l.p.effort, l.ok ? '' : actionDe(l.p)]);
    });
    var contenu = '﻿' + rows.map(function (row) { return row.map(cellule).join(';'); }).join('\r\n');
    var blob = new Blob([contenu], { type: 'text/csv;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = 'audit-seo-local.csv';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  profil.addEventListener('change', calcul);
  racine.addEventListener('change', function (e) {
    if (e.target && e.target.type === 'checkbox') calcul();
  });
  if (copy) copy.addEventListener('click', copier);
  if (csv) csv.addEventListener('click', telecharger);
  calcul();
})();
