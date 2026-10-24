"use server";

import { requireAdmin } from "@/lib/auth/require";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db, rewardItems } from "@/lib/db";

export async function addReward(formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!title) return;
  const all = await db.query.rewardItems.findMany();
  await db.insert(rewardItems).values({ title, description, sort: all.length });
  revalidatePath("/admin/rewards");
}

export async function toggleReward(id: number, active: boolean) {
  await requireAdmin();
  await db.update(rewardItems).set({ active }).where(eq(rewardItems.id, id));
  revalidatePath("/admin/rewards");
}

export async function removeReward(id: number) {
  await requireAdmin();
  await db.delete(rewardItems).where(eq(rewardItems.id, id));
  revalidatePath("/admin/rewards");
}
