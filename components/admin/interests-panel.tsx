import type { Friend, Interest } from "@/lib/db";
import { LEVEL } from "@/lib/labels";
import { relative } from "@/lib/format";
import { markInterest } from "@/app/admin/projects/actions";
import { ConfirmButton } from "./confirm-button";

type Row = Interest & { friend: Friend | null; duplicateName?: boolean };

export function InterestsPanel({ projectId, items }: { projectId: number; items: Row[] }) {
  const visible = items.filter((i) => i.status !== "spam");
  const seen = new Map<string, number>();
  visible.forEach((i) => seen.set(i.name, (seen.get(i.name) ?? 0) + 1));
  visible.forEach((i) => { i.duplicateName = (seen.get(i.name) ?? 0) > 1; });
  return (
    <section className="section">
      <p className="label">想一起的人 · {visible.length}</p>
      {visible.length === 0 ? (
        <p className="empty-line">還沒有人說想一起。</p>
      ) : (
        <ul className="todo">
          {visible.map((i) => {
            const contacted = i.status === "contacted";
            const toggle = markInterest.bind(null, projectId, i.id, contacted ? "new" : "contacted");
            const spam = markInterest.bind(null, projectId, i.id, "spam");
            return (
              <li key={i.id} className={contacted ? "done-row" : undefined}>
                <form action={toggle}>
                  <button className="check" type="submit" aria-pressed={contacted} aria-label="已聯絡">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12l5 5L20 7" /></svg>
                  </button>
                </form>
                <div>
                  <span className="who"><b className="person">{i.name}</b><span className={`tag${i.level === "serious" ? " serious" : ""}`}>{LEVEL[i.level]}</span>{i.duplicateName && <span className="tag warn">同名已有一筆</span>}</span>
                  {i.note && <p className="note">「{i.note}」</p>}
                  <div className="meta">
                    {relative(i.createdAt)}
                    {i.showName && " · 公開名字"}
                    {i.friend && " · 有集章卡"}
                    {i.contact && ` · 聯絡方式：${i.contact}`}
                  </div>
                </div>
                <form action={spam}><ConfirmButton className="mini-btn danger" message={`把 ${i.name} 標成不是朋友？會從人數裡排除。`}>不是朋友</ConfirmButton></form>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
