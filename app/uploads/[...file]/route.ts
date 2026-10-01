import { stat, readFile } from "node:fs/promises";
import path from "node:path";
import { UPLOAD_DIR } from "@/lib/uploads";

export async function GET(_req: Request, ctx: RouteContext<"/uploads/[...file]">) {
  const { file } = await ctx.params;
  const rel = file.join("/");
  if (!/^[A-Za-z0-9]{2}\/[A-Za-z0-9]{1,16}\.webp$/.test(rel)) return new Response("not found", { status: 404 });
  const abs = path.join(UPLOAD_DIR, rel);
  try {
    const s = await stat(abs);
    const body = await readFile(abs);
    return new Response(body, {
      headers: {
        "Content-Type": "image/webp",
        "Content-Length": String(s.size),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("not found", { status: 404 });
  }
}
