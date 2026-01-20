// Script to update all pages with unified footer
const fs = require('fs');
const path = require('path');

// Unified footer HTML for MAIN pages (no ../ prefix)
const footerMain = `<footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <span class="logo">Anthony SEO</span>
          <p>Consultant SEO à Bordeaux.</p>
          <a href="https://www.linkedin.com/in/anthony-courtin/" class="footer-linkedin" target="_blank" rel="noopener" aria-label="LinkedIn"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
        </div>
        <div class="footer-col">
          <h4>Services</h4>
          <ul class="footer-links">
            <li class="footer-dropdown">
              <span class="footer-dropdown-toggle">Audit SEO</span>
              <div class="footer-dropdown-menu">
                <a href="audit-seo-bordeaux.html">Bordeaux</a>
                <a href="villes/audit-seo-merignac.html">Mérignac</a>
                <a href="villes/audit-seo-pessac.html">Pessac</a>
                <a href="villes/audit-seo-talence.html">Talence</a>
                <a href="villes/audit-seo-villenave-d-ornon.html">Villenave-d'Ornon</a>
                <a href="villes/audit-seo-saint-medard-en-jalles.html">St-Médard-en-Jalles</a>
                <a href="villes/audit-seo-begles.html">Bègles</a>
                <a href="villes/audit-seo-la-teste-de-buch.html">La Teste-de-Buch</a>
                <a href="villes/audit-seo-cenon.html">Cenon</a>
                <a href="villes/audit-seo-gradignan.html">Gradignan</a>
              </div>
            </li>
            <li class="footer-dropdown">
              <span class="footer-dropdown-toggle">Optimisation</span>
              <div class="footer-dropdown-menu">
                <a href="optimisation-on-page.html">Bordeaux</a>
                <a href="villes/optimisation-on-page-merignac.html">Mérignac</a>
                <a href="villes/optimisation-on-page-pessac.html">Pessac</a>
                <a href="villes/optimisation-on-page-talence.html">Talence</a>
                <a href="villes/optimisation-on-page-villenave-d-ornon.html">Villenave-d'Ornon</a>
                <a href="villes/optimisation-on-page-saint-medard-en-jalles.html">St-Médard-en-Jalles</a>
                <a href="villes/optimisation-on-page-begles.html">Bègles</a>
                <a href="villes/optimisation-on-page-la-teste-de-buch.html">La Teste-de-Buch</a>
                <a href="villes/optimisation-on-page-cenon.html">Cenon</a>
                <a href="villes/optimisation-on-page-gradignan.html">Gradignan</a>
              </div>
            </li>
            <li class="footer-dropdown">
              <span class="footer-dropdown-toggle">Netlinking</span>
              <div class="footer-dropdown-menu">
                <a href="netlinking-bordeaux.html">Bordeaux</a>
                <a href="villes/netlinking-merignac.html">Mérignac</a>
                <a href="villes/netlinking-pessac.html">Pessac</a>
                <a href="villes/netlinking-talence.html">Talence</a>
                <a href="villes/netlinking-villenave-d-ornon.html">Villenave-d'Ornon</a>
                <a href="villes/netlinking-saint-medard-en-jalles.html">St-Médard-en-Jalles</a>
                <a href="villes/netlinking-begles.html">Bègles</a>
                <a href="villes/netlinking-la-teste-de-buch.html">La Teste-de-Buch</a>
                <a href="villes/netlinking-cenon.html">Cenon</a>
                <a href="villes/netlinking-gradignan.html">Gradignan</a>
              </div>
            </li>
            <li class="footer-dropdown">
              <span class="footer-dropdown-toggle">SEO Local</span>
              <div class="footer-dropdown-menu">
                <a href="seo-local-bordeaux.html">Bordeaux</a>
                <a href="villes/seo-local-merignac.html">Mérignac</a>
                <a href="villes/seo-local-pessac.html">Pessac</a>
                <a href="villes/seo-local-talence.html">Talence</a>
                <a href="villes/seo-local-villenave-d-ornon.html">Villenave-d'Ornon</a>
                <a href="villes/seo-local-saint-medard-en-jalles.html">St-Médard-en-Jalles</a>
                <a href="villes/seo-local-begles.html">Bègles</a>
                <a href="villes/seo-local-la-teste-de-buch.html">La Teste-de-Buch</a>
                <a href="villes/seo-local-cenon.html">Cenon</a>
                <a href="villes/seo-local-gradignan.html">Gradignan</a>
              </div>
            </li>
            <li class="footer-dropdown">
              <span class="footer-dropdown-toggle">Rédaction SEO</span>
              <div class="footer-dropdown-menu">
                <a href="redaction-seo.html">Bordeaux</a>
                <a href="villes/redaction-seo-merignac.html">Mérignac</a>
                <a href="villes/redaction-seo-pessac.html">Pessac</a>
                <a href="villes/redaction-seo-talence.html">Talence</a>
                <a href="villes/redaction-seo-villenave-d-ornon.html">Villenave-d'Ornon</a>
                <a href="villes/redaction-seo-saint-medard-en-jalles.html">St-Médard-en-Jalles</a>
                <a href="villes/redaction-seo-begles.html">Bègles</a>
                <a href="villes/redaction-seo-la-teste-de-buch.html">La Teste-de-Buch</a>
                <a href="villes/redaction-seo-cenon.html">Cenon</a>
                <a href="villes/redaction-seo-gradignan.html">Gradignan</a>
              </div>
            </li>
            <li class="footer-dropdown">
              <span class="footer-dropdown-toggle">Black Hat SEO</span>
              <div class="footer-dropdown-menu">
                <a href="black-hat-seo.html">Bordeaux</a>
                <a href="villes/black-hat-seo-merignac.html">Mérignac</a>
                <a href="villes/black-hat-seo-pessac.html">Pessac</a>
                <a href="villes/black-hat-seo-talence.html">Talence</a>
                <a href="villes/black-hat-seo-villenave-d-ornon.html">Villenave-d'Ornon</a>
                <a href="villes/black-hat-seo-saint-medard-en-jalles.html">St-Médard-en-Jalles</a>
                <a href="villes/black-hat-seo-begles.html">Bègles</a>
                <a href="villes/black-hat-seo-la-teste-de-buch.html">La Teste-de-Buch</a>
                <a href="villes/black-hat-seo-cenon.html">Cenon</a>
                <a href="villes/black-hat-seo-gradignan.html">Gradignan</a>
              </div>
            </li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Ressources</h4>
          <ul class="footer-links">
            <li><a href="linkedin-posts.html">Posts LinkedIn</a></li>
            <li>Bordeaux, France</li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Contact</h4>
          <ul class="footer-links">
            <li><a href="contact.html">Formulaire</a></li>
            <li><a href="mailto:anthony@astrak.agency">anthony@astrak.agency</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© <span id="current-year"></span> Anthony Courtin - Consultant SEO Bordeaux</p>
        <div class="footer-legal">
            <a href="mentions-legales.html">Mentions Légales</a>
            <a href="confidentialite.html">Confidentialité</a>
        </div>
        <p>Partenaire <a href="https://astrak.agency" target="_blank" rel="noopener">Astrak Agency</a></p>
      </div>
    </div>
  </footer>`;

