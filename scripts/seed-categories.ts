import { db } from "../lib/db";
import { categories, subcategories } from "../lib/schema";
import { eq } from "drizzle-orm";
import seedData from "../lib/seed-categories.json" assert { type: "json" };

type SeedItem = { order: number; name: string; subs: string[] };

async function main() {
  const data = seedData as SeedItem[];
  console.log(`Seeding ${data.length} categories...`);

  for (const item of data) {
    const existing = await db
      .select()
      .from(categories)
      .where(eq(categories.nameAr, item.name))
      .limit(1);

    let categoryId: number;
    if (existing.length > 0) {
      categoryId = existing[0].id;
      console.log(`  ✓ Category exists: ${item.name} (id=${categoryId})`);
    } else {
      const [created] = await db
        .insert(categories)
        .values({ nameAr: item.name, sortOrder: item.order })
        .returning({ id: categories.id });
      categoryId = created.id;
      console.log(`  + Created category: ${item.name} (id=${categoryId})`);
    }

    let subOrder = 0;
    for (const subName of item.subs) {
      const existingSubs = await db
        .select()
        .from(subcategories)
        .where(eq(subcategories.categoryId, categoryId));
      const has = existingSubs.find((s) => s.nameAr === subName);
      if (!has) {
        await db
          .insert(subcategories)
          .values({ categoryId, nameAr: subName, sortOrder: subOrder });
      }
      subOrder++;
    }
  }
  console.log("Done.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
