/* Sélecteur de pipeline SEO automatisé.
   Article automatiser-seo-claude-code. 100 % navigateur, aucun appel réseau. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var tache = $('asc-tache'), freq = $('asc-freq'),
      gain = $('asc-gain'), meter = $('asc-meter'), out = $('asc-out'), copy = $('asc-copy');
  if (!tache || !out) return;

  var PIPELINES = {
    balises: {
      nom: 'Contrôle et correction des balises',
      minutes: 90,
      branches: ['Accès aux fichiers du site', 'Crawler'],
      etapes: [
        "Crawler le site et exporter les balises title et meta description",
        "Repérer les doublons, les absences et les longueurs hors limites",
        "Proposer une réécriture pour chaque page fautive, avec le compte de caractères",
        "Appliquer les corrections dans les fichiers, une page par modification",
        "Relancer le crawl sur les pages touchées pour vérifier"
      ],
      garde: "Faites relire les réécritures avant de pousser : une balise est ce que voit le visiteur dans les résultats."
    },
    maillage: {
      nom: 'Audit et renforcement du maillage interne',
      minutes: 150,
      branches: ['Accès aux fichiers du site', 'Crawler'],
      etapes: [
        "Extraire la liste des URL avec leur sujet et leurs liens entrants",
        "Identifier les pages orphelines et les pages trop profondes",
        "Proposer trois liens entrants pertinents par page prioritaire, avec l'ancre",
        "Insérer les liens dans les contenus existants aux endroits qui font sens",
        "Vérifier qu'aucun lien cassé n'a été introduit"
      ],
      garde: "Refusez les ancres génériques. Une ancre qui ne décrit pas la cible ne sert ni le lecteur ni le moteur."
    },
    donnees: {
      nom: 'Génération des données structurées',
      minutes: 120,
      branches: ['Accès aux fichiers du site'],
      etapes: [
        "Lister les pages et leur type : article, produit, service, page locale",
        "Extraire de chaque page les informations nécessaires au balisage",
        "Générer le JSON-LD correspondant, sans inventer une donnée absente de la page",
        "Insérer le balisage dans chaque fichier",
        "Valider la syntaxe et contrôler la cohérence avec le contenu visible"
      ],
      garde: "Le balisage doit refléter ce qui est visible sur la page. Une donnée structurée qui affirme plus que le contenu est un risque."
    },
    redirections: {
      nom: 'Plan de redirections pour une migration',
      minutes: 240,
      branches: ['Accès aux fichiers du site', 'Search Console'],
      etapes: [
        "Récupérer la liste complète des anciennes URL avec leur trafic",
        "Rapprocher chaque ancienne adresse de son équivalent le plus proche",
        "Signaler les URL sans correspondance évidente pour arbitrage humain",
        "Générer le fichier de redirections, une seule redirection par adresse",
        "Contrôler l'absence de chaîne et de boucle"
      ],
      garde: "N'acceptez aucune règle globale qui envoie un dossier entier vers une page de catégorie : c'est la valeur accumulée qui part."
    },
    veille: {
      nom: 'Rapport de suivi des positions',
      minutes: 60,
      branches: ['Search Console'],
      etapes: [
        "Récupérer les données de la période et de la période précédente",
        "Calculer les écarts par page et par requête",
        "Isoler les décrochages significatifs et les progressions",
        "Croiser avec les modifications faites entre les deux périodes",
        "Rédiger la synthèse avec les trois actions à prendre"
      ],
      garde: "Une variation sur une seule semaine ne veut rien dire. Comparez des périodes d'au moins 28 jours."
    },
    contenu: {
      nom: 'Contrôle avant publication',
      minutes: 45,
      branches: ['Accès aux fichiers du site'],
      etapes: [
        "Vérifier la longueur du title et de la meta description",
        "Contrôler la hiérarchie des titres et la présence d'un H1 unique",
        "Vérifier que les liens internes pointent vers des pages existantes",
        "Contrôler la présence des attributs alt sur les images",
        "Signaler les affirmations sans source et les répétitions"
      ],
      garde: "Ce contrôle remplace une relecture technique, pas une relecture éditoriale."
    }
  };

  function calcul() {
    var p = PIPELINES[tache.value] || PIPELINES.balises;
    var f = parseInt(freq.value, 10) || 1;
    var heures = Math.round((p.minutes * f) / 60);

    gain.textContent = heures + ' h par an';
    if (meter) meter.style.width = Math.min(100, Math.round((heures / 60) * 100)) + '%';

    out.textContent = '';

    var b = document.createElement('p');
    var bs = document.createElement('strong'); bs.textContent = 'À brancher : ';
    b.appendChild(bs);
    b.appendChild(document.createTextNode(p.branches.join(', ') + '.'));
    out.appendChild(b);

    var h = document.createElement('p');
    var hs = document.createElement('strong'); hs.textContent = 'Enchaînement';
    h.appendChild(hs);
    out.appendChild(h);

    var ol = document.createElement('ol');
    p.etapes.forEach(function (e) { var li = document.createElement('li'); li.textContent = e; ol.appendChild(li); });
    out.appendChild(ol);

    var g = document.createElement('p');
    var gs = document.createElement('strong'); gs.textContent = 'Garde-fou : ';
    g.appendChild(gs);
    g.appendChild(document.createTextNode(p.garde));
    out.appendChild(g);

    return { p: p, f: f, heures: heures };
  }

  function copier() {
    var r = calcul();
    var texte = ['Pipeline : ' + r.p.nom,
      'Fréquence : ' + freq.options[freq.selectedIndex].text.toLowerCase(),
      'Temps manuel évité : environ ' + r.heures + ' heures par an', '',
      'À brancher : ' + r.p.branches.join(', '), '', 'Enchaînement :']
      .concat(r.p.etapes.map(function (e, i) { return (i + 1) + '. ' + e; }))
      .concat(['', 'Garde-fou : ' + r.p.garde, '',
        'Source : anthony-courtin.com/blog/automatiser-seo-claude-code']).join('\n');
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

  [tache, freq].forEach(function (el) { el.addEventListener('change', calcul); });
  if (copy) copy.addEventListener('click', copier);
  calcul();
})();
