/* Chronologie interactive d'Anthropic et de Claude.
   Article claude-ai-origine. 100 % navigateur, aucun appel réseau.
   Dates vérifiées le 7 octobre 2026 (annonces d'Anthropic). */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var slider = $('cao-range'), titre = $('cao-titre'), texte = $('cao-texte'),
      date = $('cao-date'), meter = $('cao-meter'), copy = $('cao-copy');
  if (!slider || !texte) return;

  var ETAPES = [
    { d: 'Janvier 2021', t: "Fondation d'Anthropic",
      x: "Le 26 janvier 2021, d'anciens d'OpenAI fondent Anthropic à San Francisco, dont Dario Amodei, jusque-là vice-président de la recherche d'OpenAI, et sa sœur Daniela Amodei. L'entreprise est constituée en public benefit corporation." },
    { d: 'Décembre 2022', t: "L'IA constitutionnelle",
      x: "Anthropic publie sa méthode d'entraînement par « constitution » : le modèle apprend à respecter une liste de principes écrits. Aucun produit grand public n'est encore sorti." },
    { d: 'Mars 2023', t: 'Les premières versions de Claude',
      x: "Le 14 mars 2023, Claude et Claude Instant sortent, sur demande d'accès. Deux ans se sont écoulés depuis la fondation." },
    { d: 'Juillet 2023', t: 'Claude 2 et claude.ai',
      x: "Le 11 juillet 2023, Claude 2 ouvre claude.ai au public aux États-Unis et au Royaume-Uni. À l'automne, Amazon puis Google annoncent des investissements de plusieurs milliards de dollars." },
    { d: 'Mars 2024', t: 'La famille Claude 3',
      x: "Le 4 mars 2024, Anthropic publie trois modèles d'un coup, Opus, Sonnet et Haiku : un modèle puissant, un modèle équilibré, un modèle rapide. La convention de nommage tient toujours." },
    { d: 'Mai 2024', t: 'Arrivée en Europe',
      x: "Le 14 mai 2024, Claude devient accessible en Europe, dont la France, sur le web et sur iPhone. Le 20 juin, Claude 3.5 Sonnet dépasse Claude 3 Opus." },
    { d: 'Février 2025', t: 'Claude 3.7 Sonnet et Claude Code',
      x: "Le 24 février 2025, Claude 3.7 Sonnet introduit le raisonnement étendu, et Anthropic lance la première version de Claude Code, son outil de programmation en ligne de commande." },
    { d: 'Mai 2025', t: 'Claude 4',
      x: "Le 22 mai 2025, Opus 4 et Sonnet 4 marquent le passage du dialogue à l'agent : le modèle enchaîne des actions, lit des fichiers et appelle des outils pendant de longues sessions." },
    { d: 'Novembre 2025', t: 'Opus 4.5, Microsoft et Nvidia',
      x: "Après Sonnet 4.5 et Haiku 4.5, Opus 4.5 sort le 24 novembre 2025. Microsoft et Nvidia annoncent des investissements, et Anthropic annonce des bureaux à Paris et à Munich." },
    { d: 'Février 2026', t: 'Opus 4.6, Sonnet 4.6 et série G',
      x: "Opus 4.6 (5 février) et Sonnet 4.6 (17 février) sortent. Le 12 février, Anthropic lève 30 milliards de dollars sur une valorisation de 380 milliards." },
    { d: 'Mars 2026', t: 'Bras de fer avec le Pentagone',
      x: "Anthropic refuse que Claude serve à des armes entièrement autonomes ou à la surveillance de masse de la population américaine. Le Pentagone la classe « risque pour la chaîne d'approvisionnement ». Le 26 mars, une juge fédérale suspend la mesure." },
    { d: 'Avril 2026', t: 'Mythos Preview et Opus 4.7',
      x: "Le 7 avril, Claude Mythos Preview est réservé à des partenaires en cybersécurité (projet Glasswing). Le 16 avril sort Claude Opus 4.7." },
    { d: 'Mai 2026', t: 'Opus 4.8 et série H',
      x: "Le 28 mai 2026, Opus 4.8 sort et Anthropic annonce une levée de 65 milliards de dollars, sur une valorisation de 965 milliards." },
    { d: 'Juin 2026', t: 'Fable 5, Mythos 5 et Sonnet 5',
      x: "Le 1er juin, dépôt confidentiel d'un projet d'introduction en Bourse. Le 9 juin, Fable 5 et Mythos 5 sortent, puis sont suspendus du 12 au 30 juin sur ordre du gouvernement américain. Sonnet 5 sort le 30 juin." },
    { d: 'Juillet 2026', t: 'Claude Opus 5',
      x: "Le 24 juillet 2026, Opus 5 approche le niveau de Fable 5 pour moitié moins cher et devient le modèle par défaut de la formule Max." },
    { d: 'Septembre 2026', t: 'Fable 5.1, Opus 5.5 et Sonnet 5.5',
      x: "Fable 5.1 et Mythos 5.1 sortent le 1er septembre, Opus 5.5 le 22 septembre et Sonnet 5.5 le 28 septembre 2026. C'est la gamme en place au 7 octobre 2026." }
  ];

  function afficher() {
    var i = Math.max(0, Math.min(ETAPES.length - 1, parseInt(slider.value, 10) || 0));
    var e = ETAPES[i];
    if (date) date.textContent = e.d;
    if (titre) titre.textContent = e.t;
    if (texte) texte.textContent = e.x;
    if (meter) meter.style.width = Math.round(((i + 1) / ETAPES.length) * 100) + '%';
    return e;
  }

  function copier() {
    var lignes = ['Chronologie d\'Anthropic et de Claude', '']
      .concat(ETAPES.map(function (e) { return e.d + ' : ' + e.t + '. ' + e.x; }))
      .concat(['', 'Source : anthony-courtin.com/blog/claude-ai-origine']);
    var fini = function (ok) {
      if (!copy) return;
      var a = copy.textContent;
      copy.textContent = ok ? 'Copié' : 'Copie impossible';
      setTimeout(function () { copy.textContent = a; }, 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(lignes.join('\n')).then(function () { fini(true); }, function () { fini(false); });
    } else { fini(false); }
  }

  slider.min = 0;
  slider.max = ETAPES.length - 1;
  slider.addEventListener('input', afficher);
  slider.addEventListener('change', afficher);
  if (copy) copy.addEventListener('click', copier);
  afficher();
})();
