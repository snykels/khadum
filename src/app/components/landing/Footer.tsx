import { Twitter, Instagram, Linkedin, Youtube } from "lucide-react";

const PAYMENT_METHODS = [
  { src: "/payments/visa.png", alt: "Visa" },
  { src: "/payments/mastercard.png", alt: "Mastercard" },
  { src: "/payments/mada.png", alt: "Mada" },
  { src: "/payments/apple_pay.png", alt: "Apple Pay" },
  { src: "/payments/stc_pay.png", alt: "STC Pay" },
  { src: "/payments/bank.png", alt: "Bank Transfer" },
  { src: "/payments/tabby_installment.png", alt: "Tabby" },
  { src: "/payments/tamara_installment.png", alt: "Tamara" },
];

export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Column 1 - Logo & Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <svg width="40" height="40" viewBox="0 0 3000 3000">
                <path fill="#34cc30" d="M2383.2,241.38H616.8c-146.62,146.62-228.8,228.85-375.42,375.47v1766.35s59.51,59.51,59.51,59.51l354.53-204.46,42.84-24.7v-.05l441.69-254.72,1.22,2.13,932.73-537.95s-598.17-100.73-982.84,124.01c-26.63,18.19-30.03,17.28-39.69-14.28-32.93-106.72-40.86-165.02-60.22-248.16-5.69-39.54,10.21-51.59,42.38-70.14,64.34-37.1,201.71-76.33,330.85-105.1,450.89-100.07,699.1,82.53,1044.74,3.2,19.67-5.59,42.08-1.42,45.54,19.46,7.57,52.75,7.83,186.92,4.98,251.41,1.32,22.11-16.41,40.91-45.48,54.83l-92.25,53.16c-128.63,74.2-138.34,96.97-178.54,185.85-26.78,52.6-3.05,78.93-125.83,158.31-25.77,14.84-130.81,75.42-130.81,75.42l-581.04,335.12-94.32,54.43-347.36,200.29-42.89,24.75-277.38,159.99,73.08,73.08h1768.26c145.88-145.88,227.67-227.67,373.56-373.56V616.85c-146.62-146.62-228.8-228.85-375.42-375.47ZM1331.7,691l-118.62,205.52c-10.06,17.23-31.81,24.09-49.04,14.03l-205.57-118.62c-17.23-10.06-24.09-31.81-14.03-49.04l118.62-205.57c10.06-17.23,31.81-24.04,49.09-13.98l205.52,118.57c17.23,10.06,24.09,31.87,14.03,49.09Z"/>
              </svg>
              <span className="text-2xl font-bold">خدوم</span>
            </div>
            <p className="text-gray-400 mb-4 leading-relaxed">
              منصة سعودية تربط العملاء بمستقلين محترفين — كل شيء عبر واتساب برسالة واحدة.
            </p>
            <p className="text-gray-500 text-sm mb-6">للعرب في كل مكان.</p>
            <div className="flex gap-4">
              <a href="https://x.com/khadum_app" target="_blank" rel="noreferrer" className="bg-white/10 p-2 rounded-lg hover:bg-[#34cc30] transition-colors" aria-label="تويتر خدوم">
                <Twitter size={20} />
              </a>
              <a href="https://instagram.com/khadum_app" target="_blank" rel="noreferrer" className="bg-white/10 p-2 rounded-lg hover:bg-[#34cc30] transition-colors" aria-label="انستغرام خدوم">
                <Instagram size={20} />
              </a>
              <a href="https://linkedin.com/company/khadum_app" target="_blank" rel="noreferrer" className="bg-white/10 p-2 rounded-lg hover:bg-[#34cc30] transition-colors" aria-label="لينكدإن خدوم">
                <Linkedin size={20} />
              </a>
              <a href="https://youtube.com/@khadum_app" target="_blank" rel="noreferrer" className="bg-white/10 p-2 rounded-lg hover:bg-[#34cc30] transition-colors" aria-label="يوتيوب خدوم">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Column 2 - للعملاء */}
          <div>
            <h3 className="font-bold mb-4">للعملاء</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/how-to-order" className="hover:text-[#34cc30] transition-colors">كيف تطلب خدمة</a></li>
              <li><a href="/categories" className="hover:text-[#34cc30] transition-colors">تصفح التصنيفات</a></li>
              <li><a href="/payment-methods" className="hover:text-[#34cc30] transition-colors">طرق الدفع</a></li>
              <li><a href="/refund-policy" className="hover:text-[#34cc30] transition-colors">ضمان استرداد المال</a></li>
            </ul>
          </div>

          {/* Column 3 - للمستقلين */}
          <div>
            <h3 className="font-bold mb-4">للمستقلين</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/apply" className="hover:text-[#34cc30] transition-colors">سجّل كمستقل — مجاناً</a></li>
              <li><a href="/freelancer" className="hover:text-[#34cc30] transition-colors">لوحة تحكم المستقل</a></li>
              <li><a href="/help" className="hover:text-[#34cc30] transition-colors">مركز المساعدة</a></li>
              <li><a href="/community-guidelines" className="hover:text-[#34cc30] transition-colors">قواعد المجتمع</a></li>
            </ul>
          </div>

          {/* Column 4 - الشركة */}
          <div>
            <h3 className="font-bold mb-4">الشركة</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/help" className="hover:text-[#34cc30] transition-colors">من نحن</a></li>
              <li><a href="/contact" className="hover:text-[#34cc30] transition-colors">تواصل معنا</a></li>
              <li><a href="mailto:help@khadum.app" className="hover:text-[#34cc30] transition-colors">help@khadum.app</a></li>
              <li><a href="https://wa.me/966511809878" target="_blank" rel="noreferrer" className="hover:text-[#34cc30] transition-colors">واتساب الدعم</a></li>
            </ul>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="border-t border-gray-800 pt-8 mb-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-5">
            <div className="text-sm text-gray-400 shrink-0">
              <div className="font-medium text-gray-300 mb-1">المدفوعات عبر</div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[#34cc30] font-bold text-sm">tap payment</span>
                <span className="text-gray-600">·</span>
                <span className="text-xs text-gray-500">مرخّص من البنك المركزي السعودي (ساما)</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2.5 lg:mr-auto">
              {PAYMENT_METHODS.map(p => (
                <div key={p.alt} className="bg-white rounded-md p-1.5 h-10 flex items-center justify-center min-w-[56px] shadow-sm">
                  <img src={p.src} alt={p.alt} className="h-full w-auto object-contain max-w-[60px]" loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm">
              © 2026 خدوم. جميع الحقوق محفوظة.
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>🇸🇦 منصة سعودية</span>
              <span className="text-gray-700">·</span>
              <span>مرخّصة من وزارة التجارة</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="/terms" className="hover:text-[#34cc30] transition-colors">الشروط والأحكام</a>
              <a href="/privacy" className="hover:text-[#34cc30] transition-colors">سياسة الخصوصية</a>
              <a href="/community-guidelines" className="hover:text-[#34cc30] transition-colors">قواعد المجتمع</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
