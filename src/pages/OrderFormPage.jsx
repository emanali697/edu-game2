import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { submitOrder, getAdminPricing, getGiftCards } from "@services/firebase";
import DEFAULT_PRICING, { calculateOrderTotal, mergePricing } from "@data/config/pricing";
import SUBJECTS from "@data/config/subjects";
import VIRTUES from "@data/config/virtues";
import { APP_NAME } from "@utils/constants";

const allSubjects = Object.values(SUBJECTS);
const allVirtues = Object.values(VIRTUES);

const GIFT_CARDS = [
  { id: "card-1", img: "/gift-cards/card-1.jpg", name: "كرت 1" },
  { id: "card-2", img: "/gift-cards/card-2.jpg", name: "كرت 2" },
  { id: "card-3", img: "/gift-cards/card-3.jpg", name: "كرت 3" },
  { id: "card-4", img: "/gift-cards/card-4.jpg", name: "كرت 4" },
  { id: "card-5", img: "/gift-cards/card-5.jpg", name: "كرت 5" },
  { id: "card-6", img: "/gift-cards/card-6.jpg", name: "كرت 6" },
  { id: "card-7", img: "/gift-cards/card-7.jpg", name: "كرت 7" },
  { id: "card-8", img: "/gift-cards/card-8.jpg", name: "كرت 8" },
  { id: "card-9", img: "/gift-cards/card-9.jpg", name: "كرت 9" },
];

const GRADES = [
  { id: "kg1", name: "KG1" }, { id: "kg2", name: "KG2" }, { id: "kg3", name: "KG3" },
  { id: "first", name: "أول ابتدائي" }, { id: "second", name: "ثاني ابتدائي" },
  { id: "third", name: "ثالث ابتدائي" }, { id: "fourth", name: "رابع ابتدائي" },
  { id: "fifth", name: "خامس ابتدائي" }, { id: "sixth", name: "سادس ابتدائي" },
];

function emptyChild() {
  return { name: "", grade: "first", path: "both", subjects: [], virtues: [], package: "" };
}

