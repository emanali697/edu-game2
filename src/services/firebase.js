/**
 * ===================================================================
 *  Firebase Service - Full Project Database Layer
 * ===================================================================
 *
 *  Database Structure:
 *  ├── users/{userId}/
 *  │   ├── profile     → name, email, phone, createdAt
 *  │   └── subscription → plan, status, startedAt, expiresAt
 *  │
 *  ├── children/{childId}/
 *  │   ├── info        → name, grade, avatar, parentId, createdAt
 *  │   └── settings    → difficulty, soundEnabled, etc.
 *  │
 *  ├── progress/{childId}/{sessionId}/
 *  │   → subject, grade, level, score, percentage, correctCount,
 *  │     wrongCount, totalQuestions, maxStreak, performanceLevel, playedAt
 *  │
 *  ├── stats/{childId}/
 *  │   ├── totals      → totalGamesPlayed, totalCorrect, totalWrong, bestStreak
 *  │   └── bySubject/{subject}/
 *  │       → gamesPlayed, totalCorrect, totalWrong, bestScore, avgPercentage
 *  │
 *  ├── achievements/{childId}/{achievementId}
 *  │   → unlockedAt, type
 *  │
 *  ├── payments/{userId}/{paymentId}/
 *  │   → amount, method, plan, paidAt, status, transactionId
 *  │
 *  ├── orders/{orderId}/
 *  │   → userId, childId, plan, amount, status, createdAt
 *  │
 *  ├── challenges/{challengeId}/
 *  │   ├── info        → title, description, startDate, endDate, type
 *  │   └── leaderboard/{childId} → score, childName
 *  │
 *  └── admin/
 *      └── counters    → totalUsers, totalChildren, totalGames, totalRevenue
 *
 * ===================================================================
 */

import app from "@services/firebaseApp";
import {
  getDatabase,
  ref, set, get, update, push, remove,
  query, orderByChild, limitToLast,
  equalTo, increment, serverTimestamp,
} from "firebase/database";
import { DB_PATHS } from "@utils/constants";
import { generateAccessToken } from "@utils/helpers";

let db;
let isFirebaseReady = false;

try {
  db = getDatabase(app);
  isFirebaseReady = true;
} catch (error) {
  console.warn("Firebase DB error:", error.message);
}

// ═══════════════════════════════════════════════════════════════
//  1. USERS (الأهل / المستخدمين)
// ═══════════════════════════════════════════════════════════════

/**
 * Create new user (parent)
 * @returns {string} userId
 */
export async function createUser(userData) {
  if (!db) return localFallback.save("users", userData);

  const usersRef = ref(db, DB_PATHS.USERS);
  const newRef = push(usersRef);
  const userId = newRef.key;

  await set(newRef, {
    profile: {
      name: userData.name || "",
      email: userData.email || "",
      phone: userData.phone || "",
      createdAt: new Date().toISOString(),
    },
    subscription: {
      plan: "trial",
      status: "active",
      startedAt: new Date().toISOString(),
      expiresAt: getExpiryDate("trial"),
    },
  });

  // Update admin counters
  await updateAdminCounter("totalUsers", 1);

  return userId;
}

/**
 * Get user by ID
 */
export async function getUser(userId) {
  if (!db) return localFallback.get("users", userId);
  const snapshot = await get(ref(db, `${DB_PATHS.USERS}/${userId}`));
  return snapshot.exists() ? { id: userId, ...snapshot.val() } : null;
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId, profileData) {
  if (!db) return localFallback.update("users", userId, { profile: profileData });
  await update(ref(db, `${DB_PATHS.USERS}/${userId}/profile`), profileData);
}

/**
 * Update user subscription
 */
export async function updateSubscription(userId, subscriptionData) {
  if (!db) return localFallback.update("users", userId, { subscription: subscriptionData });
  await update(ref(db, `${DB_PATHS.USERS}/${userId}/subscription`), subscriptionData);
}

/**
 * Check if subscription is active
 */
export async function isSubscriptionActive(userId) {
  if (!db) {
    const user = localFallback.get("users", userId);
    if (!user?.subscription) return false;
    return new Date(user.subscription.expiresAt) > new Date();
  }

  const snapshot = await get(ref(db, `${DB_PATHS.USERS}/${userId}/subscription`));
  if (!snapshot.exists()) return false;
  const sub = snapshot.val();
  return sub.status === "active" && new Date(sub.expiresAt) > new Date();
}

// ═══════════════════════════════════════════════════════════════
//  2. CHILDREN (الأطفال)
// ═══════════════════════════════════════════════════════════════

/**
 * Add child to a parent
 * @returns {{ childId: string, accessToken: string }}
 */
