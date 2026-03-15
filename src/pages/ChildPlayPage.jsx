import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getChildByAccessToken, checkAndRegisterDevice } from "@services/firebase";
import { useGameConfig } from "@context/GameContext";
import SUBJECTS from "@data/config/subjects";
import VIRTUES from "@data/config/virtues";
import { hasQuestionSet } from "@data/questions";
import { hasVirtueData } from "@data/virtues";
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
  const [deviceChecking, setDeviceChecking] = useState(true);
  const [selectedPath, setSelectedPath] = useState(null); // "academic" | "virtue" | null
  const [selectedGame, setSelectedGame] = useState(null); // "bridge" | "forgiveness" | null
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Track online/offline status
  useEffect(() => {
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  // Load child data
  useEffect(() => {
    if (!token) { setError(true); setLoading(false); setDeviceChecking(false); return; }

    getChildByAccessToken(token)
      .then((data) => {
        if (data) setChild(data);
        else { setError(true); setDeviceChecking(false); }
      })
      .catch(() => { setError(true); setDeviceChecking(false); })
      .finally(() => setLoading(false));
  }, [token]);

  // Check device registration after child loads
  useEffect(() => {
    if (!child) return;
    setDeviceChecking(true);
    const deviceId = getDeviceId();
    checkAndRegisterDevice(child.id, deviceId)
      .then((result) => {
        if (result.allowed) {
          // Cache that this device is allowed for offline use
          try { localStorage.setItem(`device_ok_${child.id}`, "1"); } catch {}
        } else {
          setDeviceBlocked(true);
        }
      })
      .catch((err) => {
        console.warn("Device check failed:", err);
        // Offline: allow if device was previously approved
        const wasApproved = localStorage.getItem(`device_ok_${child.id}`);
        if (!wasApproved) setDeviceBlocked(true);
      })
      .finally(() => setDeviceChecking(false));
  }, [child]);

  // Get allowed items
  // Array exists (even if empty) = use it; undefined/null = show all (legacy)
  function getAllowedSubjects() {
    if (!child) return [];
    // path=virtue means no academic subjects at all
    if (child.path === "virtue") return [];
    if (Array.isArray(child.allowedSubjects)) {
      const filtered = child.allowedSubjects.filter((id) => id !== "_none_");
      if (filtered.length === 0) return [];
      return Object.values(SUBJECTS).filter((sub) => filtered.includes(sub.id));
    }
    return Object.values(SUBJECTS);
  }

  function getAllowedVirtues() {
    if (!child) return [];
    // path=academic means no virtues at all
    if (child.path === "academic") return [];
    if (Array.isArray(child.allowedVirtues)) {
      const filtered = child.allowedVirtues.filter((id) => id !== "_none_");
      if (filtered.length === 0) return [];
      return Object.values(VIRTUES).filter((v) => filtered.includes(v.id));
    }
    return Object.values(VIRTUES);
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
      childToken: token,
    });
    navigate("/play");
  }

  function handleVirtueSelect(virtueId) {
    if (!child) return;
    updateConfig({
      childName: child.name,
      childId: child.id,
      virtueId: virtueId,
      childToken: token,
    });
    // لعبة التسامح لها صفحة خاصة
    if (virtueId === "forgiveness") {
      navigate("/forgiveness-game");
    } else {
      if (!hasVirtueData(virtueId)) return;
      navigate("/bridge-game");
    }
  }

  // Auto-navigate if only 1 path with 1 item
  useEffect(() => {
    if (!child || deviceChecking || deviceBlocked) return;
    const subjects = getAllowedSubjects();
    const virtues = getAllowedVirtues();
    const hasAcademic = subjects.length > 0;
    const hasVirtue = virtues.length > 0;

    // Only academic with 1 subject
    if (hasAcademic && !hasVirtue && subjects.length === 1 && hasQuestionSet(subjects[0].id, child.grade)) {
      handleSubjectSelect(subjects[0].id);
    }
    // Only virtue with 1 virtue
    if (!hasAcademic && hasVirtue && virtues.length === 1) {
      handleVirtueSelect(virtues[0].id);
    }
  }, [child, deviceChecking, deviceBlocked]);

  // ── Loading
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

  // ── Invalid link
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

  // ── Device blocked
  if (deviceBlocked) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center p-3"
        style={{ background: "linear-gradient(135deg, #faf7ff 0%, #f0e6ff 50%, #e8f4fd 100%)" }}>
        <div className="text-center" style={{ maxWidth: 420 }}>
          <div style={{ fontSize: "4rem" }} className="mb-3">🔒</div>
          <h2 className="f-display fs-3 mb-3">الحد الأقصى من الأجهزة</h2>
          <p className="text-c-light mb-4">
            هذا الرابط مفتوح على الحد الأقصى من الأجهزة. للمساعدة تواصل معنا
          </p>
          <div className="d-flex gap-2 justify-content-center flex-wrap">
            <a href={`https://wa.me/966500000000?text=${encodeURIComponent("السلام عليكم، أحتاج مساعدة بخصوص حد الأجهزة")}`}
              target="_blank" rel="noopener noreferrer"
              className="btn btn-success rounded-pill px-4">💬 تواصل معنا</a>
            <button onClick={() => navigate("/")} className="btn btn-outline-secondary rounded-pill px-4">الرئيسية</button>
          </div>
        </div>
      </div>
    );
  }

  const allowedSubjects = getAllowedSubjects();
  const allowedVirtues = getAllowedVirtues();
  const hasAcademic = allowedSubjects.length > 0;
  const hasVirtue = allowedVirtues.length > 0;

  // If child has only one path (via path field or only one has items), skip path selection
  const pathField = child.path; // "academic" | "virtue" | "both" | undefined
  const onlyAcademic = pathField === "academic" || (hasAcademic && !hasVirtue);
  const onlyVirtue = pathField === "virtue" || (!hasAcademic && hasVirtue);

  const showPathSelection = !selectedPath && !onlyAcademic && !onlyVirtue;
  const showAcademic = selectedPath === "academic" || onlyAcademic;
  const showVirtue = selectedPath === "virtue" || onlyVirtue;

  // ── Render
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3"
      style={{ background: "linear-gradient(135deg, #faf7ff 0%, #f0e6ff 50%, #e8f4fd 100%)" }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        {isOffline && (
          <div className="alert alert-warning text-center py-2 mb-3 rounded-3" style={{ fontSize: "0.9rem" }}>
            📡 أنت تلعب بدون إنترنت — بعض الميزات قد لا تعمل
          </div>
        )}
        <div className="card shadow border-c p-4 p-sm-5">
          <div className="anim-fade-up text-center">
            {/* Logo */}
            <div className="mb-3">
              <span style={{ fontSize: "2.5rem" }}>🎮</span>
              <h1 className="f-display fs-5 mt-1 mb-0" style={{ color: "var(--c-primary)" }}>{APP_NAME}</h1>
            </div>
            <h2 className="f-display fs-3 mb-1">أهلاً يا {child.name}! 👋</h2>

            {/* ═══ Path Selection ═══ */}
            {showPathSelection && (
              <>
                <p className="text-c-light mb-4">اختر المسار اللي تبي تلعب فيه</p>
                <div className="d-grid gap-3">
                  {hasAcademic && (
                    <button
                      onClick={() => setSelectedPath("academic")}
                      className="d-flex align-items-center gap-3 p-4 rounded-4 text-start"
                      style={{
                        border: "2px solid #6c5ce730",
                        background: "linear-gradient(135deg, #f0eaff, #e8f4fd)",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(108,92,231,0.15)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
                    >
                      <span style={{ fontSize: "2.5rem" }}>📚</span>
                      <div>
                        <div className="f-display fs-5" style={{ color: "#6c5ce7" }}>المسار التعليمي</div>
                        <small className="text-c-light">رياضيات، عربي، إنجليزي، علوم</small>
                      </div>
                    </button>
                  )}
                  {hasVirtue && (
                    <button
                      onClick={() => setSelectedPath("virtue")}
                      className="d-flex align-items-center gap-3 p-4 rounded-4 text-start"
                      style={{
                        border: "2px solid #e1705530",
                        background: "linear-gradient(135deg, #ffeaea, #fff9e6)",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(225,112,85,0.15)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
                    >
                      <span style={{ fontSize: "2.5rem" }}>🌉</span>
                      <div>
                        <div className="f-display fs-5" style={{ color: "#e17055" }}>المسار التربوي</div>
                        <small className="text-c-light">جسر المحبة — القيم والأخلاق</small>
                      </div>
                    </button>
                  )}
                </div>
              </>
            )}

            {/* ═══ Academic Subject Selection ═══ */}
            {showAcademic && (
              <>
                <p className="text-c-light mb-4">
                  {!onlyAcademic && (
                    <button onClick={() => setSelectedPath(null)} className="btn btn-sm btn-outline-secondary ms-2 mb-1">
                      رجوع ←
                    </button>
                  )}
                  اختر المادة اللي تبي تلعب فيها
                </p>
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
              </>
            )}

            {/* ═══ Virtue Path: Game Selection ═══ */}
            {showVirtue && !selectedGame && (
              <>
                <p className="text-c-light mb-4">
                  {!onlyVirtue && (
                    <button onClick={() => setSelectedPath(null)} className="btn btn-sm btn-outline-secondary ms-2 mb-1">
                      رجوع ←
                    </button>
                  )}
                  اختر اللعبة اللي تبي تلعبها
                </p>
                <div className="d-grid gap-3">
                  <button
                    onClick={() => setSelectedGame("bridge")}
                    className="d-flex align-items-center gap-3 p-4 rounded-4 text-start"
                    style={{
                      border: "2px solid #6c5ce730",
                      background: "linear-gradient(135deg, #f0eaff, #e8f4fd)",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(108,92,231,0.15)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
                  >
                    <span style={{ fontSize: "2.5rem" }}>🌉</span>
                    <div>
                      <div className="f-display fs-5" style={{ color: "#6c5ce7" }}>جسر المحبة</div>
                      <small className="text-c-light">مواقف تفاعلية تغرس الفضائل الإسلامية — ابنِ الجسر!</small>
                    </div>
                  </button>
                  <button
                    onClick={() => handleVirtueSelect("forgiveness")}
                    className="d-flex align-items-center gap-3 p-4 rounded-4 text-start"
                    style={{
                      border: "2px solid #43a04730",
                      background: "linear-gradient(135deg, #e8f5e9, #f1f8e9)",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(67,160,71,0.15)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
                  >
                    <span style={{ fontSize: "2.5rem" }}>🌸</span>
                    <div>
                      <div className="f-display fs-5" style={{ color: "#43a047" }}>لعبة التسامح</div>
                      <small className="text-c-light">اختر أفعال التسامح وازرع حديقة الورود!</small>
                    </div>
                  </button>
                </div>
              </>
            )}

            {/* ═══ Bridge Game: Virtue Selection ═══ */}
            {showVirtue && selectedGame === "bridge" && (
              <>
                <p className="text-c-light mb-4">
                  <button onClick={() => setSelectedGame(null)} className="btn btn-sm btn-outline-secondary ms-2 mb-1">
                    رجوع ←
                  </button>
                  اختر الفضيلة اللي تبي تتعلمها
                </p>
                <div className="d-grid gap-2">
                  {allowedVirtues.filter((v) => v.id !== "forgiveness").map((virtue) => {
                    const available = hasVirtueData(virtue.id);
                    return (
                      <button
                        key={virtue.id}
                        onClick={() => handleVirtueSelect(virtue.id)}
                        disabled={!available}
                        className="d-flex align-items-center gap-3 p-3 rounded-3 text-start"
                        style={{
                          border: `2px solid ${virtue.color}30`,
                          background: available ? virtue.colorLight : "#f5f5f5",
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
                        <span style={{ fontSize: "2rem" }}>{virtue.icon}</span>
                        <div>
                          <div className="f-display fs-6" style={{ color: virtue.color }}>{virtue.name}</div>
                          <small className="text-c-light">{virtue.description}</small>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