export default function OrderFormPage() {
  const navigate = useNavigate();
  const [pricing, setPricing] = useState(DEFAULT_PRICING);
  const [parentName, setParentName] = useState("");
  const [phone, setPhone] = useState("");
  const [children, setChildren] = useState([emptyChild()]);
  const [isGift, setIsGift] = useState(false);
  const [giftFrom, setGiftFrom] = useState("");
  const [giftRelation, setGiftRelation] = useState("");
  const [selectedCard, setSelectedCard] = useState("");
  const [giftNote, setGiftNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [allGiftCards, setAllGiftCards] = useState(GIFT_CARDS);

  // Load admin pricing overrides + gift cards from Firebase
  useEffect(() => {
    getAdminPricing().then((p) => { if (p) setPricing(mergePricing(p)); }).catch(() => {});
    getGiftCards().then((cards) => {
      if (cards?.length) {
        const fbCards = cards.map((c) => ({ id: c.id, img: c.img, name: c.name }));
        setAllGiftCards([...GIFT_CARDS, ...fbCards]);
      }
    }).catch(() => {});
  }, []);

  function addChild() {
    if (children.length >= 10) return;
    setChildren([...children, emptyChild()]);
  }

  function removeChild(index) {
    if (children.length <= 1) return;
    setChildren(children.filter((_, i) => i !== index));
  }

  function updateChild(index, field, value) {
    const updated = [...children];
    updated[index] = { ...updated[index], [field]: value };

    // Auto-set subjects/virtues based on path
    if (field === "path") {
      if (value === "academic") {
        updated[index].virtues = [];
      } else if (value === "virtue") {
        updated[index].subjects = [];
      }
    }

    // If package is selected, clear individual selections
    if (field === "package" && value) {
      const pkg = pricing.packages[value];
      if (pkg) {
        if (pkg.includes.subjects === 4) updated[index].subjects = allSubjects.map(s => s.id);
        if (pkg.includes.virtues === 5) updated[index].virtues = allVirtues.map(v => v.id);
      }
    }

    setChildren(updated);
  }

  function toggleItem(index, type, itemId) {
    const updated = [...children];
    const list = updated[index][type];
    if (list.includes(itemId)) {
      updated[index][type] = list.filter((id) => id !== itemId);
    } else {
      updated[index][type] = [...list, itemId];
    }
    updated[index].package = ""; // clear package if manually selecting
    setChildren(updated);
  }

  const total = calculateOrderTotal(pricing, children);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!parentName.trim()) { setError("الرجاء إدخال اسم ولي الأمر"); return; }
    if (!phone.trim() || phone.length < 9) { setError("الرجاء إدخال رقم جوال صحيح"); return; }

    if (isGift) {
      if (!giftFrom.trim()) { setError("الرجاء إدخال اسم المُهدي"); return; }
    } else {
      for (let i = 0; i < children.length; i++) {
        const c = children[i];
        if (!c.name.trim()) { setError(`الرجاء إدخال اسم الطفل ${i + 1}`); return; }
        if (!c.package && c.subjects.length === 0 && c.virtues.length === 0) {
          setError(`الرجاء اختيار مواد أو قيم للطفل ${c.name}`); return;
        }
      }
    }

    setSubmitting(true);
    try {
      const orderData = {
        parentName: parentName.trim(),
        phone: phone.trim(),
        isGift,
        giftCard: selectedCard || null,
        status: "new",
        stage: "new",
        createdAt: new Date().toISOString(),
      };

      if (isGift) {
        orderData.giftFrom = giftFrom.trim();
        orderData.giftRelation = giftRelation.trim() || null;
        orderData.giftNote = giftNote.trim() || null;
      } else {
        orderData.children = children.map((c) => ({
          name: c.name.trim(),
          grade: c.grade,
          path: c.path,
          subjects: c.subjects,
          virtues: c.virtues,
          package: c.package || null,
        }));
        orderData.totalAmount = total;
      }

      await submitOrder(orderData);
      setSubmitted(true);
    } catch (err) {
      setError("حدث خطأ في إرسال الطلب. حاول مرة أخرى.");
      console.warn(err);
    }
    setSubmitting(false);
  }

  // ── Success Screen
  if (submitted) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center p-3 bg-app">
        <div className="text-center" style={{ maxWidth: 450 }}>
          <div style={{ fontSize: "4rem" }} className="mb-3">🎉</div>
          <h2 className="f-display fs-3 mb-3">تم إرسال طلبك بنجاح!</h2>
          <p className="f-body text-c-light mb-2">
            سنتواصل معك عبر الواتساب على الرقم <strong dir="ltr">{phone}</strong> لإتمام عملية الدفع.
          </p>
          {!isGift && <p className="f-body text-c-light mb-4">المبلغ الإجمالي: <strong>{total} ر.س</strong></p>}
          {isGift && <p className="f-body text-c-light mb-4">سنتواصل معك لتحديد الباقة المناسبة للهدية</p>}
          <button onClick={() => navigate("/")} className="btn btn-primary rounded-pill px-4">
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-app min-vh-100 py-4">
      <div className="container" style={{ maxWidth: 700 }}>
        <div className="text-center mb-4">
          <span style={{ fontSize: "2.5rem" }}>📋</span>
          <h1 className="f-display fs-3 mt-2">نموذج الطلب</h1>
          <p className="f-body text-c-light">{APP_NAME} — اطلب الآن وابدأ رحلة التعلّم</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* ── Parent Info ── */}
          <div className="card border-c p-4 mb-3 shadow-sm">
            <h5 className="f-display mb-3">بيانات ولي الأمر</h5>
            <div className="row g-3">
              <div className="col-sm-6">
                <label className="form-label f-body small">اسم ولي الأمر *</label>
                <input type="text" className="form-control rounded-3 border-c"
                  value={parentName} onChange={(e) => setParentName(e.target.value)}
                  placeholder="الاسم الكامل" />
              </div>
              <div className="col-sm-6">
                <label className="form-label f-body small">رقم الجوال (واتساب) *</label>
                <input type="tel" className="form-control rounded-3 border-c" dir="ltr"
                  value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="05XXXXXXXX" />
              </div>
            </div>
          </div>

          {/* ── Gift or Regular Toggle ── */}
          <div className="card border-c p-4 mb-3 shadow-sm">
            <div className="d-flex gap-3">
              <button type="button"
                onClick={() => setIsGift(false)}
                className={`btn flex-fill rounded-pill ${!isGift ? "btn-primary" : "btn-outline-primary"}`}>
                📚 طلب لأطفالي
              </button>
              <button type="button"
                onClick={() => setIsGift(true)}
                className={`btn flex-fill rounded-pill ${isGift ? "btn-primary" : "btn-outline-primary"}`}>
                🎁 هدية لشخص آخر
              </button>
            </div>
          </div>

          {/* ── Gift Section ── */}
          {isGift && (
            <div className="card border-c p-4 mb-3 shadow-sm">
              <h5 className="f-display mb-3">🎁 بيانات الهدية</h5>
              <div className="row g-3">
                <div className="col-sm-6">
                  <label className="form-label f-body small">اسم المُهدي *</label>
                  <input type="text" className="form-control rounded-3 border-c"
                    value={giftFrom} onChange={(e) => setGiftFrom(e.target.value)}
                    placeholder="اسم المُهدي" />
                </div>
                <div className="col-sm-6">
                  <label className="form-label f-body small">صفة المُهدي</label>
                  <input type="text" className="form-control rounded-3 border-c"
                    value={giftRelation} onChange={(e) => setGiftRelation(e.target.value)}
                    placeholder="مثال: خالة، جدة، صديقة" />
                </div>

                <div className="col-12">
                  <label className="form-label f-body small">ملاحظات إضافية (اختياري)</label>
                  <textarea className="form-control rounded-3 border-c" rows="2"
                    value={giftNote} onChange={(e) => setGiftNote(e.target.value)}
                    placeholder="مثلاً: اسم الطفل المُهدى إليه، عمره، أي تفاصيل تساعدنا..." />
                </div>
              </div>
            </div>
          )}

          {/* ── Children (only for non-gift orders) ── */}
          {!isGift && children.map((child, index) => (
            <div key={index} className="card border-c p-4 mb-3 shadow-sm">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="f-display mb-0">الطفل {index + 1}</h5>
                {children.length > 1 && (
                  <button type="button" onClick={() => removeChild(index)}
                    className="btn btn-sm btn-outline-danger rounded-pill px-3">حذف</button>
                )}
              </div>

              <div className="row g-3">
                <div className="col-sm-6">
                  <label className="form-label f-body small">اسم الطفل *</label>
                  <input type="text" className="form-control rounded-3 border-c"
                    value={child.name} onChange={(e) => updateChild(index, "name", e.target.value)}
                    placeholder="اسم الطفل" />
                </div>
                <div className="col-sm-6">
                  <label className="form-label f-body small">الصف الدراسي</label>
                  <select className="form-select rounded-3 border-c"
                    value={child.grade} onChange={(e) => updateChild(index, "grade", e.target.value)}>
                    {GRADES.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>

                {/* Path Selection */}
                <div className="col-12">
                  <label className="form-label f-body small">المسار المطلوب</label>
                  <div className="d-flex gap-2 flex-wrap">
                    {[
                      { id: "both", label: "📚🌉 كلاهما", color: "#6c5ce7" },
                      { id: "academic", label: "📚 تعليمي فقط", color: "#0984e3" },
                      { id: "virtue", label: "🌉 تربوي فقط", color: "#e17055" },
                    ].map((p) => (
                      <button key={p.id} type="button"
                        onClick={() => updateChild(index, "path", p.id)}
                        className={`btn btn-sm rounded-pill px-3 ${child.path === p.id ? "text-white" : ""}`}
                        style={{
                          background: child.path === p.id ? p.color : "transparent",
                          border: `2px solid ${p.color}`,
                          color: child.path === p.id ? "white" : p.color,
                        }}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Package Selection */}
                <div className="col-12">
                  <label className="form-label f-body small">اختر باقة (اختياري)</label>
                  <div className="d-grid gap-2">
                    {Object.values(pricing.packages)
                      .filter((pkg) => {
                        if (child.path === "academic") return pkg.includes.subjects > 0 && pkg.includes.virtues === 0;
                        if (child.path === "virtue") return pkg.includes.virtues > 0 && pkg.includes.subjects === 0;
                        return true;
                      })
                      .map((pkg) => (
                        <button key={pkg.id} type="button"
                          onClick={() => updateChild(index, "package", child.package === pkg.id ? "" : pkg.id)}
                          className="d-flex align-items-center justify-content-between p-3 rounded-3 text-start"
                          style={{
                            border: `2px solid ${child.package === pkg.id ? "var(--c-primary)" : "#e0e0e0"}`,
                            background: child.package === pkg.id ? "#f0eaff" : "white",
                          }}>
                          <div>
                            <span>{pkg.emoji} <strong>{pkg.name}</strong></span>
                            <small className="text-c-light d-block">{pkg.description}</small>
                          </div>
                          <div className="text-end">
                            <div className="f-display" style={{ color: "var(--c-primary)" }}>{pkg.price} ر.س</div>
                            {pkg.originalPrice > pkg.price && (
                              <small className="text-decoration-line-through text-c-light">{pkg.originalPrice} ر.س</small>
                            )}
                          </div>
                        </button>
                      ))}
                  </div>
                </div>

                {/* Individual Subject Selection */}
                {!child.package && (child.path === "both" || child.path === "academic") && (
                  <div className="col-12">
                    <label className="form-label f-body small">
                      المواد التعليمية ({pricing.items.single_subject.price} ر.س / مادة)
                    </label>
                    <div className="d-flex gap-2 flex-wrap">
                      {allSubjects.map((sub) => (
                        <button key={sub.id} type="button"
                          onClick={() => toggleItem(index, "subjects", sub.id)}
                          className="btn btn-sm rounded-pill px-3"
                          style={{
                            background: child.subjects.includes(sub.id) ? sub.color : "transparent",
                            border: `2px solid ${sub.color}`,
                            color: child.subjects.includes(sub.id) ? "white" : sub.color,
                          }}>
                          {sub.icon} {sub.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Individual Virtue Selection */}
                {!child.package && (child.path === "both" || child.path === "virtue") && (
                  <div className="col-12">
                    <label className="form-label f-body small">
                      القيم التربوية ({pricing.items.single_virtue.price} ر.س / قيمة)
                    </label>
                    <div className="d-flex gap-2 flex-wrap">
                      {allVirtues.map((v) => (
                        <button key={v.id} type="button"
                          onClick={() => toggleItem(index, "virtues", v.id)}
                          className="btn btn-sm rounded-pill px-3"
                          style={{
                            background: child.virtues.includes(v.id) ? v.color : "transparent",
                            border: `2px solid ${v.color}`,
                            color: child.virtues.includes(v.id) ? "white" : v.color,
                          }}>
                          {v.icon} {v.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Child discount note */}
                {index > 0 && (
                  <div className="col-12">
                    <small className="text-success f-body">
                      🎉 خصم {pricing.childDiscounts[Math.min(index + 1, 3)] || 0}% للطفل {index === 1 ? "الثاني" : "الإضافي"}
                    </small>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Add Child Button (non-gift only) */}
          {!isGift && children.length < 10 && (
            <button type="button" onClick={addChild}
              className="btn btn-outline-primary rounded-pill w-100 mb-3">
              ➕ إضافة طفل آخر
            </button>
          )}

          {/* ── Gift Card Selection (both flows) ── */}
          <div className="card border-c p-4 mb-3 shadow-sm">
            <h5 className="f-display mb-3">🎁 اختر تصميم كرت الهدية</h5>
            <div className="row g-2">
              {allGiftCards.map((card) => (
                <div key={card.id} className="col-4 col-sm-3">
                  <div
                    onClick={() => setSelectedCard(selectedCard === card.id ? "" : card.id)}
                    className="rounded-3 overflow-hidden position-relative"
                    style={{
                      cursor: "pointer",
                      border: selectedCard === card.id ? "3px solid var(--c-primary)" : "2px solid #e0e0e0",
                      transition: "all 0.2s",
                    }}>
                    <img src={card.img} alt={card.name} className="w-100 d-block" />
                    {selectedCard === card.id && (
                      <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                        style={{ background: "rgba(108,92,231,0.2)" }}>
                        <span className="badge bg-primary rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: 28, height: 28, background: "var(--c-primary)" }}>✓</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Promotions & Total (non-gift only) ── */}
          {!isGift && (
            <>
              {pricing.promotions && Object.values(pricing.promotions).filter(p => p.active).length > 0 && (
                <div className="card border-c p-3 mb-3 shadow-sm" style={{ background: "#fff9e6", borderColor: "#fdcb6e !important" }}>
                  {Object.values(pricing.promotions).filter(p => p.active).map((promo) => (
                    <div key={promo.id} className="d-flex align-items-center gap-2">
                      <span style={{ fontSize: "1.5rem" }}>🏷️</span>
                      <div>
                        <strong className="f-body">{promo.name}</strong>
                        <small className="d-block text-c-light">{promo.description}</small>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="card border-c p-4 mb-3 shadow-sm text-center"
                style={{ background: "linear-gradient(135deg, #f0eaff, #e8f4fd)" }}>
                <p className="f-body text-c-light mb-1">المبلغ الإجمالي</p>
                <div className="f-display fs-2" style={{ color: "var(--c-primary)" }}>{total} ر.س</div>
                <small className="text-c-light">سيتم التواصل معك لإتمام الدفع عبر الواتساب</small>
              </div>
            </>
          )}

          {/* ── Gift summary ── */}
          {isGift && (
            <div className="card border-c p-4 mb-3 shadow-sm text-center"
              style={{ background: "linear-gradient(135deg, #f0eaff, #e8f4fd)" }}>
              <p className="f-body text-c-light mb-1">🎁 طلب هدية</p>
              <p className="f-body mb-0">سنتواصل معك عبر الواتساب لتحديد الباقة المناسبة وإتمام الطلب</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="alert alert-danger text-center f-body mb-3">{error}</div>
          )}

          {/* Submit */}
          <button type="submit" disabled={submitting}
            className="btn btn-primary btn-lg rounded-pill w-100 f-display">
            {submitting ? (
              <><span className="spinner-border spinner-border-sm me-2" /> جاري الإرسال...</>
            ) : (
              "إرسال الطلب 🚀"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
