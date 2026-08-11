/* Comparateur abonnement / API pour l'article claude-code-prix.
   100 % navigateur, aucun appel réseau. Les tarifs sont ceux relevés
   sur platform.claude.com le 11 août 2026, en dollars par million de tokens. */
(function () {
  'use strict';

  var MODELES = {
    'opus-5':   { nom: 'Claude Opus 5',   entree: 5, sortie: 25 },
    'sonnet-5': { nom: 'Claude Sonnet 5', entree: 3, sortie: 15 },
    'haiku-45': { nom: 'Claude Haiku 4.5', entree: 1, sortie: 5 }
  };

  var FORMULES = [
    { nom: 'Pro',     prix: 20,  detail: '20 $ au mois, 17 $ en annuel' },
    { nom: 'Max 5x',  prix: 100, detail: '100 $ par mois, mensuel uniquement' },
    { nom: 'Max 20x', prix: 200, detail: '200 $ par mois, mensuel uniquement' }
  ];

  var $ = function (id) { return document.getElementById(id); };

  var els = {
    entree: $('ccp-entree'),
    sortie: $('ccp-sortie'),
    modele: $('ccp-modele'),
    cache: $('ccp-cache'),
    cacheVal: $('ccp-cache-val'),
    total: $('ccp-total'),
    meter: $('ccp-meter'),
    verdict: $('ccp-verdict'),
    detail: $('ccp-detail'),
    copy: $('ccp-copy')
  };

  if (!els.entree || !els.sortie || !els.modele || !els.total) return;

  function euros(n) {
    return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function nombre(el, defaut) {
    var v = parseFloat(String(el.value).replace(',', '.'));
    return isFinite(v) && v >= 0 ? v : defaut;
  }

  function calcul() {
    var m = MODELES[els.modele.value] || MODELES['opus-5'];
    var mIn = nombre(els.entree, 0);
    var mOut = nombre(els.sortie, 0);
    var part = Math.min(90, Math.max(0, nombre(els.cache, 0))) / 100;

    /* La part servie par le cache est facturée 0,1 fois le prix d'entrée.
       Le reste passe au tarif plein. */
    var prixEntree = m.entree * ((1 - part) + part * 0.1);
    var coutEntree = mIn * prixEntree;
    var coutSortie = mOut * m.sortie;
    var total = coutEntree + coutSortie;

    if (els.cacheVal) els.cacheVal.textContent = Math.round(part * 100) + ' %';
    els.total.textContent = euros(total) + ' $';

    /* La jauge se lit par rapport au plafond des formules, 200 $. */
    if (els.meter) {
      els.meter.style.width = Math.min(100, (total / 200) * 100) + '%';
    }

    var moinsCher = null;
    for (var i = 0; i < FORMULES.length; i++) {
      if (FORMULES[i].prix >= total) { moinsCher = FORMULES[i]; break; }
    }

    var verdict, detail;
    if (total === 0) {
      verdict = 'Renseignez votre consommation mensuelle';
      detail = 'Entrez un volume de tokens pour comparer. Si vous ne le connaissez pas, la console Claude affiche votre consommation des trente derniers jours.';
    } else if (moinsCher) {
      verdict = 'L’abonnement ' + moinsCher.nom + ' est plus avantageux';
      detail = 'Votre consommation reviendrait à ' + euros(total) + ' $ par mois à l’API, contre '
        + moinsCher.prix + ' $ pour ' + moinsCher.nom + ' (' + moinsCher.detail + '). '
        + 'L’abonnement couvre aussi Claude sur le web, le bureau et le mobile.';
    } else {
      var ecart = total - 200;
      verdict = 'À ce volume, l’API devient la bonne réponse';
      detail = 'Votre consommation dépasse le plafond des formules individuelles de ' + euros(ecart)
        + ' $ par mois. Au-delà, l’API se facture au réel et se pilote finement, avec le cache et le mode batch. '
        + 'Un plan Team ou Enterprise mérite aussi d’être chiffré si vous êtes plusieurs.';
    }

    if (els.verdict) els.verdict.textContent = verdict;
    if (els.detail) els.detail.textContent = detail;

    return { m: m, mIn: mIn, mOut: mOut, part: part, total: total, verdict: verdict };
  }

  function copier() {
    var r = calcul();
    var lignes = [
      'Estimation de coût mensuel, ' + r.m.nom,
      '',
      'Tokens en entrée : ' + r.mIn + ' million(s)',
      'Tokens en sortie : ' + r.mOut + ' million(s)',
      'Part servie par le cache : ' + Math.round(r.part * 100) + ' %',
      '',
      'Coût API estimé : ' + euros(r.total) + ' $ par mois',
      r.verdict,
      '',
      'Tarifs relevés le 11 août 2026. Estimation hors surcoût d’écriture de cache.',
      'Source : anthony-courtin.com/blog/claude-code-prix'
    ].join('\n');

    var fini = function (ok) {
      if (!els.copy) return;
      var texte = els.copy.textContent;
      els.copy.textContent = ok ? 'Copié' : 'Copie impossible';
      setTimeout(function () { els.copy.textContent = texte; }, 1800);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(lignes).then(function () { fini(true); }, function () { fini(false); });
    } else {
      fini(false);
    }
  }

  ['entree', 'sortie', 'modele', 'cache'].forEach(function (k) {
    if (els[k]) {
      els[k].addEventListener('input', calcul);
      els[k].addEventListener('change', calcul);
    }
  });
  if (els.copy) els.copy.addEventListener('click', copier);

  calcul();
})();
