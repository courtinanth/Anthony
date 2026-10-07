/* Google sans Aperçu IA : lien direct (paramètre udm=14) et réglage du moteur
   par défaut, navigateur par navigateur. Article ai-overview-france.
   100 % navigateur : l'outil ne fait aucun appel réseau, il prépare un lien
   que le lecteur ouvre lui-même. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var q = $('ao-q'), out = $('ao-out'), go = $('ao-go'),
      copy = $('ao-copy'), copyAll = $('ao-copy-all'), chips = $('ao-nav');
  if (!q || !out) return;

  var MOTEUR = 'https://www.google.com/search?udm=14&q=%s';
  var nav = 'chrome';

  var REGLAGES = {
    chrome: {
      nom: 'Google Chrome (ordinateur)',
      moteur: true,
      etapes: [
        'Ouvrez les Paramètres de Chrome, rubrique Moteur de recherche.',
        'Cliquez sur « Gérer les moteurs de recherche et la recherche sur le site ».',
        'Dans la partie « Recherche sur le site », cliquez sur Ajouter.',
        'Nom : Google Web. Raccourci : gw. URL : collez l\'adresse ci-dessus.',
        'Ouvrez le menu (trois points) de la ligne Google Web et définissez-le par défaut.'
      ],
      note: 'Même manipulation sur Brave et Vivaldi.'
    },
    edge: {
      nom: 'Microsoft Edge (ordinateur)',
      moteur: true,
      etapes: [
        'Ouvrez Paramètres, puis Confidentialité, recherche et services.',
        'Ouvrez Barre d\'adresse et recherche (sous « Recherche et expériences connectées » selon la version).',
        'Cliquez sur Gérer les moteurs de recherche, puis sur Ajouter.',
        'Nom : Google Web. Raccourci : gw. URL : collez l\'adresse ci-dessus.',
        'Dans le menu de la ligne Google Web, choisissez de le définir par défaut.'
      ],
      note: ''
    },
    firefox: {
      nom: 'Firefox (ordinateur)',
      moteur: true,
      etapes: [
        'Ouvrez Paramètres, puis Recherche.',
        'Dans « Raccourcis de recherche », cliquez sur Ajouter.',
        'Nom : Google Web. URL : collez l\'adresse ci-dessus. Mot-clé : @gw.',
        'En haut de la page, choisissez Google Web comme moteur par défaut.'
      ],
      note: 'Autre option : le module gratuit udm14 dans le catalogue des extensions de Firefox.'
    },
    safari: {
      nom: 'Safari (Mac)',
      moteur: false,
      etapes: [
        'Safari ne permet pas d\'ajouter un moteur personnalisé.',
        'Installez l\'extension gratuite « udm14 for Safari » depuis l\'App Store.',
        'Ouvrez Safari, Réglages, Extensions, et cochez udm14.',
        'Autorisez l\'extension sur google.com.'
      ],
      note: 'Chaque recherche Google s\'ouvre alors en affichage Web, sans Aperçu IA.'
    },
    iphone: {
      nom: 'iPhone et iPad',
      moteur: false,
      etapes: [
        'Installez « udm14 for Safari » depuis l\'App Store (gratuite).',
        'Ouvrez Réglages, Safari, Extensions (Réglages, Apps, Safari sur iOS 18 et suivants).',
        'Activez udm14 et autorisez-la sur google.com.',
        'Dans Chrome ou l\'application Google sur iPhone : touchez l\'onglet Web après chaque recherche.'
      ],
      note: ''
    },
    android: {
      nom: 'Android',
      moteur: false,
      etapes: [
        'Chrome pour Android ne permet pas de saisir l\'adresse d\'un moteur personnalisé.',
        'Option durable : installez Firefox pour Android, puis le module gratuit udm14.',
        'Option rapide : dans Chrome, touchez l\'onglet Web après chaque recherche.',
        'L\'application Google ne propose aucune option pour retirer l\'Aperçu IA.'
      ],
      note: ''
    }
  };

  function lien() {
    var v = q.value.trim();
    return v ? 'https://www.google.com/search?udm=14&q=' + encodeURIComponent(v).replace(/%20/g, '+') : '';
  }

  function texte() {
    var r = REGLAGES[nav];
    var t = 'Google sans Aperçu IA : ' + r.nom + '\n\n';
    if (r.moteur) t += 'Adresse du moteur à coller :\n' + MOTEUR + '\n\n';
    t += 'Étapes :\n';
    r.etapes.forEach(function (e, i) { t += (i + 1) + '. ' + e + '\n'; });
    if (r.note) t += '\n' + r.note + '\n';
    var l = lien();
    t += '\nLien direct pour votre recherche :\n'
      + (l || '(saisissez une recherche plus haut pour obtenir le lien)') + '\n';
    t += '\nSource : anthony-courtin.com/blog/ai-overview-france';
    return t;
  }

  function render() {
    out.textContent = texte();
    var l = lien();
    if (go) {
      if (l) {
        go.href = l;
        go.removeAttribute('aria-disabled');
        go.style.opacity = '';
      } else {
        go.href = '#outil-aio';
        go.setAttribute('aria-disabled', 'true');
        go.style.opacity = '.55';
      }
    }
    if (copy) copy.style.display = REGLAGES[nav].moteur ? '' : 'none';
  }

  function copier(btn, valeur, libelle) {
    var fini = function () {
      btn.textContent = 'Copié ✓'; btn.classList.add('ok');
      setTimeout(function () { btn.textContent = libelle; btn.classList.remove('ok'); }, 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(valeur).then(fini, function () {});
    } else {
      var a = document.createElement('textarea');
      a.value = valeur; document.body.appendChild(a);
      a.select(); document.execCommand('copy'); a.remove(); fini();
    }
  }

  q.addEventListener('input', render);
  q.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && lien()) { e.preventDefault(); window.open(lien(), '_blank', 'noopener'); }
  });

  if (chips) chips.addEventListener('click', function (e) {
    var b = e.target.closest('.chip'); if (!b) return;
    chips.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('on'); });
    b.classList.add('on'); nav = b.dataset.v; render();
  });

  if (go) go.addEventListener('click', function (e) {
    if (!lien()) { e.preventDefault(); q.focus(); }
  });
  if (copy) copy.addEventListener('click', function () { copier(copy, MOTEUR, 'Copier l\'adresse du moteur'); });
  if (copyAll) copyAll.addEventListener('click', function () { copier(copyAll, texte(), 'Copier le réglage'); });

  render();
})();