export async function addChild(parentId, childData) {
  if (!db) {
    const id = localFallback.save("children", { ...childData, parentId });
    return { childId: id, accessToken: "" };
  }

  const childrenRef = ref(db, DB_PATHS.CHILDREN);
  const newRef = push(childrenRef);
  const childId = newRef.key;

  const accessToken = generateAccessToken();

  const infoRef = ref(db, `${DB_PATHS.CHILDREN}/${childId}/info`);
  const settingsRef = ref(db, `${DB_PATHS.CHILDREN}/${childId}/settings`);

  await set(infoRef, {
    name: childData.name,
    grade: childData.grade || "",
    avatar: childData.avatar || "👦",
    parentId,
    accessToken,
    allowedSubjects: childData.allowedSubjects || ["math", "arabic", "english", "science"],
    allowedVirtues: childData.allowedVirtues || [],
    createdAt: new Date().toISOString(),
  });

  await set(settingsRef, {
    difficulty: "standard",
    soundEnabled: true,
    notificationsEnabled: true,
  });

  // Initialize empty stats
  await initChildStats(childId);
  // Update admin counters
  await updateAdminCounter("totalChildren", 1);

  return { childId, accessToken };
}

/**
 * Get child by ID
 */
export async function getChild(childId) {
  if (!db) return localFallback.get("children", childId);
  const snapshot = await get(ref(db, `${DB_PATHS.CHILDREN}/${childId}`));
  return snapshot.exists() ? { id: childId, ...snapshot.val() } : null;
}

/**
 * Get all children for a parent
 */
export async function getChildrenByParent(parentId) {
  if (!db) return localFallback.filter("children", (c) => c.parentId === parentId);

  const snapshot = await get(
    query(ref(db, DB_PATHS.CHILDREN), orderByChild("info/parentId"), equalTo(parentId))
  );

  if (!snapshot.exists()) return [];
  const data = snapshot.val();

  const children = Object.entries(data).map(([id, val]) => ({
    id,
    ...val,
    // ✅ flatten: يدعم البنيتين (nested info أو flat)
    name: val.info?.name || val.name || "",
    grade: val.info?.grade || val.grade || "",
    avatar: val.info?.avatar || val.avatar || "👦",
    parentId: val.info?.parentId || val.parentId || "",
    accessToken: val.info?.accessToken || val.accessToken || "",
    allowedSubjects: val.info?.allowedSubjects || val.allowedSubjects || ["math", "arabic", "english", "science"],
    allowedVirtues: val.info?.allowedVirtues || val.allowedVirtues || [],
  }));

  // Backfill: أطفال قديمين بدون accessToken يحصلون واحد تلقائياً
  for (const child of children) {
    if (!child.accessToken) {
      const newToken = generateAccessToken();
      child.accessToken = newToken;
      try {
        await update(ref(db, `${DB_PATHS.CHILDREN}/${child.id}/info`), { accessToken: newToken });
      } catch (e) {
        console.warn("Backfill token failed:", e);
      }
    }
  }

  return children;
}

/**
 * Update child info
 */
export async function updateChild(childId, updates) {
  if (!db) return localFallback.update("children", childId, { info: updates });
  await update(ref(db, `${DB_PATHS.CHILDREN}/${childId}/info`), updates);
}

/**
 * Update child settings (difficulty, sound, etc.)
 */
export async function updateChildSettings(childId, settings) {
  if (!db) return localFallback.update("children", childId, { settings });
  await update(ref(db, `${DB_PATHS.CHILDREN}/${childId}/settings`), settings);
}

/**
 * Delete child
 */
export async function deleteChild(childId) {
  if (!db) return localFallback.remove("children", childId);
  await remove(ref(db, `${DB_PATHS.CHILDREN}/${childId}`));
  // Optionally clean up progress, stats, achievements
  await remove(ref(db, `${DB_PATHS.PROGRESS}/${childId}`));
  await remove(ref(db, `${DB_PATHS.STATS}/${childId}`));
  await remove(ref(db, `${DB_PATHS.ACHIEVEMENTS}/${childId}`));
}

/**
 * Get child by access token (for child direct-play links)
 */
export async function getChildByAccessToken(token) {
  const cacheKey = `child_token_${token}`;

  // If offline or no db, return cached data immediately
  if (!db || !navigator.onLine) {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch { /* ignore */ }
    if (!db) return null;
    // If db exists but offline with no cache, fall through to try Firebase cache
  }

  try {
    // Race Firebase query against a timeout (5s) to avoid hanging offline
    const snapshot = await Promise.race([
      get(query(ref(db, DB_PATHS.CHILDREN), orderByChild("info/accessToken"), equalTo(token))),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 5000)),
    ]);

    if (!snapshot.exists()) return null;
    const data = snapshot.val();
    const [id, val] = Object.entries(data)[0];
    const child = {
      id,
      name: val.info?.name || "",
      grade: val.info?.grade || "",
      avatar: val.info?.avatar || "👦",
      parentId: val.info?.parentId || "",
      accessToken: val.info?.accessToken || "",
      allowedSubjects: val.info?.allowedSubjects || ["math", "arabic", "english", "science"],
      allowedVirtues: val.info?.allowedVirtues || [],
    };

    // Cache for offline use
    try { localStorage.setItem(cacheKey, JSON.stringify(child)); } catch { /* ignore */ }

    return child;
  } catch (err) {
    // Network error or timeout — try cached data
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch { /* ignore */ }
    throw err;
  }
}

