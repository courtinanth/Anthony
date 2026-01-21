const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const faviconLine = '  <link rel="icon" type="image/png" href="/images/favicon.png">';
const faviconRegex = /<link rel="icon".*?>/i;

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
    fs.readFile(filepath, 'utf8', (err, data) => {
        if (err) return console.log(err);

        let updatedData = data;

        if (faviconRegex.test(data)) {
            // Replace existing favicon
            updatedData = data.replace(faviconRegex, '<link rel="icon" type="image/png" href="/images/favicon.png">');
        } else {
            // Insert new favicon
            if (data.includes('</title>')) {
                updatedData = data.replace('</title>', `</title>\n${faviconLine}`);
            } else if (data.includes('<head>')) {
                updatedData = data.replace('<head>', `<head>\n${faviconLine}`);
            }
        }

        if (updatedData !== data) {
            fs.writeFile(filepath, updatedData, 'utf8', (err) => {
                if (err) return console.log(err);
                console.log(`Updated ${path.relative(rootDir, filepath)}`);
            });
        }
    });
});
