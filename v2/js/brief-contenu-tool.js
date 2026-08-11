/* Générateur de commande éditoriale pour l'article brief-contenu.
   Trois réglages, un modèle à remplir adapté au format, à l'objectif et à
   celui qui écrira. 100 % navigateur, aucun appel réseau. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var type = $('bc-type'), obj = $('bc-obj'), qui = $('bc-qui'),
      compte = $('bc-compte'), meter = $('bc-meter'), out = $('bc-out'), copy = $('bc-copy');
  if (!type || !out) return;

  /* Le socle : ce que toute commande porte, quel que soit le format. */
  var SOCLE = [
    ['Intention visée', "La question exacte à laquelle la page répond, écrite comme la poserait un lecteur."],
    ['Promesse', "Ce que le lecteur saura faire à la fin. Une phrase, au futur."],
    ['Angle', "Ce que cette page dira que les autres ne disent pas. Sans cet élément, ne commandez pas."],
    ['Plan imposé', "Les titres de niveau 2 et 3, dans l'ordre. C'est la partie qui évite les allers-retours."],
    ['Sources autorisées', "Les documents, chiffres et pages internes à utiliser. Et l'interdiction d'en inventer d'autres."],
    ['Longueur indicative', "Une fourchette, jamais un chiffre exact. La longueur découle du plan."],
    ["Critères d'acceptation", "Ce qui fait qu'un texte est refusé. Trois lignes suffisent, elles remplacent trois relectures."]
  ];

  var PAR_TYPE = {
    blog: { n: 'Article de blog', mots: '1 200 à 1 800 mots', rub: [
      ['Question de départ', "La requête telle qu'elle se tape, avec les deux ou trois formulations voisines."],
      ['Preuve à intégrer', "Un chiffre daté, un cas vécu ou une capture. Un article sans preuve ne se distingue pas."],
      ["Appel à l'action", "Où doit aller le lecteur ensuite, et pourquoi il aurait envie d'y aller."]
    ]},
    service: { n: 'Page de service', mots: '800 à 1 400 mots', rub: [
      ['Problème du client', "Formulé avec ses mots à lui, pas avec le vocabulaire du métier."],
      ['Périmètre exact', "Ce qui est inclus, ce qui ne l'est pas. C'est ce paragraphe qui évite les malentendus."],
      ['Preuve de compétence', "Références, méthode, durée d'intervention, ce qui rassure avant l'appel."],
      ['Objection principale', "La raison numéro un de ne pas acheter, et la réponse à lui apporter."]
    ]},
    produit: { n: 'Fiche produit', mots: '400 à 900 mots', rub: [
      ['Caractéristiques vérifiées', "La liste technique, validée par quelqu'un qui a le produit en main."],
      ['Bénéfice associé', "Pour chaque caractéristique, ce qu'elle change concrètement à l'usage."],
      ['Usage type', "À qui ce produit s'adresse, et dans quelle situation précise."]
    ]},
    cas: { n: 'Étude de cas', mots: '900 à 1 500 mots', rub: [
      ['Situation de départ', "Chiffrée et datée. Sans état initial, le résultat ne démontre rien."],
      ['Ce qui a été fait', "Les actions, dans l'ordre, avec ce qui a changé par ailleurs."],
      ['Résultat mesuré', "En valeur absolue avant le pourcentage, sur une période nommée."],
      ['Accord du client', "L'autorisation écrite de citer le nom et les chiffres, ou la règle d'anonymisation."]
    ]},
    pilier: { n: 'Page pilier', mots: '2 500 à 4 000 mots', rub: [
      ['Sous-sujets couverts', "La liste des branches à traiter, et celles qui feront l'objet d'une page à part."],
      ['Pages filles à lier', "Les adresses existantes ou à venir, avec le texte du lien souhaité."],
      ['Ce que la page ne traite pas', "La frontière, écrite noir sur blanc, pour éviter le recouvrement avec vos autres pages."]
    ]}
  };

  var PAR_OBJECTIF = {
    trafic: { n: 'Aller chercher du trafic', nl: 'aller chercher du trafic', rub: [
      ['Requêtes secondaires', "Cinq à dix formulations voisines, à placer dans les titres intermédiaires."],
      ['Balise titre et résumé', "Rédigés dans la commande, pas laissés au hasard de la publication."]
    ]},
    conversion: { n: "Faire passer à l'action", nl: "faire passer à l'action", rub: [
      ['Étape suivante unique', "Une seule action attendue. Deux boutons différents divisent le taux par deux."],
      ['Éléments de réassurance', "Tarifs, délais, garanties, ce qui lève le doute au moment de cliquer."]
    ]},
    notoriete: { n: 'Asseoir une expertise', nl: 'asseoir une expertise', rub: [
      ['Prise de position', "L'avis tranché que la page défend, et ce qu'il coûte de le défendre."],
      ['Signature', "Qui écrit, avec quelle légitimité, et où le lecteur peut le vérifier."]
    ]},
    citation: { n: 'Être repris par les IA', nl: 'être repris par les IA', rub: [
      ['Paragraphes autonomes', "Chaque passage clé doit se comprendre seul, sorti de son contexte."],
      ['Données attribuables', "Chiffres sourcés et datés, formulés en phrases complètes plutôt qu'en tableaux."],
      ['Réponse en tête', "La réponse dans les deux premières phrases, avant toute justification."]
    ]}
  };

  var PAR_QUI = {
    interne: { n: "Quelqu'un de la maison", note: "Vous pouvez alléger le contexte, jamais le plan ni les critères d'acceptation.", rub: [] },
    freelance: { n: 'Un indépendant', note: "Ajoutez le contexte que vous croyez évident : c'est toujours là que ça coince.", rub: [
      ["Contexte de l'entreprise", "Ce que vous vendez, à qui, et les trois mots que vous n'employez jamais."],
      ['Délai et modalités', "Date de rendu, format attendu, nombre de retouches comprises."]
    ]},
    agence: { n: 'Une agence', note: "Plus l'équipe est nombreuse, plus la commande doit être écrite : elle passera de main en main.", rub: [
      ["Contexte de l'entreprise", "Ce que vous vendez, à qui, et les trois mots que vous n'employez jamais."],
      ['Guide de style', "Ton, personne employée, longueur des phrases, vocabulaire interdit."],
      ['Interlocuteur unique', "Une personne qui valide. Deux valideurs produisent un texte moyen."],
      ['Délai et modalités', "Date de rendu, format attendu, nombre de retouches comprises."]
    ]},
    ia: { n: 'Un modèle de langage', note: "Le modèle ne devinera rien et n'osera pas demander. Tout ce qui manque sera inventé.", rub: [
      ['Matière brute fournie', "Notes, transcriptions, chiffres internes. Sans elle, le texte sera générique."],
      ['Interdictions explicites', "Pas de chiffre non fourni, pas de source inventée, pas de superlatif."],
      ['Exemple de ton', "Deux paragraphes déjà écrits par vous, à imiter. Plus efficace que dix adjectifs."]
    ]}
  };

  function rubriques() {
    var t = PAR_TYPE[type.value] || PAR_TYPE.blog;
    var o = PAR_OBJECTIF[obj.value] || PAR_OBJECTIF.trafic;
    var q = PAR_QUI[qui.value] || PAR_QUI.freelance;
    var vues = {}, liste = [];
    SOCLE.concat(t.rub, o.rub, q.rub).forEach(function (r) {
      if (vues[r[0]]) return;
      vues[r[0]] = true;
      liste.push(r);
    });
    return { liste: liste, t: t, o: o, q: q };
  }

  function afficher() {
    var r = rubriques();
    compte.textContent = r.liste.length + ' rubriques';
    if (meter) meter.style.width = Math.min(100, Math.round((r.liste.length / 18) * 100)) + '%';

    out.textContent = '';

    var chapeau = document.createElement('p');
    chapeau.textContent = r.t.n + ', ' + r.t.mots + '. Objectif : ' + (r.o.nl || r.o.n) +
                          '. Rédaction confiée à : ' + r.q.n.toLowerCase() + '.';
    out.appendChild(chapeau);

    var note = document.createElement('p');
    var b = document.createElement('strong');
    b.textContent = 'À ne pas oublier. ';
    note.appendChild(b);
    note.appendChild(document.createTextNode(r.q.note));
    out.appendChild(note);

    var ul = document.createElement('ul');
    r.liste.forEach(function (x) {
      var li = document.createElement('li');
      var f = document.createElement('strong');
      f.textContent = x[0];
      li.appendChild(f);
      li.appendChild(document.createTextNode(' : ' + x[1]));
      ul.appendChild(li);
    });
    out.appendChild(ul);
    return r;
  }

  function copier() {
    var r = afficher();
    var lignes = ['COMMANDE ÉDITORIALE', '',
      'Format : ' + r.t.n + ' (' + r.t.mots + ')',
      'Objectif : ' + r.o.n,
      'Rédaction : ' + r.q.n, ''];
    r.liste.forEach(function (x) {
      lignes.push(x[0].toUpperCase());
      lignes.push('  (' + x[1] + ')');
      lignes.push('  > ');
      lignes.push('');
    });
    lignes.push('Modèle : anthony-courtin.com/blog/brief-contenu');
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

  [type, obj, qui].forEach(function (el) { el.addEventListener('change', afficher); });
  if (copy) copy.addEventListener('click', copier);
  afficher();
})();
