// Script to fix content issues and add natural, unique content to city pages
const fs = require('fs');
const path = require('path');

const cities = {
    'merignac': { name: 'Mérignac', adj: 'mérignacais', desc: 'deuxième ville de Gironde par sa population, située à l\'ouest de Bordeaux' },
    'pessac': { name: 'Pessac', adj: 'pessacais', desc: 'commune dynamique au sud-ouest de Bordeaux, connue pour son campus universitaire' },
    'talence': { name: 'Talence', adj: 'talençais', desc: 'ville universitaire au sud de Bordeaux, cœur du campus bordelais' },
    'villenave-d-ornon': { name: "Villenave-d'Ornon", adj: "villenavais", desc: 'commune résidentielle au sud de Bordeaux, en pleine expansion économique' },
    'saint-medard-en-jalles': { name: 'Saint-Médard-en-Jalles', adj: 'médardais', desc: 'ville dynamique au nord-ouest de Bordeaux, entre forêt et vignobles' },
    'begles': { name: 'Bègles', adj: 'béglais', desc: 'commune en pleine transformation urbaine, au sud immédiat de Bordeaux' },
    'la-teste-de-buch': { name: 'La Teste-de-Buch', adj: 'testerins', desc: 'ville du Bassin d\'Arcachon, destination touristique prisée de la Gironde' },
    'cenon': { name: 'Cenon', adj: 'cenonais', desc: 'commune de la rive droite de la Garonne, avec vue panoramique sur Bordeaux' },
    'gradignan': { name: 'Gradignan', adj: 'gradignanais', desc: 'ville verte au sud de Bordeaux, réputée pour sa qualité de vie' }
};

