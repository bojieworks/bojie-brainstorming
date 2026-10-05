"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="zh-Hant-TW">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#f2f4f0", color: "#1b2027", padding: 48 }}>
        <h1 style={{ fontSize: 24 }}>出了點狀況</h1>
        <p>網站暫時打不開，請稍後再試。</p>
        <button onClick={reset} style={{ padding: "10px 16px", borderRadius: 6, border: 0, background: "#ffe34d", fontSize: 16 }}>再試一次</button>
      </body>
    </html>
  );
}
