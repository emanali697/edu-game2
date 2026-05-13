import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@context/AuthContext";
import {
  getChildrenByParent, addChild, getChildStats, getChildSessions,
} from "@services/firebase";
import SUBJECTS from "@data/config/subjects";
import VIRTUES from "@data/config/virtues";
import GRADES from "@data/config/grades";
import { SUPPORT_WHATSAPP, APP_NAME } from "@utils/constants";

const MAX_CHILDREN = 10;

export default function ParentDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add child form
  const [showAddChild, setShowAddChild] = useState(false);
  const [newChildName, setNewChildName] = useState("");
  const [newChildGrade, setNewChildGrade] = useState("first");
  const [newChildSubjects, setNewChildSubjects] = useState(["math", "arabic", "english", "science"]);
  const [newChildVirtues, setNewChildVirtues] = useState(Object.keys(VIRTUES));
  const [nameError, setNameError] = useState("");

  // Other UI state
  const [copiedChildId, setCopiedChildId] = useState(null);


  const selectedChildRef = useRef(null);

  // ── Load / select child ──────────────────────────────────────
  async function selectChild(child) {
    setSelectedChild(child);
    selectedChildRef.current = child?.id || null;
    try {
      const [s, sess] = await Promise.all([
        getChildStats(child.id),
        getChildSessions(child.id, 20),
      ]);
      setStats(s);
      setSessions(sess || []);
    } catch (e) { console.warn(e); }
  }

  async function loadChildren(isInitial = false) {
    if (!user) return;
    if (isInitial) setLoading(true);
    try {
      const kids = await getChildrenByParent(user.uid);
      setChildren(kids);
      if (kids.length > 0) {
        const prevId = selectedChildRef.current;
        const match = prevId && kids.find((k) => k.id === prevId);
        selectChild(match || kids[0]);
      } else {
        setSelectedChild(null);
        setStats(null);
        setSessions([]);
      }
    } catch (e) { console.warn("loadChildren error:", e); }
    if (isInitial) setLoading(false);
  }

  useEffect(() => { loadChildren(true); }, [user]);

  // ── Access link ──────────────────────────────────────────────
  function getChildAccessLink(child) {
    if (!child?.accessToken) return "";
    return `${window.location.origin}/child-play/?t=${child.accessToken}`;
  }

  async function copyChildLink(child) {
    const link = getChildAccessLink(child);
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedChildId(child.id);
      setTimeout(() => setCopiedChildId(null), 2500);
    } catch {
      prompt("انسخ الرابط:", link);
    }
  }

  // ── Add child ────────────────────────────────────────────────
  async function handleAddChild() {
    const trimmedName = newChildName.trim();
    if (!trimmedName || !user) return;

    if (children.length >= MAX_CHILDREN) {
      setNameError(`وصلت للحد الأقصى (${MAX_CHILDREN} أطفال). تواصل مع خدمة ${APP_NAME} لترقية خطة اشتراكك.`);
      return;
    }
    if (children.some((c) => c.name.trim().toLowerCase() === trimmedName.toLowerCase())) {
      setNameError("هذا الاسم موجود بالفعل. اختر اسم آخر.");
      return;
    }
    if (newChildSubjects.length === 0 && newChildVirtues.length === 0) {
      setNameError("اختر مادة دراسية أو فضيلة واحدة على الأقل.");
      return;
    }
    setNameError("");

    try {
      const { childId, accessToken } = await addChild(user.uid, {
        name: trimmedName,
        grade: newChildGrade,
        allowedSubjects: newChildSubjects,
        allowedVirtues: newChildVirtues,
      });
      const newChild = {
        id: childId, name: trimmedName, grade: newChildGrade,
        avatar: "👦", parentId: user.uid, accessToken,
        allowedSubjects: newChildSubjects,
        allowedVirtues: newChildVirtues,
      };
      setChildren((prev) => [...prev, newChild]);
      selectChild(newChild);
      setNewChildName("");
      setNewChildSubjects(["math", "arabic", "english", "science"]);
      setNewChildVirtues(Object.keys(VIRTUES));
      setShowAddChild(false);
    } catch (e) { console.warn("handleAddChild error:", e); }
  }

  function toggleSubject(subId, _list, setList) {
    setList((prev) =>
      prev.includes(subId) ? prev.filter((s) => s !== subId) : [...prev, subId]
    );
  }


  // ── Toggle rows (shared UI) ─────────────────────────────────
  function VirtueToggleRow({ selected, onToggle }) {
    return (
      <div className="d-flex flex-wrap gap-2 mt-2">
        {Object.values(VIRTUES).map((v) => {
          const checked = selected.includes(v.id);
          return (
            <button key={v.id} type="button"
              onClick={() => onToggle(v.id)}
              className="d-flex align-items-center gap-2 px-3 py-2 rounded-3 f-body small"
              style={{
                border: `2px solid ${checked ? v.color : "var(--c-border)"}`,
                background: checked ? v.colorLight : "#fff",
                color: checked ? v.color : "var(--c-text-light)",
                cursor: "pointer", transition: "all 0.15s",
              }}>
              <span>{v.icon}</span>
              <span>{v.name}</span>
              {checked && <span style={{ fontSize: "0.75rem" }}>✓</span>}
            </button>
          );
        })}
      </div>
    );
  }

  function SubjectToggleRow({ selected, onToggle }) {
    return (
      <div className="d-flex flex-wrap gap-2 mt-2">
        {Object.values(SUBJECTS).map((sub) => {
          const checked = selected.includes(sub.id);
          return (
            <button key={sub.id} type="button"
              onClick={() => onToggle(sub.id)}
              className="d-flex align-items-center gap-2 px-3 py-2 rounded-3 f-body small"
              style={{
                border: `2px solid ${checked ? sub.color : "var(--c-border)"}`,
                background: checked ? sub.colorLight : "#fff",
                color: checked ? sub.color : "var(--c-text-light)",
                cursor: "pointer", transition: "all 0.15s",
              }}>
              <span>{sub.icon}</span>
              <span>{sub.name}</span>
              {checked && <span style={{ fontSize: "0.75rem" }}>✓</span>}
            </button>
          );
        })}
      </div>
    );
  }

  // ── Loading ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: "var(--c-bg)" }}>
        <div className="text-center">
          <div className="spinner-border" style={{ color: "var(--c-primary)", width: "3rem", height: "3rem" }} />
          <p className="f-display mt-3" style={{ color: "var(--c-text-light)" }}>جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  const totals = stats?.totals || {};
  const bySubject = stats?.bySubject || {};

  return (
    <div style={{ background: "linear-gradient(180deg, #f0e6ff 0%, var(--c-bg) 30%)", minHeight: "100vh" }} className="py-4">
      <div className="container" style={{ maxWidth: 940 }}>

        {/* ===== Header ===== */}
        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
          <div>
            <h1 className="f-display fs-3 mb-0">لوحة تحكم الأهل</h1>
            <p className="text-c-light small mb-0">تابع تقدّم أطفالك وشارك رابط اللعب المباشر</p>
          </div>
          <div className="d-flex align-items-center gap-2">
            {children.length < MAX_CHILDREN && (
              <button onClick={() => { setShowAddChild(true); setNameError(""); }}
                className="btn btn-primary d-flex align-items-center gap-2">
                <span style={{ fontSize: "1.1rem" }}>+</span> أضف طفل
              </button>
            )}
          </div>
        </div>

        {/* ===== Children Tabs ===== */}
        {children.length > 0 && (
          <div className="d-flex align-items-center gap-2 mb-4 flex-wrap">
            {children.map((child) => {
              const isSelected = selectedChild?.id === child.id;
              return (
                <div key={child.id} className="d-flex align-items-center gap-1">
                  <button onClick={() => selectChild(child)}
                    className="btn px-3 py-2 f-display small"
                    style={{
                      background: isSelected ? "var(--c-primary)" : "#fff",
                      color: isSelected ? "#fff" : "var(--c-text)",
                      border: isSelected ? "2px solid var(--c-primary)" : "2px solid var(--c-border)",
                      borderRadius: "2rem",
                      boxShadow: isSelected ? "0 4px 12px rgba(108,92,231,0.25)" : "none",
                    }}>
                    {child.avatar || "👦"} {child.name || "طفل"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* ===== Max Children Banner ===== */}
        {children.length >= MAX_CHILDREN && (
          <div className="card mb-4 overflow-hidden anim-fade-up" style={{ border: "2px solid #fdcb6e", borderRadius: "1.2rem" }}>
            <div className="p-4" style={{ background: "linear-gradient(135deg, #fff9e6 0%, #fff3cd 100%)" }}>
              <div className="d-flex align-items-start gap-3">
                <span style={{ fontSize: "2.5rem", lineHeight: 1 }}>👨‍👩‍👧‍👦</span>
                <div className="flex-grow-1">
                  <h5 className="f-display mb-1" style={{ color: "#856404" }}>
                    وصلت للحد الأقصى من الأطفال ({MAX_CHILDREN} أطفال)
                  </h5>
                  <p className="f-body mb-3" style={{ color: "#664d03", fontSize: "0.95rem" }}>
                    خطتك الحالية تتيح إضافة حتى <strong>{MAX_CHILDREN} أطفال</strong> فقط.
                    لإضافة عدد أكبر، تواصل مع خدمة {APP_NAME} لترقية خطة اشتراكك.
                  </p>
                  <div className="d-flex flex-wrap gap-2">
                    <a
                      href={`https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(`مرحباً، أريد ترقية خطة اشتراكي في ${APP_NAME} لإضافة أكثر من ${MAX_CHILDREN} أطفال.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn f-display"
                      style={{ background: "#25D366", color: "#fff", borderRadius: "0.75rem", fontSize: "0.9rem" }}>
                      💬 تواصل عبر واتساب
                    </a>
                    <button
                      onClick={() => navigate("/subscription")}
                      className="btn btn-outline-secondary f-display"
                      style={{ borderRadius: "0.75rem", fontSize: "0.9rem", borderColor: "#856404", color: "#856404" }}>
                      📋 عرض خطط الاشتراك
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== Add Child Form ===== */}
        {showAddChild && (
          <div className="card shadow-sm p-4 mb-4 anim-fade-up" style={{ border: "2px solid var(--c-primary-light)", borderRadius: "1.2rem" }}>
            <h5 className="f-display mb-3">إضافة طفل جديد</h5>
            <div className="row g-3 align-items-start">
              <div className="col-sm-5">
                <label className="form-label f-display small">اسم الطفل</label>
                <input type="text" className={`form-control rounded-3 ${nameError ? "is-invalid" : ""}`}
                  style={{ border: "2px solid var(--c-border)" }}
                  placeholder="مثال: أحمد"
                  value={newChildName} onChange={(e) => { setNewChildName(e.target.value); setNameError(""); }} />
                {nameError && <div className="invalid-feedback d-block">{nameError}</div>}
              </div>
              <div className="col-sm-4">
                <label className="form-label f-display small">الصف الدراسي</label>
                <select className="form-select rounded-3" style={{ border: "2px solid var(--c-border)" }}
                  value={newChildGrade} onChange={(e) => setNewChildGrade(e.target.value)}>
                  {Object.values(GRADES).map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-sm-3 d-flex gap-2" style={{ marginTop: "2rem" }}>
                <button onClick={handleAddChild} className="btn btn-primary flex-grow-1">إضافة</button>
                <button onClick={() => setShowAddChild(false)} className="btn btn-outline-secondary px-3">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
            </div>
            <div className="mt-3">
              <label className="form-label f-display small mb-1">📚 المسار التعليمي</label>
              <SubjectToggleRow
                selected={newChildSubjects}
                onToggle={(subId) => toggleSubject(subId, newChildSubjects, setNewChildSubjects)}
              />
            </div>
            <div className="mt-3">
              <label className="form-label f-display small mb-1">🌉 المسار التربوي (جسر المحبة)</label>
              <VirtueToggleRow
                selected={newChildVirtues}
                onToggle={(vId) => toggleSubject(vId, newChildVirtues, setNewChildVirtues)}
              />
            </div>
            {newChildSubjects.length === 0 && newChildVirtues.length === 0 && (
              <small className="text-danger d-block mt-2">اختر مادة أو فضيلة واحدة على الأقل</small>
            )}
            <div className="d-flex align-items-center gap-2 mt-3 p-2 rounded-3" style={{ background: "rgba(108,92,231,0.06)" }}>
              <span>🔗</span>
              <small className="text-c-light">بعد الإضافة سيتم إنشاء رابط خاص تقدر تبعثه لطفلك يفتح الأسئلة مباشرة!</small>
            </div>
          </div>
        )}

        {/* ===== No Children ===== */}
        {children.length === 0 && !showAddChild && (
          <div className="card shadow-sm text-center py-5 px-4" style={{ border: "2px dashed var(--c-border)", borderRadius: "1.2rem" }}>
            <div style={{ fontSize: "4.5rem" }} className="mb-2">👶</div>
            <h3 className="f-display fs-4 mb-2">أضف أول طفل عشان تبدأ!</h3>
            <p className="text-c-light mb-4">أضف اسم طفلك وصفه الدراسي وسنعطيك رابط يبدأ فيه اللعب مباشرة</p>
            <button onClick={() => setShowAddChild(true)} className="btn btn-primary btn-lg mx-auto" style={{ maxWidth: 250 }}>
              + أضف طفل
            </button>
          </div>
        )}

        {/* ===== Dashboard Content ===== */}
        {selectedChild && (
          <>
            {/* ===== Child Access Link Card ===== */}
            <div className="card shadow-sm mb-4 overflow-hidden" style={{ border: "2px solid var(--c-primary-light)", borderRadius: "1.2rem" }}>
              <div className="p-4" style={{ background: "linear-gradient(135deg, rgba(108,92,231,0.08) 0%, rgba(162,155,254,0.08) 100%)" }}>
                <div className="d-flex align-items-start justify-content-between flex-wrap gap-3">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span style={{ fontSize: "1.5rem" }}>🔗</span>
                      <h5 className="f-display mb-0">رابط {selectedChild.name} المباشر</h5>
                    </div>
                    <p className="mb-3" style={{ color: "var(--c-text-light)" }}>
                      أرسل هذا الرابط لطفلك عبر واتساب أو أي تطبيق - يفتح معاه الأسئلة مباشرة بدون تسجيل دخول!
                    </p>

                    {/* Allowed subjects badges */}
                    {selectedChild.allowedSubjects && selectedChild.allowedSubjects.length > 0 && (
                      <div className="d-flex flex-wrap gap-1 mb-3">
                        {selectedChild.allowedSubjects.map((subId) => {
                          const sub = SUBJECTS[subId];
                          if (!sub) return null;
                          return (
                            <span key={subId} className="badge rounded-pill px-2 py-1 f-body"
                              style={{ background: sub.colorLight, color: sub.color, fontSize: "0.75rem" }}>
                              {sub.icon} {sub.name}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {selectedChild.accessToken ? (
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <div className="flex-grow-1 bg-white rounded-3 p-3 text-break"
                          style={{ direction: "ltr", fontSize: "0.9rem", border: "2px solid var(--c-border)", fontFamily: "monospace", color: "var(--c-primary-dark)" }}>
                          {getChildAccessLink(selectedChild)}
                        </div>
                        <button onClick={() => copyChildLink(selectedChild)} className="btn btn-lg"
                          style={{
                            background: copiedChildId === selectedChild.id ? "var(--c-correct)" : "var(--c-primary)",
                            color: "#fff", minWidth: 160, borderRadius: "1rem",
                          }}>
                          {copiedChildId === selectedChild.id ? "✅ تم النسخ!" : "📋 انسخ الرابط"}
                        </button>
                      </div>
                    ) : (
                      <div className="d-flex align-items-center gap-2">
                        <div className="spinner-border spinner-border-sm text-primary" />
                        <span className="text-c-light">جاري إنشاء الرابط...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Steps + reset devices */}
              <div className="px-4 py-3" style={{ background: "#fff" }}>
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                  <div className="d-flex align-items-center gap-4 flex-wrap" style={{ fontSize: "0.85rem" }}>
                    {[["1","انسخ الرابط"],["2","أرسله لطفلك"],["3","يبدأ اللعب!"]].map(([n, label], i, arr) => (
                      <span key={n} className="d-flex align-items-center gap-2">
                        <span className="badge rounded-pill" style={{ background: "var(--c-primary)", width: 24, height: 24, lineHeight: "24px", padding: 0 }}>{n}</span>
                        <span>{label}</span>
                        {i < arr.length - 1 && <span className="text-c-light me-2">←</span>}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ===== Stats Overview ===== */}
            <h5 className="f-display mb-3">إحصائيات {selectedChild.name}</h5>
            <div className="row g-3 mb-4">
              {[
                { label: "ألعاب لُعبت", value: totals.totalGamesPlayed || 0, icon: "🎮", color: "var(--c-primary)" },
                { label: "إجابات صحيحة", value: totals.totalCorrect || 0, icon: "✅", color: "var(--c-correct)" },
                { label: "إجابات خاطئة", value: totals.totalWrong || 0, icon: "❌", color: "var(--c-wrong)" },
                { label: "أطول سلسلة", value: totals.bestStreak || 0, icon: "🔥", color: "#e67e22" },
                { label: "مجموع النقاط", value: totals.totalScore || 0, icon: "⭐", color: "var(--c-star)" },
              ].map((item, i) => (
                <div key={i} className="col-6 col-md-4 col-lg">
                  <div className="card p-3 text-center h-100 shadow-sm" style={{ border: "1px solid var(--c-border)", borderRadius: "1rem" }}>
                    <div style={{ fontSize: "1.5rem" }}>{item.icon}</div>
                    <div className="f-display fs-4 mt-1" style={{ color: item.color }}>{item.value}</div>
                    <small className="f-body text-c-light">{item.label}</small>
                  </div>
                </div>
              ))}
            </div>

            {/* ===== Subject Performance ===== */}
            <h5 className="f-display mb-3">الأداء حسب المادة</h5>
            <div className="row g-3 mb-4">
              {Object.values(SUBJECTS).map((sub) => {
                const subStats = bySubject[sub.id];
                if (!subStats) return (
                  <div key={sub.id} className="col-sm-6 col-lg-3">
                    <div className="card p-3 text-center opacity-50 shadow-sm" style={{ border: "1px solid var(--c-border)", borderRadius: "1rem" }}>
                      <span style={{ fontSize: "2rem" }}>{sub.icon}</span>
                      <p className="f-display small mt-2 mb-0" style={{ color: sub.color }}>{sub.name}</p>
                      <small className="text-c-light">لم يلعب بعد</small>
                    </div>
                  </div>
                );
                return (
                  <div key={sub.id} className="col-sm-6 col-lg-3">
                    <div className="card p-3 text-center h-100 shadow-sm" style={{ border: `2px solid ${sub.color}30`, borderRadius: "1rem" }}>
                      <span style={{ fontSize: "2rem" }}>{sub.icon}</span>
                      <p className="f-display small mt-2 mb-1" style={{ color: sub.color }}>{sub.name}</p>
                      <div className="f-display fs-4" style={{ color: sub.color }}>{subStats.avgPercentage || 0}%</div>
                      <small className="text-c-light">{subStats.gamesPlayed} لعبة &bull; أفضل: {subStats.bestScore}</small>
                      <div className="game-progress mt-2">
                        <div className="fill" style={{ width: `${subStats.avgPercentage || 0}%`, backgroundColor: sub.color }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ===== Recent Sessions ===== */}
            <h5 className="f-display mb-3">آخر الألعاب</h5>
            {sessions.length === 0 ? (
              <div className="card shadow-sm p-4 text-center" style={{ border: "1px solid var(--c-border)", borderRadius: "1rem" }}>
                <div style={{ fontSize: "2.5rem" }} className="mb-2">🎯</div>
                <p className="text-c-light mb-0">لا توجد ألعاب بعد - أرسل الرابط لطفلك ليبدأ!</p>
              </div>
            ) : (
              <div className="card shadow-sm overflow-hidden" style={{ border: "1px solid var(--c-border)", borderRadius: "1rem" }}>
                <div className="table-responsive">
                  <table className="table table-hover mb-0 f-body small">
                    <thead style={{ background: "rgba(108,92,231,0.05)" }}>
                      <tr>
                        <th className="border-0 py-3 f-display">المادة</th>
                        <th className="border-0 py-3 f-display">الصف</th>
                        <th className="border-0 py-3 f-display">النتيجة</th>
                        <th className="border-0 py-3 f-display">النقاط</th>
                        <th className="border-0 py-3 f-display">التاريخ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.slice(0, 15).map((s, i) => {
                        const sub = SUBJECTS[s.subject];
                        const grade = GRADES[s.grade];
                        return (
                          <tr key={i}>
                            <td className="py-2">{sub?.icon} {sub?.name || s.subject}</td>
                            <td className="py-2">{grade?.shortName || s.grade}</td>
                            <td className="py-2">
                              <span className="badge rounded-pill px-3 py-1"
                                style={{
                                  background: s.percentage >= 70 ? "rgba(0,184,148,0.12)" : s.percentage >= 50 ? "rgba(253,203,110,0.2)" : "rgba(225,112,85,0.12)",
                                  color: s.percentage >= 70 ? "var(--c-correct)" : s.percentage >= 50 ? "#e67e22" : "var(--c-wrong)",
                                  fontWeight: 700,
                                }}>
                                {s.percentage}%
                              </span>
                            </td>
                            <td className="py-2">⭐ {s.score}</td>
                            <td className="py-2 text-c-light">{new Date(s.playedAt).toLocaleDateString("ar-SA")}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
