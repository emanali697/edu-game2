import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useGameConfig } from "@context/GameContext";
import { useAuth } from "@context/AuthContext";
import { getChildrenByParent } from "@services/firebase";
import SUBJECTS from "@data/config/subjects";
import GRADES from "@data/config/grades";
import { hasQuestionSet } from "@data/questions";

const STEPS = ["child", "subject", "grade"];

export default function GameSetupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateConfig } = useGameConfig();
  const { user, loading: authLoading } = useAuth();

  // لو جاي من الداشبورد ومعاه طفل محدد، نتخطى خطوة اختيار الطفل
  const preSelectedChild = location.state?.selectedChild || null;

  const [step, setStep] = useState(preSelectedChild ? 1 : 0);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(preSelectedChild);
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [loadingChildren, setLoadingChildren] = useState(true);

  const current = STEPS[step];
  const goNext = () => step < STEPS.length - 1 && setStep(step + 1);
  const goBack = () => step > 0 && setStep(step - 1);

  // تحقق من تسجيل الدخول وجيب الأطفال
  useEffect(() => {
    if (authLoading) return;
   if (!user) { navigate("/login?redirect=/setup"); return; }

    getChildrenByParent(user.uid)
      .then((data) => setChildren(data))
      .catch((err) => console.warn("Failed to load children:", err))
      .finally(() => setLoadingChildren(false));
  }, [user, authLoading]);

  function handleStart() {
     console.log("selectedChild:", selectedChild);
    if (!selectedChild || !subject || !grade) return;
    updateConfig({
       childName: selectedChild.name,
      childId: selectedChild.id,       // ✅ ID حقيقي من Firebase
      subject,
      grade,
      level: "standard",
    });
    navigate("/play");
  }

  // Loading
  if (authLoading || loadingChildren) return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center">
      <div className="text-center">
        <div className="spinner-border text-primary mb-3" />
        <p className="text-c-light">جاري التحميل...</p>
      </div>
    </div>
  );

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3"
      style={{ background: "linear-gradient(135deg, #faf7ff 0%, #f0e6ff 50%, #e8f4fd 100%)" }}>
      <div style={{ width: "100%", maxWidth: 440 }}>

        {/* Progress dots */}
        <div className="d-flex justify-content-center gap-2 mb-4">
          {STEPS.map((_, i) => (
            <div key={i} style={{
              width: 12, height: 12, borderRadius: "50%",
              background: i <= step ? "var(--c-primary)" : "var(--c-border)",
              transition: "all 0.3s"
            }} />
          ))}
        </div>

        <div className="card shadow border-c p-4 p-sm-5">

          {/* === اختار الطفل === */}
          {current === "child" && (
            <div className="anim-fade-up text-center">
              <div style={{ fontSize: "3rem" }} className="mb-3">👨‍👩‍👧‍👦</div>
              <h2 className="f-display fs-3 mb-1">من سيلعب اليوم؟</h2>
              <p className="text-c-light mb-4">اختر اسم طفلك</p>

              {children.length === 0 ? (
                <div>
                  <p className="text-c-light mb-3">ما في أطفال مضافين بعد</p>
                  <button
                   onClick={() => navigate("/dashboard")}
                    className="btn btn-primary"
                  >
                    أضف طفل الآن +
                  </button>
                </div>
              ) : (
                <>
                  <div className="d-grid gap-2 mb-4">
                    {children.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => setSelectedChild(child)}
                        className="d-flex align-items-center gap-3 p-3 rounded-3 text-start"
                        style={{
                          border: selectedChild?.id === child.id
                            ? "2px solid var(--c-primary)"
                            : "2px solid var(--c-border)",
                          background: selectedChild?.id === child.id
                            ? "rgba(108,92,231,0.04)" : "#fff",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        <span style={{ fontSize: "2rem" }}>
                          {child.avatar || "👦"}
                        </span>
                        <div className="text-end flex-grow-1">
                          <div className="f-display fs-6">{child.name}</div>
                          <small className="text-c-light">
                            {GRADES[child.grade]?.name || child.grade}
                          </small>
                        </div>
                        {selectedChild?.id === child.id && (
                          <span className="anim-pop">✅</span>
                        )}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={goNext}
                    disabled={!selectedChild}
                    className="btn btn-primary btn-lg w-100 mb-3"
                  >
                    يلا نبدأ! 🚀
                  </button>

                  {/* Tip: Dashboard link */}
                  <div className="d-flex align-items-center gap-2 p-2 rounded-3 text-start" style={{ background: "rgba(108,92,231,0.06)", fontSize: "0.82rem" }}>
                    <span>💡</span>
                    <span className="text-c-light">
                      تقدر تأخذ رابط مباشر لطفلك من{" "}
                      <button onClick={() => navigate("/dashboard")} className="btn btn-link p-0 text-decoration-none" style={{ fontSize: "0.82rem", color: "var(--c-primary)" }}>
                        لوحة تحكم الأهل
                      </button>
                      {" "}ويبدأ اللعب بدون تسجيل دخول!
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* === اختار المادة === */}
          {current === "subject" && (
            <div className="anim-fade-up text-center">
              <div style={{ fontSize: "3rem" }} className="mb-3">📚</div>
              <h2 className="f-display fs-3 mb-1">أهلاً يا {selectedChild?.name}!
              </h2>
              <p className="text-c-light mb-4">اختر المادة اللي تبي تلعب فيها</p>
              <div className="d-grid gap-2">
                {Object.values(SUBJECTS).map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => { setSubject(sub.id); goNext(); }}
                    className="d-flex align-items-center gap-3 p-3 rounded-3 text-start"
                    style={{
                      border: `2px solid ${sub.color}30`,
                      background: sub.colorLight,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
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
                      <div className="f-display fs-6" style={{ color: sub.color }}>
                        {sub.name}
                      </div>
                      <small className="text-c-light">{sub.description}</small>
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={preSelectedChild ? () => navigate("/dashboard") : goBack}
                className="btn btn-link text-c-light text-decoration-none mt-3 small"
              >
                → رجوع
              </button>
            </div>
          )}

          {/* === اختار الصف === */}
          {current === "grade" && (
            <div className="anim-fade-up text-center">
              <div style={{ fontSize: "3rem" }} className="mb-3">
                {SUBJECTS[subject]?.icon}
              </div>
              <h2 className="f-display fs-3 mb-1">اختر الصف</h2>
              <p className="text-c-light mb-4">
                {SUBJECTS[subject]?.name} - اختر صفك الدراسي
              </p>
              <div className="d-grid gap-2 mb-4">
                {Object.values(GRADES).map((g) => {
                  const available = hasQuestionSet(subject, g.id);
                  const selected = grade === g.id;
                  return (
                    <button
                      key={g.id}
                      onClick={() => available && setGrade(g.id)}
                      disabled={!available}
                      className="d-flex align-items-center justify-content-between p-3 rounded-3 text-start"
                      style={{
                        border: selected
                          ? "2px solid var(--c-primary)"
                          : "2px solid var(--c-border)",
                        background: selected ? "rgba(108,92,231,0.04)" : "#fff",
                        opacity: available ? 1 : 0.4,
                        cursor: available ? "pointer" : "not-allowed",
                        transition: "all 0.2s",
                      }}
                    >
                      <div>
                        <div className="f-display fs-6">{g.name}</div>
                        <small className="text-c-light">{g.ageRange}</small>
                      </div>
                      {selected && (
                        <span className="anim-pop" style={{ fontSize: "1.2rem" }}>✅</span>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="d-flex gap-2">
                <button
                  onClick={goBack}
                  className="btn btn-outline-secondary flex-shrink-0"
                >
                  → رجوع
                </button>
                <button
                  onClick={handleStart}
                  disabled={!grade}
                  className="btn btn-primary btn-lg flex-grow-1"
                >
                  ابدأ اللعب! 🎮
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}