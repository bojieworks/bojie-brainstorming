import { eq } from "drizzle-orm";
import { db, settings } from "@/lib/db";

export const DEFAULT_ABOUT = `## 這裡是什麼
我腦中一直有一堆想做的事，但一個人很容易拖著不做。所以我把它們全部攤在這裡。

看到有興趣的，按「我也想」。不用登入、不算報名，只是舉個手。我會自己來找你。

## 集章怎麼玩
[集章圖解]

## 集章卡在哪
我會私下丟一條連結給你，那就是你的卡。存起來，之後按「我也想」就不用再打名字。

沒有排行榜，不比誰多。這是我們之間的事。`;

export async function getSetting(key: string, fallback = "") {
  const row = await db.query.settings.findFirst({ where: eq(settings.key, key) });
  return row?.value?.trim() ? row.value : fallback;
}

export async function setSetting(key: string, value: string) {
  await db
    .insert(settings)
    .values({ key, value, updatedAt: new Date() })
    .onConflictDoUpdate({ target: settings.key, set: { value, updatedAt: new Date() } });
}

export type AboutBlock = { type: "heading"; text: string } | { type: "paragraph"; text: string } | { type: "howto" };

export const HOWTO_TOKEN = "[集章圖解]";

export function parseAbout(raw: string): AboutBlock[] {
  const blocks: AboutBlock[] = [];
  for (const chunk of raw.replace(/\r\n/g, "\n").split(/\n\s*\n/)) {
    let body = chunk.trim();
    if (!body) continue;
    if (body.startsWith("## ")) {
      const [first, ...rest] = body.split("\n");
      blocks.push({ type: "heading", text: first.slice(3).trim() });
      body = rest.join("\n").trim();
      if (!body) continue;
    }
    if (body === HOWTO_TOKEN) { blocks.push({ type: "howto" }); continue; }
    blocks.push({ type: "paragraph", text: body });
  }
  return blocks;
}
