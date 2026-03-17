import { useNavigate } from "react-router-dom";
import { APP_NAME } from "@utils/constants";

export default function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-app min-vh-100 py-4">
      <div className="container" style={{ maxWidth: 700 }}>
        <div className="text-center mb-4">
          <span style={{ fontSize: "2.5rem" }}>🔒</span>
          <h1 className="f-display fs-3 mt-2">سياسة الخصوصية</h1>
          <p className="f-body text-c-light">{APP_NAME}</p>
        </div>

        <div className="card border-c p-4 p-sm-5 shadow-sm">
          <div className="f-body" style={{ lineHeight: 2 }}>
            <h5 className="f-display mb-3">1. جمع البيانات</h5>
            <p>نجمع فقط البيانات الضرورية لتقديم الخدمة:</p>
            <ul>
              <li>اسم ولي الأمر ورقم الواتساب (للتواصل بخصوص الطلب)</li>
              <li>اسم الطفل والصف الدراسي (لتخصيص المحتوى التعليمي)</li>
            </ul>

            <h5 className="f-display mb-3 mt-4">2. استخدام البيانات</h5>
            <p>تُستخدم البيانات فقط لـ:</p>
            <ul>
              <li>تجهيز الطلب والتواصل مع المشتري</li>
              <li>تخصيص المحتوى التعليمي حسب صف الطفل</li>
              <li>حفظ تقدم الطفل في اللعبة</li>
            </ul>

            <h5 className="f-display mb-3 mt-4">3. حماية البيانات</h5>
            <p>نلتزم بحماية بياناتكم ولا نشاركها مع أي طرف ثالث. جميع البيانات مخزنة بشكل آمن.</p>

            <h5 className="f-display mb-3 mt-4">4. سلامة الأطفال</h5>
            <ul>
              <li>لا توجد إعلانات في اللعبة</li>
              <li>لا توجد روابط خارجية</li>
              <li>لا يوجد تواصل بين الأطفال</li>
              <li>المحتوى متوافق مع القيم الإسلامية</li>
            </ul>

            <h5 className="f-display mb-3 mt-4">5. التواصل</h5>
            <p>لأي استفسار بخصوص الخصوصية، تواصل معنا عبر الواتساب.</p>
          </div>
        </div>

        <div className="text-center mt-4">
          <button onClick={() => navigate("/")} className="btn btn-outline-secondary rounded-pill px-4">
            العودة للرئيسية
          </button>
        </div>
      </div>
    </div>
  );
}
