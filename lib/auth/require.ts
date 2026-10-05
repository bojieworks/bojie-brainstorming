import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "./session";

export async function requireAdmin() {
  const store = await cookies();
  if (!(await verifySessionToken(store.get(SESSION_COOKIE)?.value))) {
    throw new Error("unauthorized");
  }
}
