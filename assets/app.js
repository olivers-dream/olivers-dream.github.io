/* ===== Oliver's Study Portal — Core Engine + Gamification ===== */

/* >>>>>> LAUNCH CONFIG <<<<<< */
const LAUNCH_DATE = '2026-03-16';   // Production start date
const RESET_FLAG_KEY = 'study_portal_reset_done_v1';

const STORAGE_KEYS = {
  chapterProgress: "study_portal_chapter_progress_v1",
  dailyLog: "study_portal_daily_log_v1",
  xp: "study_portal_xp_v1",
  streak: "study_portal_streak_v1",
  lastDate: "study_portal_last_date_v1",
  prevLevel: "study_portal_prev_level_v1"
};

/* ---------- Launch-day auto-reset ---------- */
function checkLaunchReset() {
  const today = formatDate(new Date());
  const alreadyReset = localStorage.getItem(RESET_FLAG_KEY);
  if (today >= LAUNCH_DATE && alreadyReset !== 'yes') {
    // Wipe all exploration data
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
    localStorage.setItem(RESET_FLAG_KEY, 'yes');
    console.log('🚀 Launch day reset complete — all exploration data cleared!');
    return true;  // data was just reset
  }
  return false;
}

function isExplorationMode() {
  const today = formatDate(new Date());
  return today < LAUNCH_DATE;
}

function daysUntilLaunch() {
  const now = new Date();
  const launch = new Date(LAUNCH_DATE);
  const diff = Math.ceil((launch - now) / 86400000);
  return Math.max(0, diff);
}

// Run auto-reset check on every page load
checkLaunchReset();

/* ---------- Chapter Progress ---------- */
function getChapterProgress() {
  const raw = localStorage.getItem(STORAGE_KEYS.chapterProgress);
  return raw ? JSON.parse(raw) : {};
}

function setChapterProgress(progress) {
  localStorage.setItem(STORAGE_KEYS.chapterProgress, JSON.stringify(progress));
}

function markChapterDone(chapterId, done = true) {
  const progress = getChapterProgress();
  progress[chapterId] = done;
  setChapterProgress(progress);
  if (done) awardXP(0, true); // 25 XP for completing a chapter
}

function isChapterDone(chapterId) {
  const progress = getChapterProgress();
  return !!progress[chapterId];
}

/* ---------- Daily Log ---------- */
function getDailyLog() {
  const raw = localStorage.getItem(STORAGE_KEYS.dailyLog);
  return raw ? JSON.parse(raw) : [];
}

function setDailyLog(entries) {
  localStorage.setItem(STORAGE_KEYS.dailyLog, JSON.stringify(entries));
}

function addDailyEntry(entry) {
  const entries = getDailyLog();
  entries.unshift(entry);
  setDailyLog(entries);
  if (entry.date) updateStreak(entry.date);
}

/* ---------- Subject Stats ---------- */
function calculateMathStats(totalMathChapters = 14) {
  const progress = getChapterProgress();
  const doneMath = Object.keys(progress)
    .filter(id => id.startsWith("math-") && progress[id]).length;
  const daily = getDailyLog();
  const totalHours = daily.reduce((sum, e) => sum + Number(e.hours || 0), 0);
  return {
    doneMath,
    totalMathChapters,
    percent: Math.round((doneMath / totalMathChapters) * 100),
    totalHours: Number(totalHours.toFixed(1))
  };
}

function calculateScienceStats(totalScienceChapters = 13) {
  const progress = getChapterProgress();
  const doneScience = Object.keys(progress)
    .filter(id => id.startsWith("sci-") && progress[id]).length;
  return {
    doneScience,
    totalScienceChapters,
    percent: Math.round((doneScience / totalScienceChapters) * 100)
  };
}

function calculateSubjectStats(prefix, total) {
  const progress = getChapterProgress();
  const done = Object.keys(progress)
    .filter(id => id.startsWith(prefix + "-") && progress[id]).length;
  return { done, total, percent: total > 0 ? Math.round((done / total) * 100) : 0 };
}

/* ---------- Date Utilities ---------- */
function weekdaysBetween(startDate, endDate) {
  const dates = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) dates.push(new Date(d));
  }
  return dates;
}

function formatDate(date) {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return yyyy + "-" + mm + "-" + dd;
}

function friendlyDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString("en-IN", {
    weekday: "short", year: "numeric", month: "short", day: "numeric"
  });
}

/* ---------- Answer Checking ---------- */
function normalizeAnswer(value) {
  return String(value || "").toLowerCase()
    .replace(/\s+/g, "").replace(/[.,]/g, "")
    .replace(/√/g, "sqrt").replace(/\^/g, "");
}

