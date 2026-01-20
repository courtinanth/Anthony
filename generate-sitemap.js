const fs = require('fs');
const path = require('path');
const citiesExtended = require('./data/cities-extended.js');
const citiesTop10 = require('./data/cities-top10.js');

const cities = [...citiesTop10, ...citiesExtended];

const services = [
    'audit-seo',
    'optimisation-on-page',
    'netlinking',
    'seo-local',
    'redaction-seo',
    'black-hat-seo'
];

const mainPages = [
    '', // Home
    'audit-seo-bordeaux',
    'optimisation-on-page',
    'netlinking-bordeaux',
    'seo-local-bordeaux',
    'redaction-seo',
    'black-hat-seo',
    'linkedin-posts',
    'contact',
    'mentions-legales',
    'confidentialite',
    'plan-du-site'
];

// Base URL
const baseUrl = 'https://anthony-courtin.com';
const today = new Date().toISOString().split('T')[0];

let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

// 1. Main Pages
sitemapContent += `  <!-- Main Pages -->\n`;
mainPages.forEach(page => {
    const url = page ? `${baseUrl}/${page}` : baseUrl;
    const priority = page === '' ? '1.0' : '0.9';
    sitemapContent += `  <url><loc>${url}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>${priority}</priority></url>\n`;
});

// 2. Blog Posts (Scan blog/ directory)
sitemapContent += `\n  <!-- Blog Posts -->\n`;
const blogDir = path.join(__dirname, 'blog');
if (fs.existsSync(blogDir)) {
    const files = fs.readdirSync(blogDir);
    files.forEach(file => {
        if (file.endsWith('.html') && file !== 'index.html') {
            const slug = file.replace('.html', '');
            const url = `${baseUrl}/blog/${slug}`;
            sitemapContent += `  <url><loc>${url}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n`;
        }
    });
    // Add blog index
    sitemapContent += `  <url><loc>${baseUrl}/blog/</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
}

// 3. City Pages
sitemapContent += `\n  <!-- City Service Pages -->\n`;
services.forEach(service => {
    cities.forEach(city => {
        // Slugify city name
        const citySlug = city.name.toString().toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');

        const url = `${baseUrl}/villes/${service}-${citySlug}`;
        sitemapContent += `  <url><loc>${url}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>\n`;
    });
});

sitemapContent += `</urlset>`;

fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemapContent);
console.log('Sitemap generated successfully with ' + (mainPages.length + (cities.length * services.length)) + ' URLs.');
