// 後台各頁共用的骨架，顯示在 layout 的導覽列下方
export default function Loading() {
  return (
    <section className="section sk-page" style={{ borderTop: 0 }} role="status" aria-label="載入中">
      <p className="label"><span className="sk row" style={{ width: 96 }} /></p>
      <ul className="todo" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <li key={i} style={{ gridTemplateColumns: "1fr" }}>
            <div><span className="sk row" /><span className="sk row" /></div>
          </li>
        ))}
      </ul>
    </section>
  );
}
