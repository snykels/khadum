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

export async function GET(req: NextRequest) {
  const s = await getSession();
  if (s.role !== "admin" && s.role !== "supervisor") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  await ensureTable();
  const url = new URL(req.url);
  const status = url.searchParams.get("status") || "pending";
  const rows: any = await db.execute(sql`
    SELECT fc.id, fc.title, fc.issuer, fc.certificate_url AS "certificateUrl",
           fc.description, fc.status, fc.rejection_reason AS "rejectionReason",
           fc.created_at AS "createdAt", fc.reviewed_at AS "reviewedAt",
           u.name AS "freelancerName", u.email AS "freelancerEmail", u.id AS "freelancerId"
    FROM freelancer_certificates fc
    JOIN users u ON u.id = fc.freelancer_id
    WHERE (${status} = 'all' OR fc.status = ${status})
    ORDER BY fc.created_at DESC
    LIMIT 200
  `);
  return NextResponse.json({ certificates: rows as any[] });
}

export async function PATCH(req: NextRequest) {
  const s = await getSession();
  if (s.role !== "admin" && s.role !== "supervisor") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  await ensureTable();
  const body = await req.json().catch(() => ({}));
  const { id, status, rejectionReason } = body;
  if (!id || !["approved", "rejected"].includes(status)) {
    return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
  }
  const [cert]: any = await db.execute(sql`
    UPDATE freelancer_certificates
    SET status = ${status},
        rejection_reason = ${rejectionReason || null},
        reviewed_by = ${s.userId},
        reviewed_at = NOW()
    WHERE id = ${id}
    RETURNING freelancer_id AS "freelancerId", title
  `);
  if (!cert) return NextResponse.json({ error: "لم يتم العثور على الشهادة" }, { status: 404 });
  // notify freelancer
  const notifTitle = status === "approved" ? "تمت الموافقة على شهادتك" : "تم رفض شهادتك";
  const notifMsg = status === "approved"
    ? `تمت الموافقة على شهادتك "${cert.title}" وستظهر في ملفك الشخصي`
    : `تم رفض شهادتك "${cert.title}"${rejectionReason ? ` — السبب: ${rejectionReason}` : ""}`;
  await db.execute(sql`
    INSERT INTO notifications (user_id, type, title, message, channel, priority, link)
    VALUES (${cert.freelancerId}, 'system', ${notifTitle}, ${notifMsg}, 'in_app', 'high', '/freelancer/skills')
  `).catch(() => {});
  return NextResponse.json({ ok: true });
}
