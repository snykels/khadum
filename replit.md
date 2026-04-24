# Khadom.app — Arabic Freelance Marketplace

## Overview
خدوم — منصة الخدمات السعودية الأولى عبر واتساب. تربط العملاء السعوديين بمستقلين محترفين. كل شيء يحدث داخل واتساب.
Domain: khadum.app | WhatsApp: +966511809878 | Email: help@khadum.app

## Product Vision (Owner's pitch — keep front of mind)
**خدوم** is a marketplace that connects clients with the right freelancer — **everything happens inside WhatsApp directly**.

**How it works:**
1. Client sends a WhatsApp message describing what they need (e.g. "أبغى تصميم شعار").
2. The bot understands the request, picks the top 3 matching freelancers, and forwards the request to them.
3. The first freelancer to accept starts chatting with the client.
4. After they agree, the client pays inside the chat.
5. Freelancer delivers the work; payment is then released automatically.

**Why WhatsApp instead of a website/app?** 98% of Saudis open WhatsApp daily — no app to install, no password to remember. The service comes to the user, not the other way around.

**Why better than Khamsat / Mostaql?** On traditional platforms the client has to open the site, search, read offers, negotiate, then pay — many steps. On Khadom they write the request in colloquial Arabic and that's it.

**Available services:** design, video & editing, writing & translation, digital marketing, programming, admin work, and 100+ micro-services.

**Trust & safety:** Payment is **escrowed** at checkout and only released to the freelancer after the client confirms delivery. If something goes wrong, the platform steps in.

**Implication for this codebase:** the website (landing, dashboards) is a *companion* surface. The real product flow lives in the WhatsApp bot — the planned `/api/whatsapp/webhook`, conversation state machine, AI matcher, and escrow payment integration. The web app's job is onboarding (apply as freelancer, browse services), admin moderation, and dashboards — not the primary order flow.

