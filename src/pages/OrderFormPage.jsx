import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { submitOrder, getAdminPricing, getGiftCards } from "@services/firebase";
import DEFAULT_PRICING, { calculateOrderTotal, mergePricing } from "@data/config/pricing";
import SUBJECTS from "@data/config/subjects";
import VIRTUES from "@data/config/virtues";
import { APP_NAME, SUPPORT_WHATSAPP } from "@utils/constants";

const allSubjects = Object.values(SUBJECTS);
const allVirtues = Object.values(VIRTUES);

const GIFT_CARDS = [
  // gender: "boys" | "girls" | "unisex"
  // ── أولاد ──
  { id: "male-1", img: "/gift-cards/male-1.jpg", name: "كرت أولاد 1", gender: "boys" },
  { id: "male-2", img: "/gift-cards/male-2.jpg", name: "كرت أولاد 2", gender: "boys" },
  { id: "male-3", img: "/gift-cards/male-3.jpg", name: "كرت أولاد 3", gender: "boys" },
  { id: "male-4", img: "/gift-cards/male-4.jpg", name: "كرت أولاد 4", gender: "boys" },
  { id: "male-5", img: "/gift-cards/male-5.jpg", name: "كرت أولاد 5", gender: "boys" },
  { id: "male-6", img: "/gift-cards/male-6.jpg", name: "كرت أولاد 6", gender: "boys" },
  { id: "male-7", img: "/gift-cards/male-7.jpg", name: "كرت أولاد 7", gender: "boys" },
  { id: "male-8", img: "/gift-cards/male-8.jpg", name: "كرت أولاد 8", gender: "boys" },
  { id: "male-9", img: "/gift-cards/male-9.jpg", name: "كرت أولاد 9", gender: "boys" },
  { id: "male-10", img: "/gift-cards/male-10.jpg", name: "كرت أولاد 10", gender: "boys" },
  { id: "male-11", img: "/gift-cards/male-11.jpg", name: "كرت أولاد 11", gender: "boys" },
  { id: "male-12", img: "/gift-cards/male-12.jpg", name: "كرت أولاد 12", gender: "boys" },
  // ── بنات ──
  { id: "female-1", img: "/gift-cards/female-1.jpg", name: "كرت بنات 1", gender: "girls" },
  { id: "female-2", img: "/gift-cards/female-2.jpg", name: "كرت بنات 2", gender: "girls" },
  { id: "female-3", img: "/gift-cards/female-3.jpg", name: "كرت بنات 3", gender: "girls" },
  { id: "female-4", img: "/gift-cards/female-4.jpg", name: "كرت بنات 4", gender: "girls" },
  { id: "female-5", img: "/gift-cards/female-5.jpg", name: "كرت بنات 5", gender: "girls" },
  { id: "female-6", img: "/gift-cards/female-6.jpg", name: "كرت بنات 6", gender: "girls" },
  { id: "female-7", img: "/gift-cards/female-7.jpg", name: "كرت بنات 7", gender: "girls" },
  { id: "female-8", img: "/gift-cards/female-8.jpg", name: "كرت بنات 8", gender: "girls" },
  { id: "female-9", img: "/gift-cards/female-9.jpg", name: "كرت بنات 9", gender: "girls" },
  { id: "female-10", img: "/gift-cards/female-10.jpg", name: "كرت بنات 10", gender: "girls" },
  { id: "female-11", img: "/gift-cards/female-11.jpg", name: "كرت بنات 11", gender: "girls" },
  { id: "female-12", img: "/gift-cards/female-12.jpg", name: "كرت بنات 12", gender: "girls" },
  { id: "female-13", img: "/gift-cards/female-13.jpg", name: "كرت بنات 13", gender: "girls" },
  // ── مشترك ──
  { id: "both-1", img: "/gift-cards/both-1.jpg", name: "كرت مشترك 1", gender: "unisex" },
  { id: "both-2", img: "/gift-cards/both-2.jpg", name: "كرت مشترك 2", gender: "unisex" },
];

const CARD_GENDER_LABELS = { boys: "👦 أولاد", girls: "👧 بنات", unisex: "👶 مشترك" };


const GRADES = [
  { id: "kg1", name: "KG1" }, { id: "kg2", name: "KG2" }, { id: "kg3", name: "KG3" },
  { id: "first", name: "أول ابتدائي" }, { id: "second", name: "ثاني ابتدائي" },
  { id: "third", name: "ثالث ابتدائي" }, { id: "fourth", name: "رابع ابتدائي" },
  { id: "fifth", name: "خامس ابتدائي" }, { id: "sixth", name: "سادس ابتدائي" },
];

