import { test } from "node:test";
import assert from "node:assert/strict";
import { STAMPS_PER_COUPON, checkRedeem, couponRange, couponSummary } from "./coupons";

test("規則是 5 章一張券", () => {
  assert.equal(STAMPS_PER_COUPON, 5);
});

test("4 章：沒有券，不能兌換", () => {
  assert.deepEqual(couponSummary(4), { unlocked: 0, toNext: 1 });
  assert.equal(checkRedeem(4, 0, []).ok, false);
});

test("5 章：剛好一張券，可以兌換第一張，第二張不行", () => {
  assert.deepEqual(couponSummary(5), { unlocked: 1, toNext: 5 });
  assert.deepEqual(checkRedeem(5, 0, []), { ok: true });
  assert.equal(checkRedeem(5, 1, []).ok, false);
});

test("10 章：兩張券，都可以兌換", () => {
  assert.deepEqual(couponSummary(10), { unlocked: 2, toNext: 5 });
  assert.deepEqual(checkRedeem(10, 0, []), { ok: true });
  assert.deepEqual(checkRedeem(10, 1, []), { ok: true });
  assert.equal(checkRedeem(10, 2, []).ok, false);
});

test("兌換失敗：已經換過的券不能再換", () => {
  const r = checkRedeem(10, 0, [0]);
  assert.equal(r.ok, false);
  assert.match(r.ok ? "" : r.message, /已經換過/);
  // 另一張沒換過的不受影響
  assert.deepEqual(checkRedeem(10, 1, [0]), { ok: true });
});

test("兌換失敗：不合法的券號", () => {
  for (const i of [-1, 0.5, Number.NaN, 99]) assert.equal(checkRedeem(10, i, []).ok, false);
});

test("章被刪到低於門檻：已解鎖的券跟著消失", () => {
  assert.equal(checkRedeem(9, 1, []).ok, false);
});

test("0 章與邊界", () => {
  assert.deepEqual(couponSummary(0), { unlocked: 0, toNext: 5 });
  assert.deepEqual(couponSummary(9), { unlocked: 1, toNext: 1 });
  assert.deepEqual(couponSummary(15), { unlocked: 3, toNext: 5 });
});

test("券的章數區間", () => {
  assert.equal(couponRange(0), "第 1–5 章");
  assert.equal(couponRange(1), "第 6–10 章");
});
