"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

type Show = (message: string, undo: () => Promise<void>) => void;
const UndoCtx = createContext<Show>(() => {});

/** 後台做完一件事後，畫面下方出現「復原」提示 6 秒。放在後台 layout，清單裡那一列消失後提示還在。 */
export function UndoProvider({ children }: { children: ReactNode }) {
  const [item, setItem] = useState<{ id: number; message: string; undo: () => Promise<void> } | null>(null);
  const [state, setState] = useState<"idle" | "busy" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hideLater = () => { clearTimeout(timer.current); timer.current = setTimeout(() => setItem(null), 6000); };

  const show = useCallback<Show>((message, undo) => {
    setState("idle");
    setItem({ id: Date.now(), message, undo });
    hideLater();
  }, []);

  const doUndo = async () => {
    if (!item) return;
    clearTimeout(timer.current);
    setState("busy");
    try {
      await item.undo();
      setItem(null);
    } catch {
      setState("failed");
      hideLater();
    }
  };

  return (
    <UndoCtx.Provider value={show}>
      {children}
      <div className="undo-toast" role="status" aria-live="polite">
        {item && (
          <div key={item.id} className="undo-inner">
            <span>{state === "failed" ? "沒有復原成功，重新整理後再試一次。" : item.message}</span>
            {state !== "failed" && <button type="button" onClick={doUndo} disabled={state === "busy"}>{state === "busy" ? "復原中…" : "復原"}</button>}
          </div>
        )}
      </div>
    </UndoCtx.Provider>
  );
}

export const useUndo = () => useContext(UndoCtx);
