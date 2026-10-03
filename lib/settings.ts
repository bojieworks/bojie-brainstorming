import { eq } from "drizzle-orm";
import { db, settings } from "@/lib/db";

export const DEFAULT_ABOUT = `## 這是什麼
我常常有想做的事，但一個人提不起勁，或是不知道誰也想。這個網站就是把那些事攤開來放。

看到想一起的，按「我也想」。那不是報名，只是讓我知道你有興趣。我會用我們平常聊天的方式來找你，通常幾天內。

不用登入。名字預設只有我看得到，你可以選擇公開。改變心意隨時可以取消。

有些事會真的發生，有些會一直放著。放著的也沒關係。

## 集章怎麼玩
跟我一起把一件事做完，就會在你的集章卡上蓋一個章。章長得像那件事的 emoji，點進去可以回到當時的回顧。

長期的事，像每週固定的活動，不是每次都蓋，而是有里程碑的時候我手動蓋一個，例如連續來四週。

每集滿 3 章，解鎖一張「小傑券」。券可以換菜單上任何一項，例如請你一杯飲料、幫你一件一小時內做得完的事、或下一個企劃由你來指定。

章不會被扣掉，卡上永遠看得到你跟我一起做過的事。券不會過期。

## 集章卡在哪
集章卡是一條只有你知道的連結，我會私下用 LINE 丟給你。存起來，之後你按「我也想」的時候系統就知道是你，不用再填名字。

沒有排行榜，也不會公開誰有幾章。這只是我們之間的事。`;

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

export type AboutBlock = { type: "heading"; text: string } | { type: "paragraph"; text: string };

export function parseAbout(raw: string): AboutBlock[] {
  return raw
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((b) => (b.startsWith("## ") ? { type: "heading", text: b.slice(3).trim() } : { type: "paragraph", text: b }));
}
