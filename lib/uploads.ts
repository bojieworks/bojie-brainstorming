import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { newToken } from "@/lib/slug";

export const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "data", "uploads");
const MAX_BYTES = 15 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"]);

export async function saveImage(file: File): Promise<{ url: string }> {
  if (!ALLOWED.has(file.type)) throw new Error("只收圖片檔");
  if (file.size > MAX_BYTES) throw new Error("圖片超過 15MB");
  const input = Buffer.from(await file.arrayBuffer());
  const out = await sharp(input, { failOn: "none" })
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
  const name = `${newToken().slice(0, 12)}.webp`;
  const dir = path.join(UPLOAD_DIR, name.slice(0, 2));
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), out);
  return { url: `/uploads/${name.slice(0, 2)}/${name}` };
}
