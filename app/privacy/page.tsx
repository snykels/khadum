import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "سياسة الخصوصية — خدوم",
  description: "سياسة خصوصية منصة خدوم — كيف نجمع بياناتك ونستخدمها ونحميها",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="bg-[#485869] text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">سياسة الخصوصية</h1>
          <p className="text-white/70 text-sm">آخر تحديث: يناير 2026</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-10 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-[#485869] mb-4">١. التزامنا بخصوصيتك</h2>
            <p>خدوم تحترم خصوصيتك وتلتزم بحماية بياناتك الشخصية وفقاً لنظام حماية البيانات الشخصية السعودي (نظام حماية البيانات). تشرح هذه السياسة ما نجمعه وكيف نستخدمه وكيف نحميه.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#485869] mb-4">٢. البيانات التي نجمعها</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-[#485869] mb-2">أ. بيانات التسجيل (مستقلون)</h3>
                <ul className="text-sm list-disc list-inside mr-4 space-y-1">
                  <li>الاسم الكامل، البريد الإلكتروني، رقم الجوال</li>
                  <li>بيانات الهوية الوطنية (للتحقق فقط)</li>
                  <li>الرقم البنكي وآيبان (لأغراض صرف المستحقات)</li>
                  <li>الصورة الشخصية وبيانات المؤهلات (اختيارية)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-[#485869] mb-2">ب. بيانات استخدام المنصة</h3>
                <ul className="text-sm list-disc list-inside mr-4 space-y-1">
                  <li>سجل الطلبات والمحادثات على المنصة</li>
                  <li>التقييمات والمراجعات</li>
                  <li>بيانات التصفح والإحصاءات المجهولة الهوية</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-[#485869] mb-2">ج. بيانات الدفع</h3>
                <p className="text-sm">لا تمر بيانات البطاقات البنكية عبر خوادمنا. تُعالج مباشرة بواسطة Tap Payment وتُحفظ لديهم وفقاً لمعايير PCI DSS.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#485869] mb-4">٣. كيف نستخدم بياناتك</h2>
            <ul className="space-y-2 text-sm list-disc list-inside mr-4">
              <li>تشغيل المنصة ومعالجة طلباتك</li>
              <li>التحقق من هويتك ومنع الاحتيال</li>
              <li>صرف مستحقات المستقلين بأمان</li>
              <li>التواصل معك بشأن طلباتك وحسابك</li>
              <li>تحسين خدماتنا عبر تحليل البيانات المجهولة</li>
              <li>الامتثال للمتطلبات القانونية والتنظيمية</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#485869] mb-4">٤. مشاركة البيانات</h2>
            <p className="mb-3">لا نبيع بياناتك أبداً. نشارك بياناتك فقط في الحالات التالية:</p>
            <ul className="space-y-2 text-sm list-disc list-inside mr-4">
              <li><strong>بين العميل والمستقل:</strong> الاسم ورقم التواصل اللازمان لإتمام الخدمة</li>
              <li><strong>Tap Payment:</strong> لمعالجة الدفعات بأمان</li>
              <li><strong>الجهات الحكومية:</strong> عند الإلزام القانوني فقط</li>
              <li><strong>مقدمو الخدمات التقنية:</strong> (استضافة سحابية) بموجب اتفاقيات سرية صارمة</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#485869] mb-4">٥. حفظ البيانات وأمنها</h2>
            <ul className="space-y-2 text-sm list-disc list-inside mr-4">
              <li>بياناتك تُحفظ على خوادم آمنة بتشفير AES-256</li>
              <li>جميع الاتصالات مشفّرة بـ TLS 1.3</li>
              <li>كلمات المرور مُشفَّرة بخوارزمية bcrypt ولا نستطيع الاطلاع عليها</li>
              <li>نُجري مراجعات أمنية دورية</li>
              <li>نحتفظ ببياناتك لمدة 3 سنوات من تاريخ آخر نشاط ثم تُحذف أو تُجهَّل</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#485869] mb-4">٦. حقوقك</h2>
            <p className="mb-3">وفقاً لنظام حماية البيانات السعودي، لك الحق في:</p>
            <ul className="space-y-2 text-sm list-disc list-inside mr-4">
              <li>الاطلاع على بياناتك الشخصية الموجودة لدينا</li>
              <li>تصحيح أي بيانات غير دقيقة</li>
              <li>حذف حسابك وبياناتك (مع الاحتفاظ بما يلزم قانونياً)</li>
              <li>الاعتراض على معالجة بياناتك لأغراض التسويق</li>
              <li>نقل بياناتك بصيغة قابلة للقراءة</li>
            </ul>
            <p className="text-sm mt-3">لممارسة أي من هذه الحقوق، راسلنا على <a href="mailto:help@khadum.app" className="text-[#34cc30]">help@khadum.app</a></p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#485869] mb-4">٧. ملفات تعريف الارتباط (Cookies)</h2>
            <p className="text-sm">نستخدم ملفات cookies ضرورية لتشغيل جلسة تسجيل الدخول فقط. لا نستخدم cookies لأغراض تتبع الإعلانات.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#485869] mb-4">٨. التغييرات على هذه السياسة</h2>
            <p className="text-sm">قد نُحدّث هذه السياسة عند الحاجة. سنُبلّغك بأي تغيير جوهري عبر البريد الإلكتروني أو إشعار في المنصة قبل 30 يوماً من سريانه.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#485869] mb-4">٩. التواصل</h2>
            <p className="text-sm">لأي سؤال عن خصوصيتك:</p>
            <ul className="text-sm mt-2 space-y-1">
              <li>البريد: <a href="mailto:help@khadum.app" className="text-[#34cc30]">help@khadum.app</a></li>
              <li>واتساب: <a href="https://wa.me/966511809878" target="_blank" rel="noreferrer" className="text-[#34cc30]">966511809878+</a></li>
            </ul>
          </section>

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
