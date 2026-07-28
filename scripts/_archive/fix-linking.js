// Script to fix internal linking and add content to Rédaction pages
const fs = require('fs');
const path = require('path');

const cities = [
    { slug: 'bordeaux', name: 'Bordeaux' },
    { slug: 'merignac', name: 'Mérignac' },
    { slug: 'pessac', name: 'Pessac' },
    { slug: 'talence', name: 'Talence' },
    { slug: 'villenave-d-ornon', name: "Villenave-d'Ornon" },
    { slug: 'saint-medard-en-jalles', name: 'Saint-Médard-en-Jalles' },
    { slug: 'begles', name: 'Bègles' },
    { slug: 'la-teste-de-buch', name: 'La Teste-de-Buch' },
    { slug: 'cenon', name: 'Cenon' },
    { slug: 'gradignan', name: 'Gradignan' }
];

const services = [
    { slug: 'audit-seo', name: 'Audit SEO', bordeauxFile: 'audit-seo-bordeaux.html' },
    { slug: 'optimisation-on-page', name: 'Optimisation On-Page', bordeauxFile: 'optimisation-on-page.html' },
    { slug: 'netlinking', name: 'Netlinking', bordeauxFile: 'netlinking-bordeaux.html' },
    { slug: 'seo-local', name: 'SEO Local', bordeauxFile: 'seo-local-bordeaux.html' },
    { slug: 'redaction-seo', name: 'Rédaction SEO', bordeauxFile: 'redaction-seo.html' },
    { slug: 'black-hat-seo', name: 'Black Hat SEO', bordeauxFile: 'black-hat-seo.html' }
];

// Get 4 balanced city links based on current city index
function getBalancedCityLinks(currentCitySlug, currentServiceSlug, isVilles) {
    const currentIndex = cities.findIndex(c => c.slug === currentCitySlug);
    const prefix = isVilles ? '' : 'villes/';
    const parentPrefix = isVilles ? '../' : '';

    // Distribute evenly - skip 2-3 cities to ensure all cities get linked
    let linkedCities = [];
    const step = Math.floor(cities.length / 4);

    for (let i = 1; i <= 4; i++) {
        const index = (currentIndex + i * step) % cities.length;
        const city = cities[index];
        if (city.slug !== currentCitySlug) {
            linkedCities.push(city);
        }
    }

    // Fill if needed
    while (linkedCities.length < 4) {
        for (let city of cities) {
            if (!linkedCities.find(c => c.slug === city.slug) && city.slug !== currentCitySlug) {
                linkedCities.push(city);
                if (linkedCities.length >= 4) break;
            }
        }
    }

    return linkedCities.slice(0, 4).map(city => {
        const href = city.slug === 'bordeaux'
            ? `${parentPrefix}${services.find(s => s.slug === currentServiceSlug).bordeauxFile}`
            : `${prefix}${currentServiceSlug}-${city.slug}.html`;
        return `<a href="${href}" class="related-card fade-in"><h3>${services.find(s => s.slug === currentServiceSlug).name} ${city.name}</h3><p>Services SEO à ${city.name}</p></a>`;
    }).join('\n          ');
}

// Get cross-service links (4 other services)
function getCrossServiceLinks(currentServiceSlug, citySlug, isVilles) {
    const parentPrefix = isVilles ? '../' : '';
    const prefix = isVilles ? '' : 'villes/';

    return services
        .filter(s => s.slug !== currentServiceSlug)
        .slice(0, 4)
        .map(service => {
            const city = cities.find(c => c.slug === citySlug);
            const href = citySlug === 'bordeaux'
                ? `${parentPrefix}${service.bordeauxFile}`
                : `${prefix}${service.slug}-${citySlug}.html`;
            return `<a href="${href}" class="related-card fade-in"><h3>${service.name} ${city.name}</h3><p>${service.name} professionnel</p></a>`;
        }).join('\n          ');
}