// ═══════════════════════════════════════════════════════════════
//  2b. DEVICE TRACKING (تتبع الأجهزة)
// ═══════════════════════════════════════════════════════════════

/**
 * Check if a device is allowed to access a child's link.
 * Max 3 unique devices per child. If device is new and under limit, it gets registered.
 * @returns {{ allowed: boolean, isNew: boolean, count: number }}
 */
export async function checkAndRegisterDevice(childId, deviceId) {
  if (!db || !navigator.onLine) return { allowed: true, isNew: false, count: 0 };

  const devicesRef = ref(db, `${DB_PATHS.CHILDREN}/${childId}/devices`);
  const snap = await get(devicesRef);
  const devices = snap.exists() ? snap.val() : {};
  const deviceIds = Object.keys(devices);

  console.log("[Device Check] childId:", childId);
  console.log("[Device Check] deviceId:", deviceId);
  console.log("[Device Check] registered devices:", deviceIds.length, deviceIds);

  // Already registered → allow and refresh lastSeen
  if (devices[deviceId]) {
    console.log("[Device Check] device already registered → allowed");
    await update(ref(db, `${DB_PATHS.CHILDREN}/${childId}/devices/${deviceId}`), {
      lastSeenAt: new Date().toISOString(),
    });
    return { allowed: true, isNew: false, count: deviceIds.length };
  }

  // Room for a new device (max 3)
  if (deviceIds.length < 3) {
    console.log("[Device Check] new device, count < 3 → registering...");
    try {
      await set(ref(db, `${DB_PATHS.CHILDREN}/${childId}/devices/${deviceId}`), {
        addedAt: new Date().toISOString(),
        lastSeenAt: new Date().toISOString(),
      });
      console.log("[Device Check] write SUCCESS → allowed");
      return { allowed: true, isNew: true, count: deviceIds.length + 1 };
    } catch (err) {
      console.error("[Device Check] write FAILED:", err.message);
      return { allowed: false, isNew: false, count: deviceIds.length };
    }
  }

  // Max reached
  console.log("[Device Check] max devices reached → BLOCKED");
  return { allowed: false, isNew: false, count: deviceIds.length };
}

/**
 * Reset all registered devices for a child (parent action).
 * Allows the child to re-register on up to 3 new devices.
 */
export async function resetChildDevices(childId) {
  if (!db) return;
  await remove(ref(db, `${DB_PATHS.CHILDREN}/${childId}/devices`));
}

// ═══════════════════════════════════════════════════════════════
//  3. PROGRESS (نتائج الألعاب)
// ═══════════════════════════════════════════════════════════════

/**
 * Save a game session result
 * @returns {string} sessionId
 */
export async function saveGameSession(childId, sessionData) {
  if (!db) return localFallback.save(`progress_${childId}`, sessionData);

  // If offline, queue for later sync
  if (!navigator.onLine) {
    addToOfflineQueue(childId, sessionData);
    return `offline_${Date.now()}`;
  }

  const progressRef = ref(db, `${DB_PATHS.PROGRESS}/${childId}`);
  const newRef = push(progressRef);
  const sessionId = newRef.key;

  const record = {
    subject: sessionData.subject,
    grade: sessionData.grade,
    level: sessionData.level || "standard",
    score: sessionData.score,
    percentage: sessionData.percentage,
    correctCount: sessionData.correctCount,
    wrongCount: sessionData.wrongCount,
    totalQuestions: sessionData.totalQuestions,
    maxStreak: sessionData.maxStreak,
    performanceLevel: sessionData.performanceLevel,
    playedAt: sessionData.playedAt || new Date().toISOString(),
  };

  await set(newRef, record);

  // Update aggregated stats
  await updateChildStats(childId, record);
  // Update admin counter
  await updateAdminCounter("totalGames", 1);
  // Check achievements
  await checkAndUnlockAchievements(childId, record);

  return sessionId;
}

/**
 * Get all sessions for a child
 */
