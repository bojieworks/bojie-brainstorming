/** 每集滿幾章解鎖一張券。章不會被扣掉，第 i 張券對應第 i*N+1 到 (i+1)*N 章。 */
export const STAMPS_PER_COUPON = 5;

export function couponSummary(stampCount: number, per = STAMPS_PER_COUPON) {
  const n = Math.max(0, Math.floor(stampCount));
  return { unlocked: Math.floor(n / per), toNext: per - (n % per) };
}

export const couponRange = (index: number, per = STAMPS_PER_COUPON) => `第 ${index * per + 1}–${(index + 1) * per} 章`;

export type RedeemCheck = { ok: true } | { ok: false; message: string };

/** 這張券現在能不能拿去換：要已解鎖、還沒換過。 */
export function checkRedeem(stampCount: number, couponIndex: number, redeemed: readonly number[], per = STAMPS_PER_COUPON): RedeemCheck {
  const { unlocked } = couponSummary(stampCount, per);
  if (!Number.isInteger(couponIndex) || couponIndex < 0 || couponIndex >= unlocked) {
    return { ok: false, message: `還沒集滿 ${per} 章，這張券還不能用` };
  }
  if (redeemed.includes(couponIndex)) return { ok: false, message: "這張券已經換過了" };
  return { ok: true };
}