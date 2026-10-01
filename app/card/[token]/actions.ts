"use server";

import { revalidatePath } from "next/cache";
import { friendCard, getFriendByToken, requestRedemption } from "@/lib/friends";
import { notifyOwner } from "@/lib/email";

export type RedeemState = { ok: true; title: string } | { ok: false; message: string } | null;

export async function redeem(_prev: RedeemState, formData: FormData): Promise<RedeemState> {
  const token = String(formData.get("token") ?? "");
  const couponIndex = Number(formData.get("couponIndex"));
  const itemId = Number(formData.get("item"));
  const friend = await getFriendByToken(token);
  if (!friend) return { ok: false, message: "找不到這張卡" };
  const card = await friendCard(friend.id);
  const coupon = card.coupons.find((c) => c.index === couponIndex);
  if (!coupon || coupon.redemption) return { ok: false, message: "這張券不能用了" };
  const item = card.items.find((i) => i.id === itemId);
  if (!item) return { ok: false, message: "選一個要換的" };
  const row = await requestRedemption(friend.id, couponIndex, item.id);
  if (!row) return { ok: false, message: "這張券剛剛已經用掉了" };
  await notifyOwner({
    subject: `${friend.name} 想換「${item.title}」`,
    text: [`${friend.name} 用第 ${couponIndex * 3 + 1}–${(couponIndex + 1) * 3} 章的券想換：${item.title}`, "", `後台：${process.env.SITE_URL ?? ""}/admin/friends/${friend.id}`].join("\n"),
  });
  revalidatePath(`/card/${token}`);
  revalidatePath("/admin");
  return { ok: true, title: item.title };
}
