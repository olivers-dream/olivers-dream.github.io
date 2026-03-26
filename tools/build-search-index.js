const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT = path.join(ROOT, 'assets', 'search-index.js');

const SOURCE_DIRS = [
  'civics',
  'economics',
  'first_flight',
  'footprints',
  'geography',
  'history',
  'maths',
  'science',
  'words_expressions',
  path.join('worksheets', 'maths')
];

function stripTags(value) {
  return String(value || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&mdash;/g, '-')
    .replace(/&ndash;/g, '-')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function listHtmlFiles(dirPath) {
  const absolute = path.join(ROOT, dirPath);
  return fs.readdirSync(absolute)
    .filter(name => /\.(html)$/i.test(name))
    .map(name => path.join(dirPath, name))
    .filter(filePath => /(chapter-|unit-|worksheet-)/.test(path.basename(filePath)));
}

function getSubjectLabel(relativePath) {
  if (relativePath.startsWith('worksheets/')) return 'Maths Worksheets';
  const subjectKey = relativePath.split(path.sep)[0];
  return {
    civics: 'Civics',
    economics: 'Economics',
    first_flight: 'First Flight',
    footprints: 'Footprints',
    geography: 'Geography',
    history: 'History',
    maths: 'Maths',
    science: 'Science',
    words_expressions: 'Words & Expressions'
  }[subjectKey] || subjectKey;
}

function getTypeLabel(fileName) {
  if (fileName.startsWith('worksheet-')) return 'Worksheet';
  if (fileName.startsWith('unit-')) return 'Unit';
  return 'Chapter';
}

function extractMatches(content, expression, limit) {
  const items = [];
  let match;
  const regex = new RegExp(expression, 'gi');
  while ((match = regex.exec(content)) && items.length < limit) {
    const value = stripTags(match[1]);
    if (value) items.push(value);
  }
  return items;
}

function buildEntry(relativePath) {
  const absolute = path.join(ROOT, relativePath);
  const content = fs.readFileSync(absolute, 'utf8');
  const fileName = path.basename(relativePath);
  const h1 = extractMatches(content, '<h1[^>]*>([\\s\\S]*?)<\\/h1>', 1)[0];
  const title = h1 || stripTags((content.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || fileName);
  const headings = extractMatches(content, '<h3[^>]*>([\\s\\S]*?)<\\/h3>', 5);
  const paragraphs = extractMatches(content, '<p[^>]*>([\\s\\S]*?)<\\/p>', 3);
  return {
    title,
    subject: getSubjectLabel(relativePath),
    type: getTypeLabel(fileName),
    path: relativePath.split(path.sep).join('/'),
    relativePath: relativePath.split(path.sep).join('/'),
    keywords: headings.join(' | '),
    snippet: paragraphs.find(Boolean) || headings[0] || title
  };
}

const index = SOURCE_DIRS
  .flatMap(listHtmlFiles)
  .sort()
  .map(buildEntry);

const output = 'window.STUDY_PORTAL_SEARCH_INDEX = ' + JSON.stringify(index, null, 2) + ';\n';
fs.writeFileSync(OUTPUT, output, 'utf8');

console.log('Search index built with ' + index.length + ' entries.');
