/* Générateur de prompts SEO pour l'article claude-pour-seo.
   100 % navigateur, aucun appel réseau. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var tache = $('cps-tache'), contexte = $('cps-contexte'), sortie = $('cps-sortie'),
      copy = $('cps-copy'), compteur = $('cps-compteur'), meter = $('cps-meter');
  if (!tache || !sortie) return;

  var MODELES = {
    audit: {
      titre: 'Audit technique',
      corps: "Tu es consultant SEO technique. Je te donne l'export d'un crawl.\n\nTravail attendu :\n1. Classe les problèmes trouvés en trois niveaux : bloquant pour l'indexation, pénalisant, cosmétique.\n2. Pour chaque problème bloquant, indique le nombre d'URL touchées et la correction exacte à appliquer.\n3. Termine par les trois chantiers à traiter en premier, classés par impact sur le trafic, pas par facilité.\n\nRègles : ne propose aucune action dont l'effet n'est pas mesurable. Si une donnée te manque pour trancher, dis-le au lieu de supposer."
    },
    brief: {
      titre: 'Brief de contenu',
      corps: "Tu es responsable éditorial SEO. Prépare le brief d'un article à partir du mot-clé et du contexte ci-dessous.\n\nLivre :\n1. L'intention de recherche dominante, en une phrase.\n2. Un plan en H2 et H3, où chaque titre contient la question à laquelle il répond.\n3. Les questions à traiter en FAQ, formulées comme les tape un internaute.\n4. L'angle qui différencie cet article de ce qui existe déjà.\n\nRègles : pas de section de remplissage. Si un H2 n'apporte rien qu'un autre n'apporte, supprime-le."
    },
    meta: {
      titre: 'Balises title et meta',
      corps: "Tu es consultant SEO. Rédige les balises pour la page décrite ci-dessous.\n\nLivre trois propositions, chacune avec :\n- un title de 60 caractères maximum, mot-clé principal dans les 35 premiers ;\n- une meta description de 155 caractères maximum, qui donne une raison de cliquer plutôt qu'un résumé.\n\nRègles : compte réellement les caractères et affiche le compte. Pas de superlatif creux, pas de point d'exclamation."
    },
    concurrence: {
      titre: 'Analyse concurrentielle',
      corps: "Tu es analyste SEO. Je te donne le contenu des pages qui se classent devant moi.\n\nLivre :\n1. Ce que ces pages traitent et que je ne traite pas.\n2. Ce que je traite mieux qu'elles, à conserver.\n3. Les angles qu'aucune ne prend, et qui seraient légitimes pour moi.\n4. Une recommandation : enrichir l'existant ou repartir d'une page neuve, avec la raison.\n\nRègles : appuie chaque constat sur un élément présent dans les textes fournis. Pas de généralité applicable à n'importe quel site."
    },
    maillage: {
      titre: 'Maillage interne',
      corps: "Tu es consultant SEO. Je te donne la liste de mes pages avec leur sujet.\n\nLivre :\n1. Pour chaque page, les trois liens internes entrants les plus pertinents, avec l'ancre exacte à utiliser.\n2. Les pages orphelines, qui ne reçoivent aucun lien.\n3. Les couples de pages qui risquent de se cannibaliser, et laquelle sacrifier.\n\nRègles : les ancres doivent être variées et descriptives. Aucune ancre du type « cliquez ici » ou « en savoir plus »."
    },
    citable: {
      titre: 'Rendre un contenu citable',
      corps: "Tu es spécialiste de la visibilité dans les moteurs de réponse. Je te donne un texte existant.\n\nLivre :\n1. Le paragraphe d'ouverture réécrit pour répondre à la question dès les deux premières phrases.\n2. Les affirmations qui manquent d'une source ou d'une date, listées telles quelles.\n3. Les passages trop longs pour être repris tels quels par un moteur, avec leur version resserrée.\n\nRègles : ne change pas le fond, ne rajoute aucun chiffre qui ne serait pas déjà dans le texte."
    },
    redaction: {
      titre: 'Relecture avant publication',
      corps: "Tu es relecteur. Passe le texte ci-dessous au contrôle avant publication.\n\nVérifie et signale :\n1. Les affirmations invérifiables ou non sourcées.\n2. Les répétitions et les phrases qui ne disent rien.\n3. Les promesses faites en introduction et non tenues dans le corps.\n4. Les titres qui n'annoncent pas leur contenu.\n\nRègles : ne réécris pas le texte. Signale, cite le passage, et propose une correction courte."
    }
  };

  function generer() {
    var m = MODELES[tache.value] || MODELES.audit;
    var ctx = (contexte.value || '').trim();
    var texte = m.corps + '\n\n---\nContexte :\n' + (ctx || '[collez ici votre mot-clé, votre URL ou votre texte]');
    sortie.value = texte;
    if (compteur) compteur.textContent = texte.length + ' caractères';
    if (meter) meter.style.width = Math.min(100, Math.round(texte.length / 12)) + '%';
    return texte;
  }

  function copier() {
    var t = generer();
    var fini = function (ok) {
      var a = copy.textContent;
      copy.textContent = ok ? 'Copié' : 'Copie impossible';
      setTimeout(function () { copy.textContent = a; }, 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(function () { fini(true); }, function () { fini(false); });
    } else { fini(false); }
  }

  tache.addEventListener('change', generer);
  if (contexte) contexte.addEventListener('input', generer);
  if (copy) copy.addEventListener('click', copier);
  generer();
})();
