"use client";

import { useState } from "react";

export function CopyText({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <div className="linkbox">
      <code>{text}</code>
      <button type="button" className="btn secondary" onClick={async () => { try { await navigator.clipboard.writeText(text); } catch {} setDone(true); setTimeout(() => setDone(false), 1500); }}>
        {done ? "複製好了" : "複製"}
      </button>
    </div>
  );
}
