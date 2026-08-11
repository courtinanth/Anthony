/* Index filtrable du glossaire SEO et GEO 2026.
   Recherche par mot, filtre par famille, et bascule « nouveautés seulement ».
   100 % navigateur, aucun appel réseau. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var q = $('gl-q'), fam = $('gl-fam'), neuf = $('gl-neuf'),
      total = $('gl-total'), out = $('gl-out'), copy = $('gl-copy');
  if (!q || !out) return;

  /* n : terme apparu ou redéfini depuis l'arrivée des moteurs de réponse. */
  var TERMES = [
    { t: 'SEO', f: 'bases', d: "Search Engine Optimization : l'ensemble des actions qui font apparaître une page dans les résultats naturels d'un moteur." },
    { t: 'SERP', f: 'bases', d: "La page de résultats elle-même, avec ses liens, ses blocs et, depuis 2024, sa réponse générée en tête." },
    { t: 'Crawl', f: 'bases', d: "Le passage d'un robot sur vos pages pour en lire le contenu. Sans crawl, pas d'index." },
    { t: 'Index', f: 'bases', d: "La base de données du moteur. Une page crawlée n'est pas forcément indexée, et une page non indexée n'existe pas." },
    { t: 'Algorithme', f: 'bases', d: "L'ensemble des règles de classement. Il n'y en a pas un mais des dizaines, combinés." },
    { t: 'Intention de recherche', f: 'bases', d: "Ce que veut vraiment la personne qui tape la requête : comprendre, faire, comparer ou acheter." },
    { t: 'Requête', f: 'bases', d: "Ce qui est tapé ou dicté. À distinguer du mot-clé, qui est votre façon de la regrouper." },
    { t: 'Référencement naturel', f: 'bases', d: "Le nom français du SEO, par opposition aux liens payants." },

    { t: 'Balise title', f: 'technique', d: "Le titre de la page dans le code. Premier signal de pertinence, et texte du lien affiché dans les résultats." },
    { t: 'Meta description', f: 'technique', d: "Le résumé sous le titre dans les résultats. Sans effet direct sur le classement, effet réel sur le clic." },
    { t: 'Canonical', f: 'technique', d: "La balise qui désigne la version de référence d'une page quand plusieurs URL affichent le même contenu." },
    { t: 'Redirection 301', f: 'technique', d: "Le renvoi permanent d'une ancienne adresse vers une nouvelle. Transmet l'essentiel de la valeur acquise." },
    { t: 'Robots.txt', f: 'technique', d: "Le fichier qui autorise ou interdit le passage des robots. Il bloque le crawl, pas l'indexation." },
    { t: 'Sitemap', f: 'technique', d: "La liste de vos pages, au format XML, remise au moteur pour l'aider à ne rien manquer." },
    { t: 'Core Web Vitals', f: 'technique', d: "Trois mesures d'expérience de chargement : affichage du contenu principal, réactivité et stabilité visuelle." },
    { t: 'Données structurées', f: 'technique', d: "Un balisage normalisé, souvent schema.org, qui déclare explicitement ce que contient la page." },
    { t: 'Budget de crawl', f: 'technique', d: "Le volume de pages qu'un robot accepte de lire chez vous sur une période. Sujet réel au-delà de quelques milliers d'URL." },
    { t: 'llms.txt', f: 'technique', d: "Un fichier proposé pour indiquer aux modèles de langage quels contenus lire en priorité. Adoption encore partielle.", n: true },
    { t: 'Rendu JavaScript', f: 'technique', d: "L'étape où le moteur exécute le code d'une page pour en voir le contenu final. Coûteuse, donc parfois différée." },
    { t: 'Expérience utilisateur', f: 'technique', d: "La qualité du parcours du point de vue du visiteur : trouver, comprendre, agir. Mesurée indirectement par plusieurs signaux." },

    { t: 'Mot-clé', f: 'contenu', d: "L'expression que vous ciblez. Unité de travail commode, mais dépassée : raisonnez par intention." },
    { t: 'Longue traîne', f: 'contenu', d: "Les requêtes rares et précises. Peu de volume chacune, l'essentiel du total, et bien moins disputées." },
    { t: 'Maillage interne', f: 'contenu', d: "Les liens entre vos propres pages. Ils distribuent la valeur et disent au moteur ce qui compte chez vous." },
    { t: 'Cocon sémantique', f: 'contenu', d: "Une organisation en arbre où une page pilier couvre un sujet et où les pages filles en traitent les branches." },
    { t: 'Cannibalisation', f: 'contenu', d: "Deux pages du même site qui visent la même intention et s'affaiblissent mutuellement." },
    { t: 'EEAT', f: 'contenu', d: "Expérience, expertise, autorité, fiabilité. Une grille d'évaluation humaine, pas un score calculé." },
    { t: 'Contenu utile', f: 'contenu', d: "Le critère mis en avant par Google depuis 2022 : écrit pour une personne, pas pour remplir une page." },
    { t: 'Refresh', f: 'contenu', d: "La reprise d'un contenu existant plutôt que la production d'un nouveau. Le meilleur rendement d'un plan éditorial." },
    { t: 'Brief de contenu', f: 'contenu', d: "La commande passée au rédacteur : intention visée, angle, plan, sources et critères d'acceptation." },
    { t: 'Signaux sociaux', f: 'contenu', d: "Partages et mentions sur les réseaux sociaux. Pas un facteur de classement direct, malgré ce qui se raconte." },

    { t: 'Backlink', f: 'liens', d: "Un lien reçu depuis un autre site. La monnaie historique de l'autorité." },
    { t: 'Netlinking', f: 'liens', d: "Le travail d'obtention de ces liens, du partenariat au contenu qu'on cite spontanément." },
    { t: 'Ancre', f: 'liens', d: "Le texte cliquable du lien. Il annonce le sujet de la page d'arrivée." },
    { t: 'Nofollow, sponsored, ugc', f: 'liens', d: "Des attributs qui signalent un lien non endossé, payé ou déposé par un visiteur." },
    { t: 'Autorité de domaine', f: 'liens', d: "Un score inventé par les outils du marché, pas par Google. Utile pour comparer, jamais comme objectif." },
    { t: 'Black hat', f: 'liens', d: "Les techniques contraires aux règles des moteurs. Rendement rapide, risque durable." },

    { t: "Fiche d'établissement", f: 'local', d: "Le profil d'entreprise Google : la carte d'identité de votre établissement, et la pièce maîtresse en local." },
    { t: 'Pack local', f: 'local', d: "Le bloc de trois établissements avec carte, affiché au-dessus des résultats classiques." },
    { t: 'NAP', f: 'local', d: "Nom, adresse, téléphone. Leur cohérence sur tout le web confirme l'existence de l'établissement." },
    { t: 'Citation locale', f: 'local', d: "Une mention de vos coordonnées sur un site tiers, avec ou sans lien." },
    { t: 'Zone de chalandise', f: 'local', d: "Le territoire d'où viennent réellement vos clients. Il commande vos pages et vos priorités." },

    { t: 'GEO', f: 'geo', d: "Generative Engine Optimization : rendre un contenu reprenable par les moteurs qui rédigent la réponse.", n: true },
    { t: 'AEO', f: 'geo', d: "Answer Engine Optimization. Synonyme commercial de GEO dans la plupart des usages.", n: true },
    { t: 'Moteur de réponse', f: 'geo', d: "Un système qui compose une réponse au lieu de lister des liens : ChatGPT, Perplexity, Gemini, AI Overviews.", n: true },
    { t: 'AI Overviews', f: 'geo', d: "La synthèse générée que Google affiche au-dessus des résultats, avec quelques sources citées.", n: true },
    { t: 'Citabilité', f: 'geo', d: "L'aptitude d'un passage à être repris tel quel : une affirmation autonome, datée, attribuable.", n: true },
    { t: 'RAG', f: 'geo', d: "Retrieval Augmented Generation : le modèle va chercher des documents avant de répondre. C'est là que vos pages entrent en jeu.", n: true },
    { t: 'Grounding', f: 'geo', d: "L'ancrage d'une réponse générée dans des sources vérifiables plutôt que dans la seule mémoire du modèle.", n: true },
    { t: 'Hallucination', f: 'geo', d: "Une affirmation inventée par un modèle, énoncée avec le même aplomb qu'un fait vérifié.", n: true },
    { t: 'LLM', f: 'geo', d: "Large Language Model : le modèle de langage derrière ces moteurs. Il prédit du texte, il ne consulte pas une base de faits.", n: true },
    { t: 'Fenêtre de contexte', f: 'geo', d: "La quantité de texte qu'un modèle garde sous les yeux pendant un échange. Elle limite ce qu'il peut lire de vous.", n: true },
    { t: 'IA générative', f: 'geo', d: "La famille de systèmes qui produisent du texte ou des images au lieu de classer. C'est elle qui a changé la recherche.", n: true },
    { t: 'Part de citation', f: 'geo', d: "La proportion de réponses générées où votre marque est citée, sur un panel de questions donné.", n: true },

    { t: 'Impressions', f: 'mesure', d: "Le nombre de fois où votre page est apparue dans les résultats. Le dénominateur de tout le reste." },
    { t: 'CTR', f: 'mesure', d: "Le taux de clic : clics divisés par impressions. Le meilleur signal pour juger un titre." },
    { t: 'Position moyenne', f: 'mesure', d: "Une moyenne trompeuse dès qu'une page ressort sur des dizaines de requêtes. À manier avec prudence." },
    { t: 'Trafic organique', f: 'mesure', d: "Les visites venues des résultats naturels, hors publicité et hors liens directs." },
    { t: 'Taux de rebond', f: 'mesure', d: "La part de visites sans seconde action. Indicateur ambigu : une réponse trouvée du premier coup rebondit aussi." },
    { t: 'Search Console', f: 'mesure', d: "L'outil gratuit de Google qui donne vos requêtes, vos clics et vos problèmes d'indexation. Non négociable." },
    { t: 'Conversion', f: 'mesure', d: "L'action que vous attendez du visiteur. Le seul indicateur qui intéresse vraiment une entreprise." }
  ];

  var FAMILLES = { bases: 'Les bases', technique: 'Technique', contenu: 'Contenu',
                   liens: 'Liens', local: 'Local', geo: 'Moteurs de réponse', mesure: 'Mesure' };

  function sansAccent(s) {
    return s.toLowerCase().normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[\u2018\u2019]/g, "'");
  }

  function filtrer() {
    var mot = sansAccent(q.value.trim());
    var f = fam.value;
    var seulNeuf = neuf && neuf.checked;
    return TERMES.filter(function (x) {
      if (f !== 'tous' && x.f !== f) return false;
      if (seulNeuf && !x.n) return false;
      if (!mot) return true;
      return sansAccent(x.t).indexOf(mot) !== -1 || sansAccent(x.d).indexOf(mot) !== -1;
    });
  }

  function afficher() {
    var res = filtrer();
    total.textContent = res.length + (res.length > 1 ? ' termes' : ' terme');

    out.textContent = '';
    if (!res.length) {
      var vide = document.createElement('p');
      vide.textContent = "Aucun terme ne correspond. Essayez un mot plus court, ou repassez la famille sur « toutes ».";
      out.appendChild(vide);
      return res;
    }

    var ul = document.createElement('ul');
    res.forEach(function (x) {
      var li = document.createElement('li');
      var b = document.createElement('strong');
      b.textContent = x.t;
      li.appendChild(b);
      if (x.n) {
        li.appendChild(document.createTextNode(' '));
        var tag = document.createElement('span');
        tag.className = 'tag-ia';
        tag.textContent = 'nouveau';
        li.appendChild(tag);
      }
      li.appendChild(document.createTextNode(' : ' + x.d));
      ul.appendChild(li);
    });
    out.appendChild(ul);
    return res;
  }

  function copier() {
    var res = afficher();
    var texte = res.map(function (x) { return x.t + ' : ' + x.d; })
      .concat(['', 'Source : anthony-courtin.com/blog/glossaire-geo']).join('\n');
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

  /* Les familles sont remplies depuis les données : une entrée ajoutée suffit. */
  Object.keys(FAMILLES).forEach(function (k) {
    if (!TERMES.some(function (x) { return x.f === k; })) return;
    var o = document.createElement('option');
    o.value = k;
    o.textContent = FAMILLES[k];
    fam.appendChild(o);
  });

  q.addEventListener('input', afficher);
  fam.addEventListener('change', afficher);
  if (neuf) neuf.addEventListener('change', afficher);
  if (copy) copy.addEventListener('click', copier);
  afficher();
})();
