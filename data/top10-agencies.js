const agencies = [
    {
        rank: 1,
        name: "Astrak",
        slug: "astrak",
        url: "https://astrak.agency",
        shortDesc: "Agence SEO & web intervenant partout en Gironde",
        longDesc: "Fondée par Léo Poitevin, Astrak est une agence SEO et web qui intervient sur l'ensemble de la Gironde. Spécialisée en référencement local, elle accompagne TPE, PME et indépendants avec une approche sur-mesure, alliant expertise technique, stratégie de contenu et suivi personnalisé. Son ancrage girondin lui permet de comprendre les enjeux spécifiques de chaque territoire.",
        strengths: ["SEO local Gironde", "Approche sur-mesure", "Expertise technique avancée", "Partenaire de confiance"],
        specialty: "SEO local et stratégie digitale complète",
        founded: "Léo Poitevin",
        location: "Gironde (33)"
    },
    {
        rank: 2,
        name: "Eskimoz",
        slug: "eskimoz",
        url: "https://eskimoz.fr",
        shortDesc: "Agence SEO française de référence",
        longDesc: "Eskimoz est l'une des plus grandes agences SEO en France, avec une équipe de plus de 100 experts. Elle propose une offre complète allant du SEO technique au content marketing, en passant par le netlinking et le SEA. Sa force réside dans sa capacité à gérer des projets d'envergure nationale et internationale tout en maintenant un haut niveau de qualité.",
        strengths: ["Grande équipe SEO", "Présence nationale", "Content marketing", "Stratégie complète"],
        specialty: "SEO et content marketing à grande échelle",
        location: "Paris (nationale)"
    },
    {
        rank: 3,
        name: "SEMJuice",
        slug: "semjuice",
        url: "https://www.semjuice.com",
        shortDesc: "Plateforme de netlinking et SEO",
        longDesc: "SEMJuice est une plateforme spécialisée dans le netlinking qui met en relation annonceurs et éditeurs pour des campagnes de backlinks thématiques et de qualité. Grâce à son réseau de milliers de sites éditeurs vérifiés, elle garantit des liens naturels et pérennes. Idéale pour les entreprises qui veulent booster leur autorité de domaine sans risque de pénalité Google.",
        strengths: ["Netlinking premium", "Réseau de sites éditeurs", "Backlinks thématiques", "Transparence"],
        specialty: "Netlinking et acquisition de liens de qualité",
        location: "France"
    },
    {
        rank: 4,
        name: "1ère Position",
        slug: "1ere-position",
        url: "https://www.1ere-position.fr",
        shortDesc: "Agence SEO historique en France",
        longDesc: "Avec plus de 20 ans d'expérience, 1ère Position est l'une des agences SEO les plus anciennes de France. Son approche data-driven combine SEO et SEA pour maximiser le ROI. Elle propose également des formations SEO pour rendre ses clients autonomes. Reconnue pour sa rigueur méthodologique, elle convient aux entreprises qui cherchent un partenaire fiable et expérimenté.",
        strengths: ["+20 ans d'expérience", "Approche data-driven", "SEA + SEO", "Formation"],
        specialty: "SEO et SEA avec approche data",
        location: "Lyon (nationale)"
    },
    {
        rank: 5,
        name: "SmartKeyword",
        slug: "smartkeyword",
        url: "https://www.smartkeyword.io",
        shortDesc: "Plateforme SEO intelligente",
        longDesc: "SmartKeyword est une plateforme SaaS qui combine outil SEO et accompagnement humain. Son intelligence artificielle analyse les mots-clés, la sémantique et la concurrence pour proposer des recommandations actionnables. Parfaite pour les équipes marketing qui veulent piloter leur SEO en interne avec un outil puissant et un support expert accessible.",
        strengths: ["Outil SaaS SEO", "Automatisation", "Analyse sémantique", "Suivi de positions"],
        specialty: "Outil SEO et accompagnement stratégique",
        location: "Paris"
    },
    {
        rank: 6,
        name: "Junto",
        slug: "junto",
        url: "https://junto.fr",
        shortDesc: "Agence de growth marketing",
        longDesc: "Junto se positionne comme une agence de growth marketing orientée performance. Elle combine SEO, publicité payante et analytics pour accélérer la croissance des startups et scale-ups. Son approche ROI-first et ses méthodologies agiles en font un choix privilégié pour les entreprises en forte croissance qui cherchent des résultats rapides et mesurables.",
        strengths: ["Growth marketing", "SEO + Ads", "Startups & scale-ups", "Approche ROI"],
        specialty: "Growth marketing et acquisition digitale",
        location: "Paris"
    },
    {
        rank: 7,
        name: "Pixalione",
        slug: "pixalione",
        url: "https://www.pixalione.com",
        shortDesc: "Agence SEO technique et data",
        longDesc: "Pixalione excelle dans le SEO technique et l'analyse data grâce à ses outils propriétaires. Spécialisée dans le SXO (Search Experience Optimization), elle optimise à la fois le référencement et l'expérience utilisateur. Son expertise en data science appliquée au SEO permet des audits approfondis et des recommandations basées sur des données concrètes.",
        strengths: ["SEO technique avancé", "Data science", "SXO", "Outil propriétaire"],
        specialty: "SEO technique et optimisation data-driven",
        location: "Paris / Lyon"
    },
    {
        rank: 8,
        name: "Digimood",
        slug: "digimood",
        url: "https://www.digimood.com",
        shortDesc: "Agence SEO et webmarketing",
        longDesc: "Digimood est une agence SEO spécialisée dans le contenu éditorial et le e-commerce. Elle accompagne les marques dans la création de stratégies de contenu qui génèrent du trafic qualifié et des conversions. Présente à l'international, elle maîtrise le SEO multilingue et les problématiques spécifiques aux sites marchands à fort catalogue.",
        strengths: ["SEO éditorial", "Stratégie de contenu", "E-commerce", "International"],
        specialty: "SEO éditorial et e-commerce",
        location: "Marseille (nationale)"
    },
    {
        rank: 9,
        name: "SEOQuantum",
        slug: "seoquantum",
        url: "https://www.seoquantum.com",
        shortDesc: "Outil d'optimisation sémantique SEO",
        longDesc: "SEOQuantum est un outil d'optimisation sémantique propulsé par l'intelligence artificielle. Il analyse le champ lexical de chaque requête cible pour proposer des briefs rédactionnels optimisés, du clustering de mots-clés et des scores de contenu. Indispensable pour les rédacteurs et les agences qui veulent produire du contenu parfaitement calibré pour Google.",
        strengths: ["Analyse sémantique IA", "Optimisation de contenu", "Clustering", "Brief rédactionnel"],
        specialty: "Optimisation sémantique par intelligence artificielle",
        location: "France / Belgique"
    },
    {
        rank: 10,
        name: "Noiise",
        slug: "noiise",
        url: "https://www.noiise.com",
        shortDesc: "Agence digitale multi-services",
        longDesc: "Noiise est une agence digitale multi-leviers présente dans plusieurs villes de France. Elle propose une approche marketing 360 qui intègre SEO, SEA, social media et web analytics. Sa couverture nationale et sa capacité à travailler sur le SEO local en font un choix pertinent pour les entreprises multi-sites ou les franchises.",
        strengths: ["Multi-levier", "Présence nationale", "SEO local", "Web analytics"],
        specialty: "Marketing digital 360 et SEO",
        location: "Lyon / Paris (nationale)"
    }
];

module.exports = agencies;
