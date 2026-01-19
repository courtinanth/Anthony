const fs = require('fs');
const path = require('path');

// Configuration
const defaultRegion = 'Gironde';
const services = {
    'audit-seo': 'Audit SEO',
    'seo-local': 'SEO Local',
    'optimisation-on-page': 'Optimisation On-Page',
    'netlinking': 'Netlinking',
    'redaction-seo': 'Rédaction SEO',
    'black-hat-seo': 'Black Hat SEO'
};

function generateJsonLd(filename, serviceName, cityName, region, title, desc) {
    const pageUrl = `https://anthony-courtin.com/villes/${filename}`;

    return {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebPage",
                "@id": `${pageUrl}#WebPage`,
                "url": pageUrl,
                "headline": title,
                "description": desc,
                "primaryImageOfPage": { "@id": `${pageUrl}#PrimaryImage` },
                "author": { "@id": `${pageUrl}#Person` },
                "creator": { "@id": `${pageUrl}#Business` },
                "inLanguage": "fr-FR",
                "isPartOf": { "@id": "https://anthony-courtin.com/#Website" }
            },
            {
                "@type": "ProfessionalService",
                "@id": `${pageUrl}#Business`,
                "additionalType": ["LocalBusiness", "Organization"],
                "name": "Anthony Courtin",
                "description": `Consultant SEO expert à ${cityName}. Audit, Netlinking, et Stratégies sur-mesure.`,
                "image": { "@id": `${pageUrl}#PrimaryImage` },
                "priceRange": "$$",
                "email": "anthony@astrak.agency",
                "telephone": "+33600000000",
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": cityName,
                    "addressRegion": region,
                    "addressCountry": "FR"
                },
                "areaServed": {
                    "@type": "AdministrativeArea",
                    "name": cityName
                },
                "founder": { "@id": `${pageUrl}#Person` },
                "makesOffer": {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": serviceName,
                        "serviceType": serviceName
                    }
                }
            },
            {
                "@type": "Person",
                "@id": `${pageUrl}#Person`,
                "name": "Anthony Courtin",
                "url": "https://www.linkedin.com/in/anthony-courtin/",
                "image": "https://anthony-courtin.com/images/anthony-consultant-seo.png",
                "jobTitle": "Consultant SEO",
                "worksFor": { "@id": "https://anthony-courtin.com/#Website" }
            },
            {
                "@type": "ImageObject",
                "@id": `${pageUrl}#PrimaryImage`,
                "url": "https://anthony-courtin.com/images/anthony-consultant-seo.png",
                "caption": `Anthony Courtin - Consultant ${serviceName} à ${cityName}`
            }
        ]
    };
}

function processFile(filePath) {
    const filename = path.basename(filePath);
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Identify Service and City from filename
    // Format: [service-slug]-[city-slug].html
    // But service slug can contain hyphens (e.g. black-hat-seo)

    let serviceSlug = null;
    let citySlug = null;
    let serviceName = null;

    for (const [slug, name] of Object.entries(services)) {
        if (filename.startsWith(slug + '-')) {
            serviceSlug = slug;
            serviceName = name;
            citySlug = filename.replace(slug + '-', '').replace('.html', '');
            break;
        }
    }

    if (!serviceSlug) {
        console.log(`Skipping ${filename} - Could not identify service.`);
        return;
    }

    // Capitalize city name nicely (e.g. la-teste-de-buch -> La Teste-de-Buch)
    // Actually, let's try to extract the Existing City Name from the Title tag to be safe and pretty
    let cityName = citySlug;
    const titleMatch = content.match(/<title>(.*?)<\/title>/);
    let pageTitle = '';
    if (titleMatch) {
        pageTitle = titleMatch[1];
        // Title usually looks like "Audit SEO Mérignac | Consultant..."
        // Or "[Service] [Ville] | ..."
        // Let's try to extract city from <meta name="areaServed" or the old json-ld if possible
        // But the old JSON-LD is what we want to replace.
        // Let's just assume the slug is 'okay' to prettify or extract from H1
    }

    // Attempt to extract city name from H1
    const h1Match = content.match(/<h1>(.*?)<\/h1>/);
    if (h1Match) {
        // H1 is often "Audit SEO à Mérignac" or similar
        // Or "Audit SEO <span class...>Mérignac</span>"
        const cleanH1 = h1Match[1].replace(/<[^>]+>/g, '');
        // Remove service name from H1
        const probableCity = cleanH1.replace(serviceName, '').replace(' à ', '').trim();
        if (probableCity.length > 2) {
            cityName = probableCity;
        }
    }

    // Prettify slug if H1 failed
    if (cityName === citySlug) {
        cityName = citySlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }

    // Extract Description
    let desc = '';
    const descMatch = content.match(/<meta name="description" content="(.*?)">/);
    if (descMatch) {
        desc = descMatch[1];
    }

    console.log(`Updating ${filename} -> Service: ${serviceName}, City: ${cityName}`);

    const newJsonLd = generateJsonLd(filename, serviceName, cityName, defaultRegion, pageTitle, desc);
    const jsonString = JSON.stringify(newJsonLd); // No formatting to save space, or null, 2 for pretty

    // Replace existing Script
    const regex = /<script type="application\/ld\+json">[\s\S]*?<\/script>/;

    if (regex.test(content)) {
        content = content.replace(regex, `<script type="application/ld+json">${jsonString}</script>`);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Updated JSON-LD for ${filename}`);
    } else {
        console.log(`⚠️ No JSON-LD script found in ${filename}`);
    }
}

// Run on all files in 'villes' directory
const docRoot = __dirname; // script runs in root usually? No, let's be safe.
// Assuming script is placed in project root c:\Users\court\Desktop\Siteapps\Anthony\
const villesDir = path.join(docRoot, 'villes');

if (fs.existsSync(villesDir)) {
    const files = fs.readdirSync(villesDir).filter(f => f.endsWith('.html'));
    console.log(`Found ${files.length} files in ${villesDir}`);
    files.forEach(file => {
        processFile(path.join(villesDir, file));
    });
} else {
    console.error(`Directory not found: ${villesDir}`);
}
