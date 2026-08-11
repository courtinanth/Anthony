/* Sélecteur de format de contenu pour l'article contenu-seo.
   100 % navigateur, aucun appel réseau. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var intention = $('cse-intention'), moment = $('cse-moment'),
      format = $('cse-format'), meter = $('cse-meter'), out = $('cse-out'), copy = $('cse-copy');
  if (!intention || !out) return;

  var FORMATS = {
    definition: {
      nom: 'Guide de fond',
      mots: '1 500 à 2 500 mots',
      plan: ["Réponse à la question dès les deux premières phrases",
             "Encadré à retenir, cinq points autoportants",
             "Définition et périmètre : ce que c'est, ce que ce n'est pas",
             "Fonctionnement détaillé, en H2 séquentiels",
             "Cas d'usage concrets tirés du réel",
             "FAQ reprenant les questions connexes"],
      note: "Le format le plus citable par les moteurs de réponse, à condition que la définition tienne en deux phrases extractibles."
    },
    methode: {
      nom: 'Article de méthode',
      mots: '1 800 à 3 000 mots',
      plan: ["Le résultat obtenu, annoncé d'entrée",
             "Prérequis et outils nécessaires",
             "Les étapes numérotées, une par H2 ou H3",
             "Les erreurs fréquentes à chaque étape",
             "Un exemple déroulé de bout en bout",
             "FAQ sur les cas particuliers"],
      note: "Ajoutez un outil interactif ou une liste à cocher : c'est ce format qui en tire le plus de valeur."
    },
    comparatif: {
      nom: 'Comparatif ou alternative',
      mots: '2 000 à 3 500 mots',
      plan: ["Le verdict en tête : lequel pour qui",
             "Tableau de comparaison sur des critères mesurables",
             "Analyse détaillée option par option",
             "Les cas où chacune gagne, sans faux équilibre",
             "Le coût réel sur trois ans",
             "FAQ sur les critères de choix"],
      note: "Trancher rapporte. Un comparatif qui conclut « ça dépend » sans dire de quoi ne se classe pas et ne se cite pas."
    },
    prix: {
      nom: 'Page tarifs ou coût',
      mots: '1 200 à 2 200 mots',
      plan: ["Le prix ou la fourchette, dès la première phrase",
             "Tableau des paliers avec ce que chacun contient",
             "Ce qui fait varier le prix, facteur par facteur",
             "Ce qui se facture en plus",
             "Comment choisir selon son cas",
             "FAQ sur la facturation"],
      note: "Chiffrez, datez et notez la source. Un article de prix sans date perd sa valeur en quelques mois."
    },
    service: {
      nom: 'Page de service',
      mots: '800 à 1 500 mots',
      plan: ["Le problème résolu, formulé comme le prospect le vit",
             "Ce que comprend la prestation, précisément",
             "Le déroulé et les délais",
             "Preuves : résultats, cas, méthode",
             "Tarifs ou modalités",
             "Appel à l'action unique et visible"],
      note: "Ce n'est pas un article. Visez la conversion, pas la longueur, et reliez-y vos contenus d'information."
    },
    local: {
      nom: 'Page locale',
      mots: '600 à 1 200 mots',
      plan: ["Le service et la zone couverte, en tête",
             "Ce qui est spécifique à cette zone",
             "Preuves locales : réalisations, avis, références",
             "Informations pratiques et contact",
             "FAQ locale"],
      note: "Le piège est la page dupliquée où seul le nom de ville change. Sans contenu réellement local, elle ne se classera pas."
    }
  };

  function choisir() {
    var i = intention.value, m = moment.value;
    if (i === 'transactionnelle') return m === 'local' ? FORMATS.local : FORMATS.service;
    if (i === 'commerciale') return m === 'prix' ? FORMATS.prix : FORMATS.comparatif;
    if (i === 'methode') return FORMATS.methode;
    return FORMATS.definition;
  }

  function calcul() {
    var f = choisir();
    format.textContent = f.nom;
    if (meter) meter.style.width = Math.round((f.plan.length / 6) * 100) + '%';

    out.textContent = '';
    var l = document.createElement('p');
    l.textContent = 'Longueur indicative : ' + f.mots + '.';
    out.appendChild(l);

    var h = document.createElement('p');
    var b = document.createElement('strong'); b.textContent = 'Structure à suivre';
    h.appendChild(b);
    out.appendChild(h);

    var ol = document.createElement('ol');
    f.plan.forEach(function (p) { var li = document.createElement('li'); li.textContent = p; ol.appendChild(li); });
    out.appendChild(ol);

    var n = document.createElement('p');
    n.textContent = f.note;
    out.appendChild(n);

    return f;
  }

  function copier() {
    var f = calcul();
    var texte = ['Format recommandé : ' + f.nom, 'Longueur : ' + f.mots, '', 'Structure :']
      .concat(f.plan.map(function (p, i) { return (i + 1) + '. ' + p; }))
      .concat(['', f.note, '', 'Source : anthony-courtin.com/blog/contenu-seo']).join('\n');
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

  [intention, moment].forEach(function (el) { el.addEventListener('change', calcul); });
  if (copy) copy.addEventListener('click', copier);
  calcul();
})();
