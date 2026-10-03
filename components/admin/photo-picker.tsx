"use client";

import { useRef, useState } from "react";

export function PhotoPicker({ name }: { name: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const clear = () => { if (input.current) input.current.value = ""; setPreview(null); setFileName(""); };
  return (
    <div className="photo-pick">
      <input ref={input} type="file" name={name} accept="image/*" className="sr" onChange={(e) => {
        const f = e.target.files?.[0];
        if (!f) return clear();
        setFileName(f.name);
        setPreview(URL.createObjectURL(f));
      }} />
      {preview ? (
        <div className="photo-pick-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="" />
          <div>
            <div className="hint" style={{ margin: 0 }}>{fileName}</div>
            <button type="button" className="linkish" onClick={clear}>不附了</button>
          </div>
        </div>
      ) : (
        <button type="button" className="mini-btn" onClick={() => input.current?.click()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, marginRight: 6, verticalAlign: -3 }}><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="11" r="2" /><path d="m21 15-5-5-8 8" /></svg>
          附一張照片
        </button>
      )}
    </div>
  );
}
