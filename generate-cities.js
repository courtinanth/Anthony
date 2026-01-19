// Script to generate city variation pages
const fs = require('fs');
const path = require('path');

const cities = [
    { slug: 'merignac', name: 'Mérignac', pop: '77 136' },
    { slug: 'pessac', name: 'Pessac', pop: '66 874' },
    { slug: 'talence', name: 'Talence', pop: '45 869' },
    { slug: 'villenave-d-ornon', name: "Villenave-d'Ornon", pop: '42 185' },
    { slug: 'saint-medard-en-jalles', name: 'Saint-Médard-en-Jalles', pop: '32 749' },
    { slug: 'begles', name: 'Bègles', pop: '30 968' },
    { slug: 'la-teste-de-buch', name: 'La Teste-de-Buch', pop: '27 141' },
    { slug: 'cenon', name: 'Cenon', pop: '26 784' },
    { slug: 'gradignan', name: 'Gradignan', pop: '26 186' }
];

const services = [
    {
        slug: 'audit-seo',
        name: 'Audit SEO',
        icon: '🔍',
        description: 'Analyse complète de votre site web pour optimiser votre référencement',
        features: [
            { icon: '🔍', title: 'Analyse Technique', desc: 'Crawl, vitesse, indexation' },
            { icon: '📝', title: 'Audit On-Page', desc: 'Balises, contenu, maillage' },
            { icon: '🔗', title: 'Analyse Off-Page', desc: 'Backlinks, autorité' },
            { icon: '📊', title: 'Benchmark', desc: 'Analyse concurrentielle locale' }
        ],
        stats: [
            { num: '+200', label: 'Points analysés' },
            { num: '48h', label: 'Délai livraison' },
            { num: '100%', label: 'Personnalisé' }
        ]
    },
    {
        slug: 'optimisation-on-page',
        name: 'Optimisation On-Page',
        icon: '⚙️',
        description: 'Optimisation technique et sémantique de vos pages pour maximiser leur potentiel',
        features: [
            { icon: '🏷️', title: 'Balises Meta', desc: 'Titles et descriptions' },
            { icon: '⚡', title: 'Performance', desc: 'Core Web Vitals' },
            { icon: '📱', title: 'Mobile-First', desc: 'Responsive et UX' },
            { icon: '🎯', title: 'Sémantique', desc: 'Structure optimisée' }
        ],
        stats: [
            { num: '+40%', label: 'CTR moyen' },
            { num: '-50%', label: 'Temps chargement' },
            { num: 'Top 10', label: 'Positions visées' }
        ]
    },
    {
        slug: 'netlinking',
        name: 'Netlinking',
        icon: '🔗',
        description: "Stratégie d'acquisition de backlinks de qualité pour renforcer votre autorité",
        features: [
            { icon: '🎯', title: 'Stratégie', desc: 'Plan personnalisé' },
            { icon: '✍️', title: 'Guest Blogging', desc: 'Articles de qualité' },
            { icon: '🤝', title: 'Partenariats', desc: 'Relations presse' },
            { icon: '📊', title: 'Reporting', desc: 'Suivi mensuel' }
        ],
        stats: [
            { num: '+30', label: 'Liens/mois' },
            { num: 'DA 40+', label: 'Qualité moyenne' },
            { num: '100%', label: 'White Hat' }
        ]
    },
    {
        slug: 'seo-local',
        name: 'SEO Local',
        icon: '📍',
        description: 'Dominez Google Maps et les recherches locales de votre zone géographique',
        features: [
            { icon: '📍', title: 'Google Business', desc: 'Fiche optimisée' },
            { icon: '🗺️', title: 'Google Maps', desc: 'Pack local' },
            { icon: '⭐', title: 'Avis Clients', desc: 'Stratégie avis' },
            { icon: '📋', title: 'Citations', desc: 'Annuaires locaux' }
        ],
        stats: [
            { num: 'Top 3', label: 'Pack local' },
            { num: '+80%', label: 'Appels' },
            { num: '5★', label: 'Note visée' }
        ]
    },
    {
        slug: 'redaction-seo',
        name: 'Rédaction SEO',
        icon: '✍️',
        description: 'Création de contenus optimisés qui positionnent et convertissent',
        features: [
            { icon: '🌐', title: 'Recherche', desc: 'Mots-clés stratégiques' },
            { icon: '✍️', title: 'Rédaction', desc: 'Contenu engageant' },
            { icon: '🎯', title: 'Optimisation', desc: 'Structure SEO' },
            { icon: '📈', title: 'Performance', desc: 'Suivi positions' }
        ],
        stats: [
            { num: '2000+', label: 'Mots/article' },
            { num: 'Page 1', label: 'Objectif' },
            { num: '100%', label: 'Original' }
        ]
    },
    {
        slug: 'black-hat-seo',
        name: 'Black Hat SEO',
        icon: '🎭',
        description: 'Techniques avancées et stratégies offensives pour des résultats rapides',
        features: [
            { icon: '🌐', title: 'PBN', desc: 'Réseaux de sites' },
            { icon: '🎭', title: 'Cloaking', desc: 'Contenu différencié' },
            { icon: '🔗', title: 'Spam Links', desc: 'Liens automatisés' },
            { icon: '⚔️', title: 'Negative SEO', desc: 'Analyse concurrentielle' }
        ],
        stats: [
            { num: '7 jours', label: 'Résultats' },
            { num: '∞', label: 'Possibilités' },
            { num: '⚠️', label: 'Risques assumés' }
        ]
    }
];

