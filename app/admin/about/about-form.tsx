"use client";

import { useActionState } from "react";
import { saveAbout, type AboutState } from "./actions";

export function AboutForm({ initial }: { initial: string }) {
  const [state, action, pending] = useActionState<AboutState, FormData>(saveAbout, {});
  return (
    <form action={action} className="form">
      <div className="row">
        <label htmlFor="about">內容 <small>空一行分段，「## 」開頭的那行會變成小標題，單獨一行寫 [集章圖解] 會放入集章圖解</small></label>
        <textarea className="input" id="about" name="about" style={{ minHeight: 480, fontFamily: "var(--body)" }} defaultValue={initial} />
      </div>
      <div className="bar">
        <button className="btn primary" type="submit" disabled={pending}>{pending ? "儲存中…" : "儲存"}</button>
        <span className="saved" role="status">{state.savedAt ? "儲存了 · 剛剛" : ""}</span>
        <span className="spacer" />
        <a className="mini-btn" href="/about" target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center" }}>看前台 ↗</a>
      </div>
    </form>
  );
}