export async function getChildSessions(childId, limit = 50) {
  if (!db) return localFallback.getAll(`progress_${childId}`);

  const snapshot = await get(
    query(ref(db, `${DB_PATHS.PROGRESS}/${childId}`), orderByChild("playedAt"), limitToLast(limit))
  );

  if (!snapshot.exists()) return [];
  const data = snapshot.val();
  return Object.entries(data)
    .map(([id, val]) => ({ id, ...val }))
    .sort((a, b) => new Date(b.playedAt) - new Date(a.playedAt));
}

/**
 * Get sessions filtered by subject
 */
export async function getChildSessionsBySubject(childId, subject) {
  const all = await getChildSessions(childId, 200);
  return all.filter((s) => s.subject === subject);
}

/**
 * Get sessions filtered by date range (for reports)
 */
export async function getSessionsByDateRange(childId, startDate, endDate) {
  const all = await getChildSessions(childId, 500);
  const start = new Date(startDate);
  const end = new Date(endDate);
  return all.filter((s) => {
    const d = new Date(s.playedAt);
    return d >= start && d <= end;
  });
}

// ═══════════════════════════════════════════════════════════════
//  4. STATS (إحصائيات مجمّعة)
// ═══════════════════════════════════════════════════════════════

/**
 * Initialize stats for a new child
 */
async function initChildStats(childId) {
  if (!db) return;
  await set(ref(db, `${DB_PATHS.STATS}/${childId}`), {
    totals: {
      totalGamesPlayed: 0,
      totalCorrect: 0,
      totalWrong: 0,
      bestStreak: 0,
      totalScore: 0,
    },
    bySubject: {},
  });
}

/**
 * Update stats after a game session (auto-aggregation)
 */
async function updateChildStats(childId, sessionData) {
  if (!db) {
    // localStorage fallback: just save the raw session
    return;
  }

  const { subject, correctCount, wrongCount, maxStreak, score, percentage } = sessionData;

  // 1. Update totals
  const totalsRef = ref(db, `${DB_PATHS.STATS}/${childId}/totals`);
  await update(totalsRef, {
    totalGamesPlayed: increment(1),
    totalCorrect: increment(correctCount),
    totalWrong: increment(wrongCount),
    totalScore: increment(score),
  });

  // Update best streak if new record
  const statsSnap = await get(totalsRef);
  if (statsSnap.exists()) {
    const current = statsSnap.val();
    if (maxStreak > (current.bestStreak || 0)) {
      await update(totalsRef, { bestStreak: maxStreak });
    }
  }

  // 2. Update subject-specific stats
  const subjectRef = ref(db, `${DB_PATHS.STATS}/${childId}/bySubject/${subject}`);
  const subSnap = await get(subjectRef);

  if (subSnap.exists()) {
    const prev = subSnap.val();
    const newGamesPlayed = (prev.gamesPlayed || 0) + 1;
    const newAvg = Math.round(
      ((prev.avgPercentage || 0) * (prev.gamesPlayed || 0) + percentage) / newGamesPlayed
    );
    await update(subjectRef, {
      gamesPlayed: newGamesPlayed,
      totalCorrect: (prev.totalCorrect || 0) + correctCount,
      totalWrong: (prev.totalWrong || 0) + wrongCount,
      bestScore: Math.max(prev.bestScore || 0, score),
      avgPercentage: newAvg,
      lastPlayedAt: new Date().toISOString(),
    });
  } else {
    await set(subjectRef, {
      gamesPlayed: 1,
      totalCorrect: correctCount,
      totalWrong: wrongCount,
      bestScore: score,
      avgPercentage: percentage,
      lastPlayedAt: new Date().toISOString(),
    });
  }
}

/**
 * Get full stats for a child (for Parent Dashboard)
 */
export async function getChildStats(childId) {
  if (!db) return localFallback.get("stats", childId);
  const snapshot = await get(ref(db, `${DB_PATHS.STATS}/${childId}`));
  return snapshot.exists() ? snapshot.val() : null;
}

/**
 * Get stats for a specific subject
 */
export async function getChildSubjectStats(childId, subject) {
  if (!db) return null;
  const snapshot = await get(ref(db, `${DB_PATHS.STATS}/${childId}/bySubject/${subject}`));
  return snapshot.exists() ? snapshot.val() : null;
}

// ═══════════════════════════════════════════════════════════════
//  5. ACHIEVEMENTS (الإنجازات)
// ═══════════════════════════════════════════════════════════════

