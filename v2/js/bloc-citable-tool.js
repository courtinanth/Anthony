/* Compose un paragraphe de tête citable à partir de la question, de la réponse,
   d'un chiffre daté et d'une nuance. Note la complétude du bloc obtenu.
   Tout se fait dans le navigateur. */
(function () {
  var out = document.getElementById('bc-out');
  if (!out) return;

  var CH = ['bc-q', 'bc-r', 'bc-chiffre', 'bc-nuance'];

  function val(id) {
    var e = document.getElementById(id);
    return e ? e.value.trim() : '';
  }

  function cap(s) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  }

  function ponctue(s) {
    if (!s) return '';
    return /[.!?]$/.test(s) ? s : s + '.';
  }

  function render() {
    var q = val('bc-q'), r = val('bc-r'), c = val('bc-chiffre'), n = val('bc-nuance');

    if (!q && !r) {
      out.textContent = '';
      document.getElementById('bc-score').textContent = '0';
      document.getElementById('bc-meter').style.width = '0%';
      document.getElementById('bc-label').textContent = 'en attente';
      return;
    }

    var para = '';
    if (r) para += ponctue(cap(r));
    else para += '[Écrivez la réponse en une phrase : sujet, verbe, information.]';

    if (c) para += ' ' + ponctue(cap(c));
    if (n) para += ' ' + ponctue(cap(n));

    // Score de complétude du bloc
    var score = 0, manque = [];
    if (r && r.split(/\s+/).length >= 6) score += 40; else manque.push("une réponse complète en une phrase");
    if (c && /\d/.test(c)) score += 25; else manque.push("un chiffre");
    if (c && /\b(20[12]\d|202\d)\b/.test(c)) score += 15; else manque.push("la date de ce chiffre");
    if (n) score += 10; else manque.push("une nuance ou une condition");
    if (q && r) {
      var cles = q.toLowerCase().replace(/[^a-zà-ÿ0-9\s]/g,' ').split(/\s+/).filter(function(m){return m.length>3;});
      var dans = cles.filter(function(m){ return r.toLowerCase().indexOf(m) !== -1; });
      if (cles.length && dans.length / cles.length >= 0.5) score += 10;
      else manque.push("les termes de la question repris dans la réponse");
    }

    document.getElementById('bc-score').textContent = score;
    document.getElementById('bc-meter').style.width = score + '%';
    document.getElementById('bc-label').textContent =
      score >= 85 ? 'bloc solide' : (score >= 60 ? 'bon bloc' : (score >= 35 ? 'incomplet' : 'à reprendre'));

    var txt = 'Votre paragraphe de tête :\n\n' + para + '\n';

    if (manque.length) {
      txt += '\nIl manque :\n';
      manque.forEach(function (m) { txt += '  ✘ ' + m + '\n'; });
    } else {
      txt += '\n✔ Le bloc contient tout ce qu\'un moteur de réponse cherche : la réponse, '
           + 'un chiffre daté et la condition qui l\'encadre.\n';
    }

    txt += '\nOù le placer : en tout premier, juste après le titre H1, avant toute mise '
         + 'en contexte. Mettez la première phrase en gras : c\'est elle qui sera reprise.';

    out.textContent = txt;
  }

  CH.forEach(function (id) {
    var e = document.getElementById(id);
    if (e) e.addEventListener('input', render);
  });

  var copy = document.getElementById('bc-copy');
  if (copy) copy.addEventListener('click', function () {
    var done = function () {
      copy.textContent = 'Copié ✓'; copy.classList.add('ok');
      setTimeout(function () { copy.textContent = 'Copier le paragraphe'; copy.classList.remove('ok'); }, 1800);
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
