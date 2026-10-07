/* Claude est-il fait pour vous ? Quatre questions, un avis et une formule.
   Tout se calcule dans le navigateur, aucun appel réseau.
   Tarifs relevés sur claude.com/pricing le 7 octobre 2026, en dollars hors taxes. */
(function(){
  var out = document.getElementById('plan-out');
  if(!out) return;

  var GROUPS = ['q-freq','q-task','q-doc','q-team'];
  var answers = { 'q-freq':0, 'q-task':0, 'q-doc':0, 'q-team':0 };

  /* Ce que vaut Claude selon l'usage principal (question 2). */
  var FIT = [
    "Bon choix : la rédaction, en français notamment, est son point fort.",
    "Très bon choix : l'analyse de documents longs est l'usage où il fait gagner le plus de temps.",
    "Très bon choix : Claude Code est inclus dans toutes les formules payantes (pas dans la gratuite).",
    "Claude n'est pas le bon outil principal : il ne génère ni photo ni illustration. Gardez-le pour le texte qui accompagne vos visuels, et prenez un outil d'image à côté."
  ];

  var PLANS = {
    free: {
      name: 'Free',
      price: ', 0 $ par mois',
      fill: 25,
      why: "Votre usage tient dans la version gratuite : chat, recherche web, analyse de fichiers et mémoire y sont inclus, avec les modèles Sonnet et Haiku. La limite se recharge toutes les cinq heures.",
      next: "Repassez ce test dans un mois si vous butez sur la limite plus d'une fois par semaine."
    },
    pro: {
      name: 'Pro',
      price: ', 17 $ par mois en annuel ou 20 $ au mois',
      fill: 55,
      why: "C'est la formule qui correspond à votre usage. Elle donne au moins cinq fois l'usage du gratuit par session, ajoute le modèle Opus, Claude Code et les tâches confiées de bout en bout.",
      next: "L'annuel se paie 200 $ d'avance. Commencez au mois si vous n'êtes pas encore sûr de votre usage."
    },
    max: {
      name: 'Max',
      price: ', 100 $ (5x) ou 200 $ (20x) par mois',
      fill: 85,
      why: "Votre volume dépasse ce que Pro absorbe confortablement. Max donne cinq ou vingt fois l'usage de Pro, un accès prioritaire aux heures chargées et le modèle Fable inclus.",
      next: "Testez d'abord un mois de Pro : si vous touchez la limite toutes les semaines, le passage à Max 5x se justifie."
    },
    team: {
      name: 'Team',
      price: ', 20 $ par siège et par mois en annuel (25 $ au mois)',
      fill: 100,
      why: "À plusieurs, Team apporte la facturation centralisée, l'authentification unique et des contenus qui ne servent pas à l'entraînement par défaut. Les sièges Premium (100 $ en annuel) donnent cinq fois plus d'usage aux plus gros utilisateurs.",
      next: "Démarrez sur les personnes réellement actives plutôt que sur toute l'équipe d'un coup."
    }
  };

  function pick(){
    var freq = answers['q-freq'], task = answers['q-task'],
        doc  = answers['q-doc'],  team = answers['q-team'];

    if(team === 2) return 'team';
    if(task === 3) return 'free';

    // Charge de travail : fréquence + volume de fichiers, plus un point si l'usage
    // est le code, puisque Claude Code n'est pas accessible en version gratuite.
    var load = freq + doc + (task === 2 ? 1 : 0);

    if(load >= 4) return 'max';
    if(load >= 1 || team === 1) return 'pro';
    return 'free';
  }

  function render(){
    var key = pick();
    var p = PLANS[key];
    var txt = 'Claude pour vous : ' + FIT[answers['q-task']] +
      '\n\nFormule conseillée : ' + p.name + p.price + '\n' + p.why + '\n\n' + p.next;
    if(answers['q-team'] === 1 && key === 'pro'){
      txt += "\n\nÀ deux à quatre, un Pro chacun suffit souvent. Team (dès 2 sièges) se justifie si vous voulez une facture unique et des contenus exclus de l'entraînement par défaut.";
    }
    out.textContent = txt;
    document.getElementById('plan-name').textContent = p.name;
    document.getElementById('plan-price').textContent = p.price;
    document.getElementById('plan-meter').style.width = p.fill + '%';
  }

  GROUPS.forEach(function(gid){
    var g = document.getElementById(gid);
    if(!g) return;
    g.addEventListener('click', function(e){
      var b = e.target.closest('.chip');
      if(!b) return;
      g.querySelectorAll('.chip').forEach(function(c){ c.classList.remove('on'); });
      b.classList.add('on');
      answers[gid] = parseInt(b.dataset.v, 10) || 0;
      render();
    });
  });

  var copy = document.getElementById('plan-copy');
  if(copy) copy.addEventListener('click', function(){
    var done = function(){
      copy.textContent = 'Copié ✓'; copy.classList.add('ok');
      setTimeout(function(){
        copy.textContent = 'Copier la recommandation';
        copy.classList.remove('ok');
      }, 1800);
    };
    if(navigator.clipboard) navigator.clipboard.writeText(out.textContent).then(done, function(){});
    else {
      var i = document.createElement('textarea');
      i.value = out.textContent; document.body.appendChild(i);
      i.select(); document.execCommand('copy'); i.remove(); done();
    }
  });

  render();
})();