const header = `<header class="header">
    <div class="container">
      <a href="../index.html" class="logo">Anthony SEO</a>
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
        <a href="https://www.linkedin.com/in/anthony-courtin/" class="nav-linkedin" target="_blank" rel="noopener" aria-label="LinkedIn"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
        <a href="../contact.html" class="nav-cta">Contact</a>
      </nav>
    </div>
  </header>`;

const footer = `<footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand"><span class="logo">Anthony SEO</span><p>Consultant SEO en Gironde.</p><a href="https://www.linkedin.com/in/anthony-courtin/" class="footer-linkedin" target="_blank" rel="noopener" aria-label="LinkedIn"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a></div>
        <div class="footer-col"><h4>Services</h4><ul class="footer-links"><li><a href="../audit-seo-bordeaux.html">Audit SEO</a></li><li><a href="../optimisation-on-page.html">Optimisation</a></li><li><a href="../netlinking-bordeaux.html">Netlinking</a></li><li><a href="../seo-local-bordeaux.html">SEO Local</a></li><li><a href="../redaction-seo.html">Rédaction</a></li><li><a href="../black-hat-seo.html">Black Hat</a></li></ul></div>
        <div class="footer-col"><h4>Gironde</h4><ul class="footer-links"><li><a href="../index.html">Bordeaux</a></li><li><a href="audit-seo-merignac.html">Mérignac</a></li><li><a href="audit-seo-pessac.html">Pessac</a></li><li><a href="audit-seo-talence.html">Talence</a></li></ul></div>
        <div class="footer-col"><h4>Contact</h4><ul class="footer-links"><li><a href="../contact.html">Formulaire</a></li><li><a href="mailto:anthony@astrak.agency">anthony@astrak.agency</a></li></ul></div>
      </div>
      <div class="footer-bottom"><p>© <span id="current-year"></span> Anthony Courtin - Consultant SEO Gironde</p><p>Partenaire <a href="https://astrak.agency" target="_blank" rel="noopener">Astrak Agency</a></p></div>
    </div>
  </footer>
  <script src="../js/main.js"></script>
  <script>document.getElementById('current-year').textContent = new Date().getFullYear();</script>
  <noscript><style>.fade-in{opacity:1;transform:none}.nav-list{position:static;transform:none;opacity:1;visibility:visible}.menu-toggle{display:none}</style></noscript>`;

