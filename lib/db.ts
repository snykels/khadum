import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

<<<<<<< HEAD
const g = globalThis as unknown as { __pgClient?: postgres.Sql };

if (!g.__pgClient) {
  g.__pgClient = postgres(process.env.DATABASE_URL!, {
    prepare: false,
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    max_lifetime: 1800,
  });
}

export const db = drizzle(g.__pgClient, { schema });
=======
const connectionString = process.env.DATABASE_URL!;

const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });

>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
export type DB = typeof db;
