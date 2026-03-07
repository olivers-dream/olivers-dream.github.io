/**
 * Dashboard.jsx — Oliver's Dream RPG Study Dashboard
 * React + Tailwind CSS  |  Drop-in component, mobile-first
 *
 * Props — all data is passed in; this component is purely presentational.
 * Wire your existing state-logic functions to the props at the call-site.
 *
 * Usage:
 *   <Dashboard
 *     levelName="Apprentice"
 *     streak={7}
 *     xp={340}
 *     xpProgress={68}
 *     subjects={subjectArray}
 *     weeklyQuests={questArray}
 *     onQuestProgress={(questId) => markQuestDone(questId)}
 *     totalHours={12}
 *   />
 */

import { useEffect, useRef, useState } from 'react';

// ─── Helpers ────────────────────────────────────────────────────────────────

function getMasteryLevel(pct) {
  if (pct === 0)  return 'Novice';
  if (pct < 25)   return 'Apprentice';
  if (pct < 50)   return 'Journeyman';
  if (pct < 75)   return 'Expert';
  if (pct < 100)  return 'Master';
  return 'Grandmaster ✨';
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 6)       return '🌙 Night Owl Mode';
  if (h < 12)      return '☀️ Good Morning';
  if (h < 17)      return '🌤️ Good Afternoon';
  if (h < 21)      return '🌆 Good Evening';
  return '🌙 Night Owl Mode';
}

function getCurrentPhase() {
  const m = new Date().getMonth(); // 0=Jan
  if (m >= 9 && m <= 10) return { num: 'II',  label: 'Deepening your Mastery' };
  if (m === 11 || m === 0) return { num: 'III', label: 'Intensive Revision' };
  if (m === 1)             return { num: 'IV',  label: "Final Sprint — You've got this!" };
  return { num: 'I', label: 'Building your Foundation' };
}

function getWeekRange() {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  return `${fmt(monday)} – ${fmt(sunday)}`;
}

// ─── Subject config ──────────────────────────────────────────────────────────
// Colors map to Tailwind utilities used throughout the skill cards

const SUBJECT_THEME = {
  maths:             { color: 'blue',    border: 'border-blue-500/25',   hoverBorder: 'hover:border-blue-500/60',   hoverGlow: 'hover:shadow-[0_6px_28px_rgba(59,130,246,0.18)]',   kpi: 'text-blue-400',   icon: '📐' },
  science:           { color: 'emerald', border: 'border-emerald-500/25', hoverBorder: 'hover:border-emerald-500/60', hoverGlow: 'hover:shadow-[0_6px_28px_rgba(16,185,129,0.18)]', kpi: 'text-emerald-400', icon: '🔬' },
  geography:         { color: 'cyan',    border: 'border-cyan-500/25',    hoverBorder: 'hover:border-cyan-500/60',    hoverGlow: 'hover:shadow-[0_6px_28px_rgba(6,182,212,0.18)]',   kpi: 'text-cyan-400',    icon: '🌍' },
  civics:            { color: 'amber',   border: 'border-amber-500/25',   hoverBorder: 'hover:border-amber-500/60',   hoverGlow: 'hover:shadow-[0_6px_28px_rgba(245,158,11,0.18)]',  kpi: 'text-amber-400',   icon: '🏛️' },
  history:           { color: 'pink',    border: 'border-pink-500/25',    hoverBorder: 'hover:border-pink-500/60',    hoverGlow: 'hover:shadow-[0_6px_28px_rgba(236,72,153,0.18)]',   kpi: 'text-pink-400',    icon: '📜' },
  economics:         { color: 'violet',  border: 'border-violet-500/25',  hoverBorder: 'hover:border-violet-500/60',  hoverGlow: 'hover:shadow-[0_6px_28px_rgba(139,92,246,0.18)]',  kpi: 'text-violet-400',  icon: '💰' },
  first_flight:      { color: 'fuchsia', border: 'border-fuchsia-500/25', hoverBorder: 'hover:border-fuchsia-500/60', hoverGlow: 'hover:shadow-[0_6px_28px_rgba(217,70,239,0.18)]',  kpi: 'text-fuchsia-400', icon: '📖' },
  footprints:        { color: 'orange',  border: 'border-orange-500/25',  hoverBorder: 'hover:border-orange-500/60',  hoverGlow: 'hover:shadow-[0_6px_28px_rgba(249,115,22,0.18)]',  kpi: 'text-orange-400',  icon: '👣' },
  words_expressions: { color: 'sky',     border: 'border-sky-500/25',     hoverBorder: 'hover:border-sky-500/60',     hoverGlow: 'hover:shadow-[0_6px_28px_rgba(14,165,233,0.18)]',   kpi: 'text-sky-400',     icon: '✍️' },
};

