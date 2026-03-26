/* ===== Oliver's Study Portal — Core Engine + Cloud Sync ===== */

/* >>>>>> LAUNCH CONFIG <<<<<< */
const LAUNCH_DATE = '2026-03-15';   // Production start date (already passed — reset complete)
const RESET_FLAG_KEY = 'study_portal_reset_done_v1';

const STORAGE_KEYS = {
  chapterProgress: 'study_portal_chapter_progress_v1',
  dailyLog: 'study_portal_daily_log_v1',
  xp: 'study_portal_xp_v1',
  streak: 'study_portal_streak_v1',
  lastDate: 'study_portal_last_date_v1',
  prevLevel: 'study_portal_prev_level_v1'
};

const SYNCABLE_PREFIXES = ['study_portal_', 'quest_'];
const SYNC_META_KEYS = {
  localUpdatedAt: 'studyportal_sync_local_updated_at_v1',
  deviceLabel: 'studyportal_sync_device_label_v1'
};

const FIREBASE_COMPAT_VERSION = '12.4.0';
const APP_ASSET_BASE = (() => {
  const script = document.currentScript;
  if (script && script.src) return new URL('.', script.src).href;
  return new URL('./', window.location.href).href;
})();

const storageBridge = {
  setItem: Storage.prototype.setItem,
  getItem: Storage.prototype.getItem,
  removeItem: Storage.prototype.removeItem,
  clear: Storage.prototype.clear
};

const syncState = {
  bootstrapPromise: null,
  auth: null,
  db: null,
  user: null,
  docRef: null,
  unsubscribeDoc: null,
  config: null,
  status: 'local-only',
  message: 'Running in browser-only mode.',
  enabled: false,
  bootstrapped: false,
  initialSyncComplete: false,
  lastCloudUpdatedAt: 0,
  saveTimer: null,
  saveInFlight: null,
  scriptCache: {},
  suppressTracking: false
};

function isSyncableStorageKey(key) {
  return SYNCABLE_PREFIXES.some(prefix => String(key || '').startsWith(prefix));
}

function setRawLocalValue(key, value) {
  storageBridge.setItem.call(localStorage, key, String(value));
}

function getRawLocalValue(key) {
  return storageBridge.getItem.call(localStorage, key);
}

function removeRawLocalValue(key) {
  storageBridge.removeItem.call(localStorage, key);
}

function getLocalUpdatedAt() {
  return parseInt(getRawLocalValue(SYNC_META_KEYS.localUpdatedAt) || '0', 10);
}

function setSyncState(status, message) {
  syncState.status = status;
  syncState.message = message;
  broadcastSyncState();
}

function broadcastSyncState() {
  window.dispatchEvent(new CustomEvent('studyportal:sync-state', {
    detail: getCloudSyncState()
  }));
}

function broadcastDataChanged(source) {
  window.dispatchEvent(new CustomEvent('studyportal:data-changed', {
    detail: {
      source: source || 'local'
    }
  }));
}

function touchLocalState(reason) {
  setRawLocalValue(SYNC_META_KEYS.localUpdatedAt, Date.now());
  if (syncState.enabled) scheduleCloudSave(reason || 'local-update');
  broadcastSyncState();
}

function collectSyncableStorage() {
  const data = {};
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (isSyncableStorageKey(key)) {
      data[key] = localStorage.getItem(key);
    }
  }
  return data;
}

function stableStorageMapString(storageMap) {
  const ordered = {};
  Object.keys(storageMap || {}).sort().forEach(key => {
    ordered[key] = storageMap[key];
  });
  return JSON.stringify(ordered);
}

function sameStorageMaps(a, b) {
  return stableStorageMapString(a || {}) === stableStorageMapString(b || {});
}

function withSyncTrackingSuppressed(fn) {
  syncState.suppressTracking = true;
  try {
    return fn();
  } finally {
    syncState.suppressTracking = false;
  }
}

