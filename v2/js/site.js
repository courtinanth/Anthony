/* anthony-courtin.com v2 : interactions partagées */
(function(){
  'use strict';
  var reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Barre de progression de scroll */
  var bar=document.getElementById('progress');
  if(bar){
    addEventListener('scroll',function(){
      var h=document.documentElement;
      bar.style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%';
    },{passive:true});
  }

  /* Mega menu : clic + fermeture extérieure */
  var items=[].slice.call(document.querySelectorAll('[data-mega]'));
  items.forEach(function(it){
    var btn=it.querySelector('button');
    if(!btn) return;
    btn.addEventListener('click',function(e){
      e.stopPropagation();
      var was=it.classList.contains('open');
      items.forEach(function(o){o.classList.remove('open')});
      if(!was) it.classList.add('open');
    });
  });
  document.addEventListener('click',function(){items.forEach(function(o){o.classList.remove('open')})});

  /* Menu mobile */
  var burger=document.getElementById('burger'), mob=document.getElementById('mobileMenu');
  if(burger&&mob){
    burger.addEventListener('click',function(e){e.stopPropagation();mob.classList.toggle('open')});
    document.addEventListener('click',function(){mob.classList.remove('open')});
  }

  /* Rotation des mots du hero */
  var swaps=[].slice.call(document.querySelectorAll('.hero .swap'));
  if(swaps.length&&!reduced){
    var si=0;
    setInterval(function(){
      swaps[si].classList.remove('on');swaps[si].classList.add('out');
      var prev=si; si=(si+1)%swaps.length;
      swaps[si].classList.remove('out');
      requestAnimationFrame(function(){requestAnimationFrame(function(){swaps[si].classList.add('on')})});
      setTimeout(function(){swaps[prev].classList.remove('out')},600);
    },2600);
  }

  /* Reveal au scroll */
  var els=document.querySelectorAll('.rv');
  if(!('IntersectionObserver' in window)){
    els.forEach?els.forEach(function(e){e.classList.add('in')}):null;
  }else{
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}});
    },{threshold:.15,rootMargin:'0px 0px -40px 0px'});
    [].forEach.call(els,function(e){io.observe(e)});
  }

  /* Compteurs animés */
  var nums=document.querySelectorAll('[data-count]');
  if(nums.length&&!reduced&&'IntersectionObserver' in window){
    var io2=new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(!en.isIntersecting) return;
        var el=en.target,target=+el.getAttribute('data-count'),
            pre=el.getAttribute('data-prefix')||'',suf=el.getAttribute('data-suffix')||'',
            t0=performance.now(),dur=1400;
        (function tick(t){
          var p=Math.min((t-t0)/dur,1),ease=1-Math.pow(1-p,3);
          el.textContent=pre+Math.round(target*ease)+suf;
          if(p<1) requestAnimationFrame(tick);
        })(t0);
        io2.unobserve(el);
      });
    },{threshold:.5});
    [].forEach.call(nums,function(n){io2.observe(n)});
  }

  /* Tabs méthode */
  var tabs=[].slice.call(document.querySelectorAll('.tab')),
      panels=[].slice.call(document.querySelectorAll('.panel'));
  tabs.forEach(function(t,idx){
    t.addEventListener('click',function(){
      tabs.forEach(function(x){x.classList.remove('active');x.setAttribute('aria-selected','false')});
      panels.forEach(function(x){x.classList.remove('active')});
      t.classList.add('active');
      t.setAttribute('aria-selected','true');
      if(panels[idx]) panels[idx].classList.add('active');
    });
  });

  /* FAQ accordéon */
  [].forEach.call(document.querySelectorAll('.faq-item'),function(item){
    var q=item.querySelector('.faq-q'),a=item.querySelector('.faq-a');
    if(!q||!a) return;
    q.addEventListener('click',function(){
      var open=item.classList.contains('open');
      [].forEach.call(document.querySelectorAll('.faq-item.open'),function(o){
        o.classList.remove('open');o.querySelector('.faq-a').style.maxHeight=0;
      });
      if(!open){item.classList.add('open');a.style.maxHeight=a.scrollHeight+'px'}
    });
  });

  /* Générateur de llms.txt */
  var gen=document.getElementById('llmsGen');
  if(gen){
    var $=function(id){return document.getElementById(id)};
    var out=$('llmsOut'),actions=$('llmsActions'),content='';
    var normUrl=function(u){
      u=u.trim(); if(!u) return 'https://votresite.fr';
      if(!/^https?:\/\//.test(u)) u='https://'+u;
      return u.replace(/\/+$/,'');
    };
    gen.addEventListener('click',function(){
      var name=$('llmsName').value.trim()||'Votre marque';
      var base=normUrl($('llmsUrl').value);
      var desc=$('llmsDesc').value.trim()||'Description de votre activité.';
      var pages=$('llmsPages').value.split('\n').map(function(l){return l.trim()}).filter(Boolean).map(function(l){
        var parts=l.split('|').map(function(p){return p.trim()});
        var title=parts[0]||'Page', url=parts[1]||'/';
        if(!/^https?:\/\//.test(url)) url=base+(url.charAt(0)==='/'?url:'/'+url);
        return '- ['+title+']('+url+')';
      });
      content='# '+name+'\n\n> '+desc+'\n\nSite : '+base+'\n\n## Pages principales\n\n'+
        (pages.length?pages.join('\n'):'- [Accueil]('+base+')')+
        '\n\n## À propos\n\n'+name+'. '+desc+'\nContenu librement citable par les assistants IA avec attribution et lien vers '+base+'.\n';
      out.textContent=content;
      out.classList.add('show');
      actions.classList.add('show');
    });
    $('llmsCopy').addEventListener('click',function(e){
      var done=function(){e.target.textContent='Copié ✓';setTimeout(function(){e.target.textContent='Copier'},1600)};
      if(navigator.clipboard){navigator.clipboard.writeText(content).then(done,done)}
      else{
        var t=document.createElement('textarea');t.value=content;document.body.appendChild(t);t.select();document.execCommand('copy');t.remove();done();
      }
    });
    $('llmsDl').addEventListener('click',function(){
      var blob=new Blob([content],{type:'text/plain;charset=utf-8'});
      var a=document.createElement('a');
      a.href=URL.createObjectURL(blob);a.download='llms.txt';a.click();
      URL.revokeObjectURL(a.href);
    });
  }

  /* Dashboard : déclenche l'animation de la courbe */
  var dash=document.getElementById('dash');
  if(dash&&'IntersectionObserver' in window){
    var io3=new IntersectionObserver(function(entries){
      entries.forEach(function(en){if(en.isIntersecting){dash.classList.add('in');io3.unobserve(dash)}});
    },{threshold:.3});
    io3.observe(dash);
  }else if(dash){dash.classList.add('in')}
})();

/* Boucles vidéo des cartes : sources chargées et lecture lancée uniquement
   quand la carte est visible ; pause hors écran ; respect de
   prefers-reduced-motion (le poster reste affiché, rien n'est téléchargé). */
(function(){
  var vids = document.querySelectorAll('video[data-lazy]');
  if (!vids.length || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      var v = e.target;
      if (e.isIntersecting) {
        if (!v.dataset.loaded) {
          v.querySelectorAll('source[data-src]').forEach(function(s){ s.src = s.dataset.src; });
          v.load(); v.dataset.loaded = '1';
        }
        v.play().catch(function(){});
      } else if (!v.paused) { v.pause(); }
    });
  }, { rootMargin: '200px' });
  vids.forEach(function(v){ io.observe(v); });
})();
