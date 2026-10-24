import { test } from "node:test";
import assert from "node:assert/strict";
import { parseRich, plainText } from "./rich-text";

test("舊資料：空行分段照舊", () => {
  assert.deepEqual(parseRich("第一段\n\n第二段"), [
    { type: "p", lines: ["第一段"] },
    { type: "p", lines: ["第二段"] },
  ]);
});

test("段內換行保留", () => {
  assert.deepEqual(parseRich("第一行\r\n第二行"), [{ type: "p", lines: ["第一行", "第二行"] }]);
});

test("項目清單與編號清單", () => {
  assert.deepEqual(parseRich("想做的原因：\n- 很久沒爬山\n・天氣變涼了\n\n2. 先問人\n3) 再訂日期\n4、出發"), [
    { type: "p", lines: ["想做的原因："] },
    { type: "ul", items: ["很久沒爬山", "天氣變涼了"] },
    { type: "ol", items: ["先問人", "再訂日期", "出發"], start: 2 },
  ]);
});

test("不是清單的數字和減號不誤判", () => {
  assert.deepEqual(parseRich("3.5 小時就夠\n-5 度也要去"), [{ type: "p", lines: ["3.5 小時就夠", "-5 度也要去"] }]);
});

test("HTML 只是文字，不會被當成標籤", () => {
  assert.deepEqual(parseRich("<script>alert(1)</script>"), [{ type: "p", lines: ["<script>alert(1)</script>"] }]);
});

test("plainText 去掉清單符號", () => {
  assert.equal(plainText("原因：\n- 一\n- 二"), "原因： 一 二");
});
