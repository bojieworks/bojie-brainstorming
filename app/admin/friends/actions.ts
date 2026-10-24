"use server";

import { requireAdmin } from "@/lib/auth/require";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addStamp, createFriend, deleteFriend, deleteStamp, fulfillRedemption, renameFriend, unfulfillRedemption } from "@/lib/friends";
import { getProjectById } from "@/lib/projects";
import { todayISO } from "@/lib/format";

export async function newFriend(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const f = await createFriend(name);
  revalidatePath("/admin/friends");
  redirect(`/admin/friends/${f.id}`);
}

export async function updateFriendName(id: number, formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  await renameFriend(id, name);
  revalidatePath(`/admin/friends/${id}`);
  revalidatePath("/admin/friends");
}

export async function removeFriend(id: number) {
  await requireAdmin();
  await deleteFriend(id);
  revalidatePath("/admin/friends");
  redirect("/admin/friends");
}

export async function manualStamp(friendId: number, formData: FormData) {
  await requireAdmin();
  const projectId = Number(formData.get("projectId")) || null;
  const date = String(formData.get("date") ?? "") || todayISO();
  const note = String(formData.get("note") ?? "").trim();
  const project = projectId ? await getProjectById(projectId) : null;
  const label = project ? project.title : note || "小傑蓋的章";
  await addStamp({ friendId, projectId: project?.id ?? null, label, emoji: project?.emoji ?? "✅", date, note: project ? note : "" });
  revalidatePath(`/admin/friends/${friendId}`);
}

export async function removeStamp(friendId: number, stampId: number) {
  await requireAdmin();
  await deleteStamp(stampId);
  revalidatePath(`/admin/friends/${friendId}`);
}

export async function markFulfilled(id: number, friendId: number) {
  await requireAdmin();
  await fulfillRedemption(id);
  revalidatePath("/admin");
  revalidatePath(`/admin/friends/${friendId}`);
}

/** 點錯「已兌現」時改回等兌現 */
export async function unmarkFulfilled(id: number, friendId: number) {
  await requireAdmin();
  await unfulfillRedemption(id);
  revalidatePath("/admin");
  revalidatePath(`/admin/friends/${friendId}`);
}