function applySyncableStorage(storageMap, options) {
  const incoming = storageMap || {};
  const replaceMissing = !options || options.replaceMissing !== false;

  withSyncTrackingSuppressed(() => {
    if (replaceMissing) {
      const existingKeys = [];
      for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        if (isSyncableStorageKey(key)) existingKeys.push(key);
      }
      existingKeys.forEach(key => {
        if (!(key in incoming)) removeRawLocalValue(key);
      });
    }

    Object.keys(incoming).forEach(key => {
      if (!isSyncableStorageKey(key)) return;
      setRawLocalValue(key, incoming[key]);
    });
  });

  setRawLocalValue(SYNC_META_KEYS.localUpdatedAt, Date.now());
  broadcastDataChanged('cloud-apply');
  broadcastSyncState();
}

function safeParseJSON(value, fallback) {
  try {
    return JSON.parse(value);
  } catch (err) {
    return fallback;
  }
}

function normalizeDailyEntry(entry) {
  return {
    date: String(entry.date || ''),
    subject: String(entry.subject || ''),
    hours: Number(entry.hours || 0),
    notes: String(entry.notes || ''),
    time: String(entry.time || '')
  };
}

function compareLogEntriesDesc(a, b) {
  const left = `${a.date || ''}T${a.time || '00:00'}`;
  const right = `${b.date || ''}T${b.time || '00:00'}`;
  if (left > right) return -1;
  if (left < right) return 1;
  return 0;
}

const LEVELS = [
  { name: 'Beginner', xp: 0 },
  { name: 'Learner', xp: 100 },
  { name: 'Explorer', xp: 300 },
  { name: 'Scholar', xp: 600 },
  { name: 'Achiever', xp: 1000 },
  { name: 'Expert', xp: 1600 },
  { name: 'Master', xp: 2400 },
  { name: 'Legend', xp: 3500 },
  { name: 'Champion', xp: 5000 },
  { name: 'Topper', xp: 6000 }
];

function getLevelRank(levelName) {
  const index = LEVELS.findIndex(level => level.name === levelName);
  return index >= 0 ? index : 0;
}

function mergeChapterProgressValues(localValue, incomingValue) {
  const localMap = safeParseJSON(localValue, {});
  const incomingMap = safeParseJSON(incomingValue, {});
  const merged = { ...localMap };

  Object.keys(incomingMap).forEach(key => {
    merged[key] = !!(localMap[key] || incomingMap[key]);
  });

  return JSON.stringify(merged);
}

function mergeDailyLogValues(localValue, incomingValue) {
  const localEntries = safeParseJSON(localValue, []);
  const incomingEntries = safeParseJSON(incomingValue, []);
  const deduped = new Map();

  localEntries.concat(incomingEntries).forEach(entry => {
    if (!entry || typeof entry !== 'object') return;
    const normalized = normalizeDailyEntry(entry);
    const dedupeKey = [
      normalized.date,
      normalized.subject,
      normalized.hours,
      normalized.notes,
      normalized.time
    ].join('|');
    if (!deduped.has(dedupeKey)) deduped.set(dedupeKey, normalized);
  });

  return JSON.stringify(Array.from(deduped.values()).sort(compareLogEntriesDesc));
}

function mergeNumericValues(localValue, incomingValue) {
  const localNumber = parseInt(localValue || '0', 10);
  const incomingNumber = parseInt(incomingValue || '0', 10);
  return String(Math.max(localNumber, incomingNumber));
}

function mergeDateValues(localValue, incomingValue) {
  const left = String(localValue || '');
  const right = String(incomingValue || '');
  return left > right ? left : right;
}

function mergeLevelValues(localValue, incomingValue) {
  const left = String(localValue || 'Beginner');
  const right = String(incomingValue || 'Beginner');
  return getLevelRank(left) >= getLevelRank(right) ? left : right;
}

function mergeQuestValues(key, localValue, incomingValue) {
  if (key === 'quest_migration_done' || key.includes('quest_xp_awarded_')) {
    return (localValue === 'yes' || incomingValue === 'yes') ? 'yes' : String(incomingValue || localValue || '');
  }
  return mergeNumericValues(localValue, incomingValue);
}

