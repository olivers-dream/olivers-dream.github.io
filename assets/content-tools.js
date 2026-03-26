(function chapterEnhancerBootstrap() {
  const currentScript = document.currentScript;
  const assetBase = currentScript && currentScript.src ? new URL('.', currentScript.src).href : '';

  function runEnhancer() {
  const path = window.location.pathname || '';
  const isWorksheet = /worksheet-/.test(path);
  const isContentPage = /(chapter-|unit-|worksheet-)/.test(path);
  if (!isContentPage) return;

  const container = document.querySelector('main.container');
  const wisdomBanner = document.querySelector('.wisdom-banner');
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
      container.insertBefore(shell, wisdomBanner.nextElementSibling);
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

    const stickyShell = container.querySelector('.chapter-sticky-progress');
    const insertAfter = stickyShell ? stickyShell.nextElementSibling : wisdomBanner.nextElementSibling;
    container.insertBefore(overview, insertAfter);
    container.insertBefore(memorize, overview.nextElementSibling);
    container.insertBefore(tools, memorize.nextElementSibling);
    container.insertBefore(quiz, tools.nextElementSibling);

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
  memoryBankScript.src = assetBase + 'chapter-memory-bank.js';
  memoryBankScript.onload = runEnhancer;
  memoryBankScript.onerror = runEnhancer;
  document.head.appendChild(memoryBankScript);
})();
