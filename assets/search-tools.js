(function portalSearchBootstrap() {
  const input = document.getElementById('portalSearchInput');
  const results = document.getElementById('portalSearchResults');
  const meta = document.getElementById('portalSearchMeta');
  if (!input || !results || !meta) return;

  const searchIndex = Array.isArray(window.STUDY_PORTAL_SEARCH_INDEX) ? window.STUDY_PORTAL_SEARCH_INDEX : [];

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function scoreEntry(entry, query) {
    const haystack = String([
      entry.title,
      entry.subject,
      entry.type,
      entry.keywords,
      entry.snippet
    ].join(' ')).toLowerCase();
    let score = 0;

    if (String(entry.title || '').toLowerCase().startsWith(query)) score += 90;
    if (String(entry.title || '').toLowerCase().includes(query)) score += 50;
    if (String(entry.subject || '').toLowerCase().includes(query)) score += 20;
    if (String(entry.type || '').toLowerCase().includes(query)) score += 15;
    if (String(entry.keywords || '').toLowerCase().includes(query)) score += 12;
    if (String(entry.snippet || '').toLowerCase().includes(query)) score += 8;
    if (haystack.includes(query)) score += 5;

    return score;
  }

  function renderResults(items, query) {
    if (!query) {
      meta.textContent = 'Type at least 2 letters to search across chapters, units, and worksheets.';
      results.innerHTML = '<div class="status-box">Search results will appear here.</div>';
      return;
    }

    if (query.length < 2) {
      meta.textContent = 'Keep typing to refine the search.';
      results.innerHTML = '<div class="status-box">Enter at least 2 letters.</div>';
      return;
    }

    if (!items.length) {
      meta.textContent = 'No matches found for "' + query + '".';
      results.innerHTML = '<div class="status-box">No pages matched that search yet.</div>';
      return;
    }

    meta.textContent = items.length + ' result' + (items.length === 1 ? '' : 's') + ' found for "' + query + '".';
    results.innerHTML = items.map(item =>
      '<article class="search-result-card">' +
        '<div class="search-result-top">' +
          '<div>' +
            '<a href="' + escapeHtml(item.path) + '">' + escapeHtml(item.title) + '</a>' +
            '<p class="footer-note">' + escapeHtml(item.snippet || 'Open this page to continue studying.') + '</p>' +
          '</div>' +
          '<span class="tag easy">' + escapeHtml(item.type) + '</span>' +
        '</div>' +
        '<div class="search-result-tags">' +
          '<span class="search-result-tag">' + escapeHtml(item.subject) + '</span>' +
          '<span class="search-result-tag">' + escapeHtml(item.relativePath) + '</span>' +
        '</div>' +
      '</article>'
    ).join('');
  }

  function handleSearch() {
    const query = String(input.value || '').trim().toLowerCase();
    const ranked = searchIndex
      .map(entry => ({ entry, score: scoreEntry(entry, query) }))
      .filter(item => item.score > 0)
      .sort((left, right) => right.score - left.score || left.entry.title.localeCompare(right.entry.title))
      .slice(0, 16)
      .map(item => item.entry);

    renderResults(ranked, query);
  }

  input.addEventListener('input', handleSearch);
  handleSearch();
})();
