import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser, sendPhoneOTP, confirmPhoneOTP } from "@services/auth";
import { APP_NAME } from "@utils/constants";

export default function RegisterPage() {
  const navigate = useNavigate();

  // Shared
  const [authMode, setAuthMode] = useState("email"); // "email" | "phone"
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Email-specific
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Phone-specific
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const recaptchaContainerRef = useRef(null);
  const recaptchaVerifierRef = useRef(null);

  // ── Email Registration ──────────────────────────────────────
  async function handleEmailSubmit(e) {
    e.preventDefault();
    if (password.length < 6) { setError("كلمة المرور يجب أن تكون ٦ أحرف على الأقل"); return; }
    setError("");
    setLoading(true);
    try {
      await registerUser(email, password, name);
      navigate("/dashboard");
    } catch (err) {
      const code = err.code || "";
      if (code === "auth/email-already-in-use") {
        setError("هذا البريد الإلكتروني مسجّل من قبل. جرّب تسجيل الدخول بدلاً من ذلك.");
      } else if (code === "auth/invalid-email") {
        setError("صيغة البريد الإلكتروني غير صحيحة. مثال: name@email.com");
      } else if (code === "auth/weak-password") {
        setError("كلمة المرور ضعيفة. استخدم ٦ أحرف على الأقل مع أرقام.");
      } else {
        setError("حدث خطأ غير متوقع. حاول مرة ثانية.");
      }
    }
    setLoading(false);
  }

  // ── Phone: Send OTP ─────────────────────────────────────────
  async function handleSendOTP(e) {
    e.preventDefault();
    if (!name.trim()) { setError("أدخل اسم ولي الأمر"); return; }
    if (!phone.trim()) { setError("أدخل رقم الجوال"); return; }
    setError("");
    setLoading(true);
    try {
      if (recaptchaVerifierRef.current) {
        try { recaptchaVerifierRef.current.clear(); } catch (_) {}
        recaptchaVerifierRef.current = null;
      }
      const { confirmationResult: cr, recaptchaVerifier: rv } = await sendPhoneOTP(
        phone,
        recaptchaContainerRef.current
      );
      recaptchaVerifierRef.current = rv;
      setConfirmationResult(cr);
      setOtpSent(true);
    } catch (err) {
      if (recaptchaVerifierRef.current) {
        try { recaptchaVerifierRef.current.clear(); } catch (_) {}
        recaptchaVerifierRef.current = null;
      }
      const code = err.code || "";
      if (code === "auth/operation-not-allowed") {
        setError("خاصية التحقق برقم الجوال غير مفعّلة حالياً. يُرجى التسجيل بالبريد الإلكتروني أو التواصل مع الدعم.");
      } else if (code === "auth/invalid-phone-number") {
        setError("رقم الجوال غير صحيح. أدخل رقم سعودي صحيح (مثال: 0512345678).");
      } else if (code === "auth/too-many-requests") {
        setError("تم تجاوز عدد المحاولات. انتظر قليلاً وحاول مرة أخرى.");
      } else {
        setError("تعذر إرسال رمز التحقق. تأكد من الرقم وحاول مرة أخرى.");
      }
    }
    setLoading(false);
  }

  // ── Phone: Confirm OTP ──────────────────────────────────────
  async function handleConfirmOTP(e) {
    e.preventDefault();
    if (!otpCode.trim()) { setError("أدخل رمز التحقق"); return; }
    setError("");
    setLoading(true);
    try {
      await confirmPhoneOTP(confirmationResult, otpCode, name);
      navigate("/dashboard");
    } catch (err) {
      const code = err.code || "";
      if (code === "auth/invalid-verification-code") {
        setError("رمز التحقق غير صحيح. تأكد من الرقم وأعد المحاولة.");
      } else if (code === "auth/code-expired") {
        setError("انتهت صلاحية رمز التحقق. اطلب رمزاً جديداً.");
      } else {
        setError("حدث خطأ. حاول مرة أخرى.");
      }
    }
    setLoading(false);
  }

  function switchMode(mode) {
    setAuthMode(mode);
    setError("");
    setOtpSent(false);
    setOtpCode("");
    setConfirmationResult(null);
    if (recaptchaVerifierRef.current) {
      try { recaptchaVerifierRef.current.clear(); } catch (_) {}
      recaptchaVerifierRef.current = null;
    }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3 bg-hero">
      {/* Invisible reCAPTCHA container for phone auth */}
      <div ref={recaptchaContainerRef} id="recaptcha-container" />

      <div style={{ width: "100%", maxWidth: 440 }}>
        <div className="text-center mb-4">
          <div style={{ fontSize: "3rem" }}>🎮</div>
          <h1 className="f-display fs-3">حساب جديد</h1>
          <p className="f-body text-c-light">انضم لـ {APP_NAME} مجاناً</p>
        </div>

        {/* Mode selector tabs */}
        <div className="d-flex rounded-3 mb-4 p-1" style={{ background: "rgba(108,92,231,0.08)", gap: 4 }}>
          {[
            { id: "email", label: "📧 بريد إلكتروني" },
            { id: "phone", label: "📱 رقم الجوال" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => switchMode(tab.id)}
              className="flex-grow-1 f-display small border-0"
              style={{
                padding: "0.5rem 0",
                borderRadius: "0.75rem",
                background: authMode === tab.id ? "#fff" : "transparent",
                color: authMode === tab.id ? "var(--c-primary)" : "var(--c-text-light)",
                boxShadow: authMode === tab.id ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.2s",
                cursor: "pointer",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="card shadow border-c p-4">
          {error && <div className="alert alert-danger f-body small py-2">{error}</div>}

          {/* ── Email Form ── */}
          {authMode === "email" && (
            <form onSubmit={handleEmailSubmit}>
              <div className="mb-3">
                <label className="form-label f-body small">اسم ولي الأمر</label>
                <input type="text" className="form-control rounded-3 border-c" value={name}
                  onChange={(e) => setName(e.target.value)} placeholder="مثال: أحمد محمد" required />
              </div>
              <div className="mb-3">
                <label className="form-label f-body small">البريد الإلكتروني</label>
                <input type="email" className="form-control rounded-3 border-c" value={email}
                  onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" required dir="ltr" />
              </div>
              <div className="mb-4">
                <label className="form-label f-body small">كلمة المرور</label>
                <input type="password" className="form-control rounded-3 border-c" value={password}
                  onChange={(e) => setPassword(e.target.value)} placeholder="٦ أحرف على الأقل" required dir="ltr" />
              </div>
              <button type="submit" className="btn btn-primary w-100 btn-lg" disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                إنشاء حساب
              </button>
            </form>
          )}

          {/* ── Phone: Enter Number ── */}
          {authMode === "phone" && !otpSent && (
            <form onSubmit={handleSendOTP}>
              <div className="mb-3">
                <label className="form-label f-body small">اسم ولي الأمر</label>
                <input type="text" className="form-control rounded-3 border-c" value={name}
                  onChange={(e) => setName(e.target.value)} placeholder="مثال: أحمد محمد" required />
              </div>
              <div className="mb-4">
                <label className="form-label f-body small">رقم الجوال</label>
                <input type="tel" className="form-control rounded-3 border-c" value={phone}
                  onChange={(e) => setPhone(e.target.value)} placeholder="05XXXXXXXX" required dir="ltr" />
                <small className="text-c-light">سيتم إرسال رمز تحقق SMS لهذا الرقم</small>
              </div>
              <button type="submit" className="btn btn-primary w-100 btn-lg" disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                إرسال رمز التحقق 📲
              </button>
            </form>
          )}

          {/* ── Phone: Enter OTP ── */}
          {authMode === "phone" && otpSent && (
            <form onSubmit={handleConfirmOTP}>
              <div className="text-center mb-4">
                <div style={{ fontSize: "2.5rem" }}>📲</div>
                <p className="f-body small text-c-light mt-2 mb-0">
                  تم إرسال رمز التحقق إلى
                </p>
                <strong className="f-display" dir="ltr">{phone}</strong>
              </div>
              <div className="mb-4">
                <label className="form-label f-body small">رمز التحقق (6 أرقام)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  className="form-control rounded-3 border-c text-center f-display fs-4"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="------"
                  required
                  dir="ltr"
                  style={{ letterSpacing: "0.4em" }}
                />
              </div>
              <button type="submit" className="btn btn-primary w-100 btn-lg mb-3" disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                تأكيد وإنشاء الحساب ✅
              </button>
              <button type="button"
                className="btn btn-link w-100 text-c-light small text-decoration-none"
                onClick={() => { setOtpSent(false); setOtpCode(""); setError(""); }}>
                ← تغيير الرقم أو إعادة الإرسال
              </button>
            </form>
          )}

          <p className="text-center f-body small mt-3 mb-0 text-c-light">
            عندك حساب؟{" "}
            <Link to="/login" className="text-c-primary text-decoration-none fw-bold">سجّل دخول</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
