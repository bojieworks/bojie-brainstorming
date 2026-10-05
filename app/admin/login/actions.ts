"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, createSessionToken, passwordMatches, sessionCookieOptions } from "@/lib/auth/session";
import { clientIp, hit, isLimited } from "@/lib/rate-limit";

export type LoginState = { message: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");
  const key = `login:${await clientIp()}`;
  if (await isLimited(key, 5, 600)) return { message: "試太多次了，十分鐘後再來。" };
  if (!passwordMatches(password)) {
    await hit(key, 5, 600);
    await new Promise((r) => setTimeout(r, 600));
    return { message: "密碼不對。" };
  }
  const store = await cookies();
  store.set(SESSION_COOKIE, await createSessionToken(), sessionCookieOptions);
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/admin/login");
}
