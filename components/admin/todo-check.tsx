"use client";

import { useOptimistic, useRef, useState } from "react";
import { useUndo } from "./undo-toast";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// 待辦完成後整列收起來。高度不固定，用 Web Animations 量出實際高度再收到 0
function collapse(row: HTMLElement) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return null;
  row.style.overflow = "hidden";
  const anim = row.animate(
    [{ height: `${row.offsetHeight}px`, opacity: 1 }, { height: "0px", opacity: 0, paddingTop: "0px", paddingBottom: "0px" }],
    { duration: 200, delay: 250, easing: "cubic-bezier(.4,0,1,1)", fill: "forwards" },
  );
  return { cancel: () => { anim.cancel(); row.style.overflow = ""; } };
}

type Props = {
  action: () => Promise<void>;
  pressed: boolean;
  label: string;
  /** 完成後這一列會從清單消失（待辦頁） */
  leave?: boolean;
  /** 有給的話，完成後畫面下方出現「復原」提示 */
  undo?: { message: string; action: () => Promise<void> };
};

/** 按下去立刻打勾，不等伺服器；存失敗就恢復原狀並提示。 */
export function TodoCheck({ action, pressed, label, leave = false, undo }: Props) {
  const [on, setOn] = useOptimistic(pressed);
  const showUndo = useUndo();
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <form className="todo-check" action={async () => {
      setFailed(false);
      setOn(!pressed);
      const row = ref.current?.closest("li");
      const anim = leave && row ? collapse(row) : null;
      try {
        // 收合動畫跑完前先不換掉清單，不然那一列會在半途突然消失
        await Promise.all([action(), leave ? wait(450) : null]);
        if (undo) showUndo(undo.message, undo.action);
      } catch {
        anim?.cancel();
        setFailed(true);
      }
    }}>
      <button ref={ref} className="check" type="submit" aria-pressed={on} aria-label={label} data-failed={failed || undefined}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path pathLength={1} d="M5 12l5 5L20 7" /></svg>
      </button>
      {failed && <p className="todo-err" role="alert">沒有存到。可能是登入過期了，重新整理後再試一次。</p>}
    </form>
  );
}
