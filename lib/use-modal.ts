"use client";

import { useEffect, type RefObject } from "react";

/** Body scroll lock, Esc to close, background made inert, focus moved in and restored on close. */
export function useModal(open: boolean, ref: RefObject<HTMLElement | null>, onClose: () => void, focusSelector?: string) {
  useEffect(() => {
    const el = ref.current;
    if (!open || !el) return;
    const trigger = document.activeElement as HTMLElement | null;
    document.body.classList.add("sheet-open");

    const inerted: HTMLElement[] = [];
    for (let node: HTMLElement | null = el; node && node !== document.body; node = node.parentElement) {
      for (const sib of Array.from(node.parentElement?.children ?? [])) {
        if (sib !== node && sib instanceof HTMLElement && !sib.inert && !sib.classList.contains("backdrop")) {
          sib.inert = true;
          inerted.push(sib);
        }
      }
    }

    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const t = setTimeout(() => {
      const target = (focusSelector && el.querySelector<HTMLElement>(focusSelector)) || el.querySelector<HTMLElement>("input:not([type=hidden]):not(.sr), button, [href]");
      if (matchMedia("(hover: hover)").matches) target?.focus();
      else el.focus({ preventScroll: true });
    }, 260);

    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("sheet-open");
      inerted.forEach((n) => { n.inert = false; });
      trigger?.focus?.({ preventScroll: true });
    };
  }, [open, ref, onClose, focusSelector]);
}
