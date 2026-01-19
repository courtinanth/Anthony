// Script to fix geographic errors in city descriptions
const fs = require('fs');
const path = require('path');

// CORRECTED city data with accurate geographic information
const corrections = {
    'merignac': {
        wrong: ['métropole bordelaise', 'ville importante de la métropole bordelaise'],
        right: 'grande ville de la métropole bordelaise'
    },
    'pessac': {
        wrong: ['métropole bordelaise'],
        right: 'commune de Bordeaux Métropole'
    },
    'talence': {
        wrong: ['métropole bordelaise'],
        right: 'commune de Bordeaux Métropole'
    },
    'villenave-d-ornon': {
        wrong: ['métropole bordelaise'],
        right: 'commune de Bordeaux Métropole'
    },
    'saint-medard-en-jalles': {
        wrong: ['métropole bordelaise'],
        right: 'commune de Bordeaux Métropole'
    },
    'begles': {
        wrong: ['métropole bordelaise'],
        right: 'commune de Bordeaux Métropole'
    },
    'cenon': {
        wrong: ['métropole bordelaise'],
        right: 'commune de Bordeaux Métropole, sur la rive droite'
    },
    'gradignan': {
        wrong: ['métropole bordelaise'],
        right: 'commune de Bordeaux Métropole'
    },
    // LA TESTE-DE-BUCH IS NOT IN BORDEAUX METROPOLE!
    'la-teste-de-buch': {
        wrong: ['métropole bordelaise', 'ville importante de la métropole bordelaise'],
        right: 'ville du Bassin d\'Arcachon, en Gironde'
    }
};

// Process all villes pages
const villesDir = path.join(__dirname, 'villes');
const villesFiles = fs.readdirSync(villesDir).filter(f => f.endsWith('.html'));

villesFiles.forEach(file => {
    const filePath = path.join(villesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Check which city this file is for
    for (let [citySlug, data] of Object.entries(corrections)) {
        if (file.includes(citySlug)) {
            // For La Teste-de-Buch specifically - fix the metropole error
            if (citySlug === 'la-teste-de-buch') {
                // Remove references to "métropole bordelaise"
                if (content.includes('métropole bordelaise')) {
                    content = content.replace(/métropole bordelaise/g, 'Bassin d\'Arcachon');
                    content = content.replace(/ville importante de la Bassin d'Arcachon/g, 'ville importante du Bassin d\'Arcachon');
                    content = content.replace(/une ville importante de la Bassin/g, 'une ville importante du Bassin');
                    content = content.replace(/de la Bassin/g, 'du Bassin');
                    modified = true;
                }
                // Fix "La Teste-de-Buch est une ville importante de la métropole bordelaise"
                content = content.replace(
                    /La Teste-de-Buch est une ville importante (de la métropole bordelaise|du Bassin d'Arcachon)/g,
                    'La Teste-de-Buch est une station balnéaire du Bassin d\'Arcachon, destination touristique prisée de la Gironde'
                );
            }
            break;
        }
    }

    // General fixes for all pages
    // Fix "Avec , [Ville]" leftover patterns
    content = content.replace(/Avec\s*,\s*/g, '');
    content = content.replace(/\.\s+,\s+/g, '. ');

    // Fix empty <p> tags
    content = content.replace(/<p><\/p>/g, '');

    if (modified || content !== fs.readFileSync(filePath, 'utf8')) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed: ${file}`);
    }
});

console.log('\nDone! Geographic errors fixed.');