function mergeStorageValue(key, localValue, incomingValue) {
  if (localValue == null) return incomingValue;
  if (incomingValue == null) return localValue;
  if (localValue === incomingValue) return localValue;

  if (key === RESET_FLAG_KEY) {
    return (localValue === 'yes' || incomingValue === 'yes') ? 'yes' : 'no';
  }
  if (key === STORAGE_KEYS.chapterProgress) return mergeChapterProgressValues(localValue, incomingValue);
  if (key === STORAGE_KEYS.dailyLog) return mergeDailyLogValues(localValue, incomingValue);
  if (key === STORAGE_KEYS.xp) return mergeNumericValues(localValue, incomingValue);
  if (key === STORAGE_KEYS.streak) return mergeNumericValues(localValue, incomingValue);
  if (key === STORAGE_KEYS.lastDate) return mergeDateValues(localValue, incomingValue);
  if (key === STORAGE_KEYS.prevLevel) return mergeLevelValues(localValue, incomingValue);
  if (key.startsWith('quest_')) return mergeQuestValues(key, localValue, incomingValue);

  return incomingValue;
}

function mergeStorageMaps(localMap, incomingMap) {
  const merged = {};
  const allKeys = new Set([
    ...Object.keys(localMap || {}),
    ...Object.keys(incomingMap || {})
  ]);

  allKeys.forEach(key => {
    if (!isSyncableStorageKey(key)) return;
    const mergedValue = mergeStorageValue(key, localMap ? localMap[key] : null, incomingMap ? incomingMap[key] : null);
    if (mergedValue != null) merged[key] = mergedValue;
  });

  return merged;
}

function createProgressBackupPayload() {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    storage: collectSyncableStorage()
  };
}

function downloadProgressBackup() {
  const payload = JSON.stringify(createProgressBackupPayload(), null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const link = document.createElement('a');
  const stamp = formatDate(new Date());
  link.href = URL.createObjectURL(blob);
  link.download = `study-portal-backup-${stamp}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

function extractBackupStorageMap(parsed) {
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Backup file is empty or invalid.');
  }

  if (parsed.storage && typeof parsed.storage === 'object') {
    return parsed.storage;
  }

  const directMap = {};
  Object.keys(parsed).forEach(key => {
    if (isSyncableStorageKey(key)) directMap[key] = parsed[key];
  });

  if (Object.keys(directMap).length) return directMap;
  throw new Error('Backup file does not contain study progress data.');
}

async function importProgressBackupText(text, options) {
  const parsed = JSON.parse(text);
  const incomingMap = extractBackupStorageMap(parsed);
  const mergeMode = !options || options.merge !== false;
  const pushAfterImport = !options || options.pushAfterImport !== false;
  const currentMap = collectSyncableStorage();
  const finalMap = mergeMode ? mergeStorageMaps(currentMap, incomingMap) : incomingMap;

  applySyncableStorage(finalMap);
  touchLocalState('backup-import');

  if (pushAfterImport && syncState.enabled) {
    await pushProgressToCloud();
  }

  return {
    importedKeys: Object.keys(finalMap).length
  };
}

async function importProgressBackupFile(file, options) {
  if (!file) throw new Error('Choose a backup file first.');
  const text = await file.text();
  return importProgressBackupText(text, options);
}

function getPreferredDeviceLabel() {
  return getRawLocalValue(SYNC_META_KEYS.deviceLabel) || '';
}

function setPreferredDeviceLabel(label) {
  const clean = String(label || '').trim();
  if (clean) setRawLocalValue(SYNC_META_KEYS.deviceLabel, clean);
  else removeRawLocalValue(SYNC_META_KEYS.deviceLabel);
  broadcastSyncState();
}

function getCurrentDeviceLabel() {
  const preferred = getPreferredDeviceLabel();
  if (preferred) return preferred;
  const host = window.location.hostname || 'browser';
  return `Device on ${host}`;
}

function installStorageSyncHooks() {
  Storage.prototype.setItem = function patchedSetItem(key, value) {
    storageBridge.setItem.call(this, key, value);
    if (this === localStorage && !syncState.suppressTracking && isSyncableStorageKey(key)) {
      touchLocalState(`set:${key}`);
    }
  };

  Storage.prototype.removeItem = function patchedRemoveItem(key) {
    storageBridge.removeItem.call(this, key);
    if (this === localStorage && !syncState.suppressTracking && isSyncableStorageKey(key)) {
      touchLocalState(`remove:${key}`);
    }
  };

  Storage.prototype.clear = function patchedClear() {
    const hadSyncableData = Object.keys(collectSyncableStorage()).length > 0;
    storageBridge.clear.call(this);
    if (this === localStorage && !syncState.suppressTracking && hadSyncableData) {
      touchLocalState('clear');
    }
  };
}

async function loadExternalScript(url) {
  if (syncState.scriptCache[url]) return syncState.scriptCache[url];

  syncState.scriptCache[url] = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-study-portal-src="${url}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error(`Failed to load ${url}`)));
      return;
    }

    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.dataset.studyPortalSrc = url;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${url}`));
    document.head.appendChild(script);
  });

  return syncState.scriptCache[url];
}

