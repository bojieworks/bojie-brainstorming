"use client";

import { useRef, useState } from "react";
import { uploadImage } from "@/lib/client-upload";

export function PhotoPicker({ name }: { name: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const clear = () => { if (input.current) input.current.value = ""; setUrl(""); setErr(""); };
  return (
    <div className="photo-pick">
      <input type="hidden" name={name} value={url} />
      <input ref={input} type="file" accept="image/*" className="sr" tabIndex={-1} onChange={async (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setBusy(true); setErr("");
        try { setUrl(await uploadImage(f)); } catch (x) { setErr(x instanceof Error ? x.message : "上傳失敗"); }
        setBusy(false); e.target.value = "";
      }} />
      {url ? (
        <div className="photo-pick-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" />
          <button type="button" className="linkish" onClick={clear}>不附了</button>
        </div>
      ) : (
        <button type="button" className="mini-btn" onClick={() => input.current?.click()} disabled={busy}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, marginRight: 6, verticalAlign: -3 }}><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="11" r="2" /><path d="m21 15-5-5-8 8" /></svg>
          {busy ? "上傳中…" : "附一張照片"}
        </button>
      )}
      {err && <span className="hint" role="alert" style={{ color: "#9a3b2e", margin: 0 }}>{err}</span>}
    </div>
  );
}
