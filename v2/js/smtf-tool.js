(function(){
  var ids=['f-sit','f-mat','f-tache','f-livrable','f-long','f-interdits'];
  var out=document.getElementById('smtf-out');
  if(!out) return;
  var ton='professionnel et direct';

  function val(id){var e=document.getElementById(id);return e?e.value.trim():''}

  function build(){
    var s=val('f-sit'), m=val('f-mat'), t=val('f-tache'),
        liv=val('f-livrable'), lg=val('f-long'), no=val('f-interdits');

    var txt='CONTEXTE\n'+(s||'[à compléter : qui vous êtes, à qui vous parlez, pourquoi maintenant]')+
      '\n\nMATÉRIAUX\n'+(m||'[à compléter : documents joints, exemples de votre style, ce qui a déjà été tenté]')+
      '\n\nTÂCHE\n'+(t?t.charAt(0).toUpperCase()+t.slice(1):'[à compléter : un seul verbe d\'action]')+'.'+
      '\n\nFORMAT\n'+liv.charAt(0).toUpperCase()+liv.slice(1)+', '+lg+'. Ton '+ton+'.'+
      (no?' À éviter : '+no+'.':'')+
      '\n\nSi une information te manque pour bien faire, pose-moi la question avant de rédiger.';

    out.textContent=txt;

    // Score de complétude : les matériaux pèsent le plus lourd, c'est le propos de l'article
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
    if(e) e.addEventListener('input',build);
  });

  var chips=document.getElementById('chips-ton');
  if(chips) chips.addEventListener('click',function(e){
    var b=e.target.closest('.chip'); if(!b) return;
    chips.querySelectorAll('.chip').forEach(function(c){c.classList.remove('on')});
    b.classList.add('on'); ton=b.dataset.v; build();
  });

  var copy=document.getElementById('smtf-copy');
  if(copy) copy.addEventListener('click',function(){
    var done=function(){
      copy.textContent='Copié ✓'; copy.classList.add('ok');
      setTimeout(function(){copy.textContent='Copier le contexte';copy.classList.remove('ok')},1800);
    };
    if(navigator.clipboard) navigator.clipboard.writeText(out.textContent).then(done,function(){});
    else{var i=document.createElement('textarea');i.value=out.textContent;document.body.appendChild(i);i.select();document.execCommand('copy');i.remove();done()}
  });

  build();
})();
