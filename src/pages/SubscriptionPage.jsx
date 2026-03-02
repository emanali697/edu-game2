import { useState, useEffect } from "react";
import { useAuth } from "@context/AuthContext";
import { isSubscriptionActive, getPaymentHistory, recordPayment } from "@services/firebase";
import { PLANS } from "@utils/constants";

export default function SubscriptionPage() {
  const { user, userData } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [showSuccess, setShowSuccess] = useState(false);

  const subscription = userData?.subscription || {};

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  async function loadData() {
    setLoading(true);
    try {
      const [active, hist] = await Promise.all([
        isSubscriptionActive(user.uid),
        getPaymentHistory(user.uid),
      ]);
      setIsActive(active);
      setPayments(hist || []);
    } catch (e) { console.warn(e); }
    setLoading(false);
  }

  async function handlePayment() {
    setProcessing(true);
    try {
      // في Phase 2 الفعلي: هنا نربط مع Moyasar/Tap
      // حالياً: نسجل الدفعة مباشرة (للتطوير)
      const plan = PLANS[selectedPlan.toUpperCase()] || PLANS.MONTHLY;
      await recordPayment(user.uid, {
        amount: plan.price,
        method: "demo",
        plan: plan.id,
        status: "completed",
        transactionId: `demo_${Date.now()}`,
      });
      setShowSuccess(true);
      await loadData();
      setTimeout(() => setShowSuccess(false), 4000);
    } catch (e) {
      console.warn(e);
    }
    setProcessing(false);
  }

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-c-primary" />
      </div>
    );
  }

  const daysLeft = subscription.expiresAt
    ? Math.max(0, Math.ceil((new Date(subscription.expiresAt) - new Date()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="bg-app min-vh-100 py-4">
      <div className="container" style={{ maxWidth: 700 }}>
        <h1 className="f-display fs-3 mb-4">الاشتراك 💳</h1>

        {/* Success Alert */}
        {showSuccess && (
          <div className="alert alert-success d-flex align-items-center gap-2 anim-fade-up">
            <span style={{ fontSize: "1.5rem" }}>🎉</span>
            <span className="f-body">تم تفعيل اشتراكك بنجاح!</span>
          </div>
        )}

        {/* Current Status */}
        <div className="card border-c shadow-sm p-4 mb-4">
          <h5 className="f-display mb-3">حالة اشتراكك</h5>
          <div className="row g-3">
            <div className="col-sm-4 text-center">
              <div style={{ fontSize: "2.5rem" }}>{isActive ? "✅" : "⏰"}</div>
              <div className="f-display small mt-1">{isActive ? "فعّال" : "منتهي"}</div>
            </div>
            <div className="col-sm-4 text-center">
              <div className="f-display fs-3 text-c-primary">{subscription.plan === "yearly" ? "سنوي" : subscription.plan === "monthly" ? "شهري" : "تجربة"}</div>
              <small className="text-c-light">نوع الخطة</small>
            </div>
            <div className="col-sm-4 text-center">
              <div className="f-display fs-3" style={{ color: daysLeft <= 3 ? "var(--c-wrong)" : "var(--c-correct)" }}>{daysLeft}</div>
              <small className="text-c-light">يوم متبقي</small>
            </div>
          </div>
          {daysLeft <= 3 && daysLeft > 0 && (
            <div className="alert alert-warning f-body small mt-3 mb-0 py-2">
              ⚠️ اشتراكك ينتهي قريباً! جدّد الآن عشان طفلك يستمر في التعلم.
            </div>
          )}
        </div>

        {/* Plans */}
        <h5 className="f-display mb-3">اختر خطتك</h5>
        <div className="row g-3 mb-4">
          {/* Monthly */}
          <div className="col-sm-6">
            <div className={`card p-4 text-center h-100 cursor-pointer`}
              style={{
                border: selectedPlan === "monthly" ? "2px solid var(--c-primary)" : "2px solid var(--c-border)",
                background: selectedPlan === "monthly" ? "rgba(108,92,231,0.03)" : "#fff",
                cursor: "pointer",
              }}
              onClick={() => setSelectedPlan("monthly")}>
              {selectedPlan === "monthly" && <div className="position-absolute top-0 end-0 m-2">✅</div>}
              <div className="f-display fs-5 mb-2">📅 شهري</div>
              <div className="f-display text-c-primary" style={{ fontSize: "2.5rem" }}>29</div>
              <div className="f-body text-c-light">ريال / شهر</div>
              <hr className="border-c" />
              <ul className="list-unstyled f-body small text-start mb-0">
                <li className="mb-1">✅ جميع المواد والصفوف</li>
                <li className="mb-1">✅ لوحة تحكم الأهل</li>
                <li className="mb-1">✅ نظام الإنجازات</li>
                <li>✅ بدون إعلانات</li>
              </ul>
            </div>
          </div>

          {/* Yearly */}
          <div className="col-sm-6">
            <div className={`card p-4 text-center h-100 position-relative`}
              style={{
                border: selectedPlan === "yearly" ? "2px solid var(--c-primary)" : "2px solid var(--c-border)",
                background: selectedPlan === "yearly" ? "rgba(108,92,231,0.03)" : "#fff",
                cursor: "pointer",
              }}
              onClick={() => setSelectedPlan("yearly")}>
              <div className="position-absolute top-0 start-50 translate-middle">
                <span className="badge rounded-pill text-white px-3 py-1" style={{ background: "var(--c-correct)", fontSize: "0.7rem" }}>وفّر 30%!</span>
              </div>
              {selectedPlan === "yearly" && <div className="position-absolute top-0 end-0 m-2">✅</div>}
              <div className="f-display fs-5 mb-2 mt-2">⭐ سنوي</div>
              <div className="f-display text-c-primary" style={{ fontSize: "2.5rem" }}>249</div>
              <div className="f-body text-c-light">ريال / سنة</div>
              <div className="f-body small text-c-correct">(٢٠.٧٥ ريال/شهر)</div>
              <hr className="border-c" />
              <ul className="list-unstyled f-body small text-start mb-0">
                <li className="mb-1">✅ كل مميزات الشهري</li>
                <li className="mb-1">✅ التحديات الموسمية</li>
                <li className="mb-1">✅ أولوية الدعم الفني</li>
                <li>✅ توفير ١٠٠ ريال</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Pay Button */}
        <button onClick={handlePayment} disabled={processing} className="btn btn-primary btn-lg w-100 mb-2">
          {processing ? (
            <><span className="spinner-border spinner-border-sm me-2" /> جاري المعالجة...</>
          ) : (
            <>💳 اشترك الآن - {selectedPlan === "yearly" ? "249" : "29"} ريال</>
          )}
        </button>
        <p className="f-body small text-c-light text-center mb-4">يدعم: مدى • فيزا • ماستركارد • آبل باي</p>

        {/* Payment Methods Icons */}
        <div className="d-flex justify-content-center gap-3 mb-4 opacity-50">
          {["💳 مدى", "💳 فيزا", "💳 ماستر", "📱 آبل باي"].map((m) => (
            <span key={m} className="badge bg-light text-c-light border rounded-pill px-2 py-1" style={{ fontSize: "0.7rem" }}>{m}</span>
          ))}
        </div>

        {/* Payment History */}
        {payments.length > 0 && (
          <>
            <h5 className="f-display mb-3">سجل المدفوعات</h5>
            <div className="card border-c overflow-hidden">
              <div className="table-responsive">
                <table className="table table-hover mb-0 f-body small">
                  <thead style={{ background: "#f8f5ff" }}>
                    <tr>
                      <th className="border-0 py-3">التاريخ</th>
                      <th className="border-0 py-3">الخطة</th>
                      <th className="border-0 py-3">المبلغ</th>
                      <th className="border-0 py-3">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p, i) => (
                      <tr key={i}>
                        <td className="py-2">{new Date(p.paidAt).toLocaleDateString("ar-SA")}</td>
                        <td className="py-2">{p.plan === "yearly" ? "سنوي" : "شهري"}</td>
                        <td className="py-2">{p.amount} ريال</td>
                        <td className="py-2">
                          <span className="badge rounded-pill bg-success bg-opacity-10 text-c-correct">{p.status === "completed" ? "مكتمل" : "معلق"}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
