// ===== App-wide Constants =====

export const APP_NAME = "عالم التعلّم";
export const APP_TAGLINE = "تعلّم والعب مع أصدقائك!";
export const WEBSITE_URL = "https://edu-games.sa"; // TODO: update with real domain

// ===== Support Contact =====
export const SUPPORT_WHATSAPP = "966502527015";

// ===== Game Settings =====
export const QUESTIONS_PER_GAME = 10; // MVP: 10 per session, expandable later
export const POINTS_CORRECT = 10;
export const POINTS_BONUS_STREAK = 5; // extra points for consecutive correct
export const MAX_LIVES = 3;

// ===== Score Thresholds =====
export const SCORE_THRESHOLDS = {
  PERFECT: 100,
  EXCELLENT: 90,
  GOOD: 70,
  OKAY: 50,
};

// ===== Subscription Plans =====
export const PLANS = {
  TRIAL: { id: "trial", name: "تجربة مجانية", days: 7, price: 0 },
  MONTHLY: { id: "monthly", name: "شهري", days: 30, price: 29 },
  YEARLY: { id: "yearly", name: "سنوي", days: 365, price: 249 },
};

// ===== Achievement IDs =====
export const ACHIEVEMENTS = {
  FIRST_WIN: "first_win",
  PERFECT_SCORE: "perfect_score",
  TEN_CORRECT: "ten_correct",
  FIFTY_CORRECT: "fifty_correct",
  STREAK_5: "streak_5",
};

// ===== Firebase Paths =====
export const DB_PATHS = {
  USERS: "users",
  CHILDREN: "children",
  PROGRESS: "progress",
  STATS: "stats",
  ACHIEVEMENTS: "achievements",
  PAYMENTS: "payments",
  ORDERS: "orders",
  ADMIN: "admin",
  CHALLENGES: "challenges",
};
