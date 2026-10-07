/* Comparateur abonnement / API pour l'article claude-code-prix.
   100 % navigateur, aucun appel réseau. Tarifs relevés sur claude.com/pricing
   et platform.claude.com le 7 octobre 2026, en dollars par million de tokens.
   Le repère « par jour actif » vient de la documentation Claude Code
   (code.claude.com/docs/fr/costs) : environ 13 $ par développeur et par jour
   actif dans les déploiements en entreprise. */
(function () {
  'use strict';

  /* cache : multiplicateur appliqué au prix d'entrée pour une lecture de cache */
  var MODELES = {
    'sonnet-55': { nom: 'Claude Sonnet 5.5', entree: 2, sortie: 10, cache: 0.1 },
    'opus-55':   { nom: 'Claude Opus 5.5',   entree: 4, sortie: 20, cache: 0.05 },
    'haiku-45':  { nom: 'Claude Haiku 4.5',  entree: 1, sortie: 5,  cache: 0.1 },
    'fable-51':  { nom: 'Claude Fable 5.1',  entree: 10, sortie: 50, cache: 0.025 }
  };

  var REPERE_JOUR = 13;

  var $ = function (id) { return document.getElementById(id); };

  var els = {
    entree: $('ccp-entree'),
    sortie: $('ccp-sortie'),
    modele: $('ccp-modele'),
    cache: $('ccp-cache'),
    cacheVal: $('ccp-cache-val'),
    jours: $('ccp-jours'),
    total: $('ccp-total'),
    meter: $('ccp-meter'),
    verdict: $('ccp-verdict'),
    detail: $('ccp-detail'),
    copy: $('ccp-copy')
  };

  if (!els.entree || !els.sortie || !els.modele || !els.total) return;

  function montant(n) {
    return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function nombre(el, defaut) {
    if (!el) return defaut;
    var v = parseFloat(String(el.value).replace(',', '.'));
    return isFinite(v) && v >= 0 ? v : defaut;
  }

  function calcul() {
    var m = MODELES[els.modele.value] || MODELES['sonnet-55'];
    var mIn = nombre(els.entree, 0);
    var mOut = nombre(els.sortie, 0);
    var part = Math.min(95, Math.max(0, nombre(els.cache, 0))) / 100;
    var jours = Math.min(31, Math.round(nombre(els.jours, 0)));

    /* La part relue depuis le cache est facturée au multiplicateur du modèle,
       le reste au tarif plein. Écritures de cache non comptées. */
    var prixEntree = m.entree * ((1 - part) + part * m.cache);
    var total = mIn * prixEntree + mOut * m.sortie;

    if (els.cacheVal) els.cacheVal.textContent = Math.round(part * 100) + ' %';
    els.total.textContent = montant(total) + ' $';
    if (els.meter) els.meter.style.width = Math.min(100, (total / 200) * 100) + '%';

    var verdict, detail;
    if (total === 0) {
      verdict = 'Renseignez votre consommation mensuelle';
      detail = 'Entrez un volume de tokens. Dans Claude Code, la commande /usage affiche la consommation de la session ; la Console Claude donne le détail du mois.';
    } else if (total < 20) {
      verdict = 'À ce volume, l’API coûte moins cher que Pro';
      detail = 'Votre usage reviendrait à ' + montant(total) + ' $ par mois à l’API, contre 20 $ pour Pro (17 $ par mois en annuel). '
        + 'Pro garde l’avantage si vous utilisez aussi Claude dans le navigateur ou si vous préférez un prix fixe.';
    } else if (total < 100) {
      verdict = 'Pro est le meilleur calcul, si ses limites vous suffisent';
      detail = 'À l’API, ce volume coûterait ' + montant(total) + ' $ par mois. Pro à 20 $ revient moins cher tant que ses limites par tranche de 5 heures et par semaine ne vous bloquent pas. '
        + 'S’il vous bloque souvent, l’API reste moins chère que Max 5x (100 $) à ce niveau.';
    } else if (total < 200) {
      verdict = 'Max 5x (100 $) bat l’API à ce volume';
      detail = 'À l’API, ce volume coûterait ' + montant(total) + ' $ par mois. Max 5x à 100 $ revient moins cher si ses limites suffisent ; '
        + 'sinon, l’API reste moins chère que Max 20x (200 $).';
    } else {
      verdict = 'Max 20x (200 $) bat l’API, dans la limite de ses quotas';
      detail = 'À l’API, ce volume coûterait ' + montant(total) + ' $ par mois, soit ' + montant(total - 200) + ' $ de plus que Max 20x. '
        + 'Si les plafonds hebdomadaires vous arrêtent, ou si Claude Code tourne dans des scripts, l’API ou un plan Team ou Enterprise se pilotent mieux.';
    }

    if (jours > 0) {
      detail += '\n\nRepère : Anthropic indique environ ' + REPERE_JOUR + ' $ par développeur et par jour actif en entreprise. Pour '
        + jours + ' jour' + (jours > 1 ? 's' : '') + ' d’usage par mois, cela ferait environ ' + montant(jours * REPERE_JOUR) + ' $ à l’API.';
    }

    if (els.verdict) els.verdict.textContent = verdict;
    if (els.detail) els.detail.textContent = detail;

    return { m: m, mIn: mIn, mOut: mOut, part: part, jours: jours, total: total, verdict: verdict, detail: detail };
  }

  function copier() {
    var r = calcul();
    var lignes = [
      'Estimation de coût mensuel de Claude Code, ' + r.m.nom,
      '',
      'Tokens en entrée : ' + r.mIn + ' million(s), dont ' + Math.round(r.part * 100) + ' % relus depuis le cache',
      'Tokens en sortie : ' + r.mOut + ' million(s)',
      'Coût API estimé : ' + montant(r.total) + ' $ par mois',
      '',
      r.verdict,
      r.detail,
      '',
      'Tarifs relevés le 7 octobre 2026, hors écritures de cache et taxes.',
      'Source : anthony-courtin.com/blog/claude-code-prix'
    ].join('\n');

    var fini = function (ok) {
      if (!els.copy) return;
      var texte = els.copy.textContent;
      els.copy.textContent = ok ? 'Copié ✓' : 'Copie impossible';
      setTimeout(function () { els.copy.textContent = texte; }, 1800);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(lignes).then(function () { fini(true); }, function () { fini(false); });
    } else {
      fini(false);
    }
  }

  ['entree', 'sortie', 'modele', 'cache', 'jours'].forEach(function (k) {
    if (els[k]) {
      els[k].addEventListener('input', calcul);
      els[k].addEventListener('change', calcul);
    }
  });
  if (els.copy) els.copy.addEventListener('click', copier);

  calcul();
})();
