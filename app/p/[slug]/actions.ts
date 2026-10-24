"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getProjectById } from "@/lib/projects";
import { cancelMine, countInterests, findMine, friendByToken, publicNames, upsertInterest } from "@/lib/interests";
import { notifyOwner } from "@/lib/email";
import { LEVEL } from "@/lib/labels";
import { clientIp, hit } from "@/lib/rate-limit";

export type JoinState =
  | { ok: false; message: string }
  | { ok: true; count: number; names: string[]; level: "curious" | "serious" };

const schema = z.object({
  projectId: z.coerce.number().int(),
  clientKey: z.string().min(8).max(64),
  name: z.string().trim().min(1, "名字要填").max(40, "名字最多 40 個字"),
  level: z.enum(["curious", "serious"], { error: "選一下有多想" }),
  note: z.string().trim().max(200, "想說的話最多 200 個字").default(""),
  contact: z.string().trim().max(120, "聯絡方式最多 120 個字").default(""),
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
  if (!parsed.success) {
    // 只有使用者填的欄位才顯示原本的訊息；隱藏欄位出錯是頁面的問題，驗證工具的預設訊息是英文，不給使用者看
    const issue = parsed.error.issues[0];
    const userField = ["name", "level", "note", "contact"].includes(String(issue?.path[0]));
    return { ok: false, message: userField ? issue.message : "頁面有點問題，重新整理後再試一次。" };
  }
  const input = parsed.data;
  if (!(await hit(`join:${await clientIp()}`, 5, 600))) return { ok: false, message: "按太多次了，休息十分鐘再試。" };

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

export async function cancel(projectId: number, clientKey: string, friendToken?: string) {
  const ok = await cancelMine(projectId, clientKey, friendToken);
  const project = await getProjectById(projectId);
  if (project) {
    revalidatePath(`/p/${project.slug}`);
    revalidatePath("/");
  }
  return { ok, count: await countInterests(projectId) };
}

export async function mine(projectId: number, clientKey: string, friendToken?: string) {
  const friend = await friendByToken(friendToken);
  const m = await findMine(projectId, clientKey, friend?.id);
  return m ? { level: m.level, name: m.name, note: m.note, contact: m.contact, showName: m.showName } : null;
}
