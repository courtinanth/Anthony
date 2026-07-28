// Simple script to add content boxes to Bordeaux pages
const fs = require('fs');
const path = require('path');

const contentToAdd = {
    'optimisation-on-page.html': `
        <div class="content-box fade-in">
          <h2>Pourquoi optimiser vos pages pour Bordeaux ?</h2>
          <p>Chaque page de votre site est une porte d'entrée pour vos clients. À Bordeaux, les internautes recherchent des prestataires locaux de confiance. Une optimisation on-page professionnelle vous permet de répondre précisément à leurs requêtes et de les convaincre de vous choisir.</p>
          <p>L'optimisation technique améliore également l'expérience utilisateur : pages plus rapides, contenu mieux structuré, navigation intuitive. Ces facteurs réduisent le taux de rebond et augmentent les conversions.</p>
          
          <h3>Ma méthode d'optimisation</h3>
          <p>Je commence par identifier vos pages à fort potentiel : celles qui génèrent déjà du trafic mais peuvent progresser, et celles qui ciblent des mots-clés stratégiques. Pour chaque page, je définis un plan d'optimisation précis.</p>
          <p>J'interviens sur tous les éléments on-page : balises title et meta description, structure Hn cohérente, optimisation des images, enrichissement sémantique du contenu, maillage interne stratégique.</p>
          
          <h3>Des résultats mesurables</h3>
          <p>Après optimisation, vous constatez une amélioration significative de vos positions sur les requêtes ciblées. Le CTR augmente grâce à des meta descriptions plus attractives. L'engagement des visiteurs s'améliore avec un contenu mieux structuré.</p>
        </div>`,

    'netlinking-bordeaux.html': `
        <div class="content-box fade-in">
          <h2>Pourquoi le netlinking est crucial à Bordeaux ?</h2>
          <p>Les backlinks restent l'un des trois critères de classement les plus importants pour Google. À Bordeaux, marché concurrentiel où de nombreuses entreprises investissent en SEO, une stratégie de netlinking efficace fait souvent la différence entre la première page et les suivantes.</p>
          <p>Un profil de liens de qualité renforce votre autorité de domaine et votre crédibilité aux yeux de Google. C'est un investissement durable qui continue de porter ses fruits longtemps après l'acquisition des liens.</p>
          
          <h3>Ma stratégie de netlinking</h3>
          <p>Je privilégie la qualité à la quantité. Chaque lien acquis provient d'un site thématiquement pertinent avec une autorité de domaine réelle (DA minimum 30-40). J'utilise des techniques variées : guest blogging, relations presse, partenariats locaux.</p>
          <p>Tous les liens sont obtenus de manière naturelle, sans risque de pénalité Google. Je documente chaque acquisition avec l'URL source, le DA, l'ancre utilisée et le contexte éditorial.</p>
          
          <h3>Des liens qui font la différence</h3>
          <p>Ma stratégie de netlinking génère des résultats mesurables en quelques mois : progression du DA, amélioration des positions sur les requêtes concurrentielles, augmentation du trafic organique.</p>
        </div>`,

    'seo-local-bordeaux.html': `
        <div class="content-box fade-in">
          <h2>Pourquoi le SEO local à Bordeaux ?</h2>
          <p>Plus de 46% des recherches Google ont une intention locale. À Bordeaux, vos clients potentiels tapent "restaurant Bordeaux" ou "plombier près de moi". Être visible dans le pack local Google (les 3 résultats Maps) est essentiel pour capter ce trafic qualifié.</p>
          <p>Le SEO local vous permet également de collecter des avis clients qui renforcent votre e-réputation. Les entreprises avec de nombreux avis positifs bénéficient d'un taux de clic supérieur.</p>
          
          <h3>Mon accompagnement SEO local</h3>
          <p>J'optimise votre fiche Google Business Profile sous tous ses aspects : catégories, attributs pertinents, horaires, photos de qualité, publications régulières. Je veille à la cohérence de vos informations NAP sur tous les annuaires.</p>
          <p>Je mets en place une stratégie de collecte d'avis clients automatisée et vous aide à répondre de manière professionnelle pour améliorer votre image.</p>
          
          <h3>Dominez les recherches locales à Bordeaux</h3>
          <p>Avec mes services SEO local, vous apparaissez dans le pack Maps pour les recherches pertinentes à Bordeaux et ses environs. Vos clients vous trouvent facilement et vous contactent directement depuis Google.</p>
        </div>`,

    'black-hat-seo.html': `
        <div class="content-box fade-in">
          <h2>Quand envisager le Black Hat SEO ?</h2>
          <p>Le Black Hat SEO utilise des techniques non conventionnelles pour obtenir des résultats plus rapides. Ces approches comportent des risques mais peuvent s'avérer efficaces dans certaines situations : marchés ultra-concurrentiels, sites éphémères, projets où la rapidité prime sur la durabilité.</p>
          <p>Je vous conseille en toute transparence sur les risques et opportunités de chaque technique. Mon rôle est de vous aider à prendre une décision éclairée.</p>
          
          <h3>Mon expertise technique</h3>
          <p>Je maîtrise l'ensemble des techniques avancées : création et gestion de PBN, cloaking intelligent, génération de contenu à grande échelle, automatisation des processus SEO. Chaque projet est évalué selon sa tolérance au risque.</p>
          <p>Je peux vous proposer des stratégies hybrides qui combinent des techniques white hat durables pour votre site principal et des accélérateurs black hat pour des projets annexes.</p>
          
          <h3>Transparence et résultats</h3>
          <p>Je ne vous cache jamais les risques associés aux techniques utilisées. Vous êtes informé en amont des implications potentielles. Mon objectif est de vous aider à atteindre vos objectifs de visibilité le plus rapidement possible.</p>
        </div>`
};

// Process each page
for (let [filename, contentBox] of Object.entries(contentToAdd)) {
    const filePath = path.join(__dirname, filename);
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filename}`);
        continue;
    }

    let content = fs.readFileSync(filePath, 'utf8');

    // Check if already has this content
    if (content.includes('Pourquoi le SEO local') || content.includes('Pourquoi optimiser vos pages') ||
        content.includes('Pourquoi le netlinking') || content.includes('Quand envisager le Black Hat')) {
        console.log(`Skipping ${filename} - already enriched`);
        continue;
    }

    // Find the insertion point - before </section> that's before related-services
    const insertMarker = '</div>\n    </section>\n\n    <section class="related-services">';
    const insertMarkerAlt = '</div>\n        </section>\n\n        <section class="related-services">';

    if (content.includes(insertMarker)) {
        content = content.replace(insertMarker, contentBox + '\n      </div>\n    </section>\n\n    <section class="related-services">');
    } else if (content.includes(insertMarkerAlt)) {
        content = content.replace(insertMarkerAlt, contentBox + '\n            </div>\n        </section>\n\n        <section class="related-services">');
    } else {
        console.log(`Could not find insertion point in ${filename}`);
        continue;
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filename}`);
}

console.log('\nDone!');
