"use client";

import { useEffect, useRef } from "react";

/** 表單的錯誤訊息：淡入，並捲到看得到的位置（手機上可能在鍵盤或畫面外）。 */
export function FormError({ message, className = "cta-note" }: { message: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    ref.current?.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
  }, [message]);
  return <p ref={ref} className={`${className} form-err`} role="alert">{message}</p>;
}
