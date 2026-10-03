import { asc, eq, sql } from "drizzle-orm";
import { categories, db, projects, type Category } from "@/lib/db";
import { newSlug } from "@/lib/slug";

export const DEFAULT_COLORS = ["#9dbf9e", "#9bb8d3", "#d9a5b5", "#c9b88a", "#a8a4c8", "#d8b48f", "#b7c9a8", "#c8b4d6"];

export async function listCategories(): Promise<Category[]> {
  return db.query.categories.findMany({ orderBy: asc(categories.sort) });
}

export async function categoryMap() {
  const list = await listCategories();
  return Object.fromEntries(list.map((c) => [c.key, c])) as Record<string, Category>;
}

export async function listCategoriesWithUsage() {
  const rows = await db
    .select({ c: categories, used: sql<number>`(select count(*)::int from ${projects} where ${projects.category} = ${categories.key})` })
    .from(categories)
    .orderBy(asc(categories.sort));
  return rows.map((r) => ({ ...r.c, used: r.used }));
}

export async function createCategory(label: string, color: string) {
  const all = await listCategories();
  const [row] = await db.insert(categories).values({ key: newSlug(), label, color, sort: all.length }).returning();
  return row;
}

export async function updateCategory(key: string, data: { label?: string; color?: string }) {
  await db.update(categories).set(data).where(eq(categories.key, key));
}

export async function deleteCategory(key: string) {
  const [{ used }] = await db
    .select({ used: sql<number>`count(*)::int` })
    .from(projects)
    .where(eq(projects.category, key));
  if (used > 0) return false;
  await db.delete(categories).where(eq(categories.key, key));
  return true;
}