async function loadCloudConfig() {
  if (window.STUDY_PORTAL_CLOUD_CONFIG) return window.STUDY_PORTAL_CLOUD_CONFIG;

  try {
    await loadExternalScript(`${APP_ASSET_BASE}cloud-config.js`);
  } catch (err) {
    return null;
  }

  return window.STUDY_PORTAL_CLOUD_CONFIG || null;
}

async function loadFirebaseCompat() {
  await loadExternalScript(`https://www.gstatic.com/firebasejs/${FIREBASE_COMPAT_VERSION}/firebase-app-compat.js`);
  await loadExternalScript(`https://www.gstatic.com/firebasejs/${FIREBASE_COMPAT_VERSION}/firebase-auth-compat.js`);
  await loadExternalScript(`https://www.gstatic.com/firebasejs/${FIREBASE_COMPAT_VERSION}/firebase-firestore-compat.js`);
}

function extractRemoteStorageMap(docData) {
  if (!docData || typeof docData !== 'object') return {};
  if (docData.storage && typeof docData.storage === 'object') return docData.storage;
  return {};
}

async function writeStorageMapToCloud(storageMap, reason) {
  if (!syncState.docRef || !syncState.user) {
    throw new Error('Sign in on the Sync page before pushing progress to the cloud.');
  }

  const payload = {
    storage: storageMap,
    version: 1,
    updatedAtMs: Date.now(),
    updatedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
    updatedBy: getCurrentDeviceLabel(),
    updatedByEmail: syncState.user.email || '',
    reason: reason || 'sync'
  };

  syncState.saveInFlight = syncState.docRef.set(payload, { merge: true });
  await syncState.saveInFlight;
  syncState.lastCloudUpdatedAt = payload.updatedAtMs;
  syncState.saveInFlight = null;
  setSyncState('synced', 'Cloud sync complete.');
}

function scheduleCloudSave(reason) {
  if (!syncState.enabled || !syncState.docRef) return;

  if (syncState.saveTimer) clearTimeout(syncState.saveTimer);
  setSyncState('syncing', 'Saving progress to the cloud...');

  syncState.saveTimer = setTimeout(() => {
    const snapshot = collectSyncableStorage();
    writeStorageMapToCloud(snapshot, reason || 'autosave').catch(err => {
      setSyncState('error', err.message || 'Cloud save failed.');
    });
  }, 500);
}

function maybeReloadAfterInitialCloudApply() {
  const reloadKey = `studyportal_sync_reload_once:${window.location.pathname}`;
  if (sessionStorage.getItem(reloadKey) === 'yes') {
    broadcastDataChanged('cloud-apply');
    return;
  }
  sessionStorage.setItem(reloadKey, 'yes');
  window.location.reload();
}

