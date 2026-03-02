import { useState, useEffect } from "react";
import { useAuth } from "@context/AuthContext";
import { getAdminDashboard, getAllOrders, updateOrderStatus, getActiveChallenges, createChallenge } from "@services/firebase";

export default function AdminPage() {
  const { isAdmin } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [orders, setOrders] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showNewChallenge, setShowNewChallenge] = useState(false);
  const [challengeForm, setChallengeForm] = useState({
    title: "", description: "", type: "score", subject: "all", targetValue: 100,
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [dash, ord, chal] = await Promise.all([
        getAdminDashboard(),
        getAllOrders(50),
        getActiveChallenges(),
      ]);
      setDashboard(dash);
      setOrders(ord || []);
      setChallenges(chal || []);
    } catch (e) { console.warn(e); }
    setLoading(false);
  }

  async function handleOrderStatus(orderId, status) {
    await updateOrderStatus(orderId, status);
    loadData();
  }

  async function handleCreateChallenge() {
    if (!challengeForm.title) return;
    await createChallenge(challengeForm);
    setShowNewChallenge(false);
    setChallengeForm({ title: "", description: "", type: "score", subject: "all", targetValue: 100,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    });
    loadData();
  }

  if (!isAdmin) return <div className="text-center py-5 f-display fs-4">⛔ غير مصرح</div>;

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-c-primary" />
      </div>
    );
  }

  const d = dashboard || {};

  const tabs = [
    { id: "overview", label: "📊 نظرة عامة" },
    { id: "orders", label: `📦 الطلبات (${orders.length})` },
    { id: "challenges", label: `🏆 التحديات (${challenges.length})` },
  ];

  return (
    <div className="bg-app min-vh-100 py-4">
      <div className="container" style={{ maxWidth: 1000 }}>
        <h1 className="f-display fs-3 mb-4">لوحة الإدارة 🛠️</h1>

        {/* Tabs */}
        <div className="d-flex gap-2 mb-4 flex-wrap">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`btn rounded-pill px-3 py-2 f-display small ${activeTab === tab.id ? "btn-primary" : "btn-outline-secondary"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ===== OVERVIEW TAB ===== */}
        {activeTab === "overview" && (
          <div className="anim-fade-up">
            <div className="row g-3 mb-4">
              {[
                { label: "إجمالي المستخدمين", value: d.totalUsers || 0, icon: "👥", color: "var(--c-primary)" },
                { label: "إجمالي الأطفال", value: d.totalChildren || 0, icon: "👶", color: "#00b894" },
                { label: "إجمالي الألعاب", value: d.totalGames || 0, icon: "🎮", color: "#fd79a8" },
                { label: "إجمالي الإيرادات", value: `${d.totalRevenue || 0} ر.س`, icon: "💰", color: "#fdcb6e" },
              ].map((item, i) => (
                <div key={i} className="col-sm-6 col-lg-3">
                  <div className="card border-c p-4 text-center h-100 shadow-sm">
                    <div style={{ fontSize: "2rem" }}>{item.icon}</div>
                    <div className="f-display fs-3 mt-2" style={{ color: item.color }}>{item.value}</div>
                    <small className="f-body text-c-light">{item.label}</small>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="card border-c p-4">
              <h5 className="f-display mb-3">معلومات سريعة</h5>
              <div className="row g-3 f-body">
                <div className="col-sm-6">
                  <p className="mb-2">📈 معدل الألعاب لكل طفل: <strong>{d.totalChildren ? (d.totalGames / d.totalChildren).toFixed(1) : 0}</strong></p>
                  <p className="mb-2">💵 متوسط الإيراد لكل مستخدم: <strong>{d.totalUsers ? (d.totalRevenue / d.totalUsers).toFixed(0) : 0} ر.س</strong></p>
                </div>
                <div className="col-sm-6">
                  <p className="mb-2">📦 الطلبات المعلقة: <strong>{orders.filter(o => o.status === "pending").length}</strong></p>
                  <p className="mb-2">🏆 التحديات النشطة: <strong>{challenges.length}</strong></p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== ORDERS TAB ===== */}
        {activeTab === "orders" && (
          <div className="anim-fade-up">
            {orders.length === 0 ? (
              <div className="card border-c p-5 text-center">
                <p className="f-body text-c-light mb-0">لا توجد طلبات بعد</p>
              </div>
            ) : (
              <div className="card border-c overflow-hidden">
                <div className="table-responsive">
                  <table className="table table-hover mb-0 f-body small">
                    <thead style={{ background: "#f8f5ff" }}>
                      <tr>
                        <th className="border-0 py-3">الاسم</th>
                        <th className="border-0 py-3">الجوال</th>
                        <th className="border-0 py-3">الخطة</th>
                        <th className="border-0 py-3">المبلغ</th>
                        <th className="border-0 py-3">الحالة</th>
                        <th className="border-0 py-3">التاريخ</th>
                        <th className="border-0 py-3">إجراء</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr key={o.id}>
                          <td className="py-2">{o.parentName || o.childName || "—"}</td>
                          <td className="py-2" dir="ltr">{o.phone || "—"}</td>
                          <td className="py-2">{o.plan === "yearly" ? "سنوي" : o.plan === "monthly" ? "شهري" : "تجربة"}</td>
                          <td className="py-2">{o.amount || 0} ر.س</td>
                          <td className="py-2">
                            <span className={`badge rounded-pill ${o.status === "completed" ? "bg-success" : o.status === "cancelled" ? "bg-danger" : "bg-warning"} bg-opacity-10`}
                              style={{ color: o.status === "completed" ? "var(--c-correct)" : o.status === "cancelled" ? "var(--c-wrong)" : "#e67e22" }}>
                              {o.status === "completed" ? "مكتمل" : o.status === "cancelled" ? "ملغي" : "معلق"}
                            </span>
                          </td>
                          <td className="py-2">{o.createdAt ? new Date(o.createdAt).toLocaleDateString("ar-SA") : "—"}</td>
                          <td className="py-2">
                            {o.status === "pending" && (
                              <div className="d-flex gap-1">
                                <button onClick={() => handleOrderStatus(o.id, "completed")} className="btn btn-sm btn-outline-success py-0 px-2">✓</button>
                                <button onClick={() => handleOrderStatus(o.id, "cancelled")} className="btn btn-sm btn-outline-danger py-0 px-2">✕</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== CHALLENGES TAB ===== */}
        {activeTab === "challenges" && (
          <div className="anim-fade-up">
            <button onClick={() => setShowNewChallenge(!showNewChallenge)} className="btn btn-primary mb-3">
              {showNewChallenge ? "✕ إلغاء" : "➕ تحدي جديد"}
            </button>

            {/* New Challenge Form */}
            {showNewChallenge && (
              <div className="card border-c p-4 mb-4 anim-fade-up">
                <h5 className="f-display mb-3">إنشاء تحدي جديد</h5>
                <div className="row g-3">
                  <div className="col-sm-6">
                    <label className="form-label f-body small">عنوان التحدي</label>
                    <input type="text" className="form-control rounded-3 border-c" placeholder="مثال: تحدي رمضان"
                      value={challengeForm.title} onChange={(e) => setChallengeForm({ ...challengeForm, title: e.target.value })} />
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label f-body small">النوع</label>
                    <select className="form-select rounded-3 border-c" value={challengeForm.type}
                      onChange={(e) => setChallengeForm({ ...challengeForm, type: e.target.value })}>
                      <option value="score">أعلى نقاط</option>
                      <option value="streak">أطول سلسلة</option>
                      <option value="games_count">أكثر ألعاب</option>
                    </select>
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label f-body small">المادة</label>
                    <select className="form-select rounded-3 border-c" value={challengeForm.subject}
                      onChange={(e) => setChallengeForm({ ...challengeForm, subject: e.target.value })}>
                      <option value="all">جميع المواد</option>
                      <option value="math">رياضيات</option>
                      <option value="arabic">عربي</option>
                      <option value="english">إنجليزي</option>
                      <option value="science">علوم</option>
                    </select>
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label f-body small">الهدف</label>
                    <input type="number" className="form-control rounded-3 border-c"
                      value={challengeForm.targetValue} onChange={(e) => setChallengeForm({ ...challengeForm, targetValue: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label f-body small">تاريخ البداية</label>
                    <input type="date" className="form-control rounded-3 border-c" dir="ltr"
                      value={challengeForm.startDate} onChange={(e) => setChallengeForm({ ...challengeForm, startDate: e.target.value })} />
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label f-body small">تاريخ النهاية</label>
                    <input type="date" className="form-control rounded-3 border-c" dir="ltr"
                      value={challengeForm.endDate} onChange={(e) => setChallengeForm({ ...challengeForm, endDate: e.target.value })} />
                  </div>
                  <div className="col-12">
                    <label className="form-label f-body small">الوصف</label>
                    <textarea className="form-control rounded-3 border-c" rows="2" placeholder="وصف التحدي..."
                      value={challengeForm.description} onChange={(e) => setChallengeForm({ ...challengeForm, description: e.target.value })} />
                  </div>
                  <div className="col-12">
                    <button onClick={handleCreateChallenge} className="btn btn-primary">إنشاء التحدي 🏆</button>
                  </div>
                </div>
              </div>
            )}

            {/* Active Challenges List */}
            {challenges.length === 0 ? (
              <div className="card border-c p-5 text-center">
                <p className="f-body text-c-light mb-0">لا توجد تحديات نشطة</p>
              </div>
            ) : (
              <div className="row g-3">
                {challenges.map((c) => (
                  <div key={c.id} className="col-sm-6">
                    <div className="card border-c p-4 h-100">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="f-display mb-0">{c.info?.title}</h5>
                        <span className="badge rounded-pill bg-success bg-opacity-10 text-c-correct">نشط</span>
                      </div>
                      <p className="f-body small text-c-light mb-2">{c.info?.description}</p>
                      <div className="d-flex gap-3 f-body small text-c-light">
                        <span>📅 {c.info?.startDate} → {c.info?.endDate}</span>
                      </div>
                      <div className="d-flex gap-3 f-body small text-c-light mt-1">
                        <span>🎯 {c.info?.type === "score" ? "أعلى نقاط" : c.info?.type === "streak" ? "أطول سلسلة" : "أكثر ألعاب"}</span>
                        <span>📚 {c.info?.subject === "all" ? "جميع المواد" : c.info?.subject}</span>
                      </div>
                      <div className="mt-2">
                        <small className="text-c-light">👥 {Object.keys(c.leaderboard || {}).length} مشارك</small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
