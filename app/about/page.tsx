import Link from "next/link";
import { DEFAULT_ABOUT, getSetting, parseAbout } from "@/lib/settings";

export const metadata = { title: "關於這個網站" };

export default async function AboutPage() {
  const blocks = parseAbout(await getSetting("about", DEFAULT_ABOUT));
  return (
    <div className="wrap detail">
      <header className="top">
        <Link className="brand back" href="/">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          小傑實驗室
        </Link>
      </header>
      <main className="main">
        <h1 className="h2">關於這個網站</h1>
        <div className="about">
          {blocks.map((b, i) =>
            b.type === "heading"
              ? <p key={i} className="label about-heading">{b.text}</p>
              : <p key={i} className="about-p">{b.text}</p>,
          )}
        </div>
        <section className="block">
          <Link className="btn secondary" href="/#ideas">回去看想做的事 →</Link>
        </section>
      </main>
    </div>
  );
}