async function handleRemoteStorage(docData, source) {
  const remoteMap = extractRemoteStorageMap(docData);
  const localMap = collectSyncableStorage();
  const remoteCount = Object.keys(remoteMap).length;
  const localCount = Object.keys(localMap).length;

  if (!remoteCount && localCount) {
    await writeStorageMapToCloud(localMap, `${source || 'sync'}-initial-push`);
    return;
  }

  if (!remoteCount) {
    setSyncState('connected', 'Cloud account connected. No remote progress yet.');
    return;
  }

  const merged = localCount ? mergeStorageMaps(localMap, remoteMap) : remoteMap;
  const localChanged = !sameStorageMaps(localMap, merged);
  const remoteChanged = !sameStorageMaps(remoteMap, merged);

  if (localChanged) {
    applySyncableStorage(merged);
  }

  if (remoteChanged) {
    await writeStorageMapToCloud(merged, `${source || 'sync'}-merge`);
  } else {
    setSyncState('synced', localChanged ? 'Cloud progress downloaded to this device.' : 'Cloud sync complete.');
  }

  if (source === 'initial' && localChanged) {
    maybeReloadAfterInitialCloudApply();
  }
}

function subscribeToLiveCloudUpdates() {
  if (!syncState.docRef) return;
  if (syncState.unsubscribeDoc) syncState.unsubscribeDoc();

  syncState.unsubscribeDoc = syncState.docRef.onSnapshot(snapshot => {
    if (!syncState.initialSyncComplete || !snapshot.exists) return;
    const docData = snapshot.data() || {};
    const remoteMap = extractRemoteStorageMap(docData);
    const localMap = collectSyncableStorage();
    const updatedAtMs = Number(docData.updatedAtMs || 0);

    if (updatedAtMs && updatedAtMs <= syncState.lastCloudUpdatedAt && sameStorageMaps(localMap, remoteMap)) {
      return;
    }

    syncState.lastCloudUpdatedAt = Math.max(syncState.lastCloudUpdatedAt, updatedAtMs);

    if (!sameStorageMaps(localMap, remoteMap)) {
      const merged = mergeStorageMaps(localMap, remoteMap);
      const remoteNeedsFix = !sameStorageMaps(remoteMap, merged);

      applySyncableStorage(merged, { replaceMissing: true });
      if (remoteNeedsFix) {
        writeStorageMapToCloud(merged, 'live-merge').catch(err => {
          setSyncState('error', err.message || 'Cloud merge failed.');
        });
      }
    }
  }, err => {
    setSyncState('error', err.message || 'Live cloud updates stopped.');
  });
}

async function handleSignedInUser(user) {
  syncState.user = user;
  syncState.enabled = true;
  syncState.initialSyncComplete = false;
  syncState.docRef = syncState.db
    .collection(syncState.config.collectionName || 'studyPortalProfiles')
    .doc(user.uid);

  setSyncState('connecting', 'Connected account found. Syncing progress...');

  const snapshot = await syncState.docRef.get();
  if (snapshot.exists) {
    const docData = snapshot.data() || {};
    syncState.lastCloudUpdatedAt = Number(docData.updatedAtMs || 0);
    await handleRemoteStorage(docData, 'initial');
  } else {
    const localMap = collectSyncableStorage();
    if (Object.keys(localMap).length) {
      await writeStorageMapToCloud(localMap, 'initial-create');
    } else {
      setSyncState('connected', 'Cloud account connected. Start using the portal and progress will sync.');
    }
  }

  syncState.initialSyncComplete = true;
  subscribeToLiveCloudUpdates();
  broadcastSyncState();
}

async function handleSignedOutUser() {
  syncState.user = null;
  syncState.docRef = null;
  syncState.enabled = false;
  syncState.initialSyncComplete = false;
  syncState.lastCloudUpdatedAt = 0;
  if (syncState.unsubscribeDoc) {
    syncState.unsubscribeDoc();
    syncState.unsubscribeDoc = null;
  }
  setSyncState('needs-auth', 'Sign in on the Sync page to share progress across devices.');
}

