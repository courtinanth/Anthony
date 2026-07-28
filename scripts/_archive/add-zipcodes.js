const fs = require('fs');
const path = require('path');
const cityZips = require('./city-zips.js');

const rootDir = __dirname;
const villesDir = path.join(__dirname, 'villes');

// Get all city files (villes + root bordeaux files)
let files = fs.readdirSync(villesDir).filter(f => f.endsWith('.html')).map(f => path.join(villesDir, f));

// Add Bordeaux files from root
const rootFiles = fs.readdirSync(rootDir).filter(f => f.endsWith('.html') && (f.includes('bordeaux') || f.includes('33000')));
files = files.concat(rootFiles.map(f => path.join(rootDir, f)));

let updatedCount = 0;

files.forEach(filePath => {
    // filePath is now absolute (or full relative) path
    let file = path.basename(filePath);
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Determine city from filename or content
    // Filename format: service-slug.html (audit-seo-merignac.html)
    // We need to extract the slug. 
    // Possible slugs: merignac, pessac, talence, villenave-d-ornon, saint-medard-en-jalles, begles, la-teste-de-buch, cenon, gradignan, bordeaux

    let citySlug = '';
    let foundZip = '';

    for (const [slug, zip] of Object.entries(cityZips)) {
        if (file.includes(slug)) {
            citySlug = slug;
            foundZip = zip;
            break;
        }
    }

    if (foundZip) {
        // User said: "ajoute dans chaque texte le code de la ville ... que 1 ou deux fois"
        // We will try to append it to the meta description or the first paragraph if it's not there.
        // Actually, the user said "dans chaque texte". This is vague. 
        // "exemple la teste de buch, 33260"

        // Strategy: Replace "à [CityName]" with "à [CityName] ([Zip])" once or twice.
        // Or simply replace the first occurrence of the city name in the H1 or first paragraph.

        // Let's find the H1.
        // <h1>... à <span class="text-gradient">Bordeaux</span></h1>
        // This structure is common.

        // Let's replace the first H1 city name with "City (Zip)"? No, that might look ugly in H1.
        // Maybe in the paragraph below H1?
        // <p>Dominez Google Maps ... pour attirer les clients de votre zone géographique.</p>

        // Let's try to inject it into the Intro paragraph naturally.
        // "Consultant SEO à Bordeaux" -> "Consultant SEO à Bordeaux (33000)"

        const regexCity = new RegExp(`(${citySlug.replace(/-/g, ' ')}\s*)`, 'i'); // Simple regex, might need refinement for "Saint-Médard"

        // Better: look for specifics.
        // "SEO Local à <span class=\"text-gradient\">Mérignac</span>"
        // Let's add it in the text content.

        // Target 1: The meta description
        // <meta name="description" content="... à Mérignac ...">
        // -> "... à Mérignac (33700) ..."

        const metaDescRegex = /<meta name="description" content="(.*?)">/;
        if (metaDescRegex.test(content)) {
            let metaDesc = content.match(metaDescRegex)[1];
            if (!metaDesc.includes(foundZip)) {
                // Find city name in desc and append zip
                // We assume city name is present.
                // We can't easily find the "nice" city name from slug without a map, but we can try.
                // Or just append it at the end? "Audit SEO à Mérignac ... (33700)"
                // Let's simply replace the first occurrence of the capitalized slug parts?

                // Let's just append it to the description if it fits?
                // Or replace "Mérignac" with "Mérignac (33700)"
                // But strictly, we don't have the "Nice Name" here easily unless we map it too.
                // Wait, we can get it from the Title? <title>Audit SEO Mérignac ...</title>
            }
        }

        // Target 2: The Hero Paragraph
        // <div class="landing-hero-content"> ... <p>...</p>

        // Target 3: The Content Box
        // <div class="content-box"> ... <p>...</p>

        // Let's use a specialized replacement for "à [City]" -> "à [City] ([Zip])"
        // We catch "à Mérignac", "à Bordeaux", etc.
        // We need to be careful with case.

        // Let's iterate over the content and replace the FIRST 2 occurrences of the city name pattern "à City" with "à City (Zip)"

        // We need the "Nice Name" of the city to find it.
        // Let's derive it from the file content or map.
        // We can create a smarter map.

        const cityMap = {
            'bordeaux': 'Bordeaux',
            'merignac': 'Mérignac',
            'pessac': 'Pessac',
            'talence': 'Talence',
            'villenave-d-ornon': "Villenave-d'Ornon",
            'saint-medard-en-jalles': 'Saint-Médard-en-Jalles',
            'begles': 'Bègles',
            'la-teste-de-buch': 'La Teste-de-Buch',
            'cenon': 'Cenon',
            'gradignan': 'Gradignan'
        };

        const cityName = cityMap[citySlug];

        if (cityName) {
            let replacements = 0;
            // Regex to find "à CityName" NOT followed by zip
            const regex = new RegExp(`(à\\s+${cityName.replace(/-/g, '[- ]')})(?!\\s*\\(${foundZip}\\))`, 'g');

            content = content.replace(regex, (match) => {
                if (replacements < 2) { // Limit to 2 replacements
                    replacements++;
                    return `${match} (${foundZip})`;
                }
                return match;
            });

            // Also try "de CityName"
            if (replacements < 2) {
                const regexDe = new RegExp(`(de\\s+${cityName.replace(/-/g, '[- ]')})(?!\\s*\\(${foundZip}\\))`, 'g');
                content = content.replace(regexDe, (match) => {
                    if (replacements < 2) {
                        replacements++;
                        return `${match} (${foundZip})`;
                    }
                    return match;
                });
            }
        }
    }

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        updatedCount++;
        console.log(`Updated zip for: ${file}`);
    }
});

console.log(`Finished. Updated ${updatedCount} files with zip codes.`);
