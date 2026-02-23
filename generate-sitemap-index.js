const fs = require('fs');
const path = require('path');
const citiesExtended = require('./data/cities-extended.js');
const citiesTop10 = require('./data/cities-top10.js');

const allCities = [
    { rank: 1, name: "Bordeaux", zip: "33000", zone: "Métropole" },
    ...citiesTop10,
    ...citiesExtended
];

const services = [
    'audit-seo',
    'optimisation-on-page',
    'netlinking',
    'seo-local',
    'redaction-seo',
    'black-hat-seo'
];

const baseUrl = 'https://anthony-courtin.com';
const today = new Date().toISOString().split('T')[0];

// ── Proper slugify ──
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

function urlEntry(loc, priority, changefreq) {
    return `  <url><loc>${loc}</loc><lastmod>${today}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>\n`;
}

function wrapUrlset(content) {
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${content}</urlset>`;
}

// ══════════════════════════════════════════════
// 1. SITEMAP MAIN (homepage, services, contact)
// ══════════════════════════════════════════════
let mainContent = '';
const mainPages = [
    { url: '', priority: '1.0', freq: 'weekly' },
    { url: 'audit-seo-bordeaux', priority: '0.9', freq: 'weekly' },
    { url: 'optimisation-on-page', priority: '0.9', freq: 'weekly' },
    { url: 'netlinking-bordeaux', priority: '0.9', freq: 'weekly' },
    { url: 'seo-local-bordeaux', priority: '0.9', freq: 'weekly' },
    { url: 'redaction-seo', priority: '0.9', freq: 'weekly' },
    { url: 'black-hat-seo', priority: '0.9', freq: 'weekly' },
    { url: 'agences-seo', priority: '0.8', freq: 'weekly' },
    { url: 'linkedin-posts', priority: '0.7', freq: 'monthly' },
    { url: 'contact', priority: '0.6', freq: 'monthly' },
    { url: 'plan-du-site', priority: '0.3', freq: 'monthly' }
];

mainPages.forEach(p => {
    const loc = p.url ? `${baseUrl}/${p.url}` : baseUrl;
    mainContent += urlEntry(loc, p.priority, p.freq);
});

fs.writeFileSync(path.join(__dirname, 'sitemap-main.xml'), wrapUrlset(mainContent));
console.log(`sitemap-main.xml: ${mainPages.length} URLs`);

// ══════════════════════════════════════════════
// 2. SITEMAP BLOG
// ══════════════════════════════════════════════
let blogContent = '';
let blogCount = 0;
const blogDir = path.join(__dirname, 'blog');
if (fs.existsSync(blogDir)) {
    // Blog index
    blogContent += urlEntry(`${baseUrl}/blog`, '0.8', 'weekly');
    blogCount++;
    // Blog articles
    const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.html') && f !== 'index.html');
    files.forEach(file => {
        const slug = file.replace('.html', '');
        blogContent += urlEntry(`${baseUrl}/blog/${slug}`, '0.8', 'monthly');
        blogCount++;
    });
}

fs.writeFileSync(path.join(__dirname, 'sitemap-blog.xml'), wrapUrlset(blogContent));
console.log(`sitemap-blog.xml: ${blogCount} URLs`);

// ══════════════════════════════════════════════
// 3. SITEMAP VILLES - SERVICES (by service type)
// ══════════════════════════════════════════════
services.forEach(service => {
    let serviceContent = '';
    let serviceCount = 0;

    allCities.forEach(city => {
        if (city.name === 'Bordeaux') return; // Bordeaux services are in main sitemap
        const citySlug = slugify(city.name);
        serviceContent += urlEntry(`${baseUrl}/villes/${service}-${citySlug}`, '0.7', 'monthly');
        serviceCount++;
    });

    const filename = `sitemap-${service}.xml`;
    fs.writeFileSync(path.join(__dirname, filename), wrapUrlset(serviceContent));
    console.log(`${filename}: ${serviceCount} URLs`);
});

// ══════════════════════════════════════════════
// 4. SITEMAP TOP 10 AGENCES SEO
// ══════════════════════════════════════════════
let agencesContent = '';
let agencesCount = 0;

allCities.forEach(city => {
    const citySlug = slugify(city.name);
    agencesContent += urlEntry(`${baseUrl}/villes/agence-seo-${citySlug}`, '0.7', 'monthly');
    agencesCount++;
});

fs.writeFileSync(path.join(__dirname, 'sitemap-agences-seo.xml'), wrapUrlset(agencesContent));
console.log(`sitemap-agences-seo.xml: ${agencesCount} URLs`);

// ══════════════════════════════════════════════
// 5. SITEMAP INDEX (master file)
// ══════════════════════════════════════════════
const subSitemaps = [
    'sitemap-main.xml',
    'sitemap-blog.xml',
    ...services.map(s => `sitemap-${s}.xml`),
    'sitemap-agences-seo.xml'
];

let indexContent = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

subSitemaps.forEach(sm => {
    indexContent += `  <sitemap><loc>${baseUrl}/${sm}</loc><lastmod>${today}</lastmod></sitemap>\n`;
});

indexContent += `</sitemapindex>`;

fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), indexContent);
console.log(`\nsitemap.xml (index): ${subSitemaps.length} sub-sitemaps`);
console.log('Sub-sitemaps:', subSitemaps.join(', '));

// Total URL count
const totalUrls = mainPages.length + blogCount + (services.length * (allCities.length - 1)) + agencesCount;
console.log(`\nTotal URLs across all sitemaps: ${totalUrls}`);
