const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const SUBJECTS = [
  ['maths', '📐 Maths'],
  ['science', '🔬 Science'],
  ['geography', '🌍 Geography'],
  ['civics', '🏛️ Civics'],
  ['history', '📜 History'],
  ['economics', '💰 Economics'],
  ['first_flight', '📖 First Flight'],
  ['footprints', '👣 Footprints'],
  ['words_expressions', '✍️ Words & Expressions']
];

const CONTENT_DIRS = ['maths', 'science', 'geography', 'civics', 'history', 'economics', 'first_flight', 'footprints', 'words_expressions'];

function listContentPages(dirName) {
  return fs.readdirSync(path.join(ROOT, dirName))
    .filter(name => /\.(html)$/i.test(name))
    .filter(name => /^(chapter-|unit-)/.test(name))
    .map(name => path.join(ROOT, dirName, name));
}

function buildBottomNav() {
  return [
    '  <nav class="bottom-nav" aria-label="Mobile navigation">',
    '    <a href="../index.html" class="bottom-nav-item"><span class="bnav-icon">&#127968;</span><span class="bnav-label">Home</span></a>',
    '    <a href="../schedule.html" class="bottom-nav-item"><span class="bnav-icon">&#128197;</span><span class="bnav-label">Schedule</span></a>',
    '    <a href="../tracker.html" class="bottom-nav-item"><span class="bnav-icon">&#9998;</span><span class="bnav-label">Tracker</span></a>',
    '    <a href="../sync.html" class="bottom-nav-item"><span class="bnav-icon">&#9729;&#65039;</span><span class="bnav-label">Sync</span></a>',
    '  </nav>'
  ].join('\n');
}

function buildTopTabs() {
  return [
    '    <div class="top-tabs">',
    '      <a href="../index.html">&#127968; Dashboard</a>',
    '      <a href="../schedule.html">&#128197; Schedule</a>',
    '      <a href="../tracker.html">&#9998;&#65039; Tracker</a>',
    '      <a href="../sync.html">&#9729;&#65039; Sync</a>',
    '    </div>'
  ].join('\n');
}

function buildSubjectNav(activeDir) {
  const links = SUBJECTS.map(([dirName, label]) => {
    const active = dirName === activeDir ? ' class="active"' : '';
    return `      <a href="../${dirName}/index.html"${active}>${label}</a>`;
  });
  return ['    <nav class="nav">', ...links, '    </nav>'].join('\n');
}

function replaceFirstBlock(content, pattern, replacement) {
  if (!pattern.test(content)) return content;
  return content.replace(pattern, replacement);
}

function normalizePage(filePath) {
  const activeDir = path.basename(path.dirname(filePath));
  let html = fs.readFileSync(filePath, 'utf8');
  const original = html;

  html = replaceFirstBlock(html, /  <nav class="bottom-nav"[\s\S]*?<\/nav>\n\n  <header class="header">/, `${buildBottomNav()}\n\n  <header class="header">`);
  html = replaceFirstBlock(html, /    <div class="top-tabs">[\s\S]*?<\/div>\n    <nav class="nav">[\s\S]*?<\/nav>/, `${buildTopTabs()}\n${buildSubjectNav(activeDir)}`);

  if (html !== original) {
    fs.writeFileSync(filePath, html, 'utf8');
  }
}

function main() {
  const pages = CONTENT_DIRS.flatMap(listContentPages);
  pages.forEach(normalizePage);
  console.log(`Normalized ${pages.length} chapter/unit page shells.`);
}

main();
