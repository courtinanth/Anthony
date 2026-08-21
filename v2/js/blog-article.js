/* ============================================================
   anthony-courtin.com v2 — Article de blog
   Sommaire auto, scrollspy, partage, barre de lecture,
   YouTube en façade, boutons "Résumer avec", avis lecteurs.
   Aucune dépendance. À charger en `defer`.
   ============================================================ */
(function () {
  'use strict';

  var PAGE_URL = (document.querySelector('link[rel=canonical]') || {}).href || location.href.split('#')[0];
  var PAGE_TITLE = (document.querySelector('meta[property="og:title"]') || {}).content || document.title;

  /* ---------- 1. Sommaire automatique + scrollspy ---------- */
  function slugify(s) {
    return s.toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '').slice(0, 60) || 'section';
  }

  function buildTOC() {
    var nav = document.getElementById('toc');
    var body = document.querySelector('.art-body');
    if (!nav || !body) return [];

    var heads = body.querySelectorAll('h2, h3');
    var used = {}, items = [];

    heads.forEach(function (h) {
      // On ignore les titres décoratifs (bloc "à retenir", CTA…)
      if (h.closest('.takeaways, .cta-band, .tool, .reviews, .author-box')) return;
      if (!h.id) {
        var base = slugify(h.textContent);
        var id = base, n = 2;
        while (used[id] || document.getElementById(id)) { id = base + '-' + n; n++; }
        h.id = id;
      }
      used[h.id] = true;
      items.push(h);
    });

    if (!items.length) { nav.innerHTML = ''; return []; }

    var frag = document.createDocumentFragment();
    var links = [];
    items.forEach(function (h) {
      var a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = h.textContent.trim();
      if (h.tagName === 'H3') a.className = 'lvl3';
      frag.appendChild(a);
      links.push({ a: a, h: h });
    });
    nav.innerHTML = '';
    nav.appendChild(frag);
    return links;
  }

  /* Sur écran large, le sommaire défile dans sa propre boîte quand l'article
     est long. On y ramène l'entrée active, sans jamais toucher au défilement
     de la page : scrollIntoView, lui, emporterait les deux. */
  function keepVisible(a, box) {
    if (!box || box.scrollHeight <= box.clientHeight + 2) return;
    var ba = a.getBoundingClientRect(), bb = box.getBoundingClientRect();
    var haut = 46; /* la hauteur du titre « Sommaire », resté collé en haut */
    if (ba.top < bb.top + haut) box.scrollTop += ba.top - bb.top - haut;
    else if (ba.bottom > bb.bottom - 8) box.scrollTop += ba.bottom - bb.bottom + 8;
  }

  function scrollSpy(links) {
    if (!links.length) return;
    var current = null;
    var box = document.querySelector('.rail-left .toc-box');
    function update() {
      var y = window.scrollY + 120;
      var found = links[0];
      for (var i = 0; i < links.length; i++) {
        if (links[i].h.offsetTop <= y) found = links[i]; else break;
      }
      if (found === current) return;
      if (current) current.a.classList.remove('on');
      found.a.classList.add('on');
      current = found;
      keepVisible(found.a, box);
    }
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { update(); ticking = false; });
    }, { passive: true });
    update();
  }

  function smoothTOC() {
    var nav = document.getElementById('toc');
    if (!nav) return;
    nav.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var target = document.getElementById(a.getAttribute('href').slice(1));
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.pageYOffset - 92;
      window.scrollTo({ top: top, behavior: 'smooth' });
      history.replaceState(null, '', a.getAttribute('href'));
    });
  }

  /* ---------- 2. Barre de progression de lecture ---------- */
  function readingProgress() {
    var bar = document.getElementById('read-progress');
    var body = document.querySelector('.art-body');
    if (!bar || !body) return;
    function update() {
      var start = body.offsetTop;
      var total = body.offsetHeight - window.innerHeight * 0.6;
      var pct = total > 0 ? ((window.scrollY - start) / total) * 100 : 0;
      bar.style.width = Math.max(0, Math.min(100, pct)) + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------- 3. Liens de partage et boutons "Résumer avec" ---------- */
  var AI_TARGETS = [
    { key: 'chatgpt', name: 'ChatGPT', url: 'https://chatgpt.com/?q=' },
    { key: 'claude', name: 'Claude', url: 'https://claude.ai/new?q=' },
    { key: 'perplexity', name: 'Perplexity', url: 'https://www.perplexity.ai/search?q=' },
    { key: 'gemini', name: 'Gemini', url: 'https://gemini.google.com/app?q=' },
    { key: 'mistral', name: 'Le Chat', url: 'https://chat.mistral.ai/chat?q=' },
    { key: 'grok', name: 'Grok', url: 'https://grok.com/?q=' }
  ];

  function fillDynamicLinks() {
    var u = encodeURIComponent(PAGE_URL);
    var t = encodeURIComponent(PAGE_TITLE);

    var map = {
      'share-x': 'https://twitter.com/intent/tweet?url=' + u + '&text=' + t,
      'share-linkedin': 'https://www.linkedin.com/sharing/share-offsite/?url=' + u,
      'share-facebook': 'https://www.facebook.com/sharer/sharer.php?u=' + u,
      'share-whatsapp': 'https://api.whatsapp.com/send?text=' + t + '%20' + u,
      'share-email': 'mailto:?subject=' + t + '&body=' + u
    };
    Object.keys(map).forEach(function (cls) {
      document.querySelectorAll('.' + cls).forEach(function (a) { a.href = map[cls]; });
    });

    var prompt = encodeURIComponent(
      'Analyse et résume les points clés de cet article, puis dis-moi ce que je devrais en faire concrètement : ' + PAGE_URL
    );
    document.querySelectorAll('.ai-btn[data-ai]').forEach(function (a) {
      var t = AI_TARGETS.filter(function (x) { return x.key === a.dataset.ai; })[0];
      if (t) a.href = t.url + prompt;
    });

    document.querySelectorAll('.share-copy').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var done = function () {
          btn.classList.add('done');
          btn.setAttribute('aria-label', 'Lien copié');
          setTimeout(function () { btn.classList.remove('done'); btn.setAttribute('aria-label', 'Copier le lien'); }, 1800);
        };
        if (navigator.clipboard) navigator.clipboard.writeText(PAGE_URL).then(done, function () {});
        else { var i = document.createElement('input'); i.value = PAGE_URL; document.body.appendChild(i); i.select(); document.execCommand('copy'); i.remove(); done(); }
      });
    });
  }

  /* ---------- 4. YouTube en façade (aucun script tiers avant le clic) ---------- */
  function ytLite() {
    document.querySelectorAll('.yt-lite[data-yt]').forEach(function (box) {
      box.addEventListener('click', function () {
        if (box.querySelector('iframe')) return;
        var f = document.createElement('iframe');
        f.src = 'https://www.youtube-nocookie.com/embed/' + box.dataset.yt + '?autoplay=1&rel=0';
        f.title = box.dataset.title || 'Vidéo YouTube';
        f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture';
        f.allowFullscreen = true;
        box.appendChild(f);
      }, { once: false });
    });
  }

  /* ---------- 5. Avis lecteurs ---------- */
  /* Le site est statique : l'envoi passe par Netlify Forms (form[name="avis"]).
     Les avis validés sont injectés au build dans #rv-list via data-reviews.
     Un brouillon local évite de perdre la saisie et affiche un aperçu immédiat. */
  function starSVG(filled) {
    return '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="' + (filled ? 'fill' : '') + '">' +
      '<path d="M12 2.5l2.9 6.05 6.6.9-4.8 4.6 1.2 6.55L12 17.5l-5.9 3.1 1.2-6.55L2.5 9.45l6.6-.9z"/></svg>';
  }

  function renderStars(el, value) {
    var full = Math.round(value);
    var html = '';
    for (var i = 1; i <= 5; i++) html += '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"' +
      (i <= full ? ' class="fill"' : '') + '><path d="M12 2.5l2.9 6.05 6.6.9-4.8 4.6 1.2 6.55L12 17.5l-5.9 3.1 1.2-6.55L2.5 9.45l6.6-.9z"/></svg>';
    el.innerHTML = html;
  }

  function reviews() {
    var box = document.querySelector('.reviews');
    if (!box) return;

    var listEl = box.querySelector('#rv-list');
    var avgEl = box.querySelector('#rv-avg');
    var starsEl = box.querySelector('#rv-stars');
    var countEl = box.querySelector('#rv-count');
    var emptyEl = box.querySelector('#rv-empty');
    var form = box.querySelector('form[name="avis"]');
    var msg = box.querySelector('#rv-msg');
    var slug = box.dataset.slug || location.pathname;
    var LS = 'ac_avis_' + slug;

    // Avis publiés (injectés au build) + avis local en attente de modération
    var published = [];
    try { published = JSON.parse(box.dataset.reviews || '[]'); } catch (e) { published = []; }
    var mine = null;
    try { mine = JSON.parse(localStorage.getItem(LS) || 'null'); } catch (e) { mine = null; }

    function paint() {
      var all = published.slice();
      if (mine) all.unshift(Object.assign({ pending: true }, mine));

      // Sans aucun avis, le bandeau de moyenne n'a rien à montrer : on le masque
      // et on ne laisse que la phrase d'invitation.
      var summaryEl = box.querySelector('.rv-summary');
      if (!all.length) {
        if (emptyEl) emptyEl.style.display = '';
        if (listEl) listEl.innerHTML = '';
        if (summaryEl) summaryEl.style.display = 'none';
        if (avgEl) avgEl.textContent = '';
        if (countEl) countEl.textContent = 'Aucun avis pour le moment.';
        if (starsEl) renderStars(starsEl, 0);
        return;
      }
      if (emptyEl) emptyEl.style.display = 'none';
      if (summaryEl) summaryEl.style.display = '';

      var sum = all.reduce(function (a, r) { return a + (+r.note || 0); }, 0);
      var avg = sum / all.length;
      if (avgEl) avgEl.textContent = avg.toFixed(1).replace('.', ',');
      if (starsEl) renderStars(starsEl, avg);
      if (countEl) countEl.textContent = all.length + (all.length > 1 ? ' avis' : ' avis');

      if (listEl) {
        listEl.innerHTML = all.map(function (r) {
          var st = '';
          for (var i = 1; i <= 5; i++) st += '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"' +
            (i <= (+r.note || 0) ? ' class="fill"' : '') + '><path d="M12 2.5l2.9 6.05 6.6.9-4.8 4.6 1.2 6.55L12 17.5l-5.9 3.1 1.2-6.55L2.5 9.45l6.6-.9z"/></svg>';
          return '<article class="rv-item">' +
            '<div class="rv-head">' +
            '<span class="rv-name">' + esc(r.nom || 'Anonyme') + '</span>' +
            '<span class="stars">' + st + '</span>' +
            '<span class="rv-date">' + esc(r.date || '') + (r.pending ? ' · en attente de validation' : '') + '</span>' +
            '</div>' +
            (r.texte ? '<p class="rv-text">' + esc(r.texte) + '</p>' : '') +
            '</article>';
        }).join('');
      }
    }

    function esc(s) {
      return String(s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    }

    if (form) {
      form.addEventListener('submit', function (e) {
        var note = form.querySelector('input[name="note"]:checked');
        if (!note) {
          e.preventDefault();
          if (msg) { msg.className = 'rv-msg ko'; msg.textContent = 'Merci de choisir une note avant d’envoyer.'; }
          return;
        }
        // Aperçu local immédiat, même si Netlify traite l'envoi en arrière-plan
        mine = {
          note: +note.value,
          nom: (form.querySelector('[name="nom"]') || {}).value || 'Anonyme',
          texte: (form.querySelector('[name="texte"]') || {}).value || '',
          date: new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
        };
        try { localStorage.setItem(LS, JSON.stringify(mine)); } catch (err) {}
        if (msg) { msg.className = 'rv-msg ok'; msg.textContent = 'Merci ! Votre avis est enregistré, il apparaîtra après validation.'; }
        paint();
      });
    }

    paint();
  }

  /* ---------- Initialisation ---------- */
  function init() {
    var links = buildTOC();
    scrollSpy(links);
    smoothTOC();
    readingProgress();
    fillDynamicLinks();
    ytLite();
    reviews();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
