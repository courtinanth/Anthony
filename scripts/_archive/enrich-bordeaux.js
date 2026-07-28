// Script to add rich content (why/how/advantages) to main Bordeaux service pages
const fs = require('fs');
const path = require('path');

const bordeauxContent = {
    'audit-seo-bordeaux.html': {
        insertAfter: '</ul>\n                </div>',
        content: `</ul>
                </div>

                <div class="content-box fade-in">
                    <h2>Pourquoi réaliser un audit SEO à Bordeaux ?</h2>
                    <p>Bordeaux est un marché dynamique et concurrentiel. Capitale de la Nouvelle-Aquitaine avec plus de 260 000 habitants, la ville attire de nombreuses entreprises qui cherchent à se positionner sur les recherches locales. Un audit SEO professionnel vous permet d'identifier précisément vos forces et faiblesses face à cette concurrence.</p>
                    <p>L'audit révèle les opportunités de mots-clés que vos concurrents négligent, les problèmes techniques qui freinent votre indexation, et les axes d'amélioration prioritaires pour gagner en visibilité. C'est la base indispensable de toute stratégie SEO réussie.</p>
                    
                    <h3>Comment se déroule l'audit ?</h3>
                    <p>Mon audit commence par un crawl complet de votre site pour détecter toutes les erreurs techniques : pages 404, redirections en chaîne, temps de chargement excessif, problèmes d'indexation mobile. J'analyse ensuite votre positionnement actuel sur les mots-clés stratégiques de votre secteur à Bordeaux.</p>
                    <p>Vous recevez un rapport détaillé sous 48h avec des recommandations concrètes, classées par priorité selon leur impact potentiel. Nous planifions ensuite un call de restitution d'une heure pour parcourir ensemble le document et répondre à vos questions.</p>
                    
                    <h3>Les avantages de mon approche locale</h3>
                    <p>Basé en Gironde, je connais le tissu économique bordelais et les spécificités du marché local. Cette expertise me permet de vous conseiller sur les mots-clés vraiment recherchés par vos clients potentiels, pas seulement les termes génériques nationaux.</p>
                    <p>Mon accompagnement est personnalisé : chaque audit est adapté à votre secteur d'activité, votre taille d'entreprise et vos objectifs de croissance. Pas de template générique, mais une analyse sur-mesure de votre situation.</p>
                </div>`
    },
    'optimisation-on-page.html': {
        insertAfter: '</ul>\n                </div>',
        content: `</ul>
                </div>

                <div class="content-box fade-in">
                    <h2>Pourquoi optimiser vos pages pour Bordeaux ?</h2>
                    <p>Chaque page de votre site est une porte d'entrée potentielle pour vos clients. À Bordeaux, les internautes recherchent des prestataires locaux de confiance. Une optimisation on-page professionnelle vous permet de répondre précisément à leurs requêtes et de les convaincre de vous choisir.</p>
                    <p>L'optimisation technique améliore également l'expérience utilisateur : pages plus rapides, contenu mieux structuré, navigation intuitive. Ces facteurs réduisent le taux de rebond et augmentent les conversions.</p>
                    
                    <h3>Ma méthode d'optimisation</h3>
                    <p>Je commence par identifier vos pages à fort potentiel : celles qui génèrent déjà du trafic mais peuvent progresser, et celles qui ciblent des mots-clés stratégiques mais ne performent pas encore. Pour chaque page, je définis un plan d'optimisation précis.</p>
                    <p>J'interviens sur tous les éléments on-page : balises title et meta description percutantes, structure Hn cohérente, optimisation des images, enrichissement sémantique du contenu, maillage interne stratégique. Chaque modification est documentée et justifiée.</p>
                    
                    <h3>Des résultats mesurables</h3>
                    <p>Après optimisation, vous constatez une amélioration significative de vos positions sur les requêtes ciblées. Le CTR augmente grâce à des meta descriptions plus attractives. L'engagement des visiteurs s'améliore avec un contenu mieux structuré.</p>
                    <p>Je vous fournis un reporting avant/après avec les métriques clés : positions, impressions, clics, taux de rebond. Vous mesurez concrètement le retour sur investissement de l'optimisation.</p>
                </div>`
    },
    'netlinking-bordeaux.html': {
        insertAfter: '</ul>\n                </div>',
        content: `</ul>
                </div>

                <div class="content-box fade-in">
                    <h2>Pourquoi le netlinking est crucial à Bordeaux ?</h2>
                    <p>Les backlinks restent l'un des trois critères de classement les plus importants pour Google. À Bordeaux, marché concurrentiel où de nombreuses entreprises investissent en SEO, une stratégie de netlinking efficace fait souvent la différence entre la première page et les suivantes.</p>
                    <p>Un profil de liens de qualité renforce votre autorité de domaine et votre crédibilité aux yeux de Google. C'est un investissement durable qui continue de porter ses fruits longtemps après l'acquisition des liens.</p>
                    
                    <h3>Ma stratégie de netlinking</h3>
                    <p>Je privilégie la qualité à la quantité. Chaque lien acquis provient d'un site thématiquement pertinent avec une autorité de domaine réelle (DA minimum 30-40). J'utilise des techniques variées : guest blogging sur des médias de qualité, relations presse, partenariats avec des sites locaux bordelais.</p>
                    <p>Tous les liens sont obtenus de manière naturelle, sans risque de pénalité Google. Je documente chaque acquisition avec l'URL source, le DA, l'ancre utilisée et le contexte éditorial.</p>
                    
                    <h3>Des liens qui font la différence</h3>
                    <p>Ma stratégie de netlinking génère des résultats mesurables en quelques mois : progression du DA, amélioration des positions sur les requêtes concurrentielles, augmentation du trafic organique. Je vous fournis un reporting mensuel transparent sur les actions réalisées.</p>
                    <p>Contrairement aux plateformes d'achat de liens, je m'assure que chaque backlink apporte une vraie valeur en termes de référencement et de trafic référent potentiel.</p>
                </div>`
    },
    'seo-local-bordeaux.html': {
        insertAfter: '</ul>\n                </div>',
        content: `</ul>
                </div>

                <div class="content-box fade-in">
                    <h2>Pourquoi le SEO local à Bordeaux ?</h2>
                    <p>Plus de 46% des recherches Google ont une intention locale. À Bordeaux, vos clients potentiels tapent "restaurant Bordeaux", "plombier Bordeaux" ou "avocat près de moi". Être visible dans le pack local Google (les 3 résultats Maps affichés en haut de page) est essentiel pour capter ce trafic qualifié.</p>
                    <p>Le SEO local vous permet également de collecter des avis clients qui renforcent votre e-réputation. Les entreprises avec de nombreux avis positifs bénéficient d'un taux de clic supérieur et convertissent mieux.</p>
                    
                    <h3>Mon accompagnement SEO local</h3>
                    <p>J'optimise votre fiche Google Business Profile sous tous ses aspects : catégories principales et secondaires, attributs pertinents, horaires complets, photos de qualité, publications régulières. Je veille à la cohérence de vos informations NAP (Nom, Adresse, Téléphone) sur tous les annuaires et sites locaux.</p>
                    <p>Je mets en place une stratégie de collecte d'avis clients avec des emails et SMS automatisés après chaque prestation. Je vous aide également à répondre de manière professionnelle aux avis pour améliorer votre image.</p>
                    
                    <h3>Dominez les recherches locales à Bordeaux</h3>
                    <p>Avec mes services SEO local, vous apparaissez dans le pack Maps pour les recherches pertinentes à Bordeaux et ses environs. Vos clients vous trouvent facilement, consultent vos avis et vous contactent directement depuis Google.</p>
                    <p>Je cible également les recherches "near me" et les variations géolocalisées pour maximiser votre visibilité dans toute la métropole bordelaise.</p>
                </div>`
    },
    'redaction-seo.html': {
        alreadyHasContent: true // Déjà enrichi avec les charts
    },
    'black-hat-seo.html': {
        insertAfter: '</ul>\n                </div>',
        content: `</ul>
                </div>

                <div class="content-box fade-in">
                    <h2>Quand envisager le Black Hat SEO ?</h2>
                    <p>Le Black Hat SEO utilise des techniques non conventionnelles pour obtenir des résultats plus rapides que les méthodes traditionnelles. Ces approches comportent des risques mais peuvent s'avérer efficaces dans certaines situations : marchés ultra-concurrentiels, sites éphémères, projets où la rapidité prime sur la durabilité.</p>
                    <p>Je vous conseille en toute transparence sur les risques et opportunités de chaque technique. Mon rôle est de vous aider à prendre une décision éclairée en fonction de vos objectifs business.</p>
                    
                    <h3>Mon expertise technique</h3>
                    <p>Je maîtrise l'ensemble des techniques avancées : création et gestion de PBN (Private Blog Networks), cloaking intelligent, génération de contenu à grande échelle, automatisation des processus SEO. Chaque projet est évalué individuellement selon sa tolérance au risque.</p>
                    <p>Je peux vous proposer des stratégies hybrides qui combinent des techniques white hat durables pour votre site principal et des accélérateurs black hat pour des micro-sites ou des projets annexes.</p>
                    
                    <h3>Transparence et résultats</h3>
                    <p>Je ne vous cache jamais les risques associés aux techniques utilisées. Vous êtes informé en amont des implications potentielles : pénalités manuelles, désindexation, nécessité de recréer des assets. Cette transparence est essentielle pour une collaboration saine.</p>
                    <p>Mon objectif est de vous aider à atteindre vos objectifs de visibilité le plus rapidement possible, avec une stratégie adaptée à votre situation et votre appétence au risque.</p>
                </div>`
    }
};

