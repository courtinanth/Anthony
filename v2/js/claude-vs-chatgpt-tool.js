/* Sélecteur d'usage pour l'article claude-vs-chatgpt.
   100 % navigateur, aucun appel réseau. Faits relevés le 7 octobre 2026. */
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
      documents: { c: 3, g: 0, r: "Sur les documents longs, la fenêtre de contexte fait la différence : Claude monte jusqu'à un million de tokens sur toutes ses formules, ChatGPT donne 27 000 à 128 000 tokens en mode instantané selon la formule." },
      code: { c: 2, g: 1, r: "Claude Code (inclus dès Claude Pro) et Codex (inclus dans ChatGPT Plus) font jeu égal sur l'offre. Claude garde un léger avantage dans ma pratique sur les tâches longues." },
      redaction: { c: 2, g: 1, r: "Question de goût plus que de capacité. L'écriture de Claude est plus sobre, celle de ChatGPT plus démonstrative." },
      images: { c: 0, g: 3, r: "ChatGPT génère des images. Claude analyse les images et produit des schémas en code, mais ne crée ni photo ni illustration." },
      recherche: { c: 1, g: 2, r: "Les deux cherchent sur le web. ChatGPT ouvre la recherche approfondie dès la version gratuite, Claude à partir de Pro." },
      agents: { c: 1, g: 1, r: "Claude (qui intègre Cowork) et ChatGPT Work mènent tous deux des tâches longues sur vos fichiers et vos applications, sur les formules payantes." },
      quotidien: { c: 1, g: 1, r: "Pour l'assistance courante, les deux font le travail. Le critère de choix est ailleurs : prix, interface, outils déjà en place." }
    },
    priorite: {
      contexte: { c: 3, g: 0, r: "Si vous travaillez sur de gros volumes de texte d'un seul tenant, l'écart de fenêtre de contexte est le critère décisif." },
      ecosysteme: { c: 1, g: 1, r: "Les deux se branchent sur Microsoft 365, Google Drive ou Slack. Choisissez celui que vos équipes ouvrent déjà par réflexe." },
      sobriete: { c: 2, g: 0, r: "Les textes de Claude demandent en général moins de retouches pour retirer l'emphase superflue." },
      polyvalence: { c: 0, g: 2, r: "ChatGPT couvre plus de types de contenus dans une seule interface : texte, images, recherche approfondie, agents." },
      confidentialite: { c: 1, g: 1, r: "Les deux permettent de refuser l'entraînement sur vos conversations. Vérifiez surtout le contrat applicable à votre formule." }
    }
  };

  var BUDGET = {
    serre: "Budget serré : ChatGPT Go coûte 8 € TTC par mois et peut inclure de la publicité. Claude n'a rien entre sa version gratuite et Pro (20 $ HT par mois, 17 $ en annuel).",
    gratuit: "Version gratuite : ChatGPT offre des conversations écrites illimitées avec GPT-5.6 Luna. Claude gratuit fonctionne par quotas sur cinq heures, mais garde une grande fenêtre de contexte pour les longs documents."
  };

  function calcul() {
    var u = REGLES.usage[usage.value] || REGLES.usage.quotidien;
    var p = REGLES.priorite[priorite.value] || REGLES.priorite.polyvalence;
    var c = u.c + p.c, g = u.g + p.g;
    if (budget.value === 'gratuit' && usage.value !== 'documents') g += 1;

    var titre, texte;
    if (c > g + 1) { titre = 'Claude, assez nettement'; texte = "Vos critères pointent dans la même direction."; }
    else if (g > c + 1) { titre = 'ChatGPT, assez nettement'; texte = "Vos critères pointent dans la même direction."; }
    else if (c > g) { titre = 'Claude, de peu'; texte = "L'écart est faible : testez les deux un mois avant de vous engager."; }
    else if (g > c) { titre = 'ChatGPT, de peu'; texte = "L'écart est faible : testez les deux un mois avant de vous engager."; }
    else { titre = 'Match nul'; texte = "Sur votre profil, les deux se valent. Choisissez sur l'interface et sur le prix, pas sur les capacités."; }

    verdict.textContent = titre;
    var total = c + g;
    if (meter) meter.style.width = (total ? Math.round((c / total) * 100) : 50) + '%';

    out.textContent = '';
    var p0 = document.createElement('p'); p0.textContent = texte; out.appendChild(p0);

    var raisons = [u.r, p.r];
    if (BUDGET[budget.value]) raisons.push(BUDGET[budget.value]);
    var ul = document.createElement('ul');
    raisons.forEach(function (raison) {
      var li = document.createElement('li'); li.textContent = raison; ul.appendChild(li);
    });
    out.appendChild(ul);

    return { titre: titre, texte: texte, raisons: raisons };
  }

  function copier() {
    var r = calcul();
    var texte = ['Claude vs ChatGPT, mon verdict : ' + r.titre, '', r.texte, '']
      .concat(r.raisons.map(function (x) { return '- ' + x; }))
      .concat(['', 'Tarifs et caractéristiques relevés le 7 octobre 2026.',
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