const ACHIEVEMENT_DEFINITIONS = {
  first_game: {
    title: "البداية الأولى",
    description: "أكمل أول لعبة",
    icon: "🎮",
    check: (stats) => stats.totals.totalGamesPlayed >= 1,
  },
  perfect_score: {
    title: "نتيجة كاملة",
    description: "احصل على 100% في لعبة",
    icon: "💯",
    check: (_, session) => session.percentage === 100,
  },
  ten_games: {
    title: "المثابر",
    description: "أكمل 10 ألعاب",
    icon: "🔟",
    check: (stats) => stats.totals.totalGamesPlayed >= 10,
  },
  fifty_games: {
    title: "البطل المتمرّس",
    description: "أكمل 50 لعبة",
    icon: "🏅",
    check: (stats) => stats.totals.totalGamesPlayed >= 50,
  },
  streak_5: {
    title: "خمس على التوالي",
    description: "5 إجابات صحيحة متتالية",
    icon: "🔥",
    check: (_, session) => session.maxStreak >= 5,
  },
  streak_10: {
    title: "عشرة على التوالي",
    description: "10 إجابات صحيحة متتالية",
    icon: "⚡",
    check: (_, session) => session.maxStreak >= 10,
  },
  math_star: {
    title: "نجم الرياضيات",
    description: "100% في 3 ألعاب رياضيات",
    icon: "🔢",
    check: (stats) => (stats.bySubject?.math?.gamesPlayed || 0) >= 3 && (stats.bySubject?.math?.avgPercentage || 0) >= 95,
  },
  arabic_star: {
    title: "نجم العربية",
    description: "100% في 3 ألعاب عربي",
    icon: "📖",
    check: (stats) => (stats.bySubject?.arabic?.gamesPlayed || 0) >= 3 && (stats.bySubject?.arabic?.avgPercentage || 0) >= 95,
  },
  english_star: {
    title: "نجم الإنجليزية",
    description: "100% في 3 ألعاب إنجليزي",
    icon: "🔤",
    check: (stats) => (stats.bySubject?.english?.gamesPlayed || 0) >= 3 && (stats.bySubject?.english?.avgPercentage || 0) >= 95,
  },
  science_star: {
    title: "نجم العلوم",
    description: "100% في 3 ألعاب علوم",
    icon: "🔬",
    check: (stats) => (stats.bySubject?.science?.gamesPlayed || 0) >= 3 && (stats.bySubject?.science?.avgPercentage || 0) >= 95,
  },
  all_subjects: {
    title: "الموسوعة",
    description: "العب في جميع المواد",
    icon: "📚",
    check: (stats) => {
      const subjects = Object.keys(stats.bySubject || {});
      return subjects.length >= 3;
    },
  },
  hundred_correct: {
    title: "مئة إجابة صحيحة",
    description: "أجب 100 إجابة صحيحة",
    icon: "✅",
    check: (stats) => stats.totals.totalCorrect >= 100,
  },
  five_hundred_correct: {
    title: "خمسمئة إجابة صحيحة",
    description: "أجب 500 إجابة صحيحة",
    icon: "🏆",
    check: (stats) => stats.totals.totalCorrect >= 500,
  },
};

/**
 * Check and unlock achievements after a game session
 */
async function checkAndUnlockAchievements(childId, sessionData) {
  if (!db) return [];

  const stats = await getChildStats(childId);
  if (!stats) return [];

  const existingSnap = await get(ref(db, `${DB_PATHS.ACHIEVEMENTS}/${childId}`));
  const existing = existingSnap.exists() ? existingSnap.val() : {};

  const newlyUnlocked = [];

  for (const [id, def] of Object.entries(ACHIEVEMENT_DEFINITIONS)) {
    if (existing[id]) continue; // Already unlocked

    try {
      if (def.check(stats, sessionData)) {
        await set(ref(db, `${DB_PATHS.ACHIEVEMENTS}/${childId}/${id}`), {
          unlockedAt: new Date().toISOString(),
          title: def.title,
          description: def.description,
          icon: def.icon,
        });
        newlyUnlocked.push({ id, ...def });
      }
    } catch (e) {
      // Skip failed checks
    }
  }

  return newlyUnlocked;
}

/**
 * Get all achievements for a child
 */
export async function getChildAchievements(childId) {
  if (!db) return localFallback.get("achievements", childId) || {};
  const snapshot = await get(ref(db, `${DB_PATHS.ACHIEVEMENTS}/${childId}`));
  return snapshot.exists() ? snapshot.val() : {};
}

/**
 * Get all achievement definitions (for showing locked ones too)
 */
export function getAllAchievementDefinitions() {
  return ACHIEVEMENT_DEFINITIONS;
}

// ═══════════════════════════════════════════════════════════════
//  6. PAYMENTS (المدفوعات)
// ═══════════════════════════════════════════════════════════════

/**
 * Record a payment
 * @returns {string} paymentId
 */
