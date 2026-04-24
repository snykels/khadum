import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "الشروط والأحكام — خدوم",
  description: "الشروط والأحكام الخاصة بمنصة خدوم للخدمات المستقلة",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="bg-[#485869] text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">الشروط والأحكام</h1>
          <p className="text-white/70 text-sm">آخر تحديث: يناير 2026</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-10 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-[#485869] mb-4">١. مقدمة وقبول الشروط</h2>
            <p>مرحباً بك في منصة <strong>خدوم</strong> (khadum.app)، المنصة السعودية للخدمات المستقلة التي تربط العملاء بالمستقلين المحترفين عبر واتساب. باستخدامك للمنصة، فإنك توافق على هذه الشروط بالكامل. إذا لم توافق على أي جزء منها، يرجى التوقف عن استخدام خدماتنا.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#485869] mb-4">٢. الأطراف والتعريفات</h2>
            <ul className="space-y-2 text-sm">
              <li><strong>المنصة:</strong> خدوم (khadum.app) بما تشمله من تطبيق، موقع إلكتروني، وبوت واتساب.</li>
              <li><strong>العميل:</strong> كل شخص يطلب خدمة عبر المنصة.</li>
              <li><strong>المستقل:</strong> كل شخص مُعتمد من خدوم لتقديم خدماته عبر المنصة.</li>
              <li><strong>الطلب:</strong> اتفاق مُبرم بين عميل ومستقل بوساطة خدوم لتنفيذ خدمة محددة.</li>
              <li><strong>الأمانة:</strong> المبلغ المحفوظ في بوابة الدفع حتى اكتمال الطلب وموافقة العميل.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#485869] mb-4">٣. التسجيل وشروط العضوية</h2>
            <p className="mb-3">للتسجيل كمستقل يجب أن:</p>
            <ul className="list-disc list-inside space-y-1 text-sm mr-4">
              <li>تكون سعودي الجنسية أو مقيماً في المملكة بإقامة نظامية</li>
              <li>تكون بالغاً (18 سنة فأكثر)</li>
              <li>تمتلك رقم جوال سعودياً نشطاً</li>
              <li>تقدم بيانات صحيحة وحقيقية في طلب التسجيل</li>
              <li>تتحمل المسؤولية الكاملة عن صحة المعلومات المقدمة</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#485869] mb-4">٤. السياسة المالية والعمولات</h2>
            <p className="mb-3">تُطبَّق العمولات التالية على كل طلب مكتمل:</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-right p-3 border-b">الباقة</th>
                    <th className="text-right p-3 border-b">العمولة</th>
                    <th className="text-right p-3 border-b">الرسوم الشهرية</th>
                  </tr>
                </thead>
                <tbody>
                  {[["مجانية", "15%", "0 ر.س"], ["أساسية", "10%", "49 ر.س"], ["احترافية", "7%", "99 ر.س"], ["نخبة", "5%", "199 ر.س"]].map(([p, c, f]) => (
                    <tr key={p} className="border-b last:border-0">
                      <td className="p-3">{p}</td>
                      <td className="p-3 text-red-600">{c}</td>
                      <td className="p-3">{f}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm mt-3 text-gray-500">تُحسم العمولة تلقائياً عند تحرير الأمانة للمستقل.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#485869] mb-4">٥. نظام الطلبات والأمانة</h2>
            <ul className="space-y-2 text-sm list-disc list-inside mr-4">
              <li>يدفع العميل مبلغ الطلب مقدماً عبر بوابة Tap Payment.</li>
              <li>يُودَع المبلغ في حساب أمانة ولا يُصرف للمستقل حتى تكتمل الخدمة.</li>
              <li>للعميل 72 ساعة من تاريخ التسليم للمراجعة والاعتراض.</li>
              <li>بعد انتهاء المهلة دون اعتراض تُحرَّر الأموال للمستقل تلقائياً.</li>
              <li>الحد الأدنى للطلب 50 ر.س، ولا يوجد حد أقصى.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#485869] mb-4">٦. سياسة الاسترداد</h2>
            <p>تسري سياسة الاسترداد الموضحة في <Link href="/refund-policy" className="text-[#34cc30] hover:underline">صفحة ضمان استرداد الأموال</Link> وتعدّ جزءاً لا يتجزأ من هذه الشروط.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#485869] mb-4">٧. الملكية الفكرية</h2>
            <ul className="space-y-2 text-sm list-disc list-inside mr-4">
              <li>تنتقل ملكية العمل المُسلَّم للعميل بالكامل بعد سداد قيمته.</li>
              <li>يحتفظ المستقل بحق الإشارة للعمل في معرض أعماله ما لم يُتفق على خلاف ذلك.</li>
              <li>ممنوع على المستقل استخدام أعمال ينجزها لعميل في خدمات أخرى.</li>
              <li>خدوم لا تمتلك حقوقاً على المحتوى الذي يُنتجه المستقلون.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#485869] mb-4">٨. السلوك المحظور</h2>
            <p>يُحظر صراحةً ما يأتي ويُعدّ مخالفة موجبة للإيقاف الفوري:</p>
            <ul className="space-y-2 text-sm list-disc list-inside mr-4 mt-3">
              <li>التحايل على المنصة بإجراء صفقات خارجها</li>
              <li>تقديم معلومات مزيفة أو تضليل الطرف الآخر</li>
              <li>التحرش أو الإساءة أو التهديد</li>
              <li>غسيل الأموال أو أي نشاط مالي مشبوه</li>
              <li>تقديم خدمات مخالفة للأنظمة السعودية</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#485869] mb-4">٩. المسؤولية والتعويض</h2>
            <p className="text-sm">خدوم وسيط بين العميل والمستقل وليست طرفاً في العقد بينهما. لا تتحمل خدوم مسؤولية مباشرة عن جودة الخدمات المُقدَّمة. في حال نشوء نزاع، تتدخل المنصة كوسيط ويلتزم الطرفان بقرارها النهائي. الحد الأقصى لمسؤولية خدوم هو قيمة الطلب موضع الخلاف.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#485869] mb-4">١٠. إنهاء الحساب</h2>
            <p className="text-sm">تحتفظ خدوم بحق تعليق أو إنهاء أي حساب دون إشعار مسبق في حالات المخالفة الجسيمة. للمستخدم حق طلب إنهاء حسابه في أي وقت عبر التواصل مع الدعم.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#485869] mb-4">١١. القانون المطبّق</h2>
            <p className="text-sm">تخضع هذه الشروط وتُفسَّر وفقاً لأنظمة المملكة العربية السعودية. أي نزاع ينشأ يُحال للجهات القضائية المختصة في الرياض.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#485869] mb-4">١٢. التواصل</h2>
            <p className="text-sm">لأي استفسار قانوني أو للتبليغ عن مخالفة، تواصل معنا عبر:</p>
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
            <Link href="/privacy" className="hover:text-[#34cc30]">سياسة الخصوصية</Link>
            <Link href="/help" className="hover:text-[#34cc30]">مركز المساعدة</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
