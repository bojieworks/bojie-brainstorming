import { listRewardItems } from "@/lib/friends";
import { STAMPS_PER_COUPON } from "@/lib/coupons";
import { addReward, removeReward, toggleReward } from "./actions";

export const metadata = { title: "券菜單" };

export default async function RewardsPage() {
  const items = await listRewardItems();
  return (
    <>
      <h1 className="sr">券菜單</h1>
      <section className="section" style={{ borderTop: 0 }}>
        <p className="label">券菜單 · {items.length}</p>
        <p className="hint" style={{ margin: "0 0 12px" }}>朋友每集滿 {STAMPS_PER_COUPON} 章解鎖一張券，可以換這裡任何一項。</p>
        {items.length === 0 ? (
          <p className="empty-line">還沒有項目，從下面新增第一項。</p>
        ) : (
          <ul className="todo">
            {items.map((r) => {
              const toggle = toggleReward.bind(null, r.id, !r.active);
              const remove = removeReward.bind(null, r.id);
              return (
                <li key={r.id} className={r.active ? undefined : "done-row"}>
                  <form action={toggle}>
                    <button className="check" type="submit" aria-pressed={r.active} aria-label="上架">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12l5 5L20 7" /></svg>
                    </button>
                  </form>
                  <div>
                    <span className="who"><b>{r.title}</b></span>
                    {r.description && <p className="note">{r.description}</p>}
                  </div>
                  <form action={remove}><button className="mini-btn danger" type="submit">刪除</button></form>
                </li>
              );
            })}
          </ul>
        )}
      </section>
      <section className="section">
        <p className="label">新增一項</p>
        <form action={addReward} className="form" style={{ maxWidth: 480 }}>
          <div className="row"><label htmlFor="title">名稱</label><input className="input" id="title" name="title" required /></div>
          <div className="row"><label htmlFor="description">一句說明 <small>朋友會看到</small></label><input className="input" id="description" name="description" /></div>
          <div><button className="btn primary" type="submit" style={{ width: "auto", height: 44 }}>加入菜單</button></div>
        </form>
      </section>
    </>
  );
}
