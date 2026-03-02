import app from "@services/firebaseApp";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";

const auth = getAuth(app);

/**
 * Normalize email: trim whitespace + lowercase
 * Prevents login failures from accidental spaces or case mismatches
 */
function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

export async function registerUser(email, password, displayName) {
  const cleanEmail = normalizeEmail(email);
  const result = await createUserWithEmailAndPassword(auth, cleanEmail, password);
  if (displayName) {
    await updateProfile(result.user, { displayName: displayName.trim() });
  }
  return result.user;
}

export async function loginUser(email, password) {
  const cleanEmail = normalizeEmail(email);
  const result = await signInWithEmailAndPassword(auth, cleanEmail, password);
  return result.user;
}

export async function logoutUser() {
  await signOut(auth);
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Format Saudi phone number to E.164 (+966XXXXXXXXX)
 */
function formatSaudiPhone(phone) {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("966")) return `+${cleaned}`;
  if (cleaned.startsWith("05")) return `+966${cleaned.slice(1)}`;
  if (cleaned.startsWith("5")) return `+966${cleaned}`;
  return `+966${cleaned}`;
}

/**
 * Send OTP to a Saudi phone number via Firebase Phone Auth.
 * containerElement: DOM element for the invisible reCAPTCHA.
 * Returns { confirmationResult, recaptchaVerifier }
 */
export async function sendPhoneOTP(phoneNumber, containerElement) {
  const recaptchaVerifier = new RecaptchaVerifier(auth, containerElement, {
    size: "invisible",
    callback: () => {},
  });
  const formattedPhone = formatSaudiPhone(phoneNumber);
  const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
  return { confirmationResult, recaptchaVerifier };
}

/**
 * Confirm OTP code and complete phone sign-in.
 * Sets displayName (parent name) on the Firebase user.
 */
export async function confirmPhoneOTP(confirmationResult, code, displayName) {
  const userCredential = await confirmationResult.confirm(code);
  if (displayName) {
    await updateProfile(userCredential.user, { displayName: displayName.trim() });
  }
  return userCredential.user;
}

export { auth };