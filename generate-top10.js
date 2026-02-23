const fs = require('fs');
const path = require('path');
const citiesTop10 = require('./data/cities-top10.js');
const citiesExtended = require('./data/cities-extended.js');
const agencies = require('./data/top10-agencies.js');

// Bordeaux + all cities
const allCities = [
    { rank: 1, name: "Bordeaux", zip: "33000", zone: "Métropole" },
    ...citiesTop10,
    ...citiesExtended
];

const baseUrl = 'https://anthony-courtin.com';

// ── Proper slugify (handles accents correctly) ──
function slugify(str) {
    return str.toString()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

// ── Zone-specific content data ──
const zoneContent = {
    "Métropole": {
        economicContext: (city) => `${city}, au coeur de la métropole bordelaise, concentre un tissu économique dense et diversifié. Entre startups innovantes, PME établies et grands groupes, la compétition pour la visibilité en ligne y est particulièrement forte.`,
        whyLocal: (city) => `Les entreprises implantées à ${city} font face à une concurrence numérique intense dans la métropole bordelaise. Avec des milliers de commerces et services qui se disputent les premières positions Google, disposer d'un accompagnement SEO professionnel devient un avantage concurrentiel décisif.`,
        businessTypes: "commerces de proximité, cabinets de conseil, agences immobilières, restaurants, artisans et prestataires de services",
        geoContext: "de la métropole bordelaise",
        seoChallenge: "La densité de population et d'entreprises crée une forte concurrence sur les requêtes locales. Se démarquer nécessite une stratégie SEO pointue combinant optimisation technique, contenu qualitatif et netlinking ciblé."
    },
    "Bassin d'Arcachon": {
        economicContext: (city) => `${city}, sur le Bassin d'Arcachon, bénéficie d'une attractivité touristique exceptionnelle. L'économie locale repose sur le tourisme, l'ostréiculture, la restauration et les activités nautiques, avec une forte saisonnalité qui demande une stratégie digitale adaptée.`,
        whyLocal: (city) => `À ${city}, la saisonnalité touristique du Bassin d'Arcachon impose une stratégie SEO proactive. Les professionnels du tourisme, de l'hôtellerie et des loisirs doivent anticiper les pics de recherche pour capter les visiteurs bien avant la haute saison.`,
        businessTypes: "hôtels, campings, restaurants, loueurs de bateaux, ostréiculteurs, agences immobilières de vacances et commerces de plage",
        geoContext: "du Bassin d'Arcachon",
        seoChallenge: "La saisonnalité des recherches impose de travailler le SEO en amont pour être visible quand les touristes planifient leurs séjours. Le référencement local et Google Maps sont des leviers essentiels."
    },
    "Libournais": {
        economicContext: (city) => `${city}, dans le Libournais, s'inscrit dans un territoire marqué par la viticulture et le patrimoine. L'économie locale allie tradition viticole, tourisme oenotouristique et tissu de PME dynamiques qui cherchent à se digitaliser.`,
        whyLocal: (city) => `Le Libournais, avec ses appellations prestigieuses comme Saint-Émilion, attire une clientèle nationale et internationale. Les entreprises de ${city} ont tout intérêt à investir dans le SEO pour capter cette audience qualifiée en quête de services locaux.`,
        businessTypes: "domaines viticoles, caves de dégustation, hébergements oenotouristiques, restaurants gastronomiques, artisans et commerces de centre-ville",
        geoContext: "du Libournais",
        seoChallenge: "L'oenotourisme génère des recherches très qualifiées mais compétitives. Une stratégie SEO locale bien menée permet de capter les visiteurs en phase de planification de leur séjour dans le vignoble."
    },
    "Médoc": {
        economicContext: (city) => `${city}, en Médoc, conjugue prestige viticole et attractivité côtière. Ce territoire unique entre vignobles classés et stations balnéaires de l'Atlantique offre un potentiel digital encore sous-exploité par de nombreuses entreprises locales.`,
        whyLocal: (city) => `Le Médoc jouit d'une renommée mondiale grâce à ses grands crus. Les entreprises de ${city} peuvent capitaliser sur cette notoriété en développant leur présence en ligne avec un SEO adapté à la double identité viticole et balnéaire du territoire.`,
        businessTypes: "châteaux viticoles, hébergements touristiques, surfshops, écoles de surf, restaurants, campings et commerces balnéaires",
        geoContext: "du Médoc",
        seoChallenge: "La dualité entre tourisme viticole et tourisme balnéaire ouvre des opportunités SEO sur des niches variées. L'enjeu est de bien cibler les intentions de recherche spécifiques à chaque segment."
    },
    "Sud-Gironde": {
        economicContext: (city) => `${city}, dans le Sud de la Gironde, offre un cadre de vie préservé qui attire de plus en plus de familles et d'entrepreneurs. L'économie locale, entre agriculture, services et commerce de proximité, se digitalise progressivement.`,
        whyLocal: (city) => `Dans le Sud-Gironde, la concurrence en ligne est encore modérée, ce qui représente une opportunité pour les entreprises de ${city}. Investir dans le SEO maintenant permet de prendre des positions dominantes sur Google avant que la compétition ne s'intensifie.`,
        businessTypes: "exploitations agricoles, commerces de proximité, artisans du bâtiment, professionnels de santé, gîtes ruraux et services aux particuliers",
        geoContext: "du Sud-Gironde",
        seoChallenge: "Avec une concurrence en ligne encore faible, le SEO local offre un retour sur investissement rapide. Les premières positions Google sont accessibles avec une stratégie bien exécutée."
    },
    "Entre-deux-Mers": {
        economicContext: (city) => `${city}, en Entre-deux-Mers, s'inscrit dans un paysage vallonné entre Garonne et Dordogne. Ce territoire viticole et rural connaît un renouveau économique porté par l'agritourisme, l'artisanat et l'installation de néo-ruraux.`,
        whyLocal: (city) => `L'Entre-deux-Mers séduit par son authenticité et sa qualité de vie. Les entreprises de ${city} qui investissent dans le SEO peuvent se positionner sur des recherches liées au tourisme rural, aux produits locaux et aux services de proximité.`,
        businessTypes: "domaines viticoles, chambres d'hôtes, fermes auberges, artisans, producteurs locaux et services à la personne",
        geoContext: "de l'Entre-deux-Mers",
        seoChallenge: "Le tourisme vert et l'agritourisme génèrent des recherches croissantes. Le SEO local et la création de contenu autour des activités du territoire sont des leviers puissants."
    },
    "Haute-Gironde": {
        economicContext: (city) => `${city}, en Haute-Gironde, bénéficie de la proximité de l'estuaire et d'un patrimoine historique remarquable. L'économie locale mêle viticulture, pêche, tourisme fluvial et artisanat dans un territoire au potentiel digital à développer.`,
        whyLocal: (city) => `La Haute-Gironde, avec la Citadelle de Blaye classée UNESCO et ses paysages d'estuaire, attire un tourisme culturel et nature. Les entreprises de ${city} ont l'opportunité de capter cette audience grâce à une stratégie SEO ciblée.`,
        businessTypes: "sites patrimoniaux, hébergements touristiques, producteurs de vin, restaurants, pêcheurs, artisans et commerces locaux",
        geoContext: "de la Haute-Gironde",
        seoChallenge: "Le patrimoine UNESCO et l'estuaire de la Gironde génèrent des recherches touristiques qualifiées. Être bien positionné sur ces requêtes attire une clientèle à fort pouvoir d'achat."
    }
};

// ── Unique intro sentences per city size tier ──
function getCityIntro(city, zone) {
    const rank = city.rank;
    if (rank <= 5) {
        return `<strong>${city.name}</strong> fait partie des villes les plus importantes de Gironde. Avec un bassin économique dynamique et une forte densité d'entreprises, le recours à une agence SEO performante est devenu incontournable pour se démarquer en ligne.`;
    } else if (rank <= 15) {
        return `<strong>${city.name}</strong> (${city.zip}) est une ville attractive de Gironde qui connaît un développement économique soutenu. Les entreprises locales ont tout intérêt à s'appuyer sur des experts SEO pour gagner en visibilité face à une concurrence croissante.`;
    } else if (rank <= 30) {
        return `<strong>${city.name}</strong>, commune dynamique de Gironde, voit son tissu économique se renforcer d'année en année. Pour les professionnels implantés à ${city.name}, le référencement naturel représente un levier de croissance majeur.`;
    } else if (rank <= 50) {
        return `À <strong>${city.name}</strong> (${city.zip}), les entreprises locales cherchent de plus en plus à renforcer leur présence digitale. Le SEO s'impose comme le canal d'acquisition le plus rentable à long terme pour les professionnels du secteur.`;
    } else if (rank <= 75) {
        return `<strong>${city.name}</strong>, en Gironde, offre un environnement favorable aux entreprises qui souhaitent développer leur activité. Le référencement naturel permet aux professionnels de ${city.name} d'atteindre une clientèle bien au-delà de leur zone de chalandise traditionnelle.`;
    } else {
        return `Basée en Gironde, <strong>${city.name}</strong> (${city.zip}) possède un potentiel économique que le digital peut amplifier. Les entreprises locales qui investissent dans le SEO prennent une longueur d'avance décisive sur leur marché.`;
    }
}

// ── Generate unique criteria section per zone ──
function getCriteriaSection(zone) {
    const criteriaByZone = {
        "Métropole": [
            { icon: "🎯", title: "Expertise locale", desc: "Connaissance du marché bordelais et de la métropole" },
            { icon: "📈", title: "Résultats prouvés", desc: "Track record vérifiable avec des cas clients concrets" },
            { icon: "🔧", title: "Maîtrise technique", desc: "Audit, Core Web Vitals, indexation et architecture" },
            { icon: "💬", title: "Transparence", desc: "Reporting clair et communication régulière" }
        ],
        "Bassin d'Arcachon": [
            { icon: "🌊", title: "Compréhension saisonnière", desc: "Adaptation de la stratégie aux cycles touristiques" },
            { icon: "📍", title: "SEO local avancé", desc: "Optimisation Google Maps et fiche Google Business" },
            { icon: "📸", title: "Contenu visuel", desc: "Stratégie adaptée aux secteurs tourisme et loisirs" },
            { icon: "📊", title: "Suivi de performance", desc: "KPIs adaptés à la saisonnalité du Bassin" }
        ],
        "Libournais": [
            { icon: "🍷", title: "Connaissance oenotouristique", desc: "Expertise des enjeux SEO du monde viticole" },
            { icon: "🌍", title: "SEO multilingue", desc: "Ciblage de la clientèle internationale du vignoble" },
            { icon: "🏆", title: "Référencement premium", desc: "Stratégie adaptée au positionnement haut de gamme" },
            { icon: "📱", title: "Mobile-first", desc: "Optimisation pour les touristes en mobilité" }
        ],
        "Médoc": [
            { icon: "🏖️", title: "Double expertise", desc: "SEO adapté au tourisme viticole ET balnéaire" },
            { icon: "📍", title: "Géolocalisation fine", desc: "Ciblage précis entre côte atlantique et vignoble" },
            { icon: "🌐", title: "Visibilité internationale", desc: "Stratégie pour capter la clientèle étrangère" },
            { icon: "⚡", title: "Performance web", desc: "Sites rapides pour les connexions en zone rurale" }
        ],
        "Sud-Gironde": [
            { icon: "🌱", title: "Approche locale", desc: "Stratégie SEO adaptée aux TPE et PME rurales" },
            { icon: "💰", title: "ROI rapide", desc: "Faible concurrence en ligne = résultats rapides" },
            { icon: "🗺️", title: "Rayonnement élargi", desc: "Visibilité au-delà de la zone de chalandise physique" },
            { icon: "🤝", title: "Accompagnement humain", desc: "Relation de proximité et pédagogie" }
        ],
        "Entre-deux-Mers": [
            { icon: "🍇", title: "SEO oenotouristique", desc: "Expertise du référencement viticole et rural" },
            { icon: "🏡", title: "Tourisme vert", desc: "Ciblage des recherches agritourisme et nature" },
            { icon: "📝", title: "Contenu authentique", desc: "Rédaction qui valorise le terroir et l'artisanat" },
            { icon: "🔗", title: "Netlinking local", desc: "Liens depuis des sites régionaux de qualité" }
        ],
        "Haute-Gironde": [
            { icon: "🏰", title: "Patrimoine & culture", desc: "SEO adapté au tourisme patrimonial et culturel" },
            { icon: "🚢", title: "Estuaire & nature", desc: "Ciblage des recherches tourisme fluvial" },
            { icon: "📊", title: "Stratégie accessible", desc: "Solutions SEO adaptées aux budgets locaux" },
            { icon: "🎯", title: "Ciblage précis", desc: "Mots-clés longue traîne pour niches locales" }
        ]
    };
    const criteria = criteriaByZone[zone] || criteriaByZone["Métropole"];
    return criteria.map(c => `
              <div class="feature-item">
                <div class="feature-icon">${c.icon}</div>
                <div class="feature-content">
                  <h4>${c.title}</h4>
                  <p>${c.desc}</p>
                </div>
              </div>`).join('');
}

// ── Agency card HTML ──
function getAgencyCard(agency, cityName, zone) {
    const isAstrak = agency.rank === 1;
    const badgeHTML = isAstrak
        ? `<span class="agency-badge agency-badge-top">Recommandé</span>`
        : `<span class="agency-badge">#${agency.rank}</span>`;

    const strengthsHTML = agency.strengths
        .map(s => `<li>${s}</li>`)
        .join('');

    const localNote = isAstrak
        ? `<p class="agency-local-note">Basée à Bordeaux, Astrak accompagne les entreprises de ${cityName} et de toute la Gironde avec une expertise SEO locale incomparable.</p>`
        : '';

    return `
          <div class="agency-card${isAstrak ? ' agency-card-featured' : ''} fade-in">
            <div class="agency-card-header">
              ${badgeHTML}
              <h3>${agency.name}</h3>
              <p class="agency-tagline">${agency.shortDesc}</p>
            </div>
            <div class="agency-card-body">
              <p class="agency-specialty"><strong>Spécialité :</strong> ${agency.specialty}</p>
              <ul class="agency-strengths">${strengthsHTML}</ul>
              ${localNote}
            </div>
          </div>`;
}

// ── Get nearby cities for internal linking (same zone, rotated) ──
function getNearbyCities(currentCity, allCities) {
    const sameZone = allCities.filter(c =>
        c.zone === currentCity.zone && c.name !== currentCity.name
    );
    // Rotate starting point based on rank so different cities get linked
    const start = (currentCity.rank * 3) % Math.max(sameZone.length, 1);
    const rotated = [...sameZone.slice(start), ...sameZone.slice(0, start)];
    return rotated.slice(0, 5);
}

// ── Get cross-zone cities for maillage interne (different zones) ──
function getCrossZoneCities(currentCity, allCities) {
    const zones = ["Métropole", "Bassin d'Arcachon", "Libournais", "Médoc", "Sud-Gironde", "Entre-deux-Mers", "Haute-Gironde"];
    const otherZones = zones.filter(z => z !== currentCity.zone);
    const crossCities = [];

    // Pick 1-2 cities from each other zone, rotating for variety
    otherZones.forEach((zone, i) => {
        const zoneCities = allCities.filter(c => c.zone === zone && c.name !== currentCity.name);
        if (zoneCities.length > 0) {
            const pickIndex = (currentCity.rank + i * 2) % zoneCities.length;
            crossCities.push(zoneCities[pickIndex]);
            // For small zones, add a second pick to boost their incoming links
            if (zoneCities.length <= 8) {
                const pickIndex2 = (currentCity.rank + i * 2 + 1) % zoneCities.length;
                if (pickIndex2 !== pickIndex) crossCities.push(zoneCities[pickIndex2]);
            }
        }
    });

    return crossCities.slice(0, 8);
}

// ── Generate page for a city ──
function generatePage(city) {
    const citySlug = slugify(city.name);
    const zone = zoneContent[city.zone] || zoneContent["Métropole"];
    const canonicalUrl = `${baseUrl}/villes/agence-seo-${citySlug}`;
    const pageTitle = `Top 10 des Agences SEO à ${city.name} (${city.zip}) | Classement 2026`;
    const metaDesc = `Découvrez notre classement des 10 meilleures agences SEO à ${city.name} (${city.zip}). Comparatif expert pour choisir le bon partenaire SEO en Gironde.`;

    const introText = getCityIntro(city, city.zone);
    const economicCtx = zone.economicContext(city.name);
    const whyLocal = zone.whyLocal(city.name);
    const criteriaHTML = getCriteriaSection(city.zone);
    const agencyCardsHTML = agencies.map(a => getAgencyCard(a, city.name, city.zone)).join('');

    const nearbyCities = getNearbyCities(city, allCities);
    const nearbyLinksHTML = nearbyCities.map(c => {
        const s = slugify(c.name);
        return `          <a href="agence-seo-${s}" class="related-card fade-in"><h3>Agences SEO ${c.name}</h3><p>Top 10 SEO à ${c.name}</p></a>`;
    }).join('\n');

    // Cross-zone links for maillage interne (ensures 5+ incoming links per page)
    const crossZoneCities = getCrossZoneCities(city, allCities);
    const crossZoneLinksHTML = crossZoneCities.map(c => {
        const s = slugify(c.name);
        return `          <a href="agence-seo-${s}" class="related-card fade-in"><h3>Agences SEO ${c.name}</h3><p>Top 10 à ${c.name} (${c.zone})</p></a>`;
    }).join('\n');

    // Service links for this city
    const serviceLinks = city.name === "Bordeaux" ? `
          <a href="../audit-seo-bordeaux" class="related-card fade-in"><h3>Audit SEO Bordeaux</h3><p>Audit SEO complet</p></a>
          <a href="../netlinking-bordeaux" class="related-card fade-in"><h3>Netlinking Bordeaux</h3><p>Stratégie de backlinks</p></a>
          <a href="../seo-local-bordeaux" class="related-card fade-in"><h3>SEO Local Bordeaux</h3><p>Visibilité locale</p></a>
          <a href="../redaction-seo" class="related-card fade-in"><h3>Rédaction SEO Bordeaux</h3><p>Contenu optimisé</p></a>` : `
          <a href="audit-seo-${citySlug}" class="related-card fade-in"><h3>Audit SEO ${city.name}</h3><p>Audit SEO complet</p></a>
          <a href="netlinking-${citySlug}" class="related-card fade-in"><h3>Netlinking ${city.name}</h3><p>Stratégie de backlinks</p></a>
          <a href="seo-local-${citySlug}" class="related-card fade-in"><h3>SEO Local ${city.name}</h3><p>Visibilité locale</p></a>
          <a href="redaction-seo-${citySlug}" class="related-card fade-in"><h3>Rédaction SEO ${city.name}</h3><p>Contenu optimisé</p></a>`;

    // Breadcrumb home link
    const homeLink = city.name === "Bordeaux" ? "../index.html" : "../index.html";
    const cssPath = "../css/style.css";
    const jsPath = "../js/main.js";
    const cookiesPath = "../js/cookies.js";

    // Schema.org ItemList
    const schemaItemList = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": `Top 10 des Agences SEO à ${city.name}`,
        "description": metaDesc,
        "url": canonicalUrl,
        "numberOfItems": 10,
        "itemListElement": agencies.map(a => ({
            "@type": "ListItem",
            "position": a.rank,
            "item": {
                "@type": "Organization",
                "name": a.name,
                "url": a.url,
                "description": a.shortDesc
            }
        }))
    };

    return `<!DOCTYPE html>
<html lang="fr" class="no-js">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${metaDesc}">
  <meta name="robots" content="index, follow">
  <title>${pageTitle}</title>
  <link rel="icon" type="image/png" href="/images/favicon.png">
  <link rel="canonical" href="${canonicalUrl}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${cssPath}">
  <script type="application/ld+json">${JSON.stringify(schemaItemList)}</script>

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="${pageTitle}">
  <meta property="og:description" content="${metaDesc}">
  <meta property="og:image" content="${baseUrl}/images/anthony-consultant-seo.png">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${pageTitle}">
  <meta name="twitter:description" content="${metaDesc}">
  <meta name="twitter:image" content="${baseUrl}/images/anthony-consultant-seo.png">
</head>

<body>
  <a href="#main-content" class="skip-link">Aller au contenu principal</a>
  <header class="header">
    <div class="container">
      <a href="${homeLink}" class="logo">Anthony COURTIN</a>
      <nav class="nav">
        <button class="menu-toggle" aria-expanded="false" aria-label="Menu"><span></span><span></span><span></span></button>
        <ul class="nav-list" id="nav-list">
          <li><a href="../index.html" class="nav-link">Accueil</a></li>
          <li><a href="../audit-seo-bordeaux.html" class="nav-link">Audit</a></li>
          <li><a href="../optimisation-on-page.html" class="nav-link">On-Page</a></li>
          <li><a href="../netlinking-bordeaux.html" class="nav-link">Netlinking</a></li>
          <li><a href="../seo-local-bordeaux.html" class="nav-link">Local</a></li>
          <li><a href="../redaction-seo.html" class="nav-link">Rédaction</a></li>
          <li><a href="../black-hat-seo.html" class="nav-link">Black Hat</a></li>
        </ul>
        <a href="https://www.linkedin.com/in/anthony-courtin/" class="nav-linkedin" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
        <a href="../contact.html" class="nav-cta">Contact</a>
      </nav>
    </div>
  </header>

  <main id="main-content">
    <section class="page-hero">
      <div class="container">
        <nav class="breadcrumb"><a href="../index.html">Accueil</a><span>/</span><a href="../agences-seo.html">Agences SEO</a><span>/</span><span>${city.name}</span></nav>
        <div class="landing-hero">
          <div class="landing-hero-content">
            <h1>Top 10 des Agences SEO à <span class="text-gradient">${city.name}</span></h1>
            <p>${introText}</p>
            <div class="service-features">
${criteriaHTML}
            </div>
          </div>
          <div class="landing-form">
            <h3>Devis SEO gratuit ${city.name}</h3>
            <form action="https://formsubmit.co/anthony@astrak.agency" method="POST">
              <input type="hidden" name="_subject" value="Agence SEO ${city.name} - Top 10">
              <input type="hidden" name="_captcha" value="true">
              <input type="text" name="_honey" style="display:none">
              <div class="form-group"><label for="name">Nom *</label><input type="text" id="name" name="name" required placeholder="Votre nom"></div>
              <div class="form-group"><label for="email">Email *</label><input type="email" id="email" name="email" required placeholder="votre@email.com"></div>
              <div class="form-group"><label for="website">URL du site</label><input type="url" id="website" name="website" placeholder="https://votresite.fr"></div>
              <div class="form-group"><label for="message">Votre projet</label><textarea id="message" name="message" placeholder="Décrivez votre projet SEO à ${city.name}..."></textarea></div>
              <button type="submit" class="btn btn-primary">Demander un devis</button>
            </form>
          </div>
        </div>
      </div>
    </section>

    <section class="service-content">
      <div class="container">
        <div class="content-box fade-in">
          <h2>Pourquoi faire appel à une agence SEO à ${city.name} ?</h2>
          <p>${economicCtx}</p>
          <p>${whyLocal}</p>

          <h3>Les critères pour choisir la bonne agence SEO</h3>
          <p>Pour les ${zone.businessTypes} de ${city.name}, choisir le bon partenaire SEO est une décision stratégique. Voici les critères essentiels à évaluer :</p>
          <ul>
            <li><strong>Expertise prouvée :</strong> demandez des études de cas et des résultats concrets obtenus pour des entreprises similaires ${zone.geoContext}.</li>
            <li><strong>Transparence méthodologique :</strong> une bonne agence explique sa stratégie et fournit un reporting régulier et compréhensible.</li>
            <li><strong>Connaissance locale :</strong> la compréhension du marché de ${city.name} et ${zone.geoContext} est un atout majeur.</li>
            <li><strong>Approche sur-mesure :</strong> méfiez-vous des offres standardisées. Chaque entreprise a des besoins SEO spécifiques.</li>
            <li><strong>Engagement résultats :</strong> privilégiez les agences qui s'engagent sur des KPIs mesurables.</li>
          </ul>

          <h3>Le marché SEO à ${city.name} en 2026</h3>
          <p>${zone.seoChallenge}</p>
          <p>En 2026, les algorithmes de Google valorisent plus que jamais l'expertise locale, la qualité du contenu et l'expérience utilisateur. Les agences SEO qui excellent dans ces domaines offrent un avantage compétitif réel aux entreprises de ${city.name}.</p>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-header fade-in">
          <h2>Classement des <span class="text-gradient">10 Meilleures Agences SEO</span> à ${city.name}</h2>
          <p>Notre sélection des agences SEO les plus performantes pour les entreprises ${zone.geoContext}.</p>
        </div>
        <div class="agencies-grid">
${agencyCardsHTML}
        </div>
      </div>
    </section>

    <section class="related-services autres-services">
      <div class="container">
        <h2>Services SEO à ${city.name}</h2>
        <div class="related-grid">
${serviceLinks}
        </div>
      </div>
    </section>

    <section class="map-section">
      <div class="container">
        <div class="map-container fade-in">
          <iframe src="https://maps.google.com/maps?q=Mairie%20de%20${encodeURIComponent(city.name)}&t=&z=14&ie=UTF8&iwloc=&output=embed" width="100%" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
        </div>
      </div>
    </section>

    <section class="related-services">
      <div class="container">
        <h2>Agences SEO dans d'autres villes ${zone.geoContext}</h2>
        <div class="related-grid">
${nearbyLinksHTML}
        </div>
      </div>
    </section>

    <section class="related-services">
      <div class="container">
        <h2>Top agences SEO dans d'autres zones de Gironde</h2>
        <div class="related-grid">
${crossZoneLinksHTML}
        </div>
        <div style="text-align:center; margin-top:1.5rem;">
          <a href="../agences-seo.html" class="btn btn-secondary">Voir toutes les villes en Gironde →</a>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="cta-section fade-in">
          <div class="cta-content">
            <h2>Besoin d'un expert SEO à ${city.name} ?</h2>
            <p>En tant que consultant SEO en Gironde et partenaire Astrak, je vous accompagne dans votre stratégie de visibilité.</p>
            <a href="../contact.html" class="btn">Contactez-moi</a>
          </div>
        </div>
      </div>
    </section>

    <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <span class="logo">Anthony SEO</span>
          <p>Consultant SEO & Stratégie Digitale à Bordeaux.</p>
          <a href="https://www.linkedin.com/in/anthony-courtin/" class="footer-linkedin" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
        </div>
        <div class="footer-col">
          <h4>Services</h4>
          <ul class="footer-links">
            <li class="footer-dropdown">
              <span class="footer-dropdown-toggle">Audit SEO</span>
              <div class="footer-dropdown-menu">
                <a href="../audit-seo-bordeaux.html">Bordeaux</a>
                <a href="audit-seo-merignac.html">Mérignac</a>
                <a href="audit-seo-pessac.html">Pessac</a>
                <a href="audit-seo-talence.html">Talence</a>
                <a href="audit-seo-villenave-d-ornon.html">Villenave-d'Ornon</a>
                <a href="audit-seo-saint-medard-en-jalles.html">St-Médard-en-Jalles</a>
                <a href="audit-seo-begles.html">Bègles</a>
                <a href="audit-seo-la-teste-de-buch.html">La Teste-de-Buch</a>
                <a href="audit-seo-cenon.html">Cenon</a>
                <a href="audit-seo-gradignan.html">Gradignan</a>
              </div>
            </li>
            <li class="footer-dropdown">
              <span class="footer-dropdown-toggle">Netlinking</span>
              <div class="footer-dropdown-menu">
                <a href="../netlinking-bordeaux.html">Bordeaux</a>
                <a href="netlinking-merignac.html">Mérignac</a>
                <a href="netlinking-pessac.html">Pessac</a>
                <a href="netlinking-talence.html">Talence</a>
              </div>
            </li>
            <li class="footer-dropdown">
              <span class="footer-dropdown-toggle">SEO Local</span>
              <div class="footer-dropdown-menu">
                <a href="../seo-local-bordeaux.html">Bordeaux</a>
                <a href="seo-local-merignac.html">Mérignac</a>
                <a href="seo-local-pessac.html">Pessac</a>
                <a href="seo-local-talence.html">Talence</a>
              </div>
            </li>
            <li><a href="../agences-seo.html">Top Agences SEO Gironde</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Ressources</h4>
          <ul class="footer-links">
            <li><a href="../blog/index.html">Blog</a></li>
            <li><a href="../linkedin-posts.html">Posts LinkedIn</a></li>
            <li>Bordeaux, France</li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Contact</h4>
          <ul class="footer-links">
            <li><a href="../contact.html">Formulaire</a></li>
            <li><a href="mailto:anthony@astrak.agency">anthony@astrak.agency</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© <span id="current-year"></span> Anthony Courtin - Consultant SEO Bordeaux</p>
        <div class="footer-legal">
            <a href="../mentions-legales.html">Mentions Légales</a>
            <a href="../confidentialite.html">Confidentialité</a>
            <a href="../plan-du-site.html">Plan du site</a>
        </div>
        <p>Partenaire <a href="https://astrak.agency" target="_blank" rel="noopener noreferrer">Astrak Agency</a></p>
      </div>
    </div>
  </footer>
    <script src="${jsPath}"></script>
    <script>document.getElementById('current-year').textContent = new Date().getFullYear();</script>
    <noscript>
    <style>
      .fade-in { opacity: 1; transform: none }
      .nav-list { position: static; transform: none; opacity: 1; visibility: visible }
      .menu-toggle { display: none }
      .footer-dropdown-menu { display: block !important; position: static; padding-left: 0; margin-top: 0.25rem; }
      .footer-dropdown-toggle::after { display: none; }
    </style>
  </noscript>
    <script src="${cookiesPath}"></script>
</body>

</html>`;
}

