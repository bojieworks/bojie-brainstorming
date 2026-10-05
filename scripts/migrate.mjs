import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") {
  console.log(`skip migrations on Vercel ${process.env.VERCEL_ENV} build`);
  process.exit(0);
}

const url = process.env.DATABASE_URL;
if (!url) { console.error("DATABASE_URL is not set"); process.exit(1); }
const client = postgres(url, { max: 1 });
try {
  await migrate(drizzle(client), { migrationsFolder: "./drizzle" });
  console.log("migrations applied");
} finally {
  await client.end();
}
