/* Générateur d'instructions pour un agent IA (article agent-ia).
   Assemble une fiche d'agent (mission, méthode, format, critère de réussite,
   règles) et conseille l'outil gratuit le plus adapté au déclencheur.
   100 % navigateur, aucun appel réseau. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var out = $('ag-out');
  if (!out) return;

  var etat = { declencheur: 'demande', niveau: 'sans' };

  var ACTIONS = {
    docs: { lib: 'lire les documents fournis', ecrit: false },
    web: { lib: 'chercher des informations sur le web', ecrit: false },
    mails: { lib: 'lire les e-mails ou formulaires reçus', ecrit: false },
    tableur: { lib: 'écrire dans un tableur ou une base', ecrit: true },
    brouillon: { lib: 'rédiger des brouillons de réponse', ecrit: false },
    envoi: { lib: 'envoyer des messages ou des e-mails', ecrit: true, irreversible: true },
    crm: { lib: 'modifier un CRM ou un logiciel métier', ecrit: true, irreversible: true }
  };

  var DECL = {
    demande: 'Tu travailles quand l\'utilisateur te le demande.',
    planifie: 'Tu es lancé automatiquement à heure fixe, sans personne pour te répondre : ne pose pas de question, signale ce qui manque à la fin de ton résultat.',
    evenement: 'Tu es lancé automatiquement à l\'arrivée d\'un e-mail ou d\'un formulaire, que tu reçois en entrée : traite uniquement cet élément.'
  };

  function val(id) { var el = $(id); return el ? el.value.trim() : ''; }

  function actionsCochees() {
    var l = [];
    document.querySelectorAll('#ag-actions input[type="checkbox"]').forEach(function (c) {
      if (c.checked && ACTIONS[c.value]) l.push(c.value);
    });
    return l;
  }

  function outilConseille(acts) {
    var auto = etat.declencheur !== 'demande';
    var ecrit = acts.some(function (a) { return ACTIONS[a].ecrit; });
    if (etat.niveau === 'code') {
      return 'Un programme écrit avec une bibliothèque d\'agents : Claude Agent SDK, OpenAI Agents SDK ou CrewAI. '
        + 'Les bibliothèques sont gratuites, les appels au modèle se paient à l\'usage.'
        + (auto ? ' Planifiez-le avec une tâche cron ou un workflow n8n.' : '');
    }
    if (auto || ecrit || acts.indexOf('mails') !== -1) {
      var t = 'Une plateforme d\'automatisation, car l\'agent doit '
        + (auto ? 'se déclencher seul' : 'agir dans vos outils') + ' :\n'
        + '  - Zapier Agents : 400 activités par mois en gratuit, le plus simple à prendre en main\n'
        + '  - Make : 1 000 crédits par mois en gratuit, Make AI Agents en bêta\n'
        + '  - n8n : gratuit en auto-hébergé (nœud AI Agent), le plus complet';
      if (etat.niveau === 'sans') t += '\nSans expérience du no-code, commencez par Zapier Agents ou Make.';
      return t;
    }
    return 'Un assistant, car l\'agent travaille à votre demande :\n'
      + '  - Gem dans Gemini (gratuit, création sur gemini.google.com)\n'
      + '  - Projet Claude (jusqu\'à 5 projets en formule gratuite)\n'
      + '  - Agent Copilot Chat si votre entreprise est sous Microsoft 365\n'
      + 'Collez la fiche dans le champ des instructions et ajoutez vos documents.';
  }

  function construire() {
    var nom = val('ag-nom') || '[nom de l\'agent]';
    var mission = val('ag-mission') || '[mission : le résultat attendu, et pour qui]';
    mission = mission.charAt(0).toUpperCase() + mission.slice(1);
    if (!/[.!?\]]$/.test(mission)) mission += '.';
    var sources = val('ag-sources');
    var format = val('ag-format') || '[format du résultat : longueur, structure]';
    var reussite = val('ag-reussite') || '[critère qui permet de vérifier que le travail est bon]';
    var interdits = val('ag-interdits');
    var acts = actionsCochees();

    var t = 'OUTIL CONSEILLÉ\n' + outilConseille(acts) + '\n\n';
    t += 'INSTRUCTIONS DE L\'AGENT (à coller dans le champ « Instructions »)\n\n';
    t += 'MISSION\nTu es ' + nom + '. ' + mission + '\n' + DECL[etat.declencheur] + '\n\n';

    t += 'MÉTHODE\n';
    var n = 1;
    if (sources) t += (n++) + '. Appuie-toi en priorité sur ces sources : ' + sources + '.\n';
    acts.forEach(function (a) {
      if (a === 'envoi' || a === 'crm') return;
      t += (n++) + '. Tu peux ' + ACTIONS[a].lib + '.\n';
    });
    t += (n++) + '. Avant de rendre ton résultat, vérifie-le contre le critère de réussite.\n';
    t += (n++) + '. Si une information manque ou reste incertaine, dis-le plutôt que de la supposer.\n\n';

    t += 'FORMAT\n' + format + '\n\n';
    t += 'CRITÈRE DE RÉUSSITE\n' + reussite + '\n\n';

    t += 'RÈGLES\n';
    if (interdits) t += '- Ne jamais : ' + interdits + '.\n';
    t += '- Cite la source de chaque information factuelle.\n';
    acts.forEach(function (a) {
      if (ACTIONS[a].irreversible) t += '- Tu prépares l\'action « ' + ACTIONS[a].lib + ' », mais tu attends une validation humaine avant de l\'exécuter.\n';
    });
    t += '- Reste dans ta mission : refuse poliment toute demande qui en sort.\n\n';

    t += 'GARDE-FOUS À METTRE EN PLACE\n';
    t += '- Tester sur 10 cas réels, dont les 3 plus difficiles, avant la mise en service\n';
    if (etat.declencheur !== 'demande') t += '- Limiter le nombre d\'étapes par exécution et prévoir une alerte en cas d\'échec\n';
    if (acts.some(function (a) { return ACTIONS[a].ecrit; })) t += '- Garder une trace de chaque action écrite ou envoyée\n';
    t += '- Relire les instructions après deux semaines d\'usage et ajouter les cas particuliers rencontrés';
    return t;
  }

  function completude() {
    var s = 0;
    if (val('ag-nom')) s += 10;
    if (val('ag-mission').length > 25) s += 30; else if (val('ag-mission')) s += 15;
    if (actionsCochees().length) s += 15;
    if (val('ag-sources')) s += 10;
    if (val('ag-format')) s += 15;
    if (val('ag-reussite')) s += 15;
    if (val('ag-interdits')) s += 5;
    return Math.min(100, s);
  }

  function palier(s) {
    if (s >= 85) return 'fiche complète';
    if (s >= 55) return 'presque complète';
    if (s >= 30) return 'à compléter';
    return 'de complétude de la fiche';
  }

  function render() {
    var txt = construire();
    out.textContent = txt;
    var s = completude();
    $('ag-score').textContent = s;
    $('ag-meter').style.width = s + '%';
    $('ag-label').textContent = palier(s);

    // Lien de test : la fiche est envoyée comme premier message, à la main de l'utilisateur
    var essai = 'Voici les instructions d\'un agent que je construis. Joue ce rôle pour un test : '
      + 'commence par me demander un cas réel à traiter.\n\n'
      + txt.split('INSTRUCTIONS DE L\'AGENT (à coller dans le champ « Instructions »)\n\n')[1].split('\n\nGARDE-FOUS')[0];
    var enc = encodeURIComponent(essai);
    var cl = $('ag-claude'), gp = $('ag-gpt');
    if (cl) cl.href = 'https://claude.ai/new?q=' + enc;
    if (gp) gp.href = 'https://chatgpt.com/?q=' + enc;
  }

  function brancherChips(id, cle) {
    var g = $(id);
    if (!g) return;
    g.addEventListener('click', function (e) {
      var b = e.target.closest('.chip');
      if (!b) return;
      g.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('on'); });
      b.classList.add('on');
      etat[cle] = b.dataset.v;
      render();
    });
  }
  brancherChips('ag-declencheur', 'declencheur');
  brancherChips('ag-niveau', 'niveau');

  ['ag-nom', 'ag-mission', 'ag-sources', 'ag-format', 'ag-reussite', 'ag-interdits'].forEach(function (id) {
    var el = $(id);
    if (el) el.addEventListener('input', render);
  });
  var acts = $('ag-actions');
  if (acts) acts.addEventListener('change', render);

  var copy = $('ag-copy');
  if (copy) copy.addEventListener('click', function () {
    var done = function () {
      copy.textContent = 'Copié ✓'; copy.classList.add('ok');
      setTimeout(function () { copy.textContent = 'Copier la fiche'; copy.classList.remove('ok'); }, 1800);
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
