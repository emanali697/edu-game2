import { useState, useEffect, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useAuth } from "@context/AuthContext";
import {
  getAdminDashboard, getAllOrders, updateOrderStage, updateOrderChecklist,
  getActiveChallenges, createChallenge,
  getAdminPricing, saveAdminPricing, adminProvisionOrder,
  getGiftCards, addGiftCard, deleteGiftCard,
} from "@services/firebase";
import DEFAULT_PRICING, { mergePricing } from "@data/config/pricing";

// ── Order Stage Config ──
const ORDER_STAGES = [
  { id: "new", label: "طلب جديد", emoji: "🔵", color: "#0984e3" },
  { id: "awaiting_payment", label: "بانتظار التحويل", emoji: "🟡", color: "#fdcb6e" },
  { id: "payment_received", label: "تم التحويل", emoji: "🟠", color: "#e17055" },
  { id: "preparing", label: "جاري التجهيز", emoji: "🔴", color: "#d63031" },
  { id: "sent", label: "تم الإرسال", emoji: "🟢", color: "#00b894" },
  { id: "followup", label: "متابعة", emoji: "✅", color: "#636e72" },
];

// ── WhatsApp Template Messages ──
const WHATSAPP_TEMPLATES = {
  new: (o) => `السلام عليكم ${o.parentName} 🌷\n\nشكراً لطلبك من *عالم التعلّم* 🎮\n\nتفاصيل طلبك:\n${(o.children || []).map((c, i) => `${i + 1}. ${c.name} - ${c.path === "both" ? "تعليمي + تربوي" : c.path === "academic" ? "تعليمي" : "تربوي"}`).join("\n")}\n\n💰 المبلغ الإجمالي: *${o.totalAmount || 0} ر.س*\n\nللدفع عبر التحويل البنكي:\n🏦 بنك الراجحي\n📛 الاسم: [اسم الحساب]\n🔢 رقم الحساب: [رقم الحساب]\n\nبعد التحويل أرسل لنا صورة الإيصال هنا 📸`,

  awaiting_payment: (o) => `مرحباً ${o.parentName} 🌸\n\nنذكرك بأن طلبك في انتظار التحويل 💳\nالمبلغ: *${o.totalAmount || 0} ر.س*\n\nبعد التحويل أرسل لنا صورة الإيصال وسنبدأ بالتجهيز فوراً ⚡`,

  payment_received: (o) => `شكراً ${o.parentName} ✨\n\nتم استلام التحويل بنجاح ✅\nجاري الآن تجهيز روابط الألعاب لأطفالك 🎮\n\nسنرسلها لك خلال وقت قصير إن شاء الله 🚀`,

  preparing: (o) => `${o.parentName} 🎉\n\nتم تجهيز الروابط! إليك روابط الألعاب:\n\n${(o.children || []).map((c, i) => `${i + 1}. *${c.name}*: [رابط الطفل هنا]`).join("\n")}\n\n📱 يمكن فتح الرابط من أي جهاز\n🔒 كل رابط خاص بالطفل\n📡 يعمل بدون إنترنت بعد أول فتح!\n\nنتمنى لأطفالك تعلّم ممتع! 🌟`,

  sent: (o) => `تم إرسال كل شيء ✅\n\n□ روابط الأطفال\n□ دليل الاستخدام\n${o.isGift ? `□ كرت الهدية 🎁 (من: ${o.giftFrom || ""})` : "□ كرت الهدية (غير مطلوب)"}`,

  followup: (o) => `السلام عليكم ${o.parentName} 🌷\n\nكيف حال أطفالك مع *عالم التعلّم*؟ 🎮\n\nنتمنى أنهم يستمتعون بالتعلّم! إذا عندك أي سؤال أو ملاحظة لا تتردد تتواصل معنا 💬\n\n⭐ رأيك يهمنا — شاركنا تجربتك!`,
};

const SENT_CHECKLIST = [
  { id: "links", label: "روابط الأطفال" },
  { id: "guide", label: "دليل الاستخدام" },
  { id: "gift_card", label: "كرت الهدية" },
  { id: "whatsapp_msg", label: "رسالة الواتساب" },
];

