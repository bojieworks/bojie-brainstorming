"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="wrap detail">
      <main className="main" style={{ paddingTop: 48 }}>
        <h1 className="h2">出了點狀況</h1>
        <p className="muted">這頁暫時打不開。可以再試一次，或先回首頁逛逛。</p>
        <section className="block" style={{ display: "flex", gap: 10 }}>
          <button className="btn primary" style={{ width: "auto" }} onClick={reset}>再試一次</button>
          <Link className="btn secondary" style={{ width: "auto" }} href="/">回首頁</Link>
        </section>
      </main>
    </div>
  );
}
