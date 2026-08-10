/* Générateur de fichier CLAUDE.md : compose le fichier de contexte projet
   que Claude Code lit au démarrage. Tout se passe dans le navigateur. */
(function () {
  var out = document.getElementById('cm-out');
  if (!out) return;

  function val(id) {
    var e = document.getElementById(id);
    return e ? e.value.trim() : '';
  }

  function build() {
    var projet = val('cm-projet') || '[nom du projet]';
    var tech = val('cm-tech');
    var but = val('cm-but');
    var cmds = val('cm-cmd').split('\n').map(function (l) { return l.trim(); }).filter(Boolean);

    var regles = [].slice.call(document.querySelectorAll('#cm-regles .chip.on'))
      .map(function (c) { return c.dataset.v; });

    var txt = '# ' + projet + '\n\n';

    txt += '## Ce qu\'est ce projet\n\n';
    txt += (but || '[Décrivez en une ou deux phrases à quoi sert ce projet et qui l\'utilise.]') + '\n\n';

    if (tech) {
      txt += '## Stack technique\n\n' + tech + '\n\n';
    }

    if (cmds.length) {
      txt += '## Commandes utiles\n\n```bash\n' + cmds.join('\n') + '\n```\n\n';
    }

    txt += '## Règles de travail\n\n';
    if (regles.length) {
      regles.forEach(function (r) { txt += '- ' + r + '\n'; });
    } else {
      txt += '- [Ajoutez ici les règles que l\'agent doit respecter.]\n';
    }
    txt += '\n';

    txt += '## Conventions\n\n';
    txt += '- Respecter le style du code existant plutôt qu\'imposer un nouveau style.\n';
    txt += '- Ne pas reformater des fichiers sans rapport avec la demande en cours.\n';
    txt += '- Signaler ce qui a été modifié à la fin de chaque tâche.\n\n';

    txt += '## Ce qu\'il ne faut pas toucher\n\n';
    txt += '- [Listez les dossiers ou fichiers sensibles : configuration, secrets, données de production.]\n';

    out.textContent = txt;
  }

  ['cm-projet', 'cm-tech', 'cm-but', 'cm-cmd'].forEach(function (id) {
    var e = document.getElementById(id);
    if (e) e.addEventListener('input', build);
  });

  var g = document.getElementById('cm-regles');
  if (g) g.addEventListener('click', function (e) {
    var b = e.target.closest('.chip');
    if (!b) return;
    b.classList.toggle('on');   // sélection multiple ici, contrairement aux autres outils
    build();
  });

  var copy = document.getElementById('cm-copy');
  if (copy) copy.addEventListener('click', function () {
    var done = function () {
      copy.textContent = 'Copié ✓'; copy.classList.add('ok');
      setTimeout(function () { copy.textContent = 'Copier le fichier'; copy.classList.remove('ok'); }, 1800);
    };
    if (navigator.clipboard) navigator.clipboard.writeText(out.textContent).then(done, function () {});
    else {
      var i = document.createElement('textarea');
      i.value = out.textContent; document.body.appendChild(i);
      i.select(); document.execCommand('copy'); i.remove(); done();
    }
  });

  build();
})();