// Unified footer for VILLES pages (with ../ prefix)
const footerVilles = footerMain
  .replace(/href="audit-seo-bordeaux\.html"/g, 'href="../audit-seo-bordeaux.html"')
  .replace(/href="optimisation-on-page\.html"/g, 'href="../optimisation-on-page.html"')
  .replace(/href="netlinking-bordeaux\.html"/g, 'href="../netlinking-bordeaux.html"')
  .replace(/href="seo-local-bordeaux\.html"/g, 'href="../seo-local-bordeaux.html"')
  .replace(/href="redaction-seo\.html"/g, 'href="../redaction-seo.html"')
  .replace(/href="black-hat-seo\.html"/g, 'href="../black-hat-seo.html"')
  .replace(/href="villes\//g, 'href="')
  .replace(/href="linkedin-posts\.html"/g, 'href="../linkedin-posts.html"')
  .replace(/href="contact\.html"/g, 'href="../contact.html"')
  .replace(/href="mentions-legales\.html"/g, 'href="../mentions-legales.html"')
  .replace(/href="confidentialite\.html"/g, 'href="../confidentialite.html"');

const noscriptBlock = `
  <noscript>
    <style>
      .fade-in {
        opacity: 1;
        transform: none
      }

      .nav-list {
        position: static;
        transform: none;
        opacity: 1;
        visibility: visible
      }

      .menu-toggle {
        display: none
      }
      
      /* Footer dropdown fallback - show all links when JS disabled */
      .footer-dropdown-menu {
        display: block !important;
        position: static;
        padding-left: 0;
        margin-top: 0.25rem;
      }
      
      .footer-dropdown-toggle::after {
        display: none;
      }
    </style>
  </noscript>`;

function updatePage(filePath, isVilles = false) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace footer
  const footerRegex = /<footer class="footer">[\s\S]*?<\/footer>/;
  const newFooter = isVilles ? footerVilles : footerMain;

  if (footerRegex.test(content)) {
    content = content.replace(footerRegex, newFooter);
  }

  // Replace noscript block
  const noscriptRegex = /<noscript>[\s\S]*?<\/noscript>/;
  if (noscriptRegex.test(content)) {
    content = content.replace(noscriptRegex, noscriptBlock.trim());
  }

  // Remove population references from city pages
  if (isVilles) {
    content = content.replace(/\(\d{2,3}\s?\d{3}\s?habitants?\)/gi, '');
    content = content.replace(/\d{2}\s?\d{3}\s?habitants?/gi, '');
    content = content.replace(/Avec\s+\d+[\s\d]*habitants?,?\s*/gi, '');
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated: ${path.basename(filePath)}`);
}

// Update main pages
const mainPages = [
  'audit-seo-bordeaux.html',
  'optimisation-on-page.html',
  'netlinking-bordeaux.html',
  'seo-local-bordeaux.html',
  'redaction-seo.html',
  'black-hat-seo.html',
  'contact.html',
  'linkedin-posts.html',
  'mentions-legales.html',
  'confidentialite.html'
];

console.log('Updating main pages...');
mainPages.forEach(page => {
  const filePath = path.join(__dirname, page);
  if (fs.existsSync(filePath)) {
    updatePage(filePath, false);
  }
});

// Update villes pages
console.log('\nUpdating villes pages...');
const villesDir = path.join(__dirname, 'villes');
const villesFiles = fs.readdirSync(villesDir).filter(f => f.endsWith('.html'));
villesFiles.forEach(file => {
  updatePage(path.join(villesDir, file), true);
});

console.log(`\nDone! Updated ${mainPages.length} main pages and ${villesFiles.length} villes pages.`);
