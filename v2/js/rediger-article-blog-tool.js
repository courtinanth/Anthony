/* Générateur de plan d'article de blog pour l'article rediger-article-blog-2026.
   Un mot-clé, un type d'article : le modèle de structure rempli, à copier.
   100 % navigateur, aucun appel réseau. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var mot = $('pa-mot'), type = $('pa-type'), pub = $('pa-public'),
      long = $('pa-long'), out = $('pa-out'), copy = $('pa-copy'),
      gpt = $('pa-gpt'), claude = $('pa-claude');
  if (!mot || !type || !out) return;

  var ANNEE = new Date().getFullYear();

  var TYPES = {
    tuto: {
      mots: '1 500 à 2 500 mots',
      titres: function (K) { return [K + ' : la méthode en [N] étapes', K + ' : le guide pas à pas (' + ANNEE + ')', K + ' en [N] étapes (+ exemple)']; },
      plan: function (K, k) { return [
        'H2 : ' + K + ' : les étapes en bref (liste numérotée, une ligne par étape)',
        'H2 : Comment ' + sansComment(k) + ' : les [N] étapes',
        '     H3 : Étape 1, [action]',
        '     H3 : Étape 2, [action]',
        '     H3 : Étape 3, [action]',
        'H2 : Exemple concret : [cas réel, capture ou modèle]',
        'H2 : Les erreurs à éviter',
        'H2 : Questions fréquentes'
      ]; },
      faq: ['Combien de temps faut-il pour ' + '[action] ?', 'Quels outils utiliser ?', 'Peut-on le faire gratuitement ?']
    },
    liste: {
      mots: '2 000 à 4 000 mots',
      titres: function (K) { return [K + ' : [N] exemples à copier', K + ' : [N] conseils qui marchent (' + ANNEE + ')', '[N] idées pour ' + minus(K) + ' (+ modèle)']; },
      plan: function (K, k) { return [
        'H2 : [N] exemples de ' + k + ', classés par [usage, niveau, budget]',
        '     H3 : 1. [exemple ou conseil], avec pourquoi il fonctionne',
        '     H3 : 2. [exemple ou conseil]',
        '     H3 : 3. [exemple ou conseil]',
        'H2 : Comment choisir celui qui vous convient',
        'H2 : Les erreurs à éviter',
        'H2 : Questions fréquentes'
      ]; },
      faq: ['Quel est le meilleur exemple pour débuter ?', 'Ces exemples sont-ils gratuits ?', 'Comment adapter un exemple à mon cas ?']
    },
    definition: {
      mots: '1 500 à 2 500 mots',
      titres: function (K) { return [K + ' : définition, exemples et fonctionnement', "C'est quoi " + minus(K) + ' ? Définition simple (' + ANNEE + ')', K + ' : ce que c\'est et à quoi ça sert']; },
      plan: function (K, k) { return [
        "H2 : C'est quoi " + k + ' ? (définition en deux phrases)',
        'H2 : Comment fonctionne ' + k,
        'H2 : Exemples de ' + k,
        'H2 : Avantages et limites',
        'H2 : ' + K + ' et [notion voisine] : la différence',
        'H2 : Questions fréquentes'
      ]; },
      faq: ["Quelle est la différence avec [notion voisine] ?", 'Est-ce gratuit ?', 'Comment commencer ?']
    },
    comparatif: {
      mots: '2 500 à 4 000 mots',
      titres: function (K) { return [K + ' : lequel choisir en ' + ANNEE + ' ?', K + ' : comparatif, prix et verdict', K + ' : le match sur [N] critères']; },
      plan: function (K, k) { return [
        'H2 : Le verdict en bref (tableau : critère, option A, option B)',
        'H2 : Les critères de comparaison',
        'H2 : [Option A] : points forts, limites, pour qui',
        'H2 : [Option B] : points forts, limites, pour qui',
        'H2 : Prix comparés (avec la date du relevé)',
        'H2 : Lequel choisir selon votre cas',
        'H2 : Questions fréquentes'
      ]; },
      faq: ['Lequel est le moins cher ?', 'Lequel choisir pour débuter ?', 'Peut-on passer de l\'un à l\'autre ?']
    }
  };

  function nettoie(s) { return (s || '').replace(/\s+/g, ' ').trim(); }
  function maj(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  function minus(s) { return s ? s.charAt(0).toLowerCase() + s.slice(1) : s; }
  function sansComment(s) { return s.replace(/^comment\s+/i, ''); }

  function construire() {
    var k = nettoie(mot.value) || '[votre mot-clé]';
    var K = maj(k);
    var t = TYPES[type.value] || TYPES.tuto;
    var lecteur = nettoie(pub.value) || '[qui, quel niveau, quel problème]';
    var titres = t.titres(K);

    var l = [];
    l.push('MOT-CLÉ PRINCIPAL : ' + k);
    l.push('LECTEUR VISÉ : ' + lecteur);
    l.push('LONGUEUR INDICATIVE : ' + t.mots);
    l.push('');
    l.push('BALISE TITLE (une soixantaine de caractères), trois pistes :');
    titres.forEach(function (x) { l.push('- ' + x + '  (' + x.length + ' car.)'); });
    l.push('');
    l.push('META DESCRIPTION (120 à 155 caractères) :');
    l.push(K + ' : [ce que le lecteur obtient] + [ce qu\'il trouve : exemple, modèle, outil].');
    l.push('');
    l.push('H1 : ' + titres[0]);
    l.push('');
    l.push('INTRODUCTION (3 à 5 phrases) :');
    l.push('La réponse à « ' + k + ' » en deux phrases, avec le mot-clé.');
    l.push('Puis ce que contient l\'article, en une phrase.');
    l.push('');
    l.push('À RETENIR : 3 à 5 puces compréhensibles seules.');
    l.push('');
    t.plan(K, k).forEach(function (x) { l.push(x); });
    l.push('');
    l.push('QUESTIONS DE FAQ À VÉRIFIER (bloc « Autres questions posées ») :');
    t.faq.forEach(function (x) { l.push('- ' + x); });
    l.push('');
    l.push('ÉTAPE SUIVANTE : un lien vers [article qui approfondit] ou [page de service].');
    l.push('');
    l.push('AVANT DE PUBLIER :');
    l.push('[ ] Mot-clé dans la balise title, le H1, l\'introduction et un H2');
    l.push('[ ] Un exemple, un chiffre sourcé ou une capture dans chaque H2');
    l.push('[ ] 3 à 5 liens internes, dont une page de service');
    l.push('[ ] Images compressées, avec un texte alternatif');
    l.push('[ ] Relecture à voix haute, 10 à 20 % du texte coupé');
    return { texte: l.join('\n'), mots: t.mots, k: k };
  }

  function rendre() {
    var r = construire();
    out.textContent = r.texte;
    if (long) long.textContent = r.mots;
    var demande = 'Voici le plan d\'un article de blog sur « ' + r.k + ' ». Critique-le comme un rédacteur en chef exigeant : ' +
      'sections qui manquent par rapport à ce que cherche ce lecteur, sections inutiles, ordre à revoir, titres trop vagues. ' +
      'Propose ensuite le plan corrigé, sans rédiger l\'article.\n\n' + r.texte;
    var enc = encodeURIComponent(demande);
    if (gpt) gpt.href = 'https://chatgpt.com/?q=' + enc;
    if (claude) claude.href = 'https://claude.ai/new?q=' + enc;
    return r;
  }

  function copier() {
    var r = rendre();
    var texte = r.texte + '\n\nModèle : anthony-courtin.com/blog/rediger-article-blog-2026';
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

  [mot, pub].forEach(function (el) { el.addEventListener('input', rendre); });
  type.addEventListener('change', rendre);
  if (copy) copy.addEventListener('click', copier);
  rendre();
})();
