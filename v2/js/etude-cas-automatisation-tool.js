/* Générateur de protocole de relevé pour l'article etude-cas-automatisation-pme.
   L'outil ne calcule aucun gain : il dit quoi mesurer, avant de toucher au
   processus, pour qu'une comparaison après ait un sens.
   100 % navigateur, aucun appel réseau. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var proc = $('eca-proc'), taille = $('eca-taille'),
      compte = $('eca-compte'), meter = $('eca-meter'), out = $('eca-out'), copy = $('eca-copy');
  if (!proc || !out) return;

  /* Les cinq relevés du socle valent pour tout processus métier. */
  var SOCLE = [
    ['Volume mensuel', "Le nombre d'occurrences sur un mois entier, pas sur une semaine extrapolée."],
    ['Temps unitaire', "Chronométré trois fois, sur trois personnes différentes si possible. La moyenne déclarée est toujours fausse."],
    ['Délai de bout en bout', "Entre le déclencheur et la fin. C'est souvent lui qui intéresse le client, pas le temps de travail."],
    ['Taux d\'erreur', "Le nombre de reprises, corrections ou réclamations pour cent occurrences."],
    ['Qui fait quoi', "La liste des personnes impliquées et leur part. Une automatisation déplace le travail avant de le supprimer."]
  ];

  var PROCESSUS = {
    saisie: {
      n: 'Saisie et recopie de données',
      periode: 'deux mois',
      sup: [['Nombre de systèmes traversés', "Chaque copie d'un outil vers un autre est un point de mesure et un point de panne."],
            ['Volume par jour de pointe', "La saisie se concentre souvent en fin de mois. La moyenne masque le vrai problème."]],
      pieges: ["Le temps de saisie déclaré oublie les allers-retours pour retrouver l'information manquante.",
               "Une donnée mal saisie coûte en aval, pas au moment de la saisie : cherchez le coût là où il tombe."]
    },
    relance: {
      n: 'Relances et facturation',
      periode: 'trois mois',
      sup: [['Délai moyen de paiement', "Le seul chiffre que la direction retiendra. Relevez-le avant, sur douze mois glissants."],
            ['Part des relances jamais faites', "Le vrai gain se cache souvent là : ce qui n'était pas fait faute de temps."]],
      pieges: ["Le gain apparent vient parfois d'un changement de conditions de paiement décidé au même moment.",
               "Une relance automatique mal réglée abîme une relation client ; comptez aussi les plaintes."]
    },
    reporting: {
      n: 'Reporting et tableaux de bord',
      periode: 'trois mois',
      sup: [['Temps de production du rapport', "Collecte, mise en forme et vérification, comptés séparément."],
            ['Nombre de lecteurs réels', "Un rapport que personne n'ouvre ne mérite pas d'être automatisé, il mérite d'être supprimé."]],
      pieges: ["Automatiser un rapport inutile le rend inutile plus vite. Vérifiez d'abord qu'il sert.",
               "Le temps gagné se dissout s'il n'est pas réaffecté à une tâche nommée."]
    },
    devis: {
      n: 'Devis et propositions commerciales',
      periode: 'trois mois',
      sup: [['Délai entre la demande et l\'envoi', "Le facteur qui pèse le plus sur le taux d'acceptation."],
            ['Taux d\'acceptation', "À relever avant, faute de quoi vous ne saurez pas si la vitesse a servi à quelque chose."]],
      pieges: ["Un devis produit plus vite mais moins personnalisé peut faire baisser le taux d'acceptation.",
               "Le commercial passe souvent le temps gagné sur autre chose : mesurez le nombre de devis, pas seulement le temps."]
    },
    support: {
      n: 'Support et réponses clients',
      periode: 'trois mois',
      sup: [['Délai de première réponse', "L'indicateur le plus lié à la satisfaction client."],
            ['Part des demandes répétitives', "Comptez sur cent demandes combien relèvent de dix questions. C'est votre marge d'automatisation réelle."]],
      pieges: ["Une réponse automatique hors sujet coûte plus cher qu'une réponse tardive. Suivez le taux de réouverture.",
               "La satisfaction se mesure avant, sinon toute amélioration reste une impression."]
    },
    prospects: {
      n: 'Qualification de prospects',
      periode: 'quatre mois',
      sup: [['Nombre de prospects traités', "Et le nombre laissé de côté faute de temps, souvent le plus révélateur."],
            ['Taux de conversion par étape', "Sans lui, vous ne saurez pas si vous avez gagné en volume ou perdu en qualité."]],
      pieges: ["Traiter plus de prospects avec moins de soin peut faire baisser le chiffre d'affaires malgré un gain de temps.",
               "Le cycle de vente est long : quatre mois d'observation est un minimum, pas une précaution."]
    }
  };

  var TAILLE = {
    une: { n: 'Une seule personne', note: "Relevé simple, mais attention au biais : une personne seule sous-estime presque toujours le temps qu'elle passe.", sup: [] },
    service: { n: 'Plusieurs personnes d\'un même service', note: "Mesurez au moins trois personnes : l'écart entre elles est souvent plus grand que le gain attendu.", sup: [
      ['Écart entre les personnes', "Le plus rapide et le plus lent. Si l'écart dépasse le double, le problème est la méthode, pas l'outil."]
    ]},
    services: { n: 'Plusieurs services', note: "Le temps perdu est surtout dans les attentes entre services, pas dans le travail lui-même.", sup: [
      ['Écart entre les personnes', "Le plus rapide et le plus lent. Si l'écart dépasse le double, le problème est la méthode, pas l'outil."],
      ['Temps d\'attente entre services', "Le dossier qui dort trois jours sur un bureau. C'est là que se trouve le gain le plus facile."],
      ['Nombre de reprises entre services', "Chaque renvoi en arrière est du travail fait deux fois."]
    ]}
  };

  function releves() {
    var p = PROCESSUS[proc.value] || PROCESSUS.saisie;
    var t = TAILLE[taille.value] || TAILLE.une;
    var vus = {}, liste = [];
    SOCLE.concat(p.sup, t.sup).forEach(function (r) {
      if (vus[r[0]]) return;
      vus[r[0]] = true;
      liste.push(r);
    });
    return { liste: liste, p: p, t: t };
  }

  function afficher() {
    var r = releves();
    compte.textContent = r.liste.length + ' relevés';
    if (meter) meter.style.width = Math.min(100, Math.round((r.liste.length / 10) * 100)) + '%';

    out.textContent = '';

    var chapeau = document.createElement('p');
    chapeau.textContent = r.p.n + ', ' + r.t.n.toLowerCase() + '. Période d\'observation avant automatisation : ' + r.p.periode + '.';
    out.appendChild(chapeau);

    var note = document.createElement('p');
    var b = document.createElement('strong');
    b.textContent = 'Le biais à surveiller. ';
    note.appendChild(b);
    note.appendChild(document.createTextNode(r.t.note));
    out.appendChild(note);

    var t1 = document.createElement('p');
    var b1 = document.createElement('strong');
    b1.textContent = 'À relever avant de toucher au processus';
    t1.appendChild(b1);
    out.appendChild(t1);

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

    var t2 = document.createElement('p');
    var b2 = document.createElement('strong');
    b2.textContent = 'Les deux pièges de ce processus';
    t2.appendChild(b2);
    out.appendChild(t2);

    var ul2 = document.createElement('ul');
    r.p.pieges.forEach(function (x) {
      var li = document.createElement('li');
      li.textContent = x;
      ul2.appendChild(li);
    });
    out.appendChild(ul2);

    return r;
  }

  function copier() {
    var r = afficher();
    var lignes = ['FICHE DE RELEVÉ AVANT AUTOMATISATION', '',
      'Processus : ' + r.p.n,
      'Périmètre : ' + r.t.n,
      'Période d\'observation : ' + r.p.periode,
      'Date du relevé initial : ', ''];
    r.liste.forEach(function (x) {
      lignes.push(x[0].toUpperCase() + '  (' + x[1] + ')');
      lignes.push('  Avant : ');
      lignes.push('  Après : ');
      lignes.push('');
    });
    lignes.push('CE QUI A CHANGÉ PAR AILLEURS SUR LA PÉRIODE');
    lignes.push('  > ');
    lignes.push('');
    lignes.push('PIÈGES À VÉRIFIER');
    r.p.pieges.forEach(function (x) { lignes.push('  - ' + x); });
    lignes.push('');
    lignes.push('Fiche : anthony-courtin.com/blog/etude-cas-automatisation-pme');
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

  [proc, taille].forEach(function (el) { el.addEventListener('change', afficher); });
  if (copy) copy.addEventListener('click', copier);
  afficher();
})();
