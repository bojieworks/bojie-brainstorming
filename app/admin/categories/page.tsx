import { DEFAULT_COLORS, listCategoriesWithUsage } from "@/lib/categories";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { addCategory, removeCategory, saveCategory } from "./actions";

export const metadata = { title: "分類" };

export default async function CategoriesPage() {
  const items = await listCategoriesWithUsage();
  const nextColor = DEFAULT_COLORS[items.length % DEFAULT_COLORS.length];
  return (
    <>
      <h1 className="sr">分類</h1>
      <section className="section" style={{ borderTop: 0 }}>
        <p className="label">分類 · {items.length}</p>
        <p className="hint" style={{ margin: "0 0 12px" }}>有企劃在用的分類不能刪，先把那些企劃改到別的分類。</p>
        <ul className="ptable cat-list">
          {items.map((c) => {
            const save = saveCategory.bind(null, c.key);
            const remove = removeCategory.bind(null, c.key);
            const formId = `cat-${c.key}`;
            return (
              <li key={c.key}>
                <form id={formId} action={save} className="cat-row">
                  <input type="color" name="color" defaultValue={c.color} aria-label="顏色" />
                  <input className="input" name="label" defaultValue={c.label} aria-label="名稱" />
                  <span className="st">{c.used > 0 ? `${c.used} 個企劃` : "沒人用"}</span>
                </form>
                <div className="cat-actions">
                  <button className="mini-btn" type="submit" form={formId}>儲存</button>
                  <form action={remove}>
                    <ConfirmButton className="mini-btn danger" message={`刪掉「${c.label}」？`}>刪除</ConfirmButton>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
      <section className="section">
        <p className="label">新增分類</p>
        <form action={addCategory} className="cat-row" style={{ maxWidth: 480 }}>
          <input type="color" name="color" defaultValue={nextColor} aria-label="顏色" />
          <input className="input" name="label" placeholder="例如：美食" required aria-label="名稱" />
          <button className="btn primary" type="submit" style={{ width: "auto", height: 48, whiteSpace: "nowrap" }}>新增</button>
        </form>
      </section>
    </>
  );
}
