import bcrypt from "bcryptjs";
import { db } from "../lib/db";
import {
  users, categories, subcategories, services, orders, wallets, withdrawals,
  reviews, notifications, supportTickets, refundRequests, orderTransfers,
  keywords, contactMessages, freelancerApplications,
} from "../lib/schema";
import { sql } from "drizzle-orm";

async function hash(p: string) { return bcrypt.hash(p, 10); }

async function reset() {
  await db.execute(sql`TRUNCATE TABLE order_transfers, refund_requests, support_tickets, reviews, withdrawals, wallets, notifications, messages, orders, services, freelancer_applications, contact_messages, subcategories, categories, keywords, users RESTART IDENTITY CASCADE;`);
}

async function run() {
  console.log("⏳ Resetting...");
  await reset();

  console.log("👥 Seeding staff...");
  const pw = await hash("Khadom@2026");
  const staff = await db.insert(users).values([
    { name: "يوسف الغامدي", username: "yousef", email: "owner@khadom.app", passwordHash: pw, role: "admin", adminRole: "owner", isLocked: true, isVerified: true, lastLoginAt: new Date() },
    { name: "عبدالرحمن المنصور", username: "abdulrahman", email: "abdulrahman@khadom.app", passwordHash: pw, role: "admin", adminRole: "general", isVerified: true, lastLoginAt: new Date(Date.now() - 5 * 60_000) },
    { name: "ريم العسيري", username: "reem", email: "reem@khadom.app", passwordHash: pw, role: "admin", adminRole: "support", isVerified: true, lastLoginAt: new Date(Date.now() - 60 * 60_000) },
    { name: "فهد المالكي", username: "fahad", email: "fahad@khadom.app", passwordHash: pw, role: "admin", adminRole: "finance", isVerified: true, lastLoginAt: new Date(Date.now() - 24 * 60 * 60_000) },
  ]).returning();

  console.log("🗂️ Seeding categories...");
  const cats = await db.insert(categories).values([
    { nameAr: "تصميم وجرافيك",  icon: "🎨", sortOrder: 1 },
    { nameAr: "كتابة وترجمة",   icon: "✍️", sortOrder: 2 },
    { nameAr: "برمجة وتطوير",   icon: "💻", sortOrder: 3 },
    { nameAr: "تسويق رقمي",     icon: "📱", sortOrder: 4 },
    { nameAr: "فيديو وأنيميشن", icon: "🎬", sortOrder: 5 },
    { nameAr: "أعمال وإدارة",   icon: "📊", sortOrder: 6 },
  ]).returning();

  await db.insert(subcategories).values([
    { categoryId: cats[0].id, nameAr: "تصميم شعار" },
    { categoryId: cats[0].id, nameAr: "هوية بصرية" },
    { categoryId: cats[1].id, nameAr: "كتابة محتوى" },
    { categoryId: cats[1].id, nameAr: "ترجمة" },
    { categoryId: cats[2].id, nameAr: "تطوير ويب" },
    { categoryId: cats[2].id, nameAr: "تطبيقات جوال" },
    { categoryId: cats[3].id, nameAr: "إدارة سوشيال" },
    { categoryId: cats[3].id, nameAr: "إعلانات ممولة" },
    { categoryId: cats[4].id, nameAr: "مونتاج فيديو" },
    { categoryId: cats[4].id, nameAr: "موشن جرافيك" },
  ]);

  console.log("👨‍💻 Seeding freelancers...");
  const fl = await db.insert(users).values([
    { name: "محمد الغامدي",    email: "mohammed@khadom.app", passwordHash: pw, role: "freelancer", phone: "+966501112233", isVerified: true,  bio: "مصمم جرافيك بخبرة 8 سنوات",      location: "الرياض" },
    { name: "سارة القحطاني",   email: "sara@khadom.app",     passwordHash: pw, role: "freelancer", phone: "+966502223344", isVerified: true,  bio: "كاتبة محتوى ومترجمة احترافية",  location: "جدة" },
    { name: "عبدالله العمري",  email: "abdullah@khadom.app", passwordHash: pw, role: "freelancer", phone: "+966503334455", isVerified: true,  bio: "مطور Full-Stack Next.js + Node",   location: "الدمام" },
    { name: "نورة الشمري",     email: "noura@khadom.app",    passwordHash: pw, role: "freelancer", phone: "+966504445566", isVerified: true,  bio: "مونتيرة فيديو ومحررة موشن",       location: "الرياض" },
    { name: "خالد الدوسري",    email: "khaled@khadom.app",   passwordHash: pw, role: "freelancer", phone: "+966505556677", isVerified: false, bio: "مسوّق رقمي ومدير حملات",          location: "مكة" },
    { name: "هند السبيعي",     email: "hind@khadom.app",     passwordHash: pw, role: "freelancer", phone: "+966506667788", isVerified: false, bio: "مترجمة عربي/إنجليزي",            location: "الرياض", isSuspended: true, suspensionReason: "تأخر متكرر في التسليم", suspendedAt: new Date(Date.now() - 5*86400000) },
  ]).returning();

  console.log("👤 Seeding clients...");
  const cl = await db.insert(users).values([
    { name: "أحمد ✦",  email: "client1@khadom.app", passwordHash: pw, role: "client", phone: "+966551112222" },
    { name: "Faty 🌸", email: "client2@khadom.app", passwordHash: pw, role: "client", phone: "+966553334444" },
    { name: "Omar.H",  email: "client3@khadom.app", passwordHash: pw, role: "client", phone: "+966555556666" },
    { name: "Layla",   email: "client4@khadom.app", passwordHash: pw, role: "client", phone: "+966557778888" },
    { name: "منى ❤",  email: "client5@khadom.app", passwordHash: pw, role: "client", phone: "+966559990000" },
  ]).returning();

  console.log("🛠️ Seeding services...");
  const svc = await db.insert(services).values([
    { title: "تصميم هوية بصرية كاملة",  description: "هوية احترافية تشمل الشعار والألوان والقرطاسية", categoryId: cats[0].id, freelancerId: fl[0].id, price: "850",  deliveryDays: 5, status: "published", rating: "4.9", ordersCount: 124 },
    { title: "كتابة مقالات SEO",         description: "مقالات محسّنة لمحركات البحث",                  categoryId: cats[1].id, freelancerId: fl[1].id, price: "200",  deliveryDays: 3, status: "published", rating: "4.8", ordersCount: 456 },
    { title: "تطوير موقع ووردبريس",      description: "موقع متجاوب بالكامل مع لوحة تحكم",             categoryId: cats[2].id, freelancerId: fl[2].id, price: "1500", deliveryDays: 14, status: "published", rating: "5.0", ordersCount: 89 },
    { title: "مونتاج فيديو احترافي",     description: "مونتاج مع مؤثرات ومزيكا",                       categoryId: cats[4].id, freelancerId: fl[3].id, price: "400",  deliveryDays: 4, status: "published", rating: "4.9", ordersCount: 210 },
    { title: "تصميم عروض تقديمية",       description: "عروض احترافية بـ Keynote/PowerPoint",            categoryId: cats[0].id, freelancerId: fl[4].id, price: "300",  deliveryDays: 3, status: "pending",   rating: "0", ordersCount: 0 },
    { title: "إدارة حسابات السوشيال",    description: "إدارة شهرية كاملة + محتوى",                     categoryId: cats[3].id, freelancerId: fl[5].id, price: "500",  deliveryDays: 30, status: "pending",  rating: "0", ordersCount: 0 },
    { title: "ترجمة مستندات قانونية",    description: "ترجمة معتمدة عربي/إنجليزي",                     categoryId: cats[1].id, freelancerId: fl[1].id, price: "250",  deliveryDays: 2, status: "pending",   rating: "0", ordersCount: 0 },
  ]).returning();

  console.log("📦 Seeding orders...");
  const ord = await db.insert(orders).values([
    { serviceId: svc[0].id, clientId: cl[0].id, freelancerId: fl[0].id, status: "active",    amount: "850",  platformFee: "85",  description: "هوية لمطعم", dueDate: new Date(Date.now()+5*86400000) },
    { serviceId: svc[1].id, clientId: cl[1].id, freelancerId: fl[1].id, status: "completed", amount: "400",  platformFee: "40",  description: "5 مقالات تقنية", completedAt: new Date(Date.now()-2*86400000) },
    { serviceId: svc[2].id, clientId: cl[2].id, freelancerId: fl[2].id, status: "active",    amount: "1500", platformFee: "150", description: "موقع متجر",   dueDate: new Date(Date.now()+10*86400000) },
    { serviceId: svc[3].id, clientId: cl[3].id, freelancerId: fl[3].id, status: "disputed",  amount: "400",  platformFee: "40",  description: "فيديو إعلاني" },
    { serviceId: svc[1].id, clientId: cl[4].id, freelancerId: fl[1].id, status: "completed", amount: "200",  platformFee: "20",  description: "مقال واحد",   completedAt: new Date(Date.now()-7*86400000) },
    { serviceId: svc[3].id, clientId: cl[0].id, freelancerId: fl[3].id, status: "cancelled", amount: "250",  platformFee: "0",   description: "ملغى من العميل" },
    { serviceId: svc[0].id, clientId: cl[2].id, freelancerId: fl[0].id, status: "pending",   amount: "850",  platformFee: "0",   description: "بانتظار الدفع" },
  ]).returning();

  console.log("💰 Seeding wallets & withdrawals...");
  await db.insert(wallets).values(fl.map((f, i) => ({
    userId: f.id, balance: ["12500","8200","45000","6700","3200","1500"][i] || "0", pending: ["1200","400","2500","800","0","0"][i] || "0", totalEarned: ["42350","38920","156780","32100","47800","18500"][i] || "0",
  })));

  await db.insert(withdrawals).values([
    { userId: fl[0].id, amount: "2000", status: "pending", bankName: "الراجحي",  accountNumber: "SA0380000000608010167519", note: "سحب شهري" },
    { userId: fl[1].id, amount: "1500", status: "pending", bankName: "الأهلي",   accountNumber: "SA4410000010000000123456" },
    { userId: fl[2].id, amount: "5000", status: "approved", bankName: "الراجحي", accountNumber: "SA0380000000608010111111" },
    { userId: fl[3].id, amount: "800",  status: "pending",  bankName: "الإنماء", accountNumber: "SA0380000000608010222222" },
  ]);

  console.log("⭐ Seeding reviews...");
  await db.insert(reviews).values([
    { orderId: ord[1].id, reviewerId: cl[1].id, freelancerId: fl[1].id, rating: 5, comment: "عمل ممتاز وتسليم سريع" },
    { orderId: ord[4].id, reviewerId: cl[4].id, freelancerId: fl[1].id, rating: 4, comment: "جيد جداً" },
  ]);

  console.log("🔔 Seeding notifications...");
  await db.insert(notifications).values([
    { userId: staff[0].id, type: "order",      title: "طلب جديد",       message: "طلب جديد من أحمد على خدمة تصميم هوية" },
    { userId: staff[0].id, type: "withdrawal", title: "طلب سحب جديد",   message: "محمد الغامدي يطلب سحب 2000 ر.س" },
    { userId: fl[0].id,    type: "order",      title: "طلب نشط",        message: "لديك طلب جديد بقيمة 850 ر.س" },
  ]);

  console.log("🎫 Seeding tickets/refunds/transfers/contact/applications...");
  await db.insert(supportTickets).values([
    { userId: fl[0].id, fromName: "محمد الغامدي",   fromType: "مستقل", subject: "مشكلة في استلام المدفوعات",   priority: "urgent", status: "open",      assignedToId: staff[2].id },
    { userId: cl[0].id, fromName: "أحمد السالم",     fromType: "عميل",  subject: "طلب استرداد للطلب #ORD-2440", priority: "urgent", status: "open" },
    { userId: fl[1].id, fromName: "سارة القحطاني",  fromType: "مستقل", subject: "طلب تغيير اسم المستخدم",       priority: "normal", status: "resolved",  assignedToId: staff[2].id },
    { userId: cl[1].id, fromName: "خالد العتيبي",   fromType: "عميل",  subject: "المستقل لا يرد على الرسائل",   priority: "medium", status: "in_review", assignedToId: staff[1].id },
  ]);

  await db.insert(refundRequests).values([
    { orderId: ord[3].id, clientName: "ليلى",  clientPhone: "+966557778888", freelancerName: "نورة الشمري", amount: "400", reason: "العمل غير مطابق للوصف", status: "new" },
    { orderId: ord[5].id, clientName: "أحمد",   clientPhone: "+966551112222", freelancerName: "نورة الشمري", amount: "250", reason: "ألغى العميل قبل البدء", status: "in_review" },
  ]);

  await db.insert(orderTransfers).values([
    { orderId: ord[0].id, fromFreelancerId: fl[0].id, toFreelancerId: fl[1].id, reason: "عدم الرد خلال 48 ساعة", status: "completed", createdById: staff[0].id },
  ]);

  await db.insert(keywords).values([
    { word: "تصميم شعار", searches: 1240 },
    { word: "برمجة موقع", searches: 980 },
    { word: "كتابة محتوى", searches: 870 },
    { word: "مونتاج فيديو", searches: 650 },
    { word: "تسويق إلكتروني", searches: 580 },
    { word: "تصميم هوية", searches: 470 },
    { word: "ترجمة", searches: 380 },
    { word: "سوشيال ميديا", searches: 340 },
    { word: "SEO", searches: 290 },
    { word: "ووردبريس", searches: 240 },
  ]);

  await db.insert(contactMessages).values([
    { name: "ماجد العتيبي", phone: "+966550001122", subject: "استفسار عن الباقات",     message: "أبغى أعرف تفاصيل الباقات الشهرية", status: "new" },
    { name: "سميرة الحارثي", phone: "+966550003344", subject: "شراكة مع المنصة",        message: "أمثّل وكالة وأبحث عن تعاون", status: "new" },
  ]);

  await db.insert(freelancerApplications).values([
    { name: "فارس العنزي", email: "fares@example.com", phone: "501234567", phoneCountryCode: "+966", country: "السعودية", city: "الرياض", mainCategory: "تصميم وجرافيك", subCategory: "هوية بصرية", yearsExperience: "5", skills: "Photoshop, Illustrator, Figma", bio: "مصمم خبرة 5 سنوات", passwordHash: pw, status: "pending" },
    { name: "مها الشهري",  email: "maha@example.com",  phone: "509876543", phoneCountryCode: "+966", country: "السعودية", city: "جدة",   mainCategory: "كتابة وترجمة", subCategory: "ترجمة",      yearsExperience: "3", skills: "ترجمة قانونية وطبية",         bio: "مترجمة معتمدة",   passwordHash: pw, status: "pending" },
  ]);

  console.log("✅ Done. Owner login: yousef@khadom.app / Khadom@2026 (or owner@khadom.app)");
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
