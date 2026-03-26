const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');

const ASSET_TARGETS = [
  'assets/styles.css',
  'assets/app.js',
  'assets/content-tools.js',
  'assets/search-index.js',
  'assets/search-tools.js'
];

const HTML_EXCLUDE_SEGMENTS = new Set(['node_modules', '.git', 'test-results']);

function hashFile(relativePath) {
  const absolute = path.join(ROOT, relativePath);
  const content = fs.readFileSync(absolute);
  return crypto.createHash('md5').update(content).digest('hex').slice(0, 10);
}

function listHtmlFiles(dirPath) {
  return fs.readdirSync(dirPath, { withFileTypes: true }).flatMap(entry => {
    if (HTML_EXCLUDE_SEGMENTS.has(entry.name)) return [];
    const absolute = path.join(dirPath, entry.name);
    if (entry.isDirectory()) return listHtmlFiles(absolute);
    if (entry.isFile() && entry.name.endsWith('.html')) return [absolute];
    return [];
  });
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replaceAssetVersion(html, assetPath, version) {
  const escapedPath = escapeRegex(assetPath).replace(/assets\//, '(?:\\.\\.\\/|\\.\\.\\/\\.\\.\\/)?assets\\/');
  const hrefOrSrcPattern = new RegExp(`((?:href|src)=["'])(${escapedPath})(?:\\?v=[^"']*)?(["'])`, 'g');
  return html.replace(hrefOrSrcPattern, `$1$2?v=${version}$3`);
}

function main() {
  const versions = Object.fromEntries(ASSET_TARGETS.map(assetPath => [assetPath, hashFile(assetPath)]));
  const htmlFiles = listHtmlFiles(ROOT);

  htmlFiles.forEach(filePath => {
    let html = fs.readFileSync(filePath, 'utf8');
    const original = html;

    Object.entries(versions).forEach(([assetPath, version]) => {
      html = replaceAssetVersion(html, assetPath, version);
    });

    if (html !== original) {
      fs.writeFileSync(filePath, html, 'utf8');
    }
  });

  Object.entries(versions).forEach(([assetPath, version]) => {
    console.log(`${assetPath} -> ${version}`);
  });
  console.log(`Stamped ${htmlFiles.length} HTML files.`);
}

main();