const serviceContent = {
    'audit-seo': {
        intro: (city) => `En tant que consultant SEO basé en Gironde, je propose des audits SEO complets pour les entreprises de ${city.name}. Mon expertise locale me permet de comprendre les enjeux spécifiques du marché ${city.adj}.`,
        why: (city) => `<h3>Pourquoi réaliser un audit SEO à ${city.name} ?</h3>
    <p>Un audit SEO est la première étape indispensable pour améliorer votre visibilité sur Google. À ${city.name}, ${city.desc}, la concurrence locale est réelle. Mon audit vous permet d'identifier précisément les freins techniques, les opportunités de mots-clés locaux et les axes d'amélioration prioritaires.</p>
    <p>Je analyse plus de 200 critères techniques, sémantiques et concurrentiels pour vous fournir une feuille de route claire et actionnable. Chaque recommandation est priorisée selon son impact potentiel sur votre trafic organique.</p>`,
        how: (city) => `<h3>Comment se déroule l'audit ?</h3>
    <p>L'audit commence par un crawl complet de votre site pour détecter les erreurs techniques (vitesse, indexation, structure). Ensuite, j'analyse votre positionnement actuel sur les mots-clés pertinents pour votre activité à ${city.name} et en Gironde.</p>
    <p>Vous recevez un rapport détaillé sous 48h avec des recommandations concrètes : corrections techniques, optimisations de contenu, stratégie de maillage interne et opportunités de backlinks locaux.</p>`,
        advantage: (city) => `<h3>Les avantages de mon approche locale</h3>
    <p>Ma connaissance du tissu économique de ${city.name} et de la métropole bordelaise me permet de vous conseiller sur les mots-clés vraiment recherchés par vos clients potentiels. Je ne me contente pas d'appliquer des recettes génériques : j'adapte ma stratégie à votre marché local.</p>`
    },
    'optimisation-on-page': {
        intro: (city) => `L'optimisation on-page est essentielle pour améliorer le positionnement de votre site à ${city.name}. Je travaille sur tous les aspects techniques et sémantiques de vos pages.`,
        why: (city) => `<h3>Pourquoi optimiser vos pages pour ${city.name} ?</h3>
    <p>Chaque page de votre site est une opportunité de capter du trafic qualifié. À ${city.name}, ${city.desc}, les internautes recherchent des prestataires locaux de confiance. Une optimisation on-page professionnelle vous permet de répondre précisément à leurs requêtes.</p>
    <p>J'optimise vos balises title, meta descriptions, structure Hn, images et contenu pour maximiser votre pertinence aux yeux de Google tout en améliorant l'expérience utilisateur.</p>`,
        how: (city) => `<h3>Ma méthode d'optimisation</h3>
    <p>Je commence par analyser vos pages les plus stratégiques et leur potentiel de positionnement. Pour chaque page, je définis les mots-clés cibles et optimise l'ensemble des éléments on-page : balises, contenu, maillage interne.</p>
    <p>Je porte une attention particulière à la vitesse de chargement et aux Core Web Vitals, critères essentiels pour le référencement en 2024. Votre site gagne en performance technique et en visibilité.</p>`,
        advantage: (city) => `<h3>Des résultats mesurables</h3>
    <p>Après optimisation, vous constatez une amélioration de vos positions sur les requêtes ciblées, une augmentation du CTR grâce à des meta descriptions percutantes, et un meilleur engagement des visiteurs sur vos pages.</p>`
    },
    'netlinking': {
        intro: (city) => `Le netlinking est un levier puissant pour renforcer l'autorité de votre site à ${city.name}. Je développe des stratégies d'acquisition de liens éthiques et durables.`,
        why: (city) => `<h3>Pourquoi le netlinking est crucial à ${city.name} ?</h3>
    <p>Les backlinks restent l'un des principaux critères de classement de Google. À ${city.name}, ${city.desc}, obtenir des liens de qualité depuis des sites locaux renforce votre crédibilité et votre positionnement sur les recherches géolocalisées.</p>
    <p>Je privilégie la qualité à la quantité : chaque lien acquis provient de sites thématiquement pertinents avec une autorité de domaine réelle.</p>`,
        how: (city) => `<h3>Ma stratégie de netlinking</h3>
    <p>J'identifie les opportunités de liens via le guest blogging, les relations presse, les annuaires professionnels de qualité et les partenariats locaux. Chaque lien est obtenu de manière naturelle, sans risque de pénalité Google.</p>
    <p>Je vous fournis un reporting mensuel transparent sur les liens acquis : URL source, DA, ancre utilisée et contexte éditorial.</p>`,
        advantage: (city) => `<h3>Des liens qui font la différence</h3>
    <p>Ma stratégie de netlinking cible des sites avec un DA minimum de 30-40, garantissant un impact réel sur votre autorité de domaine. Les résultats se mesurent en quelques mois avec une progression constante de vos positions.</p>`
    },
    'seo-local': {
        intro: (city) => `Le SEO local est indispensable pour les entreprises de ${city.name} qui souhaitent attirer des clients de proximité. J'optimise votre présence sur Google Maps et les recherches locales.`,
        why: (city) => `<h3>Pourquoi le SEO local à ${city.name} ?</h3>
    <p>Plus de 46% des recherches Google ont une intention locale. À ${city.name}, ${city.desc}, vos clients potentiels recherchent des prestataires proches d'eux. Être visible dans le pack local Google (les 3 résultats Maps) est essentiel pour capter ce trafic qualifié.</p>
    <p>Le SEO local vous permet également de collecter des avis clients qui renforcent votre réputation en ligne.</p>`,
        how: (city) => `<h3>Mon accompagnement SEO local</h3>
    <p>J'optimise votre fiche Google Business Profile : catégories, attributs, horaires, photos, publications. Je veille à la cohérence de vos informations NAP (Nom, Adresse, Téléphone) sur tous les annuaires et sites locaux.</p>
    <p>Je mets en place une stratégie de collecte d'avis clients et vous aide à répondre de manière professionnelle pour améliorer votre e-réputation.</p>`,
        advantage: (city) => `<h3>Dominez les recherches locales</h3>
    <p>Avec mes services SEO local, vous apparaissez dans le pack Maps pour les recherches pertinentes à ${city.name} et ses environs. Vos clients vous trouvent facilement et vous contactent directement depuis Google.</p>`
    },
    'redaction-seo': {
        intro: (city) => `La rédaction SEO est un levier de croissance pour les entreprises de ${city.name}. Je crée du contenu optimisé qui attire et convertit.`,
        why: (city) => `<h3>Pourquoi investir dans le contenu à ${city.name} ?</h3>
    <p>Le contenu de qualité est le carburant du référencement naturel. À ${city.name}, ${city.desc}, un blog professionnel et des pages optimisées vous positionnent comme expert de votre domaine et attirent un trafic qualifié régulier.</p>
    <p>Chaque article est une opportunité de ranker sur de nouveaux mots-clés et de répondre aux questions de vos prospects.</p>`,
        how: (city) => `<h3>Mon processus de rédaction</h3>
    <p>Je commence par une recherche de mots-clés approfondie pour identifier les sujets qui intéressent votre audience à ${city.name}. Chaque contenu est structuré pour le SEO (Hn, maillage, FAQ) tout en restant engageant pour le lecteur.</p>
    <p>Je rédige des articles de 1500 à 3000 mots, optimisés pour les featured snippets et enrichis de données structurées pour maximiser leur visibilité.</p>`,
        advantage: (city) => `<h3>Du contenu qui performe</h3>
    <p>Mes contenus génèrent du trafic organique durable. En moyenne, un article bien optimisé peut attirer plusieurs centaines de visiteurs mensuels pendant des années, à un coût bien inférieur à la publicité.</p>`
    },
    'black-hat-seo': {
        intro: (city) => `Expert en techniques SEO avancées, je propose des stratégies offensives pour les entreprises de ${city.name} qui souhaitent des résultats rapides.`,
        why: (city) => `<h3>Quand envisager le Black Hat SEO ?</h3>
    <p>Le Black Hat SEO utilise des techniques non conventionnelles pour obtenir des résultats plus rapides. À ${city.name}, ${city.desc}, certains marchés très concurrentiels peuvent nécessiter des approches plus agressives pour se démarquer.</p>
    <p>Je vous conseille sur les risques et opportunités de chaque technique, en toute transparence.</p>`,
        how: (city) => `<h3>Mon expertise technique</h3>
    <p>Je maîtrise l'ensemble des techniques avancées : PBN, cloaking, génération de contenu, automatisation. Chaque projet est évalué selon sa tolérance au risque et ses objectifs business.</p>
    <p>Je vous propose des stratégies hybrides qui combinent techniques white hat durables et accélérateurs black hat ciblés.</p>`,
        advantage: (city) => `<h3>Transparence et résultats</h3>
    <p>Je ne vous cache jamais les risques associés aux techniques utilisées. Mon objectif est de vous aider à atteindre vos objectifs de visibilité le plus rapidement possible, avec une stratégie adaptée à votre situation.</p>`
    }
};

