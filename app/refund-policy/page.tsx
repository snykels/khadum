import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ضمان استرداد الأموال — خدوم",
  description: "سياسة ضمان استرداد الأموال في منصة خدوم — حقوقك محفوظة في جميع الحالات",
};

const cases = [
  { icon: "✅", title: "استرداد كامل 100%", items: ["المستقل لم يُسلّم العمل خلال المهلة المحددة", "العمل المُسلَّم مختلف كلياً عن المتفق عليه", "المستقل أغلق حسابه أو طلب الإلغاء بعد الدفع", "تعذّر التواصل مع المستقل لأكثر من 48 ساعة بعد الدفع"] },
  { icon: "🔄", title: "استرداد جزئي حسب المتفق", items: ["تم إنجاز جزء من العمل واتفق الطرفان على الإنهاء المبكر", "اكتشف العميل تعارضاً في المتطلبات بعد بدء العمل", "تغيّرت ظروف العميل بعد بدء التنفيذ"] },
  { icon: "❌", title: "لا يُطبَّق الاسترداد", items: ["العميل وافق على التسليم وضغط على 'اعتماد'", "انتهت مهلة المراجعة (72 ساعة) دون اعتراض", "الطلب استُخدم للاستغلال (طلب خدمات غير مشروعة)", "خلاف على الجودة الفنية بعد الموافقة على المحتوى الأساسي"] },
];

const process = [
  { n: "١", title: "تقديم طلب الاسترداد", desc: "تواصل معنا عبر واتساب أو فتح تذكرة دعم في خلال 7 أيام من تاريخ الدفع موضحاً سبب طلبك." },
  { n: "٢", title: "المراجعة والتحقق", desc: "يراجع فريق خدوم الطلب وسجل المحادثات والملفات المُسلَّمة خلال 48 ساعة عمل." },
  { n: "٣", title: "القرار والتنفيذ", desc: "يُبلَّغ الطرفان بالقرار. في حالة الموافقة تُسترَد الأموال خلال 3–7 أيام عمل عبر نفس طريقة الدفع." },
];

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="bg-gradient-to-br from-[#485869] to-[#34cc30] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="text-5xl mb-4">🛡️</div>
          <h1 className="text-4xl font-bold mb-4">ضمان استرداد الأموال</h1>
          <p className="text-white/90 text-lg max-w-2xl mx-auto">
            أموالك محمية بالكامل. ندفع فقط عند رضاك التام — هذه ليست وعداً فحسب، بل نظام مدمج في كل عملية دفع.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16 space-y-12">
        <div className="bg-[#34cc30]/10 border border-[#34cc30]/30 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-[#485869] mb-3 flex items-center gap-2">
            🔒 كيف تعمل الأمانة؟
          </h2>
          <p className="text-gray-700 leading-relaxed">
            عند دفعك لأي خدمة، لا تصل الأموال للمستقل فوراً. تُودَع في حساب أمانة مؤمَّن لدى <strong>Tap Payment</strong> المرخّص من البنك المركزي السعودي (ساما). تُحرَّر الأموال للمستقل فقط عند موافقتك على استلام العمل أو بعد انتهاء مهلة المراجعة.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-[#485869] mb-6">حالات الاسترداد</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {cases.map(c => (
              <div key={c.title} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="text-3xl mb-3">{c.icon}</div>
                <h3 className="font-bold text-[#485869] mb-4">{c.title}</h3>
                <ul className="space-y-2">
                  {c.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="mt-1 text-gray-400">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-[#485869] mb-8">خطوات طلب الاسترداد</h2>
          <div className="space-y-6">
            {process.map(p => (
              <div key={p.n} className="flex gap-4">
                <div className="w-10 h-10 bg-[#34cc30] rounded-full flex items-center justify-center text-white font-bold shrink-0">{p.n}</div>
                <div>
                  <h3 className="font-bold text-[#485869] mb-1">{p.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-[#485869] mb-6">معلومات إضافية</h2>
          <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
            <p><strong className="text-[#485869]">مهلة طلب الاسترداد:</strong> يجب تقديم الطلب خلال 7 أيام من تاريخ الدفع.</p>
            <p><strong className="text-[#485869]">طريقة الاسترداد:</strong> تُعاد الأموال عبر نفس طريقة الدفع الأصلية (Mada، فيزا، ماستركارد…). قد تستغرق بعض البنوك 3–7 أيام عمل.</p>
            <p><strong className="text-[#485869]">رسوم الاسترداد:</strong> لا توجد رسوم على طلبات الاسترداد المشروعة.</p>
            <p><strong className="text-[#485869]">النزاعات:</strong> في حال الخلاف بين العميل والمستقل، يتدخل فريق خدوم كوسيط محايد ويُصدر قراراً ملزماً خلال 5 أيام عمل.</p>
          </div>
        </div>

        <div className="bg-[#485869] rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-3">تحتاج مساعدة؟</h2>
          <p className="text-white/80 mb-6">فريق الدعم متاح 7 أيام في الأسبوع للمساعدة في أي خلاف</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://wa.me/966511809878?text=مرحبا، أبغى أرسل طلب استرداد" target="_blank" rel="noreferrer"
              className="bg-[#34cc30] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#2eb829] transition">
              تواصل عبر واتساب
            </a>
            <a href="mailto:help@khadum.app" className="border border-white/30 text-white px-8 py-3 rounded-xl hover:bg-white/10 transition">
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
