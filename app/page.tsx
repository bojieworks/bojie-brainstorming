import Link from "next/link";
import { Suspense } from "react";
import { listProjectsPublic } from "@/lib/projects";
import { listCategories } from "@/lib/categories";
import { yearMonth } from "@/lib/format";
import { ProjectCard } from "@/components/public/project-card";
import { Chips } from "@/components/public/chips";

export default async function Home(props: PageProps<"/">) {
  const sp = await props.searchParams;
  const [all, cats] = await Promise.all([listProjectsPublic(), listCategories()]);
  const colors = Object.fromEntries(cats.map((x) => [x.key, x.color]));
  const c = typeof sp.c === "string" && colors[sp.c] ? sp.c : null;
  const live = all.filter((p) => p.status === "forming" || p.status === "active");
  const ideasAll = all.filter((p) => p.status === "idea");
  const ideas = c ? ideasAll.filter((p) => p.category === c) : ideasAll;
  const done = all.filter((p) => p.status === "done").slice(0, 4);

  return (
    <div className="wrap">
      <header className="top">
        <Link className="brand" href="/">小傑實驗室</Link>
        <nav><Link href="/about">關於</Link></nav>
      </header>

      <section className="intro">
        <h1 className="h1">
          <span>嗨，我是小傑。</span>
          <span>這裡放著我<em className="hl" style={{ fontStyle: "normal" }}>想做但還沒做</em>的事。</span>
          <span>看到想一起的，按一下跟我說。</span>
        </h1>
        <p className="hand">↳ 不用登入，也不算報名</p>
      </section>

      {live.length > 0 && (
        <section className="section" id="live">
          <p className="label">正在發生</p>
          <div className="cards wide">{live.map((p, i) => <ProjectCard key={p.id} p={p} color={colors[p.category] ?? "var(--ink)"} index={i} />)}</div>
        </section>
      )}

      <section className="section" id="ideas">
        <p className="label">想做的事 · <b>{ideas.length}</b></p>
        <Suspense fallback={<div className="chips" />}><Chips categories={cats} /></Suspense>
        {ideas.length === 0 ? (
          <p className="empty-line">
            {c ? "這個分類還沒有想法，可能是我還沒想到。" : "還沒有想法，等我一下。"}
            {c && <Link href="/#ideas" className="linkish" style={{ marginLeft: 8 }}>看全部</Link>}
          </p>
        ) : (
          <div className="cards">{ideas.map((p, i) => <ProjectCard key={p.id} p={p} color={colors[p.category] ?? "var(--ink)"} index={i} />)}</div>
        )}
      </section>

      <section className="section" id="done">
        <p className="label">一起做過的</p>
        {done.length === 0 ? (
          <p className="empty-line">正在等第一件。</p>
        ) : (
          <>
            <div className="done-grid">
              {done.map((p) => (
                <Link key={p.id} className="done-card" href={`/p/${p.slug}`}>
                  <div className="ph">
                    {p.retroPhotos[0] || p.coverUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={p.retroPhotos[0] ?? p.coverUrl ?? ""} alt="" loading="lazy" />
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 36 }}>{p.emoji}</div>
                    )}
                  </div>
                  <p className="t">{p.title}</p>
                  <p className="d">{yearMonth(p.endDate ?? p.lastActivityAt)}</p>
                  {p.retro && <p className="q">{p.retro.split("\n")[0].slice(0, 30)}</p>}
                </Link>
              ))}
            </div>
            <p className="closing">下次換你一起。<Link href="/#ideas">看看還沒做的 →</Link></p>
          </>
        )}
      </section>

      <footer className="site">
        歡迎一起來玩
      </footer>
    </div>
  );
}
