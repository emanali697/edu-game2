import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SUBJECTS from "@data/config/subjects";
import VIRTUES from "@data/config/virtues";
import GRADES from "@data/config/grades";
import { APP_NAME, SUPPORT_WHATSAPP } from "@utils/constants";
import { getAdminPricing, getGiftCards } from "@services/firebase";
import DEFAULT_PRICING, { mergePricing } from "@data/config/pricing";

export default function LandingPage() {
  const navigate = useNavigate();
  const goOrder = () => navigate("/order");

  const [pricing, setPricing] = useState(DEFAULT_PRICING);
  const [firebaseCards, setFirebaseCards] = useState([]);

  useEffect(() => {
    getAdminPricing().then((p) => { if (p) setPricing(mergePricing(p)); }).catch(() => {});
    getGiftCards().then((cards) => { if (cards?.length) setFirebaseCards(cards); }).catch(() => {});
  }, []);

  const features = [
    { icon: "🛡️", title: "آمن شرعياً 100%", desc: "محتوى متوافق مع القيم الإسلامية، بدون إعلانات أو روابط خارجية", accent: "#6c5ce7" },
    { icon: "🇸🇦", title: "منهج سعودي دقيق", desc: "مصمم خصيصاً للمنهج الدراسي السعودي الجديد", accent: "#00b894" },
    { icon: "⭐", title: "تشجيع إيجابي", desc: "رسائل تحفيزية مستمرة بدون أي أحكام سلبية على طفلك", accent: "#fdcb6e" },
    { icon: "🎮", title: "تعلّم بالمتعة", desc: "ألعاب تفاعلية تجعل المذاكرة تجربة ممتعة ومشوّقة", accent: "#fd79a8" },
    { icon: "🌉", title: "قيم تربوية", desc: "لعبة جسر المحبة تغرس الفضائل الإسلامية بمواقف تفاعلية", accent: "#74b9ff" },
    { icon: "🎁", title: "هدية مميزة", desc: "اهدِ اللعبة لمن تحب مع كارت هدية خاص", accent: "#00b894" },
  ];

  const testimonials = [
    { name: "أم عبدالله", text: "ولدي صار كل يوم يقول أبي ألعب اللعبة! وأنا مرتاحة لأن المحتوى نظيف وآمن" },
    { name: "أبو سارة", text: "بناتي يتسابقن مين تكمّل الجسر أول! حلو إنها تجمع مواد ومعها قيم" },
    { name: "أم نورة", text: "ما شاء الله البنت تحسّنت بالحساب وصارت تقول لي عن بر الوالدين — فعلاً أثّرت فيها" },
    { name: "أم خالد", text: "أهديتها لبنت أختي وفرحت فيها أكثر من أي هدية ثانية!" },
    { name: "أبو محمد", text: "ولدي عمره 5 سنين ويلعبها بنفسه بدون ما يحتاجني. واجهتها سهلة ومرتبة" },
    { name: "أم ريان", text: "أحلى شي إنها تشتغل بدون نت! نلعبها بالسيارة وعند أم زوجي عادي" },
  ];

  const defaultCards = [
    { img: "/gift-cards/male-1.jpg", title: "كرت أولاد" },
    { img: "/gift-cards/male-2.jpg", title: "كرت أولاد" },
    { img: "/gift-cards/male-3.jpg", title: "كرت أولاد" },
    { img: "/gift-cards/female-1.jpg", title: "كرت بنات" },
    { img: "/gift-cards/female-2.jpg", title: "كرت بنات" },
    { img: "/gift-cards/female-3.jpg", title: "كرت بنات" },
    { img: "/gift-cards/both-1.jpg", title: "كرت مشترك" },
    { img: "/gift-cards/both-2.jpg", title: "كرت مشترك" },
  ];
  // Merge default cards with Firebase cards
  const validFirebaseCards = firebaseCards.filter((c) => c.img);
  const giftCards = validFirebaseCards.length > 0
    ? [...defaultCards, ...validFirebaseCards.map((c) => ({ img: c.img, title: c.name }))]
    : defaultCards;

  return (
    <div>

      {/* ═══════════════════════════════
          HERO
          ═══════════════════════════════ */}
      <section className="bg-hero text-center" style={{ padding: "5rem 0 4.5rem" }}>
        <div className="container" style={{ maxWidth: 640 }}>
          <h1 className="f-display display-4 mb-4">{APP_NAME} 🎮</h1>
          <p className="f-display fs-4 text-c-primary mb-4">
            تعليم + تربية في 3 ألعاب آمنة 🇸🇦
          </p>

          <p className="f-body mb-3" style={{ fontSize: "1rem", color: "#555" }}>
            🎓 ألعاب تفاعلية على المنهج السعودي
          </p>

          <div className="d-flex flex-column align-items-center gap-1 mb-3">
            <span className="f-body" style={{ fontSize: "0.95rem", color: "#555" }}>🌉 لعبة جسر المحبة</span>
            <span className="f-body" style={{ fontSize: "0.95rem", color: "#555" }}>🌱 لعبة ازرع حديقتك</span>
            <span className="f-body" style={{ fontSize: "0.95rem", color: "#555" }}>🃏 لعبة تطابق الصور</span>
          </div>

          <p className="f-body mb-3" style={{ fontSize: "0.9rem", color: "#999" }}>
            لغرس القيم الإسلامية
          </p>

          <p className="f-body mb-4" style={{ fontSize: "0.95rem", color: "#555" }}>
            👤 باسم طفلك وحسب صفه &nbsp;•&nbsp; 🎁 تنفع هدية عيد أو مناسبة!
          </p>

          <div className="d-flex justify-content-center gap-3 flex-wrap mb-4">
            <button onClick={goOrder} className="btn btn-primary btn-xl shadow">
              اطلب الآن 📋
            </button>
            <button onClick={() => navigate("/demo")} className="btn btn-outline-primary btn-xl">
              جرّب مجاناً 🎮
            </button>
          </div>

          <div className="d-flex flex-wrap justify-content-center gap-2">
            {["✅ تعليمي + تربوي", "✅ آمن شرعياً", "✅ بدون إعلانات", "✅ يعمل بدون نت", "✅ هدية مميزة"].map((b) => (
              <span key={b} className="badge bg-white text-c-light border fw-normal px-3 py-2 rounded-pill" style={{ fontSize: "0.85rem" }}>
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════
          HOW IT WORKS (updated steps)
          ═══════════════════════════════ */}
      <section className="bg-white border-top border-c" style={{ padding: "4.5rem 0" }}>
        <div className="container" style={{ maxWidth: 620 }}>
          <div className="text-center mb-5">
            <span className="section-label mb-3 d-inline-block">كيف تطلب؟</span>
            <h2 className="f-display fs-2">ثلاث خطوات بس!</h2>
          </div>
          <div className="d-flex flex-column gap-3">
            {[
              { n: "1", icon: "🛤️", title: "اختر المسار", desc: "تعليمي (مواد دراسية) أو تربوي (قيم وفضائل) أو كلاهما معاً" },
              { n: "2", icon: "🎁", title: "اختر كرت الهدية", desc: "كارت هدية خاص مع اللعبة — مثالي كهدية عيد أو مناسبة" },
              { n: "3", icon: "💳", title: "حوّل واستلم", desc: "حوّل المبلغ عبر البنك واستلم روابط الألعاب عبر الواتساب" },
            ].map((s) => (
              <div key={s.n} className="d-flex align-items-start gap-3 p-4 rounded-4 border border-c bg-light-purple">
                <div className="flex-shrink-0 d-flex align-items-center justify-content-center rounded-3 text-white f-display fs-5 shadow-sm"
                  style={{ width: 48, height: 48, background: "var(--c-primary)" }}>
                  {s.n}
                </div>
                <div>
                  <h5 className="f-display fs-6 mb-1">{s.icon} {s.title}</h5>
                  <p className="f-body small text-c-light mb-0">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <button onClick={goOrder} className="btn btn-primary rounded-pill px-5 f-display">
              اطلب الآن 🚀
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════
          ANAS STORY (moved up for visibility)
          ═══════════════════════════════ */}
      <section className="bg-white border-top border-c" style={{ padding: "4.5rem 0" }}>
        <div className="container" style={{ maxWidth: 650 }}>
          <div className="text-center mb-4">
            <span className="section-label mb-3 d-inline-block">قصتنا 💡</span>
            <h2 className="f-display fs-2 mb-2">كيف بدأ {APP_NAME}؟</h2>
          </div>
          <div className="card border-c p-4 p-sm-5 shadow-sm" style={{ background: "linear-gradient(135deg, #f8f5ff, #eef6ff)" }}>
            <div className="text-center mb-4" style={{ fontSize: "3rem" }}>👦🏻</div>
            <p className="f-body mb-3" style={{ fontSize: "1.05rem", lineHeight: 1.8 }}>
              بدأت القصة عندما طلبت المدرسة من <strong style={{ color: "var(--c-primary)" }}>أنس</strong> عمل مشروع عن <strong>التسامح</strong>.
              <br />بدل ما يكتب بحث عادي، قرر يصنع <strong>لعبة تفاعلية</strong> تعلّم الأطفال التسامح بمواقف من حياتهم اليومية.
            </p>
            <p className="f-body mb-3" style={{ fontSize: "1.05rem", lineHeight: 1.8 }}>
              استخدم <strong style={{ color: "var(--c-primary)" }}>الذكاء الاصطناعي</strong> لتصميم اللعبة.
              <br />وكانت النتيجة مذهلة! أعجب بها آخرون وطلبوا نسخاً لأطفالهم.
            </p>
            <p className="f-body mb-0" style={{ fontSize: "1.05rem", lineHeight: 1.8 }}>
              من هنا وُلدت فكرة <strong style={{ color: "var(--c-primary)" }}>{APP_NAME}</strong>
              <br />لعبة تجمع بين <strong>التعليم الأكاديمي</strong> على المنهج السعودي و<strong>التربية الأخلاقية</strong> بأسلوب ممتع وتفاعلي.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════
          SUBJECTS + VIRTUES (side by side)
          ═══════════════════════════════ */}
      <section className="bg-light-purple border-top border-c" style={{ padding: "4.5rem 0" }}>
        <div className="container" style={{ maxWidth: 1100 }}>
          <div className="text-center mb-5">
            <span className="section-label mb-3 d-inline-block">ماذا يتعلم طفلك؟</span>
            <h2 className="f-display fs-2 mb-2">مساران في 3 ألعاب</h2>
            <p className="f-body text-c-light">تعليم أكاديمي + تربية أخلاقية — من الروضة والتمهيدي حتى الصف السادس</p>
          </div>

          <div className="row g-4">
            {/* ── العمود الأيمن: المسار التعليمي ── */}
            <div className="col-12 col-md-6">
              <div className="card h-100 p-4 border-c shadow-sm bg-white">
                <div className="text-center mb-4">
                  <span className="badge bg-primary text-white f-display px-3 py-2 rounded-pill" style={{ background: "var(--c-primary)", fontSize: "0.85rem" }}>
                    المسار التعليمي 📚
                  </span>
                  <h4 className="f-display fs-5 mt-3 mb-1">المواد الدراسية</h4>
                  <p className="f-body small text-c-light mb-0">أسئلة تفاعلية على المنهج السعودي</p>
                </div>
                <div className="row g-3">
                  {Object.values(SUBJECTS).map((sub) => (
                    <div key={sub.id} className="col-6">
                      <div className="card h-100 p-3 text-center border-2"
                        style={{ borderColor: sub.color + "25", transition: "all 0.3s", cursor: "default" }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.07)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
                      >
                        <div className="d-flex align-items-center justify-content-center rounded-3 mx-auto mb-2"
                          style={{ width: 44, height: 44, background: sub.colorLight, fontSize: "1.4rem" }}>
                          {sub.icon}
                        </div>
                        <h6 className="f-display small mb-1" style={{ color: sub.color }}>{sub.name}</h6>
                        <p className="f-body mb-2" style={{ fontSize: "0.7rem", color: "#999" }}>{sub.description}</p>
                        <div className="d-flex flex-wrap justify-content-center gap-1">
                          {Object.values(GRADES).map((g) => (
                            <span key={g.id} className="badge rounded-pill fw-normal px-1 py-0"
                              style={{ background: sub.colorLight, color: sub.color, fontSize: "0.6rem" }}>
                              {g.shortName}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── العمود الأيسر: المسار التربوي ── */}
            <div className="col-12 col-md-6">
              <div className="card h-100 p-4 border-c shadow-sm bg-white">
                <div className="text-center mb-4">
                  <span className="badge text-white f-display px-3 py-2 rounded-pill" style={{ background: "#00b894", fontSize: "0.85rem" }}>
                    المسار التربوي 🌿
                  </span>
                  <h4 className="f-display fs-5 mt-3 mb-1">ثلاث ألعاب تربوية</h4>
                  <p className="f-body small text-c-light mb-0">ألعاب تغرس القيم الإسلامية بأسلوب ممتع</p>
                </div>

                {/* ── 3 ألعاب تربوية ── */}
                {[
                  { icon: "🌉", name: "جسر المحبة", color: "#6c5ce7", bg: "#f0eaff", desc: "مواقف من الحياة اليومية — كل إجابة صحيحة تبني قطعة من الجسر!" },
                  { icon: "🌱", name: "ازرع حديقتك", color: "#43a047", bg: "#e8f5e9", desc: "ميّز الأفعال الصحيحة — كل فعل صحيح يزرع وردة في حديقتك!" },
                  { icon: "🃏", name: "تطابق الصور", color: "#e17055", bg: "#fff5f0", desc: "اقلب الكروت وابحث عن الأزواج المتشابهة — تعلّم وأنت تلعب!" },
                ].map((game) => (
                  <div key={game.name} className="card p-3 mb-2 border-2" style={{ borderColor: game.color + "25", background: game.bg }}>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span style={{ fontSize: "1.3rem" }}>{game.icon}</span>
                      <h6 className="f-display small mb-0" style={{ color: game.color }}>{game.name}</h6>
                    </div>
                    <p className="f-body mb-0" style={{ fontSize: "0.75rem", color: "#888" }}>{game.desc}</p>
                  </div>
                ))}

                <div className="d-flex flex-wrap gap-1 mt-2 mb-1">
                  {Object.values(VIRTUES).map((v) => (
                    <span key={v.id} className="badge rounded-pill fw-normal px-2 py-1"
                      style={{ background: v.colorLight, color: v.color, fontSize: "0.65rem" }}>
                      {v.icon} {v.name}
                    </span>
                  ))}
                </div>
                <p className="f-body mb-0" style={{ fontSize: "0.7rem", color: "#999" }}>
                  الطفل يختار الفضيلة ثم يختار أي لعبة — 3 ألعاب مختلفة لكل فضيلة!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════
          GIFT CARDS
          ═══════════════════════════════ */}
      <section className="bg-light-purple border-top border-c" style={{ padding: "4.5rem 0" }}>
        <div className="container" style={{ maxWidth: 900 }}>
          <div className="text-center mb-5">
            <span className="section-label mb-3 d-inline-block">هدية العيد 🎁</span>
            <h2 className="f-display fs-2 mb-2">عيديّة مختلفة ومميزة!</h2>
            <p className="f-body text-c-light">اهدِ طفلاً تعليماً وتربية — مع كارت معايدة خاص</p>
          </div>
          <div className="row g-3">
            {giftCards.map((card, i) => (
              <div key={i} className="col-6 col-md-4">
                <div className="rounded-4 overflow-hidden shadow-sm"
                  style={{ border: "2px solid #e0e0e0" }}>
                  <img src={card.img} alt={card.title} className="w-100 d-block" />
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <button onClick={goOrder} className="btn btn-primary rounded-pill px-4 f-display">
              اطلب هدية الآن 🎁
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════
          HOW TO PLAY
          ═══════════════════════════════ */}
      <section className="bg-white border-top border-c" style={{ padding: "4.5rem 0" }}>
        <div className="container" style={{ maxWidth: 700 }}>
          <div className="text-center mb-5">
            <span className="section-label mb-3 d-inline-block">طريقة اللعب 🎮</span>
            <h2 className="f-display fs-2 mb-2">كيف يتعلم طفلك؟</h2>
          </div>
          <div className="row g-4">
            {[
              { icon: "📚", title: "المسار التعليمي", steps: ["يختار المادة (رياضيات، عربي، إنجليزي، علوم)", "تظهر أسئلة تفاعلية حسب صفه", "يجمع نقاط ويحصل على شهادات"] },
              { icon: "🌉", title: "جسر المحبة", steps: ["يختار الفضيلة ثم يواجه مواقف تفاعلية", "كل إجابة صحيحة تبني قطعة من الجسر", "عند اكتمال الجسر يحصل على شهادة!"] },
              { icon: "🌱", title: "ازرع حديقتك", steps: ["يميّز بين الأفعال الصحيحة والخاطئة", "كل إجابة صحيحة تزرع وردة في الحديقة", "تصحيح تربوي إيجابي بدون لوم"] },
              { icon: "🃏", title: "تطابق الصور", steps: ["كروت مقلوبة يبحث عن الأزواج المتشابهة", "كل زوج متطابق يعلّمه قيمة جديدة", "تنمّي الذاكرة والتركيز"] },
            ].map((item, i) => (
              <div key={i} className="col-6 col-md-3">
                <div className="card h-100 p-3 border-c shadow-sm text-center">
                  <div style={{ fontSize: "1.8rem" }} className="mb-2">{item.icon}</div>
                  <h6 className="f-display mb-2" style={{ fontSize: "0.85rem" }}>{item.title}</h6>
                  <ul className="list-unstyled f-body text-c-light text-start mb-0">
                    {item.steps.map((s, j) => (
                      <li key={j} className="mb-1 d-flex align-items-start gap-1" style={{ fontSize: "0.7rem", lineHeight: 1.4 }}>
                        <span className="text-success flex-shrink-0">✓</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════
          FEATURES
          ═══════════════════════════════ */}
      <section className="bg-light-purple border-top border-c" style={{ padding: "4.5rem 0" }}>
        <div className="container" style={{ maxWidth: 900 }}>
          <div className="text-center mb-5">
            <span className="section-label mb-3 d-inline-block">المميزات</span>
            <h2 className="f-display fs-2 mb-2">ليش تختار {APP_NAME}؟ 💡</h2>
            <p className="f-body text-c-light">ميزات تجعلنا الخيار الأفضل لأطفالكم</p>
          </div>
          <div className="row g-4">
            {features.map((f, i) => (
              <div key={i} className="col-12 col-sm-6 col-lg-4">
                <div className="feature-card card h-100 p-4 border-c bg-white">
                  <div className="accent-bar" style={{ background: f.accent }} />
                  <div className="mb-3" style={{ fontSize: "1.8rem" }}>{f.icon}</div>
                  <h6 className="f-display mb-2">{f.title}</h6>
                  <p className="f-body small text-c-light mb-0">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════
          TESTIMONIALS (expanded)
          ═══════════════════════════════ */}
      <section className="bg-white border-top border-c" style={{ padding: "4.5rem 0" }}>
        <div className="container" style={{ maxWidth: 900 }}>
          <div className="text-center mb-5">
            <span className="section-label mb-3 d-inline-block">آراء الأهالي</span>
            <h2 className="f-display fs-2">ماذا يقول الأهل؟ 💬</h2>
          </div>
          <div className="row g-4">
            {testimonials.map((t, i) => (
              <div key={i} className="col-12 col-sm-6 col-lg-4">
                <div className="card h-100 p-4 border-c shadow-sm">
                  <div className="text-c-star small mb-2">★★★★★</div>
                  <p className="f-body mb-4" style={{ fontSize: "0.95rem", lineHeight: 1.7 }}>
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="d-flex align-items-center gap-2 pt-3 border-top border-c mt-auto">
                    <div className="d-flex align-items-center justify-content-center rounded-circle f-display small text-c-primary"
                      style={{ width: 36, height: 36, background: "rgba(108,92,231,0.1)" }}>
                      {t.name.charAt(0)}
                    </div>
                    <span className="f-display small">{t.name}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════
          PRICING
          ═══════════════════════════════ */}
      {/* ═══════════════════════════════
          PROMOTION BANNER (before pricing)
          ═══════════════════════════════ */}
      {pricing.promotions && Object.values(pricing.promotions).filter(p => p.active).length > 0 && (
        <section className="border-top border-c" style={{ padding: "2rem 0", background: "linear-gradient(135deg, #fff9e6, #fff3cd)" }}>
          <div className="container" style={{ maxWidth: 600 }}>
            {Object.values(pricing.promotions).filter(p => p.active).map((promo) => (
              <div key={promo.id} className="text-center">
                <span style={{ fontSize: "2rem" }}>🏷️</span>
                <h3 className="f-display fs-4 mt-2 mb-1">{promo.name}</h3>
                <p className="f-body text-c-light mb-2">{promo.description}</p>
                <button onClick={goOrder} className="btn btn-warning rounded-pill px-4 f-display shadow-sm">
                  استفد من العرض الآن 🚀
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="bg-light-purple border-top border-c" style={{ padding: "4.5rem 0" }}>
        <div className="container" style={{ maxWidth: 480 }}>
          <div className="text-center mb-5">
            <span className="section-label mb-3 d-inline-block">الأسعار</span>
            <h2 className="f-display fs-2 mb-2">سعر بسيط، قيمة كبيرة 💰</h2>
            <p className="f-body text-c-light">سعر مناسب وجودة عالية — تنفع عيدية مميزة!</p>
          </div>

          <div className="card shadow-lg border-2 p-4 p-sm-5 text-center position-relative"
            style={{ borderColor: "rgba(108,92,231,0.3)" }}>
            <div className="position-absolute top-0 start-50 translate-middle">
              <span className="badge bg-primary text-white f-display px-3 py-2 rounded-pill shadow-sm"
                style={{ background: "var(--c-primary)", fontSize: "0.8rem" }}>
                ⭐ الأكثر طلباً
              </span>
            </div>

            <div className="f-display text-c-primary mt-3" style={{ fontSize: "3.5rem" }}>{pricing.packages.golden.price}</div>
            <div className="f-display fs-5 text-c-primary mb-1">ريال — {pricing.packages.golden.name}</div>
            <p className="f-body small text-c-light mb-4">
              4 مواد + 5 قيم تربوية — بدل <span className="text-decoration-line-through">{pricing.packages.golden.originalPrice} ريال</span>
            </p>

            <hr className="border-c" />

            <div className="d-flex flex-column gap-2 my-4 text-start">
              {[
                "جميع المواد: رياضيات + عربي + إنجليزي + علوم",
                "جميع القيم: بر الوالدين + الصدق + التسامح + الأمانة + احترام الكبير",
                "لعبة جسر المحبة التفاعلية",
                "شهادات إتمام لكل فضيلة",
                "يعمل بدون إنترنت",
                "بدون إعلانات نهائياً",
              ].map((item, i) => (
                <div key={i} className="d-flex align-items-center gap-2 f-body" style={{ fontSize: "0.95rem" }}>
                  <span className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                    style={{ width: 22, height: 22, background: "rgba(0,184,148,0.1)", color: "var(--c-correct)", fontSize: "0.65rem" }}>
                    ✓
                  </span>
                  {item}
                </div>
              ))}
            </div>

            <button onClick={goOrder} className="btn btn-primary btn-lg w-100">
              اطلب الآن 📋
            </button>
            <p className="f-body small text-c-light mt-2 mb-0">سنتواصل معك عبر الواتساب لإتمام الطلب</p>
          </div>

          <div className="card mt-4 p-4 border-c bg-white">
            <p className="f-display small text-center mb-3">باقات أخرى 👇</p>
            <div className="d-flex flex-column gap-2">
              {[
                { name: pricing.items.single_subject.name, price: pricing.items.single_subject.price },
                { name: pricing.items.single_virtue.name, price: pricing.items.single_virtue.price },
                { name: pricing.packages.virtue_bundle.name + " (5 قيم)", price: pricing.packages.virtue_bundle.price },
                { name: pricing.packages.excellence.name + " (مادة + 5 قيم)", price: pricing.packages.excellence.price },
              ].map((c) => (
                <div key={c.name} className="d-flex align-items-center justify-content-between bg-light-purple rounded-3 px-3 py-2 border" style={{ borderColor: "#f0f0f0" }}>
                  <span className="f-body small">{c.name}</span>
                  <span className="f-display small" style={{ color: "var(--c-primary)" }}>{c.price} ريال</span>
                </div>
              ))}
            </div>
            <div className="text-center mt-3">
              <small className="f-body text-c-light">خصم {pricing.childDiscounts[2]}% للطفل الثاني، {pricing.childDiscounts[3]}% لكل طفل إضافي</small>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════
          FINAL CTA
          ═══════════════════════════════ */}
      <section className="bg-cta text-center text-white" style={{ padding: "4.5rem 0" }}>
        <div className="container" style={{ maxWidth: 500 }}>
          <h2 className="f-display fs-2 mb-3">جاهز تشوف طفلك يتعلم ويستمتع؟ 🌟</h2>
          <p className="f-body fs-5 mb-5" style={{ opacity: 0.75 }}>انضم لمئات العائلات السعودية</p>
          <button onClick={goOrder} className="btn btn-white btn-xl shadow-lg">
            اطلب الآن 📋
          </button>
          <p className="f-body small mt-4" style={{ opacity: 0.4 }}>تعليمي + تربوي • يعمل بدون نت • آمن شرعياً</p>
          <div className="d-flex justify-content-center gap-3 mt-3">
            <button onClick={() => navigate("/faq")} className="btn btn-outline-light btn-sm rounded-pill px-3 f-body" style={{ opacity: 0.7 }}>
              الأسئلة الشائعة ❓
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════
          FOOTER
          ═══════════════════════════════ */}
      <footer className="bg-footer-dark text-center" style={{ padding: "2.5rem 0" }}>
        <p className="f-display mb-1" style={{ color: "rgba(255,255,255,0.7)" }}>{APP_NAME}</p>
        <p className="f-body small mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>تعليم + تربية — من السعودية 🇸🇦</p>
        <div className="d-flex justify-content-center gap-4 flex-wrap f-body small" style={{ color: "rgba(255,255,255,0.25)" }}>
          <span style={{ cursor: "pointer" }} onClick={() => navigate("/faq")}>الأسئلة الشائعة</span>
          <span style={{ cursor: "pointer" }} onClick={() => navigate("/order")}>اطلب الآن</span>
          <span style={{ cursor: "pointer" }} onClick={() => navigate("/privacy")}>سياسة الخصوصية</span>
          <a href={`https://wa.me/${SUPPORT_WHATSAPP}`} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none", cursor: "pointer" }}>تواصل معنا</a>
        </div>
        <hr style={{ borderColor: "rgba(255,255,255,0.05)" }} className="mx-auto mt-3 mb-3" />
        <a
          href={`${window.location.origin}/docs/freelance-certificate.pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="f-body d-inline-block mb-2 text-decoration-none"
          style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.35)" }}
          onClick={(e) => { e.preventDefault(); window.open(`${window.location.origin}/docs/freelance-certificate.pdf`, "_blank"); }}
        >
          📄 وثيقة العمل الحر — وزارة الموارد البشرية
        </a>
        <p className="f-body mb-0" style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.15)" }}>
          © {new Date().getFullYear()} {APP_NAME} - جميع الحقوق محفوظة
        </p>
      </footer>
    </div>
  );
}
