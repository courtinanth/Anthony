const fs = require('fs');
const path = require('path');
const citiesExtended = require('./data/cities-extended.js');
const citiesTop10 = require('./data/cities-top10.js');

const cities = [...citiesTop10, ...citiesExtended];

const services = [
  { name: "Audit SEO", slug: "audit-seo" },
  { name: "Optimisation On-Page", slug: "optimisation-on-page" },
  { name: "Netlinking", slug: "netlinking" },
  { name: "SEO Local", slug: "seo-local" },
  { name: "Rédaction SEO", slug: "redaction-seo" },
  { name: "Black Hat SEO", slug: "black-hat-seo" }
];

const mainPages = [
  { name: "Accueil", slug: "index.html" },
  { name: "Audit SEO Bordeaux", slug: "audit-seo-bordeaux.html" },
  { name: "Optimisation On-Page", slug: "optimisation-on-page.html" },
  { name: "Netlinking Bordeaux", slug: "netlinking-bordeaux.html" },
  { name: "SEO Local Bordeaux", slug: "seo-local-bordeaux.html" },
  { name: "Rédaction SEO", slug: "redaction-seo.html" },
  { name: "Black Hat SEO", slug: "black-hat-seo.html" },
  { name: "Posts LinkedIn", slug: "linkedin-posts.html" },
  { name: "Contact", slug: "contact.html" },
  { name: "Mentions Légales", slug: "mentions-legales.html" },
  { name: "Confidentialité", slug: "confidentialite.html" }
];

// Helper to normalized slug
function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// Generate HTML Content
let html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Plan du site Anthony Courtin. Retrouvez l'ensemble des pages, services et villes couvertes pour faciliter votre navigation.">
  <meta name="robots" content="index, follow">
  <title>Plan du site | Anthony Courtin - Consultant SEO</title>
  <link rel="icon" type="image/png" href="images/favicon.png">
  <link rel="canonical" href="https://anthony-courtin.com/plan-du-site">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
  <style>
  <style>
    :root {
      --bg-dark: #0a0a0f;
      --card-bg: #13131f; /* Slightly lighter than main bg */
      --border-color: rgba(255, 255, 255, 0.08); /* Subtle border */
      --text-primary: #ffffff;
      --text-secondary: #9ca3af;
      --accent-color: #6366f1;
      --accent-glow: rgba(99, 102, 241, 0.15);
      --pill-bg: rgba(255, 255, 255, 0.03);
      --pill-hover: rgba(99, 102, 241, 0.2);
    }

    body {
        margin: 0;
        font-family: 'Inter', sans-serif;
        background-color: var(--bg-dark);
        color: var(--text-primary);
    }

    .sitemap-hero {
        text-align: center;
        padding: 5rem 1rem 3rem;
        background: radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.1), transparent 70%);
    }
    .sitemap-hero h1 {
        font-size: 2.5rem;
        margin-bottom: 0.5rem;
        background: linear-gradient(135deg, #fff 0%, #cbd5e1 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    .sitemap-hero p {
        color: var(--text-secondary);
        font-size: 1.1rem;
    }

    .container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 0 1.5rem;
    }

    /* Card Grid System */
    .sitemap-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: 2rem;
        padding-bottom: 4rem;
    }

    .sitemap-card {
        background: var(--card-bg);
        border: 1px solid var(--border-color);
        border-radius: 16px;
        padding: 2rem;
        transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        display: flex;
        flex-direction: column;
    }

    .sitemap-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
        border-color: rgba(99, 102, 241, 0.4);
    }

    .sitemap-card h3 {
        margin-top: 0;
        margin-bottom: 1.5rem;
        font-size: 1.5rem;
        color: var(--text-primary);
        font-weight: 600;
        border-bottom: 1px solid var(--border-color);
        padding-bottom: 1rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    
    .sitemap-card h3::before {
        content: '';
        display: block;
        width: 8px;
        height: 8px;
        background: var(--accent-color);
        border-radius: 50%;
        box-shadow: 0 0 10px var(--accent-color);
    }

    /* Pill Links */
    .sitemap-pills {
        display: flex;
        flex-wrap: wrap;
        gap: 0.6rem;
        padding: 0;
        list-style: none;
    }

    .sitemap-pills li {
        margin: 0;
    }

    .sitemap-pills a {
        display: inline-block;
        padding: 0.4rem 0.9rem;
        background-color: var(--pill-bg);
        color: var(--text-secondary);
        border-radius: 8px; /* Slightly rounded rect for modern look */
        text-decoration: none;
        font-size: 0.85rem;
        transition: all 0.2s ease;
        border: 1px solid transparent;
    }

    .sitemap-pills a:hover {
        background-color: var(--pill-hover);
        color: #fff;
        border-color: rgba(99, 102, 241, 0.3);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
    }
    
    /* Main Pages Section */
    .main-pages-section {
        margin-bottom: 3rem;
    }
    .main-pages-pills {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        justify-content: center;
    }
    .main-pages-pills a {
        font-size: 1rem;
        padding: 0.6rem 1.2rem;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
    }
    .main-pages-pills a:hover {
        background: var(--accent-color);
        border-color: var(--accent-color);
    }

    @media (max-width: 768px) {
        .sitemap-grid {
            grid-template-columns: 1fr;
        }
        .sitemap-hero h1 {
            font-size: 2rem;
        }
    }
  </style>
</head>
<body>
  
  <header class="header">
    <div class="container">
      <a href="index.html" class="logo">Anthony COURTIN</a>
      <nav class="nav">
        <ul class="nav-list">
             <li><a href="index.html" class="nav-link">Accueil</a></li>
             <li><a href="audit-seo-bordeaux.html" class="nav-link">Audit</a></li>
             <li><a href="contact.html" class="nav-cta">Contact</a></li>
        </ul>
      </nav>
    </div>
  </header>

  <main id="main-content">
    <div class="sitemap-hero">
         <h1>Plan du site</h1>
         <p>Exploration complète de nos services et zones d'intervention</p>
    </div>

    <section class="sitemap-section">
      <div class="container">
        
        <!-- Main Pages & Blog Combined or Separate -->
        <div class="main-pages-section">
            <h2 style="text-align:center; font-size:1.5rem; margin-bottom:1.5rem; color:var(--text-secondary);">Pages Principales</h2>
            <div class="main-pages-pills">
                ${mainPages.map(page => `<a href="${page.slug}">${page.name}</a>`).join('\n')}
                <!-- Blog Entry -->
                <a href="blog/index.html">Le Blog</a>
            </div>
        </div>

        <hr style="margin: 3rem auto; width: 50%; border: 0; border-top: 1px solid rgba(255,255,255,0.1);">

        <!-- Services by City Cards -->
        <div class="sitemap-grid">
`;

services.forEach(service => {
  html += `          <div class="sitemap-card">
            <h3>${service.name}</h3>
            <ul class="sitemap-pills">
`;
  cities.forEach(city => {
    const citySlug = slugify(city.name);
    html += `              <li><a href="villes/${service.slug}-${citySlug}">${city.name}</a></li>\n`;
  });
  html += `            </ul>
          </div>
`;
});

html += `        </div>
      </div>
    </section>
  </main>

  <footer class="footer">
    <!-- Placeholders for valid structure -->
  </footer>

  <script src="js/main.js"></script>
</body>
</html>`;

fs.writeFileSync('plan-du-site.html', html);
console.log('plan-du-site.html generated.');