export async function recordPayment(userId, paymentData) {
  if (!db) return localFallback.save(`payments_${userId}`, paymentData);

  const paymentsRef = ref(db, `${DB_PATHS.PAYMENTS}/${userId}`);
  const newRef = push(paymentsRef);
  const paymentId = newRef.key;

  await set(newRef, {
    amount: paymentData.amount,
    method: paymentData.method || "unknown", // mada, visa, apple_pay
    plan: paymentData.plan, // monthly, yearly
    status: paymentData.status || "completed",
    transactionId: paymentData.transactionId || "",
    paidAt: new Date().toISOString(),
  });

  // Update subscription
  await updateSubscription(userId, {
    plan: paymentData.plan,
    status: "active",
    startedAt: new Date().toISOString(),
    expiresAt: getExpiryDate(paymentData.plan),
    lastPaymentId: paymentId,
  });

  // Update admin revenue counter
  await updateAdminCounter("totalRevenue", paymentData.amount);

  return paymentId;
}

/**
 * Get payment history for a user
 */
export async function getPaymentHistory(userId) {
  if (!db) return localFallback.getAll(`payments_${userId}`);
  const snapshot = await get(ref(db, `${DB_PATHS.PAYMENTS}/${userId}`));
  if (!snapshot.exists()) return [];
  const data = snapshot.val();
  return Object.entries(data)
    .map(([id, val]) => ({ id, ...val }))
    .sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt));
}

// ═══════════════════════════════════════════════════════════════
//  7. ORDERS (الطلبات - من صفحة الهبوط)
// ═══════════════════════════════════════════════════════════════

/**
 * Create a new order (e.g. from landing page CTA)
 * @returns {string} orderId
 */
export async function createOrder(orderData) {
  if (!db) return localFallback.save("orders", orderData);

  const ordersRef = ref(db, DB_PATHS.ORDERS);
  const newRef = push(ordersRef);

  await set(newRef, {
    userId: orderData.userId || "",
    childName: orderData.childName || "",
    parentName: orderData.parentName || "",
    phone: orderData.phone || "",
    email: orderData.email || "",
    plan: orderData.plan || "trial",
    amount: orderData.amount || 0,
    status: "pending",
    createdAt: new Date().toISOString(),
  });

  return newRef.key;
}

/**
 * Submit order from public order form (full data with children)
 */
export async function submitOrder(orderData) {
  if (!db) return localFallback.save("orders", orderData);

  const ordersRef = ref(db, DB_PATHS.ORDERS);
  const newRef = push(ordersRef);
  await set(newRef, {
    ...orderData,
    createdAt: new Date().toISOString(),
  });
  await updateAdminCounter("totalOrders", 1);
  return newRef.key;
}

/**
 * Update order status/stage
 */
