const fs = require('fs');
const path = require('path');
const memoryBank = require(path.join(__dirname, '..', 'assets', 'chapter-memory-bank.js'));

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

function extractSectionByHeading(content, headingPattern) {
  const sections = content.match(/<section\b[\s\S]*?<\/section>/gi) || [];
  return sections.find(section => {
    const heading = extractMatches(section, '<h3[^>]*>([\\s\\S]*?)<\\/h3>', 1)[0] || '';
    return headingPattern.test(heading);
  }) || '';
}

function uniqueItems(items, limit) {
  const output = [];
  (items || []).forEach(item => {
    const normalized = stripTags(item);
    if (!normalized) return;
    if (output.includes(normalized)) return;
    output.push(normalized);
  });
  return output.slice(0, limit);
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
  const normalizedPath = relativePath.split(path.sep).join('/');
  const curated = memoryBank[normalizedPath] || {};
  const h1 = extractMatches(content, '<h1[^>]*>([\\s\\S]*?)<\\/h1>', 1)[0];
  const title = h1 || stripTags((content.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || fileName);
  const headings = extractMatches(content, '<h3[^>]*>([\\s\\S]*?)<\\/h3>', 5);
  const paragraphs = extractMatches(content, '<p[^>]*>([\\s\\S]*?)<\\/p>', 3);
  const summarySection = extractSectionByHeading(content, /summary|context|breakdown|easy language/i);
  const commonMistakesSection = extractSectionByHeading(content, /common mistakes/i);
  const rememberSection = extractSectionByHeading(content, /must|remember|boxed|key dates|key facts|articles/i);
  const learningBullets = uniqueItems([
    ...(Array.isArray(curated.learn) ? curated.learn : []),
    ...extractMatches(summarySection, '<li[^>]*>([\\s\\S]*?)<\\/li>', 4)
  ], 4);
  const memorizeItems = uniqueItems([
    ...(Array.isArray(curated.memorize) ? curated.memorize : []),
    ...extractMatches(rememberSection, '<li[^>]*>([\\s\\S]*?)<\\/li>', 5)
  ], 6);
  const weakSpots = uniqueItems([
    ...(Array.isArray(curated.weakSpots) ? curated.weakSpots : []),
    ...extractMatches(commonMistakesSection, '<li[^>]*>([\\s\\S]*?)<\\/li>', 5)
  ], 5);
  const curatedSummary = stripTags(curated.summary || '');
  return {
    title,
    subject: getSubjectLabel(relativePath),
    type: getTypeLabel(fileName),
    path: normalizedPath,
    relativePath: normalizedPath,
    keywords: headings.join(' | '),
    snippet: curatedSummary || paragraphs.find(Boolean) || headings[0] || title,
    learn: learningBullets,
    memorize: memorizeItems,
    weakSpots,
    searchText: uniqueItems([
      title,
      getSubjectLabel(relativePath),
      getTypeLabel(fileName),
      headings.join(' | '),
      curatedSummary,
      learningBullets.join(' | '),
      memorizeItems.join(' | '),
      weakSpots.join(' | '),
      paragraphs.join(' | ')
    ], 30).join(' | ')
  };
}

const index = SOURCE_DIRS
  .flatMap(listHtmlFiles)
  .sort()
  .map(buildEntry);

const output = 'window.STUDY_PORTAL_SEARCH_INDEX = ' + JSON.stringify(index, null, 2) + ';\n';
fs.writeFileSync(OUTPUT, output, 'utf8');

console.log('Search index built with ' + index.length + ' entries.');
