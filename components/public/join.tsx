"use client";

import { createContext, useActionState, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useModal } from "@/lib/use-modal";
import { cancel, join, mine, type JoinState } from "@/app/p/[slug]/actions";
import { loadMe, saveMe, type Me } from "@/lib/identity";
import { People } from "./people";
import { CopyLink } from "./copy-link";

const HandIcon = () => (
  <svg className="hand-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 11V6a2 2 0 0 0-4 0v1" />
    <path d="M14 10V4a2 2 0 0 0-4 0v2" />
    <path d="M10 10.5V6a2 2 0 0 0-4 0v8" />
    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
  </svg>
);
const JoinLabel = () => <>我也想 <HandIcon /></>;

type Mine = { level: "curious" | "serious"; name: string; note: string; showName: boolean } | null;
type Ctx = {
  count: number;
  names: string[];
  mine: Mine;
  open: () => void;
  openToJoin: boolean;
  status: string;
};
const JoinCtx = createContext<Ctx | null>(null);
const useJoin = () => {
  const c = useContext(JoinCtx);
  if (!c) throw new Error("JoinProvider missing");
  return c;
};

type ProviderProps = {
  projectId: number;
  title: string;
  initialCount: number;
  initialNames: string[];
  openToJoin: boolean;
  status: string;
  children: ReactNode;
};

export function JoinProvider({ projectId, title, initialCount, initialNames, openToJoin, status, children }: ProviderProps) {
  const [count, setCount] = useState(initialCount);
  const [names, setNames] = useState(initialNames);
  const [me, setMe] = useState<Me>({ clientKey: "" });
  const [myInterest, setMyInterest] = useState<Mine>(null);
  const [isOpen, setOpen] = useState(false);
  const [view, setView] = useState<"form" | "ok" | "cancelled">("form");
  const [showContact, setShowContact] = useState(false);
  const [stickyVisible, setStickyVisible] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const m = loadMe();
    setMe(m);
    mine(projectId, m.clientKey, m.friendToken).then(setMyInterest);
  }, [projectId]);

  useEffect(() => {
    const ctas = [...document.querySelectorAll<HTMLElement>("[data-cta]")];
    if (ctas.length === 0) return;
    const first = ctas[0];
    const state = new Map<Element, IntersectionObserverEntry>();
    // 頁面上的按鈕完全捲出上方才出現、完全回到畫面裡才收起；中間不變，
    // 避免在按鈕附近上下捲時底部列一直進出，手指按下去時按鈕剛好滑走
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => state.set(en.target, en));
      const f = state.get(first);
      const passedFirst = !!f && !f.isIntersecting && f.boundingClientRect.top < 0;
      const fullyVisible = [...state.values()].some((en) => en.isIntersecting && en.intersectionRatio >= 0.99);
      if (passedFirst) setStickyVisible(true);
      else if (fullyVisible || !f || f.boundingClientRect.top >= 0) setStickyVisible(false);
    }, { threshold: [0, 1] });
    ctas.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, []);

  const close = useCallback(() => setOpen(false), []);
  useModal(isOpen, sheetRef, close, me.name ? 'input[name="level"]' : "#name");

  const open = () => { setView("form"); setShowContact(false); setOpen(true); };

  const [state, formAction, pending] = useActionState<JoinState | null, FormData>(async (prev, fd) => {
    const res = await join(prev, fd);
    if (res.ok) {
      const name = String(fd.get("name") ?? "");
      saveMe({ name });
      setMe((m) => ({ ...m, name }));
      setCount(res.count);
      setNames(res.names);
      setMyInterest({ level: res.level, name, note: String(fd.get("note") ?? ""), showName: fd.get("showName") === "on" });
      setView("ok");
    }
    return res;
  }, null);

  const doCancel = async () => {
    const res = await cancel(projectId, me.clientKey, me.friendToken);
    if (res.ok) { setCount(res.count); setMyInterest(null); setView("cancelled"); setTimeout(close, 1500); }
  };

  const [levelPicked, setLevelPicked] = useState(false);
  const canSubmit = !pending && (levelPicked || !!myInterest);

  return (
    <JoinCtx.Provider value={{ count, names, mine: myInterest, open, openToJoin, status }}>
      {children}

      <div className={`sticky${stickyVisible ? " show" : ""}`} aria-hidden={!stickyVisible}>
        {openToJoin ? (
          <>
            <div className="who">
              <People count={count} />
              <span className="count">{count} 人想一起</span>
            </div>
            <button className={`btn ${myInterest ? "joined" : "primary"}`} onClick={open} tabIndex={stickyVisible ? 0 : -1}>
              {myInterest ? "你說過想一起 ✓" : <JoinLabel />}
            </button>
          </>
        ) : (
          <p className="closed-note">{closedText(status)}</p>
        )}
      </div>

      <div className="backdrop" onClick={close} />
      <div className="sheet" ref={sheetRef} role="dialog" aria-modal="true" aria-labelledby="sheet-title" aria-hidden={!isOpen} tabIndex={-1}>
        <div className="handle" />
        {view === "form" && (
          <div>
            <h2 id="sheet-title">{myInterest ? "改一下你的想法" : "跟小傑說你也想"}</h2>
            <p className="sub">{title}</p>
            <form action={formAction} noValidate onChange={(e) => { const t = e.target as unknown as { name?: string }; if (t.name === "level") setLevelPicked(true); }}>
              <input type="hidden" name="projectId" value={projectId} />
              <input type="hidden" name="clientKey" value={me.clientKey} />
              {me.friendToken && <input type="hidden" name="friendToken" value={me.friendToken} />}
              <input type="text" name="website" tabIndex={-1} autoComplete="off" className="sr" aria-hidden="true" />
              <div className="field">
                <label htmlFor="name">你是誰</label>
                <input className="input" id="name" name="name" type="text" autoComplete="nickname" required defaultValue={me.name ?? ""} key={me.name ?? ""} />
              </div>
              <div className="field">
                <span className="lbl" id="level-lbl">有多想</span>
                <div className="seg" role="radiogroup" aria-labelledby="level-lbl">
                  <label><input type="radio" name="level" value="curious" defaultChecked={myInterest?.level === "curious"} /><span>有興趣<small>先聊聊</small></span></label>
                  <label><input type="radio" name="level" value="serious" defaultChecked={myInterest?.level === "serious"} /><span>認真的<small>算我一份</small></span></label>
                </div>
              </div>
              <div className="field">
                <label htmlFor="note">想說什麼 <small>（可以不填）</small></label>
                <input className="input" id="note" name="note" type="text" placeholder="什麼時候方便、或為什麼想一起" defaultValue={myInterest?.note ?? ""} />
              </div>
              <div className={`field${showContact ? "" : " hidden"}`}>
                <label htmlFor="contact">怎麼找你 <small>IG、LINE ID 或 email 都可以</small></label>
                <input className="input" id="contact" name="contact" type="text" />
              </div>
              <label className="toggle"><input type="checkbox" name="showName" defaultChecked={myInterest?.showName ?? false} /><i />讓其他人看到我的名字</label>
              <div className="actions">
                <button className="btn primary" type="submit" disabled={!canSubmit}>{pending ? "跟小傑說…" : "跟小傑說"}</button>
              </div>
              {state && !state.ok && <p className="cta-note" role="alert" style={{ color: "#9a3b2e" }}>{state.message}</p>}
              {!showContact && (
                <p className="contact-link">小傑可能不知道怎麼找你？<button type="button" className="linkish" onClick={() => setShowContact(true)}>留個聯絡方式</button></p>
              )}
              {myInterest && (
                <p className="cancel-row"><button type="button" className="linkish" onClick={doCancel}>取消</button></p>
              )}
            </form>
          </div>
        )}
        {view === "ok" && (
          <div className="success">
            <People count={count} size="xl" max={10} newest />
            <h2>收到！小傑會來找你。</h2>
            <p className="muted" style={{ margin: "4px 0 0", fontSize: 15 }}>通常幾天內。</p>
            <p className="count">現在 {count} 人想一起</p>
            <NamesLine names={names} count={count} />
            <div className="actions"><CopyLink label="丟給可能也想去的朋友" /></div>
            <p className="back"><button type="button" className="linkish" onClick={close}>回去看企劃</button></p>
          </div>
        )}
        {view === "cancelled" && (
          <div className="success">
            <h2>好，取消了。</h2>
            <p className="muted">改變心意再按一次。</p>
          </div>
        )}
      </div>
    </JoinCtx.Provider>
  );
}

