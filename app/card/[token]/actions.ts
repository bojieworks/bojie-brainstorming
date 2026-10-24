"use server";

import { revalidatePath } from "next/cache";
import { friendCard, getFriendByToken, requestRedemption } from "@/lib/friends";
import { checkRedeem, couponRange } from "@/lib/coupons";
import { notifyOwner } from "@/lib/email";

export type RedeemState = { ok: true; title: string } | { ok: false; message: string } | null;

export async function redeem(_prev: RedeemState, formData: FormData): Promise<RedeemState> {
  const token = String(formData.get("token") ?? "");
  const couponIndex = Number(formData.get("couponIndex"));
  const itemId = Number(formData.get("item"));
  const friend = await getFriendByToken(token);
  if (!friend) return { ok: false, message: "找不到這張卡" };
  const card = await friendCard(friend.id);
  const redeemed = card.coupons.flatMap((c) => (c.redemption ? [c.index] : []));
  const check = checkRedeem(card.stamps.length, couponIndex, redeemed);
  if (!check.ok) return check;
  const item = card.items.find((i) => i.id === itemId);
  if (!item) return { ok: false, message: "選一個要換的" };
  // (friend_id, coupon_index) 有唯一索引，同時送兩次只會有一筆成功
  const row = await requestRedemption(friend.id, couponIndex, item.id);
  if (!row) return { ok: false, message: "這張券剛剛已經用掉了" };
  await notifyOwner({
    subject: `${friend.name} 想換「${item.title}」`,
    text: [`${friend.name} 用${couponRange(couponIndex)}的券想換：${item.title}`, "", `後台：${process.env.SITE_URL ?? ""}/admin/friends/${friend.id}`].join("\n"),
  });
  revalidatePath(`/card/${token}`);
  revalidatePath("/admin");
  return { ok: true, title: item.title };
}
