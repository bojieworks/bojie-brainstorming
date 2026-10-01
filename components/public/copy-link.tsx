"use client";

import { useState } from "react";

export function CopyLink({ label = "複製連結", className = "btn secondary" }: { label?: string; className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        try { await navigator.clipboard.writeText(location.href); } catch {}
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
    >
      {done ? "複製好了" : (
        <>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
          {label}
        </>
      )}
    </button>
  );
}
