(function(){
  /* Copie dans le presse-papiers, avec repli pour les navigateurs sans API Clipboard */
  function copier(texte,btn,libelle){
    var done=function(){
      btn.textContent='Copié ✓'; btn.classList.add('ok');
      setTimeout(function(){btn.textContent=libelle;btn.classList.remove('ok')},1800);
    };
    if(navigator.clipboard) navigator.clipboard.writeText(texte).then(done,function(){});
    else{var i=document.createElement('textarea');i.value=texte;document.body.appendChild(i);i.select();document.execCommand('copy');i.remove();done()}
  }

  /* Un bouton « Copier ce prompt » sous chacun des exemples de l'article */
  document.querySelectorAll('.art-body pre.prompt').forEach(function(pre){
    var b=document.createElement('button');
    b.type='button'; b.className='btn-sm ghost';
    b.textContent='Copier ce prompt';
    b.addEventListener('click',function(){copier(pre.textContent.trim(),b,'Copier ce prompt')});
    pre.insertAdjacentElement('afterend',b);
  });

  /* ---------- Générateur S·M·T·F ---------- */
  var ids=['f-sit','f-mat','f-tache','f-livrable','f-long','f-interdits'];
  var out=document.getElementById('smtf-out');
  if(!out) return;
  var ton='professionnel et direct';

  /* Exemples de départ, repris des prompts de l'article */
  var EXEMPLES={
    relance:{
      sit:"Responsable commercial dans une PME de 40 personnes qui vend des logiciels aux collectivités. J'écris à un client silencieux depuis six semaines, alors que le devis était validé oralement.",
      mat:"Le devis validé (joint), les deux relances déjà envoyées (collées ci-dessous), trois e-mails que j'ai écrits pour le ton.",
      tache:"rédiger une relance de 8 lignes qui rappelle l'accord et propose deux créneaux d'appel",
      liv:"un e-mail", lg:"très court (moins de 100 mots)", ton:"professionnel et direct",
      no:"« je me permets de revenir vers vous », jargon, emojis"
    },
    cr:{
      sit:"Cheffe de projet dans une agence de communication. Réunion de lancement avec le client et deux collègues ce matin, le compte rendu part au client ce soir.",
      mat:"Mes notes brutes de la réunion (collées ci-dessous) et le compte rendu de la réunion précédente comme modèle de mise en forme.",
      tache:"transformer mes notes en compte rendu avec un tableau des actions (action, responsable, échéance)",
      liv:"un compte rendu", lg:"court (100 à 250 mots)", ton:"factuel, sans superlatif",
      no:"toute décision qui ne figure pas dans mes notes"
    },
    linkedin:{
      sit:"Consultant indépendant, j'écris pour des dirigeants de PME qui découvrent l'IA. Le post raconte une erreur commise cette semaine sur un projet et ce qu'elle m'a appris.",
      mat:"Le récit détaillé de la situation (ci-dessous) et deux de mes anciens posts pour le style.",
      tache:"rédiger un post LinkedIn de 1 200 caractères maximum, avec une première ligne qui donne envie de lire la suite",
      liv:"un post pour les réseaux sociaux", lg:"court (100 à 250 mots)", ton:"chaleureux",
      no:"emojis, hashtags en rafale, morale finale"
    },
    brief:{
      sit:"Je gère le blog d'une PME. L'article visera une requête précise et doit amener des demandes de devis.",
      mat:"La requête visée, les titres et intertitres des 5 premières pages Google, la liste de mes pages à lier.",
      tache:"rédiger le brief de l'article : intention de recherche, angle, plan H2/H3, questions à traiter",
      liv:"un plan détaillé", lg:"moyen (250 à 600 mots)", ton:"factuel, sans superlatif",
      no:"volumes de recherche inventés"
    },
    lettre:{
      sit:"Je postule à un poste de chargé de marketing après 5 ans en agence. Le recruteur lira la lettre en moins d'une minute.",
      mat:"L'annonce complète, mon CV et trois réalisations chiffrées (collés ci-dessous).",
      tache:"rédiger une lettre de motivation qui commence par leur besoin et donne deux preuves",
      liv:"une lettre", lg:"court (100 à 250 mots)", ton:"professionnel et direct",
      no:"« dynamique et motivé », formules toutes faites"
    }
  };

  function val(id){var e=document.getElementById(id);return e?e.value.trim():''}
  function setVal(id,v){var e=document.getElementById(id);if(e) e.value=v}

  function choisirTon(v){
    ton=v;
    var chips=document.getElementById('chips-ton');
    if(!chips) return;
    chips.querySelectorAll('.chip').forEach(function(c){c.classList.toggle('on',c.dataset.v===v)});
  }

  function build(){
    var s=val('f-sit'), m=val('f-mat'), t=val('f-tache'),
        liv=val('f-livrable'), lg=val('f-long'), no=val('f-interdits');

    var txt='SITUATION\n'+(s||'[à compléter : qui vous êtes, à qui vous parlez, pourquoi maintenant]')+
      '\n\nMATÉRIAUX\n'+(m||'[à compléter : documents joints, exemples de votre style, ce qui a déjà été tenté]')+
      '\n\nTÂCHE\n'+(t?t.charAt(0).toUpperCase()+t.slice(1):'[à compléter : un seul verbe d\'action]')+'.'+
      '\n\nFORMAT\n'+liv.charAt(0).toUpperCase()+liv.slice(1)+', '+lg+'. Ton '+ton+'.'+
      (no?' À éviter : '+no+'.':'')+
      '\n\nSi une information te manque pour bien faire, pose-moi la question avant de rédiger.';

    out.textContent=txt;

    // Score de complétude : les matériaux pèsent le plus lourd, c'est la brique la plus souvent oubliée
    var sc=0;
    if(s.length>40) sc+=25; else if(s) sc+=12;
    if(m.length>40) sc+=40; else if(m) sc+=20;
    if(t) sc+=20;
    if(liv&&lg) sc+=10;
    if(no) sc+=5;
    document.getElementById('smtf-score').textContent=sc;
    document.getElementById('smtf-meter').style.width=sc+'%';

    var enc=encodeURIComponent(txt);
    document.getElementById('smtf-gpt').href='https://chatgpt.com/?q='+enc;
    document.getElementById('smtf-claude').href='https://claude.ai/new?q='+enc;
  }

  ids.forEach(function(id){
    var e=document.getElementById(id);
    if(!e) return;
    e.addEventListener('input',build);
    e.addEventListener('change',build);
  });

  var ex=document.getElementById('f-exemple');
  if(ex) ex.addEventListener('change',function(){
    var d=EXEMPLES[ex.value];
    if(!d){
      ['f-sit','f-mat','f-tache'].forEach(function(id){setVal(id,'')});
    }else{
      setVal('f-sit',d.sit); setVal('f-mat',d.mat); setVal('f-tache',d.tache);
      setVal('f-livrable',d.liv); setVal('f-long',d.lg); setVal('f-interdits',d.no);
      choisirTon(d.ton);
    }
    build();
  });

  var chips=document.getElementById('chips-ton');
  if(chips) chips.addEventListener('click',function(e){
    var b=e.target.closest('.chip'); if(!b) return;
    choisirTon(b.dataset.v); build();
  });

  var copy=document.getElementById('smtf-copy');
  if(copy) copy.addEventListener('click',function(){copier(out.textContent,copy,'Copier le prompt')});

  build();
})();
