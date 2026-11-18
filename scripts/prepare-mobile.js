const fs = require('node:fs');
const path = require('node:path');
const esbuild = require('esbuild');

const root = path.resolve(__dirname, '..');
const webDir = path.join(root, 'www');
fs.mkdirSync(path.join(webDir, 'icons'), { recursive: true });

for (const file of ['styles.css', 'app.js', 'install.js', 'manifest.webmanifest']) {
  fs.copyFileSync(path.join(root, file), path.join(webDir, file));
}
fs.cpSync(path.join(root, 'icons'), path.join(webDir, 'icons'), { recursive: true });

let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
html = html.replace(/<script>if\('serviceWorker'in navigator\).*?<\/script>/s, '');
html = html.replace('<script src="app.js"></script>', '<script src="ble.bundle.js"></script><script src="app.js"></script>');
fs.writeFileSync(path.join(webDir, 'index.html'), html);

esbuild.buildSync({entryPoints:[path.join(root,'ble.js')],bundle:true,format:'iife',globalName:'MedWebBLE',outfile:path.join(webDir,'ble.bundle.js'),platform:'browser'});
console.log('Prepared MedWeb assets and bundled BLE client in www/');
