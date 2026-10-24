import { and, desc, eq, isNull, ne, sql } from "drizzle-orm";
import { db, interests, projects, updates, type NewProject, type Project } from "@/lib/db";
import { STATUS, type StatusKey } from "@/lib/labels";
import { newSlug } from "@/lib/slug";

export type ProjectWithCount = Project & { interestCount: number };

// 用 join 而非關聯子查詢：單表查詢時 drizzle 不加表名，子查詢裡的 "id" 會被解析成 interests.id
const withCount = () =>
  db
    .select({ p: projects, interestCount: sql<number>`count(${interests.id})::int` })
    .from(projects)
    .leftJoin(
      interests,
      and(eq(interests.projectId, projects.id), isNull(interests.cancelledAt), ne(interests.status, "spam")),
    )
    .groupBy(projects.id)
    .$dynamic();

export async function listProjectsAdmin(): Promise<ProjectWithCount[]> {
  const rows = await withCount().orderBy(desc(projects.lastActivityAt));
  return rows.map((r) => ({ ...r.p, interestCount: r.interestCount }));
}

export async function listProjectsPublic(): Promise<ProjectWithCount[]> {
  const rows = await withCount().where(eq(projects.published, true)).orderBy(desc(projects.lastActivityAt));
  return rows.map((r) => ({ ...r.p, interestCount: r.interestCount }));
}

export async function getProjectById(id: number) {
  return db.query.projects.findFirst({ where: eq(projects.id, id) });
}

export async function getProjectBySlug(slug: string) {
  return db.query.projects.findFirst({ where: eq(projects.slug, slug) });
}

export async function listUpdates(projectId: number) {
  return db.query.updates.findMany({ where: eq(updates.projectId, projectId), orderBy: desc(updates.createdAt) });
}

export async function listInterests(projectId: number) {
  return db.query.interests.findMany({
    where: and(eq(interests.projectId, projectId), isNull(interests.cancelledAt)),
    orderBy: desc(interests.createdAt),
    with: { friend: true },
  });
}

export async function createProject(data: Partial<NewProject> & { title: string }) {
  const [row] = await db
    .insert(projects)
    .values({ ...data, slug: data.slug ?? newSlug() })
    .returning();
  await db.insert(updates).values({ projectId: row.id, body: STATUS.idea.system, kind: "system" });
  return row;
}

export async function updateProject(id: number, data: Partial<NewProject>) {
  const [row] = await db
    .update(projects)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(projects.id, id))
    .returning();
  return row;
}

export async function setStatus(id: number, status: StatusKey, note = "") {
  const current = await getProjectById(id);
  if (!current || current.status === status) return current;
  const now = new Date();
  const [row] = await db
    .update(projects)
    .set({
      status,
      openToJoin: status === "idea" || status === "forming" ? true : status === "active" ? current.openToJoin : false,
      updatedAt: now,
      lastActivityAt: now,
    })
    .where(eq(projects.id, id))
    .returning();
  const body = note.trim() ? `${STATUS[status].system}\n${note.trim()}` : STATUS[status].system;
  await db.insert(updates).values({ projectId: id, body, kind: "system" });
  return row;
}

export async function addUpdate(projectId: number, body: string, photoUrl?: string | null) {
  const now = new Date();
  const [row] = await db.insert(updates).values({ projectId, body, photoUrl: photoUrl ?? null }).returning();
  await db.update(projects).set({ lastActivityAt: now, updatedAt: now }).where(eq(projects.id, projectId));
  return row;
}

export async function deleteUpdate(id: number) {
  await db.delete(updates).where(eq(updates.id, id));
}

export async function setInterestStatus(id: number, status: "new" | "contacted" | "spam") {
  await db.update(interests).set({ status }).where(eq(interests.id, id));
}
