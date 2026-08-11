/* Sélecteur d'usage pour l'article claude-vs-chatgpt.
   100 % navigateur, aucun appel réseau. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var usage = $('cvc-usage'), priorite = $('cvc-priorite'), budget = $('cvc-budget'),
      verdict = $('cvc-verdict'), meter = $('cvc-meter'), out = $('cvc-out'), copy = $('cvc-copy');
  if (!usage || !out) return;

  /* Chaque critère donne des points à l'un ou à l'autre, avec sa raison.
     Une égalité est un résultat valide : sur beaucoup d'usages, les deux se valent. */
  var REGLES = {
    usage: {
      documents: { c: 3, g: 0, r: "Sur les documents longs, la fenêtre de contexte fait la différence : Claude annonce un million de tokens là où le modèle instantané de ChatGPT est donné à 27 000." },
      code: { c: 2, g: 1, r: "Les deux codent bien. Claude prend l'avantage sur les tâches longues et autonomes, ChatGPT sur l'intégration à un écosystème déjà en place." },
      redaction: { c: 2, g: 1, r: "Question de goût plus que de capacité. L'écriture de Claude est plus sobre, celle de ChatGPT plus démonstrative." },
      images: { c: 0, g: 3, r: "La génération et l'analyse d'images sont intégrées chez ChatGPT. Claude traite l'image en entrée mais n'en produit pas." },
      recherche: { c: 1, g: 2, r: "Les deux cherchent sur le web. ChatGPT a l'avance sur la recherche approfondie et le nombre de connecteurs grand public." },
      quotidien: { c: 1, g: 1, r: "Pour de l'assistance courante, les deux font le travail. Le critère de choix est ailleurs : prix, interface, écosystème." }
    },
    priorite: {
      contexte: { c: 3, g: 0, r: "Si vous travaillez sur de gros volumes de texte d'un seul tenant, l'écart de fenêtre de contexte est le critère décisif." },
      ecosysteme: { c: 0, g: 3, r: "ChatGPT est distribué à travers l'écosystème Microsoft, ce qui en fait souvent la voie la plus courte dans une entreprise déjà équipée." },
      sobriete: { c: 2, g: 0, r: "Les textes de Claude demandent en général moins de retouches pour retirer l'emphase superflue." },
      polyvalence: { c: 0, g: 2, r: "ChatGPT couvre plus de types de contenus dans une seule interface : texte, images, recherche approfondie, agents." },
      confidentialite: { c: 1, g: 0, r: "Les deux proposent des réglages. Vérifiez surtout le contrat applicable à votre formule plutôt que la promesse commerciale." }
    }
  };

  function calcul() {
    var u = REGLES.usage[usage.value] || REGLES.usage.quotidien;
    var p = REGLES.priorite[priorite.value] || REGLES.priorite.polyvalence;
    var c = u.c + p.c, g = u.g + p.g;

    var titre, texte;
    if (c > g + 1) { titre = 'Claude, assez nettement'; texte = "Vos deux critères pointent dans la même direction."; }
    else if (g > c + 1) { titre = 'ChatGPT, assez nettement'; texte = "Vos deux critères pointent dans la même direction."; }
    else if (c > g) { titre = 'Claude, de peu'; texte = "L'écart est faible : testez les deux un mois avant de vous engager."; }
    else if (g > c) { titre = 'ChatGPT, de peu'; texte = "L'écart est faible : testez les deux un mois avant de vous engager."; }
    else { titre = 'Match nul'; texte = "Sur votre profil, les deux se valent. Choisissez sur l'interface et sur le prix, pas sur les capacités."; }

    verdict.textContent = titre;
    var total = c + g;
    if (meter) meter.style.width = (total ? Math.round((c / total) * 100) : 50) + '%';

    out.textContent = '';
    var p0 = document.createElement('p'); p0.textContent = texte; out.appendChild(p0);

    var ul = document.createElement('ul');
    [u.r, p.r].forEach(function (raison) {
      var li = document.createElement('li'); li.textContent = raison; ul.appendChild(li);
    });
    out.appendChild(ul);

    if (budget.value === 'serre') {
      var b = document.createElement('p');
      b.textContent = "Budget serré : ChatGPT propose une formule intermédiaire à 8 € par mois, qui peut inclure de la publicité. Claude n'a pas d'équivalent entre sa formule gratuite et son premier palier payant.";
      out.appendChild(b);
    }

    return { titre: titre, texte: texte, raisons: [u.r, p.r] };
  }

  function copier() {
    var r = calcul();
    var texte = ['Claude ou ChatGPT : ' + r.titre, '', r.texte, '']
      .concat(r.raisons.map(function (x) { return '- ' + x; }))
      .concat(['', 'Tarifs et caractéristiques relevés le 11 août 2026.',
        'Source : anthony-courtin.com/blog/claude-vs-chatgpt']).join('\n');
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

  [usage, priorite, budget].forEach(function (el) { el.addEventListener('change', calcul); });
  if (copy) copy.addEventListener('click', copier);
  calcul();
})();
