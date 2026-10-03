import Link from "next/link";

export const metadata = { title: "關於這個網站" };

export default function AboutPage() {
  return (
    <div className="wrap detail">
      <header className="top">
        <Link className="brand back" href="/">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          小傑實驗室
        </Link>
      </header>
      <main className="main">
        <h1 className="h2">關於這個網站</h1>
        <div className="why" style={{ marginTop: 16 }}>
          <p>我常常有想做的事，但一個人提不起勁，或是不知道誰也想。這個網站就是把那些事攤開來放。</p>
          <p>看到想一起的，按「我也想」。那不是報名，只是讓我知道你有興趣。我會用我們平常聊天的方式來找你，通常幾天內。</p>
          <p>不用登入。名字預設只有我看得到，你可以選擇公開。改變心意隨時可以取消。</p>
          <p>有些事會真的發生，有些會一直放著。放著的也沒關係。</p>
        </div>
        <section className="block">
          <Link className="btn secondary" href="/#ideas">回去看想做的事 →</Link>
        </section>
      </main>
    </div>
  );
}
