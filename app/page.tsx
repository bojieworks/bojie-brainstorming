export default function Home() {
  return (
    <div className="wrap">
      <header className="top">
        <span className="brand">小傑想做的事</span>
      </header>
      <section className="intro">
        <h1 className="h1">
          <span>嗨，我是小傑。</span>
          <span>這裡放著我<em className="hl" style={{ fontStyle: "normal" }}>想做但還沒做</em>的事。</span>
          <span>看到想一起的，按一下跟我說。</span>
        </h1>
        <p className="hand">↳ 網站還在蓋，很快就好</p>
      </section>
    </div>
  );
}
