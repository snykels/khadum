import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "قواعد المجتمع — خدوم",
  description: "قواعد وسلوكيات مجتمع خدوم — المعايير التي تجعل المنصة آمنة ومحترمة للجميع",
};

const rules = [
  {
    icon: "🤝",
    title: "الاحترام المتبادل",
    items: [
      "تعامل مع الجميع باحترام بصرف النظر عن رأيك في جودة عملهم",
      "ممنوع الإساءة أو التحرش أو التهديد بأي شكل",
      "التعليقات النقدية تكون بنّاءة ومحترمة",
      "ممنوع التمييز بناءً على الجنس أو العرق أو الجنسية",
    ],
  },
  {
    icon: "💬",
    title: "التواصل الأمين",
    items: [
      "ممنوع تبادل أرقام الجوال أو الإيميل أو روابط خارج المنصة",
      "ممنوع تضمين معلومات التواصل في الملفات أو الصور المُرسلة",
      "صِف خدمتك أو طلبك بدقة ووضوح منذ البداية",
      "النظام يرصد تلقائياً أي محاولة لتجاوز الاتفاقيات",
    ],
  },
  {
    icon: "📦",
    title: "جودة الخدمات",
    items: [
      "قدّم ما وعدت به فعلاً — لا تبالغ في الوصف",
      "سلّم العمل في الوقت المحدد أو أبلغ العميل مسبقاً",
      "لا تنسخ أعمال الآخرين وتنسبها لنفسك",
      "استخدام الذكاء الاصطناعي يجب أن يُذكر إذا كان جوهرياً",
    ],
  },
  {
    icon: "💰",
    title: "نزاهة المعاملات",
    items: [
      "ممنوع الطلب من العميل الدفع خارج المنصة تحت أي مسمى",
      "ممنوع التلاعب بالتقييمات أو طلب تقييم مزيف",
      "ممنوع إنشاء حسابات وهمية لتعزيز مظهرك",
      "ممنوع استرداد المال بذريعة كاذبة",
    ],
  },
  {
    icon: "🚫",
    title: "المحتوى المحظور",
    items: [
      "ممنوع نشر أي محتوى غير لائق أو مسيء",
      "ممنوع الخدمات المتعارضة مع نظام الاتصالات وحماية المعلومات",
      "ممنوع بيع خدمات تضر بالغير أو تنتهك حقوق الملكية",
      "ممنوع المحتوى المتعلق بالاحتيال أو الاختراق",
    ],
  },
  {
    icon: "⚖️",
    title: "النزاعات والشكاوى",
    items: [
      "اذهب لحل الخلاف بحوار هادئ أولاً",
      "إذا تعذّر الاتفاق فتح تذكرة دعم لدينا",
      "فريق خدوم وسيط محايد وقراره نهائي",
      "الإخلال المتكرر بالقواعد يؤدي لإيقاف الحساب",
    ],
  },
];

const consequences = [
  { level: "تحذير", icon: "⚠️", color: "bg-yellow-50 border-yellow-200 text-yellow-800", desc: "المخالفة الأولى البسيطة — تحذير مكتوب مع شرح السبب" },
  { level: "تقييد مؤقت", icon: "⏸️", color: "bg-orange-50 border-orange-200 text-orange-800", desc: "تكرار المخالفة — تجميد النشاط لمدة 7–30 يوماً" },
  { level: "إيقاف دائم", icon: "🚫", color: "bg-red-50 border-red-200 text-red-800", desc: "المخالفات الجسيمة أو التكرار الممنهج — حذف الحساب نهائياً" },
];

export default function CommunityGuidelinesPage() {
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="bg-[#485869] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="text-5xl mb-4">🤝</div>
          <h1 className="text-4xl font-bold mb-4">قواعد المجتمع</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            خدوم مجتمع احترافي يجمع أفضل المستقلين السعوديين والعملاء. هذه القواعد تحمي الجميع وتضمن تجربة عادلة ومثمرة.
          </p>
          <p className="text-white/50 text-sm mt-4">آخر تحديث: يناير 2026</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16 space-y-12">
        <div className="bg-[#34cc30]/10 border border-[#34cc30]/30 rounded-2xl p-6">
          <h2 className="font-bold text-[#485869] mb-2 flex items-center gap-2">📌 المبدأ الأساسي</h2>
          <p className="text-gray-700 leading-relaxed">
            كل ما تفعله على خدوم يجب أن يكون شيئاً تفخر بقوله للعلن. المنصة مساحة مهنية آمنة — نرفض كل ما يضر بشخص أو بالمجتمع.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {rules.map(r => (
            <div key={r.title} className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-[#485869] mb-4 flex items-center gap-2">
                <span className="text-2xl">{r.icon}</span>
                {r.title}
              </h3>
              <ul className="space-y-2">
                {r.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-[#34cc30] mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-[#485869] mb-6">عواقب المخالفة</h2>
          <div className="space-y-4">
            {consequences.map(c => (
              <div key={c.level} className={`border rounded-xl p-4 ${c.color}`}>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xl">{c.icon}</span>
                  <span className="font-bold">{c.level}</span>
                </div>
                <p className="text-sm mr-8">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-[#485869] mb-4">الإبلاغ عن مخالفة</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            إذا شهدت مخالفة لهذه القواعد، أبلغنا فوراً. نعامل كل بلاغ بسرية تامة ونتخذ إجراءات خلال 24 ساعة عمل.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="https://wa.me/966511809878?text=مرحبا، أبغى أبلّغ عن مخالفة" target="_blank" rel="noreferrer"
              className="bg-[#34cc30] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#2eb829] transition text-center">
              الإبلاغ عبر واتساب
            </a>
            <a href="mailto:help@khadum.app?subject=بلاغ مخالفة"
              className="border border-gray-200 text-[#485869] px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition text-center">
              help@khadum.app
            </a>
          </div>
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between text-sm text-gray-500">
          <Link href="/" className="hover:text-[#34cc30]">← الرئيسية</Link>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-[#34cc30]">الشروط والأحكام</Link>
            <Link href="/help" className="hover:text-[#34cc30]">مركز المساعدة</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
