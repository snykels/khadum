import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "مركز المساعدة — خدوم",
  description: "مركز مساعدة منصة خدوم — إجابات لكل أسئلتك عن الطلبات والدفع والحساب والمزيد",
};

const categories = [
  {
    icon: "🛒",
    title: "للعملاء",
    links: [
      { label: "كيف أطلب خدمة؟", href: "/how-to-order" },
      { label: "كيف أدفع بأمان؟", href: "/payment-methods" },
      { label: "ضمان استرداد الأموال", href: "/refund-policy" },
      { label: "كيف أقيّم المستقل؟", href: "#tq-client-review" },
      { label: "كم يستغرق التسليم؟", href: "#tq-delivery" },
    ],
  },
  {
    icon: "💼",
    title: "للمستقلين",
    links: [
      { label: "كيف أسجّل كمستقل؟", href: "/apply" },
      { label: "كيف أضيف خدماتي؟", href: "#tq-add-service" },
      { label: "كيف أستلم أموالي؟", href: "#tq-withdraw" },
      { label: "ما نسبة العمولة؟", href: "#tq-commission" },
      { label: "كيف أرفع تقييمي؟", href: "#tq-rating" },
    ],
  },
  {
    icon: "💳",
    title: "الدفع والمحفظة",
    links: [
      { label: "طرق الدفع المتاحة", href: "/payment-methods" },
      { label: "كيف أسحب أموالي؟", href: "#tq-withdraw" },
      { label: "متى تُحرَّر الأمانة؟", href: "#tq-escrow" },
      { label: "رسوم السحب", href: "#tq-fees" },
      { label: "الاسترداد والإلغاء", href: "/refund-policy" },
    ],
  },
  {
    icon: "🔐",
    title: "الحساب والأمان",
    links: [
      { label: "نسيت كلمة المرور", href: "/forgot-password" },
      { label: "تغيير البريد الإلكتروني", href: "#tq-email" },
      { label: "حذف الحساب", href: "#tq-delete" },
      { label: "سياسة الخصوصية", href: "/privacy" },
      { label: "الشروط والأحكام", href: "/terms" },
    ],
  },
  {
    icon: "⚖️",
    title: "النزاعات والشكاوى",
    links: [
      { label: "كيف أفتح نزاعاً؟", href: "#tq-dispute" },
      { label: "مدة الفصل في النزاعات", href: "#tq-dispute-time" },
      { label: "الإبلاغ عن مخالفة", href: "#tq-report" },
      { label: "قواعد المجتمع", href: "/community-guidelines" },
    ],
  },
  {
    icon: "📞",
    title: "تواصل معنا",
    links: [
      { label: "واتساب الدعم الفوري", href: "https://wa.me/966511809878", external: true },
      { label: "البريد الإلكتروني", href: "mailto:help@khadum.app", external: true },
      { label: "نموذج التواصل", href: "/contact" },
    ],
  },
];

