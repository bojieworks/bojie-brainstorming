import { headers } from "next/headers";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

/** Counts one hit for `key`; returns false once more than `limit` hits land inside `windowSec`. */
export async function hit(key: string, limit: number, windowSec: number) {
  const rows = await db.execute<{ count: number }>(sql`
    insert into rate_limits (key, window_start, count) values (${key}, now(), 1)
    on conflict (key) do update set
      count = case when rate_limits.window_start < now() - make_interval(secs => ${windowSec}) then 1 else rate_limits.count + 1 end,
      window_start = case when rate_limits.window_start < now() - make_interval(secs => ${windowSec}) then now() else rate_limits.window_start end
    returning count
  `);
  if (Math.random() < 0.02) await db.execute(sql`delete from rate_limits where window_start < now() - interval '1 day'`);
  return Number(rows[0]?.count ?? 0) <= limit;
}

export async function isLimited(key: string, limit: number, windowSec: number) {
  const rows = await db.execute<{ count: number }>(sql`
    select count from rate_limits where key = ${key} and window_start >= now() - make_interval(secs => ${windowSec})
  `);
  return Number(rows[0]?.count ?? 0) >= limit;
}
