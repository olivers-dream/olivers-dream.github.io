(function chapterEnhancerBootstrap() {
  const currentScript = document.currentScript;
  const assetBase = currentScript && currentScript.src ? new URL('.', currentScript.src).href : '';
  const assetVersionQuery = (() => {
    if (!currentScript || !currentScript.src) return '';
    try {
      const url = new URL(currentScript.src);
      return url.search || '';
    } catch (err) {
      return '';
    }
  })();
  const memoryBankVersionQuery = assetVersionQuery
    ? assetVersionQuery + '&bank=20260327b'
    : '?bank=20260327b';

  function runEnhancer() {
  const path = window.location.pathname || '';
  const isWorksheet = /worksheet-/.test(path);
  const isContentPage = /(chapter-|unit-|worksheet-)/.test(path);
  if (!isContentPage) return;

  const container = document.querySelector('main.container');
  const wisdomBanner = document.querySelector('.wisdom-banner');
  const topTabs = document.querySelector('.top-tabs');
  const sidebarNav = document.querySelector('.nav');
  if (!container || !wisdomBanner || typeof getChapterMetaRecord !== 'function') return;

  const parts = path.split('/').filter(Boolean);
  const chapterKey = parts.includes('worksheets')
    ? parts.slice(-3).join('/')
    : parts.slice(-2).join('/');
  const pageTitle = (document.querySelector('header h1') || {}).textContent || document.title || 'Chapter';
  const subjectFolder = parts.includes('worksheets')
    ? parts[parts.indexOf('worksheets') + 1]
    : parts[parts.length - 2];
  const subjectAccent = {
    maths: '#3b82f6',
    science: '#10b981',
    geography: '#06b6d4',
    civics: '#f59e0b',
    history: '#ef4444',
    economics: '#14b8a6',
    first_flight: '#8b5cf6',
    footprints: '#ec4899',
    words_expressions: '#a855f7',
    worksheets: '#22c55e'
  }[subjectFolder] || '#8b5cf6';
  const curatedEntry = ((window.STUDY_PORTAL_MEMORY_BANK || {})[chapterKey] || {});

  document.documentElement.style.setProperty('--page-accent', subjectAccent);
  document.body.dataset.subject = subjectFolder;

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getStatusLabel(status) {
    if (status === 'mastered') return 'Mastered';
    if (status === 'need_revision') return 'Need Revision';
    if (status === 'confusing') return 'Confusing';
    return 'In Progress';
  }

  function getStatusClass(status) {
    if (status === 'mastered') return 'easy';
    if (status === 'need_revision') return 'med';
    if (status === 'confusing') return 'hard';
    return 'med';
  }

  function getSummarySection() {
    const sections = Array.from(container.querySelectorAll('section.card'));
    return sections.find(section => {
      const heading = (section.querySelector('h3') || {}).textContent || '';
      return /summary|context|simple explanation|book chapter/i.test(heading);
    }) || sections[0];
  }

  function collectLearningBullets() {
    if (Array.isArray(curatedEntry.learn) && curatedEntry.learn.length) {
      return curatedEntry.learn.slice(0, 4);
    }

    const summarySection = getSummarySection();
    const bullets = Array.from(summarySection.querySelectorAll('li'))
      .map(item => item.textContent.trim())
      .filter(Boolean)
      .slice(0, 4);
    if (bullets.length) return bullets;

    return Array.from(container.querySelectorAll('section.card h3'))
      .map(item => item.textContent.trim())
      .filter(Boolean)
      .slice(0, 4)
      .map(text => 'Review ' + text.replace(/^[^\w]+/, '') + '.');
  }

  function getRevisionSummary() {
    if (curatedEntry.summary) return String(curatedEntry.summary);

    const summarySection = getSummarySection();
    const firstParagraph = Array.from(summarySection.querySelectorAll('p'))
      .map(item => item.textContent.trim())
      .find(Boolean);
    return firstParagraph || 'Use this chapter card to capture the core idea before revision.';
  }

  function collectMustMemorizeItems(learningBullets) {
    if (Array.isArray(curatedEntry.memorize) && curatedEntry.memorize.length) {
      return curatedEntry.memorize.slice(0, 5);
    }

    const candidates = [];

    Array.from(container.querySelectorAll('.formula-box')).forEach(box => {
      const text = box.textContent.trim();
      if (text) candidates.push(text);
    });

    Array.from(container.querySelectorAll('section.card')).forEach(section => {
      const heading = ((section.querySelector('h3') || {}).textContent || '').trim();
      const headingMatches = /formula|keyword|must|remember|definition|date|diagram|important|summary/i.test(heading);
      if (!headingMatches) return;
      Array.from(section.querySelectorAll('li')).slice(0, 4).forEach(item => {
        const text = item.textContent.trim();
        if (text) candidates.push(text);
      });
      Array.from(section.querySelectorAll('p')).slice(0, 2).forEach(item => {
        const text = item.textContent.trim();
        if (text) candidates.push(text);
      });
    });

    if (candidates.length < 4) {
      Array.from(container.querySelectorAll('section.card li')).slice(0, 8).forEach(item => {
        const text = item.textContent.trim();
        if (text) candidates.push(text);
      });
    }

    if (candidates.length < 4) {
      learningBullets.forEach(item => candidates.push(item));
    }

    const cleaned = [];
    candidates.forEach(item => {
      const normalized = item.replace(/\s+/g, ' ').trim();
      if (!normalized) return;
      if (normalized.length < 16) return;
      if (cleaned.includes(normalized)) return;
      cleaned.push(normalized.length > 150 ? (normalized.slice(0, 147) + '...') : normalized);
    });

    return cleaned.slice(0, 5);
  }

  function collectWeakSpotItems() {
    if (Array.isArray(curatedEntry.weakSpots) && curatedEntry.weakSpots.length) {
      return curatedEntry.weakSpots.slice(0, 4);
    }

    const candidates = [];

    Array.from(container.querySelectorAll('section.card')).forEach(section => {
      const heading = ((section.querySelector('h3') || {}).textContent || '').trim();
      if (!/common mistakes|watch out|avoid|exam trap/i.test(heading)) return;
      Array.from(section.querySelectorAll('li')).slice(0, 5).forEach(item => {
        const text = item.textContent.trim();
        if (text) candidates.push(text);
      });
      Array.from(section.querySelectorAll('p')).slice(0, 2).forEach(item => {
        const text = item.textContent.trim();
        if (text) candidates.push(text);
      });
    });

    const cleaned = [];
    candidates.forEach(item => {
      const normalized = item.replace(/\s+/g, ' ').trim();
      if (!normalized) return;
      if (cleaned.includes(normalized)) return;
      cleaned.push(normalized);
    });

    return cleaned.slice(0, 4);
  }

  function ensureSectionIds() {
    const sections = Array.from(container.querySelectorAll('section.card'));
    return sections.map((section, index) => {
      const heading = section.querySelector('h3');
      if (!heading) return null;
      const anchorId = 'section-' + (index + 1);
      section.id = section.id || anchorId;
      return {
        id: section.id,
        label: heading.textContent.trim()
      };
    }).filter(Boolean).slice(0, 8);
  }

  function getPrimaryContentAnchor() {
    return Array.from(container.children).find(node => {
      if (!node || !node.classList) return false;
      if (node === wisdomBanner || node === topTabs || node === sidebarNav) return false;
      if (node.classList.contains('chapter-sticky-progress')) return false;
      if (node.classList.contains('chapter-enhancer-card')) return false;
      return true;
    }) || null;
  }

  function insertBeforeAnchor(node, anchor) {
    if (!node) return;
    if (anchor) {
      container.insertBefore(node, anchor);
      return;
    }
    container.appendChild(node);
  }

  function getSummaryAnchor() {
    const summarySection = getSummarySection();
    if (summarySection && summarySection.parentElement === container) return summarySection;
    return getPrimaryContentAnchor();
  }

  function getAppendAnchor() {
    const candidates = Array.from(container.children).filter(node => {
      if (!node || !node.classList) return false;
      if (node === wisdomBanner || node === topTabs || node === sidebarNav) return false;
      if (node.classList.contains('chapter-sticky-progress')) return false;
      if (node.classList.contains('chapter-enhancer-card')) return false;
      return true;
    });
    return candidates.length ? (candidates[candidates.length - 1].nextSibling || null) : null;
  }

  function getMindMapDisplayWidth(svg) {
    const viewBox = svg.getAttribute('viewBox');
    if (viewBox) {
      const parts = viewBox.trim().split(/\s+/).map(Number);
      if (parts.length === 4 && Number.isFinite(parts[2])) {
        return Math.max(1000, Math.min(2200, Math.round(parts[2] * 1.15)));
      }
    }

    const bounds = svg.getBoundingClientRect();
    if (bounds.width) {
      return Math.max(1000, Math.min(2200, Math.round(bounds.width * 1.8)));
    }

    return 1400;
  }

  function buildMindMapNode(svg, displayWidth) {
    const clone = svg.cloneNode(true);
    const viewBox = clone.getAttribute('viewBox');
    if (viewBox) {
      const parts = viewBox.trim().split(/\s+/).map(Number);
      if (parts.length === 4) {
        clone.setAttribute('width', parts[2]);
        clone.setAttribute('height', parts[3]);
      }
    }
    if (!clone.getAttribute('xmlns')) {
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    }
    if (!clone.getAttribute('xmlns:xlink')) {
      clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    }
    clone.classList.add('mind-map-lightbox__svg');
    clone.style.width = displayWidth + 'px';
    clone.style.height = 'auto';
    clone.style.maxWidth = 'none';
    clone.style.display = 'block';
    clone.style.margin = '0 auto';
    return clone;
  }

  function serializeMindMapSvg(svg, displayWidth) {
    return new XMLSerializer().serializeToString(buildMindMapNode(svg, displayWidth));
  }

  function ensureMindMapLightbox() {
    if (window.__studyPortalMindMapLightbox) return window.__studyPortalMindMapLightbox;

    const lightbox = document.createElement('div');
    lightbox.className = 'mind-map-lightbox';
    lightbox.hidden = true;
    lightbox.innerHTML =
      '<div class="mind-map-lightbox__dialog" role="dialog" aria-modal="true" aria-labelledby="mindMapLightboxTitle">' +
        '<div class="mind-map-lightbox__header">' +
          '<div>' +
            '<p class="enhancer-eyebrow">Mind Map Viewer</p>' +
            '<h3 id="mindMapLightboxTitle">Mind Map</h3>' +
            '<p class="mind-map-lightbox__meta" id="mindMapLightboxMeta"></p>' +
          '</div>' +
          '<div class="mind-map-lightbox__actions">' +
            '<button type="button" class="btn secondary" id="mindMapLightboxOpenTab">Open In Tab</button>' +
            '<button type="button" class="btn secondary" id="mindMapLightboxCloseBtn" data-close-mind-map>Close</button>' +
          '</div>' +
        '</div>' +
        '<div class="mind-map-lightbox__canvas" id="mindMapLightboxCanvas"></div>' +
        '<p class="mind-map-lightbox__caption" id="mindMapLightboxCaption">Scroll to inspect the full map. Press Esc to close.</p>' +
      '</div>';
    document.body.appendChild(lightbox);

    const titleNode = lightbox.querySelector('#mindMapLightboxTitle');
    const metaNode = lightbox.querySelector('#mindMapLightboxMeta');
    const captionNode = lightbox.querySelector('#mindMapLightboxCaption');
    const canvasNode = lightbox.querySelector('#mindMapLightboxCanvas');
    const closeButton = lightbox.querySelector('#mindMapLightboxCloseBtn');
    const openTabButton = lightbox.querySelector('#mindMapLightboxOpenTab');

    let currentSvgMarkup = '';
    let lastFocused = null;

    function closeLightbox() {
      lightbox.hidden = true;
      document.body.classList.remove('mind-map-lightbox-open');
      canvasNode.innerHTML = '';
      currentSvgMarkup = '';
      if (lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus();
      }
    }

    function openLightbox(config) {
      lastFocused = document.activeElement;

      const svgNode = buildMindMapNode(config.svg, config.displayWidth);
      currentSvgMarkup = serializeMindMapSvg(config.svg, config.displayWidth);

      canvasNode.innerHTML = '';
      canvasNode.appendChild(svgNode);
      canvasNode.scrollTop = 0;
      canvasNode.scrollLeft = 0;

      titleNode.textContent = config.title || 'Mind Map';
      metaNode.textContent = config.chapterTitle || pageTitle;
      captionNode.textContent = config.caption || 'Scroll to inspect the full map. Press Esc to close.';

      lightbox.hidden = false;
      document.body.classList.add('mind-map-lightbox-open');
      closeButton.focus();
    }

    lightbox.addEventListener('click', event => {
      if (event.target === lightbox || event.target.closest('[data-close-mind-map]')) {
        closeLightbox();
      }
    });

    openTabButton.addEventListener('click', () => {
      if (!currentSvgMarkup) return;
      const popup = window.open('', '_blank');
      if (!popup) return;
      popup.opener = null;
      popup.document.write(
        '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>' +
        escapeHtml(pageTitle) +
        ' Mind Map</title><style>body{margin:0;padding:24px;background:#020617;color:#e2e8f0;font-family:Inter,Segoe UI,Arial,sans-serif;display:flex;justify-content:center}svg{max-width:none;height:auto}</style></head><body>' +
        currentSvgMarkup +
        '</body></html>'
      );
      popup.document.close();
    });

    document.addEventListener('keydown', event => {
      if (!lightbox.hidden && event.key === 'Escape') {
        event.preventDefault();
        closeLightbox();
      }
    });

    window.__studyPortalMindMapLightbox = {
      open: openLightbox,
      close: closeLightbox
    };
    return window.__studyPortalMindMapLightbox;
  }

  function enhanceMindMaps() {
    const lightbox = ensureMindMapLightbox();
    document.querySelectorAll('.mind-map-wrap').forEach((wrap, index) => {
      const svg = wrap.querySelector('svg');
      if (!svg || wrap.dataset.zoomReady === 'true') return;

      const article = wrap.closest('article, section, .card');
      const heading = article ? article.querySelector('h3') : null;
      const caption = article ? article.querySelector('.mind-map-caption') : null;
      const title = heading ? heading.textContent.trim() : ('Mind Map ' + (index + 1));
      const altText = pageTitle + ' - ' + title;
      const displayWidth = getMindMapDisplayWidth(svg);

      wrap.dataset.zoomReady = 'true';
      wrap.classList.add('is-zoomable');

      let zoomPill = wrap.querySelector('.mind-map-zoom-pill');
      if (!zoomPill) {
        zoomPill = document.createElement('button');
        zoomPill.type = 'button';
        zoomPill.className = 'mind-map-zoom-pill';
        zoomPill.textContent = 'Enlarge mind map';
        wrap.insertBefore(zoomPill, wrap.firstChild);
      }

      const openViewer = () => {
        lightbox.open({
          svg,
          title,
          chapterTitle: pageTitle,
          caption: (caption && caption.textContent.trim()) || 'Scroll to inspect the full map. Press Esc to close.',
          altText,
          displayWidth
        });
      };

      zoomPill.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        openViewer();
      });
    });
  }

  const quickCheckQuestions = [
    'I can explain the main idea of this page in my own words.',
    'I can solve or answer the key pattern without looking at the page.',
    'I can recall the important terms, formulas, or facts from memory.',
    'I know the common mistake to avoid in this chapter.',
    'I could revise this chapter quickly before an exam and still feel confident.'
  ];

  function ensureStickyProgress(meta) {
    let shell = container.querySelector('.chapter-sticky-progress');
    if (!shell) {
      shell = document.createElement('div');
      shell.className = 'chapter-sticky-progress';
      shell.innerHTML =
        '<div class="chapter-sticky-head">' +
          '<span class="chapter-sticky-title">' + escapeHtml(pageTitle) + '</span>' +
          '<span class="chapter-sticky-status" id="chapterStickyStatus">In Progress</span>' +
        '</div>' +
        '<div class="chapter-sticky-bar"><div class="chapter-sticky-fill" id="chapterStickyFill"></div></div>' +
      '</div>';
      insertBeforeAnchor(shell, getPrimaryContentAnchor());
    }

    const fill = shell.querySelector('#chapterStickyFill');
    const status = shell.querySelector('#chapterStickyStatus');
    const statusLabel = getStatusLabel((meta && meta.status) || 'in_progress');
    status.textContent = statusLabel + ' · 0% read';

    const update = () => {
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const percent = Math.max(0, Math.min(100, Math.round((window.scrollY / maxScroll) * 100)));
      if (fill) fill.style.width = percent + '%';
      if (status) status.textContent = statusLabel + ' · ' + percent + '% read';
    };

    update();
    if (window.__studyPortalStickyProgressHandler) {
      window.removeEventListener('scroll', window.__studyPortalStickyProgressHandler);
      window.removeEventListener('resize', window.__studyPortalStickyProgressHandler);
    }
    window.__studyPortalStickyProgressHandler = update;
    window.addEventListener('scroll', window.__studyPortalStickyProgressHandler, { passive: true });
    window.addEventListener('resize', window.__studyPortalStickyProgressHandler);
  }

  function renderToolCards() {
    const sectionLinks = ensureSectionIds();
    const meta = getChapterMetaRecord(chapterKey);
    const currentStatus = meta.status || 'in_progress';
    const quizPercent = Number((meta.quiz || {}).percent || 0);
    const learningBullets = collectLearningBullets();
    const revisionSummary = getRevisionSummary();
    const mustMemorizeItems = collectMustMemorizeItems(learningBullets);
    const weakSpotItems = collectWeakSpotItems();
    const memoryNote = String(meta.notes || '');

    document.querySelectorAll('.chapter-enhancer-card').forEach(node => node.remove());
    ensureStickyProgress(meta);

    const overview = document.createElement('section');
    overview.className = 'card chapter-enhancer-card chapter-overview-card';
    overview.innerHTML =
      '<div class="chapter-overview-head">' +
        '<div>' +
          '<p class="enhancer-eyebrow">Smart Revision Layer</p>' +
          '<h3>What You Will Learn</h3>' +
        '</div>' +
        '<span class="tag ' + getStatusClass(currentStatus) + '">' + getStatusLabel(currentStatus) + '</span>' +
      '</div>' +
      '<div class="chapter-overview-grid">' +
        '<div>' +
          '<ul class="list">' + learningBullets.map(item => '<li>' + item + '</li>').join('') + '</ul>' +
        '</div>' +
        '<div class="revision-box">' +
          '<h4>Revision in 1 Minute</h4>' +
          '<p>' + revisionSummary + '</p>' +
          '<p class="footer-note">Latest mastery check: ' + (quizPercent ? (quizPercent + '%') : 'Not taken yet') + '</p>' +
        '</div>' +
      '</div>';

    const memorize = document.createElement('section');
    memorize.className = 'card chapter-enhancer-card chapter-memorize-card';
    memorize.innerHTML =
      '<div class="chapter-overview-head">' +
        '<div>' +
          '<p class="enhancer-eyebrow">Exam Memory</p>' +
          '<h3>Must Memorize</h3>' +
        '</div>' +
        '<span class="tag ' + getStatusClass(currentStatus) + '">Revise before tests</span>' +
      '</div>' +
      '<ul class="list">' + mustMemorizeItems.map(item => '<li>' + escapeHtml(item) + '</li>').join('') + '</ul>' +
      '<div style="margin-top:14px;">' +
        '<label for="chapterMemoryNote">My memory anchor</label>' +
        '<textarea id="chapterMemoryNote" rows="2" placeholder="Type a quick formula, date, keyword, or reminder to save for this chapter.">' + escapeHtml(memoryNote) + '</textarea>' +
      '</div>' +
      '<div class="action-row" style="margin-top:12px;">' +
        '<button class="btn secondary" id="saveMemoryNoteBtn">Save Memory Note</button>' +
      '</div>' +
      '<p class="footer-note" id="chapterMemoryNoteMessage">' + (memoryNote ? 'Saved note ready for revision.' : '') + '</p>';

    const tools = document.createElement('section');
    tools.className = 'card chapter-enhancer-card chapter-tool-card';
    tools.innerHTML =
      '<h3>Chapter Tools</h3>' +
      '<div class="jump-chip-row">' +
        sectionLinks.map(item => '<a class="jump-chip" href="#' + item.id + '">' + item.label + '</a>').join('') +
      '</div>' +
      '<div class="flag-chip-row">' +
        '<button class="flag-chip' + (currentStatus === 'in_progress' ? ' active' : '') + '" data-status="in_progress">In Progress</button>' +
        '<button class="flag-chip' + (currentStatus === 'need_revision' ? ' active' : '') + '" data-status="need_revision">Need Revision</button>' +
        '<button class="flag-chip' + (currentStatus === 'confusing' ? ' active' : '') + '" data-status="confusing">Confusing</button>' +
        '<button class="flag-chip' + (currentStatus === 'mastered' ? ' active' : '') + '" data-status="mastered">Mastered</button>' +
      '</div>' +
      (weakSpotItems.length
        ? (
          '<div class="chapter-watchout-box">' +
            '<h4>Watch Out For</h4>' +
            '<ul class="list">' + weakSpotItems.map(item => '<li>' + escapeHtml(item) + '</li>').join('') + '</ul>' +
          '</div>'
        )
        : '') +
      '<div class="footer-note">Status syncs with the same cloud record. It does not reset existing chapter progress.</div>';

    const quiz = document.createElement('section');
    quiz.className = 'card chapter-enhancer-card chapter-quiz-card';
    quiz.innerHTML =
      '<h3>Quick Mastery Check</h3>' +
      '<p class="footer-note">This self-test is saved for the chapter and can be reviewed from the parent dashboard.</p>' +
      '<div class="quick-check-list">' +
        quickCheckQuestions.map((question, index) =>
          '<div class="quick-check-item">' +
            '<p>' + (index + 1) + '. ' + question + '</p>' +
            '<div class="quick-check-options">' +
              '<label><input type="radio" name="qc-' + index + '" value="0"> Not yet</label>' +
              '<label><input type="radio" name="qc-' + index + '" value="1"> Almost</label>' +
              '<label><input type="radio" name="qc-' + index + '" value="2"> Yes</label>' +
            '</div>' +
          '</div>'
        ).join('') +
      '</div>' +
      '<div class="action-row" style="margin-top:14px;">' +
        '<button class="btn" id="saveMasteryCheckBtn">Save Mastery Check</button>' +
      '</div>' +
      '<p class="footer-note" id="masteryCheckMessage"></p>';

    const topAnchor = getSummaryAnchor();
    insertBeforeAnchor(overview, topAnchor);
    insertBeforeAnchor(memorize, topAnchor);
    insertBeforeAnchor(tools, topAnchor);
    insertBeforeAnchor(quiz, getAppendAnchor());

    if (meta.quiz && Array.isArray(meta.quiz.answers)) {
      meta.quiz.answers.forEach((value, index) => {
        const input = quiz.querySelector('input[name="qc-' + index + '"][value="' + value + '"]');
        if (input) input.checked = true;
      });
      const message = quiz.querySelector('#masteryCheckMessage');
      if (message && meta.quiz.percent != null) {
        message.textContent = 'Latest saved score: ' + meta.quiz.percent + '%';
      }
    }

    tools.querySelectorAll('.flag-chip').forEach(button => {
      button.addEventListener('click', () => {
        setChapterStatus(chapterKey, button.dataset.status);
        renderToolCards();
      });
    });

    memorize.querySelector('#saveMemoryNoteBtn').addEventListener('click', () => {
      const note = memorize.querySelector('#chapterMemoryNote').value.trim();
      updateChapterMetaRecord(chapterKey, { notes: note });
      memorize.querySelector('#chapterMemoryNoteMessage').textContent = note
        ? 'Memory note saved for this chapter.'
        : 'Memory note cleared.';
    });

    quiz.querySelector('#saveMasteryCheckBtn').addEventListener('click', () => {
      const answers = quickCheckQuestions.map((_, index) => {
        const checked = quiz.querySelector('input[name="qc-' + index + '"]:checked');
        return checked ? Number(checked.value) : 0;
      });
      const total = quickCheckQuestions.length * 2;
      const score = answers.reduce((sum, value) => sum + value, 0);
      const percent = Math.round((score / total) * 100);
      saveChapterQuizResult(chapterKey, { score, total, percent, answers });
      if (percent >= 80) setChapterStatus(chapterKey, 'mastered');
      else if (percent < 60) setChapterStatus(chapterKey, 'need_revision');
      renderToolCards();
    });
  }

  renderToolCards();
  enhanceMindMaps();

  const markDoneButton = document.getElementById('markDone');
  if (markDoneButton) {
    markDoneButton.addEventListener('click', () => {
      const meta = getChapterMetaRecord(chapterKey);
      if (!meta.status || meta.status === 'in_progress' || meta.status === 'need_revision') {
        setChapterStatus(chapterKey, 'mastered');
        renderToolCards();
      }
    });
  }

  const markUndoButton = document.getElementById('markUndo');
  if (markUndoButton) {
    markUndoButton.addEventListener('click', () => {
      setChapterStatus(chapterKey, 'in_progress');
      renderToolCards();
    });
  }
  }

  if (window.STUDY_PORTAL_MEMORY_BANK || !assetBase) {
    runEnhancer();
    return;
  }

  const memoryBankScript = document.createElement('script');
  memoryBankScript.src = assetBase + 'chapter-memory-bank.js' + memoryBankVersionQuery;
  memoryBankScript.onload = runEnhancer;
  memoryBankScript.onerror = runEnhancer;
  document.head.appendChild(memoryBankScript);
})();
