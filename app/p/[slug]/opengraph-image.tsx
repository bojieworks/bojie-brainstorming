import { ImageResponse } from "next/og";
import { getProjectBySlug } from "@/lib/projects";
import { effortLabel, sizeShort } from "@/lib/labels";
import { OG_HL, OG_INK, OG_INK2, OG_PAPER, OG_SIZE, fontOption, loadFont } from "@/lib/og";

export const alt = "小傑實驗室";
export const size = OG_SIZE;
export const contentType = "image/png";
export const dynamic = "force-dynamic";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getProjectBySlug(slug);
  const title = p?.published ? p.title : "小傑實驗室";
  const tagline = p?.published ? p.tagline : "想做但還沒做的事";
  const specs = p?.published ? [effortLabel(p.effort), p.timeHint, sizeShort(p.sizeMin, p.sizeMax)].filter(Boolean).join(" · ") : "";
  const font = await loadFont(`${title}${tagline}${specs}小傑實驗室我也想`);

  if (!font) return new Response("font unavailable", { status: 503 });
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: OG_PAPER, color: OG_INK, padding: 72, fontFamily: "NotoTC" }}>
        <div style={{ display: "flex", fontSize: 28, color: OG_INK2 }}>小傑實驗室</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", fontSize: 120, lineHeight: 1 }}>{p?.published ? p.emoji : "🧪"}</div>
          <div style={{ display: "flex", fontSize: 72, fontWeight: 700, lineHeight: 1.2 }}>{title}</div>
          {tagline && <div style={{ display: "flex", fontSize: 36, color: OG_INK2, lineHeight: 1.4 }}>{tagline}</div>}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", fontSize: 26, color: OG_INK2 }}>{specs}</div>
          <div style={{ display: "flex", background: OG_HL, padding: "16px 28px", borderRadius: 10, fontSize: 30, fontWeight: 700 }}>我也想 👋</div>
        </div>
      </div>
    ),
    { ...size, fonts: fontOption(font) },
  );
}
