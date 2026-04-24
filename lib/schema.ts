import { pgTable, serial, text, integer, timestamp, boolean, decimal, pgEnum, jsonb, date, index, uniqueIndex, primaryKey } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const userRoleEnum = pgEnum("user_role", ["freelancer", "client", "admin", "supervisor"]);
export const adminRoleEnum = pgEnum("admin_role", ["owner", "general", "support", "finance"]);
<<<<<<< HEAD
export const ticketStatusEnum = pgEnum("ticket_status", ["open", "in_review", "in_progress", "resolved"]);
=======
export const ticketStatusEnum = pgEnum("ticket_status", ["open", "in_review", "resolved"]);
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
export const refundStatusEnum = pgEnum("refund_status", ["new", "in_review", "accepted", "rejected", "partial"]);
export const transferStatusEnum = pgEnum("transfer_status", ["pending", "completed", "cancelled"]);
export const applicationStatusEnum = pgEnum("application_status", ["pending", "approved", "rejected"]);
export const orderStatusEnum = pgEnum("order_status", ["pending", "active", "completed", "cancelled", "disputed"]);
export const serviceStatusEnum = pgEnum("service_status", ["draft", "pending", "published", "rejected"]);
export const withdrawalStatusEnum = pgEnum("withdrawal_status", ["pending", "approved", "rejected"]);

