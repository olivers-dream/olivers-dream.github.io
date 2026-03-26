(function chapterEnhancer() {
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

  document.documentElement.style.setProperty('--page-accent', subjectAccent);
  document.body.dataset.subject = subjectFolder;

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
    const summarySection = getSummarySection();
    const firstParagraph = Array.from(summarySection.querySelectorAll('p'))
      .map(item => item.textContent.trim())
      .find(Boolean);
    return firstParagraph || 'Use this chapter card to capture the core idea before revision.';
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

  function renderToolCards() {
    const sectionLinks = ensureSectionIds();
    const meta = getChapterMetaRecord(chapterKey);
    const currentStatus = meta.status || 'in_progress';
    const quizPercent = Number((meta.quiz || {}).percent || 0);
    const learningBullets = collectLearningBullets();
    const revisionSummary = getRevisionSummary();

    document.querySelectorAll('.chapter-enhancer-card').forEach(node => node.remove());

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

    const insertAfter = wisdomBanner.nextElementSibling;
    container.insertBefore(overview, insertAfter);
    container.insertBefore(tools, overview.nextElementSibling);
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
})();