// Enhanced Rédaction content with graphs
const redactionExtraContent = `
                <div class="content-box fade-in">
                    <h2>Impact du contenu sur le référencement</h2>
                    <p>Le contenu de qualité est le pilier fondamental de toute stratégie SEO réussie. Voici les données qui le prouvent :</p>
                    
                    <div class="chart-section">
                      <h3>📊 ROI du Content Marketing</h3>
                      <div class="chart-bar-container">
                        <div class="chart-bar">
                          <div class="chart-bar-fill" style="width: 97%"></div>
                          <span class="chart-label">Augmentation du trafic organique</span>
                          <span class="chart-value">+97%</span>
                        </div>
                        <div class="chart-bar">
                          <div class="chart-bar-fill" style="width: 67%"></div>
                          <span class="chart-label">Génération de leads qualifiés</span>
                          <span class="chart-value">+67%</span>
                        </div>
                        <div class="chart-bar">
                          <div class="chart-bar-fill" style="width: 55%"></div>
                          <span class="chart-label">Amélioration du taux de conversion</span>
                          <span class="chart-value">+55%</span>
                        </div>
                        <div class="chart-bar">
                          <div class="chart-bar-fill" style="width: 83%"></div>
                          <span class="chart-label">Croissance de l'autorité domaine</span>
                          <span class="chart-value">+83%</span>
                        </div>
                      </div>
                    </div>

                    <div class="comparison-grid">
                      <div class="comparison-card">
                        <h4>❌ Sans stratégie contenu</h4>
                        <ul>
                          <li>Peu de pages indexées</li>
                          <li>Faible autorité thématique</li>
                          <li>Trafic stagnant</li>
                          <li>Dépendance aux ads</li>
                        </ul>
                      </div>
                      <div class="comparison-card highlight">
                        <h4>✅ Avec rédaction SEO</h4>
                        <ul>
                          <li>+434% de pages indexées</li>
                          <li>Expert reconnu par Google</li>
                          <li>Croissance organique durable</li>
                          <li>Coût d'acquisition réduit</li>
                        </ul>
                      </div>
                    </div>

                    <div class="stats-grid">
                      <div class="stat-card">
                        <div class="stat-icon">📈</div>
                        <div class="stat-value">3x</div>
                        <div class="stat-desc">plus de leads avec un blog régulier</div>
                      </div>
                      <div class="stat-card">
                        <div class="stat-icon">⏱️</div>
                        <div class="stat-value">6 mois</div>
                        <div class="stat-desc">pour voir les premiers résultats</div>
                      </div>
                      <div class="stat-card">
                        <div class="stat-icon">💰</div>
                        <div class="stat-value">-62%</div>
                        <div class="stat-desc">coût par lead vs publicité</div>
                      </div>
                    </div>
                </div>`;

// CSS for charts
const chartCSS = `
/* Chart Bars */
.chart-section {
  margin: var(--space-8) 0;
}

.chart-bar-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.chart-bar {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  position: relative;
}

.chart-bar-fill {
  height: 32px;
  background: var(--color-accent-gradient);
  border-radius: var(--radius-md);
  transition: width 1s ease-out;
}

.chart-label {
  flex: 1;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.chart-value {
  font-weight: 700;
  color: var(--color-accent-secondary);
  min-width: 60px;
  text-align: right;
}

/* Comparison Grid */
.comparison-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-6);
  margin: var(--space-8) 0;
}

.comparison-card {
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
}

.comparison-card.highlight {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%);
  border-color: rgba(34, 197, 94, 0.3);
}

.comparison-card h4 {
  margin-bottom: var(--space-4);
  font-size: var(--text-lg);
}

.comparison-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.comparison-card li {
  padding: var(--space-2) 0;
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border);
}

.comparison-card li:last-child {
  border-bottom: none;
}

@media (max-width: 768px) {
  .comparison-grid {
    grid-template-columns: 1fr;
  }
  
  .chart-bar {
    flex-wrap: wrap;
  }
  
  .chart-bar-fill {
    width: 100% !important;
    order: 2;
  }
  
  .chart-label {
    order: 1;
    flex: none;
    width: 100%;
  }
  
  .chart-value {
    order: 0;
  }
}
`;

