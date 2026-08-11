/* Coût annuel de Claude selon la composition de l'équipe.
   Tous les montants viennent de la grille publiée par Anthropic, en dollars
   hors taxes. Aucun chiffre n'est estimé. 100 % navigateur, aucun appel réseau. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var nb = $('cp-nb'), gros = $('cp-gros'), eng = $('cp-eng'),
      total = $('cp-total'), meter = $('cp-meter'), out = $('cp-out'), copy = $('cp-copy');
  if (!nb || !out) return;

  /* Grille publiée sur claude.com/pricing, relevée le 11 août 2026.
     Montants annuels par personne, en dollars hors taxes. */
  var TARIF = {
    pro:            { annuel: 200,  mensuel: 240 },   // 17 $/mois en annuel payé d'avance, 20 $/mois au mois
    max:            { annuel: 1200, mensuel: 1200 },  // à partir de 100 $/mois, mensuel uniquement
    teamStandard:   { annuel: 240,  mensuel: 300 },   // 20 $/siège/mois en annuel, 25 $ au mois
    teamPremium:    { annuel: 1200, mensuel: 1500 }   // 100 $/siège/mois en annuel, 125 $ au mois
  };

  function dollars(n) {
    /* espaces fines insécables normalisées, sinon la copie colle mal ailleurs */
    return n.toLocaleString('fr-FR').replace(/[\u202f\u00a0]/g, ' ') + ' $';
  }

  function lire() {
    var n = Math.max(1, Math.min(150, parseInt(nb.value, 10) || 1));
    var g = Math.max(0, Math.min(n, parseInt(gros.value, 10) || 0));
    if (parseInt(nb.value, 10) !== n) nb.value = n;
    if (parseInt(gros.value, 10) !== g) gros.value = g;
    return { n: n, g: g, e: eng.value === 'mensuel' ? 'mensuel' : 'annuel' };
  }

  function scenarios(r) {
    var normaux = r.n - r.g;
    var s = [];

    s.push({
      nom: 'Abonnements individuels',
      detail: normaux + ' × Pro' + (r.g ? ' et ' + r.g + ' × Max' : ''),
      cout: normaux * TARIF.pro[r.e] + r.g * TARIF.max[r.e],
      note: "Chacun paie et gère son compte. Pas de facturation centralisée, pas d'administration commune."
    });

    s.push({
      nom: 'Formule Team',
      detail: normaux + ' × siège Standard' + (r.g ? ' et ' + r.g + ' × siège Premium' : ''),
      cout: normaux * TARIF.teamStandard[r.e] + r.g * TARIF.teamPremium[r.e],
      note: "Facturation unique, authentification centralisée et contrôles d'administration."
    });

    if (normaux > 0) {
      s.push({
        nom: 'Mixte, gratuit pour les usages légers',
        detail: (r.g ? r.g + ' × Max et ' : '') + 'le reste sur la formule gratuite',
        cout: r.g * TARIF.max[r.e],
        conditionnel: true,
        note: "Valable seulement si les usages légers tiennent dans les limites de la formule gratuite, et sans Claude Code."
      });
    }

    s.sort(function (a, b) { return a.cout - b.cout; });
    return s;
  }

  function afficher() {
    var r = lire();
    var s = scenarios(r);
    /* le scénario gratuit gagne toujours sur le prix : il reste dans la liste,
       mais le chiffre mis en avant est la moins chère des options complètes. */
    var payantes = s.filter(function (x) { return !x.conditionnel; });
    var moins = payantes[0] || s[0];

    total.textContent = dollars(moins.cout) + ' par an';
    if (meter) meter.style.width = Math.min(100, Math.round((r.n / 25) * 100)) + '%';

    out.textContent = '';

    var chapeau = document.createElement('p');
    chapeau.textContent = r.n + (r.n > 1 ? ' personnes, dont ' : ' personne, dont ') + r.g +
      ' à usage intensif. Engagement ' + r.e + '. Montants en dollars hors taxes, par an.';
    out.appendChild(chapeau);

    var ul = document.createElement('ul');
    s.forEach(function (x) {
      var li = document.createElement('li');
      var b = document.createElement('strong');
      b.textContent = x.nom + ' : ' + dollars(x.cout) + '. ';
      li.appendChild(b);
      li.appendChild(document.createTextNode(x.detail + '. ' + x.note));
      ul.appendChild(li);
    });
    out.appendChild(ul);

    var p = document.createElement('p');
    var b2 = document.createElement('strong');
    b2.textContent = 'Ce que le calcul ne dit pas. ';
    p.appendChild(b2);
    p.appendChild(document.createTextNode(
      r.e === 'annuel'
        ? "L'engagement annuel de la formule Pro se paie d'avance, en une fois. La formule Max n'existe qu'au mois : son montant ne bouge pas selon l'engagement."
        : "Passer à l'engagement annuel fait baisser la facture de quinze pour cent sur Pro et de vingt pour cent sur les sièges Team. La formule Max n'existe qu'au mois."));
    out.appendChild(p);

    return { r: r, s: s };
  }

  function copier() {
    var d = afficher();
    var lignes = ['Coût annuel de Claude, ' + d.r.n + ' personne(s), dont ' + d.r.g + ' à usage intensif',
                  'Engagement ' + d.r.e + ', dollars hors taxes', ''];
    d.s.forEach(function (x) { lignes.push('- ' + x.nom + ' : ' + dollars(x.cout) + ' par an (' + x.detail + ')'); });
    lignes.push('', 'Grille Anthropic, calcul : anthony-courtin.com/blog/claude-ai-prix');
    var texte = lignes.join('\n');
    var fini = function (ok) {
      if (!copy) return;
      var a = copy.textContent;
      copy.textContent = ok ? 'Copié' : 'Copie impossible';
      setTimeout(function () { copy.textContent = a; }, 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texte).then(function () { fini(true); }, function () { fini(false); });
    } else { fini(false); }
  }

  [nb, gros].forEach(function (el) { el.addEventListener('input', afficher); el.addEventListener('change', afficher); });
  eng.addEventListener('change', afficher);
  if (copy) copy.addEventListener('click', copier);
  afficher();
})();
