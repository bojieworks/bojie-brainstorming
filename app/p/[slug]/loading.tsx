import Link from "next/link";

// 企劃頁的骨架：版面跟 page.tsx 的一般模式對齊，內容到了直接替換
export default function Loading() {
  const Specs = () => (
    <dl className="specs">
      {["投入", "時間", "人數"].map((k) => <div key={k}><dt>{k}</dt><dd><span className="sk" /></dd></div>)}
    </dl>
  );
  const Who = () => <div className="who"><span className="sk" /></div>;
  return (
    <div className="wrap detail sk-page" role="status" aria-label="載入中">
      <header className="top">
        <Link className="brand back" href="/">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          小傑實驗室
        </Link>
      </header>
      <div className="grid">
        <main className="main" aria-hidden="true">
          <span className="sk emoji" />
          <span className="sk title" />
          <span className="sk line" />
          <div className="mobile-only"><Specs /></div>
          <div className="mobile-only"><Who /></div>
          <div className="mobile-only"><span className="sk btn" /></div>
        </main>
        <aside className="aside" aria-hidden="true">
          <Specs />
          <Who />
          <span className="sk btn" />
        </aside>
      </div>
    </div>
  );
}
