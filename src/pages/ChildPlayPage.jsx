import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getChildByAccessToken, checkAndRegisterDevice } from "@services/firebase";
import { useGameConfig } from "@context/GameContext";
import SUBJECTS from "@data/config/subjects";
import { hasQuestionSet } from "@data/questions";
import { getDeviceId } from "@utils/helpers";
import { APP_NAME } from "@utils/constants";

export default function ChildPlayPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { updateConfig } = useGameConfig();

  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [deviceBlocked, setDeviceBlocked] = useState(false);
  const [deviceChecking, setDeviceChecking] = useState(false);

  // Load child data
  useEffect(() => {
    if (!token) { setError(true); setLoading(false); return; }

    getChildByAccessToken(token)
      .then((data) => {
        if (data) setChild(data);
        else setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [token]);

  // Check device registration after child loads
  useEffect(() => {
    if (!child) return;
    setDeviceChecking(true);
    const deviceId = getDeviceId();
    checkAndRegisterDevice(child.id, deviceId)
      .then((result) => {
        if (!result.allowed) setDeviceBlocked(true);
      })
      .catch((err) => {
        console.warn("Device check failed:", err);
        setDeviceBlocked(true);
      })
      .finally(() => setDeviceChecking(false));
  }, [child]);

  // Get the subjects this child is allowed to play
  function getAllowedSubjects() {
    if (!child) return [];
    const allowed = child.allowedSubjects && child.allowedSubjects.length > 0
      ? child.allowedSubjects
      : ["math", "arabic", "english", "science"];
    return Object.values(SUBJECTS).filter((sub) => allowed.includes(sub.id));
  }

  function handleSubjectSelect(subjectId) {
    if (!child) return;
    if (!hasQuestionSet(subjectId, child.grade)) return;
    updateConfig({
      childName: child.name,
      childId: child.id,
      subject: subjectId,
      grade: child.grade,
      level: "standard",
    });
    navigate("/play");
  }

  // Auto-navigate if only 1 allowed subject
  useEffect(() => {
    if (!child || deviceChecking || deviceBlocked) return;
    const subjects = getAllowedSubjects();
    if (subjects.length === 1 && hasQuestionSet(subjects[0].id, child.grade)) {
      handleSubjectSelect(subjects[0].id);
    }
  }, [child, deviceChecking, deviceBlocked]);

  // ── Loading ──────────────────────────────────────────────────
  if (loading || deviceChecking) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" />
          <p className="text-c-light f-body">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // ── Invalid link ─────────────────────────────────────────────
  if (error || !child) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center p-3"
        style={{ background: "linear-gradient(135deg, #faf7ff 0%, #f0e6ff 50%, #e8f4fd 100%)" }}>
        <div className="text-center" style={{ maxWidth: 400 }}>
          <div style={{ fontSize: "4rem" }} className="mb-3">😕</div>
          <h2 className="f-display fs-3 mb-3">الرابط غير صالح</h2>
          <p className="text-c-light mb-4">هذا الرابط غير صحيح أو انتهت صلاحيته. اطلب من أهلك رابط جديد.</p>
          <button onClick={() => navigate("/")} className="btn btn-primary">الرئيسية</button>
        </div>
      </div>
    );
  }

  // ── Device blocked ───────────────────────────────────────────
  if (deviceBlocked) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center p-3"
        style={{ background: "linear-gradient(135deg, #faf7ff 0%, #f0e6ff 50%, #e8f4fd 100%)" }}>
        <div className="text-center" style={{ maxWidth: 420 }}>
          <div style={{ fontSize: "4rem" }} className="mb-3">🔒</div>
          <h2 className="f-display fs-3 mb-3">تم الوصول للحد الأقصى</h2>
          <p className="text-c-light mb-4">
            هذا الرابط مُفعَّل على الحد الأقصى من الأجهزة (3 أجهزة).
            اطلب من ولي الأمر إعادة ضبط الأجهزة من لوحة التحكم.
          </p>
          <button onClick={() => navigate("/")} className="btn btn-outline-secondary">الرئيسية</button>
        </div>
      </div>
    );
  }

  const allowedSubjects = getAllowedSubjects();

  // ── Subject selection (shown when 2+ subjects) ───────────────
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3"
      style={{ background: "linear-gradient(135deg, #faf7ff 0%, #f0e6ff 50%, #e8f4fd 100%)" }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        <div className="card shadow border-c p-4 p-sm-5">
          <div className="anim-fade-up text-center">
            <div className="mb-3">
              <span style={{ fontSize: "2.5rem" }}>🎮</span>
              <h1 className="f-display fs-5 mt-1 mb-0" style={{ color: "var(--c-primary)" }}>{APP_NAME}</h1>
            </div>
            <h2 className="f-display fs-3 mb-1">أهلاً يا {child.name}! 👋</h2>
            <p className="text-c-light mb-4">اختر المادة اللي تبي تلعب فيها اليوم</p>

            <div className="d-grid gap-2">
              {allowedSubjects.map((sub) => {
                const available = hasQuestionSet(sub.id, child.grade);
                return (
                  <button
                    key={sub.id}
                    onClick={() => handleSubjectSelect(sub.id)}
                    disabled={!available}
                    className="d-flex align-items-center gap-3 p-3 rounded-3 text-start"
                    style={{
                      border: `2px solid ${sub.color}30`,
                      background: available ? sub.colorLight : "#f5f5f5",
                      opacity: available ? 1 : 0.4,
                      cursor: available ? "pointer" : "not-allowed",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      if (!available) return;
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.06)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "";
                      e.currentTarget.style.boxShadow = "";
                    }}
                  >
                    <span style={{ fontSize: "2rem" }}>{sub.icon}</span>
                    <div>
                      <div className="f-display fs-6" style={{ color: sub.color }}>{sub.name}</div>
                      <small className="text-c-light">{sub.description}</small>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