async function initializeCloudSync() {
  if (syncState.bootstrapPromise) return syncState.bootstrapPromise;

  syncState.bootstrapPromise = (async () => {
    const config = await loadCloudConfig();
    syncState.config = config;

    if (!config || !config.firebase || !config.firebase.apiKey || !config.firebase.projectId) {
      syncState.bootstrapped = true;
      setSyncState('local-only', 'Cloud sync is not configured yet. Local progress still works.');
      return syncState;
    }

    try {
      await loadFirebaseCompat();
      const app = window.firebase.apps.length
        ? window.firebase.app()
        : window.firebase.initializeApp(config.firebase);

      syncState.auth = window.firebase.auth(app);
      syncState.db = window.firebase.firestore(app);
      syncState.db.settings({
        experimentalForceLongPolling: true
      });

      await syncState.auth.setPersistence(window.firebase.auth.Auth.Persistence.LOCAL);
      syncState.auth.onAuthStateChanged(user => {
        if (user) {
          handleSignedInUser(user).catch(err => {
            setSyncState('error', err.message || 'Cloud sync failed.');
          });
        } else {
          handleSignedOutUser().catch(err => {
            setSyncState('error', err.message || 'Cloud sign-out failed.');
          });
        }
      });

      syncState.bootstrapped = true;
      setSyncState('needs-auth', 'Cloud sync is configured. Sign in on the Sync page to connect devices.');
    } catch (err) {
      syncState.bootstrapped = true;
      setSyncState('error', err.message || 'Cloud sync could not be started.');
    }

    return syncState;
  })();

  return syncState.bootstrapPromise;
}

async function signInStudyPortalCloud(email, password) {
  await initializeCloudSync();
  if (!syncState.auth) throw new Error('Cloud sync is not configured yet.');
  await syncState.auth.signInWithEmailAndPassword(String(email || '').trim(), String(password || ''));
}

async function registerStudyPortalCloud(email, password) {
  await initializeCloudSync();
  if (!syncState.auth) throw new Error('Cloud sync is not configured yet.');
  await syncState.auth.createUserWithEmailAndPassword(String(email || '').trim(), String(password || ''));
}

async function signOutStudyPortalCloud() {
  await initializeCloudSync();
  if (!syncState.auth) return;
  await syncState.auth.signOut();
}

async function pushProgressToCloud() {
  await initializeCloudSync();
  if (!syncState.enabled || !syncState.docRef) {
    throw new Error('Sign in first on the Sync page.');
  }
  if (syncState.saveTimer) {
    clearTimeout(syncState.saveTimer);
    syncState.saveTimer = null;
  }
  await writeStorageMapToCloud(collectSyncableStorage(), 'manual-push');
}

async function pullProgressFromCloud() {
  await initializeCloudSync();
  if (!syncState.enabled || !syncState.docRef) {
    throw new Error('Sign in first on the Sync page.');
  }
  setSyncState('syncing', 'Pulling cloud progress...');
  const snapshot = await syncState.docRef.get();
  if (!snapshot.exists) {
    setSyncState('connected', 'Cloud account connected. No remote progress found.');
    return;
  }
  const docData = snapshot.data() || {};
  syncState.lastCloudUpdatedAt = Number(docData.updatedAtMs || 0);
  await handleRemoteStorage(docData, 'manual-pull');
}

function getCloudSyncState() {
  return {
    status: syncState.status,
    message: syncState.message,
    configured: !!(syncState.config && syncState.config.firebase && syncState.config.firebase.projectId),
    signedIn: !!syncState.user,
    email: syncState.user ? (syncState.user.email || '') : '',
    uid: syncState.user ? syncState.user.uid : '',
    deviceLabel: getCurrentDeviceLabel(),
    localUpdatedAt: getLocalUpdatedAt(),
    cloudUpdatedAt: syncState.lastCloudUpdatedAt,
    localKeys: Object.keys(collectSyncableStorage()).length
  };
}

