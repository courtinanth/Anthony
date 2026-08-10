/* Sélecteur de plan Claude : 4 questions, une recommandation.
   Tout se calcule dans le navigateur, aucun appel réseau.
   Tarifs relevés sur claude.com en août 2026. */
(function(){
  var out = document.getElementById('plan-out');
  if(!out) return;

  var GROUPS = ['q-freq','q-task','q-doc','q-team'];
  var answers = { 'q-freq':0, 'q-task':0, 'q-doc':0, 'q-team':0 };

  var PLANS = {
    free: {
      name: 'Free',
      price: ', 0 $ par mois',
      fill: 25,
      why: "Votre usage tient largement dans le plan gratuit. Le chat, la recherche web et l'analyse de fichiers y sont déjà inclus : commencez par là, vous verrez bien si vous butez sur les quotas.",
      next: "Repassez ce test dans un mois si vous atteignez régulièrement la limite."
    },
    pro: {
      name: 'Pro',
      price: ', 17 $ par mois en annuel',
      fill: 55,
      why: "C'est le plan qui correspond à votre usage. Il lève l'essentiel des limites du gratuit et débloque Claude Code et Claude Cowork, les deux outils qui font vraiment gagner du temps.",
      next: "Comptez 200 $ facturés d'avance en annuel, ou 20 $ par mois sans engagement."
    },
    max: {
      name: 'Max',
      price: ', à partir de 100 $ par mois',
      fill: 85,
      why: "Votre volume dépasse ce que le plan Pro absorbe confortablement. Max offre cinq à vingt fois l'usage du Pro et un accès prioritaire aux heures chargées.",
      next: "Testez d'abord un mois de Pro : si vous touchez les limites toutes les semaines, le passage à Max se justifie."
    },
    team: {
      name: 'Team',
      price: ', 20 $ par siège et par mois en annuel',
      fill: 100,
      why: "À plusieurs, le plan Team apporte la facturation centralisée, l'authentification unique et la garantie que votre contenu ne sert pas à entraîner les modèles.",
      next: "Démarrez sur deux ou trois sièges réellement actifs plutôt que sur toute l'équipe d'un coup."
    }
  };

  function pick(){
    var freq = answers['q-freq'], task = answers['q-task'],
        doc  = answers['q-doc'],  team = answers['q-team'];

    if(team === 2) return 'team';

    // Charge de travail : fréquence + volume de fichiers, plus un point si l'usage
    // est le code, puisque Claude Code n'est pas accessible au plan gratuit.
    var load = freq + doc + (task === 2 ? 1 : 0);

    if(load >= 4) return 'max';
    if(load >= 1 || team === 1) return 'pro';
    return 'free';
  }

  function render(){
    var p = PLANS[pick()];
    out.textContent = 'Plan recommandé : ' + p.name + '\n\n' + p.why + '\n\n' + p.next;
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