function closedText(status: string) {
  if (status === "done") return "已經做完了，往下看回顧。";
  if (status === "parked") return "這個先放著，之後可能會復活。";
  return "這次人齊了，正在籌備中。";
}

export function NamesLine({ names, count }: { names: string[]; count: number }) {
  const others = count - names.length;
  if (count === 0) return <span className="names">還沒有人說想一起。</span>;
  if (names.length === 0) return <span className="names">{count} 位朋友，名字沒公開</span>;
  const shown = names.slice(0, 3).join("、");
  const rest = names.length > 3 ? names.length - 3 + others : others;
  return <span className="names">{shown}{rest > 0 ? `和另外 ${rest} 位` : ""}</span>;
}

export function WhoLine({ size = "lg" }: { size?: "" | "lg" }) {
  const { count, names } = useJoin();
  return (
    <div className="who">
      <People count={count} size={size} animate />
      <div>
        <span className="count">{count} 人想一起</span>
        <NamesLine names={names} count={count} />
      </div>
    </div>
  );
}

export function JoinButton() {
  const { mine, open, openToJoin, status } = useJoin();
  if (!openToJoin) return <div className="cta-block" data-cta><p className="closed-note">{closedText(status)}</p></div>;
  return (
    <div className="cta-block" data-cta>
      <button className={`btn ${mine ? "joined" : "primary"}`} onClick={open}>
        {mine ? "你說過想一起 ✓" : <JoinLabel />}
      </button>
      <p className="cta-note">不是報名，只是讓小傑知道。</p>
    </div>
  );
}