// ── Main: Generate all pages ──
const villesDir = path.join(__dirname, 'villes');
if (!fs.existsSync(villesDir)) {
    fs.mkdirSync(villesDir, { recursive: true });
}

let count = 0;
allCities.forEach(city => {
    const slug = slugify(city.name);
    const filename = `agence-seo-${slug}.html`;
    const filepath = path.join(villesDir, filename);
    const html = generatePage(city);
    fs.writeFileSync(filepath, html, 'utf8');
    count++;
});

console.log(`Generated ${count} Top 10 agency pages in villes/`);

// ── Generate Hub Page (agences-seo.html) with correct slugs ──
function generateHubPage() {
    const zones = {
        "Métropole Bordelaise": allCities.filter(c => c.zone === "Métropole"),
        "Bassin d'Arcachon": allCities.filter(c => c.zone === "Bassin d'Arcachon"),
        "Libournais": allCities.filter(c => c.zone === "Libournais"),
        "Sud-Gironde": allCities.filter(c => c.zone === "Sud-Gironde"),
        "Médoc": allCities.filter(c => c.zone === "Médoc"),
        "Entre-deux-Mers": allCities.filter(c => c.zone === "Entre-deux-Mers"),
        "Haute-Gironde": allCities.filter(c => c.zone === "Haute-Gironde")
    };

    let zoneCardsHTML = '';
    Object.entries(zones).forEach(([zoneName, cities]) => {
        const linksHTML = cities.map(c => {
            const s = slugify(c.name);
            return `              <li><a href="villes/agence-seo-${s}" class="zone-tag">${c.name}</a></li>`;
        }).join('\n');
        zoneCardsHTML += `
          <div class="zone-card">
            <h3>${zoneName}</h3>
            <ul class="zone-list">
${linksHTML}
            </ul>
          </div>`;
    });

    return `<!DOCTYPE html>
<html lang="fr" class="no-js">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Classement des meilleures agences SEO en Gironde (33). Découvrez notre Top 10 par ville : Bordeaux, Mérignac, Arcachon, Libourne et 97 autres villes.">
  <meta name="robots" content="index, follow">
  <title>Meilleures Agences SEO en Gironde | Top 10 par Ville - 2026</title>
  <link rel="icon" type="image/png" href="/images/favicon.png">
  <link rel="canonical" href="${baseUrl}/agences-seo">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"CollectionPage","name":"Meilleures Agences SEO en Gironde","description":"Classement des meilleures agences SEO dans 100 villes de Gironde.","url":"${baseUrl}/agences-seo","author":{"@type":"Person","name":"Anthony Courtin","url":"${baseUrl}/"},"about":{"@type":"Service","name":"SEO","serviceType":"Référencement naturel"}}</script>
  <meta property="og:type" content="website">
  <meta property="og:url" content="${baseUrl}/agences-seo">
  <meta property="og:title" content="Meilleures Agences SEO en Gironde | Top 10 par Ville">
  <meta property="og:description" content="Classement des meilleures agences SEO en Gironde. Top 10 par ville : Bordeaux, Mérignac, Arcachon, Libourne et 97 autres.">
  <meta property="og:image" content="${baseUrl}/images/anthony-consultant-seo.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Meilleures Agences SEO en Gironde | Top 10 par Ville">
  <meta name="twitter:description" content="Classement des meilleures agences SEO en Gironde. Top 10 par ville.">
  <meta name="twitter:image" content="${baseUrl}/images/anthony-consultant-seo.png">
</head>
<body>
  <a href="#main-content" class="skip-link">Aller au contenu principal</a>
  <header class="header">
    <div class="container">
      <a href="index.html" class="logo">Anthony COURTIN</a>
      <nav class="nav" role="navigation" aria-label="Navigation principale">
        <button class="menu-toggle" aria-expanded="false" aria-controls="nav-list" aria-label="Menu"><span></span><span></span><span></span></button>
        <ul class="nav-list" id="nav-list">
          <li><a href="index.html" class="nav-link">Accueil</a></li>
          <li><a href="audit-seo-bordeaux.html" class="nav-link">Audit</a></li>
          <li><a href="optimisation-on-page.html" class="nav-link">On-Page</a></li>
          <li><a href="netlinking-bordeaux.html" class="nav-link">Netlinking</a></li>
          <li><a href="seo-local-bordeaux.html" class="nav-link">Local</a></li>
          <li><a href="redaction-seo.html" class="nav-link">Rédaction</a></li>
          <li><a href="black-hat-seo.html" class="nav-link">Black Hat</a></li>
        </ul>
        <a href="https://www.linkedin.com/in/anthony-courtin/" class="nav-linkedin" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
        <a href="contact.html" class="nav-cta">Contact</a>
      </nav>
    </div>
  </header>
  <main id="main-content">
    <section class="page-hero">
      <div class="container">
        <nav class="breadcrumb"><a href="index.html">Accueil</a><span>/</span><span>Agences SEO Gironde</span></nav>
        <div class="section-header fade-in" style="text-align:center; max-width:800px; margin:0 auto;">
          <h1>Top 10 des Agences SEO en <span class="text-gradient">Gironde</span></h1>
          <p>Retrouvez notre classement des meilleures agences SEO dans chacune des 100 villes où nous intervenons en Gironde. Chaque classement est adapté aux spécificités économiques et digitales de la ville.</p>
        </div>
      </div>
    </section>
    <section class="section zone-mesh-section">
      <div class="container">
        <div class="zone-grid">${zoneCardsHTML}
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="content-box fade-in">
          <h2>Comment choisir son agence SEO en Gironde ?</h2>
          <p>Le choix d'une agence SEO est un investissement stratégique pour votre entreprise. En Gironde, le tissu économique est varié : de la métropole bordelaise aux stations balnéaires du Bassin d'Arcachon, en passant par les vignobles du Libournais et du Médoc, chaque territoire a ses spécificités.</p>
          <p>C'est pourquoi nous avons créé un classement personnalisé pour chaque ville. Nos critères d'évaluation incluent l'expertise technique, la connaissance du marché local, la transparence des méthodes et les résultats obtenus.</p>
          <h3>Notre méthodologie de classement</h3>
          <ul>
            <li><strong>Expertise technique :</strong> maîtrise des fondamentaux SEO (crawl, indexation, Core Web Vitals)</li>
            <li><strong>Track record :</strong> résultats vérifiables et études de cas publiques</li>
            <li><strong>Connaissance locale :</strong> compréhension du marché girondin et de ses spécificités</li>
            <li><strong>Rapport qualité/prix :</strong> adéquation entre les prestations et le budget des entreprises locales</li>
            <li><strong>Accompagnement :</strong> qualité du suivi, reporting et pédagogie</li>
          </ul>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="cta-section fade-in">
          <div class="cta-content">
            <h2>Besoin d'un accompagnement SEO personnalisé ?</h2>
            <p>En tant que consultant SEO en Gironde et partenaire Astrak, je vous aide à choisir la meilleure stratégie pour votre entreprise.</p>
            <a href="contact.html" class="btn">Contactez-moi</a>
          </div>
        </div>
      </div>
    </section>
  </main>
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <span class="logo">Anthony SEO</span>
          <p>Consultant SEO & Stratégie Digitale à Bordeaux.</p>
          <a href="https://www.linkedin.com/in/anthony-courtin/" class="footer-linkedin" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
        </div>
        <div class="footer-col">
          <h4>Services</h4>
          <ul class="footer-links">
            <li><a href="audit-seo-bordeaux.html">Audit SEO</a></li>
            <li><a href="optimisation-on-page.html">Optimisation On-Page</a></li>
            <li><a href="netlinking-bordeaux.html">Netlinking</a></li>
            <li><a href="seo-local-bordeaux.html">SEO Local</a></li>
            <li><a href="redaction-seo.html">Rédaction SEO</a></li>
            <li><a href="agences-seo.html">Top Agences SEO Gironde</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Ressources</h4>
          <ul class="footer-links">
            <li><a href="blog/index.html">Blog</a></li>
            <li><a href="linkedin-posts.html">Posts LinkedIn</a></li>
            <li>Bordeaux, France</li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Contact</h4>
          <ul class="footer-links">
            <li><a href="contact.html">Formulaire</a></li>
            <li><a href="mailto:anthony@astrak.agency">anthony@astrak.agency</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© <span id="current-year"></span> Anthony Courtin - Consultant SEO Bordeaux</p>
        <div class="footer-legal">
          <a href="mentions-legales.html">Mentions Légales</a>
          <a href="confidentialite.html">Confidentialité</a>
          <a href="plan-du-site.html">Plan du site</a>
        </div>
        <p>Partenaire <a href="https://astrak.agency" target="_blank" rel="noopener noreferrer">Astrak Agency</a></p>
      </div>
    </div>
  </footer>
  <script src="js/main.js"></script>
  <script>document.getElementById('current-year').textContent = new Date().getFullYear();</script>
  <noscript>
    <style>
      .fade-in { opacity: 1; transform: none }
      .nav-list { position: static; transform: none; opacity: 1; visibility: visible }
      .menu-toggle { display: none }
      .footer-dropdown-menu { display: block !important; position: static; padding-left: 0; margin-top: 0.25rem; }
      .footer-dropdown-toggle::after { display: none; }
    </style>
  </noscript>
  <script src="js/cookies.js"></script>
</body>
</html>`;
}

// Write hub page
fs.writeFileSync(path.join(__dirname, 'agences-seo.html'), generateHubPage(), 'utf8');
console.log('Generated agences-seo.html hub page');