function emptyChild() {
  return { name: "", grade: "first", path: "both", subjects: [], virtues: [], package: "", wantsGiftCard: false, selectedCard: "", giftNote: "" };
}

export default function OrderFormPage() {
  const navigate = useNavigate();
  const [pricing, setPricing] = useState(DEFAULT_PRICING);
  const [parentName, setParentName] = useState("");
  const [phone, setPhone] = useState("");
  const [children, setChildren] = useState([emptyChild()]);
  const [submitting, setSubmitting] = useState(false);
  const [previewCard, setPreviewCard] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [allGiftCards, setAllGiftCards] = useState(GIFT_CARDS);

  // Load admin pricing overrides + gift cards from Firebase
  useEffect(() => {
    getAdminPricing().then((p) => { if (p) setPricing(mergePricing(p)); }).catch(() => {});
    getGiftCards().then((cards) => {
      if (cards?.length) {
        const fbCards = cards
          .filter((c) => c.img)
          .map((c) => ({ id: c.id, img: c.img, name: c.name, gender: c.gender || "unisex" }));
        if (fbCards.length) setAllGiftCards([...GIFT_CARDS, ...fbCards]);
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

    // If package is selected, auto-fill selections
    if (field === "package" && value) {
      const pkg = pricing.packages[value];
      if (pkg) {
        if (pkg.includes.subjects >= 4) updated[index].subjects = allSubjects.map(s => s.id);
        else if (pkg.includes.subjects === 1) updated[index].subjects = []; // user picks 1
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

    if (!parentName.trim()) { setError("الرجاء إدخال الاسم"); return; }
    // Saudi phone validation: 05XXXXXXXX (10 digits) or +9665XXXXXXXX (13 chars) or 9665XXXXXXXX (12 digits)
    const cleanPhone = phone.trim().replace(/\s|-/g, "");
    if (!cleanPhone) { setError("الرجاء إدخال رقم الجوال"); return; }
    const saudiRegex = /^(05\d{8}|5\d{8}|\+?966\s?5\d{8})$/;
    if (!saudiRegex.test(cleanPhone)) {
      setError("الرجاء إدخال رقم جوال سعودي صحيح (مثال: 05XXXXXXXX)");
      return;
    }

    for (let i = 0; i < children.length; i++) {
      const c = children[i];
      if (!c.name.trim()) { setError(`الرجاء إدخال اسم الطفل ${i + 1}`); return; }
      if (!c.package && c.subjects.length === 0 && c.virtues.length === 0) {
        setError(`الرجاء اختيار مواد أو قيم للطفل ${c.name}`); return;
      }
    }

    setSubmitting(true);
    try {
      const orderData = {
        parentName: parentName.trim(),
        phone: phone.trim(),
        children: children.map((c) => ({
          name: c.name.trim(),
          grade: c.grade,
          path: c.path,
          subjects: c.subjects,
          virtues: c.virtues,
          package: c.package || null,
          giftCard: c.wantsGiftCard ? (c.selectedCard || null) : null,
          giftNote: c.wantsGiftCard ? (c.giftNote.trim() || null) : null,
        })),
        totalAmount: total,
        status: "new",
        stage: "new",
        createdAt: new Date().toISOString(),
      };

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
          <p className="f-body text-c-light mb-4">المبلغ الإجمالي: <strong>{total} ر.س</strong></p>
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

        {/* ── Discounts & Promotions Banner ── */}
        <div className="card border-0 mb-4 shadow-sm overflow-hidden" style={{ background: "linear-gradient(135deg, #fff9e6, #fff3cd)" }}>
          {/* Active promotions */}
          {pricing.promotions && Object.values(pricing.promotions).filter(p => p.active).length > 0 && (
            <div className="p-3 text-center" style={{ background: "linear-gradient(135deg, #e17055, #d63031)", color: "white" }}>
              {Object.values(pricing.promotions).filter(p => p.active).map((promo) => (
                <div key={promo.id}>
                  <span style={{ fontSize: "1.5rem" }}>🔥</span>
                  <h5 className="f-display fs-5 mb-1 mt-1">{promo.name}</h5>
                  <p className="f-body mb-0 small" style={{ opacity: 0.9 }}>{promo.description}</p>
                </div>
              ))}
            </div>
          )}
          {/* Child discounts */}
          <div className="p-3">
            <p className="f-body small text-center mb-2">👨‍👩‍👧‍👦 يمكنك إضافة حتى 10 أطفال في نفس الطلب!</p>
            <div className="d-flex flex-wrap justify-content-center gap-3 text-center">
              <div className="d-flex align-items-center gap-2">
                <span className="badge rounded-pill px-3 py-2 f-display" style={{ background: "#00b894", color: "white", fontSize: "1rem" }}>15%</span>
                <span className="f-body small">خصم للطفل الثاني</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="badge rounded-pill px-3 py-2 f-display" style={{ background: "#6c5ce7", color: "white", fontSize: "1rem" }}>25%</span>
                <span className="f-body small">خصم لكل طفل إضافي</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* ── Parent Info ── */}
          <div className="card border-c p-4 mb-3 shadow-sm">
            <h5 className="f-display mb-3">بيانات مشتري اللعبة</h5>
            <div className="row g-3">
              <div className="col-sm-6">
                <label className="form-label f-body small">الاسم الأول والأخير *</label>
                <input type="text" className="form-control rounded-3 border-c"
                  value={parentName} onChange={(e) => setParentName(e.target.value)}
                  placeholder="الاسم الأول والأخير" />
              </div>
              <div className="col-sm-6">
                <label className="form-label f-body small">رقم الجوال (واتساب) *</label>
                <input type="tel" className="form-control rounded-3 border-c" dir="ltr"
                  value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="05XXXXXXXX" />
              </div>
            </div>
          </div>

          {/* ── Children ── */}
          {children.map((child, index) => (
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
                  <label className="form-label f-body small">
                    الصف الدراسي {child.path !== "virtue" && <span className="text-danger">*</span>}
                    {child.path === "virtue" && <span className="text-c-light">(اختياري)</span>}
                  </label>
                  <select className="form-select rounded-3 border-c"
                    value={child.grade} onChange={(e) => updateChild(index, "grade", e.target.value)}>
                    {child.path === "virtue" && <option value="">— غير محدد —</option>}
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
                        // "both" — show only packages that include both subjects AND virtues
                        return pkg.includes.subjects > 0 && pkg.includes.virtues > 0;
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

                {/* Excellence Package: Pick 1 subject */}
                {child.package && pricing.packages[child.package]?.includes?.subjects === 1 && (
                  <div className="col-12">
                    <label className="form-label f-body small">اختر المادة التعليمية المطلوبة *</label>
                    <div className="d-flex gap-2 flex-wrap">
                      {allSubjects.map((sub) => (
                        <button key={sub.id} type="button"
                          onClick={() => {
                            const updated = [...children];
                            updated[index].subjects = [sub.id];
                            setChildren(updated);
                          }}
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
                    {child.subjects.length === 0 && (
                      <small className="text-danger">يرجى اختيار مادة واحدة</small>
                    )}
                  </div>
                )}

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
                    <div className="alert alert-success py-2 mb-0 f-body small">
                      🎉 خصم {index === 1 ? "15%" : "25%"} {index === 1 ? "للطفل الثاني" : "لكل طفل إضافي"} — يُطبّق تلقائياً!
                    </div>
                  </div>
                )}

                {/* Gift Card per child */}
                <div className="col-12 mt-2">
                  <div className="form-check form-switch">
                    <input type="checkbox" className="form-check-input" role="switch" id={`giftCard-${index}`}
                      checked={child.wantsGiftCard} onChange={(e) => {
                        updateChild(index, "wantsGiftCard", e.target.checked);
                        if (!e.target.checked) { updateChild(index, "selectedCard", ""); updateChild(index, "giftNote", ""); }
                      }} />
                    <label className="form-check-label f-body small" htmlFor={`giftCard-${index}`}>
                      🎁 إضافة كارت هدية لـ{child.name || `الطفل ${index + 1}`}
                    </label>
                  </div>

                  {child.wantsGiftCard && (
                    <div className="mt-2 p-3 rounded-3" style={{ background: "#faf7ff" }}>
                      {/* Card gender filter */}
                      <div className="mb-3">
                        <label className="form-label f-body small mb-2">التصنيف</label>
                        <div className="d-flex gap-2 flex-wrap">
                          {[{ id: "", label: "الكل" }, { id: "boys", label: CARD_GENDER_LABELS.boys }, { id: "girls", label: CARD_GENDER_LABELS.girls }, { id: "unisex", label: CARD_GENDER_LABELS.unisex }].map((g) => (
                            <button key={g.id} type="button"
                              onClick={() => updateChild(index, "cardGenderFilter", (child.cardGenderFilter || "") === g.id ? "" : g.id)}
                              className={`btn btn-sm rounded-pill px-3 ${(child.cardGenderFilter || "") === g.id ? "btn-primary" : "btn-outline-secondary"}`}>
                              {g.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Filtered cards */}
                      <label className="form-label f-body small mb-2">اختر تصميم الكرت</label>
                      <p className="f-body small text-c-light mb-2">💡 المساحة الفارغة في التصميم هي مكان الـ QR Code — يُضاف تلقائياً عند توليد الكارت</p>
                      <div className="row g-2 mb-3">
                        {allGiftCards
                          .filter((card) => {
                            const gf = child.cardGenderFilter || "";
                            if (gf && card.gender && card.gender !== gf) return false;
                            return true;
                          })
                          .map((card) => (
                          <div key={card.id} className="col-6 col-sm-4">
                            <div
                              className="rounded-3 overflow-hidden position-relative"
                              style={{
                                cursor: "pointer",
                                border: child.selectedCard === card.id ? "3px solid var(--c-primary)" : "2px solid #e0e0e0",
                                transition: "all 0.2s",
                              }}>
                              <img src={card.img} alt={card.name} className="w-100 d-block"
                                onClick={() => setPreviewCard({ ...card, childIndex: index })} />
                              {child.selectedCard === card.id && (
                                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                                  style={{ background: "rgba(108,92,231,0.2)", pointerEvents: "none" }}>
                                  <span className="badge bg-primary rounded-circle d-flex align-items-center justify-content-center"
                                    style={{ width: 28, height: 28, background: "var(--c-primary)" }}>✓</span>
                                </div>
                              )}
                            </div>
                            <small className="d-block text-center text-c-light mt-1" style={{ fontSize: "0.65rem" }}>
                              {card.gender === "boys" ? "👦" : card.gender === "girls" ? "👧" : "👶"}
                            </small>
                          </div>
                        ))}
                      </div>

                      {/* Gift note — only for writable cards or no card selected */}
                      <label className="form-label f-body small">جملة الإهداء (اختياري)</label>
                      <small className="text-c-light d-block mb-2">💡 ما تكتبه هنا سيظهر كرسالة هدية — مثال: "أبوك الحنون صالح"</small>
                      <input type="text" className="form-control rounded-3 border-c"
                        value={child.giftNote} onChange={(e) => updateChild(index, "giftNote", e.target.value)}
                        placeholder="مثال: كل عام وأنت بخير يا بطل!" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Add Child Button */}
          {children.length < 10 ? (
            <button type="button" onClick={addChild}
              className="btn btn-outline-primary rounded-pill w-100 mb-3">
              ➕ إضافة طفل آخر
            </button>
          ) : (
            <div className="alert alert-info text-center f-body mb-3" style={{ background: "#e8f4fd", border: "1px solid #b3d9f2" }}>
              الحد الأقصى للطلبات 10 أطفال، في حالة الرغبة في إضافة أطفال أكثر تواصل معنا
              <a href={`https://wa.me/${SUPPORT_WHATSAPP}`} target="_blank" rel="noopener noreferrer"
                className="btn btn-sm btn-success rounded-pill px-3 ms-2">💬 تواصل معنا</a>
            </div>
          )}

          {/* ── Promotions & Total ── */}
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

      {/* Card Preview Modal */}
      {previewCard && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: "rgba(0,0,0,0.7)", zIndex: 9999 }}
          onClick={() => setPreviewCard(null)}>
          <div className="position-relative mx-3" style={{ maxWidth: 500, width: "100%" }}
            onClick={(e) => e.stopPropagation()}>
            <img src={previewCard.img} alt={previewCard.name} className="w-100 rounded-4 shadow-lg d-block" />
            <button type="button" onClick={() => setPreviewCard(null)}
              className="position-absolute btn btn-light rounded-circle d-flex align-items-center justify-content-center shadow"
              style={{ top: -12, right: -12, width: 36, height: 36, fontSize: "1.1rem" }}>✕</button>
            <div className="text-center mt-3">
              <button type="button" onClick={() => {
                updateChild(previewCard.childIndex, "selectedCard", previewCard.id);
                setPreviewCard(null);
              }} className="btn btn-primary rounded-pill px-4 f-display">
                ✅ اختر هذا الكارت
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
