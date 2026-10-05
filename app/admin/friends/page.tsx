import Link from "next/link";
import { listFriends } from "@/lib/friends";
import { newFriend } from "./actions";

export const metadata = { title: "朋友" };

export default async function FriendsPage() {
  const items = await listFriends();
  return (
    <>
      <h1 className="sr">朋友</h1>
      <section className="section" style={{ borderTop: 0 }}>
        <p className="label">建一個人</p>
        <form action={newFriend} className="form" style={{ maxWidth: 480 }}>
          <div className="row">
            <label htmlFor="name">名字 <small>建好會拿到他的集章卡連結</small></label>
            <div style={{ display: "flex", gap: 8 }}>
              <input className="input" id="name" name="name" required />
              <button className="btn primary" type="submit" style={{ width: "auto", height: 48, flex: "0 0 auto", whiteSpace: "nowrap" }}>建立</button>
            </div>
          </div>
        </form>
      </section>
      <section className="section">
        <p className="label">朋友 · {items.length}</p>
        {items.length === 0 ? (
          <p className="empty-line">還沒有人。建一個，把集章卡連結丟給他。</p>
        ) : (
          <ul className="ptable">
            {items.map((f) => (
              <li key={f.id}>
                <span className="e">🙂</span>
                <Link href={`/admin/friends/${f.id}`}>{f.name}</Link>
                <span className="st">{f.pendingCount > 0 ? `${f.pendingCount} 張券待兌現` : ""}</span>
                <span className="ppl">{f.stampCount} 章</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
