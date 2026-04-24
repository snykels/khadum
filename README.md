# خدوم (Khadum.app)

<<<<<<< HEAD
منصة سعودية للمستقلين عبر واتساب — تربط العملاء بالمستقلين عبر بوت ذكي دون الحاجة إلى تطبيق.
=======
منصة سعودية للمستقلين عبر واتساب.
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a

## معلومات أساسية
- الدومين: khadum.app
- واتساب: +966511809878
- البريد: help@khadum.app
<<<<<<< HEAD
- الواجهة: Arabic RTL — خط Tajawal
- الهوية: `#485869` (رمادي داكن) و `#34cc30` (أخضر)

## التقنيات
- Next.js 15 (App Router) — TypeScript
- PostgreSQL + Drizzle ORM
- Tailwind CSS v4
- Tap Payments — Live mode (مدى، فيزا، Apple Pay، Google Pay، STC Pay)
- Meta WhatsApp Business API (Cloud API v20.0)
- OpenAI GPT-4o — AI agent للمحادثة
- Resend — بريد إلكتروني

---

## دورة الطلب الكاملة (عبر واتساب)
=======
- الواجهة: Arabic RTL
- الخط: Tajawal
- الهوية: `#485869` و `#34cc30`

## التقنيات
- Next.js 15 (App Router)
- PostgreSQL + Drizzle ORM
- Tailwind CSS v4
- Tap Payments (Live mode — sk_live_...)
- OpenAI (Claude-based AI agent)
- Resend (بريد إلكتروني)

---

## كيف يعمل المنتج

### دورة الطلب الكاملة (عبر واتساب)
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a

```
العميل يُرسل طلباً
   ↓
البوت يجمع التفاصيل (intake): الوصف، الميزانية، المدة
   ↓
يُنشئ طلباً حقيقياً في جدول orders
   ↓
<<<<<<< HEAD
search_freelancers → أفضل 3 مستقلين (حسب التقييم DESC + وقت الاستجابة ASC)
   ↓
detectLeak() على وصف الطلب — يُخفي أي أرقام تواصل قبل الإرسال
   ↓
يُرسل عرضاً للمستقل الأول (مهلة 2 دقيقة)
   ↓ لا → ينتقل للمستقل التالي (يحفظ سبب الرفض من قائمة 4 أسباب)
   ↓ نعم
المستقل يقبل → يُنشئ payment_session → رابط /pay/{token} للعميل (صلاحية 60 دقيقة)
   ↓ إذا انتهت الصلاحية → sweepExpiredPaymentSessions() يُنشئ رابطاً جديداً + واتساب
   ↓
العميل يختار طريقة الدفع ويُحوَّل لـ Tap Payments
   ↓
Webhook Tap → CAPTURED → order status=active + إشعار واتساب للطرفين
   ↓
المستقل يُنجز العمل ويُعلن التسليم
   ↓
العميل يؤكد الاستلام                    ← أو يرفع نزاع
   ↓ لا رد خلال 48 ساعة → تأكيد تلقائي      ↓
completeOrder():                         status=disputed → escalation
  - status=completed                      الأدمن يراجع ويحسم:
  - يودع في محفظة المستقل                  • client_wins → Tap Refund + إلغاء
  - يُحدّث إحصائيات الطرفين                • freelancer_wins → إيداع محفظة
   ↓                                      + واتساب للطرفين في الحالتين
البوت يطلب تقييم 1–5 من العميل
   ↓
يُحفظ في reviews + يُحدَّث users.rating (متوسط جاري)
   ↓ يؤثر على ترتيب المستقلين في العروض القادمة
stage = closed
=======
search_freelancers → يختار أفضل 3 مستقلين (حسب التقييم + وقت الاستجابة)
   ↓
يُرسل عرضاً للمستقل الأول (مهلة 2 دقيقة) — مع حماية تسريب في الوصف
   ↓ نعم
المستقل يقبل → يُنشئ payment_session → يُرسل رابط /pay/{token} للعميل
   ↓
العميل يختار طريقة الدفع (مدى / فيزا / Apple Pay / STC Pay)
   ↓
Tap Payments webhook → CAPTURED → تفعيل الطلب + إشعار الطرفين
   ↓
المستقل يُعلن التسليم
   ↓
العميل يؤكد الاستلام (أو يرفع نزاع) — تأكيد تلقائي بعد 48 ساعة
   ↓
completeOrder → يودع المبلغ في محفظة المستقل
   ↓
البوت يطلب تقييماً من العميل (1–5 نجوم)
   ↓
التقييم يُحفظ في reviews + يُحدّث users.rating
   ↓ يؤثر على ترتيب المستقلين في العروض القادمة
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
```

