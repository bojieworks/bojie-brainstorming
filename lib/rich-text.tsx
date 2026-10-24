import { Fragment } from "react";

export type RichBlock =
  | { type: "p"; lines: string[] }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[]; start: number };

const BULLET = /^\s*(?:[-*]\s+|[・•]\s*)(.*)$/;
// 「1. 」「1) 」後面要有空白，避免「3.5 小時」被當成清單；「1、」中文習慣不加空白
const ORDERED = /^\s*(\d{1,3})(?:[.)]\s+|、\s*)(.*)$/;

/** 空一行分段、段內換行保留、「- 」開頭是項目清單、「1. 」開頭是編號清單。 */
export function parseRich(raw: string): RichBlock[] {
  const blocks: RichBlock[] = [];
  let cur: RichBlock | null = null;
  for (const line of raw.replace(/\r\n/g, "\n").split("\n")) {
    if (!line.trim()) { cur = null; continue; }
    const b = line.match(BULLET);
    const o = b ? null : line.match(ORDERED);
    if (b) {
      if (cur?.type !== "ul") blocks.push((cur = { type: "ul", items: [] }));
      cur.items.push(b[1].trim());
    } else if (o) {
      if (cur?.type !== "ol") blocks.push((cur = { type: "ol", items: [], start: Number(o[1]) }));
      cur.items.push(o[2].trim());
    } else {
      if (cur?.type !== "p") blocks.push((cur = { type: "p", lines: [] }));
      cur.lines.push(line.trim());
    }
  }
  return blocks;
}

/** 給 meta description 之類的地方用，去掉清單符號、合成一行。 */
export function plainText(raw: string) {
  return parseRich(raw)
    .flatMap((b) => (b.type === "p" ? b.lines : b.items))
    .join(" ");
}

export function RichText({ text, className }: { text: string; className?: string }) {
  return (
    <div className={className}>
      {parseRich(text).map((b, i) =>
        b.type === "p" ? (
          <p key={i}>{b.lines.map((l, j) => <Fragment key={j}>{j > 0 && <br />}{l}</Fragment>)}</p>
        ) : b.type === "ul" ? (
          <ul key={i}>{b.items.map((it, j) => <li key={j}>{it}</li>)}</ul>
        ) : (
          <ol key={i} start={b.start}>{b.items.map((it, j) => <li key={j}>{it}</li>)}</ol>
        ),
      )}
    </div>
  );
}