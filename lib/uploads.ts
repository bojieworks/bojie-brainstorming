import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { newToken } from "@/lib/slug";

export const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "data", "uploads");
const MAX_BYTES = 15 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"]);

const r2 = (() => {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_URL } = process.env;
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET || !R2_PUBLIC_URL) return null;
  return {
    bucket: R2_BUCKET,
    publicUrl: R2_PUBLIC_URL.replace(/\/$/, ""),
    client: new S3Client({
      region: "auto",
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
    }),
  };
})();

export const uploadsPublicPrefix = r2 ? r2.publicUrl : "/uploads/";

export function isUploadUrl(url: string) {
  return url.startsWith("/uploads/") || (r2 ? url.startsWith(r2.publicUrl) : false);
}

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
  const key = `${name.slice(0, 2)}/${name}`;

  if (r2) {
    await r2.client.send(new PutObjectCommand({
      Bucket: r2.bucket,
      Key: key,
      Body: out,
      ContentType: "image/webp",
      CacheControl: "public, max-age=31536000, immutable",
    }));
    return { url: `${r2.publicUrl}/${key}` };
  }

  const dir = path.join(UPLOAD_DIR, name.slice(0, 2));
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), out);
  return { url: `/uploads/${key}` };
}
