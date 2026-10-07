/* Générateur de commande MCP pour Claude, article /blog/mcp-model-context-protocol.
   Construit la commande « claude mcp add » et le bloc JSON correspondant.
   100 % navigateur : aucun appel réseau, aucune donnée qui sort. */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var outCli = $('mcp-out-cli');
  var outJson = $('mcp-out-json');
  if (!outCli || !outJson) return;

  var preset = $('mcp-preset');
  var nom = $('mcp-name');
  var portee = $('mcp-scope');
  var url = $('mcp-url');
  var entete = $('mcp-header');
  var cmd = $('mcp-cmd');
  var env = $('mcp-env');
  var titreJson = $('mcp-json-title');
  var note = $('mcp-note');
  var groupe = $('mcp-transport');
  var copieCli = $('mcp-copy-cli');
  var copieJson = $('mcp-copy-json');

  var transport = 'http';

  var PRESETS = {
    filesystem: { t: 'stdio', nom: 'filesystem', cmd: 'npx -y @modelcontextprotocol/server-filesystem /Users/vous/Documents/dossier-autorise', env: '' },
    playwright: { t: 'stdio', nom: 'playwright', cmd: 'npx @playwright/mcp@latest', env: '' },
    analytics: { t: 'stdio', nom: 'analytics-mcp', cmd: 'pipx run analytics-mcp', env: 'GOOGLE_APPLICATION_CREDENTIALS=/chemin/vers/identifiants.json\nGOOGLE_PROJECT_ID=votre-projet' },
    screamingfrog: { t: 'http', nom: 'screaming-frog', url: 'http://localhost:11435/mcp', header: '' },
    notion: { t: 'http', nom: 'notion', url: 'https://mcp.notion.com/mcp', header: '' },
    datagouv: { t: 'http', nom: 'datagouv', url: 'https://mcp.data.gouv.fr/mcp', header: '' }
  };

  /* Nom de serveur : lettres, chiffres, tirets et soulignés */
  function nomPropre() {
    var n = (nom.value || '').trim().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');
    return n || 'mon-serveur';
  }

  /* Guillemets shell si la valeur contient autre chose que des caractères sûrs */
  function q(s) {
    if (/^[A-Za-z0-9_\/.:=@%+,-]+$/.test(s)) return s;
    return '"' + s.replace(/(["\\$`])/g, '\\$1') + '"';
  }

  /* Découpe une ligne de commande en mots, en respectant les guillemets simples et doubles */
  function decoupe(ligne) {
    var mots = [], mot = '', guill = null, aMot = false;
    for (var i = 0; i < ligne.length; i++) {
      var c = ligne[i];
      if (guill) {
        if (c === guill) { guill = null; } else { mot += c; }
      } else if (c === '"' || c === "'") {
        guill = c; aMot = true;
      } else if (/\s/.test(c)) {
        if (aMot) { mots.push(mot); mot = ''; aMot = false; }
      } else {
        mot += c; aMot = true;
      }
    }
    if (aMot) mots.push(mot);
    return mots;
  }

  function variables() {
    var res = [];
    (env.value || '').split('\n').forEach(function (l) {
      l = l.trim();
      var i = l.indexOf('=');
      if (i > 0) res.push([l.slice(0, i).trim(), l.slice(i + 1).trim()]);
    });
    return res;
  }

  function enTete() {
    var h = (entete.value || '').trim();
    var i = h.indexOf(':');
    if (i <= 0) return null;
    return [h.slice(0, i).trim(), h.slice(i + 1).trim()];
  }

  function afficheChamps() {
    var http = transport === 'http';
    $('mcp-f-url').style.display = http ? '' : 'none';
    $('mcp-f-header').style.display = http ? '' : 'none';
    $('mcp-f-cmd').style.display = http ? 'none' : '';
    $('mcp-f-env').style.display = http ? 'none' : '';
    var puces = groupe.querySelectorAll('.chip');
    for (var i = 0; i < puces.length; i++) {
      var on = puces[i].getAttribute('data-v') === transport;
      puces[i].classList.toggle('on', on);
      puces[i].setAttribute('aria-pressed', on ? 'true' : 'false');
    }
  }

  function construit() {
    var n = nomPropre();
    var p = portee.value || 'local';
    var cli, conf = {}, remarque = '';

    if (transport === 'http') {
      var adresse = (url.value || '').trim() || 'https://exemple.com/mcp';
      var h = enTete();
      cli = 'claude mcp add --transport http --scope ' + p + ' ' + n + ' ' + q(adresse);
      if (h) cli += ' --header ' + q(h[0] + ': ' + h[1]);

      conf = { type: 'http', url: adresse };
      if (h) { conf.headers = {}; conf.headers[h[0]] = h[1]; }
      titreJson.textContent = 'Fichier .mcp.json (Claude Code, portée project)';

      if (/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])([:\/]|$)/i.test(adresse)) {
        remarque = "Adresse locale : un connecteur personnalisé de Claude ne la joindra pas, car Claude s'y connecte depuis les serveurs d'Anthropic. Utilisez Claude Code, ou l'extension .mcpb fournie par l'éditeur pour Claude Desktop.";
      } else {
        remarque = "Dans Claude sur le web ou l'application, ce serveur s'ajoute aussi comme connecteur personnalisé : collez " + adresse + " dans Customize > Connectors > Add custom connector.";
      }
      if (h) remarque += " Ne partagez pas un fichier qui contient un jeton en clair : remplacez-le par une variable, par exemple ${API_KEY}.";
    } else {
      var ligne = (cmd.value || '').trim() || 'npx -y nom-du-paquet';
      var mots = decoupe(ligne);
      var vars = variables();

      cli = 'claude mcp add --transport stdio --scope ' + p + ' ' + n;
      vars.forEach(function (v) { cli += ' -e ' + q(v[0] + '=' + v[1]); });
      cli += ' -- ' + mots.map(q).join(' ');

      conf = { command: mots[0] || '', args: mots.slice(1) };
      if (vars.length) {
        conf.env = {};
        vars.forEach(function (v) { conf.env[v[0]] = v[1]; });
      }
      titreJson.textContent = 'Claude Desktop (claude_desktop_config.json) ou .mcp.json';
      remarque = "Dans Claude Desktop : Settings > Developer > Edit Config, ajoutez le bloc dans mcpServers, puis quittez complètement l'application et rouvrez-la.";
      if (vars.length) remarque += " Les valeurs des variables restent sur votre machine : ne commitez pas un .mcp.json qui contient une clé.";
    }

    var bloc = { mcpServers: {} };
    bloc.mcpServers[n] = conf;

    outCli.textContent = cli;
    outJson.textContent = JSON.stringify(bloc, null, 2);
    note.textContent = remarque;
  }

  function appliquePreset() {
    var k = preset.value;
    var d = PRESETS[k];
    if (!d) return;
    transport = d.t;
    nom.value = d.nom;
    if (d.t === 'http') {
      url.value = d.url;
      entete.value = d.header || '';
    } else {
      cmd.value = d.cmd;
      env.value = d.env || '';
    }
    if (k === 'analytics' || k === 'playwright' || k === 'filesystem') portee.value = 'user';
    afficheChamps();
    construit();
  }

  function copie(bouton, texte) {
    var fini = function (ok) {
      var avant = bouton.getAttribute('data-label') || bouton.textContent;
      bouton.setAttribute('data-label', avant);
      bouton.textContent = ok ? 'Copié' : 'Copie impossible';
      setTimeout(function () { bouton.textContent = avant; }, 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texte).then(function () { fini(true); }, function () { fini(false); });
    } else {
      fini(false);
    }
  }

  groupe.addEventListener('click', function (e) {
    var b = e.target.closest('.chip');
    if (!b) return;
    transport = b.getAttribute('data-v');
    afficheChamps();
    construit();
  });
  preset.addEventListener('change', appliquePreset);
  [nom, url, entete, cmd, env].forEach(function (el) { el.addEventListener('input', construit); });
  portee.addEventListener('change', construit);
  if (copieCli) copieCli.addEventListener('click', function () { copie(copieCli, outCli.textContent); });
  if (copieJson) copieJson.addEventListener('click', function () { copie(copieJson, outJson.textContent); });

  afficheChamps();
  construit();
})();
