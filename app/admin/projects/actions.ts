"use server";

import { requireAdmin } from "@/lib/auth/require";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { addUpdate, createProject, deleteUpdate, getProjectById, setInterestStatus, setStatus, updateProject } from "@/lib/projects";
import type { ProjectLink } from "@/lib/db";
import { isUploadUrl } from "@/lib/uploads";
import { stampForProject } from "@/lib/friends";
import { categoryMap } from "@/lib/categories";
import { eq } from "drizzle-orm";
import { db, projects } from "@/lib/db";
import { EFFORT_KEYS, SIZE_LIMIT } from "@/lib/labels";

const headcount = z
  .string()
  .trim()
  .min(1, "人數要填")
  .pipe(
    z.coerce
      .number<string>({ error: "人數要填數字" })
      .int("人數要是整數")
      .min(SIZE_LIMIT.min, `人數至少 ${SIZE_LIMIT.min} 人`)
      .max(SIZE_LIMIT.max, `人數最多 ${SIZE_LIMIT.max} 人`),
  );

// 三種模式各自只讀需要的欄位，切換模式後殘留的舊值不會被存進去
const size = z
  .discriminatedUnion("sizeMode", [
    z.object({ sizeMode: z.literal("any") }),
    z.object({ sizeMode: z.literal("fixed"), sizeFixed: headcount }),
    z.object({ sizeMode: z.literal("range"), sizeMin: headcount, sizeMax: headcount }),
  ], { error: "選一種人數設定" })
  .refine((s) => s.sizeMode !== "range" || s.sizeMin <= s.sizeMax, { message: "最低人數不能比最高人數多" })
  .transform((s) =>
    s.sizeMode === "any" ? { sizeMin: null, sizeMax: null }
    : s.sizeMode === "fixed" ? { sizeMin: s.sizeFixed, sizeMax: s.sizeFixed }
    : { sizeMin: s.sizeMin, sizeMax: s.sizeMax },
  );

const schema = z.object({
  title: z.string().trim().min(1, "標題要填"),
  emoji: z.string().trim().min(1).max(8).default("💭"),
  tagline: z.string().trim().max(60).default(""),
  why: z.string().trim().default(""),
  category: z.string().min(1, "選一個分類"),
  status: z.enum(["idea", "forming", "active", "done", "parked"]),
  openToJoin: z.boolean(),
  effort: z.enum(EFFORT_KEYS, { error: "選一個投入程度" }),
  timeHint: z.string().trim().default(""),
  size,
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  location: z.string().trim().default(""),
  fitFor: z.string().trim().default(""),
  links: z.string().default(""),
  coverUrl: z.string().trim().default(""),
  groupUrl: z.string().trim().default(""),
  retro: z.string().trim().default(""),
  retroPhotos: z.string().default("[]"),
  wentWith: z.string().trim().default(""),
});

export type SaveIntent = "save" | "publish" | "unpublish";
export type SaveState = { message: string; ok?: boolean; savedAt?: number };

const intents: SaveIntent[] = ["save", "publish", "unpublish"];

/** 要公開到前台，除了一定要填的標題和分類，還要有這些。存草稿不受限。 */
function publishProblem(d: { tagline: string }) {
  if (!d.tagline) return "一句話";
  return null;
}

function parseLinks(raw: string): ProjectLink[] {
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .flatMap((l) => {
      const m = l.match(/^(.*?)\s*(https?:\/\/\S+)$/);
      return m ? [{ label: m[1].trim() || m[2], url: m[2] }] : [];
    });
}

function parsePhotos(raw: string): string[] {
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === "string" && isUploadUrl(x)) : [];
  } catch {
    return [];
  }
}

