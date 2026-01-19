const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const faviconLine = '  <link rel="icon" type="image/png" href="/images/favicon.png">';

function walk(dir, callback) {
    fs.readdir(dir, function (err, files) {
        if (err) throw err;
        files.forEach(function (file) {
            var filepath = path.join(dir, file);
            fs.stat(filepath, function (err, stats) {
                if (stats.isDirectory()) {
                    if (file !== '.git' && file !== 'node_modules' && file !== 'admin') {
                        walk(filepath, callback);
                    }
                } else if (path.extname(file) === '.html') {
                    callback(filepath);
                }
            });
        });
    });
}

walk(rootDir, (filepath) => {
    // Skip index.html as we already did it manually, and admin files
    if (filepath.includes('admin') || filepath.endsWith('index.html')) return;

    fs.readFile(filepath, 'utf8', (err, data) => {
        if (err) return console.log(err);

        if (data.includes('rel="icon"')) {
            console.log(`Favicon already in ${filepath}`);
            return;
        }

        let updatedData = data;
        // Try to insert after <title>
        if (data.includes('</title>')) {
            updatedData = data.replace('</title>', `</title>\n${faviconLine}`);
        } else if (data.includes('<head>')) {
            updatedData = data.replace('<head>', `<head>\n${faviconLine}`);
        }

        if (updatedData !== data) {
            fs.writeFile(filepath, updatedData, 'utf8', (err) => {
                if (err) return console.log(err);
                console.log(`Updated ${filepath}`);
            });
        }
    });
});
