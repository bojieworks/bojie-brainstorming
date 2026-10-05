"use server";

import { requireAdmin } from "@/lib/auth/require";
import { revalidatePath } from "next/cache";
import { createCategory, deleteCategory, updateCategory } from "@/lib/categories";

function bust() {
  revalidatePath("/");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/projects");
}

export async function addCategory(formData: FormData) {
  await requireAdmin();
  const label = String(formData.get("label") ?? "").trim();
  const color = String(formData.get("color") ?? "").trim() || "#9dbf9e";
  if (!label) return;
  await createCategory(label, color);
  bust();
}

export async function saveCategory(key: string, formData: FormData) {
  await requireAdmin();
  const label = String(formData.get("label") ?? "").trim();
  const color = String(formData.get("color") ?? "").trim();
  if (!label) return;
  await updateCategory(key, { label, color });
  bust();
}

export async function removeCategory(key: string) {
  await requireAdmin();
  await deleteCategory(key);
  bust();
}