const faqs = [
  {
    id: "tq-client-review",
    q: "كيف أقيّم المستقل بعد الانتهاء؟",
    a: "بعد موافقتك على التسليم ستظهر لك نافذة للتقييم من 1 إلى 5 نجوم مع خيار إضافة تعليق. التقييم اختياري لكنه يساعد المجتمع.",
  },
  {
    id: "tq-delivery",
    q: "كم يستغرق تسليم الخدمة؟",
    a: "كل مستقل يحدد مدة التسليم في وصف خدمته. تتراوح بين يوم واحد وأسبوعين حسب نوع الخدمة وتعقيدها.",
  },
  {
    id: "tq-add-service",
    q: "كيف أضيف خدمة جديدة كمستقل؟",
    a: "من لوحة التحكم اضغط 'خدماتي' ثم 'إضافة خدمة'. أو تواصل مع فريقنا عبر واتساب وسنساعدك في إعداد خدمتك الأولى.",
  },
  {
    id: "tq-withdraw",
    q: "كيف أسحب أموالي كمستقل؟",
    a: "من لوحة التحكم → المحفظة → طلب سحب. الحد الأدنى 100 ر.س. تُحوَّل خلال 1-3 أيام عمل لحسابك البنكي المسجّل.",
  },
  {
    id: "tq-commission",
    q: "ما نسبة العمولة التي تأخذها خدوم؟",
    a: "تبدأ من 15% للباقة المجانية وتنخفض حتى 5% لباقة النخبة. العمولة تُحسم تلقائياً عند تحرير الأمانة، ولا توجد رسوم خفية.",
  },
  {
    id: "tq-rating",
    q: "كيف أرفع تقييمي كمستقل؟",
    a: "سلّم في الوقت المحدد، تواصل بوضوح مع العميل، وقدّم عملاً يفوق توقعاته. التقييمات الإيجابية تُظهرك في نتائج البحث الأولى.",
  },
  {
    id: "tq-escrow",
    q: "متى تُحرَّر الأمانة للمستقل؟",
    a: "بعد موافقة العميل على التسليم، أو بعد 72 ساعة من التسليم دون اعتراض من العميل — أيهما أسبق.",
  },
  {
    id: "tq-fees",
    q: "هل هناك رسوم على السحب؟",
    a: "لا. السحب مجاني تماماً. الرسوم الوحيدة هي عمولة المنصة على كل طلب مكتمل.",
  },
  {
    id: "tq-email",
    q: "كيف أغيّر بريدي الإلكتروني؟",
    a: "تواصل مع فريق الدعم عبر واتساب أو البريد الإلكتروني مع إثبات هويتك وسنُجري التغيير خلال يوم عمل.",
  },
  {
    id: "tq-delete",
    q: "كيف أحذف حسابي؟",
    a: "تواصل مع الدعم. نتأكد من تصفية أي طلبات قائمة وسحب أي رصيد قبل الحذف. البيانات تُحذف نهائياً خلال 30 يوماً.",
  },
  {
    id: "tq-dispute",
    q: "كيف أفتح نزاعاً مع الطرف الآخر؟",
    a: "من لوحة التحكم → الطلبات → الطلب المعني → 'الإبلاغ عن مشكلة'. أو تواصل مع الدعم مباشرة. نستجيب خلال 24 ساعة عمل.",
  },
  {
    id: "tq-dispute-time",
    q: "كم يستغرق الفصل في النزاعات؟",
    a: "يُفصل في جميع النزاعات خلال 5 أيام عمل كحد أقصى. 80% من النزاعات تُحل خلال 48 ساعة.",
  },
  {
    id: "tq-report",
    q: "كيف أبلّغ عن مخالفة أو حساب مزيف؟",
    a: "تواصل معنا عبر واتساب أو البريد مع شرح المشكلة. كل البلاغات تُعامَل بسرية تامة.",
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="bg-gradient-to-br from-[#485869] to-[#34cc30] text-white py-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">مركز المساعدة</h1>
          <p className="text-white/80 text-lg">كل ما تحتاج معرفته عن خدوم في مكان واحد</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <a href="https://wa.me/966511809878" target="_blank" rel="noreferrer"
              className="bg-white text-[#34cc30] px-6 py-3 rounded-xl font-bold hover:bg-white/90 transition flex items-center justify-center gap-2">
              📱 واتساب الدعم الفوري
            </a>
            <a href="mailto:help@khadum.app"
              className="border border-white/30 text-white px-6 py-3 rounded-xl hover:bg-white/10 transition flex items-center justify-center gap-2">
              ✉️ help@khadum.app
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-[#485869] mb-8">تصفّح حسب الموضوع</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {categories.map(cat => (
            <div key={cat.title} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-3">{cat.icon}</div>
              <h3 className="font-bold text-[#485869] mb-4">{cat.title}</h3>
              <ul className="space-y-2">
                {cat.links.map(link => (
                  <li key={link.label}>
                    <Link href={link.href} {...((link as any).external ? { target: "_blank", rel: "noreferrer" } : {})}
                      className="text-sm text-gray-600 hover:text-[#34cc30] flex items-center gap-1">
                      <span className="text-gray-300">›</span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-[#485869] mb-8">الأسئلة الأكثر شيوعاً</h2>
        <div className="space-y-4 mb-16">
          {faqs.map(f => (
            <div key={f.id} id={f.id} className="bg-white rounded-2xl p-6 shadow-sm scroll-mt-8">
              <h3 className="font-bold text-[#485869] mb-2">{f.q}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#485869] rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-3">لم تجد إجابة لسؤالك؟</h2>
          <p className="text-white/80 mb-6">فريق الدعم متاح 7 أيام في الأسبوع للمساعدة</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://wa.me/966511809878" target="_blank" rel="noreferrer"
              className="bg-[#34cc30] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#2eb829] transition">
              تواصل عبر واتساب
            </a>
            <Link href="/contact" className="border border-white/30 text-white px-8 py-3 rounded-xl hover:bg-white/10 transition">
              نموذج التواصل
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between text-sm text-gray-500">
          <Link href="/" className="hover:text-[#34cc30]">← الرئيسية</Link>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-[#34cc30]">الشروط والأحكام</Link>
            <Link href="/privacy" className="hover:text-[#34cc30]">سياسة الخصوصية</Link>
            <Link href="/community-guidelines" className="hover:text-[#34cc30]">قواعد المجتمع</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
