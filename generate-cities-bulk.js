const fs = require('fs');
const path = require('path');
const citiesExtended = require('./data/cities-extended.js');
const citiesTop10 = require('./data/cities-top10.js');

const cities = [...citiesTop10, ...citiesExtended];

// Helper to normalize strings for slug (remove accents, etc.)
function slugify(text) {
    return text.toString().toLowerCase()
        .normalize('NFD')               // Split accented characters
        .replace(/[\u0300-\u036f]/g, '') // Remove the accents
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start
        .replace(/-+$/, '');            // Trim - from end
}

// Templates setup
const services = [
    { name: "Audit SEO", slug: "audit-seo", titlePrefix: "Audit SEO" },
    { name: "Optimisation On-Page", slug: "optimisation-on-page", titlePrefix: "Optimisation On-Page" },
    { name: "Netlinking", slug: "netlinking", titlePrefix: "Netlinking" },
    { name: "SEO Local", slug: "seo-local", titlePrefix: "SEO Local" },
    { name: "Rédaction SEO", slug: "redaction-seo", titlePrefix: "Rédaction SEO" },
    { name: "Black Hat SEO", slug: "black-hat-seo", titlePrefix: "Black Hat SEO" }
];

// Clean canonical helper
function getCleanUrl(serviceSlug, citySlug) {
    return `https://anthony-courtin.com/villes/${serviceSlug}-${citySlug}`;
}

// Generate Google Map Embed URL
function getMapEmbed(cityName) {
    const query = encodeURIComponent(`Mairie de ${cityName}`);
    return `<iframe src="https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed" width="100%" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
}

// Generate Zone Links
function getZoneLinks(currentCity, allCities, currentServiceSlug) {
    // Filter cities in same zone, excluding current
    const zoneCities = allCities.filter(c => c.zone === currentCity.zone && c.name !== currentCity.name);
    // Take up to 6 random cities
    const selectedCities = zoneCities.sort(() => 0.5 - Math.random()).slice(0, 6);

    let html = `<div class="related-grid">\n`;
    selectedCities.forEach(c => {
        const cSlug = slugify(c.name);
        html += `          <a href="${currentServiceSlug}-${cSlug}" class="related-card fade-in"><h3>${currentServiceSlug === 'audit-seo' ? 'Audit SEO' : currentServiceSlug === 'seo-local' ? 'SEO Local' : currentServiceSlug === 'netlinking' ? 'Netlinking' : currentServiceSlug === 'optimisation-on-page' ? 'Optimisation' : currentServiceSlug === 'redaction-seo' ? 'Rédaction' : 'Black Hat'} ${c.name}</h3><p>Services SEO à ${c.name}</p></a>\n`;
    });
    html += `        </div>`;
    return html;
}

const templates = {};
const templateDir = path.join(__dirname, 'templates');
const serviceFiles = {
    'audit-seo': 'audit-seo.html',
    'netlinking': 'netlinking.html',
    'optimisation-on-page': 'optimisation-on-page.html',
    'seo-local': 'seo-local.html',
    'redaction-seo': 'redaction-seo.html',
    'black-hat-seo': 'black-hat-seo.html'
};

function loadTemplates() {
    for (const [key, filename] of Object.entries(serviceFiles)) {
        let content = fs.readFileSync(path.join(templateDir, filename), 'utf8');
        templates[key] = content;
    }
}

// Main generation function
function generate() {
    loadTemplates();

    cities.forEach(city => {
        const citySlug = slugify(city.name);
        console.log(`Generating pages for ${city.name} (${city.zip})...`);

        services.forEach(service => {
            let content = templates[service.slug];

            // 1. CONTENT SPINNING / GENERALIZATION (Specific Phrases FIRST)
            // Replace specific text "deuxième ville de Gironde..." BEFORE "Mérignac" is replaced by city name globally

            // "Mérignac, deuxième ville de Gironde par sa population, située à l'ouest de Bordeaux,"
            const introRegex = /Mérignac, deuxième ville de Gironde par sa population, située à l'ouest de Bordeaux,/g;
            const newIntro = `${city.name}, commune dynamique située en Gironde (${city.zip}),`;
            content = content.replace(introRegex, newIntro);

            // "À Mérignac, deuxième ville de Gironde par sa population, située à l'ouest de Bordeaux,"
            const introRegex2 = /À Mérignac, deuxième ville de Gironde par sa population, située à l'ouest de Bordeaux,/g;
            const newIntro2 = `À ${city.name}, ville active du secteur ${city.zone},`;
            content = content.replace(introRegex2, newIntro2);

            // "Mérignac est une ville importante de la métropole bordelaise."
            const heroDescRegex = /Mérignac est une ville importante de la métropole bordelaise\./g;
            const newHeroDesc = `Développez votre activité à ${city.name} et dans le secteur ${city.zone}.`;
            content = content.replace(heroDescRegex, newHeroDesc);

            // "marché mérignacais"
            content = content.replace(/marché mérignacais/g, `marché de ${city.name}`);


            // 2. REPLACEMENTS BASIC
            // Regex for case insensitive global replacement of Merignac
            content = content.replace(/Mérignac/g, city.name);
            content = content.replace(/merignac/g, citySlug);
            content = content.replace(/33700/g, city.zip);

            // 3. META DATA CUSTOMIZATION
            // Update Title (limit 62 chars)
            let pageTitle = `${service.titlePrefix} ${city.name} | Consultant SEO - Anthony`;
            if (pageTitle.length > 60) {
                pageTitle = `${service.titlePrefix} ${city.name} | SEO Anthony`;
            }
            content = content.replace(/<title>.*<\/title>/, `<title>${pageTitle}</title>`);

            // Update Meta Description (limit 160 chars)
            let metaDesc = `${service.name} à ${city.name} (${city.zip}) par Anthony Courtin. Expertise locale en Gironde pour booster votre visibilité. Devis gratuit.`;
            content = content.replace(/<meta name="description" content=".*">/, `<meta name="description" content="${metaDesc}">`);

            // 4. CANONICAL & JSON-LD
            const cleanUrl = getCleanUrl(service.slug, citySlug);
            content = content.replace(/<link rel="canonical" href=".*">/, `<link rel="canonical" href="${cleanUrl}">`);

            // 5. MAP INJECTION
            // Look for <footer class="footer">, insert map before <section class="related-services">
            if (!content.includes('class="map-section"')) {
                const mapHtml = `
    <section class="map-section">
      <div class="container">
        <div class="map-container fade-in">
          ${getMapEmbed(city.name)}
        </div>
      </div>
    </section>`;

                content = content.replace('<section class="related-services">', mapHtml + '\n    <section class="related-services">');
            }

            // 6. ZONE LINKING
            const zoneLinksHtml = getZoneLinks(city, cities, service.slug);
            const listStart = content.indexOf('<h2>Autres villes en Gironde</h2>');
            if (listStart !== -1) {
                const gridStart = content.indexOf('<div class="related-grid">', listStart);
                if (gridStart !== -1) {
                    const gridEnd = content.indexOf('</div>', gridStart);
                    if (gridEnd !== -1) {
                        const oldGrid = content.substring(gridStart, gridEnd + 6); // +6 for </div>
                        content = content.replace(oldGrid, zoneLinksHtml);
                    }
                }
            }

            // 7. Write File
            const villesDir = path.join(__dirname, 'villes');
            if (!fs.existsSync(villesDir)) {
                fs.mkdirSync(villesDir);
            }
            const fileName = `${service.slug}-${citySlug}.html`;
            fs.writeFileSync(path.join(villesDir, fileName), content);
        });
    });
    console.log("Generation complete!");
}

generate();
