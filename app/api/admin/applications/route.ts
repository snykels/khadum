import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { freelancerApplications } from "@/lib/schema";
import { desc } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const applications = await db.select({
      id: freelancerApplications.id,
      name: freelancerApplications.name,
      email: freelancerApplications.email,
      phone: freelancerApplications.phone,
      phoneCountryCode: freelancerApplications.phoneCountryCode,
      country: freelancerApplications.country,
      city: freelancerApplications.city,
      gender: freelancerApplications.gender,
      dateOfBirth: freelancerApplications.dateOfBirth,
      mainCategory: freelancerApplications.mainCategory,
      subCategory: freelancerApplications.subCategory,
      yearsExperience: freelancerApplications.yearsExperience,
      skills: freelancerApplications.skills,
      bio: freelancerApplications.bio,
      portfolioUrl: freelancerApplications.portfolioUrl,
      linkedinUrl: freelancerApplications.linkedinUrl,
      nationalIdImage: freelancerApplications.nationalIdImage,
      nationalIdFrontImage: freelancerApplications.nationalIdFrontImage,
      nationalIdBackImage: freelancerApplications.nationalIdBackImage,
      bankName: freelancerApplications.bankName,
      iban: freelancerApplications.iban,
      ibanDocument: freelancerApplications.ibanDocument,
      status: freelancerApplications.status,
      rejectionReason: freelancerApplications.rejectionReason,
      createdAt: freelancerApplications.createdAt,
    })
    .from(freelancerApplications)
    .orderBy(desc(freelancerApplications.createdAt));

    // Enrich approved rows with activation state and latest token info
    type Enrich = {
      activationStatus: "pending" | "active" | null;
      userId: number | null;
      // Pre-built activation URL (server-side) — admins copy this directly.
      // The raw token is intentionally not exposed in the list API.
      setupLink: string | null;
      tokenExpiresAt: string | null;
      tokenUsed: boolean;
      tokenRevoked: boolean;
      tokenExpired: boolean;
    };
    const baseUrl = (process.env.APP_BASE_URL || "https://khadum.app").replace(/\/$/, "");

    const ids = applications.filter(a => a.status === "approved").map(a => a.id);
    let enrichMap = new Map<number, Enrich>();
    if (ids.length) {
      const rows = (await db.execute(sql`
        SELECT
          fa.id AS app_id,
          u.id AS user_id,
          u.activation_status,
          (SELECT token FROM email_verifications WHERE application_id=fa.id ORDER BY created_at DESC LIMIT 1) AS latest_token,
          (SELECT expires_at FROM email_verifications WHERE application_id=fa.id ORDER BY created_at DESC LIMIT 1) AS token_expires_at,
          (SELECT used FROM email_verifications WHERE application_id=fa.id ORDER BY created_at DESC LIMIT 1) AS token_used,
          (SELECT COALESCE(revoked,false) FROM email_verifications WHERE application_id=fa.id ORDER BY created_at DESC LIMIT 1) AS token_revoked
        FROM freelancer_applications fa
        LEFT JOIN users u ON u.email = fa.email
        WHERE fa.id IN (${sql.join(ids.map(i => sql`${i}`), sql`, `)})
      `)) as Array<{ app_id: number; user_id: number | null; activation_status: string | null; latest_token: string | null; token_expires_at: string | null; token_used: boolean | null; token_revoked: boolean | null }>;
      for (const r of rows) {
        const exp = r.token_expires_at ? new Date(r.token_expires_at).getTime() : 0;
        const act: "pending" | "active" | null =
          r.activation_status === "pending" || r.activation_status === "active" ? r.activation_status : null;
        enrichMap.set(r.app_id, {
          activationStatus: act,
          userId: r.user_id,
          setupLink: r.latest_token ? `${baseUrl}/apply/setup/${r.latest_token}` : null,
          tokenExpiresAt: r.token_expires_at,
          tokenUsed: !!r.token_used,
          tokenRevoked: !!r.token_revoked,
          tokenExpired: exp ? exp < Date.now() : false,
        });
      }
    }

    const enriched = applications.map(a => {
      const e = enrichMap.get(a.id);
      return { ...a, ...(e || { activationStatus: null, userId: null, latestToken: null, tokenExpiresAt: null, tokenUsed: false, tokenRevoked: false, tokenExpired: false }) };
    });

    // Counts for sidebar/KPIs
    const counts = {
      pending: enriched.filter(a => a.status === "pending").length,
      approved_pending_activation: enriched.filter(a => a.status === "approved" && (a.activationStatus === "pending")).length,
      activated: enriched.filter(a => a.status === "approved" && a.activationStatus === "active").length,
      rejected: enriched.filter(a => a.status === "rejected").length,
      expired: enriched.filter(a => a.status === "approved" && a.activationStatus === "pending" && (a.tokenExpired || a.tokenRevoked)).length,
      total: enriched.length,
    };

    return NextResponse.json({ applications: enriched, counts });
  } catch (e) {
    console.error("applications GET error:", e);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
