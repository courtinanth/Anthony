/* Générateur d'URL du connecteur MCP WordPress, article /blog/mcp-wordpress
   Tout se passe dans le navigateur : aucun appel réseau, aucune donnée qui sort,
   rien n'est écrit dans le stockage local. Le mot de passe ne vit que dans le champ. */
(function () {
  var out = document.getElementById('wp-out');
  if (!out) return;

  var user = document.getElementById('wp-user');
  var pass = document.getElementById('wp-pass');
  var domain = document.getElementById('wp-domain');
  var checks = document.getElementById('wp-checks');
  var copie = document.getElementById('wp-copy');
  var voir = document.getElementById('wp-show');

  var CHEMIN = '/wp-json/mcp/mcp-adapter-default-server';
  var visible = false;
  var urlComplete = '';

  /* « https://www.monsite.fr/blog/wp-admin/profile.php » → « www.monsite.fr/blog ».
     Un éventuel sous-dossier d'installation est conservé ; tout ce que WordPress
     ajoute derrière (wp-admin, wp-json, wp-login.php) est retiré. */
  function nettoyerDomaine(brut) {
    var d = brut.trim().replace(/^[a-z]+:\/\//i, '');
    d = d.split(/[?#]/)[0];
    d = d.replace(/\/(wp-admin|wp-json|wp-login\.php)(\/.*)?$/i, '');
    return d.replace(/\/+$/, '');
  }

  function li(ok, texte) {
    var e = document.createElement('li');
    e.style.padding = '4px 2px';
    e.style.fontSize = '.9rem';
    e.style.color = ok ? 'var(--pine-700)' : '#8A5700';
    e.textContent = (ok ? '✓ ' : '⚠ ') + texte;
    return e;
  }

  function build() {
    var u = user.value.trim();
    var p = pass.value.replace(/\s+/g, '');
    var brutDomaine = domain.value;
    var d = nettoyerDomaine(brutDomaine);

    var liste = [];

    if (u) {
      if (/@/.test(u)) liste.push([false, "L'identifiant ressemble à une adresse e-mail. Vérifiez le champ grisé « Identifiant » du profil : c'est souvent autre chose."]);
      else liste.push([true, 'Identifiant renseigné.']);
      if (/[\s@:\/?#%]/.test(u)) liste.push([true, "Les caractères spéciaux de l'identifiant sont encodés pour l'URL."]);
    }

    if (pass.value) {
      if (pass.value !== p) liste.push([true, 'Espaces retirés du mot de passe.']);
      if (/^[A-Za-z0-9]{24}$/.test(p)) liste.push([true, "Le mot de passe a le format d'un mot de passe d'application (24 caractères)."]);
      else liste.push([false, "Ce n'est pas le format d'un mot de passe d'application (24 lettres et chiffres). Votre mot de passe habituel ne fonctionnera pas."]);
    }

    if (brutDomaine.trim()) {
      if (/^http:\/\//i.test(brutDomaine.trim())) liste.push([false, "L'adresse est en http:// : WordPress désactive les mots de passe d'application sans HTTPS."]);
      if (/^[a-z]+:\/\//i.test(brutDomaine.trim()) || /\/$/.test(brutDomaine.trim())) liste.push([true, 'Protocole et barre oblique finale retirés du domaine.']);
      if (/(^|\.)(localhost|local|test|lan|internal)(:\d+)?(\/|$)/i.test(d) || /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(d)) {
        liste.push([false, "Ce site n'est pas accessible depuis internet : le connecteur de Claude ne pourra pas le joindre. Voyez la section Claude Code et WordPress en local."]);
      } else if (!/\./.test(d)) {
        liste.push([false, 'Le domaine semble incomplet (pas de point).']);
      } else if (d.indexOf('/') > -1) {
        liste.push([true, 'Sous-dossier détecté et conservé : ' + d.slice(d.indexOf('/')) + '.']);
      }
    }

    checks.innerHTML = '';
    liste.forEach(function (c) { checks.appendChild(li(c[0], c[1])); });

    if (!u && !p && !d) {
      urlComplete = '';
      out.textContent = 'https://identifiant:MOT_DE_PASSE_APP@domaine' + CHEMIN;
      return;
    }

    var partU = u ? encodeURIComponent(u) : 'identifiant';
    var partP = p ? encodeURIComponent(p) : 'MOT_DE_PASSE_APP';
    var partD = d || 'domaine';

    urlComplete = 'https://' + partU + ':' + partP + '@' + partD + CHEMIN;
    var affiche = p && !visible ? '•'.repeat(Math.min(p.length, 24)) : partP;
    out.textContent = 'https://' + partU + ':' + affiche + '@' + partD + CHEMIN;
  }

  [user, pass, domain].forEach(function (e) {
    e.addEventListener('input', build);
    e.addEventListener('change', build);
  });

  voir.addEventListener('click', function () {
    visible = !visible;
    pass.type = visible ? 'text' : 'password';
    voir.textContent = visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe';
    voir.setAttribute('aria-pressed', visible ? 'true' : 'false');
    build();
  });

  copie.addEventListener('click', function () {
    var txt = urlComplete || 'https://identifiant:MOT_DE_PASSE_APP@domaine' + CHEMIN;
    var fait = function () {
      copie.classList.add('ok');
      copie.textContent = 'Copiée';
      setTimeout(function () { copie.classList.remove('ok'); copie.textContent = "Copier l'URL"; }, 1800);
    };
    if (navigator.clipboard) navigator.clipboard.writeText(txt).then(fait, function () {});
    else {
      var t = document.createElement('textarea');
      t.value = txt; document.body.appendChild(t); t.select();
      document.execCommand('copy'); t.remove(); fait();
    }
  });

  /* Les navigateurs restaurent parfois les champs au retour arrière : l'outil
     repart toujours de zéro pour ne pas laisser traîner un mot de passe. */
  window.addEventListener('pageshow', function () {
    user.value = ''; pass.value = ''; domain.value = '';
    build();
  });

  build();
})();