---

## ما تم تنفيذه بالكامل

### البنية الأساسية
<<<<<<< HEAD
- Landing page عربية + dark mode كامل + إحصائيات قابلة للتعديل من الأدمن
- لوحة المستقل: طلبات، أرباح حقيقية من DB، محفظة، فواتير، تفضيلات، ملف شخصي
- لوحة الأدمن: 45+ صفحة إدارية شاملة
- نظام المصادقة: تسجيل دخول، كلمة مرور، جلسات iron-session

### محرر المحتوى
- محرر نصوص احترافي للصفحات والمدونة داخل `/admin/editor/[type]/[id]`
- محرر بلوكات متقدم على نمط Notion/Editor.js كخيار منفصل للصفحات المعقدة
- تبويبات للمحتوى والـ SEO والإعدادات
- دعم الحفظ، المعاينة، والـ RTL
=======
- Landing page + صفحات التصنيفات، التواصل، الشروط، الخصوصية
- لوحة المستقل (طلبات، أرباح، محفظة، فواتير، تفضيلات)
- لوحة الأدمن الشاملة (30+ صفحة)
- نظام API المالي (معاملات، سحوبات، مدفوعات، تقارير)
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a

### بوت واتساب — المسار الكامل

| المرحلة | التفاصيل |
|---|---|
<<<<<<< HEAD
| Intake | AI agent يجمع الوصف والميزانية والمدة |
| إنشاء الطلب | `create_order` في جدول `orders` |
| المطابقة | `search_freelancers` مرتّبة بالتقييم + الاستجابة |
| حماية التسريب (inbound) | `detectLeak()` يكشف أرقام العملاء في كل رسالة واردة |
| حماية التسريب (offer body) | `detectLeak()` على وصف الطلب قبل إرساله للمستقل |
| إرسال العروض | تسلسلي بمهلة دقيقتين لكل مستقل |
| أسباب الرفض | 4 أسباب محددة → محفوظة في `offer_rejection_reasons` |
| قبول المستقل | ربطه بالطلب + إنشاء `payment_session` |
| رابط الدفع | `/pay/{token}` صلاحية 60 دقيقة |
| تجديد رابط الدفع | `sweepExpiredPaymentSessions()` في كل دورة worker |
| صفحة الدفع | أيقونات SVG حقيقية لكل طريقة + redirect لـ Tap |
| Webhook Tap | كل الحالات: CAPTURED / FAILED / VOID / RESTRICTED / CANCELLED / TIMEDOUT / ABANDONED |
| إبلاغ الطرفين | واتساب فوري عند نجاح الدفع |
| تسليم العمل | المستقل يُعلن → `delivery_announced_at` → العميل يُسأل |
| تأكيد تلقائي | `sweepStaleDeliveries()` بعد 48 ساعة |
| اكتمال الطلب | إيداع محفظة + تحديث إحصائيات |
| نظام النزاعات | تسجيل اعتراض → Tap Refund أو إيداع محفظة → واتساب للطرفين |
| تقييم المستقل | 1–5 نجوم بعد الاكتمال → يؤثر على الترتيب |
| سحب الأرباح | Tap Payout API → IBAN → إشعار واتساب للمستقل |

### لوحة الأدمن — أبرز الصفحات

| المجموعة | الصفحات |
|---|---|
| نظرة عامة | لوحة التحكم، التحليلات |
| العمليات | المحادثات، التصعيدات، التدخلات، النزاعات، محاولات التسريب، أسباب الرفض |
| المستخدمون | المستقلون، العملاء، المشرفون، الطلبات والدعوات، الموقوفون |
| المتجر | الخدمات، التصنيفات، الطلبات |
| المالية | المحافظ، المعاملات، السحوبات، الفواتير، روابط الدفع، جلسات الدفع، تقارير الإيرادات |
| المحتوى | الصفحات، المدونة، البانرات، الإشعارات، مركز البريد |
| الإعدادات | عام، العمولات، بوابات الدفع (Tap config كامل)، الأمان، SEO، Meta WhatsApp API (كامل)، الصفحة الرئيسية (إحصائيات)، سجل الأنشطة |

