import { STAMPS_PER_COUPON } from "@/lib/coupons";

const SAMPLE = ["🏔️", "🍜", "🎙️", "🎨", "🚲", "⛺️", "📚", "🎬"];

export function StampHowTo() {
  return (
    <div className="howto" aria-label="集章怎麼玩">
      <div className="howto-step">
        <div className="howto-art">
          <span className="howto-check">✓</span>
          <span className="howto-arrow">→</span>
          <span className="seal howto-seal"><span className="e">🏔️</span><span className="d">2026.10</span></span>
        </div>
        <p className="howto-cap"><b>做完一件事</b>蓋一章</p>
      </div>

      <div className="howto-step">
        <div className="howto-art">
          <span className="howto-seals">
            {SAMPLE.slice(0, STAMPS_PER_COUPON).map((e) => <span key={e} className="seal howto-seal sm"><span className="e">{e}</span></span>)}
          </span>
          <span className="howto-arrow">→</span>
          <span className="howto-ticket"><span className="t">小傑券</span></span>
        </div>
        <p className="howto-cap"><b>集滿 {STAMPS_PER_COUPON} 章</b>換一張券</p>
      </div>

      <div className="howto-step">
        <div className="howto-art">
          <span className="howto-ticket"><span className="t">小傑券</span></span>
          <span className="howto-arrow">→</span>
          <span className="howto-prizes">
            <span>🧋<small>一杯飲料</small></span>
            <span>🙋<small>幫你一件事</small></span>
            <span>🎯<small>你來出題</small></span>
          </span>
        </div>
        <p className="howto-cap"><b>券可以換</b>這些</p>
      </div>

      <p className="howto-note hand">章不會被扣走，券不會過期。慢慢集沒關係。</p>
    </div>
  );
}