function getServiceSlug(filename) {
    const services = ['audit-seo', 'optimisation-on-page', 'netlinking', 'seo-local', 'redaction-seo', 'black-hat-seo'];
    for (let s of services) {
        if (filename.startsWith(s + '-')) return s;
    }
    return null;
}

function getCitySlug(filename, serviceSlug) {
    return filename.replace(serviceSlug + '-', '').replace('.html', '');
}

function processVillePage(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const filename = path.basename(filePath);

    const serviceSlug = getServiceSlug(filename);
    const citySlug = getCitySlug(filename, serviceSlug);
    const city = cities[citySlug];
    const service = serviceContent[serviceSlug];

    if (!city || !service) {
        console.log(`Skipping ${filename} - no matching city/service`);
        return;
    }

    // Fix broken sentences like "Avec , Gradignan"
    content = content.replace(/Avec\s*,\s*/g, '');
    content = content.replace(/\.\s*,\s*/g, '. ');

    // Fix meta description
    const metaDescRegex = /<meta name="description" content="[^"]*">/;
    const newMetaDesc = `<meta name="description" content="${serviceSlug === 'audit-seo' ? 'Audit' : serviceSlug === 'optimisation-on-page' ? 'Optimisation' : serviceSlug === 'netlinking' ? 'Netlinking' : serviceSlug === 'seo-local' ? 'SEO local' : serviceSlug === 'redaction-seo' ? 'Rédaction' : 'Black Hat'} SEO à ${city.name} par Anthony Courtin, consultant SEO en Gironde. Expertise locale et résultats mesurables.">`;
    content = content.replace(metaDescRegex, newMetaDesc);

    // Fix hero paragraph - replace generic text with unique intro
    const heroIntroRegex = /<p>Analyse complète de votre site web[^<]*<\/p>/;
    const newHeroIntro = `<p>${service.intro(city)}</p>`;
    if (heroIntroRegex.test(content)) {
        content = content.replace(heroIntroRegex, newHeroIntro);
    }

    // Fix the section with "Pourquoi choisir" - add unique content
    const contentBoxRegex = /<div class="content-box fade-in">\s*<h2>Pourquoi choisir[^<]*<\/h2>\s*<p>[^<]*<\/p>\s*<h3>Mon approche[^<]*<\/h3>/;

    const newContentBox = `<div class="content-box fade-in">
          <h2>Pourquoi choisir un consultant SEO à ${city.name} ?</h2>
          <p>${city.name}, ${city.desc}, offre de nombreuses opportunités pour les entreprises locales. En tant que consultant SEO en Gironde, je vous accompagne dans votre stratégie de visibilité en ligne.</p>
          
          ${service.why(city)}
          
          ${service.how(city)}
          
          ${service.advantage(city)}
          
          <h3>Mon approche pour ${city.name}</h3>`;

    if (contentBoxRegex.test(content)) {
        content = content.replace(contentBoxRegex, newContentBox);
    } else {
        // Try simpler replacement
        content = content.replace(
            new RegExp(`<h2>Pourquoi choisir un consultant SEO à ${city.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} \\?</h2>\\s*<p>[^<]*</p>`),
            `<h2>Pourquoi choisir un consultant SEO à ${city.name} ?</h2>
          <p>${city.name}, ${city.desc}, offre de nombreuses opportunités pour les entreprises locales. En tant que consultant SEO en Gironde, je vous accompagne dans votre stratégie de visibilité en ligne.</p>
          
          ${service.why(city)}
          
          ${service.how(city)}
          
          ${service.advantage(city)}`
        );
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filename}`);
}

// Process all villes pages
console.log('Processing villes pages with unique content...');
const villesDir = path.join(__dirname, 'villes');
const villesFiles = fs.readdirSync(villesDir).filter(f => f.endsWith('.html'));

villesFiles.forEach(file => {
    processVillePage(path.join(villesDir, file));
});

console.log(`\nDone! Updated ${villesFiles.length} villes pages with unique content.`);
