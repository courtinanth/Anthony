// Comprehensive update script for all pages
const fs = require('fs');
const path = require('path');

// City data with coordinates for Google Maps
const cities = {
  'bordeaux': { name: 'Bordeaux', lat: 44.8378, lng: -0.5792, mairie: 'Mairie+de+Bordeaux' },
  'merignac': { name: 'Mérignac', lat: 44.8386, lng: -0.6436, mairie: 'Mairie+de+Mérignac' },
  'pessac': { name: 'Pessac', lat: 44.8066, lng: -0.6311, mairie: 'Mairie+de+Pessac' },
  'talence': { name: 'Talence', lat: 44.8014, lng: -0.5859, mairie: 'Mairie+de+Talence' },
  'villenave-d-ornon': { name: "Villenave-d'Ornon", lat: 44.7803, lng: -0.5564, mairie: 'Mairie+de+Villenave-d%27Ornon' },
  'saint-medard-en-jalles': { name: 'Saint-Médard-en-Jalles', lat: 44.8964, lng: -0.7189, mairie: 'Mairie+de+Saint-Médard-en-Jalles' },
  'begles': { name: 'Bègles', lat: 44.8097, lng: -0.5478, mairie: 'Mairie+de+Bègles' },
  'la-teste-de-buch': { name: 'La Teste-de-Buch', lat: 44.6367, lng: -1.1428, mairie: 'Mairie+de+La+Teste-de-Buch' },
  'cenon': { name: 'Cenon', lat: 44.8567, lng: -0.5297, mairie: 'Mairie+de+Cenon' },
  'gradignan': { name: 'Gradignan', lat: 44.7725, lng: -0.6161, mairie: 'Mairie+de+Gradignan' }
};

const cityOrder = ['merignac', 'pessac', 'talence', 'villenave-d-ornon', 'saint-medard-en-jalles', 'begles', 'la-teste-de-buch', 'cenon', 'gradignan'];

const services = {
  'audit-seo': { name: 'Audit SEO', slug: 'audit-seo', bordeauxFile: 'audit-seo-bordeaux.html' },
  'optimisation-on-page': { name: 'Optimisation', slug: 'optimisation-on-page', bordeauxFile: 'optimisation-on-page.html' },
  'netlinking': { name: 'Netlinking', slug: 'netlinking', bordeauxFile: 'netlinking-bordeaux.html' },
  'seo-local': { name: 'SEO Local', slug: 'seo-local', bordeauxFile: 'seo-local-bordeaux.html' },
  'redaction-seo': { name: 'Rédaction SEO', slug: 'redaction-seo', bordeauxFile: 'redaction-seo.html' },
  'black-hat-seo': { name: 'Black Hat SEO', slug: 'black-hat-seo', bordeauxFile: 'black-hat-seo.html' }
};

// Generate Google Maps embed
function getMapEmbed(citySlug, isVilles = false) {
  const city = citySlug === 'bordeaux' ? cities.bordeaux : cities[citySlug];
  if (!city) return '';

  return `
    <!-- Google Maps -->
    <section class="section map-section">
      <div class="container">
        <h2>Localisation à <span class="text-gradient">${city.name}</span></h2>
        <div class="map-container">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5000!2d${city.lng}!3d${city.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${city.mairie}!5e0!3m2!1sfr!2sfr!4v1704067200000!5m2!1sfr!2sfr" 
            width="100%" 
            height="350" 
            style="border:0;border-radius:16px;" 
            allowfullscreen="" 
            loading="lazy" 
            referrerpolicy="no-referrer-when-downgrade">
          </iframe>
        </div>
      </div>
    </section>`;
}

