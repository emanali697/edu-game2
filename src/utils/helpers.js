/**
 * Shuffle array using Fisher-Yates algorithm
 * Used to randomize question order and option order
 */
export function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Pick N random items from array
 */
export function pickRandom(array, count) {
  return shuffleArray(array).slice(0, count);
}

/**
 * Calculate percentage (safe division)
 */
export function calcPercentage(value, total) {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Generate a unique game ID
 */
export function generateGameId() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "game_";
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

/**
 * Build the question key from subject + grade + level
 * This is the lookup key in our question registry
 */
export function buildQuestionKey(subject, grade, level = "standard") {
  return `${subject}_${grade}_${level}`;
}

/**
 * Format number to Arabic-friendly display
 */
export function formatNumber(num) {
  return num.toLocaleString("ar-SA");
}

/**
 * Get subject theme class name
 */
export function getSubjectTheme(subjectId) {
  const themes = {
    math: "theme-math",
    arabic: "theme-arabic",
    english: "theme-english",
    science: "theme-science",
  };
  return themes[subjectId] || "theme-math";
}

/**
 * Build WhatsApp share URL
 */
export function buildWhatsAppShareURL(text) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

/**
 * Delay helper for animations
 */
export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Clamp a number between min and max
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Get or create a persistent device ID stored in localStorage.
 * Used to limit a child's access link to max 3 unique devices.
 */
export function getDeviceId() {
  try {
    let id = localStorage.getItem("_edu_device_id");
    if (!id) {
      id = `dev_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem("_edu_device_id", id);
    }
    return id;
  } catch {
    return `dev_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }
}

/**
 * Generate a unique access token for child direct-play links
 * 12-char alphanumeric string
 */
export function generateAccessToken() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let token = "";
  for (let i = 0; i < 12; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}