export async function updateOrderStatus(orderId, status, extra = {}) {
  if (!db) return;
  await update(ref(db, `${DB_PATHS.ORDERS}/${orderId}`), {
    status,
    ...extra,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Update order stage with tracking data
 */
export async function updateOrderStage(orderId, stage, notes = "") {
  if (!db) return;
  const stageLog = {
    stage,
    notes,
    timestamp: new Date().toISOString(),
  };
  await update(ref(db, `${DB_PATHS.ORDERS}/${orderId}`), {
    stage,
    updatedAt: new Date().toISOString(),
  });
  // Append to stage history
  const historyRef = push(ref(db, `${DB_PATHS.ORDERS}/${orderId}/stageHistory`));
  await set(historyRef, stageLog);
}

/**
 * Add checklist item to order (for tracking sent items)
 */
export async function updateOrderChecklist(orderId, checklist) {
  if (!db) return;
  await update(ref(db, `${DB_PATHS.ORDERS}/${orderId}`), { checklist });
}

/**
 * Admin: provision children from an order (create child accounts + generate access tokens)
 * @returns {Array<{ name, childId, accessToken, link }>}
 */
export async function adminProvisionOrder(orderId, orderChildren) {
  if (!db) return [];
  const results = [];

  for (const child of orderChildren) {
    const childrenRef = ref(db, DB_PATHS.CHILDREN);
    const newRef = push(childrenRef);
    const childId = newRef.key;
    const accessToken = generateAccessToken();

    // Determine allowedSubjects / allowedVirtues from order data
    const allowedSubjects = child.subjects?.length > 0
      ? child.subjects
      : (child.path !== "tarbawi" ? ["math", "arabic", "english", "science"] : []);
    const allowedVirtues = child.virtues?.length > 0
      ? child.virtues
      : (child.path !== "academic" ? ["parental_respect", "honesty", "forgiveness", "trustworthiness", "elder_respect"] : []);

    await set(ref(db, `${DB_PATHS.CHILDREN}/${childId}/info`), {
      name: child.name,
      grade: child.grade || "",
      avatar: child.avatar || "👦",
      parentId: `order_${orderId}`,
      accessToken,
      allowedSubjects,
      allowedVirtues,
      createdAt: new Date().toISOString(),
      orderId,
    });

    await set(ref(db, `${DB_PATHS.CHILDREN}/${childId}/settings`), {
      difficulty: "standard",
      soundEnabled: true,
      notificationsEnabled: true,
    });

    await initChildStats(childId);
    await updateAdminCounter("totalChildren", 1);

    results.push({ name: child.name, childId, accessToken, link: `/child-play/${accessToken}` });
  }

  // Save generated links back to the order
  await update(ref(db, `${DB_PATHS.ORDERS}/${orderId}`), {
    provisionedChildren: results,
    provisionedAt: new Date().toISOString(),
  });

  return results;
}

// ── Admin Pricing ──

/**
 * Get admin pricing overrides
 */
export async function getAdminPricing() {
  if (!db) return null;
  const snapshot = await get(ref(db, `${DB_PATHS.ADMIN}/pricing`));
  return snapshot.exists() ? snapshot.val() : null;
}

/**
 * Save admin pricing
 */
export async function saveAdminPricing(pricingData) {
  if (!db) return;
  await set(ref(db, `${DB_PATHS.ADMIN}/pricing`), {
    ...pricingData,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Get all orders (admin)
 */
export async function getAllOrders(limit = 100) {
  if (!db) return localFallback.getAll("orders");
  const snapshot = await get(
    query(ref(db, DB_PATHS.ORDERS), orderByChild("createdAt"), limitToLast(limit))
  );
  if (!snapshot.exists()) return [];
  const data = snapshot.val();
  return Object.entries(data)
    .map(([id, val]) => ({ id, ...val }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// ═══════════════════════════════════════════════════════════════
//  8. CHALLENGES (التحديات الموسمية)
// ═══════════════════════════════════════════════════════════════

/**
 * Create a challenge (admin)
 * @returns {string} challengeId
 */
export async function createChallenge(challengeData) {
  if (!db) return localFallback.save("challenges", challengeData);

  const challengesRef = ref(db, DB_PATHS.CHALLENGES);
  const newRef = push(challengesRef);

  await set(newRef, {
    info: {
      title: challengeData.title,
      description: challengeData.description || "",
      type: challengeData.type || "score", // score, streak, games_count
      subject: challengeData.subject || "all",
      targetValue: challengeData.targetValue || 100,
      startDate: challengeData.startDate,
      endDate: challengeData.endDate,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    leaderboard: {},
  });

  return newRef.key;
}

/**
 * Get active challenges
 */
export async function getActiveChallenges() {
  if (!db) return [];
  const snapshot = await get(ref(db, DB_PATHS.CHALLENGES));
  if (!snapshot.exists()) return [];

  const now = new Date();
  const data = snapshot.val();
  return Object.entries(data)
    .map(([id, val]) => ({ id, ...val }))
    .filter((c) => c.info?.isActive && new Date(c.info.endDate) > now);
}

/**
 * Submit score to challenge leaderboard
 */
export async function submitChallengeScore(challengeId, childId, childName, score) {
  if (!db) return;

  const leaderRef = ref(db, `${DB_PATHS.CHALLENGES}/${challengeId}/leaderboard/${childId}`);
  const snap = await get(leaderRef);

  // Only update if new score is higher
  if (!snap.exists() || score > snap.val().score) {
    await set(leaderRef, {
      childName,
      score,
      updatedAt: new Date().toISOString(),
    });
  }
}

/**
 * Get challenge leaderboard
 */
export async function getChallengeLeaderboard(challengeId, limit = 20) {
  if (!db) return [];
  const snapshot = await get(ref(db, `${DB_PATHS.CHALLENGES}/${challengeId}/leaderboard`));
  if (!snapshot.exists()) return [];
  const data = snapshot.val();
  return Object.entries(data)
    .map(([childId, val]) => ({ childId, ...val }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// ═══════════════════════════════════════════════════════════════
//  9. ADMIN (إحصائيات عامة)
// ═══════════════════════════════════════════════════════════════

/**
 * Update an admin counter (internal use)
 */
async function updateAdminCounter(field, amount) {
  if (!db) return;
  try {
    await update(ref(db, `${DB_PATHS.ADMIN}/counters`), {
      [field]: increment(amount),
    });
  } catch (e) {
    console.warn("Admin counter update failed:", e.message);
  }
}

/**
 * Get admin dashboard data
 */
export async function getAdminDashboard() {
  if (!db) return null;
  const snapshot = await get(ref(db, `${DB_PATHS.ADMIN}/counters`));
  return snapshot.exists() ? snapshot.val() : {
    totalUsers: 0,
    totalChildren: 0,
    totalGames: 0,
    totalRevenue: 0,
  };
}

// ═══════════════════════════════════════════════════════════════
//  10. PARENT DASHBOARD (تقارير الأهل)
// ═══════════════════════════════════════════════════════════════

/**
 * Get full report for parent dashboard
 * Combines: children + stats + achievements + recent sessions
 */
export async function getParentReport(parentId) {
  const children = await getChildrenByParent(parentId);
  const report = [];

  for (const child of children) {
    const childId = child.id;
    const stats = await getChildStats(childId);
    const achievements = await getChildAchievements(childId);
    const recentSessions = await getChildSessions(childId, 10);

    report.push({
      child: child.info || child,
      childId,
      stats: stats || { totals: {}, bySubject: {} },
      achievements,
      recentSessions,
      achievementCount: Object.keys(achievements).length,
      totalDefinitions: Object.keys(ACHIEVEMENT_DEFINITIONS).length,
    });
  }

  return report;
}

// ═══════════════════════════════════════════════════════════════
//  BACKWARD COMPATIBILITY (saveProgress from useGame.js)
// ═══════════════════════════════════════════════════════════════

/**
 * Legacy saveProgress - now routes to saveGameSession
 * This ensures useGame.js works without changes
 */
export async function saveProgress(gameId, progressData) {
  const childId = progressData.childId || `guest_${progressData.childName || "unknown"}`;
  return saveGameSession(childId, progressData);
}

// ═══════════════════════════════════════════════════════════════
//  OFFLINE QUEUE — حفظ التقدم أوفلاين ومزامنة عند العودة
// ═══════════════════════════════════════════════════════════════

const OFFLINE_QUEUE_KEY = "offline_progress_queue";

function getOfflineQueue() {
  try {
    return JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || "[]");
  } catch { return []; }
}

function addToOfflineQueue(childId, sessionData) {
  const queue = getOfflineQueue();
  queue.push({ childId, sessionData, queuedAt: new Date().toISOString() });
  try { localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue)); } catch { /* full */ }
}

async function syncOfflineQueue() {
  const queue = getOfflineQueue();
  if (!queue.length || !db || !navigator.onLine) return;

  const remaining = [];
  for (const item of queue) {
    try {
      await saveGameSession(item.childId, item.sessionData);
    } catch {
      remaining.push(item); // keep failed items for next sync
    }
  }
  try { localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining)); } catch {}
}

// Auto-sync when coming back online
if (typeof window !== "undefined") {
  window.addEventListener("online", () => syncOfflineQueue());
  // Also try syncing on app load
  setTimeout(() => syncOfflineQueue(), 3000);
}

// ═══════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════

function getExpiryDate(plan) {
  const now = new Date();
  switch (plan) {
    case "trial": now.setDate(now.getDate() + 7); break;
    case "monthly": now.setDate(now.getDate() + 30); break;
    case "yearly": now.setDate(now.getDate() + 365); break;
    default: now.setDate(now.getDate() + 7);
  }
  return now.toISOString();
}

// ═══════════════════════════════════════════════════════════════
//  LOCAL STORAGE FALLBACK (للتطوير بدون Firebase)
// ═══════════════════════════════════════════════════════════════

const localFallback = {
  save(collection, data) {
    try {
      const id = `${collection}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const all = JSON.parse(localStorage.getItem(collection) || "{}");
      all[id] = { ...data, _createdAt: new Date().toISOString() };
      localStorage.setItem(collection, JSON.stringify(all));
      return id;
    } catch (e) {
      console.warn("localStorage save failed:", e);
      return null;
    }
  },

  get(collection, id) {
    try {
      const all = JSON.parse(localStorage.getItem(collection) || "{}");
      return all[id] || null;
    } catch (e) { return null; }
  },

  getAll(collection) {
    try {
      const all = JSON.parse(localStorage.getItem(collection) || "{}");
      return Object.entries(all).map(([id, val]) => ({ id, ...val }));
    } catch (e) { return []; }
  },

  update(collection, id, updates) {
    try {
      const all = JSON.parse(localStorage.getItem(collection) || "{}");
      all[id] = { ...(all[id] || {}), ...updates };
      localStorage.setItem(collection, JSON.stringify(all));
    } catch (e) { console.warn("localStorage update failed:", e); }
  },

  remove(collection, id) {
    try {
      const all = JSON.parse(localStorage.getItem(collection) || "{}");
      delete all[id];
      localStorage.setItem(collection, JSON.stringify(all));
    } catch (e) { console.warn("localStorage remove failed:", e); }
  },

  filter(collection, filterFn) {
    try {
      const all = JSON.parse(localStorage.getItem(collection) || "{}");
      return Object.entries(all)
        .map(([id, val]) => ({ id, ...val }))
        .filter(filterFn);
    } catch (e) { return []; }
  },
};

// ═══════════════════════════════════════════════════════════════
//  EXPORTS
// ═══════════════════════════════════════════════════════════════

export { db, app, isFirebaseReady };
