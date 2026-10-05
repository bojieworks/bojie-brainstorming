import Link from "next/link";
import { notFound } from "next/navigation";
import { friendCard, friendInterests, getFriend } from "@/lib/friends";
import { listProjectsAdmin } from "@/lib/projects";
import { LEVEL } from "@/lib/labels";
import { monthDay, todayISO, yearMonth } from "@/lib/format";
import { CopyText } from "@/components/admin/copy-text";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { manualStamp, markFulfilled, removeFriend, removeStamp, updateFriendName } from "../actions";

export async function generateMetadata(props: PageProps<"/admin/friends/[id]">) {
  const { id } = await props.params;
  const f = await getFriend(Number(id));
  return { title: f ? f.name : "找不到" };
}

export default async function FriendPage(props: PageProps<"/admin/friends/[id]">) {
  const { id } = await props.params;
  const friendId = Number(id);
  const f = await getFriend(friendId);
  if (!f) notFound();
  const [card, interests, projects] = await Promise.all([friendCard(friendId), friendInterests(friendId), listProjectsAdmin()]);
  const link = `${process.env.SITE_URL ?? ""}/card/${f.token}`;
  const slots = Math.max(3, Math.ceil(card.stamps.length / 3) * 3);
  const pending = card.coupons.filter((c) => c.redemption && !c.redemption.fulfilledAt).length;
  const rename = updateFriendName.bind(null, friendId);
  const remove = removeFriend.bind(null, friendId);
  const stamp = manualStamp.bind(null, friendId);

  return (
    <>
      <h1 className="h2">{f.name}</h1>
      <p className="muted" style={{ margin: "0 0 20px", fontSize: 14 }}>
        建立於 {yearMonth(f.createdAt)} · {card.stamps.length} 章{pending > 0 && ` · ${pending} 張券待兌現`}
        {" · "}<Link href={`/card/${f.token}`} target="_blank">看他的卡 ↗</Link>
      </p>

      <div className="grid2">
        <div>
          <section className="section" style={{ paddingTop: 0 }}>
            <p className="label" style={{ paddingTop: 0 }}>集章卡連結 <small className="muted">用 LINE 丟給他，不要公開</small></p>
            <CopyText text={link} />
          </section>

          <section className="section">
            <p className="label">章 · {card.stamps.length}</p>
            <div className="stamp-grid sm">
              {Array.from({ length: slots }, (_, i) => {
                const s = card.stamps[i];
                if (!s) return <span key={i} className="seal empty" aria-hidden="true"><span className="n">{i + 1}</span></span>;
                return <span key={s.id} className="seal" title={s.label}><span className="e" aria-hidden="true">{s.emoji}</span><span className="d">{yearMonth(s.date)}</span></span>;
              })}
            </div>
            {card.stamps.length > 0 && (
              <ul className="timeline" style={{ marginTop: 14 }}>
                {[...card.stamps].reverse().map((s) => {
                  const del = removeStamp.bind(null, friendId, s.id);
                  return (
                    <li key={s.id}>
                      <time>{monthDay(s.date)}</time>
                      <div>
                        {s.emoji} {s.label}{s.note && <span className="muted" style={{ fontSize: 13 }}> · {s.note}</span>}
                        <form action={del} style={{ display: "inline", marginLeft: 8 }}><button className="linkish" type="submit" style={{ fontSize: 12 }}>刪除</button></form>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="section">
            <p className="label">手動蓋一章 <small className="muted">長期企劃的里程碑用</small></p>
            <form action={stamp} className="form">
              <div className="two">
                <div className="row">
                  <label htmlFor="projectId">企劃 <small>可不選</small></label>
                  <select className="input" id="projectId" name="projectId" defaultValue="">
                    <option value="">不屬於任何企劃</option>
                    {projects.map((p) => <option key={p.id} value={p.id}>{p.emoji} {p.title}</option>)}
                  </select>
                </div>
                <div className="row">
                  <label htmlFor="date">日期</label>
                  <input className="input" id="date" name="date" type="date" defaultValue={todayISO()} />
                </div>
              </div>
              <div className="row">
                <label htmlFor="note">理由 <small>他會在卡上看到</small></label>
                <input className="input" id="note" name="note" placeholder="連續來四週" />
              </div>
              <div><button className="btn primary" type="submit" style={{ width: "auto", height: 44 }}>蓋章</button></div>
            </form>
          </section>

          <section className="section">
            <p className="label">名字</p>
            <form action={rename} className="form" style={{ maxWidth: 420 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <input className="input" name="name" defaultValue={f.name} required />
                <button className="mini-btn" type="submit" style={{ height: 48, whiteSpace: "nowrap", padding: "0 14px" }}>改名</button>
              </div>
            </form>
            <form action={remove} style={{ marginTop: 12 }}>
              <ConfirmButton className="mini-btn danger" message={`刪掉 ${f.name}？他的章和券會一起消失。`}>刪除這個人</ConfirmButton>
            </form>
          </section>
        </div>

        <aside className="side">
          <section className="section" style={{ paddingTop: 0 }}>
            <p className="label" style={{ paddingTop: 0 }}>券</p>
            {card.coupons.length === 0 && <p className="empty-line">還沒有券。</p>}
            {card.coupons.map((c) => {
              const from = `第 ${c.index * 3 + 1}–${(c.index + 1) * 3} 章`;
              if (!c.redemption) return <div key={c.index} className="coupon"><div><div className="name">小傑券</div><div className="from">{from} · 還沒用</div></div></div>;
              const r = c.redemption;
              if (!r.fulfilledAt) {
                const done = markFulfilled.bind(null, r.id, friendId);
                return (
                  <div key={c.index} className="coupon pending">
                    <div><div className="name">小傑券 · {r.item.title}</div><div className="from">{from} · {monthDay(r.requestedAt)} 申請</div></div>
                    <form action={done}><button className="mini-btn" type="submit">已兌現</button></form>
                  </div>
                );
              }
              return <div key={c.index} className="coupon used"><div><div className="name">小傑券 · {r.item.title}</div><div className="from">{from}</div></div><span className="state">已兌現 {monthDay(r.fulfilledAt)}</span></div>;
            })}
            <div className="coupon locked" style={{ marginTop: 10 }}><div><div className="name">下一張</div></div><span className="state">還差 {card.toNext} 章</span></div>
          </section>

          <section className="section">
            <p className="label">他表態過的</p>
            {interests.length === 0 ? <p className="empty-line">還沒有。打開集章卡連結之後的表態才會對上。</p> : (
              <ul className="timeline">
                {interests.map((i) => (
                  <li key={i.id}><time>{monthDay(i.createdAt)}</time><div><Link href={`/admin/projects/${i.projectId}`}>{i.project.emoji} {i.project.title}</Link> · {LEVEL[i.level]}</div></li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </>
  );
}
