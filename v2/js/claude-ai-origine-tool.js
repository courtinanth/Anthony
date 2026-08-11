/* Chronologie interactive d'Anthropic et de Claude.
   Article claude-ai-origine. 100 % navigateur, aucun appel réseau.
   Dates vérifiées le 11 août 2026. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var slider = $('cao-range'), titre = $('cao-titre'), texte = $('cao-texte'),
      date = $('cao-date'), meter = $('cao-meter'), copy = $('cao-copy');
  if (!slider || !texte) return;

  var ETAPES = [
    { d: 'Janvier 2021', t: "Fondation d'Anthropic",
      x: "Huit personnes fondent Anthropic à San Francisco, dont Dario Amodei, jusque-là vice-président de la recherche chez OpenAI, et Daniela Amodei. L'entreprise est constituée en public benefit corporation, un statut américain qui inscrit une mission d'intérêt général dans les statuts." },
    { d: 'Mars 2023', t: 'Les premières versions de Claude',
      x: "Claude et Claude Instant sortent, réservés à des utilisateurs approuvés. Deux ans se sont écoulés entre la fondation et le premier modèle public : Anthropic a passé ce temps sur la recherche plutôt que sur le produit." },
    { d: 'Juillet 2023', t: 'Claude 2, ouvert à tous',
      x: "Claude 2 est le premier modèle réellement accessible au public. C'est le moment où le nom commence à circuler hors des cercles techniques." },
    { d: 'Mars 2024', t: 'La famille Claude 3',
      x: "Anthropic publie trois modèles d'un coup, Opus, Sonnet et Haiku, et fixe une convention de nommage qui tiendra : un modèle puissant, un modèle équilibré, un modèle rapide." },
    { d: 'Juin 2024', t: 'Claude 3.5 Sonnet',
      x: "Le modèle intermédiaire dépasse le modèle le plus puissant de la génération précédente. C'est le début d'un rythme de sorties beaucoup plus soutenu." },
    { d: 'Mai 2025', t: 'Claude 4',
      x: "Opus et Sonnet passent en quatrième génération. L'usage bascule progressivement du dialogue vers l'agent : le modèle ne répond plus seulement, il exécute." },
    { d: 'Février 2026', t: 'Claude Opus 4.6 et Sonnet 4.6',
      x: "La cadence s'accélère encore, avec des générations intermédiaires qui n'attendent plus le changement de numéro majeur." },
    { d: 'Avril 2026', t: 'Mythos',
      x: "Un modèle proposé séparément, en accès restreint, pour des travaux spécialisés. Le catalogue cesse d'être une simple échelle de puissance." }
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
