import { useNavigate } from "react-router-dom";
import SUBJECTS from "@data/config/subjects";
import GRADES from "@data/config/grades";
import { APP_NAME } from "@utils/constants";

export default function LandingPage() {
  const navigate = useNavigate();
  const goSetup = () => navigate("/setup");

  const features = [
    { icon: "🛡️", title: "آمن شرعياً 100%", desc: "محتوى متوافق مع القيم الإسلامية، بدون إعلانات أو روابط خارجية", accent: "#6c5ce7" },
    { icon: "🇸🇦", title: "منهج سعودي دقيق", desc: "مصمم خصيصاً للمنهج الدراسي السعودي الجديد", accent: "#00b894" },
    { icon: "⭐", title: "تشجيع إيجابي", desc: "رسائل تحفيزية مستمرة بدون أي أحكام سلبية على طفلك", accent: "#fdcb6e" },
    { icon: "🎮", title: "تعلّم بالمتعة", desc: "ألعاب تفاعلية تجعل المذاكرة تجربة ممتعة ومشوّقة", accent: "#fd79a8" },
    { icon: "📊", title: "تخصيص كامل", desc: "باسم طفلك، وحسب صفه، وبالمادة اللي يحتاجها", accent: "#74b9ff" },
    { icon: "💰", title: "سعر مناسب", desc: "29 ريال/شهر فقط - أرخص من جميع المنافسين", accent: "#00b894" },
  ];

  const testimonials = [
    { name: "أم عبدالله", text: "ابني صار يحب يذاكر! كل يوم يطلب يلعب اللعبة" },
    { name: "أبو سارة", text: "أخيراً لقيت شيء آمن ومفيد لبناتي، والسعر معقول جداً" },
    { name: "أم نورة", text: "ما شاء الله البنت تحسنت في الرياضيات بشكل ملحوظ" },
  ];

  return (
    <div>

      {/* ═══════════════════════════════
          HERO
          ═══════════════════════════════ */}
      <section className="bg-hero text-center" style={{ padding: "5rem 0 4.5rem" }}>
        <div className="container" style={{ maxWidth: 640 }}>
          <h1 className="f-display display-4 mb-3">{APP_NAME} 🎮</h1>
          <p className="f-display fs-4 text-c-primary mb-3">
            اللعبة التعليمية الآمنة لأطفالنا السعوديين 🇸🇦
          </p>
          <p className="f-body fs-5 text-c-light mb-5 mx-auto" style={{ maxWidth: 500 }}>
            ألعاب تفاعلية ممتعة مصممة على المنهج السعودي، باسم طفلك وحسب صفه الدراسي
          </p>
          <button onClick={goSetup} className="btn btn-primary btn-xl shadow">
            جرّب مجاناً الحين! 🚀
          </button>
          <div className="d-flex flex-wrap justify-content-center gap-2 mt-4">
            {["✅ آمن شرعياً", "✅ منهج سعودي", "✅ بدون إعلانات", "✅ تجربة مجانية"].map((b) => (
              <span key={b} className="badge bg-white text-c-light border fw-normal px-3 py-2 rounded-pill" style={{ fontSize: "0.85rem" }}>
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════
          HOW IT WORKS
          ═══════════════════════════════ */}
      <section className="bg-white border-top border-c" style={{ padding: "4.5rem 0" }}>
        <div className="container" style={{ maxWidth: 620 }}>
          <div className="text-center mb-5">
            <span className="section-label mb-3 d-inline-block">كيف يشتغل؟</span>
            <h2 className="f-display fs-2">ثلاث خطوات بس!</h2>
          </div>
          <div className="d-flex flex-column gap-3">
            {[
              { n: "1", icon: "✏️", title: "اكتب اسم طفلك", desc: "اللعبة تتخصص باسمه الشخصي في كل شاشة" },
              { n: "2", icon: "📚", title: "اختر المادة والصف", desc: "رياضيات، عربي، إنجليزي، أو علوم - من الروضة حتى السادس" },
              { n: "3", icon: "🎮", title: "ابدأ اللعب!", desc: "طفلك يتعلم ويستمتع فوراً مع تشجيع مستمر" },
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
        </div>
      </section>

      {/* ═══════════════════════════════
          SUBJECTS
          ═══════════════════════════════ */}
      <section className="bg-light-purple border-top border-c" style={{ padding: "4.5rem 0" }}>
        <div className="container" style={{ maxWidth: 750 }}>
          <div className="text-center mb-5">
            <span className="section-label mb-3 d-inline-block">المحتوى التعليمي</span>
            <h2 className="f-display fs-2 mb-2">المواد المتوفرة 📚</h2>
            <p className="f-body text-c-light">محتوى مصمم بعناية من معلمين سعوديين متخصصين</p>
          </div>
          <div className="row g-4">
            {Object.values(SUBJECTS).map((sub) => (
              <div key={sub.id} className="col-6 col-sm-6 col-lg-3">
                <div className="card h-100 p-4 text-center border-2 shadow-sm"
                  style={{ borderColor: sub.color + "25", transition: "all 0.3s", cursor: "default" }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.08)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
                >
                  <div className="d-flex align-items-center justify-content-center rounded-3 mx-auto mb-3"
                    style={{ width: 56, height: 56, background: sub.colorLight, fontSize: "1.8rem" }}>
                    {sub.icon}
                  </div>
                  <h5 className="f-display" style={{ color: sub.color }}>{sub.name}</h5>
                  <p className="f-body small text-c-light mb-3">{sub.description}</p>
                  <div className="d-flex flex-wrap justify-content-center gap-1">
                    {Object.values(GRADES).map((g) => (
                      <span key={g.id} className="badge rounded-pill fw-normal px-2 py-1"
                        style={{ background: sub.colorLight, color: sub.color, fontSize: "0.7rem" }}>
                        {g.shortName}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════
          FEATURES
          ═══════════════════════════════ */}
      <section className="bg-white border-top border-c" style={{ padding: "4.5rem 0" }}>
        <div className="container" style={{ maxWidth: 900 }}>
          <div className="text-center mb-5">
            <span className="section-label mb-3 d-inline-block">المميزات</span>
            <h2 className="f-display fs-2 mb-2">ليش تختار {APP_NAME}؟ 💡</h2>
            <p className="f-body text-c-light">ميزات تجعلنا الخيار الأفضل لأطفالكم</p>
          </div>
          <div className="row g-4">
            {features.map((f, i) => (
              <div key={i} className="col-12 col-sm-6 col-lg-4">
                <div className="feature-card card h-100 p-4 border-c bg-light-purple">
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
          TESTIMONIALS
          ═══════════════════════════════ */}
      <section className="bg-light-purple border-top border-c" style={{ padding: "4.5rem 0" }}>
        <div className="container" style={{ maxWidth: 750 }}>
          <div className="text-center mb-5">
            <span className="section-label mb-3 d-inline-block">آراء الأهالي</span>
            <h2 className="f-display fs-2">ماذا يقول الأهل؟ 💬</h2>
          </div>
          <div className="row g-4">
            {testimonials.map((t, i) => (
              <div key={i} className="col-12 col-sm-4">
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
      <section className="bg-white border-top border-c" style={{ padding: "4.5rem 0" }}>
        <div className="container" style={{ maxWidth: 480 }}>
          <div className="text-center mb-5">
            <span className="section-label mb-3 d-inline-block">الأسعار</span>
            <h2 className="f-display fs-2 mb-2">سعر بسيط، قيمة كبيرة 💰</h2>
            <p className="f-body text-c-light">أرخص من جميع المنافسين مع جودة أعلى</p>
          </div>

          {/* Pricing card */}
          <div className="card shadow-lg border-2 p-4 p-sm-5 text-center position-relative"
            style={{ borderColor: "rgba(108,92,231,0.3)" }}>
            {/* Badge */}
            <div className="position-absolute top-0 start-50 translate-middle">
              <span className="badge bg-primary text-white f-display px-3 py-2 rounded-pill shadow-sm"
                style={{ background: "var(--c-primary)", fontSize: "0.8rem" }}>
                ⭐ الأكثر طلباً
              </span>
            </div>

            <div className="f-display text-c-primary mt-3" style={{ fontSize: "3.5rem" }}>29</div>
            <div className="f-display fs-5 text-c-primary mb-1">ريال / شهر</div>
            <p className="f-body small text-c-light mb-4">
              أو <strong style={{ color: "var(--c-text)" }}>249 ريال/سنة</strong> (وفّر 30%!)
            </p>

            <hr className="border-c" />

            <div className="d-flex flex-column gap-2 my-4 text-start">
              {[
                "جميع المواد والصفوف",
                "أسئلة جديدة كل شهر",
                "تشجيع ذكي مخصص باسم طفلك",
                "بدون إعلانات نهائياً",
                "شارك النتائج مع العائلة",
                "محتوى آمن 100% شرعياً",
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

            <button onClick={goSetup} className="btn btn-primary btn-lg w-100">
              ابدأ التجربة المجانية (7 أيام) 🎁
            </button>
            <p className="f-body small text-c-light mt-2 mb-0">لا يُطلب بطاقة ائتمانية</p>
          </div>

          {/* Comparison */}
          <div className="card mt-4 p-4 border-c bg-light-purple">
            <p className="f-display small text-center mb-3">قارن بنفسك 👇</p>
            <div className="d-flex flex-column gap-2">
              {[
                { name: "عصافير", price: "49", save: "41%" },
                { name: "لمسة", price: "39", save: "26%" },
                { name: "تكامل", price: "99", save: "71%" },
              ].map((c) => (
                <div key={c.name} className="d-flex align-items-center justify-content-between bg-white rounded-3 px-3 py-2 border" style={{ borderColor: "#f0f0f0" }}>
                  <span className="f-body small">{c.name}</span>
                  <span className="f-body small text-c-light">{c.price} ريال/شهر</span>
                  <span className="badge bg-success bg-opacity-10 text-c-correct fw-bold rounded-pill" style={{ fontSize: "0.7rem" }}>
                    وفّر {c.save}
                  </span>
                </div>
              ))}
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
          <button onClick={goSetup} className="btn btn-white btn-xl shadow-lg">
            ابدأ مجاناً الحين! 🚀
          </button>
          <p className="f-body small mt-4" style={{ opacity: 0.4 }}>بدون بطاقة ائتمانية • تجربة 7 أيام كاملة</p>
        </div>
      </section>

      {/* ═══════════════════════════════
          FOOTER
          ═══════════════════════════════ */}
      <footer className="bg-footer-dark text-center" style={{ padding: "2.5rem 0" }}>
        <p className="f-display mb-1" style={{ color: "rgba(255,255,255,0.7)" }}>{APP_NAME}</p>
        <p className="f-body small mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>صُنع بـ ❤️ في السعودية 🇸🇦</p>
        <div className="d-flex justify-content-center gap-4 f-body small" style={{ color: "rgba(255,255,255,0.25)" }}>
          <span style={{ cursor: "pointer" }}>سياسة الخصوصية</span>
          <span style={{ cursor: "pointer" }}>شروط الخدمة</span>
          <span style={{ cursor: "pointer" }}>تواصل معنا</span>
        </div>
        <hr style={{ borderColor: "rgba(255,255,255,0.05)" }} className="mx-auto mt-3 mb-3" />
        <p className="f-body mb-0" style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.15)" }}>
          © {new Date().getFullYear()} {APP_NAME} - جميع الحقوق محفوظة
        </p>
      </footer>
    </div>
  );
}
