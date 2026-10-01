"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { addUpdate, createProject, deleteUpdate, getProjectById, setInterestStatus, setStatus, updateProject } from "@/lib/projects";
import type { ProjectLink } from "@/lib/db";
import { saveImage } from "@/lib/uploads";

const schema = z.object({
  title: z.string().trim().min(1, "標題要填"),
  emoji: z.string().trim().min(1).max(8).default("💭"),
  tagline: z.string().trim().max(60).default(""),
  why: z.string().trim().default(""),
  category: z.enum(["outdoor", "travel", "create", "learn", "project", "life"]),
  status: z.enum(["idea", "forming", "active", "done", "parked"]),
  openToJoin: z.boolean(),
  published: z.boolean(),
  effort: z.enum(["afternoon", "weekend", "week_plus", "ongoing"]),
  timeHint: z.string().trim().default(""),
  idealSize: z.enum(["one_two", "three_five", "many"]).nullable(),
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

export type SaveState = { message: string; savedAt?: number };

function parseLinks(raw: string): ProjectLink[] {
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const m = l.match(/^(.*?)\s*(https?:\/\/\S+)$/);
      if (m) return { label: m[1].trim() || m[2], url: m[2] };
      return { label: l, url: l };
    });
}

function parsePhotos(raw: string): string[] {
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === "string" && x.startsWith("/uploads/")) : [];
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
    published: formData.get("published") === "on",
    effort: s("effort"),
    timeHint: s("timeHint"),
    idealSize: opt("idealSize"),
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
  const parsed = read(formData);
  if (!parsed.success) return { message: parsed.error.issues[0]?.message ?? "有欄位不對" };
  const { links, status, retroPhotos, ...rest } = parsed.data;
  const data = {
    ...rest,
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

  const current = await getProjectById(id);
  if (!current) return { message: "找不到這個企劃" };
  await updateProject(id, data);
  if (current.status !== status) await setStatus(id, status);
  revalidatePath("/");
  revalidatePath(`/p/${current.slug}`);
  revalidatePath(`/admin/projects/${id}`);
  return { message: "", savedAt: Date.now() };
}

export async function postUpdate(projectId: number, formData: FormData) {
  const body = String(formData.get("body") ?? "").replace(/\r\n/g, "\n").trim();
  const photo = formData.get("photo");
  if (!body && !(photo instanceof File && photo.size > 0)) return;
  let photoUrl: string | null = null;
  if (photo instanceof File && photo.size > 0) photoUrl = (await saveImage(photo)).url;
  await addUpdate(projectId, body || "（照片）", photoUrl);
  const p = await getProjectById(projectId);
  revalidatePath(`/admin/projects/${projectId}`);
  if (p) revalidatePath(`/p/${p.slug}`);
  revalidatePath("/");
}

export async function removeUpdate(projectId: number, updateId: number) {
  await deleteUpdate(updateId);
  revalidatePath(`/admin/projects/${projectId}`);
}

export async function markInterest(projectId: number, interestId: number, status: "new" | "contacted" | "spam") {
  await setInterestStatus(interestId, status);
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath("/admin");
}
