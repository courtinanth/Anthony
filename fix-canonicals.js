const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const villesDir = path.join(rootDir, 'villes');

// Recursively get all files
function getAllFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            if (file !== 'admin' && file !== 'node_modules' && file !== '.git' && file !== 'css' && file !== 'js' && file !== 'images') {
                getAllFiles(filePath, fileList);
            }
        } else {
            if (file.endsWith('.html')) {
                fileList.push(filePath);
            }
        }
    });
    return fileList;
}

const allHtmlFiles = getAllFiles(rootDir);

let updatedCount = 0;

allHtmlFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    // Fix Canonical Link
    // Regex looks for <link rel="canonical" href="... .html">
    const canonicalRegex = /<link rel="canonical" href="(.*?)\.html">/g;

    if (canonicalRegex.test(content)) {
        content = content.replace(canonicalRegex, '<link rel="canonical" href="$1">');
    }

    // Also try to fix JSON-LD URLs if they end in .html inside the specific schema structure
    // This is a bit more aggressive, let's target specific patterns we saw
    // "url": "https://anthony-courtin.com/villes/mv filename.html"
    // We want to be careful not to break other things. 
    // Let's stick to the requested Canonical fix first, but the user might want JSON-LD fixed too.
    // GUIDANCE: The user asked "re cannoniser toutes les pages". 
    // I will stick to <link rel="canonical"> primarily.

    // However, looking at the user's previous request context, they care about "SEO Technique".
    // Let's also clean the JSON-LD "url" field if it matches the pattern.
    const jsonLdUrlRegex = /"url"\s*:\s*"(https:\/\/anthony-courtin\.com\/.*?)\.html"/g;
    if (jsonLdUrlRegex.test(content)) {
        content = content.replace(jsonLdUrlRegex, '"url": "$1"');
    }

    // Also @id if it ends in .html before a hash or end of string
    // "@id": "... .html#WebPage"
    const jsonLdIdRegex = /"@id"\s*:\s*"(https:\/\/anthony-courtin\.com\/.*?)\.html(#.*?)"/g;
    if (jsonLdIdRegex.test(content)) {
        content = content.replace(jsonLdIdRegex, '"@id": "$1$2"');
    }


    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        updatedCount++;
        console.log(`Updated: ${path.relative(rootDir, file)}`);
    }
});

console.log(`Finished. Updated ${updatedCount} files.`);