/* ---------- Launch-day auto-reset ---------- */
function checkLaunchReset() {
  const today = formatDate(new Date());
  const alreadyReset = localStorage.getItem(RESET_FLAG_KEY);
  if (today >= LAUNCH_DATE && alreadyReset !== 'yes') {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    localStorage.setItem(RESET_FLAG_KEY, 'yes');
    console.log('Launch day reset complete.');
    return true;
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
  if (done) awardXP(0, true);
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
    .filter(id => id.startsWith('math-') && progress[id]).length;
  const daily = getDailyLog();
  const totalHours = daily.reduce((sum, entry) => sum + Number(entry.hours || 0), 0);
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
    .filter(id => id.startsWith('sci-') && progress[id]).length;
  return {
    doneScience,
    totalScienceChapters,
    percent: Math.round((doneScience / totalScienceChapters) * 100)
  };
}

function calculateSubjectStats(prefix, total) {
  const progress = getChapterProgress();
  const done = Object.keys(progress)
    .filter(id => id.startsWith(`${prefix}-`) && progress[id]).length;
  return {
    done,
    total,
    percent: total > 0 ? Math.round((done / total) * 100) : 0
  };
}

/* ---------- Date Utilities ---------- */
function weekdaysBetween(startDate, endDate) {
  const dates = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
    const weekday = day.getDay();
    if (weekday !== 0 && weekday !== 6) dates.push(new Date(day));
  }
  return dates;
}

