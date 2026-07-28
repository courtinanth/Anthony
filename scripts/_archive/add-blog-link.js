// Script to add Blog link to footer on all pages
const fs = require('fs');
const path = require('path');

function addBlogLinkToFooter(dir, isVilles = false) {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
    const blogPath = isVilles ? '../blog/index.html' : 'blog/index.html';

    files.forEach(file => {
        const filePath = path.join(dir, file);
        let content = fs.readFileSync(filePath, 'utf8');

        // Check if already has Blog link
        if (content.includes('>Blog</a>') && content.includes('blog/index.html')) {
            console.log(`Skipping ${file} - already has Blog link`);
            return;
        }

        // Find Ressources section in footer and add Blog link
        const ressourcesPattern = /<h4>Ressources<\/h4>\s*<ul class="footer-links">/;
        if (ressourcesPattern.test(content)) {
            content = content.replace(
                ressourcesPattern,
                `<h4>Ressources</h4>
          <ul class="footer-links">
            <li><a href="${blogPath}">Blog</a></li>`
            );
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated: ${file}`);
        } else {
            console.log(`Pattern not found in ${file}`);
        }
    });
}

// Process root pages
console.log('Processing root pages...');
addBlogLinkToFooter(__dirname, false);

// Process villes pages
console.log('\nProcessing villes pages...');
addBlogLinkToFooter(path.join(__dirname, 'villes'), true);

console.log('\nDone!');
