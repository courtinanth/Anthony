/* Index filtrable du glossaire SEO et GEO : 90 termes.
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
    { t: 'SEO', f: 'bases', d: "Search Engine Optimization, ou référencement naturel : l'ensemble des actions qui font apparaître une page dans les résultats non payants d'un moteur." },
    { t: 'SEA', f: 'bases', d: "Search Engine Advertising : les annonces payantes des moteurs, Google Ads en tête. Le trafic s'arrête avec le budget." },
    { t: 'SEM', f: 'bases', d: "Search Engine Marketing : SEO et SEA réunis, toute la visibilité dans les moteurs, payante ou non." },
    { t: 'SERP', f: 'bases', d: "La page de résultats elle-même, avec ses liens, ses blocs et, en France depuis juillet 2026, l'Aperçu IA en tête." },
    { t: 'Position zéro', f: 'bases', d: "L'extrait optimisé (featured snippet) : un passage de page affiché en encadré au-dessus des résultats, avec sa source." },
    { t: 'Autres questions posées', f: 'bases', d: "Le bloc de questions dépliables de la page de résultats (People Also Ask). La source gratuite des questions réelles." },
    { t: 'Crawl', f: 'bases', d: "Le passage d'un robot sur vos pages pour en lire le contenu. Sans crawl, pas d'index." },
    { t: 'Googlebot', f: 'bases', d: "Le robot d'exploration de Google. C'est sa version smartphone qui lit désormais tous les sites." },
    { t: 'Index', f: 'bases', d: "La base de données du moteur. Une page crawlée n'est pas forcément indexée, et une page non indexée n'existe pas." },
    { t: 'Algorithme', f: 'bases', d: "L'ensemble des règles de classement. Il n'y en a pas un mais des dizaines, combinés." },
    { t: 'Mise à jour principale', f: 'bases', d: "Une core update : une modification importante du classement, annoncée par Google plusieurs fois par an. Une réévaluation, pas une pénalité." },
    { t: 'Intention de recherche', f: 'bases', d: "Ce que veut vraiment la personne qui tape la requête : comprendre, faire, comparer ou acheter." },
    { t: 'Requête', f: 'bases', d: "Ce qui est tapé ou dicté. À distinguer du mot-clé, qui est votre façon de la regrouper." },
    { t: 'Trafic organique', f: 'bases', d: "Les visites venues des résultats naturels, hors publicité et hors accès direct." },
    { t: 'SEO technique', f: 'bases', d: "Le premier des trois types de SEO : ce qui permet aux robots d'explorer, de comprendre et d'indexer le site." },
    { t: 'SEO on-page', f: 'bases', d: "Ce qui se travaille sur la page elle-même : contenu, balise title, intertitres, maillage interne." },
    { t: 'SEO off-page', f: 'bases', d: "Ce qui se passe hors du site et pèse sur sa réputation : liens reçus, mentions, avis." },

    { t: 'Balise title', f: 'technique', d: "Le titre de la page dans le code. Premier signal de pertinence, et texte du lien affiché dans les résultats." },
    { t: 'Meta description', f: 'technique', d: "Le résumé sous le titre dans les résultats. Sans effet direct sur le classement, effet réel sur le clic." },
    { t: 'Balises Hn', f: 'technique', d: "Les titres et intertitres de H1 à H6. Une seule H1 pour le sujet, des H2 et H3 pour structurer la réponse." },
    { t: 'Attribut alt', f: 'technique', d: "Le texte alternatif d'une image, lu par les lecteurs d'écran et les moteurs. Il décrit l'image, sans empiler de mots-clés." },
    { t: 'Canonical', f: 'technique', d: "La balise qui désigne la version de référence d'une page quand plusieurs URL affichent le même contenu." },
    { t: 'Redirection 301', f: 'technique', d: "Le renvoi permanent d'une ancienne adresse vers une nouvelle. Transmet l'essentiel de la valeur acquise." },
    { t: 'Erreur 404', f: 'technique', d: "La réponse du serveur pour une page inexistante. Un lien qui y mène est de la valeur perdue, à rediriger." },
    { t: 'Contenu dupliqué', f: 'technique', d: "Le même texte à plusieurs adresses. Rarement une pénalité, presque toujours une dilution." },
    { t: 'Robots.txt', f: 'technique', d: "Le fichier qui autorise ou interdit le passage des robots. Il bloque le crawl, pas l'indexation." },
    { t: 'Sitemap', f: 'technique', d: "La liste de vos pages, au format XML, remise au moteur pour l'aider à ne rien manquer." },
    { t: 'Core Web Vitals', f: 'technique', d: "Trois mesures d'expérience de chargement : affichage du contenu principal, réactivité et stabilité visuelle." },
    { t: 'Indexation mobile first', f: 'technique', d: "Google indexe la version mobile des pages. Depuis le 5 juillet 2024, un site inaccessible sur mobile n'est plus indexé." },
    { t: 'HTTPS', f: 'technique', d: "La version chiffrée du protocole web. Signal de classement léger depuis 2014, prérequis aujourd'hui." },
    { t: 'Données structurées', f: 'technique', d: "Un balisage normalisé, souvent schema.org, qui déclare explicitement ce que contient la page." },
    { t: 'Budget de crawl', f: 'technique', d: "Le volume de pages qu'un robot accepte de lire chez vous sur une période. Sujet réel au-delà de quelques milliers d'URL." },
    { t: 'Rendu JavaScript', f: 'technique', d: "L'étape où le moteur exécute le code d'une page pour en voir le contenu final. Coûteuse, donc parfois différée." },
    { t: 'Expérience utilisateur', f: 'ux', d: "La qualité du parcours du point de vue du visiteur : trouver, comprendre, agir. Mesurée indirectement par plusieurs signaux." },
    { t: 'Vitesse de chargement', f: 'ux', d: "Le temps avant que le contenu principal soit visible. Facteur de classement mineur, facteur de conversion majeur." },
    { t: 'Navigation', f: 'ux', d: "La structure qui mène à n'importe quelle page en quelques clics. Elle sert le visiteur comme le robot." },
    { t: 'Ergonomie mobile', f: 'ux', d: "L'adaptation réelle au petit écran : zones cliquables assez grandes, texte lisible sans zoom, formulaires courts." },

    { t: 'Mot-clé', f: 'contenu', d: "L'expression que vous ciblez. Unité de travail commode, mais dépassée : raisonnez par intention." },
    { t: 'Champ sémantique', f: 'contenu', d: "Les mots et notions associés à un sujet. Un texte complet l'emploie naturellement, sans liste forcée." },
    { t: 'Longue traîne', f: 'contenu', d: "Les requêtes rares et précises. Peu de volume chacune, l'essentiel du total, et bien moins disputées." },
    { t: 'Maillage interne', f: 'contenu', d: "Les liens entre vos propres pages. Ils distribuent la valeur et disent au moteur ce qui compte chez vous." },
    { t: 'Cocon sémantique', f: 'contenu', d: "Une organisation en arbre où une page pilier couvre un sujet et où les pages filles en traitent les branches." },
    { t: 'Cannibalisation', f: 'contenu', d: "Deux pages du même site qui visent la même intention et s'affaiblissent mutuellement." },
    { t: 'EEAT', f: 'contenu', d: "Expérience, expertise, autorité, fiabilité. Une grille d'évaluation humaine, pas un score calculé." },
    { t: 'Contenu utile', f: 'contenu', d: "Le critère mis en avant par Google depuis 2022 : écrit pour une personne, pas pour remplir une page." },
    { t: 'Refresh', f: 'contenu', d: "La reprise d'un contenu existant plutôt que la production d'un nouveau. Le meilleur rendement d'un plan éditorial." },
    { t: 'Brief de contenu', f: 'contenu', d: "La commande passée au rédacteur : intention visée, angle, plan, sources et critères d'acceptation." },
    { t: 'Densité de mots-clés', f: 'contenu', d: "Le pourcentage d'occurrences d'un terme. Notion périmée : aucun moteur ne raisonne ainsi." },
    { t: 'Signaux sociaux', f: 'social', d: "Partages et mentions sur les réseaux sociaux. Pas un facteur de classement direct, malgré ce qui se raconte." },
    { t: 'Social media optimization', f: 'social', d: "L'optimisation des publications sur les réseaux sociaux. Un travail utile, distinct du référencement." },

    { t: 'Backlink', f: 'liens', d: "Un lien reçu depuis un autre site. La monnaie historique de l'autorité." },
    { t: 'Domaine référent', f: 'liens', d: "Un site distinct qui fait au moins un lien vers le vôtre. Plus parlant que le nombre de backlinks." },
    { t: 'Netlinking', f: 'liens', d: "Le travail d'obtention de ces liens, du partenariat au contenu cité spontanément." },
    { t: 'Ancre', f: 'liens', d: "Le texte cliquable du lien. Il annonce le sujet de la page d'arrivée." },
    { t: 'Nofollow, sponsored, ugc', f: 'liens', d: "Des attributs qui signalent un lien non endossé, payé ou déposé par un visiteur." },
    { t: 'Autorité de domaine', f: 'liens', d: "Un score inventé par les outils du marché, pas par Google. Utile pour comparer, jamais comme objectif." },
    { t: 'Black hat', f: 'liens', d: "Les techniques contraires aux règles des moteurs. Rendement rapide, risque durable." },
    { t: 'White hat', f: 'liens', d: "Les pratiques conformes aux consignes publiées des moteurs. Plus lent, et tenable dans la durée." },
    { t: 'Action manuelle', f: 'liens', d: "La sanction appliquée par un examinateur de Google pour infraction aux règles anti-spam, visible dans la Search Console." },

    { t: "Fiche d'établissement", f: 'local', d: "Le profil d'entreprise Google : la carte d'identité de votre établissement, et la pièce maîtresse en local." },
    { t: 'Pack local', f: 'local', d: "Le bloc de trois établissements avec carte, affiché au-dessus des résultats classiques." },
    { t: 'NAP', f: 'local', d: "Nom, adresse, téléphone. Leur cohérence sur tout le web confirme l'existence de l'établissement." },
    { t: 'Citation locale', f: 'local', d: "Une mention de vos coordonnées sur un site tiers, avec ou sans lien." },
    { t: 'Zone de chalandise', f: 'local', d: "Le territoire d'où viennent réellement vos clients. Il commande vos pages et vos priorités." },

    { t: 'GEO', f: 'geo', d: "Generative Engine Optimization : rendre un contenu reprenable par les moteurs qui rédigent la réponse.", n: true },
    { t: 'AEO', f: 'geo', d: "Answer Engine Optimization. Synonyme commercial de GEO dans la plupart des usages.", n: true },
    { t: 'Moteur de réponse', f: 'geo', d: "Un système qui compose une réponse au lieu de lister des liens : ChatGPT, Perplexity, Gemini, Aperçus IA.", n: true },
    { t: 'AI Overviews', f: 'geo', d: "Les Aperçus IA : la synthèse que Google affiche au-dessus des résultats, avec quelques sources citées. En France depuis le 22 juillet 2026.", n: true },
    { t: 'Mode IA', f: 'geo', d: "Le mode de recherche conversationnel de Google, lancé en France le même jour que les Aperçus IA.", n: true },
    { t: 'Citabilité', f: 'geo', d: "L'aptitude d'un passage à être repris tel quel : une affirmation autonome, datée, attribuable.", n: true },
    { t: 'RAG', f: 'geo', d: "Retrieval Augmented Generation : le modèle va chercher des documents avant de répondre. C'est là que vos pages entrent en jeu.", n: true },
    { t: 'Grounding', f: 'geo', d: "L'ancrage d'une réponse générée dans des sources vérifiables plutôt que dans la seule mémoire du modèle.", n: true },
    { t: 'Hallucination', f: 'geo', d: "Une affirmation inventée par un modèle, énoncée avec le même aplomb qu'un fait vérifié.", n: true },
    { t: 'LLM', f: 'geo', d: "Large Language Model : le modèle de langage derrière ces moteurs. Il prédit du texte, il ne consulte pas une base de faits.", n: true },
    { t: 'Fenêtre de contexte', f: 'geo', d: "La quantité de texte qu'un modèle garde sous les yeux pendant un échange. Elle limite ce qu'il peut lire de vous.", n: true },
    { t: 'llms.txt', f: 'geo', d: "Un fichier proposé en septembre 2024 pour indiquer aux modèles de langage quels contenus lire. Adoption partielle, effet à démontrer.", n: true },
    { t: 'IA générative', f: 'ia', d: "La famille de systèmes qui produisent du texte ou des images au lieu de classer. C'est elle qui a changé la recherche.", n: true },
    { t: 'Traitement du langage naturel', f: 'ia', d: "La discipline qui apprend à une machine à manipuler le langage humain, bien avant les modèles génératifs." },
    { t: 'Token', f: 'ia', d: "L'unité de découpage du texte par un modèle, souvent un fragment de mot. Les tarifs des API se comptent en tokens.", n: true },
    { t: 'Prompt', f: 'ia', d: "L'instruction donnée au modèle. Ce qui change le résultat est surtout le contexte fourni.", n: true },
    { t: 'Agent', f: 'ia', d: "Un modèle autorisé à enchaîner des actions, appeler des outils et boucler jusqu'à un résultat.", n: true },
    { t: 'Fine-tuning', f: 'ia', d: "Le réentraînement d'un modèle sur vos données. Coûteux, rarement nécessaire.", n: true },
    { t: 'Part de citation', f: 'geo', d: "La proportion de réponses générées où votre marque est citée, sur un panel de questions donné.", n: true },

    { t: 'Impressions', f: 'mesure', d: "Le nombre de fois où votre page est apparue dans les résultats. Le dénominateur de tout le reste." },
    { t: 'CTR', f: 'mesure', d: "Le taux de clic : clics divisés par impressions. Le meilleur signal pour juger un titre." },
    { t: 'Position moyenne', f: 'mesure', d: "Une moyenne trompeuse dès qu'une page ressort sur des dizaines de requêtes. À manier avec prudence." },
    { t: 'Taux de rebond', f: 'mesure', d: "La part de visites sans seconde action. Indicateur ambigu : une réponse trouvée du premier coup rebondit aussi." },
    { t: 'Search Console', f: 'mesure', d: "L'outil gratuit de Google qui donne vos requêtes, vos clics et vos problèmes d'indexation. Non négociable." },
    { t: 'Google Analytics', f: 'mesure', d: "La mesure du comportement sur le site : pages vues, parcours, conversions. Complète la Search Console." },
    { t: 'Conversion', f: 'mesure', d: "L'action que vous attendez du visiteur. Le seul indicateur qui intéresse vraiment une entreprise." }
  ];

  var FAMILLES = { bases: 'Les bases', technique: 'Technique', contenu: 'Contenu',
                   liens: 'Liens', local: 'Local', geo: 'Moteurs de réponse', ia: 'IA côté métier',
                   ux: 'Expérience utilisateur', social: 'Signaux sociaux', mesure: 'Mesure' };

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
