"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getProjectById } from "@/lib/projects";
import { cancelMine, countInterests, findMine, publicNames, upsertInterest } from "@/lib/interests";
import { notifyOwner } from "@/lib/email";
import { LEVEL } from "@/lib/labels";

export type JoinState =
  | { ok: false; message: string }
  | { ok: true; count: number; names: string[]; level: "curious" | "serious" };

const schema = z.object({
  projectId: z.coerce.number().int(),
  clientKey: z.string().min(8).max(64),
  name: z.string().trim().min(1, "名字要填").max(40),
  level: z.enum(["curious", "serious"]),
  note: z.string().trim().max(200).default(""),
  contact: z.string().trim().max(120).default(""),
  showName: z.boolean(),
  friendToken: z.string().max(64).optional(),
  website: z.string().max(0),
});

export async function join(_prev: JoinState | null, formData: FormData): Promise<JoinState> {
  const parsed = schema.safeParse({
    projectId: formData.get("projectId"),
    clientKey: formData.get("clientKey"),
    name: formData.get("name"),
    level: formData.get("level"),
    note: formData.get("note") ?? "",
    contact: formData.get("contact") ?? "",
    showName: formData.get("showName") === "on",
    friendToken: formData.get("friendToken") || undefined,
    website: formData.get("website") ?? "",
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "有東西沒填對" };
  const input = parsed.data;

  const project = await getProjectById(input.projectId);
  if (!project || !project.published) return { ok: false, message: "找不到這個企劃" };
  if (!project.openToJoin) return { ok: false, message: "這個企劃現在沒有開放加入" };

  const { row, created } = await upsertInterest(input);
  const [count, names] = await Promise.all([countInterests(project.id), publicNames(project.id)]);

  if (created) {
    const site = process.env.SITE_URL ?? "";
    await notifyOwner({
      subject: `${row.name} 想一起${project.title}`,
      text: [
        `${row.name}（${LEVEL[row.level]}）想一起「${project.title}」`,
        row.note ? `他說：${row.note}` : "",
        row.contact ? `聯絡方式：${row.contact}` : "",
        row.showName ? "願意公開名字" : "不公開名字",
        "",
        `後台：${site}/admin/projects/${project.id}`,
      ].filter(Boolean).join("\n"),
    });
  }

  revalidatePath(`/p/${project.slug}`);
  revalidatePath("/");
  return { ok: true, count, names, level: row.level };
}

export async function cancel(projectId: number, clientKey: string) {
  const ok = await cancelMine(projectId, clientKey);
  const project = await getProjectById(projectId);
  if (project) {
    revalidatePath(`/p/${project.slug}`);
    revalidatePath("/");
  }
  return { ok, count: await countInterests(projectId) };
}

export async function mine(projectId: number, clientKey: string) {
  const m = await findMine(projectId, clientKey);
  return m ? { level: m.level, name: m.name, note: m.note, showName: m.showName } : null;
}
