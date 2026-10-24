"use client";

import { startTransition, useActionState, useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useHeightTransition, useModal } from "@/lib/use-modal";
import { FormError } from "@/components/public/form-error";
import { saveMe } from "@/lib/identity";
import { redeem, type RedeemState } from "@/app/card/[token]/actions";
import { couponRange } from "@/lib/coupons";

export function CardIdentity({ name, token }: { name: string; token: string }) {
  useEffect(() => { saveMe({ name, friendToken: token }); }, [name, token]);
  return null;
}

/** 記下這次看到了哪些章，下次打開時只有新的章會蓋下去。 */
export function MarkSeen({ cookie, token, ids }: { cookie: string; token: string; ids: number[] }) {
  useEffect(() => {
    document.cookie = `${cookie}=${ids.join(".")}; path=/card/${token}; max-age=31536000; samesite=lax`;
  }, [cookie, token, ids]);
  return null;
}

type Coupon = { index: number; state: "available" | "pending" | "used"; itemTitle: string | null; fulfilledAt: string | null };
type Item = { id: number; title: string; description: string };

export function Coupons({ token, coupons, items, toNext, newFrom = Infinity }: { token: string; coupons: Coupon[]; items: Item[]; toNext: number; newFrom?: number }) {
  const [open, setOpen] = useState<number | null>(null);
  const [picked, setPicked] = useState(false);
  const [state, action, pending] = useActionState<RedeemState, FormData>(redeem, null);

  const sheetRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => { setOpen(null); setPicked(false); }, []);
  useModal(open !== null, sheetRef, close, 'input[name="item"]');
  useHeightTransition(sheetRef, state?.ok ? "ok" : "form");

  // 自己送出而不用 <form action>：React 會在 action 結束後重設表單，送出失敗時已選的項目會被清掉
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => action(fd));
  };

  return (
    <>
      {coupons.map((c) => {
        if (c.state === "available") return (
          <div key={c.index} className={c.index >= newFrom ? "coupon coupon-in" : "coupon"}>
            <div><div className="name">小傑券</div><div className="from">{couponRange(c.index)}</div></div>
            <button className="btn primary" onClick={() => { setPicked(false); setOpen(c.index); }}>兌換</button>
          </div>
        );
        if (c.state === "pending") return (
          <div key={c.index} className="coupon pending">
            <div><div className="name">小傑券 · {c.itemTitle}</div><div className="from">{couponRange(c.index)}</div></div>
            <span className="state">等小傑來約</span>
          </div>
        );
        return (
          <div key={c.index} className="coupon used">
            <div><div className="name">小傑券 · {c.itemTitle}</div><div className="from">{couponRange(c.index)}</div></div>
            <span className="state">已兌現 {c.fulfilledAt}</span>
          </div>
        );
      })}
      <div className="coupon locked" style={{ marginTop: coupons.length ? 10 : 0 }}>
        <div><div className="name">下一張</div></div>
        <span className="state">還差 {toNext} 章</span>
      </div>

      <div className="backdrop" onClick={close} />
      <div className="sheet" ref={sheetRef} role="dialog" aria-modal="true" aria-labelledby="redeem-title" aria-hidden={open === null} tabIndex={-1}>
        <div className="handle" />
        {state?.ok ? (
          <div className="success">
            <div className="seal big-seal" aria-hidden="true"><span className="e">🎟️</span><span className="d">已申請</span></div>
            <h2 id="redeem-title">收到！小傑會來找你約。</h2>
            <p className="muted" style={{ margin: "4px 0 0", fontSize: 15 }}>你選了「{state.title}」。兌現之後這張券會變成灰色，章還是你的。</p>
            <p className="back"><button type="button" className="linkish" onClick={close}>回到集章卡</button></p>
          </div>
        ) : (
          <div>
            <h2 id="redeem-title">這張券要換什麼</h2>
            <p className="sub">選一個，小傑會來找你約。</p>
            <form onSubmit={onSubmit} onChange={() => setPicked(true)}>
              <input type="hidden" name="token" value={token} />
              <input type="hidden" name="couponIndex" value={open ?? ""} />
              <div className="field">
                <div className="menu" role="radiogroup" aria-label="兌換項目">
                  {items.map((it) => (
                    <label key={it.id}>
                      <input type="radio" name="item" value={it.id} />
                      <span><b>{it.title}</b>{it.description && <small>{it.description}</small>}</span>
                    </label>
                  ))}
                  {items.length === 0 && <p className="empty-line">小傑還沒放菜單，先跟他說一聲。</p>}
                </div>
              </div>
              <div className="actions">
                <button className="btn primary" type="submit" disabled={!picked || pending}>{pending ? "跟小傑說…" : "跟小傑說"}</button>
              </div>
              {state && !state.ok && <FormError message={state.message} />}
              <p className="cancel-row"><button type="button" className="linkish" onClick={close}>先不換</button></p>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
