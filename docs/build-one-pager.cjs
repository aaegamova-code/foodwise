// Builds docs/FoodWise-one-pager.pdf from one-pager.html using headless Chrome.
// Usage (from the project root): node docs/build-one-pager.cjs
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { execFileSync } = require('child_process');

const dir = __dirname;
const plates = fs.readFileSync(path.join(dir, 'plates.svg.txt'), 'utf8').split('<!--SPLIT-->').map((s) => s.trim());
let html = fs.readFileSync(path.join(dir, 'one-pager.html'), 'utf8');
plates.forEach((svg, i) => (html = html.replace(`{{PLATE${i}}}`, svg)));
const built = path.join(dir, '_built.html');
fs.writeFileSync(built, html);

const chrome = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const url = pathToFileURL(built).href;
const common = ['--headless=new', '--disable-gpu', '--virtual-time-budget=8000'];
execFileSync(chrome, [...common, '--no-pdf-header-footer', `--print-to-pdf=${path.join(dir, 'FoodWise-one-pager.pdf')}`, url], { stdio: 'ignore' });
if (process.argv.includes('--preview')) {
  execFileSync(chrome, [...common, '--hide-scrollbars', '--force-device-scale-factor=1.5', '--window-size=794,1123', `--screenshot=${path.join(dir, '_preview.png')}`, url], { stdio: 'ignore' });
}
fs.unlinkSync(built);
console.log('Built docs/FoodWise-one-pager.pdf');
