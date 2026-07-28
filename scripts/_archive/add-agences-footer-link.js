const fs = require('fs');
const path = require('path');

// Pages to update (root level)
const rootPages = [
    'index.html',
    'audit-seo-bordeaux.html',
    'optimisation-on-page.html',
    'netlinking-bordeaux.html',
    'seo-local-bordeaux.html',
    'redaction-seo.html',
    'black-hat-seo.html',
    'contact.html',
    'plan-du-site.html',
    'linkedin-posts.html'
];

// The link to add - for root pages
const rootLink = '<li><a href="agences-seo.html">Top Agences SEO Gironde</a></li>';
// For villes pages
const villesLink = '<li><a href="../agences-seo.html">Top Agences SEO Gironde</a></li>';

let updatedCount = 0;

// 1. Update root pages
rootPages.forEach(page => {
    const filepath = path.join(__dirname, page);
    if (!fs.existsSync(filepath)) {
        console.log(`  SKIP: ${page} not found`);
        return;
    }

    let content = fs.readFileSync(filepath, 'utf8');

    // Skip if already has the link
    if (content.includes('Top Agences SEO Gironde')) {
        console.log(`  SKIP: ${page} already has link`);
        return;
    }

    // Find the last </ul> before footer-col Ressources, insert before it
    // Strategy: find the closing </ul> of the services footer-links, add the link before it
    // Look for the pattern: last footer-dropdown closing </li> followed by </ul> in the services column

    // More reliable: find "</ul>\n        </div>\n        <div class=\"footer-col\">\n          <h4>Ressources</h4>"
    // and insert the link before the </ul>

    const marker = /<\/ul>\s*<\/div>\s*<div class="footer-col">\s*<h4>Ressources<\/h4>/;
    const match = content.match(marker);

    if (match) {
        const insertPos = content.indexOf(match[0]);
        // Insert before the </ul>
        content = content.slice(0, insertPos) + `            ${rootLink}\n          ` + content.slice(insertPos);
        fs.writeFileSync(filepath, content, 'utf8');
        updatedCount++;
        console.log(`  OK: ${page}`);
    } else {
        console.log(`  WARN: ${page} - pattern not found`);
    }
});

// 2. Update villes service pages (not agence-seo- ones, those are already handled by generator)
const villesDir = path.join(__dirname, 'villes');
const villesFiles = fs.readdirSync(villesDir).filter(f =>
    f.endsWith('.html') && !f.startsWith('agence-seo-')
);

villesFiles.forEach(page => {
    const filepath = path.join(villesDir, page);
    let content = fs.readFileSync(filepath, 'utf8');

    if (content.includes('Top Agences SEO Gironde')) {
        return; // already has link
    }

    const marker = /<\/ul>\s*<\/div>\s*<div class="footer-col">\s*<h4>Ressources<\/h4>/;
    const match = content.match(marker);

    if (match) {
        const insertPos = content.indexOf(match[0]);
        content = content.slice(0, insertPos) + `            ${villesLink}\n          ` + content.slice(insertPos);
        fs.writeFileSync(filepath, content, 'utf8');
        updatedCount++;
    }
});

console.log(`\nDone! Updated ${updatedCount} pages with footer link.`);