// Get balanced city links for internal linking
function getBalancedCityLinks(currentCity, serviceSlug, isVilles = false) {
  const allCities = ['bordeaux', ...cityOrder];
  const currentIndex = allCities.indexOf(currentCity);

  // Get 4 different cities based on position for balanced linking
  let linkedCities = [];
  for (let i = 1; i <= 4; i++) {
    const index = (currentIndex + i * 2) % allCities.length;
    if (allCities[index] !== currentCity) {
      linkedCities.push(allCities[index]);
    }
  }
  // Ensure we have 4 cities
  while (linkedCities.length < 4) {
    for (let city of allCities) {
      if (!linkedCities.includes(city) && city !== currentCity) {
        linkedCities.push(city);
        if (linkedCities.length >= 4) break;
      }
    }
  }

  const prefix = isVilles ? '' : 'villes/';
  const parentPrefix = isVilles ? '../' : '';

  return linkedCities.slice(0, 4).map(citySlug => {
    const city = citySlug === 'bordeaux' ? cities.bordeaux : cities[citySlug];
    const service = services[serviceSlug];
    const href = citySlug === 'bordeaux'
      ? `${parentPrefix}${service.bordeauxFile}`
      : `${prefix}${serviceSlug}-${citySlug}.html`;
    return `<a href="${href}" class="related-card fade-in"><h3>${service.name} ${city.name}</h3><p>Services SEO à ${city.name}</p></a>`;
  }).join('\n          ');
}

// Social proof block for footer
const socialProofFooter = `
        <div class="footer-col">
          <h4>Notre Partenaire</h4>
          <div class="social-proof-badge">
            <a href="https://trustfolio.co/profil/astrak-FBGyIqS15aO" target="_blank" rel="noopener" class="trustfolio-badge">
              <div class="trust-stars">★★★★★</div>
              <div class="trust-text"><strong>5/5</strong> sur 41 avis</div>
              <div class="trust-source">Trustfolio</div>
            </a>
          </div>
        </div>`;

// Update logo from "Anthony SEO" to "Anthony COURTIN"
function updateLogo(content) {
  return content
    .replace(/>Anthony SEO</g, '>Anthony COURTIN<')
    .replace(/class="logo">Anthony SEO/g, 'class="logo">Anthony COURTIN');
}

// Add extra content for specific services
function getExtraContent(serviceSlug) {
  if (serviceSlug === 'netlinking') {
    return `
                <div class="content-box fade-in">
                    <h2>Pourquoi le netlinking est essentiel ?</h2>
                    <div class="stats-grid">
                      <div class="stat-card">
                        <div class="stat-icon">🔗</div>
                        <div class="stat-value">+65%</div>
                        <div class="stat-desc">des facteurs de ranking liés aux backlinks</div>
                      </div>
                      <div class="stat-card">
                        <div class="stat-icon">📈</div>
                        <div class="stat-value">3.8x</div>
                        <div class="stat-desc">plus de trafic organique avec une stratégie de liens</div>
                      </div>
                      <div class="stat-card">
                        <div class="stat-icon">🎯</div>
                        <div class="stat-value">DA 40+</div>
                        <div class="stat-desc">qualité moyenne des liens que je fournis</div>
                      </div>
                    </div>
                    <h3>Types de backlinks que j'obtiens</h3>
                    <ul>
                        <li><strong>Guest posts</strong> - Articles invités sur sites thématiques DA 30-70</li>
                        <li><strong>Liens éditoriaux</strong> - Mentions naturelles dans des articles existants</li>
                        <li><strong>Annuaires qualité</strong> - Inscriptions dans les annuaires professionnels</li>
                        <li><strong>Relations presse</strong> - Articles sponsorisés sur médias locaux</li>
                    </ul>
                </div>`;
  }
  if (serviceSlug === 'seo-local') {
    return `
                <div class="content-box fade-in">
                    <h2>L'importance du SEO Local</h2>
                    <div class="stats-grid">
                      <div class="stat-card">
                        <div class="stat-icon">📱</div>
                        <div class="stat-value">46%</div>
                        <div class="stat-desc">des recherches Google ont une intention locale</div>
                      </div>
                      <div class="stat-card">
                        <div class="stat-icon">🏪</div>
                        <div class="stat-value">76%</div>
                        <div class="stat-desc">des recherches locales aboutissent à une visite en 24h</div>
                      </div>
                      <div class="stat-card">
                        <div class="stat-icon">⭐</div>
                        <div class="stat-value">88%</div>
                        <div class="stat-desc">des consommateurs font confiance aux avis en ligne</div>
                      </div>
                    </div>
                    <h3>Ma stratégie SEO Local</h3>
                    <ul>
                        <li><strong>Google Business Profile</strong> - Optimisation complète de votre fiche</li>
                        <li><strong>Citations NAP</strong> - Cohérence nom, adresse, téléphone</li>
                        <li><strong>Avis clients</strong> - Stratégie de collecte et réponse</li>
                        <li><strong>Contenu local</strong> - Pages optimisées par zone géographique</li>
                    </ul>
                </div>`;
  }
  if (serviceSlug === 'redaction-seo') {
    return `
                <div class="content-box fade-in">
                    <h2>Le contenu, pilier du SEO</h2>
                    <div class="stats-grid">
                      <div class="stat-card">
                        <div class="stat-icon">📝</div>
                        <div class="stat-value">+434%</div>
                        <div class="stat-desc">de pages indexées avec un blog actif</div>
                      </div>
                      <div class="stat-card">
                        <div class="stat-icon">🔍</div>
                        <div class="stat-value">2000+</div>
                        <div class="stat-desc">mots minimum pour les articles qui rankent</div>
                      </div>
                      <div class="stat-card">
                        <div class="stat-icon">💬</div>
                        <div class="stat-value">10x</div>
                        <div class="stat-desc">plus de leads avec du contenu de qualité</div>
                      </div>
                    </div>
                    <h3>Mes prestations rédaction</h3>
                    <ul>
                        <li><strong>Articles de blog</strong> - 1500-3000 mots, optimisés SEO</li>
                        <li><strong>Pages piliers</strong> - Contenus longs de référence (5000+ mots)</li>
                        <li><strong>Fiches produits</strong> - Descriptions uniques et vendeuses</li>
                        <li><strong>Landing pages</strong> - Copywriting orienté conversion</li>
                    </ul>
                </div>`;
  }
  return '';
}

