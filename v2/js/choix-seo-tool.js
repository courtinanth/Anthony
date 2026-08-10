/* Consultant, agence ou recrutement : quatre questions, une recommandation
   argumentée. Tout se calcule dans le navigateur, rien n'est envoyé. */
(function () {
  var out = document.getElementById('cs-out');
  if (!out) return;

  var rep = { 'cs-besoin': 0, 'cs-budget': 0, 'cs-equipe': 0, 'cs-horizon': 0 };

  var OPTIONS = {
    audit: {
      nom: 'Un audit ponctuel',
      sub: ", avant de vous engager plus loin",
      fill: '25%',
      pourquoi: "Votre besoin est d'abord de comprendre ce qui bloque, et votre budget ne "
        + "justifie pas encore un accompagnement mensuel. Un audit vous donne un diagnostic "
        + "et un plan d'action que vous pourrez appliquer vous-même ou faire appliquer.",
      ensuite: "Comptez 1 500 à 5 000 € selon la taille du site. Exigez un plan d'action "
        + "priorisé par impact, pas une liste de problèmes."
    },
    conseil: {
      nom: 'Un consultant indépendant',
      sub: ", en accompagnement mensuel",
      fill: '50%',
      pourquoi: "Votre budget et votre horizon justifient un suivi régulier, mais votre volume "
        + "ne demande pas la force de frappe d'une agence. L'avantage décisif : vous parlez "
        + "directement à la personne qui travaille sur votre dossier.",
      ensuite: "Comptez 800 à 3 000 € par mois. Demandez systématiquement le nombre de jours "
        + "réellement consacrés à votre dossier chaque mois."
    },
    agence: {
      nom: 'Une agence',
      sub: ", pour le volume de production",
      fill: '75%',
      pourquoi: "Votre besoin porte sur la production régulière de contenus et votre budget "
        + "permet de mobiliser plusieurs compétences. C'est le cas où une agence apporte "
        + "vraiment quelque chose qu'un indépendant seul ne peut pas fournir.",
      ensuite: "Comptez 1 500 à 8 000 € par mois. Vérifiez qui travaillera réellement sur "
        + "votre dossier au quotidien, et pas seulement qui vous a reçu en rendez-vous."
    },
    recrutement: {
      nom: 'Un recrutement',
      sub: ", le sujet est stratégique chez vous",
      fill: '100%',
      pourquoi: "Le référencement est un enjeu permanent, votre budget dépasse le coût d'un "
        + "poste, et vous avez déjà une équipe pour l'encadrer. Internaliser donne une "
        + "connaissance de votre métier qu'aucun prestataire n'aura.",
      ensuite: "Comptez à partir de 45 000 € par an chargé. Faites auditer votre site par un "
        + "externe avant de recruter : vous saurez quel profil chercher."
    }
  };

  function choisir() {
    var b = rep['cs-besoin'], bu = rep['cs-budget'],
        eq = rep['cs-equipe'], h = rep['cs-horizon'];

    // Un besoin ponctuel ou un budget serré : l'audit d'abord, toujours.
    if (h === 0 || bu === 0) return 'audit';

    // Enjeu permanent, gros budget et une équipe pour encadrer : internaliser.
    if (h === 2 && bu === 2 && eq === 2) return 'recrutement';

    // Besoin de volume de production avec les moyens correspondants.
    if (b === 1 && bu === 2) return 'agence';

    return 'conseil';
  }

  function render() {
    var o = OPTIONS[choisir()];
    document.getElementById('cs-reco').textContent = o.nom;
    document.getElementById('cs-sub').textContent = o.sub;
    document.getElementById('cs-meter').style.width = o.fill;

    out.textContent = 'Ma recommandation : ' + o.nom + '\n\n'
      + o.pourquoi + '\n\n' + o.ensuite + '\n\n'
      + "Dans tous les cas, posez ces cinq questions avant de signer :\n"
      + "  1. Montrez-moi un cas client avec les chiffres, la période et le contexte.\n"
      + "  2. Que ferez-vous les trente premiers jours ?\n"
      + "  3. Qu'est-ce que vous ne ferez pas ?\n"
      + "  4. Comment mesurerez-vous le résultat ?\n"
      + "  5. Que se passe-t-il si j'arrête ?";
  }

  Object.keys(rep).forEach(function (id) {
    var g = document.getElementById(id);
    if (!g) return;
    g.addEventListener('click', function (e) {
      var b = e.target.closest('.chip');
      if (!b) return;
      g.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('on'); });
      b.classList.add('on');
      rep[id] = parseInt(b.dataset.v, 10) || 0;
      render();
    });
  });

  var copy = document.getElementById('cs-copy');
  if (copy) copy.addEventListener('click', function () {
    var done = function () {
      copy.textContent = 'Copié ✓'; copy.classList.add('ok');
      setTimeout(function () { copy.textContent = 'Copier la recommandation'; copy.classList.remove('ok'); }, 1800);
    };
    if (navigator.clipboard) navigator.clipboard.writeText(out.textContent).then(done, function () {});
    else {
      var i = document.createElement('textarea');
      i.value = out.textContent; document.body.appendChild(i);
      i.select(); document.execCommand('copy'); i.remove(); done();
    }
  });

  render();
})();
