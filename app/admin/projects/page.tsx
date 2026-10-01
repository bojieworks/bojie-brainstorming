import Link from "next/link";
import { listProjectsAdmin } from "@/lib/projects";
import { STATUS } from "@/lib/labels";

export const metadata = { title: "企劃" };

export default async function ProjectsPage() {
  const items = await listProjectsAdmin();
  return (
    <section className="section" style={{ borderTop: 0 }}>
      <p className="label">企劃 · {items.length}</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <Link className="btn primary" href="/admin/projects/new" style={{ width: "auto", height: 40 }}>＋ 寫下一個想法</Link>
      </div>
      {items.length === 0 ? (
        <p className="empty-line">還沒有企劃。先把腦中那件事寫下來？</p>
      ) : (
        <ul className="ptable">
          {items.map((p) => (
            <li key={p.id} className={p.published ? undefined : "draft"}>
              <span className="e">{p.emoji}</span>
              <Link href={`/admin/projects/${p.id}`}>{p.title}{!p.published && "（未發布）"}</Link>
              <span className="st">{STATUS[p.status].label}</span>
              <span className="ppl">{p.interestCount > 0 ? `${p.interestCount} 人` : ""}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
