/* Estimateur de risque pour l'article vibe-coding.
   100 % navigateur, aucun appel réseau. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var nature = $('vc-nature'), public_ = $('vc-public'), donnees = $('vc-donnees'), duree = $('vc-duree'),
      score = $('vc-score'), meter = $('vc-meter'), out = $('vc-out'), copy = $('vc-copy');
  if (!nature || !out) return;

  var GARDES = {
    donnees_perso: "Faites relire le stockage et les accès par quelqu'un qui sait lire du code. Une fuite de données personnelles ne se rattrape pas.",
    paiement: "Ne codez jamais vous-même la manipulation de moyens de paiement. Passez par un prestataire qui porte la conformité.",
    public: "Ajoutez une limitation du nombre de requêtes et une validation stricte de toutes les entrées avant la mise en ligne.",
    duree: "Demandez des tests automatisés dès le début. Sans eux, personne ne pourra reprendre ce code dans six mois, vous compris.",
    equipe: "Imposez une relecture humaine avant chaque mise en production, même sur une correction d'une ligne."
  };

  function valeur(el) { return parseInt(el.value, 10) || 0; }

  function calcul() {
    var n = valeur(nature), p = valeur(public_), d = valeur(donnees), u = valeur(duree);
    var total = n + p + d + u;

    score.textContent = total + ' / 20';
    if (meter) meter.style.width = Math.round((total / 20) * 100) + '%';

    var titre, texte;
    if (total <= 6) {
      titre = 'Terrain idéal';
      texte = "Décrivez ce que vous voulez et laissez faire. C'est exactement le cas de figure où cette manière de travailler donne le plus, avec le moins de risques.";
    } else if (total <= 11) {
      titre = 'Faisable, avec des garde-fous';
      texte = "Le projet reste accessible, mais il sortira du prototype. Posez les garde-fous listés ci-dessous avant d'aller plus loin, pas après.";
    } else if (total <= 15) {
      titre = 'Prototypez, puis faites reprendre';
      texte = "Servez-vous en pour valider l'idée et montrer une maquette fonctionnelle. Confiez ensuite la version qui ira en production à quelqu'un qui sait lire ce qui a été écrit.";
    } else {
      titre = 'Mauvais candidat';
      texte = "Trop d'enjeux se cumulent. Le gain de vitesse initial sera repris avec intérêts au premier incident. Faites développer par un professionnel, quitte à utiliser ces outils comme assistants.";
    }

    var gardes = [];
    if (d >= 3) gardes.push(GARDES.donnees_perso);
    if (d >= 5) gardes.push(GARDES.paiement);
    if (p >= 3) gardes.push(GARDES.public);
    if (u >= 3) gardes.push(GARDES.duree);
    if (total > 11) gardes.push(GARDES.equipe);

    out.textContent = '';
    var t = document.createElement('strong'); t.textContent = titre;
    var d1 = document.createElement('p'); d1.textContent = texte;
    out.appendChild(t); out.appendChild(d1);
    if (gardes.length) {
      var h = document.createElement('p'); h.textContent = 'Garde-fous à poser :';
      var ul = document.createElement('ul');
      gardes.forEach(function (g) { var li = document.createElement('li'); li.textContent = g; ul.appendChild(li); });
      out.appendChild(h); out.appendChild(ul);
    }
    return { total: total, titre: titre, texte: texte, gardes: gardes };
  }

  function copier() {
    var r = calcul();
    var texte = ['Évaluation de mon projet : ' + r.total + ' / 20', '', r.titre, r.texte, '']
      .concat(r.gardes.length ? ['Garde-fous :'].concat(r.gardes.map(function (g) { return '- ' + g; })) : ['Aucun garde-fou particulier.'])
      .concat(['', 'Source : anthony-courtin.com/blog/vibe-coding']).join('\n');
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

  [nature, public_, donnees, duree].forEach(function (el) {
    el.addEventListener('change', calcul);
    el.addEventListener('input', calcul);
  });
  if (copy) copy.addEventListener('click', copier);
  calcul();
})();