// Process a single file
function processFile(filePath, isVilles = false) {
  let content = fs.readFileSync(filePath, 'utf8');
  const filename = path.basename(filePath);

  // Determine city and service from filename
  let citySlug = 'bordeaux';
  let serviceSlug = null;

  if (isVilles) {
    const match = filename.match(/^(.+?)-(.+)\.html$/);
    if (match) {
      // Find the service slug
      for (let sKey of Object.keys(services)) {
        if (filename.startsWith(sKey + '-')) {
          serviceSlug = sKey;
          citySlug = filename.replace(sKey + '-', '').replace('.html', '');
          break;
        }
      }
    }
  } else {
    // Main pages
    for (let sKey of Object.keys(services)) {
      if (filename.includes(sKey) || filename === services[sKey].bordeauxFile) {
        serviceSlug = sKey;
        break;
      }
    }
  }

  // Update logo
  content = updateLogo(content);

  // Add map before footer if service page
  if (serviceSlug && !content.includes('map-section')) {
    const mapHtml = getMapEmbed(citySlug, isVilles);
    content = content.replace(/<footer class="footer">/, mapHtml + '\n\n  <footer class="footer">');
  }

  // Add extra content for specific services
  if (serviceSlug && ['netlinking', 'seo-local', 'redaction-seo'].includes(serviceSlug)) {
    const extraContent = getExtraContent(serviceSlug);
    if (extraContent && !content.includes('stats-grid')) {
      // Insert after first content-box
      const firstBoxEnd = content.indexOf('</div>\n            </div>\n        </section>\n\n        <section class="related');
      if (firstBoxEnd > -1) {
        content = content.slice(0, firstBoxEnd) + '</div>\n' + extraContent + content.slice(firstBoxEnd);
      }
    }
  }

  // Update related services links - add city blocks for villes pages
  if (isVilles && serviceSlug) {
    const relatedCityHtml = getBalancedCityLinks(citySlug, serviceSlug, true);
    // Check if there's already a city variation section
    if (!content.includes('Autres villes en Gironde') && !content.includes('autres-villes')) {
      const relatedSection = `
    <section class="related-services autres-villes">
      <div class="container">
        <h2>Autres villes en Gironde</h2>
        <div class="related-grid">
          ${relatedCityHtml}
        </div>
      </div>
    </section>`;
      // Insert before map or footer
      if (content.includes('map-section')) {
        content = content.replace(/<section class="section map-section">/, relatedSection + '\n\n    <section class="section map-section">');
      } else {
        content = content.replace(/<footer class="footer">/, relatedSection + '\n\n  <footer class="footer">');
      }
    }
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Processed: ${filename}`);
}

// Add CSS for new components
const newCSS = `
/* ===================================
   STATS GRID
   =================================== */

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-6);
  margin: var(--space-8) 0;
}

