import bcrypt from "bcryptjs";
import { db } from "../lib/db";
import { users } from "../lib/schema";
import { eq } from "drizzle-orm";

async function run() {
  const newPassword = "Admin@2026";
  const passwordHash = await bcrypt.hash(newPassword, 10);

  const updated = await db
    .update(users)
    .set({ passwordHash })
    .where(eq(users.role, "admin"))
    .returning({ id: users.id, email: users.email, username: users.username });

  if (updated.length === 0) {
    console.log("No admin users found.");
  } else {
    console.log(`✅ Password reset for ${updated.length} admin user(s):`);
    for (const u of updated) {
      console.log(`  - ${u.email} (username: ${u.username ?? "N/A"}, id: ${u.id})`);
    }
    console.log(`\nNew password: ${newPassword}`);
  }

  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