// ─── Sub-components ──────────────────────────────────────────────────────────

/** Animated SVG progress ring */
function ProgressRing({ percent }) {
  const circumference = 2 * Math.PI * 60; // r=60
  const offset = circumference - (circumference * percent) / 100;

  return (
    <svg width="100" height="100" viewBox="0 0 140 140" className="drop-shadow-[0_0_10px_rgba(139,92,246,0.35)]">
      <circle cx="70" cy="70" r="60" stroke="rgba(255,255,255,0.06)" strokeWidth="10" fill="none" />
      <circle
        cx="70" cy="70" r="60"
        stroke="url(#ringGrad)"
        strokeWidth="10"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 70 70)"
        style={{ transition: 'stroke-dashoffset 1s ease' }}
      />
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <text x="70" y="66" textAnchor="middle" fill="#e2e8f0" fontSize="26" fontWeight="800">{percent}%</text>
      <text x="70" y="84" textAnchor="middle" fill="#94a3b8" fontSize="11">Overall</text>
    </svg>
  );
}

/** Yearly journey roadmap strip */
function JourneyRoadmap({ overallPct, totalDone, totalAll }) {
  const phase = getCurrentPhase();
  const phases = [
    { num: 'I',   label: 'Foundation',   sub: 'Mar–Sep' },
    { num: 'II',  label: 'Mastery',      sub: 'Oct–Nov' },
    { num: 'III', label: 'Revision',     sub: 'Dec–Jan' },
    { num: 'IV',  label: 'Final Sprint', sub: 'Feb' },
  ];

  return (
    <section className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 mb-5 backdrop-blur-sm">
      {/* Top row: title + ring */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-extrabold text-slate-100 tracking-tight">🗺️ The Yearly Journey</h2>
          <p className="mt-1 text-sm italic text-slate-400">
            Phase {phase.num} — {phase.label}
          </p>
        </div>
        <div className="shrink-0">
          <ProgressRing percent={overallPct} />
        </div>
      </div>

      {/* Phase nodes */}
      <div className="flex items-start justify-between">
        {phases.map((p, i) => {
          const isActive = p.num === phase.num;
          return (
            <div key={p.num} className="flex items-start flex-1">
              {/* Node */}
              <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <div className={[
                  'w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm font-serif transition-all duration-300',
                  isActive
                    ? 'bg-gradient-to-br from-violet-600 to-cyan-500 text-white shadow-[0_0_0_4px_rgba(139,92,246,0.2),0_0_22px_rgba(139,92,246,0.45)]'
                    : 'bg-white/[0.05] border-2 border-white/10 text-slate-400'
                ].join(' ')}>
                  {p.num}
                </div>
                <span className={`text-[0.7rem] font-bold text-center whitespace-nowrap ${isActive ? 'text-violet-300' : 'text-slate-500'}`}>
                  {p.label}
                </span>
                <span className="text-[0.62rem] text-slate-600 text-center whitespace-nowrap">{p.sub}</span>
              </div>
              {/* Connector (not after last) */}
              {i < phases.length - 1 && (
                <div className="flex-1 h-px bg-white/[0.07] mt-[22px] mx-1" />
              )}
            </div>
          );
        })}
      </div>

      {/* Year mastery bar */}
      <div className="mt-5 mb-2 h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-600 via-cyan-500 to-emerald-500 transition-all duration-1000"
          style={{ width: `${overallPct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-400">
        <span>Year Mastery: <strong className="text-violet-300">{overallPct}%</strong></span>
        <span>{totalDone} / {totalAll} chapters complete</span>
      </div>
    </section>
  );
}

/** Single quest card */
function QuestCard({ quest, onProgress }) {
  const { icon, name, progress, total, xp } = quest;
  const pct  = Math.round((progress / total) * 100);
  const done = progress >= total;
  const unitWord = total === 1 ? 'exercise' : 'exercises';

  return (
    <div className={[
      'flex items-center gap-3 rounded-2xl border p-3 relative overflow-hidden transition-all duration-200',
      done
        ? 'border-emerald-500/25 bg-emerald-500/[0.03]'
        : 'border-white/[0.08] bg-white/[0.04] hover:border-violet-500/35 hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(139,92,246,0.1)]',
    ].join(' ')}>
      {/* Icon box */}
      <div className="w-10 h-10 flex items-center justify-center text-xl rounded-xl bg-white/[0.04] border border-white/[0.08] shrink-0">
        {icon}
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <p className="text-[0.84rem] font-bold text-slate-200 leading-snug mb-0.5">{name}</p>
        <p className="text-[0.72rem] text-slate-400 mb-1.5 tabular-nums">
          {progress} / {total} {unitWord}
        </p>
        {/* Mini bar */}
        <div className="h-1 rounded-full bg-white/[0.07] overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${done ? 'bg-gradient-to-r from-emerald-500 to-green-400' : 'bg-gradient-to-r from-violet-500 to-cyan-400'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex flex-col items-center gap-1.5 shrink-0">
        <span className="text-[0.68rem] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-lg whitespace-nowrap">
          +{xp} XP
        </span>
        {done ? (
          <span className="w-6 h-6 flex items-center justify-center text-xs font-bold text-emerald-400 bg-emerald-400/15 border border-emerald-400/30 rounded-full">✓</span>
        ) : (
          <button
            onClick={() => onProgress(quest.id)}
            className="text-[0.7rem] font-bold px-2.5 py-0.5 rounded-lg border border-white/[0.08] bg-white/[0.06] text-slate-300 hover:bg-violet-500/15 hover:border-violet-500/35 hover:text-violet-300 transition-all"
          >
            +1
          </button>
        )}
      </div>
    </div>
  );
}

/** Weekly quests section */
function WeeklyQuests({ quests, onQuestProgress }) {
  return (
    <section className="mb-6">
      <div className="flex items-center justify-between gap-3 mb-3.5">
        <h2 className="text-base font-extrabold text-slate-100 tracking-tight">⚔️ Weekly Quests</h2>
        <span className="text-[0.72rem] text-slate-400 bg-white/[0.04] border border-white/[0.08] px-3 py-1 rounded-full whitespace-nowrap shrink-0">
          {getWeekRange()}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {quests.map((q) => (
          <QuestCard key={q.id} quest={q} onProgress={onQuestProgress} />
        ))}
      </div>
    </section>
  );
}

/** RPG skill card for a subject */
function SkillCard({ subject }) {
  const { id, name, done, total, percent, href } = subject;
  const theme   = SUBJECT_THEME[id] || SUBJECT_THEME.maths;
  const mastery = getMasteryLevel(percent);

  return (
    <article className={[
      'bg-white/[0.04] backdrop-blur-sm rounded-2xl border p-4 flex flex-col gap-0 transition-all duration-250 cursor-default',
      theme.border,
      theme.hoverBorder,
      theme.hoverGlow,
      'hover:-translate-y-[3px]',
    ].join(' ')}>
      {/* Header row */}
      <div className="flex items-center gap-2.5 mb-2.5">
        <div className="w-9 h-9 flex items-center justify-center text-xl rounded-xl bg-white/[0.04] border border-white/[0.08] shrink-0">
          {theme.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[0.9rem] font-bold text-slate-100 leading-tight">{name}</h3>
          <span className="text-[0.65rem] font-bold tracking-widest uppercase text-slate-500">{mastery}</span>
        </div>
        <div className={`text-[1.05rem] font-extrabold tabular-nums shrink-0 ${theme.kpi}`}>
          {done} / {total}
        </div>
      </div>

      {/* Mastery progress bar */}
      <div className="h-2.5 rounded-full bg-white/[0.06] overflow-hidden mb-1.5">
        <div
          className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${getSubjectGradient(id)}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* XP label row */}
      <div className="flex justify-between items-center text-[0.7rem] text-slate-400 mb-3">
        <span>Mastery XP</span>
        <span className="font-bold text-violet-300 tabular-nums">{percent}%</span>
      </div>

      {/* Footer note */}
      <p className="text-[0.78rem] text-slate-500 leading-snug mb-3 flex-1">{subject.note}</p>

      {/* CTA */}
      <a
        href={href}
        className="block text-center text-[0.78rem] font-semibold px-3 py-2 rounded-xl border border-white/[0.08] bg-white/[0.05] text-slate-400 hover:bg-violet-500/15 hover:border-violet-500/35 hover:text-violet-300 transition-all"
      >
        Train →
      </a>
    </article>
  );
}

function getSubjectGradient(id) {
  const map = {
    maths:             'from-blue-600 to-blue-400',
    science:           'from-emerald-600 to-emerald-400',
    geography:         'from-cyan-600 to-cyan-400',
    civics:            'from-amber-600 to-amber-400',
    history:           'from-pink-600 to-pink-400',
    economics:         'from-violet-600 to-violet-400',
    first_flight:      'from-fuchsia-600 to-fuchsia-400',
    footprints:        'from-orange-600 to-orange-400',
    words_expressions: 'from-sky-600 to-sky-400',
  };
  return map[id] || 'from-violet-600 to-cyan-400';
}

/** Mobile bottom navigation bar */
function BottomNav() {
  const links = [
    { href: 'index.html',         icon: '🏠', label: 'Home' },
    { href: 'schedule.html',      icon: '📅', label: 'Schedule' },
    { href: 'tracker.html',       icon: '✏️', label: 'Tracker' },
    { href: 'maths/index.html',   icon: '📐', label: 'Maths' },
    { href: 'science/index.html', icon: '🔬', label: 'Science' },
  ];
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#08081a]/97 backdrop-blur-xl border-t border-white/[0.08] flex justify-around items-center px-1 py-1.5 pb-[calc(6px+env(safe-area-inset-bottom))]">
      {links.map((l, i) => (
        <a
          key={l.href}
          href={l.href}
          className={`flex flex-col items-center gap-0.5 flex-1 max-w-[68px] px-2 py-1.5 rounded-xl transition-all ${i === 0 ? 'text-violet-400 bg-violet-500/12' : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'}`}
        >
          <span className="text-xl leading-none">{l.icon}</span>
          <span className="text-[0.54rem] font-semibold tracking-wide">{l.label}</span>
        </a>
      ))}
    </nav>
  );
}

// ─── Main Dashboard Component ────────────────────────────────────────────────

/**
 * @param {object}   props
 * @param {string}   props.levelName        - e.g. "Apprentice"
 * @param {number}   props.streak           - consecutive study days
 * @param {number}   props.xp              - total XP earned
 * @param {number}   props.xpProgress      - 0-100, progress to next level
 * @param {Array}    props.subjects         - array of subject stat objects
 * @param {Array}    props.weeklyQuests     - array of quest objects
 * @param {Function} props.onQuestProgress  - callback(questId)
 * @param {number}   props.totalHours       - total study hours logged
 */
export default function Dashboard({
  levelName    = 'Beginner',
  streak       = 0,
  xp           = 0,
  xpProgress   = 0,
  subjects     = [],
  weeklyQuests = [],
  onQuestProgress = () => {},
  totalHours   = 0,
}) {
  const totalDone  = subjects.reduce((s, sub) => s + sub.done, 0);
  const totalAll   = subjects.reduce((s, sub) => s + sub.total, 0) || 76;
  const overallPct = totalAll > 0 ? Math.round((totalDone / totalAll) * 100) : 0;

  // Streak flame intensity
  const flameClass =
    streak >= 30 ? 'animate-[flamePulse_0.75s_ease-in-out_infinite] drop-shadow-[0_0_14px_rgba(239,68,68,1)]' :
    streak >= 14 ? 'animate-[flamePulse_1.5s_ease-in-out_infinite] drop-shadow-[0_0_8px_rgba(251,146,60,0.85)]' :
    streak >= 5  ? 'drop-shadow-[0_0_6px_rgba(251,191,36,0.65)]' : '';

  // Random daily quote (stable per page load)
  const quotes = [
    "Push yourself, because no one else is going to do it for you.",
    "Success is the sum of small efforts repeated day in and day out.",
    "The secret of getting ahead is getting started.",
    "It always seems impossible until it's done.",
    "Dream big. Start small. Act now.",
    "A little progress each day adds up to big results.",
    "Small daily improvements are the key to staggering long-term results.",
    "Education is the passport to the future.",
  ];
  const quote = quotes[new Date().getDate() % quotes.length];

  // Today's focus items
  const dayFocus = [
    ['😎 Rest day — recharge for the week ahead'],
    ['📐 Maths practice problems', '🔬 Science — read one chapter'],
    ['🌍 Geography notes review', '🏛️ Civics — key terms revision'],
    ['📐 Maths — solve worksheet', '📜 History — timeline practice'],
    ['🔬 Science experiments & diagrams', '👣 English — read a chapter'],
    ['📐 Maths revision', '🔬 Science quick quiz', '💰 Economics case studies'],
    ['🎮 Light revision or take a break!'],
  ];
  const todayItems = dayFocus[new Date().getDay()];

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-slate-200 font-sans overflow-x-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 z-0"
        style={{ background: 'radial-gradient(ellipse 600px 400px at 20% 10%, rgba(139,92,246,0.12), transparent), radial-gradient(ellipse 500px 350px at 80% 80%, rgba(6,182,212,0.10), transparent)' }}
      />

      {/* ── HEADER ── */}
      <header className="relative z-10 bg-gradient-to-r from-violet-500/20 to-cyan-500/15 backdrop-blur-xl border-b border-white/[0.08] px-4 py-5 text-center">
        <h1 className="text-2xl font-extrabold bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
          Oliver's Dream
        </h1>
        <p className="text-xs text-slate-400 mt-0.5 italic">Dream big, study smart — your board exam journey starts here</p>

        {/* Stats row */}
        <div className="flex justify-center gap-3 mt-3 flex-wrap">
          <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-pink-500 text-white text-xs font-bold px-3.5 py-1 rounded-full">
            ⭐ {levelName}
          </span>
          <span className="inline-flex items-center gap-1.5 bg-white/[0.06] border border-white/[0.08] text-xs font-semibold px-3 py-1 rounded-full">
            <span className={`inline-block transition-all ${flameClass}`}>🔥</span>
            Streak: <strong className="text-violet-300">{streak}</strong> days
          </span>
          <span className="inline-flex items-center gap-1.5 bg-white/[0.06] border border-white/[0.08] text-xs font-semibold px-3 py-1 rounded-full">
            ⚡ XP: <strong className="text-violet-300">{xp}</strong>
          </span>
        </div>

        {/* XP progress bar */}
        <div className="flex justify-center mt-2.5">
          <div className="w-44 h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </div>
      </header>

      {/* ── DESKTOP NAV TABS (hidden on mobile) ── */}
      <div className="hidden md:flex relative z-10 gap-2.5 px-6 pt-4">
        {[
          { href: 'index.html', label: '🏠 Dashboard', active: true },
          { href: 'schedule.html', label: '📅 Schedule' },
          { href: 'tracker.html', label: '✏️ Tracker' },
        ].map((t) => (
          <a
            key={t.href}
            href={t.href}
            className={`flex-1 text-center text-sm font-semibold px-3.5 py-2.5 rounded-xl border transition-all ${
              t.active
                ? 'text-white bg-violet-500/20 border-violet-500 shadow-[0_0_12px_rgba(139,92,246,0.25)]'
                : 'text-slate-400 bg-white/[0.04] border-white/[0.08] hover:text-white hover:bg-violet-500/15 hover:border-violet-500/40'
            }`}
          >
            {t.label}
          </a>
        ))}
      </div>

      {/* ── MAIN GRID ── */}
      <div className="relative z-10 max-w-[1320px] mx-auto px-4 md:px-5 pb-8 md:grid md:grid-cols-[200px_1fr] md:gap-x-6 mt-4">

        {/* Sidebar Nav (desktop) */}
        <nav className="hidden md:flex flex-col gap-1.5 sticky top-4 self-start max-h-[calc(100vh-24px)] overflow-y-auto">
          {[
            { href: 'maths/index.html',              label: '📐 Maths' },
            { href: 'science/index.html',            label: '🔬 Science' },
            { href: 'geography/index.html',          label: '🌍 Geography' },
            { href: 'civics/index.html',             label: '🏛️ Civics' },
            { href: 'history/index.html',            label: '📜 History' },
            { href: 'economics/index.html',          label: '💰 Economics' },
            { href: 'first_flight/index.html',       label: '📖 First Flight' },
            { href: 'footprints/index.html',         label: '👣 Footprints' },
            { href: 'words_expressions/index.html',  label: '✍️ Words & Expressions' },
          ].map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-slate-400 bg-white/[0.04] border border-white/[0.08] px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap hover:text-white hover:bg-violet-500/15 hover:border-violet-500/40 transition-all"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* ── RIGHT CONTENT COLUMN ── */}
        <div className="flex flex-col gap-5 min-w-0">

          {/* Wisdom banner */}
          <div className="text-center text-[0.84rem] italic text-slate-400 py-2.5 px-4 bg-gradient-to-r from-violet-500/10 via-cyan-500/10 to-violet-500/10 border border-violet-500/18 rounded-2xl">
            &ldquo;The fear of the Lord is the beginning of wisdom&rdquo;
            <span className="text-violet-300 font-semibold not-italic ml-1">&mdash; Prov 9:10</span>
          </div>

          {/* 1 — GREETING + QUOTE */}
          <section className="flex gap-4 p-5 bg-white/[0.04] border border-white/[0.08] border-l-2 border-l-cyan-500 rounded-2xl backdrop-blur-sm flex-col sm:flex-row">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                {getGreeting()}, Oliver! 🚀
              </h3>
              {todayItems.map((item, i) => (
                <div key={i} className="text-sm text-slate-400 py-2 border-b border-white/[0.06] last:border-0">
                  {item}
                </div>
              ))}
            </div>
            <div className="sm:w-[36%] flex items-center justify-center p-3.5 bg-violet-500/6 rounded-xl border border-violet-500/20 text-center">
              <p className="text-[0.86rem] italic text-slate-400 leading-relaxed">
                <span className="text-violet-400 text-lg">&ldquo;</span>
                {quote}
                <span className="text-violet-400 text-lg">&rdquo;</span>
              </p>
            </div>
          </section>

          {/* 2 — YEARLY JOURNEY */}
          <JourneyRoadmap overallPct={overallPct} totalDone={totalDone} totalAll={totalAll} />

          {/* 3 — WEEKLY QUESTS */}
          <WeeklyQuests quests={weeklyQuests} onQuestProgress={onQuestProgress} />

          {/* 4 — SUBJECT SKILL CARDS */}
          <section>
            <h2 className="text-base font-extrabold text-slate-100 tracking-tight mb-4">🎮 Subject Skills</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((sub) => (
                <SkillCard key={sub.id} subject={sub} />
              ))}
            </div>
          </section>

          {/* 5 — TOTAL HOURS */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <article className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 backdrop-blur-sm">
              <h3 className="text-sm font-bold text-slate-200 mb-1">⏱️ Total Study Hours</h3>
              <div className="text-3xl font-extrabold bg-gradient-to-br from-violet-400 to-cyan-400 bg-clip-text text-transparent my-1">
                {totalHours} hrs
              </div>
              <p className="text-xs text-slate-500">Target: 500+ focused hours before exams</p>
            </article>
          </section>

        </div>{/* end right column */}
      </div>{/* end main grid */}

      {/* ── MOBILE BOTTOM NAV ── */}
      <BottomNav />

      {/* Tailwind custom keyframes (inject once if not in tailwind.config.js) */}
      <style>{`
        @keyframes flamePulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.22); }
        }
      `}</style>
    </div>
  );
}

// ─── Example usage / wiring guide ───────────────────────────────────────────
//
// import Dashboard from './Dashboard';
// import { useState } from 'react';
//
// const SUBJECTS = [
//   { id: 'maths',    name: 'Maths',    done: 3,  total: 14, percent: 21, href: 'maths/index.html',    note: '14 chapters — algebra, geometry, trig & more' },
//   { id: 'science',  name: 'Science',  done: 2,  total: 13, percent: 15, href: 'science/index.html',  note: '13 chapters — chemistry, physics, biology' },
//   { id: 'geography',name: 'Geography',done: 0,  total: 7,  percent: 0,  href: 'geography/index.html',note: '7 chapters — Contemporary India II' },
//   // … add remaining subjects
// ];
//
// const QUESTS = [
//   { id: 'wq_math_ch1', icon: '📐', name: 'Real Numbers — Master the Basics',       progress: 0, total: 3, xp: 50 },
//   { id: 'wq_sci_ch1',  icon: '🔬', name: 'Chemical Reactions — Equations Practice', progress: 0, total: 2, xp: 40 },
//   { id: 'wq_hist_ch1', icon: '📜', name: 'Rise of Nationalism — Timeline Map',      progress: 0, total: 1, xp: 30 },
//   { id: 'wq_eng_ch1',  icon: '📖', name: 'A Letter to God — Read & Annotate',       progress: 0, total: 1, xp: 25 },
// ];
//
// function App() {
//   const [quests, setQuests] = useState(QUESTS);
//   const handleQuestProgress = (questId) => {
//     setQuests(prev => prev.map(q =>
//       q.id === questId && q.progress < q.total ? { ...q, progress: q.progress + 1 } : q
//     ));
//   };
//   return (
//     <Dashboard
//       levelName="Apprentice"
//       streak={7}
//       xp={340}
//       xpProgress={68}
//       subjects={SUBJECTS}
//       weeklyQuests={quests}
//       onQuestProgress={handleQuestProgress}
//       totalHours={12}
//     />
//   );
// }
