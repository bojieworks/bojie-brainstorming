export const OG_SIZE = { width: 1200, height: 630 };
export const OG_PAPER = "#f2f4f0";
export const OG_INK = "#1b2027";
export const OG_INK2 = "#5c6470";
export const OG_HL = "#ffe34d";

export async function loadFont(text: string): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@700&text=${encodeURIComponent(text)}`,
      { cache: "force-cache" },
    ).then((r) => r.text());
    const m = css.match(/src: url\((.+?)\) format\('(?:truetype|opentype)'\)/);
    if (!m) return null;
    return await fetch(m[1], { cache: "force-cache" }).then((r) => r.arrayBuffer());
  } catch {
    return null;
  }
}

export function fontOption(data: ArrayBuffer | null) {
  return data ? [{ name: "NotoTC", data, weight: 700 as const, style: "normal" as const }] : [];
}
