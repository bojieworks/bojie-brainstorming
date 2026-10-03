import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type DB = ReturnType<typeof drizzle<typeof schema>>;
const g = globalThis as unknown as { idea_db?: DB };

function real(): DB {
  if (g.idea_db) return g.idea_db;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  g.idea_db = drizzle(postgres(url, { max: 5 }), { schema });
  return g.idea_db;
}

// Lazy proxy so importing this module never opens a connection (keeps `next build` env-free).
export const db = new Proxy({} as DB, {
  get(_t, prop) {
    const target = real() as unknown as Record<PropertyKey, unknown>;
    const v = target[prop];
    return typeof v === "function" ? (v as (...a: unknown[]) => unknown).bind(target) : v;
  },
});
export * from "./schema";
