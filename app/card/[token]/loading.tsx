import Link from "next/link";
import { STAMPS_PER_COUPON } from "@/lib/coupons";

// 集章卡的骨架：空的章格和下一張券直接沿用真實樣式，只有文字是色塊
export default function Loading() {
  return (
    <div className="wrap detail sk-page" role="status" aria-label="載入中">
      <header className="top">
        <Link className="brand back" href="/">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          小傑實驗室
        </Link>
      </header>
      <main className="main" aria-hidden="true">
        <span className="sk line" style={{ width: "80%", marginTop: 4 }} />
        <span className="sk title" style={{ marginTop: 20 }} />
        <span className="sk line" />
        <section className="stamps">
          <div className="stamp-grid">
            {Array.from({ length: STAMPS_PER_COUPON }, (_, i) => <span key={i} className="seal empty"><span className="n">{i + 1}</span></span>)}
          </div>
        </section>
        <section className="block">
          <p className="label">小傑券</p>
          <div className="coupon locked"><span className="sk row" style={{ width: 80 }} /></div>
        </section>
      </main>
    </div>
  );
}
