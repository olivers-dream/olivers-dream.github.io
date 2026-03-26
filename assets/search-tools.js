(function portalSearchBootstrap() {
  const input = document.getElementById('portalSearchInput');
  const results = document.getElementById('portalSearchResults');
  const meta = document.getElementById('portalSearchMeta');
  const subjectFilter = document.getElementById('portalSearchSubjectFilter');
  const typeFilter = document.getElementById('portalSearchTypeFilter');
  const statusFilter = document.getElementById('portalSearchStatusFilter');
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
      entry.snippet,
      entry.searchText,
      (entry.learn || []).join(' '),
      (entry.memorize || []).join(' '),
      (entry.weakSpots || []).join(' ')
    ].join(' ')).toLowerCase();
    if (!query) return 1;

    let score = 0;

    if (String(entry.title || '').toLowerCase().startsWith(query)) score += 90;
    if (String(entry.title || '').toLowerCase().includes(query)) score += 50;
    if (String(entry.subject || '').toLowerCase().includes(query)) score += 20;
    if (String(entry.type || '').toLowerCase().includes(query)) score += 15;
    if (String(entry.keywords || '').toLowerCase().includes(query)) score += 12;
    if (String(entry.snippet || '').toLowerCase().includes(query)) score += 8;
    if (String((entry.learn || []).join(' ') || '').toLowerCase().includes(query)) score += 16;
    if (String((entry.memorize || []).join(' ') || '').toLowerCase().includes(query)) score += 18;
    if (String((entry.weakSpots || []).join(' ') || '').toLowerCase().includes(query)) score += 22;
    if (haystack.includes(query)) score += 5;

    return score;
  }

  function getChapterMetaMap() {
    if (typeof window.getChapterMeta === 'function') {
      return window.getChapterMeta() || {};
    }
    return {};
  }

  function getEntryStatus(entry) {
    const metaMap = getChapterMetaMap();
    const record = metaMap[entry.relativePath] || {};
    const quizPercent = Number((record.quiz || {}).percent || 0);
    const status = String(record.status || '').trim();
    const isFlagged = status === 'need_revision' || status === 'confusing' || (quizPercent > 0 && quizPercent < 60);
    return {
      status: status || 'untracked',
      quizPercent,
      isFlagged
    };
  }

  function getFilters() {
    return {
      subject: String((subjectFilter && subjectFilter.value) || 'all'),
      type: String((typeFilter && typeFilter.value) || 'all'),
      status: String((statusFilter && statusFilter.value) || 'all')
    };
  }

  function filtersAreDefault(filters) {
    return filters.subject === 'all' && filters.type === 'all' && filters.status === 'all';
  }

  function matchesFilters(entry, filters, statusInfo) {
    if (filters.subject !== 'all' && entry.subject !== filters.subject) return false;
    if (filters.type !== 'all' && entry.type !== filters.type) return false;
    if (filters.status === 'flagged' && !statusInfo.isFlagged) return false;
    if (filters.status === 'need_revision' && statusInfo.status !== 'need_revision') return false;
    if (filters.status === 'confusing' && statusInfo.status !== 'confusing') return false;
    if (filters.status === 'mastered' && statusInfo.status !== 'mastered') return false;
    if (filters.status === 'in_progress' && statusInfo.status !== 'in_progress') return false;
    return true;
  }

  function renderResults(items, query, filters) {
    if (!query && filtersAreDefault(filters)) {
      meta.textContent = 'Type at least 2 letters to search across chapters, units, worksheets, and weak topics.';
      results.innerHTML = '<div class="status-box">Search results will appear here.</div>';
      return;
    }

    if (query && query.length < 2) {
      meta.textContent = 'Keep typing to refine the search.';
      results.innerHTML = '<div class="status-box">Enter at least 2 letters.</div>';
      return;
    }

    if (!items.length) {
      meta.textContent = query
        ? ('No matches found for "' + query + '".')
        : 'No pages matched the current filters.';
      results.innerHTML = '<div class="status-box">No pages matched that search yet.</div>';
      return;
    }

    const activeFilters = [];
    if (filters.subject !== 'all') activeFilters.push(filters.subject);
    if (filters.type !== 'all') activeFilters.push(filters.type);
    if (filters.status !== 'all') activeFilters.push(filters.status.replace(/_/g, ' '));
    meta.textContent = items.length + ' result' + (items.length === 1 ? '' : 's') +
      (query ? (' found for "' + query + '"') : ' matched') +
      (activeFilters.length ? (' · filters: ' + activeFilters.join(', ')) : '') +
      '.';
    results.innerHTML = items.map(item =>
      {
        const statusInfo = getEntryStatus(item);
        const statusLabel = statusInfo.status === 'untracked'
          ? 'Not tracked yet'
          : statusInfo.status.replace(/_/g, ' ');
        const weakSpot = (item.weakSpots || [])[0] || '';
        return '<article class="search-result-card">' +
          '<div class="search-result-top">' +
            '<div>' +
              '<a href="' + escapeHtml(item.path) + '">' + escapeHtml(item.title) + '</a>' +
              '<p class="footer-note">' + escapeHtml(item.snippet || 'Open this page to continue studying.') + '</p>' +
            '</div>' +
            '<span class="tag easy">' + escapeHtml(item.type) + '</span>' +
          '</div>' +
          '<div class="search-result-tags">' +
            '<span class="search-result-tag">' + escapeHtml(item.subject) + '</span>' +
            '<span class="search-result-tag">' + escapeHtml(statusLabel) + '</span>' +
            (statusInfo.quizPercent ? ('<span class="search-result-tag">Quiz ' + escapeHtml(statusInfo.quizPercent + '%') + '</span>') : '') +
          '</div>' +
          (weakSpot ? ('<p class="footer-note search-result-weak">Watch out: ' + escapeHtml(weakSpot) + '</p>') : '') +
          '<p class="footer-note search-result-path">' + escapeHtml(item.relativePath) + '</p>' +
        '</article>';
      }
    ).join('');
  }

  function handleSearch() {
    const query = String(input.value || '').trim().toLowerCase();
    const filters = getFilters();
    const ranked = searchIndex
      .map(entry => {
        const statusInfo = getEntryStatus(entry);
        return {
          entry,
          statusInfo,
          score: scoreEntry(entry, query)
        };
      })
      .filter(item => matchesFilters(item.entry, filters, item.statusInfo))
      .filter(item => item.score > 0)
      .sort((left, right) => {
        if (right.statusInfo.isFlagged !== left.statusInfo.isFlagged) {
          return right.statusInfo.isFlagged ? 1 : -1;
        }
        return right.score - left.score || left.entry.title.localeCompare(right.entry.title);
      })
      .slice(0, 16)
      .map(item => item.entry);

    renderResults(ranked, query, filters);
  }

  input.addEventListener('input', handleSearch);
  [subjectFilter, typeFilter, statusFilter].forEach(element => {
    if (element) element.addEventListener('change', handleSearch);
  });
  handleSearch();
})();
