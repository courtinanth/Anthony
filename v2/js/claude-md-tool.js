/* Aide-mémoire d'installation de Claude Code : compose, selon le système et
   la méthode choisis, les commandes officielles pour installer, vérifier,
   se connecter, ajouter l'extension d'éditeur, mettre à jour et désinstaller.
   Commandes relevées dans la documentation d'Anthropic (code.claude.com) le
   7 octobre 2026. Tout se passe dans le navigateur, rien n'est envoyé. */
(function () {
  var out = document.getElementById('ci-out');
  if (!out) return;

  var selOs = document.getElementById('ci-os');
  var selMethode = document.getElementById('ci-methode');
  var selCanal = document.getElementById('ci-canal');
  var selIde = document.getElementById('ci-ide');

  /* Méthodes proposées pour chaque système */
  var METHODES = {
    mac: [['natif', 'Installeur natif (recommandé)'], ['brew', 'Homebrew'], ['npm', 'npm (Node.js 22 ou plus)']],
    debian: [['natif', 'Installeur natif (recommandé)'], ['apt', 'Dépôt apt signé'], ['npm', 'npm (Node.js 22 ou plus)']],
    fedora: [['natif', 'Installeur natif (recommandé)'], ['dnf', 'Dépôt dnf signé'], ['npm', 'npm (Node.js 22 ou plus)']],
    ps: [['natif', 'Installeur natif (recommandé)'], ['winget', 'WinGet'], ['npm', 'npm (Node.js 22 ou plus)']],
    cmd: [['natif', 'Installeur natif (recommandé)'], ['winget', 'WinGet'], ['npm', 'npm (Node.js 22 ou plus)']],
    wsl: [['natif', 'Installeur natif (recommandé)'], ['npm', 'npm (Node.js 22 ou plus)']]
  };

  var NOMS = {
    mac: 'macOS', debian: 'Linux Ubuntu ou Debian', fedora: 'Linux Fedora ou RHEL',
    ps: 'Windows (PowerShell)', cmd: 'Windows (invite de commandes CMD)', wsl: 'Windows avec WSL'
  };

  function remplirMethodes() {
    var os = selOs.value;
    var avant = selMethode.value;
    selMethode.innerHTML = '';
    METHODES[os].forEach(function (m) {
      var o = document.createElement('option');
      o.value = m[0]; o.textContent = m[1];
      selMethode.appendChild(o);
    });
    var garde = METHODES[os].some(function (m) { return m[0] === avant; });
    selMethode.value = garde ? avant : 'natif';
  }

  function bloc(titre, lignes) {
    return titre + '\n' + lignes.join('\n') + '\n\n';
  }

  function build() {
    var os = selOs.value;
    var m = selMethode.value;
    var stable = selCanal.value === 'stable';
    var ide = selIde.value;
    var unix = (os === 'mac' || os === 'debian' || os === 'fedora' || os === 'wsl');
    var txt = 'CLAUDE CODE : AIDE-MÉMOIRE D\'INSTALLATION\n';
    txt += 'Système : ' + NOMS[os] + '\n\n';

    /* 0. Prérequis */
    var pre = [];
    if (m === 'npm') pre.push('Node.js 22 ou plus (vérifier avec : node --version). Ne jamais lancer npm avec sudo.');
    if (os === 'ps' || os === 'cmd') pre.push('Recommandé : Git for Windows (git-scm.com), pour que Claude Code utilise Git Bash. Pas besoin des droits administrateur.');
    if (os === 'wsl') pre.push('Ouvrez votre distribution WSL et tapez les commandes dans le terminal Linux, pas dans PowerShell.');
    if (m === 'apt') pre.push('sudo apt install curl gnupg');
    if (os === 'mac') pre.push('macOS 13 ou plus récent. Ouvrez l\'application Terminal.');
    pre.push('Un compte Claude Pro, Max, Team, Enterprise ou un compte Console (API). La formule gratuite ne donne pas accès à Claude Code.');
    txt += bloc('0. PRÉREQUIS', pre.map(function (l) { return '- ' + l; }));

    /* 1. Installation */
    var inst = [];
    if (m === 'natif') {
      if (unix) inst.push('curl -fsSL https://claude.ai/install.sh | bash' + (stable ? ' -s stable' : ''));
      if (os === 'ps') inst.push(stable
        ? '& ([scriptblock]::Create((irm https://claude.ai/install.ps1))) stable'
        : 'irm https://claude.ai/install.ps1 | iex');
      if (os === 'cmd') inst.push('curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd' + (stable ? ' stable' : '') + ' && del install.cmd');
    }
    if (m === 'brew') inst.push(stable ? 'brew install --cask claude-code' : 'brew install --cask claude-code@latest');
    if (m === 'winget') inst.push('winget install Anthropic.ClaudeCode');
    if (m === 'npm') inst.push('npm install -g @anthropic-ai/claude-code');
    if (m === 'apt') {
      var canalApt = stable ? 'stable stable' : 'latest latest';
      inst.push('sudo install -d -m 0755 /etc/apt/keyrings');
      inst.push('sudo curl -fsSL https://downloads.claude.ai/keys/claude-code.asc -o /etc/apt/keyrings/claude-code.asc');
      inst.push('echo "deb [signed-by=/etc/apt/keyrings/claude-code.asc] https://downloads.claude.ai/claude-code/apt/' + canalApt + ' main" | sudo tee /etc/apt/sources.list.d/claude-code.list');
      inst.push('sudo apt update');
      inst.push('sudo apt install claude-code');
    }
    if (m === 'dnf') {
      inst.push('sudo tee /etc/yum.repos.d/claude-code.repo <<\'EOF\'');
      inst.push('[claude-code]');
      inst.push('name=Claude Code');
      inst.push('baseurl=https://downloads.claude.ai/claude-code/rpm/' + (stable ? 'stable' : 'latest'));
      inst.push('enabled=1');
      inst.push('gpgcheck=1');
      inst.push('gpgkey=https://downloads.claude.ai/keys/claude-code.asc');
      inst.push('EOF');
      inst.push('sudo dnf install claude-code');
    }
    var titreInst = '1. INSTALLER (canal ' + (stable ? 'stable, environ une semaine de décalage' : 'latest, chaque nouvelle version') + ')';
    if (m === 'winget' || m === 'npm') titreInst = '1. INSTALLER';
    txt += bloc(titreInst, inst);

    /* 2. Vérification */
    var verif = ['Fermez le terminal, ouvrez-en un nouveau, puis :', 'claude --version', 'claude doctor'];
    if (m === 'natif') {
      verif.push('');
      verif.push('Si « claude » est introuvable, ajoutez le dossier d\'installation au PATH :');
      if (os === 'mac') verif.push('echo \'export PATH="$HOME/.local/bin:$PATH"\' >> ~/.zshrc && source ~/.zshrc');
      if (os === 'debian' || os === 'fedora' || os === 'wsl') verif.push('echo \'export PATH="$HOME/.local/bin:$PATH"\' >> ~/.bashrc && source ~/.bashrc');
      if (os === 'ps' || os === 'cmd') {
        verif.push('(dans PowerShell)');
        verif.push('$currentPath = [Environment]::GetEnvironmentVariable(\'PATH\', \'User\')');
        verif.push('[Environment]::SetEnvironmentVariable(\'PATH\', "$currentPath;$env:USERPROFILE\\.local\\bin", \'User\')');
      }
    }
    txt += bloc('2. VÉRIFIER', verif);

    /* 3. Première session */
    txt += bloc('3. SE CONNECTER ET LANCER UNE PREMIÈRE SESSION', [
      'cd chemin/vers/votre/projet',
      'claude',
      '(le navigateur s\'ouvre pour la connexion ; s\'il ne s\'ouvre pas, appuyez sur « c » pour copier le lien)',
      '/init        crée le fichier CLAUDE.md du projet',
      '/status      affiche la version, le modèle et le compte connecté',
      '/help        liste les commandes'
    ]);

    /* 4. Éditeur */
    if (ide === 'vscode') {
      txt += bloc('4. EXTENSION VS CODE (VS Code 1.94 ou plus)', [
        'code --install-extension anthropic.claude-code',
        'Puis ouvrez un fichier et cliquez sur l\'icône Spark en haut à droite de l\'éditeur.'
      ]);
    } else if (ide === 'jetbrains') {
      txt += bloc('4. PLUGIN JETBRAINS', [
        'Settings > Plugins > Marketplace : installez « Claude Code [Beta] », puis redémarrez l\'IDE.',
        'Lancez claude dans le terminal intégré, ou ' + (os === 'mac' ? 'Cmd+Esc' : 'Ctrl+Esc') + '.',
        'Depuis un terminal externe : claude, puis /ide'
      ].concat(os === 'wsl' ? ['Commande Claude à indiquer dans le plugin : wsl -d Ubuntu -- bash -lic "claude" (remplacez Ubuntu par votre distribution)'] : []));
    }

    /* 5. Mise à jour */
    var maj = [];
    if (m === 'natif') { maj.push('Mise à jour automatique en arrière-plan. Pour forcer :'); maj.push('claude update'); }
    if (m === 'brew') maj.push(stable ? 'brew upgrade claude-code' : 'brew upgrade claude-code@latest');
    if (m === 'winget') maj.push('winget upgrade Anthropic.ClaudeCode');
    if (m === 'npm') maj.push('npm install -g @anthropic-ai/claude-code@latest');
    if (m === 'apt') maj.push('sudo apt update && sudo apt upgrade claude-code');
    if (m === 'dnf') maj.push('sudo dnf upgrade claude-code');
    txt += bloc((ide === 'aucun' ? '4' : '5') + '. METTRE À JOUR', maj);

    /* 6. Désinstallation */
    var des = [];
    if (m === 'natif' && unix) { des.push('rm -f ~/.local/bin/claude'); des.push('rm -rf ~/.local/share/claude'); }
    if (m === 'natif' && !unix) {
      des.push('(dans PowerShell)');
      des.push('Remove-Item -Path "$env:USERPROFILE\\.local\\bin\\claude.exe" -Force');
      des.push('Remove-Item -Path "$env:USERPROFILE\\.local\\share\\claude" -Recurse -Force');
    }
    if (m === 'brew') des.push(stable ? 'brew uninstall --cask claude-code' : 'brew uninstall --cask claude-code@latest');
    if (m === 'winget') des.push('winget uninstall Anthropic.ClaudeCode');
    if (m === 'npm') des.push('npm uninstall -g @anthropic-ai/claude-code');
    if (m === 'apt') { des.push('sudo apt remove claude-code'); des.push('sudo rm /etc/apt/sources.list.d/claude-code.list /etc/apt/keyrings/claude-code.asc'); }
    if (m === 'dnf') { des.push('sudo dnf remove claude-code'); des.push('sudo rm /etc/yum.repos.d/claude-code.repo'); }
    des.push('');
    des.push('Pour effacer aussi réglages, historique et serveurs MCP (irréversible) :');
    if (unix) des.push('rm -rf ~/.claude && rm ~/.claude.json');
    else {
      des.push('(dans PowerShell)');
      des.push('Remove-Item -Path "$env:USERPROFILE\\.claude" -Recurse -Force');
      des.push('Remove-Item -Path "$env:USERPROFILE\\.claude.json" -Force');
    }
    txt += bloc((ide === 'aucun' ? '5' : '6') + '. DÉSINSTALLER', des);

    txt += 'Source : documentation officielle Claude Code (code.claude.com/docs/fr/setup).';
    out.textContent = txt;
  }

  selOs.addEventListener('change', function () { remplirMethodes(); build(); });
  [selMethode, selCanal, selIde].forEach(function (e) { e.addEventListener('change', build); });

  /* Le canal n'a pas de sens pour WinGet et npm : le menu est grisé */
  function majCanal() {
    var sansCanal = (selMethode.value === 'winget' || selMethode.value === 'npm');
    selCanal.disabled = sansCanal;
  }
  selMethode.addEventListener('change', majCanal);
  selOs.addEventListener('change', majCanal);

  var copy = document.getElementById('ci-copy');
  if (copy) copy.addEventListener('click', function () {
    var done = function () {
      copy.textContent = 'Copié ✓'; copy.classList.add('ok');
      setTimeout(function () { copy.textContent = 'Copier l\'aide-mémoire'; copy.classList.remove('ok'); }, 1800);
    };
    if (navigator.clipboard) navigator.clipboard.writeText(out.textContent).then(done, function () {});
    else {
      var i = document.createElement('textarea');
      i.value = out.textContent; document.body.appendChild(i);
      i.select(); document.execCommand('copy'); i.remove(); done();
    }
  });

  var dl = document.getElementById('ci-dl');
  if (dl) dl.addEventListener('click', function () {
    var blob = new Blob([out.textContent], { type: 'text/plain;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'installer-claude-code-' + selOs.value + '.txt';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  });

  /* Présélection du système d'après le navigateur, modifiable ensuite */
  var ua = (navigator.userAgent || '').toLowerCase();
  if (ua.indexOf('windows') > -1) selOs.value = 'ps';
  else if (ua.indexOf('mac os') > -1 || ua.indexOf('macintosh') > -1) selOs.value = 'mac';
  else if (ua.indexOf('linux') > -1 && ua.indexOf('android') === -1) selOs.value = 'debian';

  remplirMethodes();
  majCanal();
  build();
})();
