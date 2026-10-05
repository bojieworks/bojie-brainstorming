"use client";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const unauthorized = error.message === "unauthorized";
  return (
    <section className="section" style={{ borderTop: 0 }}>
      <h1 className="h2">{unauthorized ? "登入過期了" : "剛剛那個動作沒成功"}</h1>
      <p className="muted" style={{ margin: "8px 0 16px" }}>
        {unauthorized ? "重新登入一次就好。" : "資料可能沒有存到。重新整理後再試一次，還是不行就晚點再試。"}
        {error.digest && !unauthorized && <><br /><small className="mono">錯誤代碼 {error.digest}</small></>}
      </p>
      {unauthorized
        ? <a className="btn primary" style={{ width: "auto" }} href="/admin/login">重新登入</a>
        : <button className="btn primary" style={{ width: "auto" }} onClick={reset}>再試一次</button>}
    </section>
  );
}
