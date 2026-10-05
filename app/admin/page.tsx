import Link from "next/link";
import { and, desc, eq, isNull } from "drizzle-orm";
import { db, interests } from "@/lib/db";
import { LEVEL } from "@/lib/labels";
import { relative } from "@/lib/format";
import { markInterest } from "./projects/actions";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { listPendingRedemptions } from "@/lib/friends";
import { markFulfilled } from "./friends/actions";

export const metadata = { title: "待辦" };

export default async function AdminHome() {
  const pending = await db.query.interests.findMany({
    where: and(eq(interests.status, "new"), isNull(interests.cancelledAt)),
    orderBy: desc(interests.createdAt),
    with: { project: true, friend: true },
  });

  const redemptionsPending = await listPendingRedemptions();

  return (
    <>
      <h1 className="sr">待辦</h1>
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
                      <b className="person">{i.name}</b>
                      <span className={`tag${i.level === "serious" ? " serious" : ""}`}>{LEVEL[i.level]}</span>
                    </span>
                    <div className="what">想一起 <Link href={`/admin/projects/${i.projectId}`}>{i.project.emoji} {i.project.title}</Link></div>
                    {i.note && <p className="note">「{i.note}」</p>}
                    <div className="meta">
                      {relative(i.createdAt)}
                      {i.friend && " · 有集章卡"}
                      {i.showName && " · 公開名字"}
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
      <section className="section">
        <p className="label">等兌現的券 · {redemptionsPending.length}</p>
        {redemptionsPending.length === 0 ? (
          <p className="empty-line">沒有人在等換東西。</p>
        ) : (
          <ul className="todo">
            {redemptionsPending.map((r) => {
              const done = markFulfilled.bind(null, r.id, r.friendId);
              return (
                <li key={r.id}>
                  <form action={done}>
                    <button className="check" type="submit" aria-pressed={false} aria-label="標記已兌現">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12l5 5L20 7" /></svg>
                    </button>
                  </form>
                  <div>
                    <span className="who"><b className="person">{r.friend.name}</b></span>
                    <div className="what">想換 <b>{r.item.title}</b></div>
                    <div className="meta">{relative(r.requestedAt)} · 第 {r.couponIndex * 3 + 1}–{(r.couponIndex + 1) * 3} 章的券 · <Link href={`/admin/friends/${r.friendId}`}>看他的卡</Link></div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
