import { and, desc, eq, isNull, ne } from "drizzle-orm";
import { db, friends, interests, projects } from "@/lib/db";

const active = (projectId: number) =>
  and(eq(interests.projectId, projectId), isNull(interests.cancelledAt), ne(interests.status, "spam"));

export async function countInterests(projectId: number) {
  const rows = await db.select({ id: interests.id }).from(interests).where(active(projectId));
  return rows.length;
}

export async function publicNames(projectId: number) {
  const rows = await db
    .select({ name: interests.name })
    .from(interests)
    .where(and(active(projectId), eq(interests.showName, true)))
    .orderBy(desc(interests.createdAt));
  return rows.map((r) => r.name);
}

async function findOpen(projectId: number, clientKey: string, friendId?: number | null, includeSpam = false) {
  const spamFilter = includeSpam ? undefined : ne(interests.status, "spam");
  if (friendId) {
    const byFriend = await db.query.interests.findFirst({
      where: and(eq(interests.projectId, projectId), eq(interests.friendId, friendId), isNull(interests.cancelledAt), spamFilter),
    });
    if (byFriend) return byFriend;
  }
  if (!clientKey) return null;
  return db.query.interests.findFirst({
    where: and(eq(interests.projectId, projectId), eq(interests.clientKey, clientKey), isNull(interests.cancelledAt), spamFilter),
  });
}

export async function findMine(projectId: number, clientKey: string, friendId?: number | null) {
  return findOpen(projectId, clientKey, friendId, false);
}

export async function friendByToken(token?: string) {
  if (!token) return null;
  return db.query.friends.findFirst({ where: eq(friends.token, token) });
}

export type JoinInput = {
  projectId: number;
  clientKey: string;
  name: string;
  level: "curious" | "serious";
  note: string;
  contact: string;
  showName: boolean;
  friendToken?: string;
};

export async function upsertInterest(input: JoinInput) {
  const friend = await friendByToken(input.friendToken);
  const existing = await findOpen(input.projectId, input.clientKey, friend?.id, true);
  if (existing?.status === "spam") return { row: existing, created: false };
  const values = {
    name: input.name,
    level: input.level,
    note: input.note,
    contact: input.contact,
    showName: input.showName,
    friendId: friend?.id ?? null,
  };
  if (existing) {
    const [row] = await db.update(interests).set({ ...values, clientKey: input.clientKey }).where(eq(interests.id, existing.id)).returning();
    return { row, created: false };
  }
  const [row] = await db
    .insert(interests)
    .values({ ...values, projectId: input.projectId, clientKey: input.clientKey })
    .returning();
  await db.update(projects).set({ lastActivityAt: new Date() }).where(eq(projects.id, input.projectId));
  return { row, created: true };
}

export async function cancelMine(projectId: number, clientKey: string, friendToken?: string) {
  const friend = await friendByToken(friendToken);
  const mine = await findMine(projectId, clientKey, friend?.id);
  if (!mine) return false;
  await db.update(interests).set({ cancelledAt: new Date() }).where(eq(interests.id, mine.id));
  return true;
}