## WhatsApp AI Agent
The bot lives in:
- `app/api/whatsapp/webhook/route.ts` — Meta Cloud API webhook (GET verify + POST inbound, HMAC-SHA256 signature check via `WHATSAPP_APP_SECRET`). Inbound messages are durably enqueued into `whatsapp_jobs` BEFORE 200 is returned, then the queue is drained via `after()` (see Task #17).
- `lib/whatsapp/queue.ts` — durable job queue + worker. Atomic claim with `FOR UPDATE SKIP LOCKED`, exponential backoff retry (5s → 10m cap), `max_attempts=5` then `failed`. `drainQueue()` is called from the webhook (`after()`) and from the cron safety net.
- `app/api/cron/whatsapp-worker/route.ts` — cron safety net (every minute). Same auth as `/api/cron/cleanup` (Bearer `CRON_SECRET` or admin/supervisor session). Picks up any job whose `after()` drain was killed mid-flight.
- `lib/whatsapp/client.ts` — Meta Cloud API client (text, typing indicator/read receipt, utility templates).
- `lib/whatsapp/session.ts` — per-phone session in `whatsapp_sessions` (24h TTL).
- `lib/whatsapp/sender.ts` — human-like delay (3–8s scaled to length) + typing indicator. Throws on Meta failures (3 retries with backoff) so the queue records the error and retries the whole job.
- `lib/whatsapp/orchestrator.ts` — full inbound→AI→outbound flow with sentiment auto-escalation. Idempotent on `wa_message_id` via `whatsapp_messages`.
- `lib/ai/sentiment.ts` — GPT-4o-mini classifier returning `{emotion, score, action}`.
- `lib/ai/agent.ts` — GPT-4o-mini with function-calling tool loop (max 6 turns, history of 10, auto-summary at 10 messages).
- `lib/ai/tools/index.ts` — five tools: `search_freelancers`, `create_payment_link`, `get_order_status`, `escalate_to_admin`, `get_service_pricing`.
- `app/api/admin/escalations/*` + `src/app/components/admin/EscalationsPage.tsx` — admin queue at `/admin/escalations`.

New tables: `whatsapp_sessions`, `whatsapp_messages`, `escalations`, `whatsapp_jobs` (Task #17 reliable background queue).
Required env: `OPENAI_API_KEY`, `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID`, `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET` (signature check is bypassed only when `NODE_ENV !== 'production'` and the secret is missing).

## Tech Stack
- **Framework**: Next.js 15.3.3 (App Router)
- **React**: 18.3.1
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`)
- **Database**: PostgreSQL via Replit's built-in DB
- **ORM**: Drizzle ORM 0.44.2 with `postgres.js` 3.4.7
- **Icons**: lucide-react
- **Animations**: Framer Motion (`motion/react`), tw-animate-css
- **Language**: Arabic (RTL layout, Tajawal font)

## Architecture

### Directory Structure
```
app/                      # Next.js App Router pages
  layout.tsx              # Root layout (RTL, font, theme)
  page.tsx                # Landing page
  globals.css             # Tailwind v4 CSS + design tokens
  apply/page.tsx          # Freelancer application multi-step form
  freelancer/[[...slug]]/page.tsx  # Freelancer dashboard
  admin/[[...slug]]/page.tsx       # Admin dashboard
  how-to-order/page.tsx           # كيف تطلب خدمة — step-by-step guide
  refund-policy/page.tsx          # ضمان استرداد الأموال
  payment-methods/page.tsx        # طرق الدفع (Mada, Visa, STC Pay, Tabby, Tamara…)
  community-guidelines/page.tsx   # قواعد المجتمع
  terms/page.tsx                  # الشروط والأحكام
  privacy/page.tsx                # سياسة الخصوصية
  help/page.tsx                   # مركز المساعدة (categorized FAQ hub)
  forgot-password/page.tsx        # طلب إعادة تعيين كلمة المرور
  reset-password/page.tsx         # إعادة تعيين كلمة المرور (token-based)
  login/page.tsx                  # تسجيل الدخول (with forgot-password link)
  api/
    stats/route.ts        # Platform statistics
    freelancers/route.ts  # Freelancer data
    auth/
      forgot-password/route.ts    # Sends reset email via Resend
      reset-password/route.ts     # Validates token & updates password hash
    orders/route.ts       # Order management
    notifications/route.ts # Notifications
    realtime/route.ts     # SSE for real-time updates

src/app/                  # Original component library (migrated)
  components/
    admin/                # AdminDashboard, AdminSidebar, AdminPagesExtra
    freelancer/           # FreelancerDashboard, FreelancerSidebar, etc.
    landing/              # Hero, FAQ, HowItWorks, Pricing, etc.
    figma/                # ImageWithFallback
    ui/                   # Shared UI components (Button, Input, etc.)
  pages/                  # Page-level components
  context/                # ThemeContext (dark/light mode)

lib/
  db.ts                   # Drizzle DB client (postgres.js)
  schema.ts               # Database schema
```

### Database Schema (lib/schema.ts)
Tables: `users`, `services`, `orders`, `messages`, `notifications`, `wallets`, `withdrawals`, `reviews`, `categories`

`users` table includes a `passwordHash` column for authentication.

### Authentication
- Cookie-based sessions via `iron-session` (cookie name: `khadom_session`)
- Passwords hashed with `bcryptjs`
- Session secret stored as `SESSION_SECRET` env var (32+ chars)
- API routes:
  - `POST /api/auth/register` — name, email, password, phone?, role (client|freelancer)
  - `POST /api/auth/login` — email, password, rememberMe (bool)
  - `POST /api/auth/logout`
  - `GET  /api/auth/me` — returns current user or `{ user: null }`
- Helpers in `lib/auth.ts`: `getSession()`, `hashPassword()`, `verifyPassword()`
- Client hook: `src/hooks/useUser.ts` (`useUser()` → `{ user, loading, refresh, logout }`)
- `middleware.ts` protects `/admin` (admin only) and `/freelancer` (freelancer or admin); redirects unauthenticated users to `/login?from=…`
- Admin role can only be assigned via direct DB update (register endpoint only allows client/freelancer)
- Default seeded admins: `owner@khadum.app` / `Admin@2026` (and 3 others)

### Session Security
- **Remember Me**: if checked → 30-day persistent cookie; if unchecked → session cookie (expires on browser close)
- **Device fingerprint**: SHA-256 hash of User-Agent + IP prefix (first 3 octets) stored in session on login
- **Middleware validation**: every request to /admin or /freelancer re-checks UA hash + IP prefix; mismatch triggers session destroy + redirect to /login?reason=security
- **Saved account card**: on "Remember Me" login, name+email+avatarUrl saved to localStorage; next visit shows profile card for quick login
- Two session configs in `lib/session-options.ts`: `sessionOptions` (30d maxAge) and `sessionOptionsShort` (no maxAge)

### Password Policy (all users including admins)
- Minimum 8 characters, maximum 100
- Must contain: uppercase (A-Z), lowercase (a-z), digit (0-9)
- Enforced on: registration, password reset, change-password
- Frontend real-time feedback on reset-password page

### Key Routes
- `/` — Landing page (hero, categories, how-it-works, pricing, FAQ, CTA)
- `/apply` — Freelancer application (3-step form)
- `/freelancer` — Freelancer dashboard (sidebar navigation)
- `/admin` — Admin dashboard (full management sidebar)

## Configuration
- **Port**: 5000 (configured in workflow `npm run dev`)
- **Alias**: `@/*` → `./src/*`, `@/lib/*` → `./lib/*` (tsconfig.json)
- **Server external**: `postgres` package excluded from client bundle
- **PostCSS**: `@tailwindcss/postcss` handles Tailwind v4 processing
- **Drizzle**: config in `drizzle.config.ts`, push with `npm run db:push`

## RTL Support
- `html` element has `dir="rtl"` and `lang="ar"` in `app/layout.tsx`
- Tajawal Arabic font loaded via Google Fonts
- All components use RTL-aware Tailwind classes

## Brokerage System (WhatsApp-Mediated)
Khadom acts as a broker between client and freelancer. All communication flows through the platform's chat layer; direct contact attempts are detected and blocked. Built on PostgreSQL only (no Redis).

**Schema additions** (lib/schema.ts):
- 8 new tables: `conversations`, `conversation_messages`, `leak_attempts`, `disputes`, `admin_interventions`, `quick_replies`, `response_tracking`, `cache_store`
- 8 new enums (severity, leak_action, leak_detected_by, conversation_status, dispute_status/category, intervention_type, message_type, sender_party)
- `users` extended (11 cols): isBlocked, blockReason, leakAttemptsCount, supervisor role, etc. UNIQUE on phone
- `orders` extended: publicCode, paidAmount, refundedAmount, paymentStatus, acceptedAt/startedAt/completedAt/dueDate

**Core libraries**:
- `lib/leakDetector.ts` — regex + optional Claude hybrid (Saudi phones, emails, WhatsApp/Telegram links, Arabic obfuscation). Auto-blocks user after 3 attempts.
- `lib/disputeDetector.ts` — Arabic anger keywords → auto-creates dispute
- `lib/refundCalculator.ts` — tiered refund policy by order status/timing
- `lib/cache.ts` — Postgres `cache_store` table + `pg_advisory_lock` (Redis substitute)
- `lib/sse.ts` — in-memory pub/sub for live conversation updates
- `lib/phone.ts` — Saudi phone normalizer to 966XXXXXXXXX
- `lib/conversationCode.ts` — public codes (CV-..., DSP-...)

**API routes**:
- `app/api/conversations` (GET list, POST create)
- `app/api/conversations/[id]/messages` (GET history, POST send — runs leak+dispute pipeline)
- `app/api/conversations/[id]/stream` (SSE for live updates)
- `app/api/admin/{conversations,disputes,leak-attempts,interventions,quick-replies,refunds/calculate}`

**Admin UI**: `src/app/components/admin/AdminBrokerage.tsx` provides 5 pages wired into AdminDashboard at `/admin/{conversations,disputes,leak-attempts,interventions,quick-replies}`. Sidebar has new "نظام الوساطة" section.

**DB push**: Use `node scripts/push-auto.mjs` (writes `\n\r` to stdin every 800ms) — drizzle-kit's interactive truncation prompts ignore `--force`.

## Payment System (Tap Payments)

### Architecture
- **Gateway**: Tap Payments (tap.company) — مدى، فيزا/ماستركارد، Apple Pay، STC Pay، Google Pay
- **Mode**: Live (sk_live_... / pk_live_...)
- **Flow**: WhatsApp bot creates payment session → sends link to client → client pays at `/pay/[token]` → Tap redirects to `/pay/[token]/return` → webhook confirms at `/api/payments/webhook/tap`

### Environment Variables (Secrets)
- `Live_Secret_Key` — Tap live secret key (sk_live_...)
- `Live_Public_Key` — Tap live public key (pk_live_...)
- `Test_Secret_Key` — Tap test secret key (sk_test_...)
- `Test_Public_Key` — Tap test public key (pk_test_...)
- `TAP_WEBHOOK_SECRET` — (optional) dedicated webhook signing secret; falls back to Live_Secret_Key if not set
- `APP_BASE_URL` = https://khadum.app

### Key Files
- `lib/tap.ts` — Tap API client (createCharge, retrieveCharge, verifyWebhookSignature, getPublicKey, isLiveMode)
- `lib/paymentSession.ts` — payment_sessions + payment_events tables, session lifecycle
- `app/pay/[token]/page.tsx` + `PayClient.tsx` — customer-facing payment page
- `app/pay/[token]/return/page.tsx` — post-payment return page (links to WhatsApp +966511809878)
- `app/api/payments/webhook/tap/route.ts` — webhook handler (dual verification: hashstring + retrieveCharge)
- `app/api/payments/sessions/route.ts` — create payment session (requires INTERNAL_API_KEY)
- `app/api/payments/[token]/route.ts` — initiate charge via Tap, return redirectUrl

### Webhook Security
Two-layer: (1) HMAC-SHA256 hashstring verification using Live_Secret_Key if header present, (2) always re-fetches charge from Tap API to confirm status. No separate webhook secret needed — Tap uses same key as API.

### Tap Dashboard Setup Required
Add webhook URL in Tap dashboard → Settings → Webhooks:
`https://khadum.app/api/payments/webhook/tap`

### Analytics
- `app/api/admin/overview/route.ts` — supports period filtering: today/7d/30d/90d/all
- `src/app/components/admin/AdminAnalytics.tsx` — analytics dashboard with revenue, orders, top categories/freelancers

## Component Migration Notes
All components from the original React/Vite project needed:
1. `'use client'` directive for hooks/interactivity
2. `Link` from `next/link` (replacing react-router `Link`)
3. `usePathname` from `next/navigation` (replacing `useLocation`)
4. `href=` prop (replacing react-router `to=` prop)
## Block Editor (Editor.js) — Task #35
Notion-style block editor for Pages, Blog posts, and Landing page content.

### Packages
- `@editorjs/editorjs`, `@editorjs/header`, `@editorjs/list`, `@editorjs/checklist`, `@editorjs/inline-code`, `@editorjs/image`
- `@calumk/editorjs-columns` (multi-column layouts)
- `editorjs-drag-drop`, `editorjs-undo`

### Unified Editor Routes
Same `EditorPageClient` powers all three content surfaces via `TYPE_CONFIG`:
- `/admin/editor/page/[id]` — multi-record pages (slug, status, SEO)
- `/admin/editor/blog/[id]` — multi-record blog posts (author, slug, SEO)
- `/admin/editor/landing/main` — singleton landing content (no title/slug/SEO; PUT to `/api/admin/landing-content`)

`hideMeta + singleton` flags drive UI differences (hide title/tabs/sidebar; PUT instead of POST/PATCH).

### Key Files
- `src/app/components/admin/BlockEditor.tsx` — Editor.js wrapper with right-click context menu, drag-drop, undo/redo, image upload via `/api/admin/upload`, columns tool wired with shared sub-tools
- `src/app/components/admin/block-editor.css` — Dark theme + RTL overrides
- `lib/editor-blocks/FAQBlock.ts` — Custom FAQ block tool (question/answer)
- `lib/blocks/webKhadom.tsx` — `renderEditorJsBlocks` (with `EjsColumns` recursive renderer), `extractFaqJsonLd`, `isEditorJsContent` for public rendering
- `app/admin/editor/[type]/[id]/EditorPageClient.tsx` — Mode toggle (blocks/richtext) with auto-detection; supports `landing` singleton type
- `src/app/components/admin/AdminPagesExtra.tsx` — `LandingSettingsPage` "محتوى الصفحة" tab now links to `/admin/editor/landing/main` (no embedded editor)
- `app/api/admin/landing-content/route.ts` — admin GET/PUT (settings table: `landing_content`/`blocks_json`)
- `app/api/public/landing-content/route.ts` — public GET (no auth) for landing content
- `app/components/LandingExtraContent.tsx` — async server component that reads landing content from DB and renders below LandingPage; emits FAQ JSON-LD
- `app/page.tsx` — renders `<LandingPage />` then `<LandingExtraContent />`
- `src/types/editor-modules.d.ts` — Type declarations for untyped Editor.js plugins

### Format
EditorJS content: `{ time, blocks: [{id, type, data}], version }`. Distinguished from old WebBlocks (type starts with `w_`) via `isEditorJsContent()` — empty `{ blocks: [] }` is treated as Editor.js. Public pages auto-detect format and render accordingly. FAQ blocks emit JSON-LD schema for SEO (including FAQs nested inside columns — `extractFaqJsonLd` recurses through `columns.cols[].blocks`). Columns blocks have `data.cols: [{ blocks: [...] }, ...]` rendered as a CSS grid.

### Legacy `w_*` Site Builder content
Pages/blog records that still hold legacy Site Builder JSON (block types prefixed `w_*`) are detected by `detectEditorMode` and opened in **read-only legacy mode** in the unified editor. The page shows an amber banner explaining the situation, exposes the raw JSON in a collapsible `<details>`, and disables Save/Publish to prevent overwriting Site Builder data with editor output. Admins can opt in to migrate by clicking "ابدأ من جديد" which clears the content and switches to Editor.js mode. Public rendering of legacy `w_*` blocks is unchanged via `renderWebBlock`.

### Caching
`app/page.tsx` is marked `dynamic = "force-dynamic"` so landing edits made in `/admin/editor/landing/main` appear immediately on `/`. `/p/[slug]` and `/blog/[id]` are already dynamic.
