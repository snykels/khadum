import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "كيف تطلب خدمة — خدوم",
  description: "دليل خطوة بخطوة لطلب خدمة من مستقل محترف عبر منصة خدوم بكل سهولة",
};

const steps = [
  {
    n: "١",
    title: "تصفّح الخدمات أو تواصل مباشرة",
    desc: "ابحث في قسم الخدمات عن ما تحتاجه، أو أرسل رسالة واتساب واحدة تصف طلبك وسيتكفّل بك النظام. لا حاجة لإنشاء حساب.",
    tips: ["ابحث بالتصنيف مثل: تصميم، برمجة، كتابة", "ضع المستقل في صورة تفاصيل مشروعك منذ البداية"],
  },
  {
    n: "٢",
    title: "اتفق مع المستقل",
    desc: "يتواصل معك المستقل عبر المنصة للتفاصيل والسعر النهائي. كل الاتفاقيات داخل المنصة فقط لحمايتك.",
    tips: ["وضّح جميع متطلباتك وموعد التسليم المطلوب", "اسأل عن عدد التعديلات المتاحة"],
  },
  {
    n: "٣",
    title: "ادفع عبر المنصة بأمان",
    desc: "يتم إنشاء رابط دفع آمن عبر Tap Payment المرخّص من ساما. المبلغ يُودَع في حساب أمانة حتى تُوافق على التسليم.",
    tips: ["ندعم: Mada، Visa، Mastercard، Apple Pay، STC Pay", "أموالك محمية بالكامل حتى انتهاء الطلب"],
  },
  {
    n: "٤",
    title: "استلم عملك وأقرّ التسليم",
    desc: "يرفع المستقل العمل المنجز للمراجعة. بعد موافقتك تُحرَّر الأموال للمستقل تلقائياً.",
    tips: ["لديك 72 ساعة للمراجعة قبل الإغلاق التلقائي", "يمكنك طلب تعديلات ضمن الاتفاق المبرم"],
  },
  {
    n: "٥",
    title: "قيّم تجربتك",
    desc: "بعد إتمام الطلب، شارك تقييمك للمستقل. تقييماتك تساعد المجتمع وترفع جودة الخدمات.",
    tips: ["تقييمك أمين يساعد المستقلين الجيدين على الظهور", "يمكنك إضافة تعليق تفصيلي"],
  },
];

const faqs = [
  { q: "هل أحتاج لحساب لطلب خدمة؟", a: "لا. يمكنك التواصل مباشرة عبر واتساب وسنتكفّل ببقية الإجراءات. لكن إنشاء حساب يتيح لك تتبع طلباتك بسهولة." },
  { q: "هل أموالي آمنة؟", a: "نعم. المدفوعات تتم عبر Tap Payment المرخّص من البنك المركزي السعودي (ساما)، والمبلغ يُحفظ في حساب أمانة حتى تُوافق على التسليم." },
  { q: "ماذا لو لم أرضَ عن النتيجة؟", a: "لديك ضمان استرداد كامل في حالات عدم التسليم أو الإخلال بشروط الطلب. راجع صفحة ضمان الاسترداد للتفاصيل." },
  { q: "كم يستغرق التسليم؟", a: "يحدد المستقل مدة التسليم في كل خدمة. تتراوح بين يوم وأسبوعين حسب نوع العمل." },
  { q: "هل يمكنني التواصل مع المستقل مباشرة؟", a: "التواصل يتم داخل منصة خدوم فقط. ممنوع تبادل أرقام التواصل الخارجية لحماية الطرفين وضمان حقوقهم." },
];

export default function HowToOrderPage() {
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="bg-[#485869] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-6 text-sm">
            📋 دليل الطلب
          </div>
          <h1 className="text-4xl font-bold mb-4">كيف تطلب خدمة؟</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            خمس خطوات بسيطة تفصلك عن الحصول على خدمة احترافية من أفضل المستقلين السعوديين
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="space-y-6 mb-16">
          {steps.map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-8 shadow-sm flex gap-6">
              <div className="shrink-0 w-14 h-14 bg-gradient-to-br from-[#34cc30] to-[#2eb829] rounded-full flex items-center justify-center text-white text-xl font-bold">
                {s.n}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[#485869] mb-2">{s.title}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">{s.desc}</p>
                <ul className="space-y-1">
                  {s.tips.map((t, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="w-1.5 h-1.5 bg-[#34cc30] rounded-full shrink-0" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm mb-16">
          <h2 className="text-2xl font-bold text-[#485869] mb-8">أسئلة شائعة</h2>
          <div className="space-y-6">
            {faqs.map((f, i) => (
              <div key={i} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                <h3 className="font-bold text-[#485869] mb-2">{f.q}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#34cc30] rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-3">جاهز للبدء؟</h2>
          <p className="text-white/80 mb-6">أرسل رسالة واحدة على واتساب وابدأ طلبك الأول مجاناً</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://wa.me/966511809878?text=مرحبا، أبغى أطلب خدمة" target="_blank" rel="noreferrer"
              className="bg-white text-[#34cc30] px-8 py-3 rounded-xl font-bold hover:bg-white/90 transition">
              ابدأ الآن عبر واتساب
            </a>
            <Link href="/categories" className="border border-white/30 text-white px-8 py-3 rounded-xl hover:bg-white/10 transition">
              تصفح الخدمات
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between text-sm text-gray-500">
          <Link href="/" className="hover:text-[#34cc30]">← الرئيسية</Link>
          <div className="flex gap-4">
            <Link href="/help" className="hover:text-[#34cc30]">مركز المساعدة</Link>
            <Link href="/refund-policy" className="hover:text-[#34cc30]">ضمان الاسترداد</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
