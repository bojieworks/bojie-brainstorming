import { and, asc, desc, eq, isNull } from "drizzle-orm";
import { db, friends, interests, redemptions, rewardItems, stamps } from "@/lib/db";
import { newToken } from "@/lib/slug";

export const STAMPS_PER_COUPON = 3;

export async function listFriends() {
  const rows = await db.query.friends.findMany({ orderBy: asc(friends.name), with: { stamps: true, redemptions: true } });
  return rows.map((f) => ({
    ...f,
    stampCount: f.stamps.length,
    pendingCount: f.redemptions.filter((r) => !r.fulfilledAt).length,
  }));
}

export async function createFriend(name: string) {
  const [row] = await db.insert(friends).values({ name, token: newToken() }).returning();
  return row;
}

export async function renameFriend(id: number, name: string) {
  await db.update(friends).set({ name }).where(eq(friends.id, id));
}

export async function deleteFriend(id: number) {
  await db.delete(friends).where(eq(friends.id, id));
}

export async function getFriend(id: number) {
  return db.query.friends.findFirst({ where: eq(friends.id, id) });
}

export async function getFriendByToken(token: string) {
  return db.query.friends.findFirst({ where: eq(friends.token, token) });
}

export async function friendCard(friendId: number) {
  const [stampRows, redemptionRows, items] = await Promise.all([
    db.query.stamps.findMany({ where: eq(stamps.friendId, friendId), orderBy: [asc(stamps.date), asc(stamps.id)], with: { project: true } }),
    db.query.redemptions.findMany({ where: eq(redemptions.friendId, friendId), with: { item: true } }),
    db.query.rewardItems.findMany({ where: eq(rewardItems.active, true), orderBy: asc(rewardItems.sort) }),
  ]);
  const unlocked = Math.floor(stampRows.length / STAMPS_PER_COUPON);
  const coupons = Array.from({ length: unlocked }, (_, i) => ({
    index: i,
    redemption: redemptionRows.find((r) => r.couponIndex === i) ?? null,
  }));
  const toNext = STAMPS_PER_COUPON - (stampRows.length % STAMPS_PER_COUPON);
  return { stamps: stampRows, coupons, items, toNext, unlocked };
}

export async function addStamp(input: { friendId: number; projectId?: number | null; label: string; emoji: string; date: string; note?: string }) {
  const [row] = await db.insert(stamps).values({ ...input, note: input.note ?? "" }).returning();
  return row;
}

export async function stampForProject(friendIds: number[], project: { id: number; title: string; emoji: string; endDate: string | null }) {
  if (friendIds.length === 0) return 0;
  const existing = await db.query.stamps.findMany({ where: eq(stamps.projectId, project.id) });
  const have = new Set(existing.map((s) => s.friendId));
  const date = project.endDate ?? new Date().toISOString().slice(0, 10);
  const fresh = friendIds.filter((id) => !have.has(id));
  if (fresh.length === 0) return 0;
  await db.insert(stamps).values(fresh.map((friendId) => ({ friendId, projectId: project.id, label: project.title, emoji: project.emoji, date })));
  return fresh.length;
}

export async function deleteStamp(id: number) {
  await db.delete(stamps).where(eq(stamps.id, id));
}

export async function listRewardItems() {
  return db.query.rewardItems.findMany({ orderBy: asc(rewardItems.sort) });
}

export async function requestRedemption(friendId: number, couponIndex: number, rewardItemId: number) {
  const [row] = await db
    .insert(redemptions)
    .values({ friendId, couponIndex, rewardItemId })
    .onConflictDoNothing()
    .returning();
  return row ?? null;
}

export async function fulfillRedemption(id: number) {
  await db.update(redemptions).set({ fulfilledAt: new Date() }).where(eq(redemptions.id, id));
}

export async function listPendingRedemptions() {
  return db.query.redemptions.findMany({
    where: isNull(redemptions.fulfilledAt),
    orderBy: desc(redemptions.requestedAt),
    with: { friend: true, item: true },
  });
}

export async function friendInterests(friendId: number) {
  return db.query.interests.findMany({
    where: and(eq(interests.friendId, friendId), isNull(interests.cancelledAt)),
    orderBy: desc(interests.createdAt),
    with: { project: true },
  });
}