const GIFT_CARD_TEMPLATES = [
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

function GiftCardGenerator({ initialChildName = "", initialLink = "", managedCards = [] }) {
  // Merge default local cards with Firebase-managed cards
  const allTemplates = [
    ...GIFT_CARD_TEMPLATES,
    ...managedCards.map((c) => ({ id: c.id, img: c.img, name: c.name })),
  ];

  const [childName, setChildName] = useState(initialChildName);
  const [childLink, setChildLink] = useState(initialLink);
  const [selectedTemplate, setSelectedTemplate] = useState(allTemplates[0]?.id || "");
  const [showPreview, setShowPreview] = useState(false);
  const [qrPos, setQrPos] = useState({ x: 50, y: 50 }); // % position on image
  const [qrSize, setQrSize] = useState(20); // % of image width
  const [giftMessage, setGiftMessage] = useState("");
  const [gifterName, setGifterName] = useState("");
  const cardRef = useRef(null);

  const fullLink = childLink.startsWith("http")
    ? childLink
    : `${window.location.origin}/child-play/${childLink}`;

  function handleImageClick(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setQrPos({ x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 });
  }

  function handleGenerate() {
    if (!childLink.trim()) return;
    setShowPreview(true);
  }

  async function handleDownload() {
    if (!cardRef.current) return;
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true });
      const link = document.createElement("a");
      link.download = `gift-card-${childName || "card"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      alert("حدث خطأ أثناء تحميل الصورة");
    }
  }

  async function handleShareWhatsApp() {
    const message = [
      "🎁 *هدية تعليمية من عالم التعلّم!*",
      "",
      gifterName ? `🎀 من: *${gifterName}*` : "",
      childName ? `👦 إلى: *${childName}*` : "",
      giftMessage ? `💬 "${giftMessage}"` : "",
      "",
      "🔗 رابط اللعبة:",
      fullLink,
      "",
      "📱 امسح الباركود الموجود في الكرت أو اضغط على الرابط لبدء اللعب!",
      "",
      "🎮 *عالم التعلّم* — تعليم + تربية في لعبة واحدة آمنة 🇸🇦",
    ].filter(Boolean).join("\n");

    // Step 1: Download the card image first
    if (cardRef.current) {
      try {
        const { default: html2canvas } = await import("html2canvas");
        const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true });
        const dl = document.createElement("a");
        dl.download = `gift-card-${childName || "card"}.png`;
        dl.href = canvas.toDataURL("image/png");
        dl.click();
      } catch { /* ignore download error */ }
    }

    // Step 2: Copy message to clipboard
    try { await navigator.clipboard.writeText(message); } catch { /* ignore */ }

    // Step 3: Open WhatsApp Web
    window.open(`https://web.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank");
  }

  const template = allTemplates.find((t) => t.id === selectedTemplate);


  return (
    <div className="anim-fade-up">
      <h5 className="f-display mb-4">مولّد كروت الهدايا 🎁</h5>

      {/* Form */}
      <div className="card border-c p-4 mb-4 shadow-sm">
            <div className="row g-3">
              <div className="col-sm-6">
                <label className="form-label f-body small">رابط الطفل أو التوكن *</label>
                <input type="text" className="form-control rounded-3 border-c" dir="ltr"
                  value={childLink} onChange={(e) => setChildLink(e.target.value)}
                  placeholder="التوكن أو الرابط الكامل" />
              </div>
              <div className="col-sm-6">
                <label className="form-label f-body small">اسم الطفل (للملف)</label>
                <input type="text" className="form-control rounded-3 border-c"
                  value={childName} onChange={(e) => setChildName(e.target.value)}
                  placeholder="مثال: خالد" />
              </div>
              <div className="col-sm-6">
                <label className="form-label f-body small">حجم QR Code ({qrSize}%)</label>
                <input type="range" className="form-range" min="8" max="45" step="1"
                  value={qrSize} onChange={(e) => setQrSize(Number(e.target.value))} />
              </div>
              <div className="col-sm-6">
                <label className="form-label f-body small">اسم المُهدي</label>
                <input type="text" className="form-control rounded-3 border-c"
                  value={gifterName} onChange={(e) => setGifterName(e.target.value)}
                  placeholder="مثال: خالتك نورة" />
              </div>
              <div className="col-12">
                <label className="form-label f-body small">جملة الإهداء (اختياري)</label>
                <input type="text" className="form-control rounded-3 border-c"
                  value={giftMessage} onChange={(e) => setGiftMessage(e.target.value)}
                  placeholder="مثال: كل عام وأنت بخير يا بطل!" />
              </div>
            </div>

            {/* Template Selection */}
            <div className="mt-4">
              <label className="form-label f-body small">اختر تصميم الكرت</label>
              <div className="d-flex gap-2 overflow-auto pb-2">
                {allTemplates.map((t) => (
                  <div key={t.id} onClick={() => setSelectedTemplate(t.id)}
                    className="flex-shrink-0 rounded-3 overflow-hidden"
                    style={{
                      width: 120, cursor: "pointer",
                      border: selectedTemplate === t.id ? "3px solid var(--c-primary)" : "2px solid #e0e0e0",
                      opacity: selectedTemplate === t.id ? 1 : 0.6,
                    }}>
                    <img src={t.img} alt={t.name} className="w-100" style={{ height: 70, objectFit: "cover" }} crossOrigin="anonymous" />
                    <div className="text-center py-1">
                      <small className="f-body" style={{ fontSize: "0.65rem" }}>{t.name}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Click-to-place QR on template */}
            {template && (
              <div className="mt-3">
                <small className="d-block text-c-light mb-2">👆 اضغط على المربع/الدائرة البيضاء في الكرت لوضع الـ QR Code</small>
                <div className="position-relative d-inline-block rounded-3 overflow-hidden"
                  style={{ cursor: "crosshair", border: "2px solid var(--c-primary)", maxWidth: 500 }}
                  onClick={handleImageClick}>
                  <img src={template.img} alt={template.name} className="w-100 d-block" />
                  <div className="position-absolute" style={{
                    left: `${qrPos.x}%`, top: `${qrPos.y}%`,
                    transform: "translate(-50%, -50%)",
                    width: `${qrSize}%`, paddingBottom: `${qrSize}%`,
                    border: "3px dashed #6c5ce7", borderRadius: 8,
                    background: "rgba(108, 92, 231, 0.15)",
                    pointerEvents: "none",
                  }}>
                    <div className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center"
                      style={{ top: 0, left: 0 }}>
                      <span style={{ fontSize: "0.6rem", color: "#6c5ce7", fontWeight: "bold" }}>QR</span>
                    </div>
                  </div>
                </div>
                <small className="d-block text-c-light mt-1">
                  الموقع: {qrPos.x}% × {qrPos.y}% | الحجم: {qrSize}%
                </small>
              </div>
            )}
        <button onClick={handleGenerate}
          disabled={!childLink.trim()}
          className="btn btn-primary rounded-pill px-4 mt-3">
          توليد الكرت 🎁
        </button>
      </div>

      {/* Preview */}
      {showPreview && (
        <div className="card border-c p-4 shadow-sm">
          <h6 className="f-display mb-3">معاينة الكرت</h6>

          {/* Card Preview */}
          <div ref={cardRef} className="rounded-4 overflow-hidden mx-auto position-relative"
            style={{ maxWidth: 500, background: "#fff" }}>

            {/* Image: uploaded or template */}
            <img src={template?.img}
              alt="gift card" className="w-100" style={{ display: "block" }} />

            {/* QR Overlay - click-positioned for both modes */}
            <div className="position-absolute" style={{
              left: `${qrPos.x}%`, top: `${qrPos.y}%`,
              transform: "translate(-50%, -50%)",
              width: `${qrSize}%`,
            }}>
              <QRCodeCanvas value={fullLink} size={300} level="H"
                bgColor="transparent" fgColor="#1a1a2e"
                style={{ width: "100%", height: "auto" }} />
            </div>
          </div>

          {/* Info below card */}
          <div className="mt-3 p-3 rounded-3" style={{ background: "#f8f5ff" }}>
            {childName && <div className="f-body small"><strong>الطفل:</strong> {childName}</div>}
            <div className="f-body small" dir="ltr"><strong>Link:</strong> {fullLink}</div>
          </div>

          {/* Actions */}
          <div className="d-flex gap-2 mt-3 flex-wrap">
            <button onClick={handleShareWhatsApp} className="btn btn-success rounded-pill px-4">
              تحميل + مشاركة واتساب 💬
            </button>
            <small className="w-100 text-c-light d-block mt-1">
              سيتم تحميل الكرت كصورة + فتح واتساب ويب بالرسالة جاهزة — أرفق الصورة يدوياً في المحادثة
            </small>
            <button onClick={handleDownload} className="btn btn-primary rounded-pill px-4">
              تحميل كصورة 📥
            </button>
            <button onClick={() => {
              navigator.clipboard?.writeText(fullLink) || prompt("انسخ الرابط:", fullLink);
            }} className="btn btn-outline-secondary rounded-pill px-4">
              نسخ الرابط 📋
            </button>
            <button onClick={() => {
              const qrCanvas = cardRef.current?.querySelector("canvas");
              if (qrCanvas) {
                const link = document.createElement("a");
                link.download = `qr-${childName || "code"}.png`;
                link.href = qrCanvas.toDataURL("image/png");
                link.click();
              }
            }} className="btn btn-outline-secondary rounded-pill px-4">
              تحميل QR فقط 📱
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  const { isAdmin } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [orders, setOrders] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [giftCardData, setGiftCardData] = useState(null); // { childName, link, gifterName, gifterRelation }
  const [managedCards, setManagedCards] = useState([]); // gift cards from Firebase
  const [cardUploading, setCardUploading] = useState(false);
  const [newCardName, setNewCardName] = useState("");

  const [pricing, setPricing] = useState(DEFAULT_PRICING);
  const [pricingDirty, setPricingDirty] = useState(false);
  const [pricingSaving, setPricingSaving] = useState(false);

  // New package / promotion forms
  const [showNewPackage, setShowNewPackage] = useState(false);
  const [newPkg, setNewPkg] = useState({ name: "", emoji: "📦", description: "", price: 0, originalPrice: 0, includes: { virtues: 0, subjects: 0 } });
  const [showNewPromo, setShowNewPromo] = useState(false);
  const [newPromo, setNewPromo] = useState({ name: "", description: "", discountPercent: 0, active: true });

  function addPackage() {
    if (!newPkg.name.trim()) return;
    const id = "pkg_" + Date.now();
    const updated = JSON.parse(JSON.stringify(pricing));
    updated.packages[id] = { id, ...newPkg, name: newPkg.name.trim(), description: newPkg.description.trim() };
    setPricing(updated);
    setPricingDirty(true);
    setNewPkg({ name: "", emoji: "📦", description: "", price: 0, originalPrice: 0, includes: { virtues: 0, subjects: 0 } });
    setShowNewPackage(false);
  }

  function deletePackage(pkgId) {
    const updated = JSON.parse(JSON.stringify(pricing));
    delete updated.packages[pkgId];
    setPricing(updated);
    setPricingDirty(true);
  }

  function addPromotion() {
    if (!newPromo.name.trim()) return;
    const id = "promo_" + Date.now();
    const updated = JSON.parse(JSON.stringify(pricing));
    updated.promotions[id] = { id, ...newPromo, name: newPromo.name.trim(), description: newPromo.description.trim() };
    setPricing(updated);
    setPricingDirty(true);
    setNewPromo({ name: "", description: "", discountPercent: 0, active: true });
    setShowNewPromo(false);
  }

  function deletePromotion(promoId) {
    const updated = JSON.parse(JSON.stringify(pricing));
    delete updated.promotions[promoId];
    setPricing(updated);
    setPricingDirty(true);
  }

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
      const [dash, ord, chal, prc, cards] = await Promise.all([
        getAdminDashboard(), getAllOrders(100), getActiveChallenges(), getAdminPricing(), getGiftCards(),
      ]);
      setDashboard(dash);
      setOrders(ord || []);
      setChallenges(chal || []);
      setManagedCards(cards || []);
      if (prc) setPricing(mergePricing(prc));
    } catch (e) { console.warn(e); }
    setLoading(false);
  }

  async function handleStageChange(orderId, newStage) {
    await updateOrderStage(orderId, newStage);
    loadData();
  }

  async function handleChecklistChange(orderId, checklist) {
    await updateOrderChecklist(orderId, checklist);
    loadData();
  }

  function updatePricingField(path, value) {
    const updated = JSON.parse(JSON.stringify(pricing));
    const keys = path.split(".");
    let obj = updated;
    for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
    obj[keys[keys.length - 1]] = value;
    setPricing(updated);
    setPricingDirty(true);
  }

  async function savePricing() {
    setPricingSaving(true);
    await saveAdminPricing(pricing);
    setPricingDirty(false);
    setPricingSaving(false);
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

  const [provisioning, setProvisioning] = useState(null); // orderId being provisioned

  async function handleProvision(order) {
    if (!order.children?.length) return;
    setProvisioning(order.id);
    try {
      await adminProvisionOrder(order.id, order.children);
      await loadData();
    } catch (e) {
      console.error(e);
      alert("حدث خطأ أثناء توليد الروابط");
    }
    setProvisioning(null);
  }

  function copyText(text) {
    navigator.clipboard?.writeText(text) || prompt("انسخ النص:", text);
  }

  function openWhatsApp(phone, message) {
    const clean = phone.replace(/[^0-9]/g, "");
    const full = clean.startsWith("0") ? `966${clean.slice(1)}` : clean;
    window.open(`https://wa.me/${full}?text=${encodeURIComponent(message)}`, "_blank");
  }

  if (!isAdmin) return <div className="text-center py-5 f-display fs-4">⛔ غير مصرح</div>;
  if (loading) return <div className="min-vh-100 d-flex align-items-center justify-content-center"><div className="spinner-border text-c-primary" /></div>;

  const d = dashboard || {};
  const ordersByStage = {};
  ORDER_STAGES.forEach((s) => { ordersByStage[s.id] = orders.filter((o) => (o.stage || "new") === s.id); });

  const tabs = [
    { id: "overview", label: "📊 نظرة عامة" },
    { id: "orders", label: `📦 الطلبات (${orders.length})` },
    { id: "pricing", label: "💰 الأسعار" },
    { id: "whatsapp", label: "💬 قوالب واتساب" },
    { id: "challenges", label: `🏆 التحديات` },
    { id: "manage_cards", label: `🖼️ إدارة الكروت (${managedCards.length})` },
    { id: "gift_cards", label: "🎁 مولّد الكروت" },
    { id: "order_form", label: "📋 نموذج الطلب" },
  ];

  return (
    <div className="bg-app min-vh-100 py-4">
      <div className="container" style={{ maxWidth: 1100 }}>
        <h1 className="f-display fs-3 mb-4">لوحة الإدارة 🛠️</h1>

        <div className="d-flex gap-2 mb-4 flex-wrap">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`btn rounded-pill px-3 py-2 f-display small ${activeTab === tab.id ? "btn-primary" : "btn-outline-secondary"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ═══ OVERVIEW ═══ */}
        {activeTab === "overview" && (
          <div className="anim-fade-up">
            <div className="row g-3 mb-4">
              {[
                { label: "المستخدمين", value: d.totalUsers || 0, icon: "👥", color: "var(--c-primary)" },
                { label: "الأطفال", value: d.totalChildren || 0, icon: "👶", color: "#00b894" },
                { label: "الألعاب", value: d.totalGames || 0, icon: "🎮", color: "#fd79a8" },
                { label: "الإيرادات", value: `${d.totalRevenue || 0} ر.س`, icon: "💰", color: "#fdcb6e" },
                { label: "الطلبات", value: d.totalOrders || 0, icon: "📦", color: "#0984e3" },
              ].map((item, i) => (
                <div key={i} className="col-6 col-lg-4">
                  <div className="card border-c p-3 text-center h-100 shadow-sm">
                    <div style={{ fontSize: "1.8rem" }}>{item.icon}</div>
                    <div className="f-display fs-4 mt-1" style={{ color: item.color }}>{item.value}</div>
                    <small className="f-body text-c-light">{item.label}</small>
                  </div>
                </div>
              ))}
            </div>
            <div className="card border-c p-4">
              <h5 className="f-display mb-3">مراحل الطلبات</h5>
              <div className="d-flex gap-2 flex-wrap">
                {ORDER_STAGES.map((stage) => (
                  <div key={stage.id} className="text-center px-3 py-2 rounded-3"
                    style={{ background: `${stage.color}15`, border: `1px solid ${stage.color}30`, minWidth: 90 }}>
                    <div style={{ fontSize: "1.3rem" }}>{stage.emoji}</div>
                    <div className="f-display small" style={{ color: stage.color }}>{ordersByStage[stage.id]?.length || 0}</div>
                    <small className="text-c-light" style={{ fontSize: "0.65rem" }}>{stage.label}</small>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ ORDERS ═══ */}
        {activeTab === "orders" && (
          <div className="anim-fade-up">
            {orders.length === 0 ? (
              <div className="card border-c p-5 text-center"><p className="f-body text-c-light mb-0">لا توجد طلبات بعد</p></div>
            ) : (
              <div className="d-grid gap-3">
                {orders.map((order) => {
                  const stage = ORDER_STAGES.find((s) => s.id === (order.stage || "new")) || ORDER_STAGES[0];
                  const isOpen = selectedOrder === order.id;
                  return (
                    <div key={order.id} className="card border-c shadow-sm overflow-hidden">
                      {/* Header */}
                      <div className="p-3 d-flex justify-content-between align-items-center"
                        style={{ cursor: "pointer", background: `${stage.color}08` }}
                        onClick={() => setSelectedOrder(isOpen ? null : order.id)}>
                        <div className="d-flex align-items-center gap-3">
                          <span style={{ fontSize: "1.3rem" }}>{stage.emoji}</span>
                          <div>
                            <strong className="f-body">{order.parentName || "—"}</strong>
                            <small className="d-block text-c-light" dir="ltr">{order.phone || "—"}</small>
                          </div>
                        </div>
                        <div className="text-end">
                          <div className="f-display" style={{ color: stage.color }}>{order.totalAmount || order.amount || 0} ر.س</div>
                          <small className="text-c-light">{order.createdAt ? new Date(order.createdAt).toLocaleDateString("ar-SA") : "—"}</small>
                        </div>
                      </div>

                      {/* Expanded */}
                      {isOpen && (
                        <div className="p-3 border-top" style={{ background: "#fafafa" }}>
                          {/* Children */}
                          {order.children?.length > 0 && (
                            <div className="mb-3">
                              <h6 className="f-display small mb-2">الأطفال:</h6>
                              {order.children.map((c, i) => (
                                <div key={i} className="d-flex gap-2 align-items-center mb-1 f-body small">
                                  <span>👦</span> <strong>{c.name}</strong>
                                  <span className="text-c-light">({c.grade})</span>
                                  <span className="badge rounded-pill text-white small" style={{ background: "#6c5ce7" }}>
                                    {c.path === "both" ? "تعليمي+تربوي" : c.path === "academic" ? "تعليمي" : "تربوي"}
                                  </span>
                                  {c.package && <span className="badge rounded-pill text-dark small" style={{ background: "#fdcb6e" }}>{c.package}</span>}
                                </div>
                              ))}
                            </div>
                          )}

                          {order.isGift && (
                            <div className="mb-3 p-2 rounded-3" style={{ background: "#fff9e6" }}>
                              <small className="f-body">🎁 هدية من: <strong>{order.giftFrom}</strong> ({order.giftRelation})</small>
                            </div>
                          )}

                          {/* Provisioned Links */}
                          {order.provisionedChildren ? (
                            <div className="mb-3 p-3 rounded-3" style={{ background: "#e8ffe8", border: "1px solid #b8e6b8" }}>
                              <h6 className="f-display small mb-2">روابط الأطفال (تم التوليد ✅)</h6>
                              {order.provisionedChildren.map((pc, i) => (
                                <div key={i} className="d-flex gap-2 align-items-center mb-2 p-2 rounded-3" style={{ background: "white" }}>
                                  <span>👦</span>
                                  <strong className="f-body small">{pc.name}</strong>
                                  <code className="flex-grow-1 small" dir="ltr" style={{ color: "#6c5ce7" }}>
                                    {window.location.origin}{pc.link}
                                  </code>
                                  <button onClick={() => copyText(`${window.location.origin}${pc.link}`)}
                                    className="btn btn-sm btn-outline-primary rounded-pill px-2">📋</button>
                                  <button onClick={() => {
                                    setGiftCardData({
                                      childName: pc.name,
                                      link: pc.accessToken || pc.link.replace("/child-play/", ""),
                                      gifterName: order.isGift ? (order.giftFrom || "") : "",
                                      gifterRelation: order.isGift ? (order.giftRelation || "") : "",
                                    });
                                    setActiveTab("gift_cards");
                                  }} className="btn btn-sm btn-outline-warning rounded-pill px-2">🎁 كرت</button>
                                </div>
                              ))}
                              <div className="mt-2">
                                <button onClick={() => {
                                  const allLinks = order.provisionedChildren.map((pc) =>
                                    `${pc.name}: ${window.location.origin}${pc.link}`
                                  ).join("\n");
                                  copyText(allLinks);
                                }} className="btn btn-sm btn-outline-success rounded-pill px-3">📋 نسخ جميع الروابط</button>
                              </div>
                            </div>
                          ) : order.children?.length > 0 ? (
                            <div className="mb-3 p-3 rounded-3" style={{ background: "#fff3e0", border: "1px solid #ffe0b2" }}>
                              <h6 className="f-display small mb-2">توليد روابط الأطفال</h6>
                              <p className="f-body small text-c-light mb-2">
                                اضغط الزر لإنشاء حسابات الأطفال وتوليد روابط اللعب الخاصة بهم
                              </p>
                              <button onClick={() => handleProvision(order)}
                                disabled={provisioning === order.id}
                                className="btn btn-warning rounded-pill px-4 text-dark">
                                {provisioning === order.id ? "جاري التوليد..." : "توليد الروابط 🔗"}
                              </button>
                            </div>
                          ) : null}

                          {/* Stage Buttons */}
                          <div className="mb-3">
                            <h6 className="f-display small mb-2">تغيير المرحلة:</h6>
                            <div className="d-flex gap-1 flex-wrap">
                              {ORDER_STAGES.map((s) => (
                                <button key={s.id}
                                  onClick={() => handleStageChange(order.id, s.id)}
                                  disabled={s.id === (order.stage || "new")}
                                  className="btn btn-sm rounded-pill px-2"
                                  style={{
                                    background: s.id === (order.stage || "new") ? s.color : "transparent",
                                    color: s.id === (order.stage || "new") ? "white" : s.color,
                                    border: `1px solid ${s.color}`,
                                    opacity: s.id === (order.stage || "new") ? 1 : 0.7,
                                  }}>
                                  {s.emoji} {s.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Checklist for sent stage */}
                          {(order.stage === "sent" || order.stage === "preparing") && (
                            <div className="mb-3">
                              <h6 className="f-display small mb-2">تتبع المرفقات:</h6>
                              {SENT_CHECKLIST.map((item) => (
                                <div key={item.id} className="form-check mb-1">
                                  <input type="checkbox" className="form-check-input"
                                    id={`ck-${order.id}-${item.id}`}
                                    checked={order.checklist?.[item.id] || false}
                                    onChange={(e) => handleChecklistChange(order.id, { ...(order.checklist || {}), [item.id]: e.target.checked })} />
                                  <label className="form-check-label f-body small" htmlFor={`ck-${order.id}-${item.id}`}>{item.label}</label>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* WhatsApp */}
                          {order.phone && (
                            <div className="d-flex gap-2 flex-wrap">
                              <button onClick={() => { const t = WHATSAPP_TEMPLATES[order.stage || "new"]; if (t) openWhatsApp(order.phone, t(order)); }}
                                className="btn btn-sm btn-success rounded-pill px-3">💬 إرسال واتساب ({stage.label})</button>
                              <button onClick={() => { const t = WHATSAPP_TEMPLATES[order.stage || "new"]; if (t) copyText(t(order)); }}
                                className="btn btn-sm btn-outline-secondary rounded-pill px-3">📋 نسخ الرسالة</button>
                            </div>
                          )}

                          {/* Stage History */}
                          {order.stageHistory && (
                            <div className="mt-3">
                              <h6 className="f-display small mb-1">سجل المراحل:</h6>
                              <div className="f-body small text-c-light">
                                {Object.values(order.stageHistory).map((log, i) => {
                                  const s = ORDER_STAGES.find((st) => st.id === log.stage);
                                  return <div key={i}>{s?.emoji} {s?.label} — {new Date(log.timestamp).toLocaleString("ar-SA")}</div>;
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ═══ PRICING ═══ */}
        {activeTab === "pricing" && (
          <div className="anim-fade-up">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="f-display mb-0">إدارة الأسعار</h5>
              {pricingDirty && (
                <button onClick={savePricing} disabled={pricingSaving} className="btn btn-primary rounded-pill px-4">
                  {pricingSaving ? "جاري الحفظ..." : "حفظ التغييرات 💾"}
                </button>
              )}
            </div>

            {/* Individual Items */}
            <div className="card border-c p-4 mb-3">
              <h6 className="f-display mb-3">الأسعار الفردية</h6>
              <div className="row g-3">
                {Object.values(pricing.items).map((item) => (
                  <div key={item.id} className="col-sm-6">
                    <label className="form-label f-body small">{item.name}</label>
                    <div className="input-group">
                      <input type="number" className="form-control rounded-start border-c" value={item.price}
                        onChange={(e) => updatePricingField(`items.${item.id}.price`, parseInt(e.target.value) || 0)} />
                      <span className="input-group-text border-c">ر.س</span>
                    </div>
                    <small className="text-c-light">{item.description}</small>
                  </div>
                ))}
              </div>
            </div>

            {/* Packages */}
            <div className="card border-c p-4 mb-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="f-display mb-0">الباقات</h6>
                <button onClick={() => setShowNewPackage(!showNewPackage)} className="btn btn-sm btn-outline-primary rounded-pill px-3">
                  {showNewPackage ? "✕ إلغاء" : "➕ باقة جديدة"}
                </button>
              </div>

              {/* Add new package form */}
              {showNewPackage && (
                <div className="p-3 rounded-3 mb-3" style={{ background: "#eef0ff", border: "1px dashed var(--c-primary)" }}>
                  <div className="row g-2">
                    <div className="col-sm-1">
                      <label className="form-label f-body small mb-0">رمز</label>
                      <input type="text" className="form-control form-control-sm border-c text-center" value={newPkg.emoji}
                        onChange={(e) => setNewPkg({ ...newPkg, emoji: e.target.value })} />
                    </div>
                    <div className="col-sm-4">
                      <label className="form-label f-body small mb-0">اسم الباقة *</label>
                      <input type="text" className="form-control form-control-sm border-c" value={newPkg.name}
                        onChange={(e) => setNewPkg({ ...newPkg, name: e.target.value })} placeholder="مثال: باقة الصيف" />
                    </div>
                    <div className="col-sm-7">
                      <label className="form-label f-body small mb-0">الوصف</label>
                      <input type="text" className="form-control form-control-sm border-c" value={newPkg.description}
                        onChange={(e) => setNewPkg({ ...newPkg, description: e.target.value })} placeholder="وصف مختصر للباقة" />
                    </div>
                    <div className="col-sm-3">
                      <label className="form-label f-body small mb-0">السعر (ر.س)</label>
                      <input type="number" className="form-control form-control-sm border-c" value={newPkg.price}
                        onChange={(e) => setNewPkg({ ...newPkg, price: parseInt(e.target.value) || 0 })} />
                    </div>
                    <div className="col-sm-3">
                      <label className="form-label f-body small mb-0">قبل الخصم</label>
                      <input type="number" className="form-control form-control-sm border-c" value={newPkg.originalPrice}
                        onChange={(e) => setNewPkg({ ...newPkg, originalPrice: parseInt(e.target.value) || 0 })} />
                    </div>
                    <div className="col-sm-3">
                      <label className="form-label f-body small mb-0">عدد القيم</label>
                      <input type="number" className="form-control form-control-sm border-c" value={newPkg.includes.virtues}
                        onChange={(e) => setNewPkg({ ...newPkg, includes: { ...newPkg.includes, virtues: parseInt(e.target.value) || 0 } })} />
                    </div>
                    <div className="col-sm-3">
                      <label className="form-label f-body small mb-0">عدد المواد</label>
                      <input type="number" className="form-control form-control-sm border-c" value={newPkg.includes.subjects}
                        onChange={(e) => setNewPkg({ ...newPkg, includes: { ...newPkg.includes, subjects: parseInt(e.target.value) || 0 } })} />
                    </div>
                    <div className="col-12">
                      <button onClick={addPackage} disabled={!newPkg.name.trim()} className="btn btn-primary btn-sm rounded-pill px-4">
                        إضافة الباقة ✓
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {Object.values(pricing.packages).map((pkg) => (
                <div key={pkg.id} className="d-flex align-items-center gap-3 mb-3 p-3 rounded-3" style={{ background: "#f8f5ff" }}>
                  <span style={{ fontSize: "1.5rem" }}>{pkg.emoji}</span>
                  <div className="flex-grow-1">
                    <strong className="f-body">{pkg.name}</strong>
                    <small className="d-block text-c-light">{pkg.description}</small>
                  </div>
                  <div className="d-flex gap-2 align-items-center">
                    <div>
                      <label className="form-label f-body small mb-0">السعر</label>
                      <input type="number" className="form-control form-control-sm border-c" style={{ width: 80 }}
                        value={pkg.price} onChange={(e) => updatePricingField(`packages.${pkg.id}.price`, parseInt(e.target.value) || 0)} />
                    </div>
                    <div>
                      <label className="form-label f-body small mb-0">قبل الخصم</label>
                      <input type="number" className="form-control form-control-sm border-c" style={{ width: 80 }}
                        value={pkg.originalPrice} onChange={(e) => updatePricingField(`packages.${pkg.id}.originalPrice`, parseInt(e.target.value) || 0)} />
                    </div>
                    <button onClick={() => deletePackage(pkg.id)} className="btn btn-sm btn-outline-danger rounded-pill" title="حذف">
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Multi-child Discounts */}
            <div className="card border-c p-4 mb-3">
              <h6 className="f-display mb-3">خصومات تعدد الأطفال</h6>
              <div className="row g-3">
                <div className="col-sm-6">
                  <label className="form-label f-body small">خصم الطفل الثاني (%)</label>
                  <input type="number" className="form-control border-c" value={pricing.childDiscounts[2] || 0}
                    onChange={(e) => updatePricingField("childDiscounts.2", parseInt(e.target.value) || 0)} />
                </div>
                <div className="col-sm-6">
                  <label className="form-label f-body small">خصم الطفل الثالث فأكثر (%)</label>
                  <input type="number" className="form-control border-c" value={pricing.childDiscounts[3] || 0}
                    onChange={(e) => updatePricingField("childDiscounts.3", parseInt(e.target.value) || 0)} />
                </div>
              </div>
            </div>

            {/* Promotions */}
            <div className="card border-c p-4 mb-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="f-display mb-0">العروض</h6>
                <button onClick={() => setShowNewPromo(!showNewPromo)} className="btn btn-sm btn-outline-primary rounded-pill px-3">
                  {showNewPromo ? "✕ إلغاء" : "➕ عرض جديد"}
                </button>
              </div>

              {/* Add new promotion form */}
              {showNewPromo && (
                <div className="p-3 rounded-3 mb-3" style={{ background: "#eeffee", border: "1px dashed #00b894" }}>
                  <div className="row g-2">
                    <div className="col-sm-5">
                      <label className="form-label f-body small mb-0">اسم العرض *</label>
                      <input type="text" className="form-control form-control-sm border-c" value={newPromo.name}
                        onChange={(e) => setNewPromo({ ...newPromo, name: e.target.value })} placeholder="مثال: عرض رمضان" />
                    </div>
                    <div className="col-sm-5">
                      <label className="form-label f-body small mb-0">الوصف</label>
                      <input type="text" className="form-control form-control-sm border-c" value={newPromo.description}
                        onChange={(e) => setNewPromo({ ...newPromo, description: e.target.value })} placeholder="وصف مختصر للعرض" />
                    </div>
                    <div className="col-sm-2">
                      <label className="form-label f-body small mb-0">الخصم %</label>
                      <input type="number" className="form-control form-control-sm border-c" value={newPromo.discountPercent}
                        onChange={(e) => setNewPromo({ ...newPromo, discountPercent: parseInt(e.target.value) || 0 })} />
                    </div>
                    <div className="col-12">
                      <button onClick={addPromotion} disabled={!newPromo.name.trim()} className="btn btn-primary btn-sm rounded-pill px-4">
                        إضافة العرض ✓
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {Object.values(pricing.promotions).map((promo) => (
                <div key={promo.id} className="d-flex align-items-center gap-3 p-3 rounded-3 mb-2"
                  style={{ background: promo.active ? "#e8ffe8" : "#f5f5f5" }}>
                  <div className="flex-grow-1">
                    <strong className="f-body">{promo.name}</strong>
                    <small className="d-block text-c-light">{promo.description}</small>
                  </div>
                  <input type="number" className="form-control form-control-sm border-c" style={{ width: 70 }}
                    value={promo.discountPercent} onChange={(e) => updatePricingField(`promotions.${promo.id}.discountPercent`, parseInt(e.target.value) || 0)} />
                  <span className="f-body small">%</span>
                  <div className="form-check form-switch">
                    <input type="checkbox" className="form-check-input" role="switch" checked={promo.active}
                      onChange={(e) => updatePricingField(`promotions.${promo.id}.active`, e.target.checked)} />
                  </div>
                  <button onClick={() => deletePromotion(promo.id)} className="btn btn-sm btn-outline-danger rounded-pill" title="حذف">
                    🗑️
                  </button>
                </div>
              ))}
            </div>

            {pricingDirty && (
              <button onClick={savePricing} disabled={pricingSaving} className="btn btn-primary btn-lg rounded-pill w-100">
                {pricingSaving ? "جاري الحفظ..." : "حفظ جميع التغييرات 💾"}
              </button>
            )}
          </div>
        )}

        {/* ═══ WHATSAPP TEMPLATES ═══ */}
        {activeTab === "whatsapp" && (
          <div className="anim-fade-up">
            <h5 className="f-display mb-3">قوالب رسائل الواتساب</h5>
            <p className="f-body text-c-light mb-4">تُستخدم تلقائياً عند الضغط على "إرسال واتساب" في تفاصيل الطلب</p>
            {ORDER_STAGES.map((stage) => {
              const template = WHATSAPP_TEMPLATES[stage.id];
              if (!template) return null;
              const sample = { parentName: "أم محمد", phone: "0500000000", totalAmount: 49,
                children: [{ name: "محمد", grade: "first", path: "both" }], isGift: false, giftFrom: "", giftRelation: "" };
              return (
                <div key={stage.id} className="card border-c p-4 mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="f-display mb-0">{stage.emoji} {stage.label}</h6>
                    <button onClick={() => copyText(template(sample))} className="btn btn-sm btn-outline-secondary rounded-pill px-3">📋 نسخ</button>
                  </div>
                  <pre className="f-body small p-3 rounded-3 mb-0" dir="rtl"
                    style={{ background: "#f0f8e8", whiteSpace: "pre-wrap", border: "1px solid #c3dea8" }}>
                    {template(sample)}
                  </pre>
                </div>
              );
            })}
          </div>
        )}

        {/* ═══ CHALLENGES ═══ */}
        {activeTab === "challenges" && (
          <div className="anim-fade-up">
            <button onClick={() => setShowNewChallenge(!showNewChallenge)} className="btn btn-primary mb-3">
              {showNewChallenge ? "✕ إلغاء" : "➕ تحدي جديد"}
            </button>
            {showNewChallenge && (
              <div className="card border-c p-4 mb-4">
                <div className="row g-3">
                  <div className="col-sm-6">
                    <label className="form-label f-body small">عنوان التحدي</label>
                    <input type="text" className="form-control rounded-3 border-c"
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
                    <label className="form-label f-body small">بداية</label>
                    <input type="date" className="form-control rounded-3 border-c" dir="ltr"
                      value={challengeForm.startDate} onChange={(e) => setChallengeForm({ ...challengeForm, startDate: e.target.value })} />
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label f-body small">نهاية</label>
                    <input type="date" className="form-control rounded-3 border-c" dir="ltr"
                      value={challengeForm.endDate} onChange={(e) => setChallengeForm({ ...challengeForm, endDate: e.target.value })} />
                  </div>
                  <div className="col-12">
                    <textarea className="form-control rounded-3 border-c" rows="2" placeholder="وصف التحدي..."
                      value={challengeForm.description} onChange={(e) => setChallengeForm({ ...challengeForm, description: e.target.value })} />
                  </div>
                  <div className="col-12">
                    <button onClick={handleCreateChallenge} className="btn btn-primary">إنشاء التحدي 🏆</button>
                  </div>
                </div>
              </div>
            )}
            {challenges.length === 0 ? (
              <div className="card border-c p-5 text-center"><p className="f-body text-c-light mb-0">لا توجد تحديات نشطة</p></div>
            ) : (
              <div className="row g-3">
                {challenges.map((c) => (
                  <div key={c.id} className="col-sm-6">
                    <div className="card border-c p-4 h-100">
                      <h5 className="f-display mb-1">{c.info?.title}</h5>
                      <p className="f-body small text-c-light mb-2">{c.info?.description}</p>
                      <small className="text-c-light">📅 {c.info?.startDate} → {c.info?.endDate}</small>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* ═══ MANAGE GIFT CARDS ═══ */}
        {activeTab === "manage_cards" && (
          <div className="anim-fade-up">
            <h5 className="f-display mb-4">إدارة كروت الهدايا 🖼️</h5>

            {/* Upload new card */}
            <div className="card border-c p-4 mb-4 shadow-sm">
              <h6 className="f-display mb-3">رفع كرت جديد</h6>
              <div className="row g-3 align-items-end">
                <div className="col-sm-4">
                  <label className="form-label f-body small">اسم الكرت *</label>
                  <input type="text" className="form-control rounded-3 border-c" value={newCardName}
                    onChange={(e) => setNewCardName(e.target.value)} placeholder="مثال: كرت العيد" />
                </div>
                <div className="col-sm-5">
                  <label className="form-label f-body small">صورة الكرت *</label>
                  <input type="file" accept="image/*" id="cardFileInput" className="form-control rounded-3 border-c" />
                </div>
                <div className="col-sm-3">
                  <button
                    disabled={cardUploading}
                    className="btn btn-primary rounded-pill w-100"
                    onClick={async () => {
                      const fileInput = document.getElementById("cardFileInput");
                      const file = fileInput?.files?.[0];
                      if (!file) { alert("اختر صورة الكرت أولاً"); return; }
                      if (!newCardName.trim()) { alert("اكتب اسم الكرت أولاً"); return; }
                      setCardUploading(true);
                      try {
                        await addGiftCard(file, newCardName.trim());
                        setNewCardName("");
                        fileInput.value = "";
                        const cards = await getGiftCards();
                        setManagedCards(cards || []);
                      } catch (e) {
                        console.error("Gift card upload error:", e);
                        alert("خطأ: " + (e.message || e.code || "حدث خطأ أثناء الرفع"));
                      }
                      setCardUploading(false);
                    }}
                  >
                    {cardUploading ? "جاري الرفع..." : "رفع ⬆️"}
                  </button>
                </div>
              </div>
            </div>

            {/* Cards grid */}
            {managedCards.length === 0 ? (
              <div className="card border-c p-5 text-center">
                <p className="f-body text-c-light mb-0">لا توجد كروت مرفوعة بعد — الكروت الافتراضية تظهر من المجلد المحلي</p>
              </div>
            ) : (
              <div className="row g-3">
                {managedCards.map((card) => (
                  <div key={card.id} className="col-6 col-sm-4 col-lg-3">
                    <div className="card border-c overflow-hidden h-100 shadow-sm">
                      <img src={card.img} alt={card.name} className="w-100" style={{ height: 140, objectFit: "cover" }} />
                      <div className="p-2 d-flex justify-content-between align-items-center">
                        <small className="f-body">{card.name}</small>
                        <button
                          className="btn btn-sm btn-outline-danger rounded-pill px-2 py-0"
                          onClick={async () => {
                            if (!confirm(`حذف "${card.name}"؟`)) return;
                            await deleteGiftCard(card.id);
                            const cards = await getGiftCards();
                            setManagedCards(cards || []);
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-3 p-3 rounded-3" style={{ background: "#f8f5ff" }}>
              <small className="f-body text-c-light">
                الكروت المرفوعة هنا تظهر تلقائياً في صفحة التسويق ونموذج الطلب ومولّد الكروت.
                الكروت الافتراضية (من المجلد المحلي) تظهر أيضاً إذا لم تُرفع كروت.
              </small>
            </div>
          </div>
        )}

        {/* ═══ GIFT CARDS GENERATOR ═══ */}
        {activeTab === "gift_cards" && (
          <GiftCardGenerator
            key={giftCardData ? `${giftCardData.childName}-${giftCardData.link}` : "default"}
            initialChildName={giftCardData?.childName || ""}
            initialLink={giftCardData?.link || ""}
            managedCards={managedCards}
          />
        )}

        {/* ═══ ORDER FORM LINK ═══ */}
        {activeTab === "order_form" && (
          <div className="anim-fade-up">
            <div className="card border-c p-4 shadow-sm text-center">
              <span style={{ fontSize: "3rem" }}>📋</span>
              <h5 className="f-display mt-3 mb-2">نموذج الطلب</h5>
              <p className="f-body text-c-light mb-3">شارك هذا الرابط مع العملاء لتعبئة نموذج الطلب</p>
              <div className="d-flex gap-2 justify-content-center flex-wrap">
                <a href="/order" target="_blank" rel="noopener noreferrer"
                  className="btn btn-primary rounded-pill px-4">فتح النموذج ↗</a>
                <button onClick={() => {
                  const url = `${window.location.origin}/order`;
                  navigator.clipboard?.writeText(url) || prompt("انسخ الرابط:", url);
                }} className="btn btn-outline-secondary rounded-pill px-4">📋 نسخ الرابط</button>
              </div>
              <div className="mt-3 p-3 rounded-3" style={{ background: "#f8f5ff" }}>
                <code className="f-body small" dir="ltr">{window.location.origin}/order</code>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
