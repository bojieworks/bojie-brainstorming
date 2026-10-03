"use server";

import { revalidatePath } from "next/cache";
import { setSetting } from "@/lib/settings";

export type AboutState = { savedAt?: number };

export async function saveAbout(_prev: AboutState, formData: FormData): Promise<AboutState> {
  const value = String(formData.get("about") ?? "").replace(/\r\n/g, "\n").trim();
  await setSetting("about", value);
  revalidatePath("/about");
  revalidatePath("/admin/about");
  return { savedAt: Date.now() };
}
