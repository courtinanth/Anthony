/* Calculateur d'exécutions n8n : estime le volume mensuel d'un ensemble de
   workflows, indique l'offre n8n adaptée et l'équivalent chez Make et Zapier.
   Tarifs relevés sur les pages officielles le 7 octobre 2026.
   Tout est calculé dans le navigateur : aucune donnée ne sort. */
(function () {
  var out = document.getElementById('n8n-out');
  if (!out) return;

  var JOURS = 30;
  var tech = 0;

  function num(id, def) {
    var el = document.getElementById(id);
    if (!el) return def;
    var v = parseFloat(String(el.value).replace(',', '.'));
    return isFinite(v) && v >= 0 ? v : def;
  }

  function fmt(n) {
    return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  function offreN8n(ex) {
    if (tech === 1) {
      return {
        nom: 'Community Edition auto-hébergée',
        prix: "0 € de licence, aucun quota d'exécutions. Prévoir un petit serveur et le temps des mises à jour.",
        alt: ex <= 2500
          ? 'Sans serveur à gérer : Starter, 24 €/mois (20 €/mois en annuel).'
          : (ex <= 10000
            ? 'Sans serveur à gérer : Pro 10 000, 60 €/mois (50 €/mois en annuel).'
            : (ex <= 50000
              ? 'Sans serveur à gérer : Pro 50 000, 145 €/mois (1 450 €/an en annuel).'
              : 'Sans serveur à gérer : offre Enterprise, sur devis.'))
      };
    }
    if (ex <= 1000) {
      return {
        nom: 'Essai gratuit, puis Starter',
        prix: "L'essai cloud (1 000 exécutions, sans carte bancaire) suffit pour tester. Ensuite Starter : 24 €/mois, ou 20 €/mois en annuel.",
        alt: 'Gratuit sans limite de temps : la Community Edition sur votre propre serveur.'
      };
    }
    if (ex <= 2500) {
      return {
        nom: 'n8n Cloud Starter',
        prix: '24 €/mois en mensuel, 20 €/mois en annuel, pour 2 500 exécutions.',
        alt: 'Gratuit : la Community Edition sur votre propre serveur.'
      };
    }
    if (ex <= 10000) {
      return {
        nom: 'n8n Cloud Pro (10 000 exécutions)',
        prix: '60 €/mois en mensuel, 50 €/mois en annuel.',
        alt: 'Gratuit : la Community Edition sur votre propre serveur.'
      };
    }
    if (ex <= 50000) {
      return {
        nom: 'n8n Cloud Pro (50 000 exécutions)',
        prix: '145 €/mois en mensuel, 1 450 €/an en annuel.',
        alt: 'À ce volume, la Community Edition auto-hébergée devient très intéressante si quelqu\'un peut gérer le serveur.'
      };
    }
    return {
      nom: 'Enterprise (cloud) ou auto-hébergement',
      prix: "Au-delà de 50 000 exécutions, le cloud passe sur devis. L'offre Business (667 €/mois en annuel pour 40 000 exécutions) n'existe qu'en auto-hébergé.",
      alt: 'Gratuit : la Community Edition, sans quota, si votre serveur suit.'
    };
  }

  function offreMake(credits) {
    if (credits <= 1000) return 'Offre Free (1 000 crédits par mois).';
    if (credits <= 10000) return 'Offre Core, à partir de 9 $ par mois (10 000 crédits).';
    return 'Palier au-delà de 10 000 crédits : le prix augmente avec le volume, voir la grille Make.';
  }

  function offreZapier(taches, etapes) {
    if (taches <= 100 && etapes <= 2) return 'Offre Free (100 tâches par mois, Zaps à deux étapes).';
    if (taches <= 750) return 'Professional, à partir de 19,99 $ par mois en annuel (750 tâches).';
    return 'Palier au-delà de 750 tâches : Professional ou Team (dès 69 $ par mois en annuel), prix selon le volume.';
  }

  function render() {
    var nbPlan = num('n8n-plan-nb', 0);
    var freq = num('n8n-plan-freq', 30);
    var nbPlan2 = num('n8n-plan2-nb', 0);
    var freq2 = num('n8n-plan2-freq', 730);
    var evt = num('n8n-evt', 0);
    var etapes = Math.max(2, Math.round(num('n8n-steps', 6)));

    var exPlan = nbPlan * freq + nbPlan2 * freq2;
    var exEvt = evt * JOURS;
    var ex = exPlan + exEvt;

    var credits = ex * etapes;
    var taches = ex * (etapes - 1);
    var o = offreN8n(ex);

    document.getElementById('n8n-exec').textContent = fmt(ex);
    document.getElementById('n8n-exec-sub').textContent = 'exécutions n8n par mois, soit ' + o.nom;
    var w = ex <= 0 ? 0 : Math.min(100, Math.max(4, Math.log10(ex + 1) / Math.log10(100000) * 100));
    document.getElementById('n8n-meter').style.width = w.toFixed(0) + '%';

    var txt = 'Volume estimé : ' + fmt(ex) + ' exécutions par mois\n'
      + '  workflows planifiés : ' + fmt(exPlan) + '\n'
      + '  workflows déclenchés par un événement : ' + fmt(exEvt) + '\n\n'
      + 'Offre n8n conseillée : ' + o.nom + '\n'
      + '  ' + o.prix + '\n'
      + '  Autre option : ' + o.alt + '\n\n'
      + 'Le même volume ailleurs (' + etapes + ' étapes par workflow) :\n'
      + '  Make : environ ' + fmt(credits) + ' crédits. ' + offreMake(credits) + '\n'
      + '  Zapier : environ ' + fmt(taches) + ' tâches. ' + offreZapier(taches, etapes) + '\n\n'
      + "Pourquoi l'écart : n8n compte une exécution par passage complet du workflow,\n"
      + "Make compte chaque module, Zapier chaque action réussie (hors déclencheur).\n\n"
      + 'Tarifs relevés le 7 octobre 2026 sur n8n.io, make.com et zapier.com.\n'
      + 'Ordres de grandeur, à vérifier sur les grilles officielles avant de souscrire.';

    out.textContent = txt;
  }

  ['n8n-plan-nb', 'n8n-plan-freq', 'n8n-plan2-nb', 'n8n-plan2-freq', 'n8n-evt', 'n8n-steps'].forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', render);
    el.addEventListener('change', render);
  });

  var g = document.getElementById('n8n-tech');
  if (g) g.addEventListener('click', function (e) {
    var b = e.target.closest('.chip');
    if (!b) return;
    g.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('on'); });
    b.classList.add('on');
    tech = parseInt(b.dataset.v, 10) || 0;
    render();
  });

  var copy = document.getElementById('n8n-copy');
  if (copy) copy.addEventListener('click', function () {
    var done = function () {
      copy.textContent = 'Copié ✓'; copy.classList.add('ok');
      setTimeout(function () { copy.textContent = 'Copier le résultat'; copy.classList.remove('ok'); }, 1800);
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
