/* Générateur de prompts pour le MCP Screaming Frog, article /blog/screaming-frog-mcp
   Tout se passe dans le navigateur : aucun appel réseau, aucune donnée qui sort. */
(function () {
  var out = document.getElementById('sf-out');
  if (!out) return;

  var perimetre = 'tout le site';
  var options = { fichier: true };

  function val(id) { var e = document.getElementById(id); return e ? e.value.trim() : ''; }

  var DEPART = {
    new: function (site, per) {
      return 'Lance un nouveau crawl de ' + site + ' avec Screaming Frog, sur ' + per +
        ', et préviens-moi quand il est terminé.';
    },
    last: function (site) {
      return 'Liste les crawls Screaming Frog récents, puis charge le dernier crawl de ' + site + '.';
    },
    compare: function (site) {
      return 'Liste les crawls Screaming Frog récents, puis charge les deux derniers crawls de ' +
        site + ' pour les comparer.';
    }
  };

  var OBJECTIF = {
    issues: "Ouvre le rapport de synthèse des problèmes (Issues Overview) et classe-les par priorité réelle, pas par ordre alphabétique.",
    broken: "Exporte tous les codes de réponse non-200 (4xx et 5xx) avec leurs liens entrants, pour savoir depuis quelles pages ils sont appelés.",
    maillage: "Exporte l'onglet Internal, filtre HTML, avec les champs Address et Unique Inlinks, puis sors le haut et le bas du classement : les pages les mieux maillées et celles qui ne reçoivent presque aucun lien.",
    images: "Exporte l'onglet Images avec le poids de chaque fichier et isole tout ce qui dépasse 100 ko, en indiquant sur quelles pages ces images sont appelées.",
    redirects: "Génère le rapport des chaînes de redirection et signale celles dont l'URL finale n'est pas indexable.",
    titles: "Exporte les balises title et les méta-descriptions manquantes, dupliquées ou hors longueur, avec l'URL concernée.",
    indexabilite: "Exporte les URLs non indexables de l'onglet Internal avec le motif d'exclusion (noindex, canonical, robots.txt)."
  };

  var LIVRABLE = {
    chat: "Réponds directement dans la conversation, en allant à l'essentiel.",
    csv: "Écris le résultat dans un fichier CSV et donne-moi son chemin.",
    html: "Génère une page HTML lisible à partir des données, puis ouvre-la dans le navigateur.",
    table: "Présente le résultat sous forme de tableau, une ligne par URL."
  };

  var OPTIONS = {
    gsc: "Croise avec les colonnes Search Console du crawl (clics, impressions) pour prioriser ce qui coûte réellement du trafic.",
    node: "Si un export est trop gros pour être lu directement, écris un script Node.js pour le traiter plutôt que de tout charger dans la conversation.",
    fichier: "Passe par un fichier pour tout export volumineux, et ne me remonte que la synthèse.",
    actions: "Termine par un plan d'action classé par impact : quoi corriger, où, et pourquoi ça compte."
  };

  function build() {
    var site = val('f-site') || 'exemple.fr';
    var source = val('f-source') || 'new';
    var obj = val('f-obj') || 'issues';
    var liv = val('f-livrable') || 'chat';

    var lignes = [];
    lignes.push(DEPART[source](site, perimetre));
    lignes.push(OBJECTIF[obj]);
    lignes.push(LIVRABLE[liv]);

    var extra = [];
    ['gsc', 'node', 'fichier', 'actions'].forEach(function (k) {
      if (options[k]) extra.push(OPTIONS[k]);
    });

    var txt = 'Tu as accès à Screaming Frog via son serveur MCP.\n\n';
    lignes.forEach(function (l, i) { txt += (i + 1) + '. ' + l + '\n'; });

    if (extra.length) {
      txt += '\nConsignes :\n';
      extra.forEach(function (l) { txt += '- ' + l + '\n'; });
    }

    if (source !== 'new') {
      txt += "\nSi le crawl n'apparaît pas dans la liste, dis-le-moi : il est probablement encore ouvert dans l'interface de Screaming Frog.";
    }

    out.textContent = txt;
    document.getElementById('sf-claude').href = 'https://claude.ai/new?q=' + encodeURIComponent(txt);
  }

  ['f-site', 'f-source', 'f-obj', 'f-livrable'].forEach(function (id) {
    var e = document.getElementById(id);
    if (!e) return;
    e.addEventListener('input', build);
    e.addEventListener('change', build);
  });

  /* Périmètre : un seul choix actif à la fois. */
  var boxPer = document.getElementById('chips-perimetre');
  if (boxPer) {
    boxPer.addEventListener('click', function (e) {
      var c = e.target.closest('.chip');
      if (!c) return;
      boxPer.querySelectorAll('.chip').forEach(function (x) { x.classList.remove('on'); });
      c.classList.add('on');
      perimetre = c.dataset.v;
      build();
    });
  }

  /* Options : cumulables. */
  var boxOpt = document.getElementById('chips-options');
  if (boxOpt) {
    boxOpt.addEventListener('click', function (e) {
      var c = e.target.closest('.chip');
      if (!c) return;
      c.classList.toggle('on');
      options[c.dataset.v] = c.classList.contains('on');
      build();
    });
  }

  var copie = document.getElementById('sf-copy');
  if (copie) {
    copie.addEventListener('click', function () {
      var txt = out.textContent;
      var fait = function () {
        copie.classList.add('ok');
        copie.textContent = 'Copié';
        setTimeout(function () { copie.classList.remove('ok'); copie.textContent = 'Copier le prompt'; }, 1800);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(txt).then(fait, function () {});
      else {
        var t = document.createElement('textarea');
        t.value = txt; document.body.appendChild(t); t.select();
        document.execCommand('copy'); t.remove(); fait();
      }
    });
  }

  build();
})();
