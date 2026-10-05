"use client";

import { useRef, useState } from "react";
import { uploadImage as upload } from "@/lib/client-upload";


export function ImageField({ name, label, hint, initial }: { name: string; label: string; hint?: string; initial: string }) {
  const [url, setUrl] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const input = useRef<HTMLInputElement>(null);
  return (
    <div className="row">
      <span className="lbl">{label} {hint && <small>{hint}</small>}</span>
      <input type="hidden" name={name} value={url} />
      <div className="cover">
        <div className="ph" style={{ overflow: "hidden" }}>
          {url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : "＋"}
        </div>
        <input ref={input} type="file" accept="image/*" className="sr" onChange={async (e) => {
          const f = e.target.files?.[0]; if (!f) return;
          setBusy(true); setErr("");
          try { setUrl(await upload(f)); } catch (x) { setErr(x instanceof Error ? x.message : "上傳失敗"); }
          setBusy(false); e.target.value = "";
        }} />
        <button type="button" className="mini-btn" onClick={() => input.current?.click()} disabled={busy}>{busy ? "上傳中…" : url ? "換一張" : "上傳"}</button>
        {url && <button type="button" className="mini-btn" onClick={() => setUrl("")}>移除</button>}
      </div>
      {err && <p className="hint" style={{ color: "#9a3b2e" }}>{err}</p>}
    </div>
  );
}

export function PhotosField({ name, label, hint, initial }: { name: string; label: string; hint?: string; initial: string[] }) {
  const [urls, setUrls] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const input = useRef<HTMLInputElement>(null);
  return (
    <div className="row">
      <span className="lbl">{label} {hint && <small>{hint}</small>}</span>
      <input type="hidden" name={name} value={JSON.stringify(urls)} />
      <div className="photo-list">
        {urls.map((u, i) => (
          <div key={u} className="photo-item">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={u} alt="" />
            <div className="photo-actions">
              {i > 0 && <button type="button" className="mini-btn" onClick={() => setUrls((a) => { const b = [...a]; [b[i - 1], b[i]] = [b[i], b[i - 1]]; return b; })}>←</button>}
              <button type="button" className="mini-btn" onClick={() => setUrls((a) => a.filter((x) => x !== u))}>移除</button>
            </div>
          </div>
        ))}
        <button type="button" className="ph photo-add" onClick={() => input.current?.click()} disabled={busy}>{busy ? "…" : "＋"}</button>
      </div>
      <input ref={input} type="file" accept="image/*" multiple className="sr" onChange={async (e) => {
        const files = [...(e.target.files ?? [])]; if (files.length === 0) return;
        setBusy(true); setErr("");
        for (const f of files) {
          try { const u = await upload(f); setUrls((a) => [...a, u]); } catch (x) { setErr(x instanceof Error ? x.message : "上傳失敗"); }
        }
        setBusy(false); e.target.value = "";
      }} />
      {err && <p className="hint" style={{ color: "#9a3b2e" }}>{err}</p>}
    </div>
  );
}
