import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL);

const blocks = [
  { id: "h1", type: "heading", text: "مرحباً {{name}}، تم استلام طلبك", level: 2, align: "right" },
  { id: "t1", type: "text", html: "شكراً لتقديمك على الانضمام إلى منصة <b>{{site_name}}</b>. لقد استلمنا طلبك وهو الآن قيد المراجعة من قبل فريق العمل.", align: "right" },
  { id: "t2", type: "text", html: "سنقوم بإعلامك عبر البريد الإلكتروني خلال أيام العمل القليلة القادمة بقرار قبول أو رفض طلبك. وفي حال القبول سنرسل لك رابطاً لإكمال إنشاء حسابك وتعيين كلمة المرور.", align: "right" },
  { id: "sp", type: "spacer", height: 20 },
  { id: "t3", type: "text", html: "<span style='color:#777;font-size:13px'>شكراً لصبرك،<br/>فريق {{site_name}}</span>", align: "right" },
];

const variables = ["name", "site_name", "email"];

await sql`
  INSERT INTO email_templates(slug, name, subject, blocks, variables, is_active)
  VALUES('apply_received', 'تم استلام طلب الانضمام', ${'تم استلام طلبك — {{site_name}}'}, ${JSON.stringify(blocks)}::jsonb, ${JSON.stringify(variables)}::jsonb, true)
  ON CONFLICT(slug) DO UPDATE SET subject=EXCLUDED.subject, blocks=EXCLUDED.blocks, variables=EXCLUDED.variables, updated_at=NOW()
`;

console.log("apply_received template seeded");
await sql.end();
