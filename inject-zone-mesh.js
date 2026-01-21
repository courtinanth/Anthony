const fs = require('fs');
const path = require('path');
const citiesExtended = require('./data/cities-extended.js');
const citiesTop10 = require('./data/cities-top10.js');

const cities = [...citiesTop10, ...citiesExtended];

// Group by Zone
const zones = {};
cities.forEach(city => {
    if (!zones[city.zone]) {
        zones[city.zone] = [];
    }
    zones[city.zone].push(city);
});

// Service Map
const fileToService = {
    'audit-seo-bordeaux.html': 'audit-seo',
    'optimisation-on-page.html': 'optimisation-on-page',
    'netlinking-bordeaux.html': 'netlinking',
    'seo-local-bordeaux.html': 'seo-local',
    'redaction-seo.html': 'redaction-seo',
    'black-hat-seo.html': 'black-hat-seo',
    'index.html': 'audit-seo' // Default
};

const targetFiles = Object.keys(fileToService);

function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

function generateMeshHTML(serviceSlug) {
    let html = `
    <section class="section zone-mesh-section">
      <div class="container">
        <h2 class="text-center mb-8">Nos zones d'intervention en <span class="text-gradient">Gironde</span></h2>
        <div class="zone-grid">`;

    for (const [zoneName, zoneCities] of Object.entries(zones)) {
        html += `
          <div class="zone-card">
            <h3>${zoneName}</h3>
            <ul class="zone-list">`;

        zoneCities.forEach(city => {
            const citySlug = slugify(city.name);
            const link = `villes/${serviceSlug}-${citySlug}`;
            html += `
              <li><a href="${link}" class="zone-tag">${city.name}</a></li>`;
        });

        html += `
            </ul>
          </div>`;
    }

    html += `
        </div>
      </div>
    </section>`;
    return html;
}

targetFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        const serviceSlug = fileToService[file];
        const meshHTML = generateMeshHTML(serviceSlug);

        // Remove existing mesh section if any (to allow re-runs)
        content = content.replace(/<section class="section zone-mesh-section">[\s\S]*?<\/section>/, '');

        // Inject before footer
        if (content.includes('<footer class="footer">')) {
            content = content.replace('<footer class="footer">', `${meshHTML}\n  <footer class="footer">`);
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Injected zone mesh into ${file}`);
        } else {
            console.error(`Could not find footer in ${file}`);
        }
    } else {
        console.warn(`File not found: ${file}`);
    }
});
