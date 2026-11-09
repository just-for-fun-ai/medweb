const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const webDir = path.join(root, 'www');
fs.mkdirSync(path.join(webDir, 'icons'), { recursive: true });

for (const file of ['styles.css', 'app.js', 'install.js', 'manifest.webmanifest']) {
  fs.copyFileSync(path.join(root, file), path.join(webDir, file));
}
fs.cpSync(path.join(root, 'icons'), path.join(webDir, 'icons'), { recursive: true });

let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
html = html.replace(/<script>if\('serviceWorker'in navigator\).*?<\/script>/s, '');
fs.writeFileSync(path.join(webDir, 'index.html'), html);
console.log('Prepared local MedWeb assets in www/');
