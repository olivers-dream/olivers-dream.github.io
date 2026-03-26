const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const errors = [];

function read(filePath) {
  return fs.readFileSync(path.join(ROOT, filePath), 'utf8');
}

function assertIncludes(filePath, text, message) {
  const content = read(filePath);
  if (!content.includes(text)) {
    errors.push(`${filePath}: ${message}`);
  }
}

function listFiles(dirPath) {
  const absolute = path.join(ROOT, dirPath);
  return fs.readdirSync(absolute).map(name => path.join(dirPath, name));
}

const topLevelPages = ['index.html', 'schedule.html', 'tracker.html', 'sync.html', 'parent.html'];
topLevelPages.forEach(file => {
  assertIncludes(file, 'top-tabs', 'missing top-tabs block');
  assertIncludes(file, 'bottom-nav', 'missing bottom-nav block');
});

['index.html', 'schedule.html', 'tracker.html', 'sync.html'].forEach(file => {
  const content = read(file);
  if (content.includes('parent.html')) {
    errors.push(`${file}: child-facing page still exposes parent.html`);
  }
});

const subjectDirs = ['civics', 'economics', 'first_flight', 'footprints', 'geography', 'history', 'maths', 'science', 'words_expressions'];
subjectDirs.forEach(dir => {
  listFiles(dir)
    .filter(file => file.endsWith('.html'))
    .forEach(file => {
      assertIncludes(file, 'sync.html', 'missing sync link');
      assertIncludes(file, 'bottom-nav', 'missing mobile bottom nav');
    });
});

listFiles('worksheets/maths')
  .filter(file => file.endsWith('.html'))
  .forEach(file => {
    assertIncludes(file, '../../sync.html', 'worksheet missing sync link');
    assertIncludes(file, 'bottom-nav', 'worksheet missing mobile bottom nav');
  });

assertIncludes('assets/app.js', 'study_portal_chapter_meta_v1', 'missing chapter meta storage key');
assertIncludes('assets/app.js', 'study_portal_parent_goals_v1', 'missing parent goals storage key');
assertIncludes('assets/app.js', 'study_portal_focus_sessions_v1', 'missing focus session storage key');
assertIncludes('assets/app.js', 'queryProfilesForParentEmail', 'missing parent account query helper');
assertIncludes('assets/content-tools.js', 'Quick Mastery Check', 'missing shared chapter enhancer content');
assertIncludes('assets/content-tools.js', 'Must Memorize', 'missing shared memorization content');
assertIncludes('assets/content-tools.js', 'chapter-sticky-progress', 'missing sticky chapter progress');
assertIncludes('assets/content-tools.js', 'chapter-memory-bank.js', 'missing curated memory bank loader');
assertIncludes('assets/chapter-memory-bank.js', 'window.STUDY_PORTAL_MEMORY_BANK', 'missing curated memory bank');
assertIncludes('assets/search-tools.js', 'portalSearchInput', 'missing dashboard search script');
assertIncludes('assets/search-index.js', 'window.STUDY_PORTAL_SEARCH_INDEX', 'missing generated search index');
assertIncludes('index.html', 'portalSearchInput', 'missing dashboard search UI');
assertIncludes('tracker.html', 'focusTimerCount', 'missing focus timer UI');
assertIncludes('sync.html', 'Parent Viewer Access', 'missing parent email linking section');
assertIncludes('parent.html', 'goalAlertBoard', 'missing parent alerts section');
assertIncludes('parent.html', 'parentExportCsvBtn', 'missing parent report export buttons');
assertIncludes('parent.html', 'subjectHeatmapGrid', 'missing parent heatmap section');
assertIncludes('package.json', '@playwright/test', 'missing Playwright dependency');
assertIncludes('playwright.config.js', 'python3 -m http.server 4173', 'missing Playwright web server config');
assertIncludes('tests/e2e/portal.spec.js', 'parent page stays locked until the configured PIN is entered', 'missing parent lock e2e coverage');

if (errors.length) {
  console.error('Validation failed:\n' + errors.map(item => '- ' + item).join('\n'));
  process.exit(1);
}

console.log('Site validation passed.');
