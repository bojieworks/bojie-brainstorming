"use client";

import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";

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

/** 視窗內容換頁（表單 → 成功）時，高度從舊的平滑變成新的，手機上 sheet 的上緣才不會瞬間跳一大段。 */
export function useHeightTransition(ref: RefObject<HTMLElement | null>, key: string) {
  const prev = useRef(0);
  useLayoutEffect(() => {
    const el = ref.current;
    const from = prev.current;
    if (!el || !from || getComputedStyle(el).visibility === "hidden") return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const to = el.offsetHeight;
    if (Math.abs(to - from) < 2) return;
    el.animate([{ height: `${from}px` }, { height: `${to}px` }], { duration: 240, easing: "cubic-bezier(.4,0,.2,1)" });
  }, [ref, key]);
  // 每次畫面更新後記下高度，給下一次換頁當起點（要放在上面那個 effect 之後）
  useLayoutEffect(() => { prev.current = ref.current?.offsetHeight ?? 0; });
}