function generatePage(service, city) {
    const filename = `${service.slug}-${city.slug}.html`;
    const title = `${service.name} ${city.name} | Consultant SEO - Anthony`;
    const metaDesc = `${service.name} à ${city.name} (${city.pop} hab.). Anthony Courtin, expert SEO en Gironde.`;
    const canonical = `https://anthony-courtin.com/villes/${filename}`;

    const jsonLd = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Service",
        "name": `${service.name} ${city.name}`,
        "description": `${service.description} à ${city.name}.`,
        "provider": {
            "@type": "Person",
            "name": "Anthony Courtin",
            "sameAs": "https://www.linkedin.com/in/anthony-courtin/"
        },
        "areaServed": {
            "@type": "City",
            "name": city.name,
            "containedInPlace": { "@type": "AdministrativeArea", "name": "Gironde" }
        }
    });

    const featuresHtml = service.features.map(f =>
        `<div class="feature-item"><div class="feature-icon">${f.icon}</div><div class="feature-content"><h4>${f.title}</h4><p>${f.desc}</p></div></div>`
    ).join('\n              ');

    const statsHtml = service.stats.map(s =>
        `<div class="stat"><div class="stat-number">${s.num}</div><div class="stat-label">${s.label}</div></div>`
    ).join('\n              ');

    const otherCities = cities.filter(c => c.slug !== city.slug).slice(0, 4);
    const relatedCitiesHtml = otherCities.map(c =>
        `<a href="${service.slug}-${c.slug}.html" class="related-card fade-in"><h3>${service.name} ${c.name}</h3><p>${c.pop} habitants</p></a>`
    ).join('\n          ');

    const html = `<!DOCTYPE html>
<html lang="fr" class="no-js">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${metaDesc}">
  <meta name="robots" content="index, follow">
  <title>${title}</title>
  <link rel="canonical" href="${canonical}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../css/style.css">
  <script type="application/ld+json">${jsonLd}</script>
</head>
<body>
  <a href="#main-content" class="skip-link">Aller au contenu principal</a>
  ${header}

  <main id="main-content">
    <section class="page-hero">
      <div class="container">
        <nav class="breadcrumb"><a href="../index.html">Accueil</a><span>/</span><a href="../${service.slug === 'seo-local' ? 'seo-local-bordeaux' : service.slug === 'netlinking' ? 'netlinking-bordeaux' : service.slug === 'audit-seo' ? 'audit-seo-bordeaux' : service.slug}.html">${service.name}</a><span>/</span><span>${city.name}</span></nav>
        <div class="landing-hero">
          <div class="landing-hero-content">
            <h1>${service.name} à <span class="text-gradient">${city.name}</span></h1>
            <p>${service.description} à ${city.name} et ses environs. Avec ${city.pop} habitants, ${city.name} est une ville importante de la métropole bordelaise.</p>
            <div class="service-features">
              ${featuresHtml}
            </div>
          </div>
          <div class="landing-form">
            <h3>Devis gratuit ${city.name}</h3>
            <form action="https://formsubmit.co/anthony@astrak.agency" method="POST">
              <input type="hidden" name="_subject" value="${service.name} ${city.name}">
              <input type="hidden" name="_captcha" value="true">
              <input type="text" name="_honey" style="display:none">
              <div class="form-group"><label for="name">Nom *</label><input type="text" id="name" name="name" required placeholder="Votre nom"></div>
              <div class="form-group"><label for="email">Email *</label><input type="email" id="email" name="email" required placeholder="votre@email.com"></div>
              <div class="form-group"><label for="website">URL du site</label><input type="url" id="website" name="website" placeholder="https://votresite.fr"></div>
              <div class="form-group"><label for="message">Votre projet</label><textarea id="message" name="message" placeholder="Décrivez votre projet à ${city.name}..."></textarea></div>
              <button type="submit" class="btn btn-primary">Demander un devis</button>
            </form>
          </div>
        </div>
      </div>
    </section>

    <section class="service-content">
      <div class="container">
        <div class="content-box fade-in">
          <h2>Pourquoi choisir un consultant SEO à ${city.name} ?</h2>
          <p>Avec ${city.pop} habitants, ${city.name} représente un marché local important en Gironde. En tant que consultant SEO spécialisé sur la métropole bordelaise, je connais les spécificités du marché local.</p>
          <h3>Mon approche pour ${city.name}</h3>
          <ul>
            <li>Analyse du marché local de ${city.name}</li>
            <li>Ciblage des mots-clés géolocalisés</li>
            <li>Optimisation Google Business Profile</li>
            <li>Stratégie adaptée aux entreprises locales</li>
          </ul>
          <div class="about-stats" style="margin-top:2rem;">
            ${statsHtml}
          </div>
        </div>
      </div>
    </section>

    <section class="related-services">
      <div class="container">
        <h2>Autres villes en Gironde</h2>
        <div class="related-grid">
          ${relatedCitiesHtml}
        </div>
      </div>
    </section>
  </main>

  ${footer}
</body>
</html>`;

    return { filename, html };
}

// Generate all pages
const villesDir = path.join(__dirname, 'villes');
let count = 0;

services.forEach(service => {
    cities.forEach(city => {
        const { filename, html } = generatePage(service, city);
        const filepath = path.join(villesDir, filename);
        fs.writeFileSync(filepath, html, 'utf8');
        count++;
        console.log(`Created: ${filename}`);
    });
});

console.log(`\nTotal: ${count} pages created`);