export const conversationStatusEnum = pgEnum("conversation_status", ["active", "completed", "disputed", "blocked", "archived"]);
export const conversationPartyEnum = pgEnum("conversation_party", ["client", "freelancer", "admin", "system"]);
export const messageTypeEnum = pgEnum("message_type", ["text", "image", "audio", "video", "document", "location", "system"]);
export const leakSeverityEnum = pgEnum("leak_severity", ["low", "medium", "high", "critical"]);
export const leakActionEnum = pgEnum("leak_action", ["warned", "blocked", "redacted", "ignored"]);
<<<<<<< HEAD
export const disputeStatusEnum = pgEnum("dispute_status", ["open", "pending", "in_review", "resolved", "rejected", "escalated"]);
=======
export const disputeStatusEnum = pgEnum("dispute_status", ["open", "in_review", "resolved", "rejected", "escalated"]);
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
export const interventionTypeEnum = pgEnum("intervention_type", ["warning", "block", "unblock", "refund", "transfer", "manual_message", "note"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "paid", "failed", "refunded", "partial_refund"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  phone: text("phone").unique("users_phone_key"),
  role: userRoleEnum("role").notNull().default("client"),
  avatar: text("avatar"),
  bio: text("bio"),
  location: text("location"),
  isVerified: boolean("is_verified").default(false),
  isSuspended: boolean("is_suspended").default(false),
  suspensionReason: text("suspension_reason"),
  suspendedAt: timestamp("suspended_at"),
  adminRole: adminRoleEnum("admin_role"),
  isLocked: boolean("is_locked").default(false),
  username: text("username").unique("users_username_key"),
  lastLoginAt: timestamp("last_login_at"),
  avgResponseTime: integer("avg_response_time"),
  disputesCount: integer("disputes_count").notNull().default(0),
  rating: decimal("rating", { precision: 3, scale: 2 }).notNull().default("0"),
  completedProjects: integer("completed_projects").notNull().default(0),
  isBlocked: boolean("is_blocked").notNull().default(false),
  blockReason: text("block_reason"),
  blockedAt: timestamp("blocked_at"),
  blockedUntil: timestamp("blocked_until"),
  blockedBySystem: boolean("blocked_by_system").notNull().default(false),
  leakAttemptsCount: integer("leak_attempts_count").notNull().default(0),
  lastLeakAttemptAt: timestamp("last_leak_attempt_at"),
  activationStatus: text("activation_status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  fromName: text("from_name").notNull(),
  fromType: text("from_type").notNull(),
  subject: text("subject").notNull(),
  body: text("body"),
  priority: text("priority").default("normal"),
  status: ticketStatusEnum("status").default("open"),
  assignedToId: integer("assigned_to_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const refundRequests = pgTable("refund_requests", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id),
  clientName: text("client_name").notNull(),
  clientPhone: text("client_phone").notNull(),
  freelancerName: text("freelancer_name"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  refundAmount: decimal("refund_amount", { precision: 10, scale: 2 }),
  calculatedRefund: decimal("calculated_refund", { precision: 10, scale: 2 }),
  refundPercentage: integer("refund_percentage"),
  reason: text("reason"),
  source: text("source").default("whatsapp"),
  status: refundStatusEnum("status").default("new"),
  handledById: integer("handled_by_id").references(() => users.id),
  handledAt: timestamp("handled_at"),
  resolutionNote: text("resolution_note"),
  evidenceUrls: jsonb("evidence_urls").default(sql`'[]'::jsonb`),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orderTransfers = pgTable("order_transfers", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id),
  fromFreelancerId: integer("from_freelancer_id").references(() => users.id),
  toFreelancerId: integer("to_freelancer_id").references(() => users.id),
  reason: text("reason"),
  notes: text("notes"),
  status: transferStatusEnum("status").default("pending"),
  createdById: integer("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const keywords = pgTable("keywords", {
  id: serial("id").primaryKey(),
  word: text("word").notNull().unique("keywords_word_key"),
  searches: integer("searches").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  nameAr: text("name_ar").notNull().unique(),
  icon: text("icon"),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
});

export const subcategories = pgTable("subcategories", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
  nameAr: text("name_ar").notNull(),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  categoryId: integer("category_id").references(() => categories.id),
  subcategoryId: integer("subcategory_id").references(() => subcategories.id),
  freelancerId: integer("freelancer_id").references(() => users.id),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  deliveryDays: integer("delivery_days").default(3),
  status: serviceStatusEnum("status").default("pending"),
  rejectionReason: text("rejection_reason"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  ordersCount: integer("orders_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  publicCode: text("public_code").unique("orders_public_code_key"),
  serviceId: integer("service_id").references(() => services.id),
  clientId: integer("client_id").references(() => users.id),
  freelancerId: integer("freelancer_id").references(() => users.id),
  status: orderStatusEnum("status").default("pending"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  platformFee: decimal("platform_fee", { precision: 10, scale: 2 }).default("0"),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  refundedAmount: decimal("refunded_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  paymentStatus: paymentStatusEnum("payment_status").notNull().default("pending"),
  clientPhone: text("client_phone"),
  freelancerPhone: text("freelancer_phone"),
  description: text("description"),
  deliverables: text("deliverables"),
  dueDate: timestamp("due_date"),
  acceptedAt: timestamp("accepted_at"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  cancelledAt: timestamp("cancelled_at"),
  cancellationReason: text("cancellation_reason"),
  deliveryAnnouncedAt: timestamp("delivery_announced_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id),
  senderId: integer("sender_id").references(() => users.id),
  receiverId: integer("receiver_id").references(() => users.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  data: text("data"),
  channel: text("channel").notNull().default("inapp"),
  priority: text("priority").notNull().default("normal"),
  link: text("link"),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).unique(),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0"),
  pending: decimal("pending", { precision: 10, scale: 2 }).default("0"),
  totalEarned: decimal("total_earned", { precision: 10, scale: 2 }).default("0"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const withdrawals = pgTable("withdrawals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: withdrawalStatusEnum("status").default("pending"),
  bankName: text("bank_name"),
  accountNumber: text("account_number"),
  note: text("note"),
<<<<<<< HEAD
  tapTransferId: text("tap_transfer_id"),
  tapTransferStatus: text("tap_transfer_status"),
=======
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id),
  reviewerId: integer("reviewer_id").references(() => users.id),
  freelancerId: integer("freelancer_id").references(() => users.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  subject: text("subject"),
  message: text("message").notNull(),
  status: text("status").default("new"),
  handledBy: integer("handled_by").references(() => users.id),
  handledAt: timestamp("handled_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const freelancerApplications = pgTable("freelancer_applications", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  phoneCountryCode: text("phone_country_code"),
  country: text("country"),
  city: text("city"),
  gender: text("gender"),
  dateOfBirth: text("date_of_birth"),
  bio: text("bio"),
  mainCategory: text("main_category"),
  subCategory: text("sub_category"),
  yearsExperience: text("years_experience"),
  skills: text("skills"),
  languages: text("languages"),
  motivation: text("motivation"),
  portfolioUrl: text("portfolio_url"),
  linkedinUrl: text("linkedin_url"),
  nationalIdImage: text("national_id_image"),
  nationalIdFrontImage: text("national_id_front_image"),
  nationalIdBackImage: text("national_id_back_image"),
  idType: text("id_type"),
  nationalIdNumber: text("national_id_number"),
  passportNumber: text("passport_number"),
  verificationDocuments: text("verification_documents"),
  portfolioFiles: text("portfolio_files"),
  inviteToken: text("invite_token"),
  bankName: text("bank_name"),
  iban: text("iban"),
  ibanDocument: text("iban_document"),
  passwordHash: text("password_hash"),
  accountHolderName: text("account_holder_name"),
  phoneVerified: boolean("phone_verified").default(false),
  emailVerified: boolean("email_verified").default(false),
  status: applicationStatusEnum("status").default("pending"),
  rejectionReason: text("rejection_reason"),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================================
// admin_roles — صلاحيات الأدمن المتقدمة (الصفوف: 4)
// used in: app/api/admin/roles/*
// ============================================================
export const adminRoles = pgTable("admin_roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique("admin_roles_name_key"),
  permissions: text("permissions").default("[]"),
  color: text("color").default("bg-gray-100 text-gray-700"),
  usersCount: integer("users_count").default(0),
});

// ============================================================
// application_invites — دعوات التسجيل للمستقلين (الصفوف: 1)
// used in: app/api/admin/invites/*, app/api/apply/setup/[token]
// ============================================================
export const applicationInvites = pgTable("application_invites", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique("application_invites_token_key"),
  email: text("email"),
  note: text("note"),
  category: text("category"),
  usedByApplicationId: integer("used_by_application_id").references(() => freelancerApplications.id),
  usedAt: timestamp("used_at"),
  expiresAt: timestamp("expires_at"),
  createdById: integer("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================================
// audit_log — سجل العمليات الإدارية (الصفوف: 10)
// used in: app/api/admin/audit/*
// ============================================================
export const auditLog = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  userName: text("user_name"),
  action: text("action").notNull(),
  target: text("target").default(""),
  type: text("type").notNull().default("info"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================================
// banners — البانرات الإعلانية (الصفوف: 3)
// used in: app/api/admin/banners/*
// ============================================================
export const banners = pgTable("banners", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  position: text("position").default("home"),
  imageUrl: text("image_url").default(""),
  link: text("link").default(""),
  impressions: integer("impressions").default(0),
  clicks: integer("clicks").default(0),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================================
// blog_posts — مقالات المدونة (الصفوف: 4)
// used in: app/api/admin/blog/*
// ============================================================
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").default(""),
  author: text("author").default("فريق خدوم"),
  views: integer("views").default(0),
  status: text("status").notNull().default("draft"),
<<<<<<< HEAD
  slug: text("slug").default(""),
  excerpt: text("excerpt").default(""),
  coverImage: text("cover_image").default(""),
  metaTitle: text("meta_title").default(""),
  metaDescription: text("meta_description").default(""),
  metaKeywords: text("meta_keywords").default(""),
  ogImage: text("og_image").default(""),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
=======
  createdAt: timestamp("created_at").defaultNow(),
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
});

// ============================================================
// coupons — كوبونات الخصم (الصفوف: 6)
// used in: app/api/admin/coupons/*
// ============================================================
export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique("coupons_code_key"),
  discountType: text("discount_type").notNull().default("percent"),
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull().default("0"),
  usedCount: integer("used_count").default(0),
  maxUses: integer("max_uses").default(1000),
  expiresAt: date("expires_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================================
// email_templates — قوالب الإيميلات (الصفوف: 72 — أصل قيّم!)
// used in: app/api/admin/email-templates/*
// ============================================================
export const emailTemplates = pgTable("email_templates", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique("email_templates_slug_key"),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  blocks: jsonb("blocks").notNull().default(sql`'[]'::jsonb`),
  isActive: boolean("is_active").default(true),
  variables: jsonb("variables").default(sql`'[]'::jsonb`),
  updatedById: integer("updated_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============================================================
// email_verifications — رموز التحقق من البريد (الصفوف: 4)
// used in: app/api/apply/*
// ملاحظة: applicationId CASCADE مقصود — حذف التقديم يحذف رموز التحقق
// ملاحظة: token عليه UNIQUE + INDEX (مكرر — يُنظَّف في migration مستقبلية)
// ============================================================
export const emailVerifications = pgTable("email_verifications", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  applicationId: integer("application_id").references(() => freelancerApplications.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique("email_verifications_token_key"),
  used: boolean("used").default(false),
  revoked: boolean("revoked").default(false),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  tokenIdx: index("email_verifications_token_idx").on(t.token),
}));

// ============================================================
// mass_notifications — الإشعارات الجماعية (الصفوف: 3)
// used in: app/api/admin/mass-notifications/*
// ============================================================
export const massNotifications = pgTable("mass_notifications", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").default(""),
  target: text("target").default("all"),
  sentCount: integer("sent_count").default(0),
  sentAt: timestamp("sent_at").defaultNow(),
  channels: jsonb("channels").default(sql`'["inapp"]'::jsonb`),
  deliveredCount: integer("delivered_count").default(0),
  failedCount: integer("failed_count").default(0),
  openedCount: integer("opened_count").default(0),
});

// ============================================================
// newsletter_campaigns — حملات النشرة البريدية (الصفوف: 3)
// used in: app/api/admin/newsletter/*
// ============================================================
export const newsletterCampaigns = pgTable("newsletter_campaigns", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").default(""),
  target: text("target").default("all"),
  sentCount: integer("sent_count").default(0),
  openedCount: integer("opened_count").default(0),
  sentAt: timestamp("sent_at").defaultNow(),
});

// ============================================================
// newsletter_subscribers — مشتركو النشرة (الصفوف: 5)
// used in: app/api/admin/newsletter/*
// ============================================================
export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique("newsletter_subscribers_email_key"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================================
// pages — صفحات الموقع الثابتة (الصفوف: 5)
// used in: app/api/admin/pages/*
// ============================================================
export const pages = pgTable("pages", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique("pages_slug_key"),
  content: text("content").default(""),
  status: text("status").notNull().default("draft"),
<<<<<<< HEAD
  excerpt: text("excerpt").default(""),
  coverImage: text("cover_image").default(""),
  metaTitle: text("meta_title").default(""),
  metaDescription: text("meta_description").default(""),
  metaKeywords: text("meta_keywords").default(""),
  ogImage: text("og_image").default(""),
=======
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============================================================
// payment_gateways — بوابات الدفع المتاحة (الصفوف: 4)
// used in: app/api/admin/payment-gateways/*
// ملاحظة: config مخزّن text وليس jsonb — يُحوَّل في migration لاحقة
// ============================================================
export const paymentGateways = pgTable("payment_gateways", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  provider: text("provider").default(""),
  isActive: boolean("is_active").default(true),
  txCount: integer("tx_count").default(0),
  config: text("config").default("{}"),
});

// ============================================================
// payment_link_clicks — تتبع نقرات روابط الدفع (الصفوف: 0)
// used in: app/api/payments/track, app/api/admin/payment-logs
// ============================================================
export const paymentLinkClicks = pgTable("payment_link_clicks", {
  id: serial("id").primaryKey(),
  transactionId: text("transaction_id"),
  userId: integer("user_id"),
  gateway: text("gateway"),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  currency: text("currency"),
  targetUrl: text("target_url"),
  ip: text("ip"),
  userAgent: text("user_agent"),
  clickedAt: timestamp("clicked_at").notNull().defaultNow(),
  paidAt: timestamp("paid_at"),
  paymentStatus: text("payment_status").default("pending"),
});

// ============================================================
// phone_otps — رموز OTP للتحقق من الهاتف (الصفوف: 9)
// used in: app/api/apply/whatsapp/*
// ============================================================
export const phoneOtps = pgTable("phone_otps", {
  id: serial("id").primaryKey(),
  phone: text("phone").notNull(),
  code: text("code").notNull(),
  attempts: integer("attempts").default(0),
  verified: boolean("verified").default(false),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  phoneIdx: index("phone_otps_phone_idx").on(t.phone),
}));

// ============================================================
// settings — إعدادات النظام (الصفوف: 30 — حرج جداً!)
// used in: app/api/admin/settings/*
// ملاحظة: مفتاح مركّب (ns, key) بدون عمود id
// ملاحظة: value مخزّن text وليس jsonb — يُحوَّل في migration لاحقة
// ============================================================
export const settings = pgTable("settings", {
  ns: text("ns").notNull(),
  key: text("key").notNull(),
  value: text("value"),
}, (t) => ({
  pk: primaryKey({ columns: [t.ns, t.key] }),
}));

// ============================================================
// subscription_plans — باقات الاشتراك (الصفوف: 3)
// used in: app/api/admin/plans/*, app/api/public/plans
// ملاحظة: features مخزّن text وليس jsonb — يُحوَّل في migration لاحقة
// ============================================================
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).default("0"),
  features: text("features").default("[]"),
  usersCount: integer("users_count").default(0),
  isPopular: boolean("is_popular").default(false),
  sortOrder: integer("sort_order").default(0),
});

// ============================================================
// M7: conversations — محادثات الوساطة بين العميل والمستقل
// ============================================================
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  publicCode: text("public_code").notNull().unique("conversations_public_code_key"),
  orderId: integer("order_id").references(() => orders.id),
  clientId: integer("client_id").notNull().references(() => users.id),
  freelancerId: integer("freelancer_id").notNull().references(() => users.id),
  adminId: integer("admin_id").references(() => users.id),
  status: conversationStatusEnum("status").notNull().default("active"),
  subject: text("subject"),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  lastMessageBy: conversationPartyEnum("last_message_by"),
  unreadByClient: integer("unread_by_client").notNull().default(0),
  unreadByFreelancer: integer("unread_by_freelancer").notNull().default(0),
  unreadByAdmin: integer("unread_by_admin").notNull().default(0),
<<<<<<< HEAD
  channel: text("channel").notNull().default("inapp"),
=======
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
  closedAt: timestamp("closed_at"),
  closedReason: text("closed_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (t) => ({
  orderIdx: index("conversations_order_idx").on(t.orderId),
  clientIdx: index("conversations_client_idx").on(t.clientId),
  freelancerIdx: index("conversations_freelancer_idx").on(t.freelancerId),
  statusIdx: index("conversations_status_idx").on(t.status),
}));

// ============================================================
// M8: conversation_messages — رسائل داخل المحادثة (مرر عبر الوسيط)
// ============================================================
export const conversationMessages = pgTable("conversation_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  senderParty: conversationPartyEnum("sender_party").notNull(),
  senderId: integer("sender_id").references(() => users.id),
  messageType: messageTypeEnum("message_type").notNull().default("text"),
  bodyOriginal: text("body_original").notNull(),
  bodyRedacted: text("body_redacted"),
  mediaUrl: text("media_url"),
  hasLeak: boolean("has_leak").notNull().default(false),
  leakSeverity: leakSeverityEnum("leak_severity"),
  isBlocked: boolean("is_blocked").notNull().default(false),
  blockedReason: text("blocked_reason"),
  deliveredAt: timestamp("delivered_at"),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  convIdx: index("conv_messages_conv_idx").on(t.conversationId),
  senderIdx: index("conv_messages_sender_idx").on(t.senderId),
  createdIdx: index("conv_messages_created_idx").on(t.createdAt),
}));

// ============================================================
// M9: leak_attempts — محاولات تسريب معلومات تواصل
// ============================================================
export const leakAttempts = pgTable("leak_attempts", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversations.id, { onDelete: "cascade" }),
  messageId: integer("message_id").references(() => conversationMessages.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id),
  userParty: conversationPartyEnum("user_party").notNull(),
  detectedPatterns: jsonb("detected_patterns").notNull().default(sql`'[]'::jsonb`),
  severity: leakSeverityEnum("severity").notNull(),
  action: leakActionEnum("action").notNull(),
  detectedBy: text("detected_by").notNull().default("regex"),
  rawText: text("raw_text").notNull(),
  redactedText: text("redacted_text"),
  confidence: decimal("confidence", { precision: 4, scale: 3 }),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  reviewNote: text("review_note"),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  userIdx: index("leak_attempts_user_idx").on(t.userId),
  convIdx: index("leak_attempts_conv_idx").on(t.conversationId),
  severityIdx: index("leak_attempts_severity_idx").on(t.severity),
}));

// ============================================================
// M10: disputes — نزاعات بين الأطراف
// ============================================================
export const disputes = pgTable("disputes", {
  id: serial("id").primaryKey(),
  publicCode: text("public_code").notNull().unique("disputes_public_code_key"),
  orderId: integer("order_id").references(() => orders.id),
  conversationId: integer("conversation_id").references(() => conversations.id),
  raisedBy: integer("raised_by").notNull().references(() => users.id),
  raisedByParty: conversationPartyEnum("raised_by_party").notNull(),
  againstUserId: integer("against_user_id").notNull().references(() => users.id),
  category: text("category").notNull(),
  reason: text("reason").notNull(),
  evidence: jsonb("evidence").default(sql`'[]'::jsonb`),
  status: disputeStatusEnum("status").notNull().default("open"),
  priority: text("priority").notNull().default("normal"),
  assignedTo: integer("assigned_to").references(() => users.id),
  resolution: text("resolution"),
  resolvedBy: integer("resolved_by").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  refundIssued: boolean("refund_issued").notNull().default(false),
  refundAmount: decimal("refund_amount", { precision: 10, scale: 2 }),
  detectedBy: text("detected_by"),
  autoDetected: boolean("auto_detected").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (t) => ({
  orderIdx: index("disputes_order_idx").on(t.orderId),
  statusIdx: index("disputes_status_idx").on(t.status),
}));

// ============================================================
// M11: admin_interventions — تدخلات الأدمن في المحادثات
// ============================================================
export const adminInterventions = pgTable("admin_interventions", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversations.id, { onDelete: "cascade" }),
  orderId: integer("order_id").references(() => orders.id),
  disputeId: integer("dispute_id").references(() => disputes.id),
  adminId: integer("admin_id").notNull().references(() => users.id),
  type: interventionTypeEnum("type").notNull(),
  targetUserId: integer("target_user_id").references(() => users.id),
  reason: text("reason").notNull(),
  details: jsonb("details").default(sql`'{}'::jsonb`),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  outcome: text("outcome"),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  adminIdx: index("admin_interventions_admin_idx").on(t.adminId),
  convIdx: index("admin_interventions_conv_idx").on(t.conversationId),
}));

// ============================================================
// M12: quick_replies — ردود سريعة جاهزة للأدمن
// ============================================================
export const quickReplies = pgTable("quick_replies", {
  id: serial("id").primaryKey(),
  shortcode: text("shortcode").notNull().unique("quick_replies_shortcode_key"),
  title: text("title").notNull(),
  body: text("body").notNull(),
  category: text("category").default("general"),
  variables: jsonb("variables").default(sql`'[]'::jsonb`),
  usageCount: integer("usage_count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdById: integer("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============================================================
// M13: response_tracking — تتبع زمن الاستجابة (SLA)
// ============================================================
export const responseTracking = pgTable("response_tracking", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id),
  party: conversationPartyEnum("party").notNull(),
  inboundMessageId: integer("inbound_message_id").references(() => conversationMessages.id),
  outboundMessageId: integer("outbound_message_id").references(() => conversationMessages.id),
  inboundAt: timestamp("inbound_at").notNull(),
  outboundAt: timestamp("outbound_at"),
  responseSeconds: integer("response_seconds"),
  slaBreached: boolean("sla_breached").notNull().default(false),
  slaThresholdSeconds: integer("sla_threshold_seconds").notNull().default(3600),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  userIdx: index("response_tracking_user_idx").on(t.userId),
  convIdx: index("response_tracking_conv_idx").on(t.conversationId),
}));

// ============================================================
// WhatsApp Agent — جلسات المحادثات الواردة من واتساب
// ============================================================
export const whatsappSessions = pgTable("whatsapp_sessions", {
  id: serial("id").primaryKey(),
  phone: text("phone").notNull().unique("whatsapp_sessions_phone_key"),
  stage: text("stage").notNull().default("intake"),
  projectId: integer("project_id").references(() => orders.id),
  context: jsonb("context").notNull().default(sql`'{}'::jsonb`),
  summary: text("summary"),
  messageCount: integer("message_count").notNull().default(0),
  lastActivity: timestamp("last_activity").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  phoneIdx: index("whatsapp_sessions_phone_idx").on(t.phone),
  lastActivityIdx: index("whatsapp_sessions_last_activity_idx").on(t.lastActivity),
}));

// ============================================================
// WhatsApp Agent — أرشيف رسائل واتساب الواردة والصادرة
// ============================================================
export const whatsappMessages = pgTable("whatsapp_messages", {
  id: serial("id").primaryKey(),
  phone: text("phone").notNull(),
  direction: text("direction").notNull(), // 'in' | 'out'
  body: text("body").notNull(),
  waMessageId: text("wa_message_id").unique("whatsapp_messages_wa_message_id_key"),
  role: text("role").notNull().default("user"), // user | assistant | tool | system
  toolCallId: text("tool_call_id"),
  toolName: text("tool_name"),
  metadata: jsonb("metadata").default(sql`'{}'::jsonb`),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  phoneIdx: index("whatsapp_messages_phone_idx").on(t.phone),
  createdIdx: index("whatsapp_messages_created_idx").on(t.createdAt),
}));

// ============================================================
// WhatsApp Agent — تصعيدات للمشرف
// ============================================================
export const escalations = pgTable("escalations", {
  id: serial("id").primaryKey(),
  phone: text("phone").notNull(),
  reason: text("reason").notNull(),
  priority: text("priority").notNull().default("normal"), // low | normal | high | urgent
  summary: text("summary").notNull(),
  conversationSnapshot: jsonb("conversation_snapshot").default(sql`'[]'::jsonb`),
  status: text("status").notNull().default("new"), // new | in_progress | resolved
  assignedTo: integer("assigned_to").references(() => users.id),
  resolutionNote: text("resolution_note"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  statusIdx: index("escalations_status_idx").on(t.status),
  phoneIdx: index("escalations_phone_idx").on(t.phone),
}));

// ============================================================
// Task #17: WhatsApp inbound job queue — معالجة موثوقة في الخلفية
// كل رسالة واردة من Meta تُسجَّل كصف هنا، ثم يلتقطها العامل
// (`lib/whatsapp/queue.ts`) بقفل صفّي (`FOR UPDATE SKIP LOCKED`)،
// مع retry تلقائي ومحاولات قصوى وتاريخ كامل لكل محاولة.
// ============================================================
export const whatsappJobs = pgTable("whatsapp_jobs", {
  id: serial("id").primaryKey(),
  phone: text("phone").notNull(),
  text: text("text").notNull(),
  waMessageId: text("wa_message_id"),
  status: text("status").notNull().default("pending"), // pending | processing | done | failed
  attempts: integer("attempts").notNull().default(0),
  maxAttempts: integer("max_attempts").notNull().default(5),
  lastError: text("last_error"),
  scheduledAt: timestamp("scheduled_at").notNull().defaultNow(),
  lockedUntil: timestamp("locked_until"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
}, (t) => ({
  // Partial unique index — required by `enqueueInbound`'s
  // `ON CONFLICT (wa_message_id) WHERE wa_message_id IS NOT NULL` for
  // idempotent enqueue. Mirrors drizzle/0002_task17_whatsapp_jobs.sql so
  // `db:push` workflows don't drift away from the migration.
  waMessageIdKey: uniqueIndex("whatsapp_jobs_wa_message_id_key")
    .on(t.waMessageId)
    .where(sql`${t.waMessageId} IS NOT NULL`),
  runnableIdx: index("whatsapp_jobs_runnable_idx").on(t.status, t.scheduledAt),
  phoneIdx: index("whatsapp_jobs_phone_idx").on(t.phone),
  createdIdx: index("whatsapp_jobs_created_idx").on(t.createdAt),
}));

// ============================================================
// M14: cache_store — بديل Redis (cache + advisory locks)
// ============================================================
export const cacheStore = pgTable("cache_store", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (t) => ({
  expiresIdx: index("cache_store_expires_idx").on(t.expiresAt),
}));

export const offerRejectionReasons = pgTable("offer_rejection_reasons", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id),
  freelancerPhone: text("freelancer_phone").notNull(),
  freelancerId: integer("freelancer_id").references(() => users.id),
  reasonCode: text("reason_code").notNull(),
  rawText: text("raw_text"),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  freelancerIdx: index("offer_rejection_reasons_freelancer_idx").on(t.freelancerPhone),
  orderIdx: index("offer_rejection_reasons_order_idx").on(t.orderId),
}));
