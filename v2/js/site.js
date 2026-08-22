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

  /* Bandeaux défilants : clients sous le hero, avis Google.
     Une boucle sans raccord suppose une piste faite de deux moitiés
     identiques, chacune au moins aussi large que l'écran — sinon
     translateX(-50 %) laisse un trou à chaque tour. Plutôt que de
     recopier la liste dans le HTML, avec le double entretien que ça
     suppose, on la clone ici autant de fois que la largeur l'exige.
     La durée suit le nombre de copies (--marq-speed est le temps par
     copie), ce qui garde une vitesse constante quel que soit l'écran.
     Sans JavaScript, ou en mouvement réduit, la liste reste affichée
     telle quelle et le rail devient scrollable à la main (CSS). */
  if(!reduced){
    var marquees=[].slice.call(document.querySelectorAll('[data-marquee]'));
    var fill=function(track){
      var set=track.firstElementChild;
      if(!set) return;
      var setW=set.getBoundingClientRect().width;
      if(!setW) return;
      var need=Math.max(2,Math.ceil(innerWidth/setW)+1);
      /* On ne reconstruit que s'il manque des copies : refaire la piste
         redémarre l'animation, autant ne pas le faire pour rien. */
      if(+track.dataset.half>=need) return;
      while(track.children.length>1) track.removeChild(track.lastElementChild);
      var frag=document.createDocumentFragment(),i,copy;
      for(i=1;i<need*2;i++){
        copy=set.cloneNode(true);
        copy.setAttribute('aria-hidden','true');
        frag.appendChild(copy);
      }
      track.appendChild(frag);
      track.dataset.half=need;
      track.style.setProperty('--marq-copies',need);
      track.classList.add('is-looping');
    };
    marquees.forEach(fill);
    /* Deux moments où la largeur d'une copie change sous nos pieds :
       l'arrivée de la police (mesurer avec la police de repli fausse le
       compte) et la rotation ou le redimensionnement de la fenêtre.
       Sans ce rattrapage, un téléphone chargé en portrait puis basculé
       en paysage laisse un trou à chaque tour de boucle. */
    if(document.fonts&&document.fonts.ready) document.fonts.ready.then(function(){marquees.forEach(fill)});
    var rt;
    addEventListener('resize',function(){
      clearTimeout(rt);
      rt=setTimeout(function(){marquees.forEach(fill)},250);
    },{passive:true});
  }

  /* Carrousel de vidéos YouTube.
     Le rail défile déjà seul (scroll-snap CSS, molette, doigt, tabulation) :
     ce bloc n'ajoute que les deux flèches, et seulement s'il y a vraiment de
     quoi défiler. Une vidéo unique sur grand écran n'affiche donc aucune
     flèche, plutôt que deux boutons qui ne feraient rien. */
  [].forEach.call(document.querySelectorAll('[data-carousel]'),function(car){
    var rail=car.querySelector('.yt-rail'),
        prev=car.querySelector('.yt-nav.prev'),
        next=car.querySelector('.yt-nav.next');
    if(!rail||!prev||!next) return;

    /* Un cran = la carte suivante, amenée sur le point d'accroche. On vise une
       position absolue plutôt que d'ajouter « une largeur de carte » au
       défilement courant : le rail est en scroll-snap obligatoire, et un
       déplacement relatif qui n'atterrit pas pile sur une accroche laisse le
       navigateur arbitrer, parfois en revenant à la carte qu'on quittait.
       Repartir de la carte réellement accrochée rattrape aussi une position
       intermédiaire, après un défilement au doigt interrompu par exemple. */
    var glisser=function(sens){
      var cartes=[].slice.call(rail.querySelectorAll('.yt-card'));
      if(!cartes.length) return;
      /* Position d'une carte dans le contenu défilant, mesurée et non déduite
         du CSS : le retrait vaut max(24px, 50% - 596px), que getComputedStyle
         rend tel quel, sans le résoudre en pixels. La marge de tête de la
         première carte EST le point d'accroche, il suffit de la lire. */
      var origine=rail.getBoundingClientRect().left-rail.scrollLeft;
      var dansLeRail=function(c){return c.getBoundingClientRect().left-origine};
      var retrait=dansLeRail(cartes[0]);
      var positions=cartes.map(function(c){return dansLeRail(c)-retrait});
      var i=0,mini=Infinity;
      positions.forEach(function(x,k){
        var d=Math.abs(x-rail.scrollLeft);
        if(d<mini){mini=d;i=k}
      });
      var cible=Math.min(cartes.length-1,Math.max(0,i+sens));
      /* 'instant' explicitement, et non 'auto' : le rail porte scroll-behavior:
         smooth en CSS, qui reprendrait la main sur un simple 'auto'. */
      rail.scrollTo({left:positions[cible],behavior:reduced?'instant':'smooth'});
    };
    var etat=function(){
      var reste=rail.scrollWidth-rail.clientWidth;
      var defilable=reste>4;
      prev.hidden=next.hidden=!defilable;
      if(!defilable) return;
      /* Marge de 2 px : les navigateurs arrondissent scrollLeft, un test
         d'égalité stricte laisserait la flèche active en bout de course. */
      prev.disabled=rail.scrollLeft<=2;
      next.disabled=rail.scrollLeft>=reste-2;
    };
    prev.addEventListener('click',function(){glisser(-1)});
    next.addEventListener('click',function(){glisser(1)});
    rail.addEventListener('scroll',etat,{passive:true});
    addEventListener('resize',etat,{passive:true});
    addEventListener('load',etat);
    etat();
  });

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

/* Bandeau d'information « aucun cookie ».
   Le site ne dépose ni cookie ni traceur, et sa CSP interdit tout script
   tiers : il n'y a donc aucun consentement à demander, et ce bandeau ne
   bloque rien. Il informe une fois, puis se ferme.

   Le fait qu'il ait été fermé est la seule chose que le site écrit ici, avec
   le brouillon d'avis du blog. Si le stockage local est indisponible
   (navigation privée stricte, stockage bloqué), on n'affiche rien plutôt que
   de réafficher le bandeau à chaque page. */
(function () {
  var CLE = 'ac-note-cookies';
  var memoire;
  try {
    memoire = window.localStorage;
    if (memoire.getItem(CLE)) return;
  } catch (e) { return; }

  function afficher() {
    var el = document.createElement('aside');
    el.className = 'cookie-note';
    el.setAttribute('aria-label', 'Information sur les cookies');
    el.innerHTML =
      '<p class="cookie-note-t">Ce site ne vous suit pas</p>' +
      '<p>Aucun cookie, aucun traceur, aucun script tiers. Il n\'y a donc rien ' +
      'à accepter ni à refuser ici.</p>' +
      '<div class="cookie-note-actions">' +
        '<button type="button">J\'ai compris</button>' +
        '<a href="/confidentialite">Ce que je collecte vraiment</a>' +
      '</div>';

    document.body.appendChild(el);
    requestAnimationFrame(function () { el.classList.add('on'); });

    el.querySelector('button').addEventListener('click', function () {
      try { memoire.setItem(CLE, '1'); } catch (e) {}
      el.classList.remove('on');
      setTimeout(function () { el.remove(); }, 340);
    });
  }

  /* Laisser la page se poser d'abord : le bandeau est une information, pas
     une interruption, et il ne doit pas entrer dans le premier rendu. */
  function lancer() { setTimeout(afficher, 1200); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', lancer);
  else lancer();
})();
