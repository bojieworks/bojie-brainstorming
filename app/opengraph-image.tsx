import { ImageResponse } from "next/og";
import { OG_HL, OG_INK, OG_INK2, OG_PAPER, OG_SIZE, fontOption, loadFont } from "@/lib/og";

export const alt = "小傑實驗室";
export const size = OG_SIZE;
export const contentType = "image/png";
export const dynamic = "force-dynamic";

export default async function Image() {
  const font = await loadFont("小傑實驗室嗨，我是小傑。這裡放著我想做但還沒做的事。看到想一起的，按一下跟我說。");
  if (!font) return new Response("font unavailable", { status: 503 });
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", background: OG_PAPER, color: OG_INK, padding: 96, fontFamily: "NotoTC", gap: 28 }}>
        <div style={{ display: "flex", fontSize: 30, color: OG_INK2 }}>小傑實驗室</div>
        <div style={{ display: "flex", fontSize: 64, fontWeight: 700, lineHeight: 1.3 }}>嗨，我是小傑。</div>
        <div style={{ display: "flex", fontSize: 64, fontWeight: 700, lineHeight: 1.3 }}>
          這裡放著我
          <span style={{ backgroundImage: `linear-gradient(transparent 58%, ${OG_HL} 58%, ${OG_HL} 94%, transparent 94%)`, padding: "0 6px" }}>想做但還沒做</span>
          的事。
        </div>
        <div style={{ display: "flex", fontSize: 36, color: OG_INK2, marginTop: 12 }}>看到想一起的，按一下跟我說。</div>
      </div>
    ),
    { ...size, fonts: fontOption(font) },
  );
}
