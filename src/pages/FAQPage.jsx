import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { APP_NAME } from "@utils/constants";

const FAQ_ITEMS = [
  {
    category: "الطلب والدفع",
    questions: [
      {
        q: "كيف أطلب اللعبة؟",
        a: "اضغط على 'اطلب الآن' واملأ نموذج الطلب ببيانات ولي الأمر والأطفال. بعد الإرسال سنتواصل معك عبر الواتساب لإتمام الدفع.",
      },
      {
        q: "ما هي طرق الدفع المتاحة؟",
        a: "حالياً الدفع عبر التحويل البنكي. بعد تعبئة نموذج الطلب سنرسل لك بيانات الحساب البنكي عبر الواتساب.",
      },
      {
        q: "هل يمكنني تقسيط المبلغ؟",
        a: "الأسعار مخفضة جداً ولا تحتاج تقسيط. باقة كاملة لجميع المواد والقيم تبدأ من 49 ريال فقط!",
      },
    ],
  },
  {
    category: "استخدام اللعبة",
    questions: [
      {
        q: "هل تعمل اللعبة بدون إنترنت؟",
        a: "نعم! بعد فتح رابط الطفل أول مرة بالإنترنت، يمكن اللعب بدون إنترنت في أي وقت. التقدم يُحفظ محلياً ويُزامن تلقائياً عند عودة الاتصال.",
      },
      {
        q: "كم جهاز يمكن استخدامه لكل طفل؟",
        a: "يمكن تفعيل الرابط على 3 أجهزة كحد أقصى لكل طفل (جوال + تابلت + كمبيوتر مثلاً).",
      },
      {
        q: "هل يمكنني إضافة أكثر من طفل؟",
        a: "بالتأكيد! يمكنك إضافة حتى 10 أطفال في الحساب الواحد، مع خصومات على الأطفال الإضافيين.",
      },
      {
        q: "ما الأجهزة المدعومة؟",
        a: "اللعبة تعمل على أي جهاز فيه متصفح: جوال (آيفون/أندرويد)، تابلت (آيباد/أندرويد)، أو كمبيوتر. لا تحتاج تحميل أي تطبيق!",
      },
    ],
  },
  {
    category: "المحتوى التعليمي والتربوي",
    questions: [
      {
        q: "ما هي المواد التعليمية المتاحة؟",
        a: "4 مواد: الرياضيات، اللغة العربية، اللغة الإنجليزية، والعلوم. الأسئلة مصممة للمراحل من KG1 حتى السادس ابتدائي.",
      },
      {
        q: "ما هي القيم التربوية المتاحة؟",
        a: "5 فضائل: بر الوالدين، الصدق، التسامح والعفو، الأمانة، واحترام الكبير. كل فضيلة فيها 12 موقف تفاعلي عبر لعبة 'جسر المحبة'.",
      },
      {
        q: "كيف تعمل لعبة جسر المحبة؟",
        a: "يُعرض على الطفل موقف من الحياة اليومية مع 3 خيارات. الإجابة الصحيحة تبني قطعة من الجسر. عند اكتمال الجسر يحصل الطفل على شهادة إتمام!",
      },
      {
        q: "هل المحتوى مناسب لجميع الأعمار؟",
        a: "نعم، المواقف والأسئلة مصممة بلغة بسيطة تناسب الأطفال من 4 سنوات فما فوق.",
      },
    ],
  },
  {
    category: "الهدايا والخصومات",
    questions: [
      {
        q: "هل يمكنني إهداء اللعبة لشخص آخر؟",
        a: "نعم! عند تعبئة نموذج الطلب، اختر 'هذا الطلب هدية' وأدخل اسم المُهدي وصفته. سنجهز كرت هدية مخصص مع الروابط.",
      },
      {
        q: "ما هي الخصومات المتاحة؟",
        a: "خصم 15% للطفل الثاني، و25% لكل طفل إضافي. بالإضافة لعروض موسمية — تابعنا للاطلاع على أحدث العروض!",
      },
    ],
  },
];

const USAGE_GUIDE = [
  { step: "1", title: "اطلب من الموقع", desc: "املأ نموذج الطلب واختر المواد والقيم لكل طفل" },
  { step: "2", title: "أتمم الدفع", desc: "حوّل المبلغ وأرسل صورة الإيصال عبر الواتساب" },
  { step: "3", title: "استلم الروابط", desc: "سنرسل لك رابط خاص لكل طفل عبر الواتساب" },
  { step: "4", title: "ابدأ التعلّم!", desc: "افتح الرابط من أي جهاز — يعمل حتى بدون إنترنت!" },
];

