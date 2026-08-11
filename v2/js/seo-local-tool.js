/* Plan d'action de visibilité locale pour l'article guide-seo-local-2026.
   L'utilisateur déclare son profil et coche ce qui est déjà en place :
   l'outil renvoie un score et les trois chantiers qui rapportent le plus,
   dans l'ordre. 100 % navigateur, aucun appel réseau. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var profil = $('sl-profil'), liste = $('sl-check'), score = $('sl-score'),
      meter = $('sl-meter'), out = $('sl-out'), copy = $('sl-copy');
  if (!profil || !liste || !out) return;

  /* Poids de base de chaque chantier, puis correction selon le profil.
     Un poids nul signifie que le point ne concerne pas ce profil : il sort
     alors du total, faute de quoi le score serait injustement plafonné. */
  var CHANTIERS = {
    fiche:     { poids: 3, action: "Revendiquez et faites vérifier votre fiche d'établissement. Sans elle, vous n'existez ni dans le pack de résultats ni sur la carte." },
    categorie: { poids: 3, action: "Reprenez votre catégorie principale : c'est le champ qui pèse le plus lourd. Regardez celle qu'ont retenue les trois premiers de votre marché." },
    infos:     { poids: 2, action: "Complétez horaires, téléphone local, lien vers le site et description. Un horaire faux vous coûte des visites et des avis négatifs." },
    photos:    { poids: 1, action: "Ajoutez des photos récentes chaque mois. C'est le signal de fraîcheur le plus simple à tenir." },
    attributs: { poids: 1, action: "Renseignez tous les attributs et services proposés : ils vous font apparaître sur les recherches filtrées." },
    posts:     { poids: 1, action: "Publiez une actualité toutes les deux semaines. L'effet est modeste sur le classement, réel sur le taux de contact." },
    zone:      { poids: 3, action: "Déclarez votre zone d'intervention et masquez l'adresse personnelle. Sans zone, la distance vous exclut de la moitié de votre marché." },
    nap:       { poids: 2, action: "Uniformisez nom, adresse et téléphone au caractère près sur tous les supports. Une variante d'écriture suffit à brouiller la piste." },
    annuaires: { poids: 2, action: "Inscrivez-vous sur les cinq annuaires qui comptent dans votre secteur, pas sur cinquante sans intérêt." },
    doublons:  { poids: 2, action: "Traquez les fiches en double et les fiches non revendiquées : elles se font concurrence entre elles." },
    avis:      { poids: 3, action: "Installez une demande d'avis systématique après chaque prestation. C'est le levier le plus rentable et le plus négligé." },
    reponses:  { poids: 2, action: "Répondez à tous les avis, en particulier aux négatifs. La réponse compte autant que la note pour celui qui hésite." },
    pageville: { poids: 2, action: "Créez une page par ville ou par établissement, avec du contenu propre et pas un copier-coller de nom de commune." },
    schema:    { poids: 1, action: "Ajoutez un balisage LocalBusiness avec adresse, horaires et zone servie : c'est ce que lisent les moteurs de réponse." },
    maillage:  { poids: 1, action: "Reliez vos pages locales depuis le menu ou la page d'accueil, sinon elles restent invisibles." }
  };

  var PROFILS = {
    vitrine:     { zone: 0, pageville: 1, photos: 2, avis: 3, doublons: 1 },
    deplacement: { zone: 3, photos: 1, pageville: 3, categorie: 3, doublons: 1 },
    multi:       { zone: 1, doublons: 3, pageville: 3, nap: 3, posts: 0 }
  };

  var CONSEIL = {
    vitrine: "Votre atout est la proximité physique : la fiche, les photos et les avis font le plus gros du travail.",
    deplacement: "Sans vitrine, tout se joue sur la zone déclarée et sur une vraie page par ville. La distance vous pénalise, le contenu vous rattrape.",
    multi: "À plusieurs établissements, le danger n'est pas le manque de pages mais leur ressemblance. Une page par lieu, un contenu par lieu."
  };

  function poidsDe(cle) {
    var ajust = PROFILS[profil.value] || {};
    return Object.prototype.hasOwnProperty.call(ajust, cle) ? ajust[cle] : CHANTIERS[cle].poids;
  }

  function lire() {
    var items = liste.querySelectorAll('li'), retenus = [], manquants = [], total = 0, acquis = 0;
    for (var i = 0; i < items.length; i++) {
      var cle = items[i].getAttribute('data-k');
      if (!cle || !CHANTIERS[cle]) continue;
      var p = poidsDe(cle);
      var boite = items[i].querySelector('input');
      items[i].hidden = (p === 0);
      if (p === 0) { if (boite) boite.checked = false; continue; }
      total += p;
      if (boite && boite.checked) { acquis += p; retenus.push(cle); }
      else { manquants.push({ cle: cle, poids: p }); }
    }
    manquants.sort(function (a, b) { return b.poids - a.poids; });
    return { total: total, acquis: acquis, manquants: manquants, retenus: retenus };
  }

  function verdict(part) {
    if (part >= 90) return "Votre présence locale est solide. Le travail restant est d'entretien : avis, photos, horaires de fermeture exceptionnelle.";
    if (part >= 65) return "Les fondations tiennent. Ce qui vous sépare du pack de résultats se joue maintenant sur la notoriété, donc sur les avis et les mentions.";
    if (part >= 35) return "La base existe mais elle est trouée. Traitez les trois chantiers ci-dessous avant d'envisager quoi que ce soit d'autre.";
    return "Vous partez de loin, et c'est une bonne nouvelle : les premiers points sont ceux qui rapportent le plus vite.";
  }

  function calcul() {
    var r = lire();
    var part = r.total ? Math.round((r.acquis / r.total) * 100) : 0;
    score.textContent = part + ' %';
    if (meter) meter.style.width = part + '%';

    out.textContent = '';

    var p = document.createElement('p');
    p.textContent = verdict(part);
    out.appendChild(p);

    var c = document.createElement('p');
    c.textContent = CONSEIL[profil.value] || '';
    out.appendChild(c);

    if (r.manquants.length) {
      var titre = document.createElement('p');
      var fort = document.createElement('strong');
      fort.textContent = 'Vos trois prochains chantiers';
      titre.appendChild(fort);
      out.appendChild(titre);

      var ul = document.createElement('ul');
      r.manquants.slice(0, 3).forEach(function (m) {
        var li = document.createElement('li');
        li.textContent = CHANTIERS[m.cle].action;
        ul.appendChild(li);
      });
      out.appendChild(ul);
    } else {
      var fini = document.createElement('p');
      fini.textContent = "Rien ne manque sur cette grille. Passez à la mesure : suivez les appels et les demandes d'itinéraire, pas les positions.";
      out.appendChild(fini);
    }
    return { part: part, manquants: r.manquants };
  }

  function copier() {
    var r = calcul();
    var lignes = ['Plan d\'action de visibilité locale : ' + r.part + ' %', ''];
    r.manquants.slice(0, 3).forEach(function (m, i) {
      lignes.push((i + 1) + '. ' + CHANTIERS[m.cle].action);
    });
    lignes.push('', 'Source : anthony-courtin.com/blog/guide-seo-local-2026');
    var texte = lignes.join('\n');
    var fini = function (ok) {
      if (!copy) return;
      var a = copy.textContent;
      copy.textContent = ok ? 'Copié' : 'Copie impossible';
      setTimeout(function () { copy.textContent = a; }, 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texte).then(function () { fini(true); }, function () { fini(false); });
    } else { fini(false); }
  }

  profil.addEventListener('change', calcul);
  liste.addEventListener('change', calcul);
  if (copy) copy.addEventListener('click', copier);
  calcul();
})();