// Process each Bordeaux service page
console.log('Adding rich content to Bordeaux service pages...');

for (let [filename, data] of Object.entries(bordeauxContent)) {
    if (data.alreadyHasContent) {
        console.log(`Skipping ${filename} - already has enriched content`);
        continue;
    }

    const filePath = path.join(__dirname, filename);
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filename}`);
        continue;
    }

    let content = fs.readFileSync(filePath, 'utf8');

    // Check if content already has "Pourquoi" sections
    if (content.includes('Pourquoi réaliser') || content.includes('Pourquoi le SEO') || content.includes('Quand envisager')) {
        console.log(`Skipping ${filename} - already has why/how content`);
        continue;
    }

    // Find the insertion point - after the first content-box with list
    const firstContentBoxEnd = content.indexOf('</ul>\n                </div>\n            </div>\n        </section>');

    if (firstContentBoxEnd === -1) {
        // Try alternative pattern
        const altEnd = content.indexOf('</ul>\n                </div>\n\n                <div class="content-box');
        if (altEnd === -1) {
            console.log(`Could not find insertion point in ${filename}`);
            continue;
        }
        // Insert before the second content-box
        content = content.slice(0, altEnd) + data.content + content.slice(altEnd + '</ul>\n                </div>'.length);
    } else {
        // Insert before closing section
        content = content.slice(0, firstContentBoxEnd) + data.content + '\n            </div>\n        </section>' + content.slice(firstContentBoxEnd + '</ul>\n                </div>\n            </div>\n        </section>'.length);
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filename}`);
}

console.log('\nDone! Bordeaux service pages enriched with why/how/advantages content.');
