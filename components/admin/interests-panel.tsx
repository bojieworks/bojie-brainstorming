import type { Friend, Interest } from "@/lib/db";
import { LEVEL } from "@/lib/labels";
import { relative } from "@/lib/format";
import { markInterest } from "@/app/admin/projects/actions";

type Row = Interest & { friend: Friend | null };

export function InterestsPanel({ projectId, items }: { projectId: number; items: Row[] }) {
  const visible = items.filter((i) => i.status !== "spam");
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
                  <span className="who"><b>{i.name}</b><span className={`tag${i.level === "serious" ? " serious" : ""}`}>{LEVEL[i.level]}</span></span>
                  {i.note && <p className="note">「{i.note}」</p>}
                  <div className="meta">
                    {relative(i.createdAt)}
                    {i.showName && " · 公開名字"}
                    {i.friend && " · 有集章卡"}
                    {i.contact && ` · 聯絡方式：${i.contact}`}
                  </div>
                </div>
                <form action={spam}><button className="mini-btn danger" type="submit">不是朋友</button></form>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
