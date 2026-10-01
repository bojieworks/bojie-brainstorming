"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db, rewardItems } from "@/lib/db";

export async function addReward(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!title) return;
  const all = await db.query.rewardItems.findMany();
  await db.insert(rewardItems).values({ title, description, sort: all.length });
  revalidatePath("/admin/rewards");
}

export async function toggleReward(id: number, active: boolean) {
  await db.update(rewardItems).set({ active }).where(eq(rewardItems.id, id));
  revalidatePath("/admin/rewards");
}

export async function removeReward(id: number) {
  await db.delete(rewardItems).where(eq(rewardItems.id, id));
  revalidatePath("/admin/rewards");
}

export async function seedRewards() {
  await db.insert(rewardItems).values([
    { title: "請你一杯飲料", description: "手搖、咖啡、啤酒都算", sort: 0 },
    { title: "幫你一件事", description: "一小時內做得完的那種", sort: 1 },
    { title: "下一個企劃你來指定", description: "你說想做什麼，小傑負責揪", sort: 2 },
  ]);
  revalidatePath("/admin/rewards");
}
