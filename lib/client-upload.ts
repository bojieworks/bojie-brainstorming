"use client";

const MAX_EDGE = 1600;
const TARGET_TYPE = "image/jpeg";

async function compress(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    // Browser can't decode it (e.g. HEIC outside Safari); let the server try.
    return file;
  }
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, TARGET_TYPE, 0.85));
  return blob && blob.size < file.size ? blob : file;
}

export async function uploadImage(file: File): Promise<string> {
  const blob = await compress(file);
  const fd = new FormData();
  fd.append("file", blob instanceof File ? blob : new File([blob], "photo.jpg", { type: TARGET_TYPE }));
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  let json: { url?: string; error?: string } = {};
  try { json = await res.json(); } catch {}
  if (res.status === 413) throw new Error("圖片太大，換一張試試");
  if (!res.ok || !json.url) throw new Error(json.error ?? "上傳失敗，再試一次");
  return json.url;
}