### الأمان
- HMAC-SHA256 signature verification لكل Tap webhook
- HMAC-SHA256 على Meta Webhook (يقرأ appSecret من DB أو env)
- `detectLeak()` — كشف وإخفاء أرقام التواصل (inbound + offer body)
- حظر تلقائي بعد 3 محاولات تسريب
- حماية ازدواجية الجلسة (مستقل واحد في عرض واحد في كل وقت)
- `verifyWebhookSignature()` + `retrieveCharge()` للتحقق المزدوج

### Tap Payments — التكامل الكامل
- `createCharge()` — مدى، فيزا، Apple Pay، Google Pay، STC Pay
- `createRefund()` — رد المبلغ عند حسم النزاع لصالح العميل
- `createTransfer()` — تحويل أرباح المستقل لحسابه البنكي (IBAN) عبر Tap Transfers
- `retrieveCharge()` — تحقق مزدوج من كل webhook
- `payment_sessions` — جدول تتبع كامل مع token آمن
- `/pay/{token}` — صفحة دفع عربية مع عد تنازلي وأيقونات SVG

---

## المتبقي حتى اكتمال المنتج ١٠٠٪

| الميزة | الوصف | الأولوية | ملاحظة |
|---|---|---|---|
| **تفعيل Meta WhatsApp API** | إدخال بيانات الاتصال الحقيقية في /admin/messaging (Phone Number ID, Access Token, App Secret, Verify Token) | 🔴 ضروري | جاهز من ناحية الكود — يحتاج فقط إدخال البيانات |
| **تفعيل Tap Live** | إدخال sk_live_... و pk_live_... في /admin/payment-gateways | 🔴 ضروري | الكود يستخدم env vars الحالية — يمكن override من الأدمن |
| **Apple Pay domain verification** | ملف Apple Pay merchant domain من Tap Dashboard في `public/.well-known/apple-developer-merchantid-domain-association` | 🟡 متوسطة | يُنشّط Apple Pay على الويب |
| **إعداد Cron Jobs** | تشغيل `/api/cron/whatsapp-worker` و `/api/cron/sweep` بشكل منتظم (كل دقيقة / كل 15 دقيقة) | 🟡 متوسطة | يعمل dev — يحتاج cron حقيقي في production |
| **إعداد OpenAI API Key** | تفعيل GPT-4o للبوت الذكي (OPENAI_API_KEY) | 🔴 ضروري | بدونه البوت لا يفهم الرسائل |
| **OCR على الصور الواردة** | كشف أرقام التواصل المخفية في الصور (task #26) | 🔵 منخفضة | تحسين أمني إضافي |
| **إشعار تلقائي دخول مستقل جديد** | البوت يُرسل رسالة ترحيب للمستقل المقبول فور الموافقة | 🔵 منخفضة | تحسين تجربة المستخدم |
| **Tap Payout IBAN** | التحقق من صحة IBAN للمستقل قبل إرسال التحويل | 🟡 متوسطة | يتطلب IBAN مُدخل في ملف المستقل |
| **تسجيل المستقل عبر واتساب** | إكمال تدفق التقديم من البوت مباشرة | 🔵 منخفضة | حالياً عبر /apply فقط |

---

## ما يجب إعداده في بيئة الإنتاج

### 1. إعداد Meta WhatsApp Business API
```
/admin/messaging → أدخل:
- رقم الهاتف: +966511809878
- Phone Number ID: من Meta Developers
- WABA ID: من Meta Business Suite
- Access Token: System User Token دائم
- App Secret: من Meta App Dashboard
- Verify Token: أي نص سري تختاره

Webhook URL: https://khadum.app/api/whatsapp/webhook
Subscribed Events: messages
```

### 2. إعداد Tap Payments
```
/admin/payment-gateways → أدخل:
- Secret Key: sk_live_...
- Publishable Key: pk_live_...
- Mode: live
- Webhook: https://khadum.app/api/payments/webhook/tap
```

### 3. متغيرات البيئة الأساسية

| المتغير | الوصف |
|---|---|
| `DATABASE_URL` | رابط PostgreSQL |
| `APP_BASE_URL` | https://khadum.app |
| `IRON_SESSION_SECRET` | مفتاح جلسات iron-session (32 حرف+) |
| `OPENAI_API_KEY` | مفتاح OpenAI للـ AI agent |
| `RESEND_API_KEY` | مفتاح Resend للبريد |
| `CRON_SECRET` | مفتاح حماية نقاط الـ cron |
| `Live_Secret_Key` | Tap — sk_live_... (fallback إن لم تُدخل من الأدمن) |
| `Live_Public_Key` | Tap — pk_live_... (fallback) |
| `WHATSAPP_TOKEN` | Meta Access Token (fallback) |
| `WHATSAPP_PHONE_ID` | Meta Phone Number ID (fallback) |
| `WHATSAPP_APP_SECRET` | Meta App Secret (fallback) |
| `WHATSAPP_VERIFY_TOKEN` | Meta Verify Token (fallback) |

> **ملاحظة:** جميع إعدادات Meta و Tap يمكن إدخالها من الأدمن مباشرة بدون env vars.
=======
| Intake | جمع الوصف والميزانية والمدة مع AI agent |
| إنشاء الطلب | `create_order` في جدول `orders` |
| المطابقة | `search_freelancers` مرتّبة بالتقييم + الاستجابة |
| إرسال العروض | تسلسلي بمهلة دقيقتين لكل مستقل |
| حماية التسريب | كشف أرقام التواصل في رسائل العملاء والوصف |
| قبول المستقل | ربطه بالطلب + إنشاء `payment_session` |
| رابط الدفع | `/pay/{token}` مع صلاحية 60 دقيقة |
| صفحة الدفع | اختيار طريقة الدفع + redirect لـ Tap |
| Webhook Tap | معالجة CAPTURED/FAILED/VOID/RESTRICTED/CANCELLED/TIMEDOUT/ABANDONED |
| إبلاغ الطرفين | إشعار فوري للمستقل والعميل عند نجاح الدفع |
| تسليم العمل | المستقل يُعلن → العميل يؤكد أو يرفع نزاع |
| اكتمال الطلب | إيداع محفظة + تحديث إحصائيات |
| تقييم المستقل | طلب 1–5 نجوم بعد الاكتمال → يؤثر على الترتيب |
| أسباب رفض العروض | 4 أسباب محددة + لوحة إحصاء في الأدمن |

### الأمان
- HMAC-SHA256 signature verification لكل Tap webhook
- كشف تسريب أرقام التواصل (inbound + offer body)
- حماية ازدواجية الجلسة (لكل مستقل عرض واحد في كل وقت)
- لوحة تسريب ومحاولات في الأدمن

---

## المتبقي حتى الاكتمال

| الميزة | الأولوية |
|---|---|
| إشعار العميل عند انتهاء صلاحية رابط الدفع | 🟡 متوسطة |
| صفحة إدارة payment sessions في الأدمن | 🟡 متوسطة |
| Apple Pay (يحتاج domain verification مع Apple) | 🟡 متوسطة |
| نظام النزاعات (الجدول موجود، الـ flow غير مكتمل) | 🟡 متوسطة |
| OCR على الصور لاكتشاف أرقام مخفية | 🔵 منخفضة |
| اختبارات التكامل للمسار الكامل | 🔵 منخفضة |
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a

---

## آخر التحديثات

<<<<<<< HEAD
| # | التحديث |
|---|---|
| 17 | معالجة رسائل واتساب في الخلفية بشكل موثوق (queue + worker) |
| 18 | ربط البوت بإنشاء طلبات حقيقية في `orders` |
| 19 | كشف تسريب أرقام التواصل قبل الإرسال |
| 20 | تدفق التسليم + إيداع المحفظة + تأكيد تلقائي 48 ساعة |
| 21 | دفع Tap الحقيقي — كل حالات webhook — جدول payment_sessions |
| 22 | أسباب رفض العروض (4 أسباب) + لوحة إحصاء في الأدمن |
| 23 | Leak guard على وصف الطلب قبل إرساله للمستقل |
| 24 | نظام التقييم بعد الاكتمال (1–5 نجوم) → يُحدّث الترتيب |
| 25 | نظام النزاعات كامل: واتساب → أدمن يحسم → Tap Refund أو إيداع محفظة |
| 26 | صفحة مراقبة جلسات الدفع في الأدمن + Google Pay |
| 27 | لوحة المستقل ببيانات حقيقية من DB + API /api/freelancer/stats |
| 28 | تذكير العميل بانتهاء رابط الدفع — sweepExpiredPaymentSessions() |
| 29 | سحب الأرباح عبر Tap Payout API — createTransfer() + واتساب |
| 30 | اللاندينج بيج: حذف الأسعار، إصلاح dark mode، تحديث FAQ، ربط بالأدمن |
| 31 | Meta WhatsApp API settings كاملة في الأدمن (phoneNumberId، appSecret، verifyToken، wabaId) |
| 32 | Tap Payments settings في الأدمن (secretKey، publishableKey، mode، webhookSecret) |
| 33 | صفحة إعدادات اللاندينج في الأدمن — إحصائيات الهيرو قابلة للتعديل |
| 34 | webhook Meta يقرأ appSecret + verifyToken من DB أولاً ثم env vars |
| 35 | محرر بلوكات متقدم للصفحات والمدونة والصفحة الرئيسية |

---

## حالة المشروع الآن

### تم إنجازه
- لوحة المستقل أصبحت مرتبطة ببيانات حقيقية بدل الموك
- لوحة الأدمن تمت مراجعتها وتنظيفها من الأكواد القديمة
- صندوق الوارد الموحد للأدمن صار بتخطيط حقيقي ثلاثي الأعمدة
- صفحة الخدمات للمستقل تعمل داخل لوحة التحكم مع إنشاء/تعديل/حذف
- صفحة الإعدادات تم تنظيفها من تكرار بيانات الحساب
- نموذج الدعم الفني صار أوضح وأفضل في الوضع الفاتح
- أُضيف نظام الشهادات الكامل:
  - المستقل يرفع الشهادة
  - الأدمن يراجعها ويوافق أو يرفض مع سبب
  - المستقل تصله إشعارات بالنتيجة

### باقي قبل الإطلاق الكامل
- ربط مفاتيح Meta WhatsApp الحقيقية من لوحة الأدمن
- تفعيل Tap Live Keys على الإنتاج
- تشغيل Cron jobs في الإنتاج
- تفعيل OpenAI API Key للبوت
- مراجعة الـ webhook URLs بعد النشر النهائي

### ملاحظات سريعة
- المشروع الآن جاهز للتطوير المستمر والنشر
- أي تغييرات في قاعدة البيانات يجب تنفيذها عبر `npm run db:push --force`
- لا تغيّر نوع معرفات الجداول الأساسية من `serial` إلى `uuid`
=======
| الرقم | التحديث |
|---|---|
| #17 | معالجة رسائل واتساب في الخلفية بشكل موثوق (queue) |
| #18 | ربط البوت بإنشاء طلبات حقيقية في `orders` |
| #19 | كشف تسريب أرقام التواصل قبل الإرسال |
| #20 | تدفق التسليم واكتمال الطلب + إيداع المحفظة |
| #21 | دفع Tap الحقيقي — كل حالات الـ webhook — payment_session |
| #22 | أسباب رفض العروض + لوحة إحصاء في الأدمن |
| #23 | Leak guard على وصف الطلب قبل إرساله للمستقل |
| — | نظام التقييم بعد الاكتمال (1–5 نجوم → يؤثر على الترتيب) |

---

## المتغيرات البيئية

| المتغير | الوصف |
|---|---|
| `DATABASE_URL` | رابط قاعدة البيانات PostgreSQL |
| `APP_BASE_URL` | الدومين الكامل (https://khadum.app) |
| `Live_Secret_Key` | Tap Payments Secret Key (live) |
| `Live_Public_Key` | Tap Payments Public Key (live) |
| `Test_Secret_Key` | Tap Payments Secret Key (test) |
| `Test_Public_Key` | Tap Payments Public Key (test) |
| `TAP_WEBHOOK_SECRET` | HMAC secret للـ webhook (اختياري — يُستخدم sk_live كبديل) |
| `CRON_SECRET` | مفتاح حماية الـ cron jobs |
| `RESEND_API_KEY` | مفتاح Resend للبريد الإلكتروني |
| `OPENAI_API_KEY` | مفتاح OpenAI للـ AI agent |
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a

---

## ملاحظات تشغيل
<<<<<<< HEAD
- المنفذ: **5000** — إذا ظهر `EADDRINUSE` شغّل `fuser -k 5000/tcp`
- مراحل الجلسة: `intake → matching → payment → in_progress → delivery → rating → closed`
  - فرع النزاع: `delivery → dispute → closed` (بعد قرار الأدمن)

## ملاحظات فنية
- جداول المعرفات `serial` — لا تُغيّر لـ uuid أبداً (يكسر البيانات)
- `users.rating` يُحدَّث بـ `AVG(reviews.rating)` عند كل تقييم جديد
- `search_freelancers` يُرتّب بـ `rating DESC NULLS LAST, avg_response_time ASC`
- `payment_sessions.token` مخزّن كـ hash في `token_hash` للبحث الآمن
- كل استدعاء Tap webhook يمر بتحقق مزدوج: HMAC + `retrieveCharge()` من API
- Meta webhook يقرأ `verifyToken` و `appSecret` من DB أولاً (إعدادات الأدمن)

## هيكل الكود — الملفات المحورية

```
lib/
  whatsapp/
    orchestrator.ts    ← المتحكم الرئيسي: يُوزّع كل رسالة واردة
    offers.ts          ← إرسال العروض + أسباب الرفض
    delivery.ts        ← التسليم + التقييم + completeOrder
    session.ts         ← إدارة جلسات الواتساب (Stage + Context)
    sender.ts          ← إرسال رسائل واتساب مع تأخير بشري
    paymentReminders.ts← تجديد روابط الدفع المنتهية
  tap.ts               ← createCharge / createRefund / createTransfer / retrieveCharge
  payments.ts          ← createOrderPaymentLink
  paymentSession.ts    ← إنشاء وتحقق وتسجيل جلسات الدفع
  leakDetector.ts      ← كشف وإخفاء أرقام التواصل
  notify.ts            ← sendWhatsApp / sendEmail / loadSettings

app/
  pay/[token]/         ← صفحة الدفع للعميل
  api/
    whatsapp/webhook   ← نقطة استقبال Meta Cloud API (يقرأ secrets من DB)
    public/landing     ← إحصائيات اللاندينج (مُحدّثة من الأدمن)
    payments/
      [token]/         ← إنشاء charge عند اختيار طريقة الدفع
      webhook/tap/     ← معالجة كل حالات Tap webhook
    admin/
      disputes/resolve/    ← حسم النزاعات (Tap Refund أو إيداع)
      payment-sessions/    ← مراقبة جلسات الدفع
      rejection-stats/     ← إحصائيات أسباب رفض العروض
      withdrawals/[id]/    ← الموافقة على السحب → Tap Transfer API
      landing-settings/    ← إعدادات الصفحة الرئيسية

src/app/
  pages/LandingPage.tsx      ← الصفحة الرئيسية (dark mode كامل)
  components/landing/
    Hero.tsx           ← يجلب الإحصائيات من /api/public/landing
    FAQ.tsx            ← محدّث (بدون PayPal، بدون باقات)
    Navbar.tsx         ← محدّث (بدون رابط الأسعار)
  components/admin/
    AdminPagesExtra.tsx  ← MessagingSettingsPage (Meta API كامل)
                           PaymentGatewaysPage (Tap config كامل)
                           LandingSettingsPage (إحصائيات الهيرو)
```
=======
- المنفذ: 5000 — إذا ظهر `EADDRINUSE` شغّل `fuser -k 5000/tcp`
- GitHub push: استخدم استراتيجية الـ orphan branch (الـ history ضخم)
- الـ `stage` في جلسات الواتساب: intake → matching → payment → in_progress → delivery → rating → closed

## ملاحظات فنية
- جداول المعرفات `serial` — لا تُغيّر إلى uuid
- `users.rating` يُحدَّث بـ AVG من جدول `reviews` عند كل تقييم جديد
- `search_freelancers` يُرتّب بـ `rating DESC, avg_response_time ASC`
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
