import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "طرق الدفع — خدوم",
  description: "طرق الدفع المتاحة في منصة خدوم — Mada, Visa, Mastercard, Apple Pay, STC Pay, Tabby, Tamara",
};

const methods = [
  { img: "/payments/mada.png", name: "مدى", desc: "البطاقة البنكية السعودية الرسمية. مقبولة من جميع البنوك السعودية.", tag: "الأكثر استخداماً", available: true },
  { img: "/payments/visa.png", name: "Visa", desc: "بطاقات Visa الائتمانية ومسبقة الدفع. مقبولة عالمياً.", tag: "", available: true },
  { img: "/payments/mastercard.png", name: "Mastercard", desc: "بطاقات Mastercard الائتمانية ومسبقة الدفع.", tag: "", available: true },
  { img: "/payments/apple_pay.png", name: "Apple Pay", desc: "ادفع بلمسة واحدة من هاتفك أو ساعتك. يتطلب iPhone أو Apple Watch.", tag: "الأسرع", available: true },
  { img: "/payments/stc_pay.png", name: "STC Pay", desc: "محفظة STC الرقمية — للمشتركين في شبكة STC.", tag: "", available: true },
  { img: "/payments/tabby_installment.png", name: "Tabby", desc: "قسّم مشترياتك على 4 دفعات بدون فوائد.", tag: "تقسيط", available: true },
  { img: "/payments/tamara_installment.png", name: "Tamara", desc: "اشترِ الآن وادفع لاحقاً — بدون فوائد مع خيارات مرنة.", tag: "تقسيط", available: true },
  { img: "/payments/bank.png", name: "تحويل بنكي", desc: "للطلبات الكبيرة يمكن الدفع بتحويل بنكي مباشر.", tag: "للشركات", available: true },
];

const faqs = [
  { q: "هل بياناتي البنكية آمنة؟", a: "نعم بالكامل. لا تمر بيانات بطاقتك عبر خوادمنا. جميع المعاملات تتم مباشرة عبر Tap Payment المرخّص من البنك المركزي السعودي (ساما) وتستخدم تشفير SSL 256-bit." },
  { q: "هل يمكنني الدفع بعملة غير الريال؟", a: "حالياً ندعم الريال السعودي (SAR) فقط. يقوم بنكك بالتحويل تلقائياً من عملتك المحلية." },
  { q: "كم يستغرق تأكيد الدفع؟", a: "الدفع فوري تقريباً. في حالات نادرة قد يستغرق بعض البنوك حتى 60 ثانية للتأكيد." },
  { q: "هل أستطيع تقسيط المدفوعات؟", a: "نعم، نوفر Tabby وTamara للتقسيط على 3 أو 4 دفعات بدون فوائد." },
  { q: "ما الحد الأقصى للدفع؟", a: "لا يوجد حد أقصى من جانب خدوم. الحد يحدده البنك أو بطاقتك الائتمانية." },
];

export default function PaymentMethodsPage() {
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="bg-[#1a1a2e] text-white py-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">طرق الدفع</h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            نوفر أشهر وسائل الدفع السعودية والعالمية. جميع المدفوعات محمية بنظام الأمانة.
          </p>
          <div className="flex items-center justify-center gap-3 mt-6 text-sm text-gray-400">
            <span>🔒 مشفّر SSL</span>
            <span>·</span>
            <span>🇸🇦 مرخّص من ساما</span>
            <span>·</span>
            <span>⚡ دفع فوري</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8 flex items-center gap-4">
          <div className="text-4xl">🛡️</div>
          <div>
            <h2 className="font-bold text-[#485869] mb-1">جميع المدفوعات عبر Tap Payment</h2>
            <p className="text-gray-600 text-sm">بوابة الدفع الرسمية المرخّصة من البنك المركزي السعودي (ساما). بياناتك البنكية لا تصلنا أبداً — تعامل مباشر مع البوابة الآمنة.</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-[#485869] mb-6">الوسائل المتاحة</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-16">
          {methods.map(m => (
            <div key={m.name} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 flex items-center">
                  <img src={m.img} alt={m.name} className="h-full w-auto object-contain max-w-[80px]" />
                </div>
                {m.tag && <span className="text-[10px] bg-[#34cc30]/10 text-[#34cc30] px-2 py-0.5 rounded-full font-medium">{m.tag}</span>}
              </div>
              <h3 className="font-bold text-[#485869] mb-1">{m.name}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm mb-12">
          <h2 className="text-2xl font-bold text-[#485869] mb-8">أسئلة شائعة</h2>
          <div className="space-y-6">
            {faqs.map(f => (
              <div key={f.q} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                <h3 className="font-bold text-[#485869] mb-2">{f.q}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 text-center">
          {[
            { icon: "🔐", title: "تشفير كامل", desc: "SSL 256-bit يحمي كل معاملة" },
            { icon: "🏦", title: "مرخّص من ساما", desc: "Tap Payment بنك مرخّص رسمياً" },
            { icon: "💰", title: "نظام الأمانة", desc: "لا تُحرَّر الأموال إلا عند موافقتك" },
          ].map(f => (
            <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-[#485869] mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between text-sm text-gray-500">
          <Link href="/" className="hover:text-[#34cc30]">← الرئيسية</Link>
          <div className="flex gap-4">
            <Link href="/refund-policy" className="hover:text-[#34cc30]">ضمان الاسترداد</Link>
            <Link href="/help" className="hover:text-[#34cc30]">مركز المساعدة</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
