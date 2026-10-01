import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";
import { saveImage } from "@/lib/uploads";

export async function POST(req: Request) {
  const store = await cookies();
  if (!(await verifySessionToken(store.get(SESSION_COOKIE)?.value))) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return Response.json({ error: "沒有檔案" }, { status: 400 });
  try {
    return Response.json(await saveImage(file));
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "上傳失敗" }, { status: 400 });
  }
}
