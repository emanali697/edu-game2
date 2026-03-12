import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { loginUser } from "@services/auth";
import { APP_NAME } from "@utils/constants";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // ✅ جيب الـ redirect

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginUser(email, password);
      const isAdminEmail = email.trim().toLowerCase() === "admin@edu-games.sa";
      const redirect = searchParams.get("redirect") || (isAdminEmail ? "/admin" : "/dashboard");
      navigate(redirect);
    } catch (err) {
      const code = err.code || "";
      if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة. تأكد من البيانات وحاول مرة ثانية.");
      } else if (code === "auth/invalid-email") {
        setError("صيغة البريد الإلكتروني غير صحيحة. مثال: name@email.com");
      } else if (code === "auth/too-many-requests") {
        setError("تم تجاوز عدد المحاولات. انتظر قليلاً وحاول مرة ثانية.");
      } else {
        setError("حدث خطأ غير متوقع. حاول مرة ثانية.");
      }
    }
    setLoading(false);
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3 bg-hero">
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div className="text-center mb-4">
          <div style={{ fontSize: "3rem" }}>🔐</div>
          <h1 className="f-display fs-3">تسجيل الدخول</h1>
          <p className="f-body text-c-light">ادخل حسابك في {APP_NAME}</p>
        </div>

        <div className="card shadow border-c p-4">
          {error && <div className="alert alert-danger f-body small py-2">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label f-body small">البريد الإلكتروني</label>
              <input type="email" className="form-control rounded-3 border-c" value={email}
                onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" required dir="ltr" />
            </div>
            <div className="mb-4">
              <label className="form-label f-body small">كلمة المرور</label>
              <input type="password" className="form-control rounded-3 border-c" value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="********" required dir="ltr" />
            </div>
            <button type="submit" className="btn btn-primary w-100 btn-lg" disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
              دخول
            </button>
          </form>

          <p className="text-center f-body small mt-3 mb-0 text-c-light">
            ما عندك حساب؟ <Link to="/register" className="text-c-primary text-decoration-none fw-bold">سجّل الآن</Link>
          </p>
        </div>
      </div>
    </div>
  );
}