const fs = require('fs');
const path = require('path');

const scriptTag = '<script src="js/cookies.js"></script>';
const scriptTagVilles = '<script src="../js/cookies.js"></script>';

function injectCookies(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            if (file !== 'admin' && file !== 'node_modules' && file !== '.git') {
                injectCookies(filePath); // Recursive for subfolders
            }
        } else if (file.endsWith('.html')) {
            let content = fs.readFileSync(filePath, 'utf8');

            // Check if already injected
            if (content.includes('cookies.js')) {
                console.log(`Skipping (already exists): ${file}`);
                return;
            }

            // Determine correct script tag based on depth or folder name
            // Simple heuristic: if in 'villes' or 'blog', use ../
            const isSubLevel = dir.includes('villes') || dir.includes('blog');
            const tagToInject = isSubLevel ? scriptTagVilles : scriptTag;

            // Inject before </body>
            if (content.includes('</body>')) {
                content = content.replace('</body>', `  ${tagToInject}\n</body>`);
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`Injected cookies.js into: ${file}`);
            }
        }
    });
}

console.log('Starting Cookie Script Injection...');
injectCookies(__dirname);
console.log('Done!');
