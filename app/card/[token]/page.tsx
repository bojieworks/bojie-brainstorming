import Link from "next/link";
import { notFound } from "next/navigation";
import { friendCard, getFriendByToken, STAMPS_PER_COUPON } from "@/lib/friends";
import { monthDay, yearMonth } from "@/lib/format";
import { CardIdentity, Coupons } from "@/components/card/card-client";

export async function generateMetadata(props: PageProps<"/card/[token]">) {
  const { token } = await props.params;
  const f = await getFriendByToken(token);
  return { title: f ? `${f.name}的集章卡` : "找不到", robots: { index: false, follow: false } };
}

export default async function CardPage(props: PageProps<"/card/[token]">) {
  const { token } = await props.params;
  const f = await getFriendByToken(token);
  if (!f) notFound();
  const card = await friendCard(f.id);
  const total = card.stamps.length;
  const slots = Math.max(STAMPS_PER_COUPON, Math.ceil(total / STAMPS_PER_COUPON) * STAMPS_PER_COUPON);
  const toNext = card.toNext;

  return (
    <div className="wrap detail">
      <CardIdentity name={f.name} token={f.token} />
      <header className="top">
        <Link className="brand back" href="/">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          小傑實驗室
        </Link>
      </header>
      <main className="main">
        <p className="context">這是你的集章卡，只有你跟小傑看得到。存起來，之後按「我也想」會自動知道是你。</p>
        <h1 className="h2">{f.name}的集章卡</h1>
        <p className="one">{total > 0 ? "你跟小傑一起做過這些事。" : "還沒有章。一起做完第一件事就有了。"}</p>

        <section className="stamps" aria-label="集章">
          <div className="stamp-grid">
            {Array.from({ length: slots }, (_, i) => {
              const s = card.stamps[i];
              if (!s) return <span key={i} className="seal empty" aria-hidden="true"><span className="n">{i + 1}</span></span>;
              const inner = <><span className="e" aria-hidden="true">{s.emoji}</span><span className="d">{yearMonth(s.date)}</span></>;
              return s.project?.published
                ? <Link key={s.id} className="seal pop" style={{ ["--i" as string]: i }} href={`/p/${s.project.slug}`} title={s.label}>{inner}</Link>
                : <span key={s.id} className="seal pop" style={{ ["--i" as string]: i }} title={s.label}>{inner}</span>;
            })}
          </div>
          <p className="hand stamp-note">
            {total === 0 ? "第一章在等你 ↑" : total % STAMPS_PER_COUPON === 0 ? "剛好集滿一排，有一張新的券 ↓" : `再 ${toNext} 章就有下一張券 ↑`}
          </p>
        </section>

        <section className="block">
          <p className="label">小傑券</p>
          <Coupons token={f.token} coupons={card.coupons.map((c) => ({
            index: c.index,
            state: !c.redemption ? "available" : c.redemption.fulfilledAt ? "used" : "pending",
            itemTitle: c.redemption?.item.title ?? null,
            fulfilledAt: c.redemption?.fulfilledAt ? monthDay(c.redemption.fulfilledAt) : null,
          }))} items={card.items.map((i) => ({ id: i.id, title: i.title, description: i.description }))} toNext={toNext} />
          <p className="muted" style={{ fontSize: 14, margin: "12px 0 0" }}>每集滿 {STAMPS_PER_COUPON} 章解鎖一張。章不會被扣掉，券不會過期。</p>
        </section>

        {total > 0 && (
          <section className="block">
            <p className="label">章的來歷</p>
            <ul className="timeline">
              {[...card.stamps].reverse().map((s) => (
                <li key={s.id}>
                  <time>{yearMonth(s.date).slice(2)}</time>
                  <div>
                    {s.project?.published ? <Link href={`/p/${s.project.slug}`}>{s.emoji} {s.label}</Link> : <>{s.emoji} {s.label}</>}
                    {s.note && <><br /><span className="muted" style={{ fontSize: 13 }}>{s.note}</span></>}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="block">
          <p className="label">想再蓋一章？</p>
          <Link className="btn secondary" href="/#ideas">看看小傑還想做什麼 →</Link>
        </section>
      </main>
    </div>
  );
}