function checkTypedAnswer(inputId, expectedAnswers, feedbackId, solutionId) {
  const inputEl = document.getElementById(inputId);
  const feedbackEl = document.getElementById(feedbackId);
  const solutionEl = document.getElementById(solutionId);
  if (!inputEl || !feedbackEl || !solutionEl) return;

  const typed = normalizeAnswer(inputEl.value);
  if (!typed) {
    feedbackEl.textContent = "Enter your answer first, then click check.";
    feedbackEl.className = "feedback retry";
    return;
  }

  const valid = expectedAnswers.split("|").map(a => normalizeAnswer(a)).includes(typed);
  if (valid) {
    feedbackEl.textContent = "Correct ✅ Great work. Now review full steps.";
    feedbackEl.className = "feedback ok";
    solutionEl.classList.remove("hidden");
  } else {
    feedbackEl.textContent = "Not fully correct yet. Try once more or reveal steps.";
    feedbackEl.className = "feedback retry";
  }
}

function revealSolution(solutionId) {
  const el = document.getElementById(solutionId);
  if (el) el.classList.remove("hidden");
}

/* ========== GAMIFICATION ENGINE ========== */

const LEVELS = [
  { name: "Beginner",  xp: 0 },
  { name: "Learner",   xp: 100 },
  { name: "Explorer",  xp: 300 },
  { name: "Scholar",   xp: 600 },
  { name: "Achiever",  xp: 1000 },
  { name: "Expert",    xp: 1600 },
  { name: "Master",    xp: 2400 },
  { name: "Legend",     xp: 3500 },
  { name: "Champion",  xp: 5000 },
  { name: "Topper",    xp: 6000 }
];

function getXP()  { return parseInt(localStorage.getItem(STORAGE_KEYS.xp) || "0", 10); }
function setXP(v) { localStorage.setItem(STORAGE_KEYS.xp, String(v)); }

function getStreak()  { return parseInt(localStorage.getItem(STORAGE_KEYS.streak) || "0", 10); }
function setStreak(v) { localStorage.setItem(STORAGE_KEYS.streak, String(v)); }

function getLevelForXP(xp) {
  let lvl = LEVELS[0].name;
  for (const l of LEVELS) {
    if (xp >= l.xp) lvl = l.name;
    else break;
  }
  return lvl;
}

function getNextLevel(xp) {
  for (const l of LEVELS) {
    if (xp < l.xp) return l;
  }
  return LEVELS[LEVELS.length - 1];
}

function updateStreak(dateStr) {
  const last = localStorage.getItem(STORAGE_KEYS.lastDate);
  const today = dateStr || formatDate(new Date());

  if (last === today) return; // already logged today

  if (last) {
    const prev = new Date(last);
    const curr = new Date(today);
    const diff = Math.round((curr - prev) / 86400000);
    if (diff === 1) {
      setStreak(getStreak() + 1);
    } else if (diff > 1) {
      setStreak(1); // streak broken
    }
  } else {
    setStreak(1);
  }

  localStorage.setItem(STORAGE_KEYS.lastDate, today);
}

function awardXP(hours, isChapter) {
  let base = 0;
  if (isChapter) base = 25;
  if (hours > 0) base += Math.round(hours * 10);

  // Streak multiplier
  const streak = getStreak();
  let mult = 1;
  if (streak >= 7) mult = 1.5;
  else if (streak >= 3) mult = 1.2;

  const gained = Math.round(base * mult);
  setXP(getXP() + gained);
  return gained;
}

function getXPData() {
  const xp = getXP();
  const streak = getStreak();
  const level = getLevelForXP(xp);
  const next = getNextLevel(xp);
  const currentLvl = LEVELS.find(l => l.name === level) || LEVELS[0];

  let xpProgress = 100;
  if (next.name !== level) {
    const range = next.xp - currentLvl.xp;
    const done = xp - currentLvl.xp;
    xpProgress = Math.min(100, Math.round((done / range) * 100));
  }

  // Check for level-up
  const prevLevel = localStorage.getItem(STORAGE_KEYS.prevLevel) || "Beginner";
  const justLeveledUp = (level !== prevLevel);
  localStorage.setItem(STORAGE_KEYS.prevLevel, level);

  return { xp, streak, level, xpProgress, justLeveledUp };
}

/* ---------- Confetti ---------- */
function launchConfetti() {
  const colors = ['#8b5cf6', '#06b6d4', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'];
  for (let i = 0; i < 60; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.left = Math.random() * 100 + 'vw';
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.animationDelay = (Math.random() * 1.5) + 's';
    el.style.width = (6 + Math.random() * 8) + 'px';
    el.style.height = (6 + Math.random() * 8) + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3500);
  }
}