function read(formData: FormData) {
  const s = (k: string) => String(formData.get(k) ?? "").replace(/\r\n/g, "\n");
  const opt = (k: string) => (s(k) ? s(k) : null);
  return schema.safeParse({
    title: s("title"),
    emoji: s("emoji") || "💭",
    tagline: s("tagline"),
    why: s("why"),
    category: s("category"),
    status: s("status"),
    openToJoin: formData.get("openToJoin") === "on",
    effort: s("effort"),
    timeHint: s("timeHint"),
    size: { sizeMode: s("sizeMode"), sizeFixed: s("sizeFixed"), sizeMin: s("sizeMin"), sizeMax: s("sizeMax") },
    startDate: opt("startDate"),
    endDate: opt("endDate"),
    location: s("location"),
    fitFor: s("fitFor"),
    links: s("links"),
    coverUrl: s("coverUrl"),
    groupUrl: s("groupUrl"),
    retro: s("retro"),
    retroPhotos: s("retroPhotos") || "[]",
    wentWith: s("wentWith"),
  });
}

export async function saveProject(id: number | null, _prev: SaveState, formData: FormData): Promise<SaveState> {
  await requireAdmin();
  const intent = intents.find((i) => i === formData.get("intent")) ?? "save";
  const parsed = read(formData);
  if (!parsed.success) return { message: `沒有儲存：${parsed.error.issues[0]?.message ?? "有欄位不對"}` };
  if (!(await categoryMap())[parsed.data.category]) return { message: "沒有儲存：這個分類不存在" };
  const { links, status, retroPhotos, size, ...rest } = parsed.data;

  const current = id === null ? null : await getProjectById(id);
  if (id !== null && !current) return { message: "找不到這個企劃" };
  // 「儲存」不改變發布狀態，只有「發布」「取消發布」會改
  const published = intent === "publish" ? true : intent === "unpublish" ? false : (current?.published ?? false);
  if (published) {
    const missing = publishProblem(rest);
    if (missing) return { message: `沒有儲存：要公開的話「${missing}」要填` };
  }

  const data = {
    ...rest,
    ...size,
    published,
    links: parseLinks(links),
    coverUrl: rest.coverUrl || null,
    retroPhotos: parsePhotos(retroPhotos),
  };

  if (id === null) {
    const row = await createProject({ ...data, status });
    if (status !== "idea") await setStatus(row.id, status);
    revalidatePath("/");
    revalidatePath("/admin");
    redirect(`/admin/projects/${row.id}`);
  }

  await updateProject(id, data);
  if (current!.status !== status) await setStatus(id, status);
  if (status === "done") {
    const ids = formData.getAll("stampFriends").map(Number).filter((n) => Number.isInteger(n) && n > 0);
    await stampForProject(ids, { id, title: data.title, emoji: data.emoji, endDate: data.endDate });
  }
  revalidatePath("/");
  revalidatePath(`/p/${current!.slug}`);
  revalidatePath(`/admin/projects/${id}`);
  revalidatePath("/admin/projects");
  const message =
    intent === "publish" ? "已發布，前台看得到了"
    : intent === "unpublish" ? "已取消發布，前台不再顯示"
    : published ? "已儲存，前台已更新" : "已儲存（未發布，前台看不到）";
  return { message, ok: true, savedAt: Date.now() };
}

export async function postUpdate(projectId: number, formData: FormData) {
  await requireAdmin();
  const body = String(formData.get("body") ?? "").replace(/\r\n/g, "\n").trim();
  const rawUrl = String(formData.get("photo") ?? "").trim();
  const photoUrl = rawUrl && isUploadUrl(rawUrl) ? rawUrl : null;
  if (!body && !photoUrl) return;
  await addUpdate(projectId, body || "（照片）", photoUrl);
  const p = await getProjectById(projectId);
  revalidatePath(`/admin/projects/${projectId}`);
  if (p) revalidatePath(`/p/${p.slug}`);
  revalidatePath("/");
}

export async function removeUpdate(projectId: number, updateId: number) {
  await requireAdmin();
  await deleteUpdate(updateId);
  revalidatePath(`/admin/projects/${projectId}`);
}

export async function markInterest(projectId: number, interestId: number, status: "new" | "contacted" | "spam") {
  await requireAdmin();
  await setInterestStatus(interestId, status);
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath("/admin");
}

export async function deleteProject(id: number) {
  await requireAdmin();
  await db.delete(projects).where(eq(projects.id, id));
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/projects");
  redirect("/admin/projects");
}
