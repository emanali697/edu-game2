import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGameConfig } from "@context/GameContext";
import SUBJECTS from "@data/config/subjects";
import VIRTUES from "@data/config/virtues";
import { APP_NAME, SUPPORT_WHATSAPP } from "@utils/constants";

// First subject & first virtue are free to try (limited to 2 questions)
const FREE_SUBJECT = "math";
const FREE_VIRTUE = "parental_respect";

export default function DemoPage() {
  const navigate = useNavigate();
  const { updateConfig } = useGameConfig();
  const [selectedPath, setSelectedPath] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [showLocked, setShowLocked] = useState(null); // id of locked item

  const allSubjects = Object.values(SUBJECTS);
  const allVirtues = Object.values(VIRTUES);

  function handleSubjectSelect(subjectId) {
    if (subjectId !== FREE_SUBJECT) {
      setShowLocked(subjectId);
      return;
    }
    updateConfig({
      childName: "زائر",
      childId: "demo",
      subject: subjectId,
      grade: "first",
      level: "standard",
      childToken: "demo",
      isDemo: true,
      demoMaxQuestions: 2,
    });
    navigate("/play");
  }

  function handleVirtueSelect(virtueId) {
    if (virtueId !== FREE_VIRTUE) {
      setShowLocked(virtueId);
      return;
    }
    updateConfig({
      childName: "زائر",
      childId: "demo",
      virtueId: virtueId,
      childToken: "demo",
      isDemo: true,
      demoMaxQuestions: 2,
    });
    if (virtueId === "forgiveness") {
      navigate("/forgiveness-game");
    } else {
      navigate("/bridge-game");
    }
  }

  const contactUrl = `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent("السلام عليكم، جربت اللعبة وأبغى أطلبها لأطفالي")}`;

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3"
      style={{ background: "linear-gradient(135deg, #faf7ff 0%, #f0e6ff 50%, #e8f4fd 100%)" }}>
      <div style={{ width: "100%", maxWidth: 520 }}>

        {/* Locked Modal */}
        {showLocked && (
          <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{ background: "rgba(0,0,0,0.5)", zIndex: 9999 }}
            onClick={() => setShowLocked(null)}>
            <div className="card p-4 p-sm-5 text-center shadow-lg mx-3" style={{ maxWidth: 400 }}
              onClick={(e) => e.stopPropagation()}>
              <div style={{ fontSize: "3rem" }} className="mb-3">🔒</div>
              <h4 className="f-display fs-5 mb-2">محتوى مقفول</h4>
              <p className="f-body text-c-light mb-4">
                هذا المحتوى متاح في النسخة الكاملة!
                <br />اطلب اللعبة الآن وافتح كل المواد والقيم لطفلك
              </p>
              <div className="d-flex flex-column gap-2">
                <button onClick={() => navigate("/order")} className="btn btn-primary rounded-pill px-4">
                  اطلب الآن 📋
                </button>
                <a href={contactUrl} target="_blank" rel="noopener noreferrer"
                  className="btn btn-success rounded-pill px-4">
                  💬 تواصل معنا
                </a>
                <button onClick={() => setShowLocked(null)} className="btn btn-outline-secondary btn-sm rounded-pill">
                  رجوع
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="card shadow border-c p-4 p-sm-5">
          <div className="anim-fade-up text-center">
            {/* Header */}
            <div className="mb-2">
              <span className="badge bg-warning text-dark f-display px-3 py-2 rounded-pill mb-2">🎮 نسخة تجريبية</span>
            </div>
            <h1 className="f-display fs-4 mb-1" style={{ color: "var(--c-primary)" }}>{APP_NAME}</h1>
            <h2 className="f-display fs-5 mb-1">أهلاً بك! 👋</h2>
            <p className="text-c-light f-body small mb-3">جرّب اللعبة قبل ما تطلب — مادة ولعبة مفتوحة لك!</p>

            {/* ═══ Path Selection ═══ */}
            {!selectedPath && (
              <>
                <p className="text-c-light mb-3 f-body">اختر المسار اللي تبي تجربه</p>
                <div className="d-grid gap-3">
                  <button
                    onClick={() => setSelectedPath("academic")}
                    className="d-flex align-items-center gap-3 p-3 rounded-4 text-start"
                    style={{ border: "2px solid #6c5ce730", background: "linear-gradient(135deg, #f0eaff, #e8f4fd)", cursor: "pointer", transition: "all 0.2s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(108,92,231,0.15)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
                    <span style={{ fontSize: "2rem" }}>📚</span>
                    <div>
                      <div className="f-display fs-6" style={{ color: "#6c5ce7" }}>المسار التعليمي</div>
                      <small className="text-c-light">رياضيات، عربي، إنجليزي، علوم</small>
                    </div>
                  </button>
                  <button
                    onClick={() => setSelectedPath("virtue")}
                    className="d-flex align-items-center gap-3 p-3 rounded-4 text-start"
                    style={{ border: "2px solid #00b89430", background: "linear-gradient(135deg, #e8fff5, #e8f4fd)", cursor: "pointer", transition: "all 0.2s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,184,148,0.15)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
                    <span style={{ fontSize: "2rem" }}>🌿</span>
                    <div>
                      <div className="f-display fs-6" style={{ color: "#00b894" }}>المسار التربوي</div>
                      <small className="text-c-light">جسر المحبة + لعبة التسامح</small>
                    </div>
                  </button>
                </div>
              </>
            )}

            {/* ═══ Academic Subjects ═══ */}
            {selectedPath === "academic" && (
              <>
                <p className="text-c-light mb-3">
                  <span className="badge bg-success rounded-pill me-1">مفتوح</span> الرياضيات — باقي المواد تحتاج اشتراك
                </p>
                <div className="row g-3 text-start">
                  {allSubjects.map((sub) => {
                    const isFree = sub.id === FREE_SUBJECT;
                    return (
                      <div key={sub.id} className="col-6">
                        <button
                          onClick={() => handleSubjectSelect(sub.id)}
                          className="w-100 d-flex flex-column align-items-center gap-2 p-3 rounded-4 border-0 position-relative"
                          style={{
                            background: isFree ? sub.colorLight : "#f5f5f5",
                            cursor: "pointer",
                            transition: "all 0.2s",
                            opacity: isFree ? 1 : 0.7,
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.transform = ""; }}>
                          {!isFree && (
                            <span className="position-absolute" style={{ top: 8, left: 8, fontSize: "1.2rem" }}>🔒</span>
                          )}
                          <span style={{ fontSize: "2rem" }}>{sub.icon}</span>
                          <span className="f-display small" style={{ color: isFree ? sub.color : "#999" }}>{sub.name}</span>
                          {isFree && <span className="badge bg-success rounded-pill" style={{ fontSize: "0.6rem" }}>جرّب مجاناً</span>}
                        </button>
                      </div>
                    );
                  })}
                </div>
                <button onClick={() => setSelectedPath(null)} className="btn btn-outline-secondary btn-sm rounded-pill mt-3 px-3">
                  ← رجوع
                </button>
              </>
            )}

            {/* ═══ Virtue Games ═══ */}
            {selectedPath === "virtue" && !selectedGame && (
              <>
                <p className="text-c-light mb-3">اختر اللعبة</p>
                <div className="d-grid gap-3">
                  <button
                    onClick={() => setSelectedGame("bridge")}
                    className="d-flex align-items-center gap-3 p-3 rounded-4 text-start"
                    style={{ border: "2px solid #00b89430", background: "#e8fff5", cursor: "pointer", transition: "all 0.2s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = ""; }}>
                    <span style={{ fontSize: "2rem" }}>🌉</span>
                    <div>
                      <div className="f-display fs-6" style={{ color: "#00b894" }}>جسر المحبة</div>
                      <small className="text-c-light">مواقف تفاعلية لغرس القيم</small>
                    </div>
                  </button>
                  <button
                    onClick={() => handleVirtueSelect("forgiveness")}
                    className="d-flex align-items-center gap-3 p-3 rounded-4 text-start position-relative"
                    style={{ border: "2px solid #fd79a830", background: "#fff5f7", cursor: "pointer", transition: "all 0.2s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = ""; }}>
                    <span className="position-absolute" style={{ top: 8, left: 8, fontSize: "1.2rem" }}>🔒</span>
                    <span style={{ fontSize: "2rem" }}>🌸</span>
                    <div>
                      <div className="f-display fs-6" style={{ color: "#fd79a8" }}>لعبة التسامح</div>
                      <small className="text-c-light">ميّز بين الأفعال الحسنة والسيئة</small>
                    </div>
                  </button>
                </div>
                <button onClick={() => setSelectedPath(null)} className="btn btn-outline-secondary btn-sm rounded-pill mt-3 px-3">
                  ← رجوع
                </button>
              </>
            )}

            {/* ═══ Bridge Game Virtues ═══ */}
            {selectedPath === "virtue" && selectedGame === "bridge" && (
              <>
                <p className="text-c-light mb-3">
                  <span className="badge bg-success rounded-pill me-1">مفتوح</span> بر الوالدين — باقي القيم تحتاج اشتراك
                </p>
                <div className="row g-3 text-start">
                  {allVirtues.filter(v => v.id !== "forgiveness").map((v) => {
                    const isFree = v.id === FREE_VIRTUE;
                    return (
                      <div key={v.id} className="col-6">
                        <button
                          onClick={() => handleVirtueSelect(v.id)}
                          className="w-100 d-flex flex-column align-items-center gap-2 p-3 rounded-4 border-0 position-relative"
                          style={{
                            background: isFree ? v.colorLight : "#f5f5f5",
                            cursor: "pointer",
                            transition: "all 0.2s",
                            opacity: isFree ? 1 : 0.7,
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.transform = ""; }}>
                          {!isFree && (
                            <span className="position-absolute" style={{ top: 8, left: 8, fontSize: "1.2rem" }}>🔒</span>
                          )}
                          <span style={{ fontSize: "2rem" }}>{v.icon}</span>
                          <span className="f-display small" style={{ color: isFree ? v.color : "#999" }}>{v.name}</span>
                          {isFree && <span className="badge bg-success rounded-pill" style={{ fontSize: "0.6rem" }}>جرّب مجاناً</span>}
                        </button>
                      </div>
                    );
                  })}
                </div>
                <button onClick={() => { setSelectedGame(null); }} className="btn btn-outline-secondary btn-sm rounded-pill mt-3 px-3">
                  ← رجوع
                </button>
              </>
            )}

            {/* CTA */}
            <div className="mt-4 pt-3 border-top border-c">
              <p className="f-body small text-c-light mb-2">عجبتك التجربة؟</p>
              <div className="d-flex gap-2 justify-content-center flex-wrap">
                <button onClick={() => navigate("/order")} className="btn btn-primary rounded-pill px-4">
                  اطلب النسخة الكاملة 📋
                </button>
                <a href={contactUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-success rounded-pill px-3">
                  💬 تواصل معنا
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
