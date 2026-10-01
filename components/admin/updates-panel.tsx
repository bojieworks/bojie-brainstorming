import type { Update } from "@/lib/db";
import { monthDay } from "@/lib/format";
import { postUpdate, removeUpdate } from "@/app/admin/projects/actions";

export function UpdatesPanel({ projectId, items }: { projectId: number; items: Update[] }) {
  const post = postUpdate.bind(null, projectId);
  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <p className="label" style={{ paddingTop: 0 }}>發一則更新</p>
      <form action={post} className="updates-admin">
        <textarea className="input" name="body" placeholder="先把 10 月的週末都問一遍，再決定哪三天。" />
        <div className="send">
          <button className="btn primary" type="submit">發布</button>
          <label className="file-row">
            <input type="file" name="photo" accept="image/*" style={{ maxWidth: 200 }} />
          </label>
        </div>
      </form>
      <ul className="timeline" style={{ marginTop: 12 }}>
        {items.map((u) => {
          const [first, ...rest] = u.body.split("\n");
          const remove = removeUpdate.bind(null, projectId, u.id);
          return (
            <li key={u.id}>
              <time>{monthDay(u.createdAt)}</time>
              <div>
                {u.kind === "system" ? <span className="sys">{first}</span> : first}
                {rest.length > 0 && <><br />{rest.join("\n")}</>}
                {u.photoUrl && (
                  <div className="tl-photo">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={u.photoUrl} alt="" />
                  </div>
                )}
                {u.kind === "manual" && (
                  <form action={remove} style={{ display: "inline", marginLeft: 8 }}>
                    <button className="linkish" type="submit" style={{ fontSize: 12 }}>刪除</button>
                  </form>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