.stat-card {
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  text-align: center;
}

.stat-icon {
  font-size: 2rem;
  margin-bottom: var(--space-3);
}

.stat-value {
  font-size: var(--text-2xl);
  font-weight: 700;
  background: var(--color-accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-desc {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin-top: var(--space-2);
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

/* ===================================
   MAP SECTION
   =================================== */

.map-section {
  padding: var(--space-12) 0;
}

.map-section h2 {
  text-align: center;
  margin-bottom: var(--space-8);
}

.map-container {
  border-radius: var(--radius-xl);
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.map-container iframe {
  display: block;
}

/* ===================================
   SOCIAL PROOF BADGE
   =================================== */

.social-proof-section {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  text-align: center;
  border: 1px solid var(--color-border);
  margin-top: var(--space-8);
}

.trustfolio-badge {
  display: inline-block;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4) var(--space-6);
  text-decoration: none;
  transition: all var(--transition-base);
}

.trustfolio-badge:hover {
  transform: translateY(-2px);
  border-color: var(--color-accent-primary);
}

.trust-stars {
  color: #fbbf24;
  font-size: var(--text-xl);
  letter-spacing: 2px;
}

.trust-text {
  color: var(--color-text-primary);
  font-size: var(--text-sm);
  margin-top: var(--space-2);
}

.trust-source {
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  margin-top: var(--space-1);
}

.autres-villes {
  background: var(--color-bg-secondary);
}
`;

// Add CSS to style.css
const cssPath = path.join(__dirname, 'css', 'style.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');
if (!cssContent.includes('stats-grid')) {
  cssContent += newCSS;
  fs.writeFileSync(cssPath, cssContent, 'utf8');
  console.log('Updated style.css with new components');
}

// Add CSS for footer legal links
const legalCSS = `
/* ===================================
   FOOTER LEGAL
   =================================== */
.footer-legal {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    margin: 0.5rem 0;
    font-size: 0.875rem;
}

.footer-legal a {
    color: var(--color-text-muted);
    text-decoration: none;
    transition: color 0.2s;
}

.footer-legal a:hover {
    color: var(--color-primary);
}
`;

if (!cssContent.includes('.footer-legal')) {
  cssContent += legalCSS;
  fs.writeFileSync(cssPath, cssContent, 'utf8');
  console.log('Updated style.css with footer legal styles');
}

// Process main pages
console.log('Processing main service pages...');
const mainServicePages = [
  'audit-seo-bordeaux.html',
  'optimisation-on-page.html',
  'netlinking-bordeaux.html',
  'seo-local-bordeaux.html',
  'redaction-seo.html',
  'black-hat-seo.html'
];

mainServicePages.forEach(page => {
  const filePath = path.join(__dirname, page);
  if (fs.existsSync(filePath)) {
    processFile(filePath, false);
  }
});

// Process other main pages (just logo update)
['index.html', 'contact.html', 'linkedin-posts.html'].forEach(page => {
  const filePath = path.join(__dirname, page);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = updateLogo(content);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated logo: ${page}`);
  }
});

// Process villes pages
console.log('\nProcessing villes pages...');
const villesDir = path.join(__dirname, 'villes');
const villesFiles = fs.readdirSync(villesDir).filter(f => f.endsWith('.html'));
villesFiles.forEach(file => {
  processFile(path.join(villesDir, file), true);
});

console.log(`\nDone! Processed ${mainServicePages.length} main pages and ${villesFiles.length} villes pages.`);
