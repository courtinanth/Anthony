/* Génère les fragments des 10 sous-pages services. Usage : node gen-service-fragments.js */
const fs = require('fs');

const S = [
{
  slug: 'audit-seo', parent: { name: 'SEO', url: '/seo' }, ico: '🔍',
  eyebrow: 'Audit SEO, partout en France',
  h1: "L'audit SEO qui dit <em>quoi faire,</em><br>pas juste ce qui ne va pas.",
  lede: "Technique, contenu, popularité, concurrence : un état des lieux complet de votre site, livré avec un plan d'action priorisé par impact. Pas un PDF de 80 pages qui finit dans un tiroir.",
  intro: [
    "<strong>Un audit n'a de valeur que s'il débouche sur des actions.</strong> Le mien se termine par une feuille de route classée par ratio effort/gain : vous savez quoi corriger en premier, pourquoi, et ce que chaque correction peut rapporter.",
    "J'audite les trois piliers du référencement : la technique (ce qui empêche Google de crawler et comprendre votre site), le contenu (ce qui vous fait rater des requêtes) et la popularité (ce qui bride votre autorité). Et depuis 2025, j'y ajoute systématiquement un volet visibilité IA."
  ],
  offers: [
    { ico:'⚙️', t:'Analyse technique', d:"Crawl complet, logs serveur si disponibles, indexation, vitesse, données structurées, maillage interne.", b:['Crawl et analyse des logs','Core Web Vitals et rendu mobile','Indexation, sitemap, robots.txt'] },
    { ico:'📝', t:'Analyse sémantique', d:"Vos contenus face aux requêtes réelles de votre marché : ce qui rate, ce qui cannibalise, ce qui manque.", b:['Étude de mots-clés et intentions','Cartographie des contenus manquants','Détection de cannibalisation'] },
    { ico:'🎯', t:'Plan d’action priorisé', d:"Chaque recommandation est chiffrée en effort et en impact attendu, puis restituée en visio.", b:['Feuille de route priorisée','Quick wins identifiés','Restitution visio 1 h 30'] }
  ],
  faq: [
    ['Combien de temps dure un audit SEO ?', "Deux à trois semaines selon la taille du site. Un site vitrine se traite plus vite qu'un e-commerce de 40 000 URLs : le devis précise toujours le délai."],
    ['Que se passe-t-il après l’audit ?', "Vous êtes libre : implémenter en interne avec ma feuille de route, confier l'exécution à votre agence, ou me la confier en accompagnement mensuel. L'audit est déductible du premier mois d'accompagnement."],
    ['L’audit couvre-t-il la visibilité dans les IA ?', "Oui, chaque audit inclut un volet GEO : ce que répondent ChatGPT et Perplexity sur vos requêtes métier, et comment votre site est perçu par les crawlers IA."]
  ],
  cta: { h:"Vous saurez exactement <em>où vous en êtes.</em>", p:"Audit à partir de 1 490 € HT, déductible du premier mois d'accompagnement." }
},
{
  slug: 'seo-technique', parent: { name: 'SEO', url: '/seo' }, ico: '⚙️',
  eyebrow: 'SEO technique, partout en France',
  h1: "Un site que Google <em>et les IA</em><br>comprennent parfaitement.",
  lede: "Crawl, indexation, vitesse, structure, données structurées : je corrige tout ce qui empêche les moteurs, classiques et IA, de lire et classer votre site.",
  intro: [
    "<strong>La technique est le plafond de verre de votre SEO.</strong> Le meilleur contenu du monde ne ranke pas si Google ne le crawle pas, le comprend mal ou le charge trop lentement. Et ce qui bloque Googlebot bloque aussi GPTBot et ClaudeBot.",
    "Mon travail : rendre votre site limpide pour toutes les machines qui le lisent, sans dégrader l'expérience des humains qui le visitent."
  ],
  offers: [
    { ico:'🕷️', t:'Crawl & indexation', d:"Faire indexer les bonnes pages, et seulement elles.", b:['Budget de crawl optimisé','Gestion des doublons et canoniques','Sitemap et robots.txt propres'] },
    { ico:'⚡', t:'Performance', d:"Core Web Vitals au vert, sur mobile comme sur desktop.", b:['Optimisation LCP, INP, CLS','Images et polices optimisées','Audit du rendu JavaScript'] },
    { ico:'🧩', t:'Structure & balisage', d:"Une architecture et un balisage que les moteurs récompensent.", b:['Maillage interne et silos','Données structurées schema.org','llms.txt et lisibilité IA'] }
  ],
  faq: [
    ['Travaillez-vous avec mon développeur ou en direct ?', "Les deux : je livre des spécifications prêtes à implémenter pour votre équipe, ou j'implémente moi-même sur WordPress, Shopify, Webflow et la plupart des CMS."],
    ['Le JavaScript pose-t-il vraiment problème pour le SEO ?', "Souvent, oui : un contenu rendu uniquement côté client peut être mal vu par Google et invisible pour la plupart des crawlers IA. Je diagnostique précisément ce que chaque robot voit de votre site."],
    ['Qu’est-ce que le SEO technique change pour les IA ?', "Les crawlers de ChatGPT, Claude ou Perplexity lisent du HTML statique et s'appuient sur la structure. Un site techniquement sain est la condition d'entrée pour être cité par les moteurs de réponse."]
  ],
  cta: { h:"Débloquez le <em>plafond technique</em> de votre site.", p:"Diagnostic technique inclus dans tout audit SEO." }
},
{
  slug: 'netlinking', parent: { name: 'SEO', url: '/seo' }, ico: '🔗',
  eyebrow: 'Netlinking, partout en France',
  h1: "Des backlinks qui construisent<br>une <em>autorité durable.</em>",
  lede: "Pas d'achat en masse sur des plateformes douteuses : une acquisition propre et progressive de liens thématiques qui renforcent votre autorité aux yeux de Google et des IA.",
  intro: [
    "<strong>Le netlinking reste l'un des critères les plus puissants de Google</strong>, et c'est aussi l'un des plus risqués quand il est mal fait. Ma règle : chaque lien doit pouvoir être regardé en face, dans trois ans, sans rougir.",
    "Bonus devenu essentiel : les mentions et citations de votre marque sur des sites de référence alimentent directement les réponses des moteurs IA. Un bon netlinking travaille les deux tableaux."
  ],
  offers: [
    { ico:'🔬', t:'Audit de profil de liens', d:"L'état de votre popularité et celle de vos concurrents.", b:['Analyse du profil existant','Détection des liens toxiques','Benchmark concurrentiel'] },
    { ico:'🤝', t:'Acquisition', d:"Des liens éditoriaux sur des sites réels, dans votre thématique.", b:['Sélection manuelle des spots','Ancres et pages cibles stratégiques','Rythme d’acquisition naturel'] },
    { ico:'📈', t:'Suivi', d:"L'évolution de votre autorité, mesurée et rapportée.", b:['Suivi d’autorité de domaine','Reporting des liens livrés','Impact sur les positions'] }
  ],
  faq: [
    ['Combien coûte un bon backlink ?', "De quelques dizaines à plusieurs centaines d'euros selon l'autorité et la thématique du site. Je valide chaque budget avec vous avant toute dépense, facturé au réel."],
    ['Les liens sont-ils garantis ?', "Le nombre de liens livrés, oui. Les positions, non : personne de sérieux ne peut garantir un classement Google. Je garantis la méthode, la qualité des spots et la transparence du reporting."],
    ['Le netlinking sert-il aussi pour ChatGPT et Perplexity ?', "Oui : les moteurs IA s'appuient sur les sources qui font autorité. Être mentionné sur des sites de référence augmente vos chances d'être cité dans leurs réponses."]
  ],
  cta: { h:"Votre autorité se construit <em>lien après lien.</em>", p:"Audit de profil de liens inclus dans tout audit SEO." }
},
{
  slug: 'seo-local', parent: { name: 'SEO', url: '/seo' }, ico: '📍',
  eyebrow: 'SEO local, partout en France',
  h1: "Dominez les recherches<br><em>« près de chez moi ».</em>",
  lede: "Fiche Google Business optimisée, stratégie d'avis, pages locales propres : je fais de votre établissement la réponse évidente dans votre zone de chalandise, sur Google Maps comme dans les IA.",
  intro: [
    "<strong>46 % des recherches Google ont une intention locale.</strong> Pour un commerce, un artisan, une franchise ou un réseau, le pack local (les trois fiches sous la carte) capte l'essentiel des clics et des appels.",
    "J'optimise les trois piliers du classement local : la pertinence de votre fiche, la proximité perçue et la notoriété. Sans jamais créer de fausses adresses ni de pages doorway : ces raccourcis finissent en pénalité."
  ],
  offers: [
    { ico:'🏪', t:'Google Business Profile', d:"Votre fiche transformée en machine à appels.", b:['Optimisation complète de la fiche','Posts, photos, questions-réponses','Suivi des actions (appels, itinéraires)'] },
    { ico:'⭐', t:'Stratégie d’avis', d:"Plus d'avis, de meilleurs avis, et des réponses soignées.", b:['Process de collecte d’avis','Modèles de réponses','Gestion des avis négatifs'] },
    { ico:'🗺️', t:'Pages locales', d:"Des pages géolocalisées utiles, uniques, qui rankent.", b:['Une page par zone réelle d’activité','Contenu local authentique','Données structurées LocalBusiness'] }
  ],
  faq: [
    ['Je n’ai pas de boutique physique, le SEO local me concerne-t-il ?', "Oui si vous vous déplacez chez vos clients (artisans, services à domicile) : Google propose les fiches en zone de chalandise sans adresse affichée. Le levier reste puissant."],
    ['Combien d’avis faut-il pour bien ranker localement ?', "Il n'y a pas de seuil magique : la dynamique compte plus que le volume. Des avis réguliers, détaillés, avec réponses, battent un gros stock d'avis anciens."],
    ['Gérez-vous plusieurs établissements ?', "Oui, j'accompagne des réseaux multi-sites : optimisation à l'échelle, cohérence des données et reporting par établissement."]
  ],
  cta: { h:"Soyez la réponse évidente <em>dans votre zone.</em>", p:"Audit local inclus dans tout audit SEO." }
},
{
  slug: 'strategie-geo', parent: { name: 'GEO', url: '/geo' }, ico: '✦',
  eyebrow: 'Stratégie GEO, partout en France',
  h1: "Devenez la marque que<br>les IA <em>recommandent.</em>",
  lede: "Une stratégie complète pour exister dans ChatGPT, Perplexity, Gemini et les AI Overviews : autorité thématique, structuration technique, mentions externes et mesure continue.",
  intro: [
    "<strong>Quand une IA répond, elle cite deux ou trois sources. Pas dix.</strong> La bataille de la visibilité se joue désormais sur ces quelques places, et la plupart de vos concurrents n'ont pas encore commencé à la disputer.",
    "Ma stratégie GEO travaille les trois signaux que les moteurs de réponse utilisent : ce que votre site dit de vous (structure, contenu citable, llms.txt), ce que le web dit de vous (mentions, citations, cohérence de marque) et ce que les IA disent effectivement de vous (mesuré chaque mois)."
  ],
  offers: [
    { ico:'🏗️', t:'Fondations techniques', d:"Votre site rendu lisible et citable par les crawlers IA.", b:['llms.txt et données structurées','Contenus structurés en réponses','Accès crawlers IA vérifié'] },
    { ico:'📣', t:'Autorité externe', d:"Votre marque mentionnée là où les IA puisent leurs réponses.", b:['Stratégie de mentions et citations','Présence sur les sources de référence','Cohérence des informations de marque'] },
    { ico:'📊', t:'Mesure continue', d:"Votre part de voix IA, suivie mois après mois.", b:['Panel de requêtes métier suivies','Part de voix vs concurrents','Reporting mensuel dédié'] }
  ],
  faq: [
    ['En combien de temps peut-on être cité par ChatGPT ?', "Sur des requêtes de niche, les premières citations peuvent apparaître en 2 à 3 mois. Sur des marchés concurrentiels, comptez 6 mois de travail d'autorité. La mesure mensuelle montre la progression."],
    ['Faut-il un bon SEO avant de faire du GEO ?', "C'est fortement recommandé : les moteurs IA s'appuient largement sur les résultats de recherche classiques. C'est pour ça que je propose les deux ensemble."],
    ['Sur quels moteurs IA travaillez-vous ?', "ChatGPT, Perplexity, Gemini, Claude, Mistral et les AI Overviews de Google. Le panel s'adapte à ceux que votre audience utilise réellement."]
  ],
  cta: { h:"Les places dans les réponses IA<br>sont <em>encore libres.</em>", p:"Audit de visibilité IA offert lors du premier échange." }
},
{
  slug: 'audit-visibilite-ia', parent: { name: 'GEO', url: '/geo' }, ico: '📊',
  eyebrow: 'Audit de visibilité IA, partout en France',
  h1: "Que disent les IA<br>de <em>votre marque ?</em>",
  lede: "ChatGPT, Perplexity et Gemini répondent déjà à vos prospects. L'audit mesure ce qu'ils disent de vous, qui ils citent à votre place, et comment prendre ces positions.",
  intro: [
    "<strong>Vous ne pouvez pas améliorer ce que vous ne mesurez pas.</strong> L'audit de visibilité IA établit votre point de départ : sur un panel de requêtes représentatives de votre marché, j'interroge systématiquement les principaux moteurs de réponse et j'analyse chaque réponse.",
    "Vous découvrez votre part de voix réelle, les concurrents qui occupent le terrain, les sources que les IA utilisent dans votre secteur, et le chemin le plus court pour y figurer."
  ],
  offers: [
    { ico:'🎤', t:'Interrogation systématique', d:"Vos requêtes métier posées aux principaux moteurs IA.", b:['Panel de 30 à 100 requêtes métier','ChatGPT, Perplexity, Gemini, AI Overviews','Répété pour fiabiliser la mesure'] },
    { ico:'🥊', t:'Analyse concurrentielle', d:"Qui est cité à votre place, et pourquoi.", b:['Part de voix par concurrent','Sources citées dans votre secteur','Angles de réponse gagnants'] },
    { ico:'🗺️', t:'Plan d’action GEO', d:"Le chemin vers les citations, priorisé.", b:['Score de visibilité IA initial','Actions classées par impact','Restitution en visio'] }
  ],
  faq: [
    ['Les réponses des IA changent tout le temps, la mesure est-elle fiable ?', "C'est pour ça que chaque requête est posée plusieurs fois, sur plusieurs moteurs, avant d'être agrégée en part de voix. On mesure une tendance robuste, pas une réponse isolée."],
    ['Que contient le livrable ?', "Un rapport avec votre score de visibilité IA, le détail par moteur et par requête, l'analyse concurrentielle et un plan d'action priorisé, restitué en visio."],
    ['Cet audit peut-il être refait pour mesurer la progression ?', "Oui, c'est même le principe : en accompagnement, la mesure est refaite chaque mois sur le même panel pour suivre votre progression."]
  ],
  cta: { h:"Sachez enfin ce que les IA<br>disent de <em>vous.</em>", p:"Aperçu offert lors du premier échange, audit complet sur devis." }
},
{
  slug: 'contenu-citable', parent: { name: 'GEO', url: '/geo' }, ico: '📝',
  eyebrow: 'Contenu citable, partout en France',
  h1: "Des contenus que Google classe<br>et que les IA <em>citent.</em>",
  lede: "Les moteurs de réponse citent les contenus clairs, sourcés, structurés. Je transforme vos pages en références reprises par ChatGPT et Perplexity, sans sacrifier leur performance SEO.",
  intro: [
    "<strong>Écrire pour les IA, c'est écrire mieux pour tout le monde.</strong> Réponses directes en tête de section, définitions nettes, chiffres sourcés, structure lisible : ce que les moteurs de réponse récompensent est exactement ce que vos lecteurs préfèrent.",
    "J'interviens sur l'existant (réécriture et restructuration de vos pages stratégiques) comme sur la production : formats à forte citabilité, briefs prêts à rédiger, FAQ balisées."
  ],
  offers: [
    { ico:'♻️', t:'Optimisation de l’existant', d:"Vos pages clés restructurées pour la citation.", b:['Réponses directes et définitions','Restructuration Hn et paragraphes','FAQ et données structurées'] },
    { ico:'✨', t:'Formats citables', d:"Les contenus que les IA reprennent en priorité.", b:['Études et données originales','Guides de référence','Comparatifs et définitions'] },
    { ico:'🗓️', t:'Production continue', d:"Un calendrier éditorial orienté citations.", b:['Briefs optimisés SEO + GEO','Rédaction ou relecture','Mesure des citations obtenues'] }
  ],
  faq: [
    ['Utilisez-vous l’IA pour rédiger ?', "Comme accélérateur, oui ; comme rédacteur final, non. Chaque contenu est cadré, vérifié et finalisé par un humain : c'est la condition pour que Google comme les IA lui fassent confiance."],
    ['Quels contenus sont les plus cités par les IA ?', "Les études avec données originales, les définitions claires, les guides de référence et les comparatifs honnêtes. Tout ce qui aide une IA à répondre précisément avec une source fiable."],
    ['Mes contenus actuels peuvent-ils être récupérés ?', "Dans la plupart des cas, oui : une restructuration bien menée vaut souvent mieux qu'une réécriture totale, et préserve l'historique SEO de la page."]
  ],
  cta: { h:"Écrivez ce que les IA<br>voudront <em>citer.</em>", p:"Analyse de vos pages stratégiques lors du premier échange." }
},
{
  slug: 'agents-ia', parent: { name: 'Automatisation IA', url: '/automatisation-ia' }, ico: '🤖',
  eyebrow: 'Agents IA, partout en France',
  h1: "Des agents qui travaillent<br><em>pendant que vous dormez.</em>",
  lede: "Veille concurrentielle, qualification de leads, préparation de briefs, réponses aux avis : des agents IA qui exécutent de vraies tâches, sous supervision humaine.",
  intro: [
    "<strong>Un agent IA n'est pas un chatbot.</strong> C'est un système qui accomplit une mission de bout en bout : collecter, analyser, rédiger, router, alerter. Bien cadré, il abat en continu le travail répétitif que vos équipes repoussent faute de temps.",
    "Mon rôle : identifier les missions à confier à un agent, le construire avec les bons garde-fous, le connecter à vos outils et former vos équipes à le superviser. L'IA fait le volume, l'humain garde la décision."
  ],
  offers: [
    { ico:'🔭', t:'Veille automatisée', d:"Votre marché surveillé en continu.", b:['Concurrents, prix, contenus, avis','Synthèses quotidiennes ou hebdo','Alertes sur signaux importants'] },
    { ico:'🎯', t:'Qualification de leads', d:"Chaque prospect enrichi et routé en minutes.", b:['Enrichissement automatique','Scoring et routage','Brouillons de réponse personnalisés'] },
    { ico:'🛡️', t:'Garde-fous intégrés', d:"Un agent qui sait ce qu'il n'a pas le droit de faire.", b:['Validation humaine aux étapes clés','Périmètre de données cadré','Journal d’activité consultable'] }
  ],
  faq: [
    ['Un agent peut-il répondre directement à mes clients ?', "Techniquement oui, mais je recommande la validation humaine pour tout message sortant sensible. L'agent prépare, l'humain approuve : c'est le meilleur ratio vitesse/sécurité."],
    ['Sur quelles technologies construisez-vous les agents ?', "Les API de Claude, OpenAI ou Mistral pour l'intelligence, n8n ou Make pour l'orchestration, connectés à vos outils existants (CRM, email, Slack, Notion...)."],
    ['Que se passe-t-il si l’agent se trompe ?', "C'est prévu dès la conception : validation humaine aux étapes critiques, journal d'activité, et procédure de correction. Un agent bien conçu échoue de façon visible, jamais en silence."]
  ],
  cta: { h:"Quelle mission confieriez-vous<br>à un agent <em>dès demain ?</em>", p:"Diagnostic d'automatisation offert lors du premier échange." }
},
{
  slug: 'workflows', parent: { name: 'Automatisation IA', url: '/automatisation-ia' }, ico: '🔀',
  eyebrow: 'Workflows automatisés, partout en France',
  h1: "Vos outils enfin<br><em>connectés entre eux.</em>",
  lede: "n8n, Make, Zapier : je relie votre CRM, vos emails, vos réseaux sociaux et votre reporting en workflows qui tournent seuls. Documentés, maintenables, transmis à vos équipes.",
  intro: [
    "<strong>Le coût caché de votre entreprise, c'est le copier-coller.</strong> Ressaisir un lead dans le CRM, compiler le reporting du lundi, publier le même contenu sur quatre canaux : autant d'heures qui partent chaque semaine dans des tâches sans valeur ajoutée.",
    "Je cartographie ces tâches, je chiffre ce qu'elles vous coûtent, et j'automatise en commençant par le meilleur ratio effort/gain. Chaque workflow est documenté et transmis : vous restez propriétaire et autonome."
  ],
  offers: [
    { ico:'🗺️', t:'Cartographie', d:"Vos tâches répétitives identifiées et chiffrées.", b:['Inventaire des process manuels','Coût en heures par mois','Priorisation par ROI'] },
    { ico:'🏗️', t:'Construction', d:"Des workflows robustes, testés, avec gestion d'erreurs.", b:['n8n, Make ou Zapier selon le besoin','Gestion des erreurs et alertes','Tests avant mise en production'] },
    { ico:'🎓', t:'Transmission', d:"Vos équipes autonomes sur la maintenance.", b:['Documentation complète','Formation des équipes','Maintenance optionnelle'] }
  ],
  faq: [
    ['n8n, Make ou Zapier : lequel choisir ?', "Ça dépend de vos volumes, de votre budget et de vos contraintes de données. n8n (auto-hébergeable) pour le contrôle et les gros volumes, Make pour le rapport puissance/prix, Zapier pour la simplicité."],
    ['Que se passe-t-il si un workflow tombe en panne ?', "Chaque workflow est livré avec gestion d'erreurs et alertes : vous êtes prévenu avant vos clients. La documentation permet à vos équipes (ou à moi) de corriger vite."],
    ['Peut-on automatiser sans envoyer nos données à OpenAI ?', "Oui : tous les workflows n'ont pas besoin d'IA, et quand ils en ont besoin, il existe des options européennes ou auto-hébergées. Le cadrage données est la première étape de chaque projet."]
  ],
  cta: { h:"Arrêtez de faire le travail<br>d'un <em>robot.</em>", p:"Cartographie de vos tâches automatisables lors du premier échange." }
},
{
  slug: 'pipeline-contenu', parent: { name: 'Automatisation IA', url: '/automatisation-ia' }, ico: '📦',
  eyebrow: 'Pipeline de contenu, partout en France',
  h1: "Produisez <em>plus de contenu,</em><br>sans embaucher.",
  lede: "De la veille à la publication : idéation, briefs, rédaction assistée, déclinaisons multi-canaux. Une chaîne éditoriale outillée par l'IA, avec contrôle qualité humain à chaque étape.",
  intro: [
    "<strong>Le contenu est un jeu de volume ET de qualité.</strong> Blog, LinkedIn, newsletter, YouTube : chaque canal en demande toujours plus, et les équipes s'épuisent à suivre. Un pipeline bien conçu multiplie la production sans diluer la voix de votre marque.",
    "Concrètement : la veille alimente l'idéation, chaque idée devient un brief structuré, la rédaction assistée produit un premier jet dans votre ton, un humain finalise, et chaque contenu se décline automatiquement pour tous vos canaux."
  ],
  offers: [
    { ico:'💡', t:'Veille & idéation', d:"Un flux d'idées alimenté par votre marché.", b:['Veille automatisée multi-sources','Idées scorées par potentiel','Calendrier éditorial vivant'] },
    { ico:'✍️', t:'Production assistée', d:"L'IA rédige le volume, l'humain garde la voix.", b:['Briefs structurés SEO + GEO','Premier jet dans votre ton de marque','Relecture humaine systématique'] },
    { ico:'📡', t:'Déclinaison multi-canaux', d:"Un contenu, cinq formats.", b:['Blog, LinkedIn, newsletter, vidéo','Adaptation par canal automatisée','Publication programmée'] }
  ],
  faq: [
    ['Google pénalise-t-il le contenu généré par IA ?', "Google pénalise le contenu médiocre, quelle que soit sa provenance. Un pipeline avec briefs solides, expertise réelle et relecture humaine produit du contenu qui performe. Le 100 % automatique sans contrôle, lui, finit effectivement sanctionné."],
    ['Le contenu gardera-t-il notre ton de marque ?', "Oui : le pipeline est calibré sur vos contenus existants et votre charte éditoriale, puis affiné pendant les premières semaines. La relecture humaine garantit le reste."],
    ['Quel volume peut-on atteindre ?', "En général, deux à quatre fois la production actuelle à équipe constante. Mais l'objectif n'est jamais le volume seul : chaque contenu doit mériter sa place."]
  ],
  cta: { h:"Votre prochaine équipe de contenu<br>est <em>déjà là.</em>", p:"Diagnostic de votre chaîne éditoriale lors du premier échange." }
}
];

