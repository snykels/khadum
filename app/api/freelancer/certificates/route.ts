import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

async function ensureTable() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS freelancer_certificates (
      id SERIAL PRIMARY KEY,
      freelancer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(200) NOT NULL,
      issuer VARCHAR(200) NOT NULL,
      certificate_url TEXT,
      description TEXT,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      rejection_reason TEXT,
      reviewed_by INTEGER REFERENCES users(id),
      reviewed_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
}

export async function GET() {
  const s = await getSession();
  if (!s?.userId) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  await ensureTable();
  const rows: any = await db.execute(sql`
    SELECT id, title, issuer, certificate_url AS "certificateUrl",
           description, status, rejection_reason AS "rejectionReason",
           created_at AS "createdAt", reviewed_at AS "reviewedAt"
    FROM freelancer_certificates
    WHERE freelancer_id = ${s.userId}
    ORDER BY created_at DESC
  `);
  return NextResponse.json({ certificates: rows as any[] });
}

export async function POST(req: NextRequest) {
  const s = await getSession();
  if (!s?.userId) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  await ensureTable();
  const body = await req.json().catch(() => ({}));
  const { title, issuer, certificateUrl, description } = body;
  if (!title?.trim() || !issuer?.trim()) {
    return NextResponse.json({ error: "اسم الشهادة والجهة المانحة مطلوبان" }, { status: 400 });
  }
  const [row]: any = await db.execute(sql`
    INSERT INTO freelancer_certificates (freelancer_id, title, issuer, certificate_url, description)
    VALUES (${s.userId}, ${title.trim()}, ${issuer.trim()}, ${certificateUrl?.trim() || null}, ${description?.trim() || null})
    RETURNING id, title, issuer, status, created_at AS "createdAt"
  `);
  // notify admins
  await db.execute(sql`
    INSERT INTO notifications (user_id, type, title, message, channel, priority)
    SELECT u.id, 'system',
           'شهادة جديدة للمراجعة',
           ${'طلب مستقل إضافة شهادة: ' + title.trim()},
           'in_app', 'high'
    FROM users u WHERE u.role = 'admin' LIMIT 5
  `).catch(() => {});
  return NextResponse.json(row);
}