function formatDate(date) {
  const value = new Date(date);
  const yyyy = value.getFullYear();
  const mm = String(value.getMonth() + 1).padStart(2, '0');
  const dd = String(value.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function friendlyDate(date) {
  const value = new Date(date);
  return value.toLocaleDateString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/* ---------- Answer Checking ---------- */
function normalizeAnswer(value) {
  return String(value || '').toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[.,]/g, '')
    .replace(/√/g, 'sqrt')
    .replace(/\^/g, '');
}

function checkTypedAnswer(inputId, expectedAnswers, feedbackId, solutionId) {
  const inputEl = document.getElementById(inputId);
  const feedbackEl = document.getElementById(feedbackId);
  const solutionEl = document.getElementById(solutionId);
  if (!inputEl || !feedbackEl || !solutionEl) return;

  const typed = normalizeAnswer(inputEl.value);
  if (!typed) {
    feedbackEl.textContent = 'Enter your answer first, then click check.';
    feedbackEl.className = 'feedback retry';
    return;
  }

  const valid = expectedAnswers.split('|')
    .map(answer => normalizeAnswer(answer))
    .includes(typed);

  if (valid) {
    feedbackEl.textContent = 'Correct ✅ Great work. Now review full steps.';
    feedbackEl.className = 'feedback ok';
    solutionEl.classList.remove('hidden');
  } else {
    feedbackEl.textContent = 'Not fully correct yet. Try once more or reveal steps.';
    feedbackEl.className = 'feedback retry';
  }
}

function revealSolution(solutionId) {
  const element = document.getElementById(solutionId);
  if (element) element.classList.remove('hidden');
}

/* ========== GAMIFICATION ENGINE ========== */
function getXP() {
  return parseInt(localStorage.getItem(STORAGE_KEYS.xp) || '0', 10);
}

function setXP(value) {
  localStorage.setItem(STORAGE_KEYS.xp, String(value));
}

function getStreak() {
  return parseInt(localStorage.getItem(STORAGE_KEYS.streak) || '0', 10);
}

function setStreak(value) {
  localStorage.setItem(STORAGE_KEYS.streak, String(value));
}

function getLevelForXP(xp) {
  let levelName = LEVELS[0].name;
  for (const level of LEVELS) {
    if (xp >= level.xp) levelName = level.name;
    else break;
  }
  return levelName;
}

function getNextLevel(xp) {
  for (const level of LEVELS) {
    if (xp < level.xp) return level;
  }
  return LEVELS[LEVELS.length - 1];
}

function updateStreak(dateStr) {
  const last = localStorage.getItem(STORAGE_KEYS.lastDate);
  const today = dateStr || formatDate(new Date());

  if (last === today) return;

  if (last) {
    const previous = new Date(last);
    const current = new Date(today);
    const diff = Math.round((current - previous) / 86400000);
    if (diff === 1) setStreak(getStreak() + 1);
    else if (diff > 1) setStreak(1);
  } else {
    setStreak(1);
  }

  localStorage.setItem(STORAGE_KEYS.lastDate, today);
}

function awardXP(hours, isChapter) {
  let base = 0;
  if (isChapter) base = 25;
  if (hours > 0) base += Math.round(hours * 10);

  const streak = getStreak();
  let multiplier = 1;
  if (streak >= 7) multiplier = 1.5;
  else if (streak >= 3) multiplier = 1.2;

  const gained = Math.round(base * multiplier);
  setXP(getXP() + gained);
  return gained;
}

/* ---------- Quest XP ---------- */
function awardQuestXP(questId, xpAmount) {
  const weekKey = getWeekKey();
  const flagKey = `quest_xp_awarded_${weekKey}_${questId}`;
  if (localStorage.getItem(flagKey) === 'yes') return 0;
  localStorage.setItem(flagKey, 'yes');
  setXP(getXP() + xpAmount);
  return xpAmount;
}

/* ---------- Week Key (Monday date of current week) ---------- */
function getWeekKey() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  return formatDate(monday);
}

function getXPData() {
  const xp = getXP();
  const streak = getStreak();
  const level = getLevelForXP(xp);
  const next = getNextLevel(xp);
  const currentLevel = LEVELS.find(item => item.name === level) || LEVELS[0];

  let xpProgress = 100;
  if (next.name !== level) {
    const range = next.xp - currentLevel.xp;
    const done = xp - currentLevel.xp;
    xpProgress = Math.min(100, Math.round((done / range) * 100));
  }

  const previousLevel = localStorage.getItem(STORAGE_KEYS.prevLevel) || 'Beginner';
  const justLeveledUp = level !== previousLevel;
  localStorage.setItem(STORAGE_KEYS.prevLevel, level);

  return { xp, streak, level, xpProgress, justLeveledUp };
}

/* ---------- Confetti ---------- */
function launchConfetti() {
  const colors = ['#8b5cf6', '#06b6d4', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'];
  for (let i = 0; i < 60; i += 1) {
    const element = document.createElement('div');
    element.className = 'confetti-piece';
    element.style.left = `${Math.random() * 100}vw`;
    element.style.background = colors[Math.floor(Math.random() * colors.length)];
    element.style.animationDelay = `${Math.random() * 1.5}s`;
    element.style.width = `${6 + Math.random() * 8}px`;
    element.style.height = `${6 + Math.random() * 8}px`;
    document.body.appendChild(element);
    setTimeout(() => element.remove(), 3500);
  }
}

/* ---------- Global Exports ---------- */
window.downloadProgressBackup = downloadProgressBackup;
window.importProgressBackupFile = importProgressBackupFile;
window.importProgressBackupText = importProgressBackupText;
window.getCloudSyncState = getCloudSyncState;
window.setPreferredDeviceLabel = setPreferredDeviceLabel;
window.getPreferredDeviceLabel = getPreferredDeviceLabel;
window.signInStudyPortalCloud = signInStudyPortalCloud;
window.registerStudyPortalCloud = registerStudyPortalCloud;
window.signOutStudyPortalCloud = signOutStudyPortalCloud;
window.pushProgressToCloud = pushProgressToCloud;
window.pullProgressFromCloud = pullProgressFromCloud;

window.studyPortalCloud = {
  initialize: initializeCloudSync,
  getState: getCloudSyncState,
  exportBackup: downloadProgressBackup,
  importBackupFile: importProgressBackupFile,
  signIn: signInStudyPortalCloud,
  register: registerStudyPortalCloud,
  signOut: signOutStudyPortalCloud,
  push: pushProgressToCloud,
  pull: pullProgressFromCloud,
  setDeviceLabel: setPreferredDeviceLabel
};

installStorageSyncHooks();
checkLaunchReset();
initializeCloudSync();
