/* Comparateur de devis SEO pour l'article choisir-consultant-seo.
   Trois devis au plus : coût total, coût par jour de travail réel, position
   par rapport aux moyennes Malt, contenu du devis et signaux d'alerte.
   Tout se calcule dans le navigateur, rien n'est envoyé. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var racine = $('outil-devis-seo');
  var out = $('dv-out');
  if (!racine || !out) return;

  var tabs = $('dv-tabs'), nom = $('dv-nom'), type = $('dv-type'), montant = $('dv-montant'),
      duree = $('dv-duree'), jours = $('dv-jours'), check = $('dv-check'), alerte = $('dv-alert'),
      copy = $('dv-copy'), reset = $('dv-reset');

  /* Repères publics : tarifs journaliers moyens des consultants SEO
     freelances sur Malt, de 0 à 2 ans d'expérience et au-delà de 15 ans. */
  var MALT_BAS = 281, MALT_HAUT = 592;

  var CONTENU = {
    plan: "plan d'action priorisé",
    execution: 'corrections réalisées',
    temps: 'temps consacré écrit',
    mesure: 'suivi relié aux contacts ou ventes',
    propriete: 'accès et livrables à vous',
    tiers: 'budget tiers à part',
    sortie: 'conditions de sortie claires'
  };
  var ALERTES = {
    garantie: 'garantie de position',
    google: 'relation privilégiée avec Google',
    secret: 'méthode non expliquée'
  };
  var LETTRES = ['A', 'B', 'C'];

  function vide() {
    return { nom: '', type: 'total', montant: '', duree: '1', jours: '', check: {}, alerte: {} };
  }
  var devis = [vide(), vide(), vide()];
  var courant = 0;

  function nombre(v) {
    var n = parseFloat(String(v).replace(',', '.'));
    return isFinite(n) && n >= 0 ? n : null;
  }
  function euros(n) {
    return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' €';
  }

  function cocher(liste, etat) {
    var items = liste.querySelectorAll('li[data-k]');
    for (var i = 0; i < items.length; i++) {
      var b = items[i].querySelector('input');
      if (b) b.checked = !!etat[items[i].getAttribute('data-k')];
    }
  }
  function lireCases(liste) {
    var etat = {}, items = liste.querySelectorAll('li[data-k]');
    for (var i = 0; i < items.length; i++) {
      var b = items[i].querySelector('input');
      if (b && b.checked) etat[items[i].getAttribute('data-k')] = true;
    }
    return etat;
  }

  function sauver() {
    var d = devis[courant];
    d.nom = nom.value.trim();
    d.type = type.value;
    d.montant = montant.value;
    d.duree = duree.value;
    d.jours = jours.value;
    d.check = lireCases(check);
    d.alerte = lireCases(alerte);
  }

  function charger() {
    var d = devis[courant];
    nom.value = d.nom;
    type.value = d.type;
    montant.value = d.montant;
    duree.value = d.duree;
    jours.value = d.jours;
    cocher(check, d.check);
    cocher(alerte, d.alerte);
  }

  function analyser(d, i) {
    var m = nombre(d.montant);
    if (m === null || m === 0) return null;
    var mois = Math.max(1, Math.round(nombre(d.duree) || 1));
    var total = d.type === 'mois' ? m * mois : m;
    var j = nombre(d.jours);
    var parJour = j ? total / j : null;
    var contenus = Object.keys(CONTENU).filter(function (k) { return d.check[k]; });
    var manques = Object.keys(CONTENU).filter(function (k) { return !d.check[k]; });
    var alertes = Object.keys(ALERTES).filter(function (k) { return d.alerte[k]; });
    return {
      lettre: LETTRES[i], nom: d.nom, total: total, mois: mois,
      parMois: total / mois, jours: j, parJour: parJour,
      contenus: contenus.length, manques: manques, alertes: alertes
    };
  }

  function repere(parJour) {
    if (parJour === null) return "Jours inclus non précisés : impossible de calculer un coût par jour. Demandez-les avant toute comparaison.";
    if (parJour < MALT_BAS) return "Sous la moyenne des freelances SEO débutants sur Malt (" + MALT_BAS + " € par jour) : vérifiez que les jours annoncés sont bien des jours de travail sur votre dossier.";
    if (parJour <= MALT_HAUT) return "Dans la fourchette des tarifs journaliers moyens des freelances SEO sur Malt (" + MALT_BAS + " à " + MALT_HAUT + " € selon l'expérience).";
    return "Au-dessus des moyennes des freelances SEO sur Malt (" + MALT_HAUT + " € au-delà de 15 ans) : courant pour une agence ou un profil très spécialisé, à justifier par le contenu du devis.";
  }

  function rendu() {
    var lignes = [], analyses = [];
    devis.forEach(function (d, i) {
      var a = analyser(d, i);
      if (a) analyses.push(a);
    });

    if (!analyses.length) {
      out.textContent = '';
      return '';
    }

    analyses.forEach(function (a) {
      lignes.push('DEVIS ' + a.lettre + (a.nom ? ' · ' + a.nom : ''));
      var cout = 'Coût total : ' + euros(a.total) + ' HT';
      if (a.mois > 1) cout += ' sur ' + a.mois + ' mois (' + euros(a.parMois) + ' par mois)';
      lignes.push(cout);
      if (a.parJour !== null) lignes.push('Jours inclus : ' + a.jours + ', soit ' + euros(a.parJour) + ' par jour de travail réel');
      lignes.push(repere(a.parJour));
      lignes.push('Contenu : ' + a.contenus + '/7' + (a.manques.length ? ' · manque : ' + a.manques.map(function (k) { return CONTENU[k]; }).join(', ') : ''));
      lignes.push('Alertes : ' + (a.alertes.length ? a.alertes.map(function (k) { return ALERTES[k]; }).join(', ') + '. À écarter.' : 'aucune'));
      lignes.push('');
    });

    if (analyses.length < 2) {
      lignes.push('Remplissez un deuxième devis pour obtenir la comparaison.');
    } else {
      var sains = analyses.filter(function (a) { return !a.alertes.length; });
      if (!sains.length) {
        lignes.push('VERDICT : tous les devis présentent un signal d\'alerte. Demandez d\'autres propositions.');
      } else {
        sains.sort(function (x, y) {
          if (y.contenus !== x.contenus) return y.contenus - x.contenus;
          if (x.parJour === null) return 1;
          if (y.parJour === null) return -1;
          return x.parJour - y.parJour;
        });
        var best = sains[0];
        var txt = 'VERDICT : le devis ' + best.lettre + (best.nom ? ' (' + best.nom + ')' : '') +
          ' est le plus complet sans signal d\'alerte (' + best.contenus + '/7).';
        if (best.parJour === null) txt += ' Obtenez le nombre de jours inclus avant de signer.';
        var ecartes = analyses.filter(function (a) { return a.alertes.length; });
        if (ecartes.length) txt += ' Écartez ' + ecartes.map(function (a) { return 'le devis ' + a.lettre; }).join(' et ') + '.';
        lignes.push(txt);
      }
    }
    out.textContent = lignes.join('\n').replace(/\n+$/, '');
    return out.textContent;
  }

  function changer(i) {
    sauver();
    courant = i;
    var boutons = tabs.querySelectorAll('.chip');
    for (var k = 0; k < boutons.length; k++) {
      var on = parseInt(boutons[k].getAttribute('data-i'), 10) === i;
      boutons[k].classList.toggle('on', on);
      boutons[k].setAttribute('aria-pressed', on ? 'true' : 'false');
    }
    charger();
    rendu();
  }

  function maj() { sauver(); rendu(); }

  if (tabs) tabs.addEventListener('click', function (e) {
    var b = e.target.closest('.chip');
    if (!b) return;
    changer(parseInt(b.getAttribute('data-i'), 10) || 0);
  });
  [nom, montant, duree, jours].forEach(function (el) { if (el) el.addEventListener('input', maj); });
  if (type) type.addEventListener('change', maj);
  racine.addEventListener('change', function (e) {
    if (e.target && e.target.type === 'checkbox') maj();
  });

  if (reset) reset.addEventListener('click', function () {
    devis[courant] = vide();
    charger();
    rendu();
  });

  if (copy) copy.addEventListener('click', function () {
    sauver();
    var texte = rendu();
    if (!texte) texte = 'Aucun devis renseigné.';
    texte = 'Comparatif de devis SEO\n\n' + texte + '\n\nRepères de prix : anthony-courtin.com/blog/choisir-consultant-seo';
    var fini = function (ok) {
      copy.textContent = ok ? 'Copié' : 'Copie impossible';
      if (ok) copy.classList.add('ok');
      setTimeout(function () { copy.textContent = 'Copier le comparatif'; copy.classList.remove('ok'); }, 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texte).then(function () { fini(true); }, function () { fini(false); });
    } else {
      var t = document.createElement('textarea');
      t.value = texte; document.body.appendChild(t); t.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
      t.remove(); fini(ok);
    }
  });

  var premier = tabs ? tabs.querySelector('.chip') : null;
  if (premier) premier.setAttribute('aria-pressed', 'true');
  charger();
  rendu();
})();
