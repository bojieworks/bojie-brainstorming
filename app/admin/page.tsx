import Link from "next/link";
import { and, desc, eq, isNull } from "drizzle-orm";
import { db, interests } from "@/lib/db";
import { LEVEL } from "@/lib/labels";
import { relative } from "@/lib/format";
import { markInterest } from "./projects/actions";

export const metadata = { title: "待辦" };

export default async function AdminHome() {
  const pending = await db.query.interests.findMany({
    where: and(eq(interests.status, "new"), isNull(interests.cancelledAt)),
    orderBy: desc(interests.createdAt),
    with: { project: true, friend: true },
  });

  return (
    <>
      <section className="section" style={{ borderTop: 0 }}>
        <p className="label">還沒聯絡的人 · {pending.length}</p>
        {pending.length === 0 ? (
          <p className="empty-line">目前沒有人在等你。</p>
        ) : (
          <ul className="todo">
            {pending.map((i) => {
              const done = markInterest.bind(null, i.projectId, i.id, "contacted");
              const spam = markInterest.bind(null, i.projectId, i.id, "spam");
              return (
                <li key={i.id}>
                  <form action={done}>
                    <button className="check" type="submit" aria-pressed={false} aria-label="標記已聯絡">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12l5 5L20 7" /></svg>
                    </button>
                  </form>
                  <div>
                    <span className="who">
                      <b>{i.name}</b> 想一起 <Link href={`/admin/projects/${i.projectId}`}>{i.project.title}</Link>
                      <span className={`tag${i.level === "serious" ? " serious" : ""}`}>{LEVEL[i.level]}</span>
                    </span>
                    {i.note && <p className="note">「{i.note}」</p>}
                    <div className="meta">
                      {relative(i.createdAt)}
                      {i.friend && " · 有集章卡"}
                      {i.showName && " · 公開名字"}
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
      <section className="section">
        <p className="label">企劃</p>
        <Link href="/admin/projects" className="btn secondary" style={{ width: "auto" }}>看全部企劃 →</Link>
      </section>
    </>
  );
}