const PARENTING_TIPS = [
  "خصص وقتاً يومياً للعب — 15 دقيقة كافية!",
  "شجّع طفلك عند كل إنجاز ولو كان صغيراً",
  "اجعل التعلّم مكافأة وليس عقاباً",
  "اربط القيم التربوية بمواقف حقيقية في حياة الطفل",
  "كافئ طفلك بمكافآت عينية عند إتمام المستويات (ملصقات، نزهة، وقت لعب إضافي)",
];

export default function FAQPage() {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(null);
  const [activeSection, setActiveSection] = useState("faq");

  function toggle(idx) {
    setOpenIndex(openIndex === idx ? null : idx);
  }

  let questionIndex = 0;

  return (
    <div className="bg-app min-vh-100 py-4">
      <div className="container" style={{ maxWidth: 700 }}>
        <div className="text-center mb-4">
          <span style={{ fontSize: "2.5rem" }}>❓</span>
          <h1 className="f-display fs-3 mt-2">{APP_NAME}</h1>
          <p className="f-body text-c-light">كل ما تحتاج معرفته</p>
        </div>

        {/* Section Tabs */}
        <div className="d-flex gap-2 justify-content-center mb-4">
          {[
            { id: "faq", label: "الأسئلة الشائعة" },
            { id: "guide", label: "دليل الاستخدام" },
            { id: "tips", label: "نصائح تربوية" },
          ].map((s) => (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              className={`btn rounded-pill px-3 f-display small ${activeSection === s.id ? "btn-primary" : "btn-outline-secondary"}`}>
              {s.label}
            </button>
          ))}
        </div>

        {/* ═══ FAQ ═══ */}
        {activeSection === "faq" && (
          <div className="anim-fade-up">
            {FAQ_ITEMS.map((cat) => (
              <div key={cat.category} className="mb-4">
                <h5 className="f-display mb-3" style={{ color: "var(--c-primary)" }}>{cat.category}</h5>
                {cat.questions.map((item) => {
                  const idx = questionIndex++;
                  const isOpen = openIndex === idx;
                  return (
                    <div key={idx} className="card border-c mb-2 overflow-hidden">
                      <div className="p-3 d-flex justify-content-between align-items-center"
                        style={{ cursor: "pointer", background: isOpen ? "#f8f5ff" : "white" }}
                        onClick={() => toggle(idx)}>
                        <strong className="f-body">{item.q}</strong>
                        <span style={{ transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "" }}>▼</span>
                      </div>
                      {isOpen && (
                        <div className="p-3 border-top f-body text-c-light" style={{ background: "#fafafa" }}>
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* ═══ USAGE GUIDE ═══ */}
        {activeSection === "guide" && (
          <div className="anim-fade-up">
            <h5 className="f-display mb-4 text-center">كيف تبدأ في 4 خطوات</h5>
            {USAGE_GUIDE.map((step, i) => (
              <div key={i} className="d-flex gap-3 align-items-start mb-3">
                <div className="flex-shrink-0 rounded-circle d-flex align-items-center justify-content-center f-display"
                  style={{ width: 45, height: 45, background: "var(--c-primary)", color: "white", fontSize: "1.2rem" }}>
                  {step.step}
                </div>
                <div className="card border-c p-3 flex-grow-1">
                  <strong className="f-body">{step.title}</strong>
                  <p className="f-body small text-c-light mb-0">{step.desc}</p>
                </div>
              </div>
            ))}
            <div className="text-center mt-4">
              <button onClick={() => navigate("/order")} className="btn btn-primary btn-lg rounded-pill px-5 f-display">
                اطلب الآن 🚀
              </button>
            </div>
          </div>
        )}

        {/* ═══ PARENTING TIPS ═══ */}
        {activeSection === "tips" && (
          <div className="anim-fade-up">
            <h5 className="f-display mb-4 text-center">نصائح تربوية للأهل</h5>
            <div className="card border-c p-4">
              {PARENTING_TIPS.map((tip, i) => (
                <div key={i} className="d-flex gap-2 align-items-start mb-3">
                  <span style={{ fontSize: "1.2rem" }}>💡</span>
                  <p className="f-body mb-0">{tip}</p>
                </div>
              ))}
            </div>
            <div className="card border-c p-4 mt-3" style={{ background: "#f0f8e8" }}>
              <h6 className="f-display mb-2">اقتراحات مكافآت عينية</h6>
              <ul className="f-body small text-c-light mb-0">
                <li>ملصقات نجوم على لوحة الإنجازات</li>
                <li>نزهة عائلية بعد إتمام 5 مستويات</li>
                <li>وقت لعب إضافي بألعابهم المفضلة</li>
                <li>اختيار وجبة الغداء/العشاء</li>
                <li>قصة إضافية قبل النوم</li>
              </ul>
            </div>
          </div>
        )}

        {/* Back */}
        <div className="text-center mt-4">
          <button onClick={() => navigate("/")} className="btn btn-outline-secondary rounded-pill px-4">
            العودة للرئيسية
          </button>
        </div>
      </div>
    </div>
  );
}