function offerCard(o, i){
  return `      <article class="offer rv${i?' rv-d'+i:''}">
        <span class="ico">${o.ico}</span>
        <h3>${o.t}</h3>
        <p>${o.d}</p>
        <ul>${o.b.map(x=>`<li>${x}</li>`).join('')}</ul>
      </article>`;
}

for (const s of S) {
  const html = `<section class="page-hero">
  <div class="wrap">
    <nav class="crumbs" aria-label="Fil d'ariane"><a href="/">Accueil</a><span>›</span><a href="${s.parent.url}">${s.parent.name}</a><span>›</span><span>${s.eyebrow.split(',')[0]}</span></nav>
    <span class="eyebrow">${s.eyebrow}</span>
    <h1>${s.h1}</h1>
    <p class="lede">${s.lede}</p>
    <div class="hero-ctas">
      <a class="btn btn-lime" href="/contact">Discutons de votre projet <span class="ar">→</span></a>
      <a class="btn btn-outline" href="${s.parent.url}">Toute l'offre ${s.parent.name} <span class="ar">→</span></a>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="prose rv">
${s.intro.map(p=>'      <p>'+p+'</p>').join('\n')}
    </div>
  </div>
</section>

<section class="section" style="padding-top:0">
  <div class="wrap">
    <div class="section-head rv">
      <div><span class="eyebrow">Ce qui est inclus</span><h2>Le contenu de la prestation</h2></div>
    </div>
    <div class="offer-grid">
${s.offers.map((o,i)=>offerCard(o,i)).join('\n')}
    </div>
  </div>
</section>

<section class="section" id="faq" style="padding-top:0">
  <div class="wrap">
    <div class="section-head rv" style="justify-content:center;text-align:center"><div><span class="eyebrow">FAQ</span><h2>Questions fréquentes</h2></div></div>
    <div class="faq rv">
${s.faq.map(([q,a])=>`      <div class="faq-item">
        <button class="faq-q" type="button">${q}<span class="plus">+</span></button>
        <div class="faq-a"><p>${a}</p></div>
      </div>`).join('\n')}
    </div>
  </div>
</section>

<div class="final">
  <div class="final-box rv">
    <span class="eyebrow">Contact</span>
    <h2>${s.cta.h}</h2>
    <p>${s.cta.p} Réponse sous 24 h.</p>
    <a class="btn btn-lime" href="/contact">Me contacter <span class="ar">→</span></a>
  </div>
</div>
`;
  fs.writeFileSync(__dirname + '/' + s.slug + '.html', html);
  console.log('OK fragment', s.slug);
}
