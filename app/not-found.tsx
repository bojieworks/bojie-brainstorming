import Link from "next/link";

export const metadata = { title: "找不到這頁" };

export default function NotFound() {
  return (
    <div className="wrap detail">
      <main className="main" style={{ paddingTop: 48 }}>
        <h1 className="h2">這頁不在了</h1>
        <p className="muted">可能是我把它收起來了，或網址打錯。</p>
        <section className="block">
          <Link className="btn secondary" href="/">回首頁 →</Link>
        </section>
      </main>
    </div>
  );
}
