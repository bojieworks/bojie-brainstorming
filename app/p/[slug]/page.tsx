import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProjectBySlug, listUpdates } from "@/lib/projects";
import { countInterests, publicNames } from "@/lib/interests";
import { EFFORT, sizeLabel } from "@/lib/labels";
import { monthDay, yearMonth } from "@/lib/format";
import { StatusStamp } from "@/components/public/status-stamp";
import { People } from "@/components/public/people";
import { CopyLink } from "@/components/public/copy-link";
import { JoinButton, JoinProvider, WhoLine } from "@/components/public/join";

export async function generateMetadata(props: PageProps<"/p/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const p = await getProjectBySlug(slug);
  if (!p || !p.published) return { title: "找不到" };
  return { title: p.title, description: p.tagline || p.why.slice(0, 80) };
}

const paragraphs = (t: string) => t.replace(/\r\n/g, "\n").split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean);

function linkLabel(l: { label: string; url: string }) {
  if (l.label && l.label !== l.url && !/^https?:\/\//.test(l.label)) return l.label;
  try { return new URL(l.url).hostname.replace(/^www\./, ""); } catch { return l.url; }
}

function calendarUrl(title: string, start: string, end: string | null, location: string, url: string) {
  const d = (s: string) => s.replaceAll("-", "");
  const endDate = new Date(end ?? start);
  endDate.setDate(endDate.getDate() + 1);
  const dates = `${d(start)}/${d(endDate.toISOString().slice(0, 10))}`;
  const q = new URLSearchParams({ action: "TEMPLATE", text: title, dates, location, details: url });
  return `https://calendar.google.com/calendar/render?${q}`;
}

export default async function ProjectPage(props: PageProps<"/p/[slug]">) {
  const { slug } = await props.params;
  const p = await getProjectBySlug(slug);
  if (!p || !p.published) notFound();
  const [updates, count, names] = await Promise.all([listUpdates(p.id), countInterests(p.id), publicNames(p.id)]);
  const isDone = p.status === "done";
  const specs = [
    { k: "投入", v: EFFORT[p.effort] },
    { k: "時間", v: p.startDate ? `${monthDay(p.startDate)}${p.endDate && p.endDate !== p.startDate ? ` – ${monthDay(p.endDate)}` : ""}` : p.timeHint || "還沒定" },
    { k: "人數", v: sizeLabel(p.idealSize) || "不限" },
  ];
  const siteUrl = `${process.env.SITE_URL ?? ""}/p/${p.slug}`;
  const shownUpdates = updates;

  const Specs = () => (
    <dl className="specs">
      {specs.map((s) => <div key={s.k}><dt>{s.k}</dt><dd>{s.v}</dd></div>)}
    </dl>
  );

  const Timeline = ({ title }: { title: string }) => (
    <section className="block">
      <p className="label">{title}</p>
      <ul className="timeline">
        {shownUpdates.map((u) => {
          const [first, ...rest] = u.body.split("\n");
          return (
            <li key={u.id}>
              <time>{monthDay(u.createdAt)}</time>
              <div>
                {u.kind === "system" ? <span className="sys">{first}</span> : first}
                {rest.length > 0 && <><br />{rest.join(" ")}</>}
                {u.photoUrl && (
                  <div className="tl-photo">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={u.photoUrl} alt="" loading="lazy" />
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );

  const Why = ({ title }: { title: string }) => p.why ? (
    <section className="block">
      <p className="label">{title}</p>
      <div className="why">{paragraphs(p.why).map((para, i) => <p key={i}>{para}</p>)}</div>
    </section>
  ) : null;

  const Details = () => (p.location || p.links.length > 0) ? (
    <section className="block">
      <dl className="kv">
        {p.location && <><dt>地點</dt><dd>{p.location}</dd></>}
        {p.links.length > 0 && (
          <><dt>參考</dt><dd>{p.links.map((l) => <a key={l.url} href={l.url} target="_blank" rel="noreferrer">{linkLabel(l)} ↗</a>)}</dd></>
        )}
        {p.startDate && !isDone && (
          <><dt>日曆</dt><dd><a href={calendarUrl(p.title, p.startDate, p.endDate, p.location, siteUrl)} target="_blank" rel="noreferrer">加入 Google 日曆 ↗</a></dd></>
        )}
      </dl>
    </section>
  ) : null;

  if (isDone) {
    const photos = p.retroPhotos.length > 0 ? p.retroPhotos : p.coverUrl ? [p.coverUrl] : [];
    return (
      <div className="wrap detail">
        <Header />
        <main className="main">
          {photos.length > 0 ? (
            <div className="photos">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <div className="p1"><img src={photos[0]} alt="" /></div>
              {photos.length > 1 && (
                <div className="pair">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {photos.slice(1, 3).map((src) => <div key={src}><img src={src} alt="" /></div>)}
                </div>
              )}
            </div>
          ) : (
            <div className="emoji-big" aria-hidden="true">{p.emoji}</div>
          )}
          <div className="done-head"><StatusStamp status="done" doneAt={yearMonth(p.endDate ?? p.lastActivityAt)} /></div>
          <h1 className="h2">{p.title}</h1>
          {p.tagline && <p className="one">{p.tagline}</p>}

          {(p.retro || p.wentWith) && (
            <section className="block">
              <p className="label">回顧</p>
              {p.retro && <div className="why">{paragraphs(p.retro).map((para, i) => <p key={i}>{para}</p>)}</div>}
              {p.wentWith && <dl className="kv" style={{ marginTop: 20 }}><dt>一起去的</dt><dd>{p.wentWith}</dd></dl>}
            </section>
          )}
          <Timeline title="從想法到做完" />
          {count > 0 && (
            <div className="who" style={{ marginTop: 16 }}>
              <People count={count} size="lg" faded />
              <span className="count muted">當時 {count} 人說想一起</span>
            </div>
          )}
          <Why title="當初為什麼想做" />
          <Details />
          <section className="block">
            <p className="label">想做類似的？</p>
            <Link className="btn secondary" href="/#ideas">看看還沒做的 →</Link>
          </section>
        </main>
      </div>
    );
  }

  return (
    <JoinProvider projectId={p.id} title={p.title} initialCount={count} initialNames={names} openToJoin={p.openToJoin} status={p.status}>
      <div className="wrap detail">
        <Header />
        <div className="grid">
          <main className="main">
            {p.coverUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <div className="cover" style={{ aspectRatio: "16/9", borderRadius: 6, overflow: "hidden", marginBottom: 14 }}><img src={p.coverUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>
            ) : (
              <div className="emoji-big" aria-hidden="true">{p.emoji}</div>
            )}
            <div className="head">
              <h1 className="h2">{p.title}</h1>
              <StatusStamp status={p.status} />
            </div>
            {p.tagline && <p className="one">{p.tagline}</p>}

            <div className="mobile-only"><Specs /></div>
            <div className="mobile-only"><WhoLine /></div>
            <div className="mobile-only"><JoinButton /></div>

            <Why title="為什麼想做" />
            {p.fitFor && (
              <section className="block">
                <p className="label">適合什麼樣的人</p>
                <p style={{ margin: 0 }}>{p.fitFor}</p>
              </section>
            )}
            <Details />
            <Timeline title="更新" />

            <div className="share">
              <p>把這個丟給可能也想去的朋友</p>
              <CopyLink />
            </div>
          </main>

          <aside className="aside">
            <Specs />
            <WhoLine />
            <JoinButton />
          </aside>
        </div>
      </div>
    </JoinProvider>
  );
}

function Header() {
  return (
    <header className="top">
      <Link className="brand back" href="/">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        小傑實驗室
      </Link>
    </header>
  );
}
