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
    /* Sitemap specific styles matching 'Modulink' clean aesthetic */
    .sitemap-hero {
        text-align: center;
        padding: 4rem 1rem 2rem;
        background: var(--surface);
    }
    .sitemap-hero h1 {
        font-size: 2.5rem;
        margin-bottom: 0.5rem;
        color: var(--text-primary);
    }
    .sitemap-hero p {
        color: var(--text-secondary);
        font-size: 1.1rem;
    }

    .sitemap-section { 
        padding: 2rem 0 4rem; 
        max-width: 1400px;
        margin: 0 auto;
    }
    .container {
        max-width: 1400px; /* Wider container for sitemap */
    }

    .sitemap-group {
        margin-bottom: 3rem;
        border-bottom: 1px solid var(--border);
        padding-bottom: 2rem;
    }
    .sitemap-group:last-child {
        border-bottom: none;
    }

    .sitemap-group h2 { 
        font-size: 1.5rem; 
        margin-bottom: 1.5rem; 
        color: var(--text-primary);
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    .sitemap-count {
        color: var(--text-secondary);
        font-weight: 400;
        font-size: 1.2rem;
    }

    /* Grid System - 4 columns for desktop */
    .sitemap-list { 
        list-style: none; 
        padding: 0; 
        display: grid; 
        grid-template-columns: repeat(4, 1fr); 
        gap: 1rem 2rem; 
    }

    @media (max-width: 1024px) {
        .sitemap-list { grid-template-columns: repeat(3, 1fr); }
    }
    @media (max-width: 768px) {
        .sitemap-list { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 480px) {
        .sitemap-list { grid-template-columns: 1fr; }
    }

    .sitemap-list li a { 
        color: var(--text-secondary); 
        text-decoration: none; 
        transition: all 0.2s; 
        font-size: 0.95rem;
        display: flex;
        align-items: center;
    }
    .sitemap-list li a::before {
        content: "›";
        margin-right: 8px;
        color: var(--primary);
        font-weight: bold;
        font-size: 1.2em;
        line-height: 1;
    }
    .sitemap-list li a:hover { 
        color: var(--primary); 
        transform: translateX(3px);
    }
    
    /* Main pages specific styling */
    .sitemap-main-list {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1rem 2rem;
    }
    .sitemap-main-list a {
        display: flex;
        align-items: center;
        color: var(--text-primary);
        text-decoration: none;
        font-weight: 500;
        padding: 0.5rem 0;
    }
    .sitemap-main-list a::before {
        content: "›";
        margin-right: 8px;
        color: var(--primary);
        font-weight: bold;
        font-size: 1.2em;
    }
    .sitemap-main-list a:hover {
        color: var(--primary);
    }
  </style>
</head>
<body>
  
  <!-- Header placeholder -->
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
         <p>Retrouvez l'ensemble des pages de notre site pour naviguer facilement</p>
    </div>

    <section class="sitemap-section">
      <div class="container">
        
        <!-- Main Pages -->
        <div class="sitemap-group">
            <h2>Pages Principales</h2>
            <div class="sitemap-main-list">
                ${mainPages.map(page => `<a href="${page.slug}">${page.name}</a>`).join('\n')}
            </div>
        </div>

        <!-- Blog -->
        <div class="sitemap-group">
            <h2>Blog</h2>
            <ul class="sitemap-list">
`;

// Add Blog Posts
const blogDir = path.join(__dirname, 'blog');
if (fs.existsSync(blogDir)) {
  const files = fs.readdirSync(blogDir);
  files.forEach(file => {
    if (file.endsWith('.html') && file !== 'index.html') {
      const slug = file.replace('.html', '');
      // Convert slug to readable title (basic)
      const title = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      html += `                <li><a href="blog/${slug}">${title}</a></li>\n`;
    }
  });
}
html += `                <li><a href="blog/index.html">Index du Blog</a></li>
            </ul>
        </div>
        <hr style="margin: 3rem 0; border: 0; border-top: 1px solid var(--border);">

        <!-- Services by City -->
        <div class="sitemap-grid">
`;

services.forEach(service => {
  html += `          <div class="sitemap-group">
            <h3>${service.name}</h3>
            <ul class="sitemap-list">
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