// Process villes pages with proper linking
function processVillesPage(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const filename = path.basename(filePath);

    // Extract service and city from filename
    let serviceSlug = null;
    let citySlug = null;

    for (let service of services) {
        if (filename.startsWith(service.slug + '-')) {
            serviceSlug = service.slug;
            citySlug = filename.replace(service.slug + '-', '').replace('.html', '');
            break;
        }
    }

    if (!serviceSlug || !citySlug) {
        console.log(`Skipping ${filename} - could not parse`);
        return;
    }

    // Generate new related sections
    const cityLinks = getBalancedCityLinks(citySlug, serviceSlug, true);
    const serviceLinks = getCrossServiceLinks(serviceSlug, citySlug, true);

    // Replace existing "Autres villes" section with new balanced links
    const villesSection = `
    <section class="related-services">
      <div class="container">
        <h2>Autres villes en Gironde</h2>
        <div class="related-grid">
          ${cityLinks}
        </div>
      </div>
    </section>

    <section class="related-services autres-services">
      <div class="container">
        <h2>Autres services à ${cities.find(c => c.slug === citySlug)?.name || citySlug}</h2>
        <div class="related-grid">
          ${serviceLinks}
        </div>
      </div>
    </section>`;

    // Remove old related sections and add new ones
    content = content.replace(/<section class="related-services[^"]*">[\s\S]*?<\/section>\s*(<section class="related-services|<section class="section map-section|<footer)/g,
        (match, next) => villesSection + '\n\n    ' + next);

    // For redaction pages, add extra content
    if (serviceSlug === 'redaction-seo' && !content.includes('chart-section')) {
        const insertPoint = content.indexOf('</div>\n      </div>\n    </section>\n\n    <section class="related');
        if (insertPoint > -1) {
            content = content.slice(0, insertPoint) + '</div>\n' + redactionExtraContent + '\n      ' + content.slice(insertPoint);
        }
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filename}`);
}

// Process main service pages - add cross-service links
function processMainPage(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const filename = path.basename(filePath);

    // Find the service
    let serviceSlug = null;
    for (let service of services) {
        if (filename === service.bordeauxFile) {
            serviceSlug = service.slug;
            break;
        }
    }

    if (!serviceSlug) {
        console.log(`Skipping ${filename}`);
        return;
    }

    // Generate cross-service links (no city links for Bordeaux pages, they have their own related services)
    const serviceLinks = getCrossServiceLinks(serviceSlug, 'bordeaux', false);

    // Check if there's already a "Découvrez aussi" section and ensure it includes all services
    // For now, let's add SEO Local to pages that don't have it linked
    if (!content.includes('seo-local-bordeaux.html') && serviceSlug !== 'seo-local') {
        content = content.replace(
            /<a href="netlinking-bordeaux\.html" class="related-card fade-in">/,
            '<a href="seo-local-bordeaux.html" class="related-card fade-in"><h3>SEO Local Bordeaux</h3><p>Optimisation locale Google.</p></a>\n                    <a href="netlinking-bordeaux.html" class="related-card fade-in">'
        );
    }

    // For redaction pages, add extra content
    if (serviceSlug === 'redaction-seo' && !content.includes('chart-section')) {
        const insertPoint = content.indexOf('</div>\n            </div>\n        </section>\n\n        <section class="related');
        if (insertPoint > -1) {
            content = content.slice(0, insertPoint) + '</div>\n' + redactionExtraContent.replace(/                /g, '            ') + '\n            ' + content.slice(insertPoint);
        }
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filename}`);
}

// Add chart CSS to style.css
const cssPath = path.join(__dirname, 'css', 'style.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');
if (!cssContent.includes('chart-bar-container')) {
    cssContent += chartCSS;
    fs.writeFileSync(cssPath, cssContent, 'utf8');
    console.log('Added chart CSS to style.css');
}

// Process all main pages
console.log('Processing main pages...');
const mainPages = ['audit-seo-bordeaux.html', 'optimisation-on-page.html', 'netlinking-bordeaux.html',
    'seo-local-bordeaux.html', 'redaction-seo.html', 'black-hat-seo.html'];
mainPages.forEach(page => {
    const filePath = path.join(__dirname, page);
    if (fs.existsSync(filePath)) {
        processMainPage(filePath);
    }
});

// Process all villes pages
console.log('\nProcessing villes pages...');
const villesDir = path.join(__dirname, 'villes');
const villesFiles = fs.readdirSync(villesDir).filter(f => f.endsWith('.html'));
villesFiles.forEach(file => {
    processVillesPage(path.join(villesDir, file));
});

console.log(`\nDone! Updated ${mainPages.length} main pages and ${villesFiles.length} villes pages.`);
