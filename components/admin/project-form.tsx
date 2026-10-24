"use client";

import { startTransition, useActionState, useRef, useState, type FormEvent } from "react";
import type { Project } from "@/lib/db";
import { DEFAULT_EFFORT, EFFORT, SIZE_LIMIT, STATUS, sizeMode, type SizeMode, type StatusKey } from "@/lib/labels";
import { deleteProject, saveProject, type SaveIntent, type SaveState } from "@/app/admin/projects/actions";
import { ImageField, PhotosField } from "./image-field";

type FriendOpt = { id: number; name: string; stamped: boolean };
type CatOpt = { key: string; label: string };
type Props = { project: Project | null; friends?: FriendOpt[]; categories: CatOpt[] };

const SIZE_MODES: { key: SizeMode; label: string }[] = [
  { key: "any", label: "不限人數" },
  { key: "fixed", label: "固定人數" },
  { key: "range", label: "人數區間" },
];

export function ProjectForm({ project, friends = [], categories }: Props) {
  const bound = saveProject.bind(null, project?.id ?? null);
  const removeAction = project ? deleteProject.bind(null, project.id) : undefined;
  const [state, dispatch, pending] = useActionState<SaveState, FormData>(bound, { message: "" });
  const [intent, setIntent] = useState<SaveIntent>("save");
  const [status, setStatus] = useState<StatusKey>(project?.status ?? "idea");
  const [size, setSize] = useState<SizeMode>(sizeMode(project?.sizeMin ?? null, project?.sizeMax ?? null));
  const formRef = useRef<HTMLFormElement>(null);
  const linksText = (project?.links ?? []).map((l) => `${l.label} ${l.url}`).join("\n");
  const published = project?.published ?? false;
  const num = (v: number | null | undefined) => (v == null ? "" : String(v));

  // 自己送出而不用 <form action>：React 會在 action 結束後重設表單，存失敗時剛打的字會不見
  const submitWith = (next: SaveIntent) => {
    const form = formRef.current;
    if (!form || !form.reportValidity()) return;
    const fd = new FormData(form);
    fd.set("intent", next);
    setIntent(next);
    startTransition(() => dispatch(fd));
  };
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    const submitter = (e.nativeEvent as SubmitEvent).submitter;
    if (submitter?.dataset.delete !== undefined) return; // 刪除走按鈕自己的 formAction
    e.preventDefault();
    submitWith("save");
  };

  return (
    <form ref={formRef} onSubmit={onSubmit} className="form">
      <div className="row">
        <span className="lbl">前台</span>
        <div className="publish-state">
          <span className={`pub-badge${published ? " on" : ""}`}>{published ? "已發布 · 前台看得到" : "未發布 · 只有你看得到"}</span>
          <button type="button" className={`btn ${published ? "secondary" : "primary"}`} disabled={pending} onClick={() => submitWith(published ? "unpublish" : "publish")}>
            {pending && intent !== "save" ? "處理中…" : published ? "取消發布" : "儲存並發布"}
          </button>
        </div>
        <p className="hint">
          {published
            ? "下面的「儲存」會直接更新前台。取消發布會一起存目前的修改，之後前台列表和企劃頁都看不到。"
            : "「儲存」只存草稿，前台看不到。按「儲存並發布」才會公開（一句話要先填）。"}
        </p>
      </div>

      <div className="row">
        <span className="lbl">狀態</span>
        <div className="pills status">
          {(Object.keys(STATUS) as StatusKey[]).map((k) => (
            <label key={k}>
              <input type="radio" name="status" value={k} checked={status === k} onChange={() => setStatus(k)} />
              <span>{STATUS[k].emoji} {STATUS[k].label}</span>
            </label>
          ))}
        </div>
        <p className="hint">改狀態會自動在前台更新紀錄加一則，例如「{STATUS.forming.system}」。</p>
      </div>

      <div className="row inline">
        <label className="toggle" style={{ margin: 0 }}>
          <input type="checkbox" name="openToJoin" defaultChecked={project?.openToJoin ?? true} /><i />開放加入
        </label>
      </div>

      <div className={`done-fields${status === "done" ? "" : " hidden"}`}>
        <span className="lbl">做完了，補一下回顧</span>
        <div className="row">
          <label htmlFor="retro">回顧 <small>怎麼樣、好不好玩、下次要改什麼</small></label>
          <textarea className="input" id="retro" name="retro" defaultValue={project?.retro ?? ""} />
        </div>
        <PhotosField name="retroPhotos" label="照片" hint="第一張會當封面，可以多張" initial={project?.retroPhotos ?? []} />
        <div className="row">
          <span className="lbl">一起去的人 <small>勾到的人會各蓋一章</small></span>
          {friends.length > 0 ? (
            <div className="pills friend-pick">
              {friends.map((f) => (
                <label key={f.id}>
                  <input type="checkbox" name="stampFriends" value={f.id} defaultChecked={f.stamped} />
                  <span>{f.name}{f.stamped ? " ✓" : ""}</span>
                </label>
              ))}
            </div>
          ) : (
            <p className="hint">還沒有建任何朋友，先去「朋友」建人，才能蓋章。</p>
          )}
          <input className="input" id="wentWith" name="wentWith" placeholder="沒有集章卡的人，用頓號分開" defaultValue={project?.wentWith ?? ""} />
        </div>
      </div>

      <div className="two">
        <div className="row">
          <label htmlFor="emoji">Emoji</label>
          <input className="input" id="emoji" name="emoji" defaultValue={project?.emoji ?? "💭"} />
        </div>
        <div className="row">
          <label htmlFor="category">分類</label>
          <select className="input" id="category" name="category" defaultValue={project?.category ?? categories[0]?.key}>
            {categories.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </div>
      </div>

      <div className="row">
        <label htmlFor="title">標題</label>
        <input className="input" id="title" name="title" defaultValue={project?.title ?? ""} required />
      </div>
      <div className="row">
        <label htmlFor="tagline">一句話 <small>20 字內，卡片上會看到</small></label>
        <input className="input" id="tagline" name="tagline" maxLength={60} defaultValue={project?.tagline ?? ""} />
      </div>
      <div className="row">
        <label htmlFor="why">為什麼想做 <small>用你平常說話的方式</small></label>
        <textarea className="input" id="why" name="why" style={{ minHeight: 140 }} defaultValue={project?.why ?? ""} aria-describedby="why-hint" />
        <p className="hint" id="why-hint">按 Enter 換行，空一行分段。「- 」開頭變項目清單，「1. 」開頭變編號清單。</p>
      </div>

      <div className="row">
        <span className="lbl" id="effort-lbl">投入程度</span>
        <div className="pills" role="radiogroup" aria-labelledby="effort-lbl">
          {Object.entries(EFFORT).map(([k, v]) => (
            <label key={k}>
              <input type="radio" name="effort" value={k} defaultChecked={(project?.effort ?? DEFAULT_EFFORT) === k} />
              <span>{v}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="row">
        <label htmlFor="timeHint">時間感 <small>可以很模糊</small></label>
        <input className="input" id="timeHint" name="timeHint" placeholder="今年秋天、隨時、某個連假" defaultValue={project?.timeHint ?? ""} />
      </div>
      <div className="row">
        <span className="lbl" id="size-lbl">想找幾人</span>
        <div className="pills" role="radiogroup" aria-labelledby="size-lbl">
          {SIZE_MODES.map((m) => (
            <label key={m.key}>
              <input type="radio" name="sizeMode" value={m.key} checked={size === m.key} onChange={() => setSize(m.key)} />
              <span>{m.label}</span>
            </label>
          ))}
        </div>
        {size === "fixed" && (
          <div className="size-inputs">
            <label htmlFor="sizeFixed" className="sr">人數</label>
            <input className="input" id="sizeFixed" name="sizeFixed" type="number" inputMode="numeric" min={SIZE_LIMIT.min} max={SIZE_LIMIT.max} step={1} required defaultValue={num(project?.sizeMin)} />
            <span>人</span>
          </div>
        )}
        {size === "range" && (
          <div className="size-inputs">
            <label htmlFor="sizeMin" className="sr">最少人數</label>
            <input className="input" id="sizeMin" name="sizeMin" type="number" inputMode="numeric" min={SIZE_LIMIT.min} max={SIZE_LIMIT.max} step={1} required placeholder="最少" defaultValue={num(project?.sizeMin)} />
            <span>～</span>
            <label htmlFor="sizeMax" className="sr">最多人數</label>
            <input className="input" id="sizeMax" name="sizeMax" type="number" inputMode="numeric" min={SIZE_LIMIT.min} max={SIZE_LIMIT.max} step={1} required placeholder="最多" defaultValue={num(project?.sizeMax)} />
            <span>人</span>
          </div>
        )}
        <p className="hint">{SIZE_LIMIT.min}～{SIZE_LIMIT.max} 人的整數。</p>
      </div>
      <div className="two">
        <div className="row">
          <label htmlFor="startDate">確定日期 <small>有了才填</small></label>
          <input className="input" id="startDate" name="startDate" type="date" defaultValue={project?.startDate ?? ""} />
        </div>
        <div className="row">
          <label htmlFor="endDate">到</label>
          <input className="input" id="endDate" name="endDate" type="date" defaultValue={project?.endDate ?? ""} />
        </div>
      </div>
      <div className="row">
        <label htmlFor="location">地點</label>
        <input className="input" id="location" name="location" defaultValue={project?.location ?? ""} />
      </div>
      <div className="row">
        <label htmlFor="fitFor">適合什麼樣的人</label>
        <textarea className="input" id="fitFor" name="fitFor" defaultValue={project?.fitFor ?? ""} />
      </div>
      <div className="row">
        <label htmlFor="links">參考連結 <small>一行一個，「名稱 網址」，網址要 http 或 https 開頭</small></label>
        <textarea className="input" id="links" name="links" style={{ minHeight: 64 }} placeholder={"路線紀錄 https://…"} defaultValue={linksText} />
      </div>
      <ImageField name="coverUrl" label="封面圖" hint="沒有就用 emoji" initial={project?.coverUrl ?? ""} />
      <div className="row">
        <label htmlFor="groupUrl">群組連結 <small>只有你看得到，前台不顯示</small></label>
        <input className="input" id="groupUrl" name="groupUrl" placeholder="LINE 群邀請連結" defaultValue={project?.groupUrl ?? ""} />
      </div>

      <div className="bar">
        <button className="btn primary" type="submit" disabled={pending}>{pending && intent === "save" ? "儲存中…" : "儲存"}</button>
        <span className="saved" role="status">
          {state.message && <span style={state.ok ? undefined : { color: "#9a3b2e" }}>{state.message}</span>}
        </span>
        <span className="spacer" />
        {project && (
          <>
            <button type="submit" formAction={removeAction} data-delete className="mini-btn danger" onClick={(e) => { if (!confirm("刪掉這個企劃？表態和更新會一起消失。")) e.preventDefault(); }}>刪除</button>
            {published && <a className="mini-btn" href={`/p/${project.slug}`} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center" }}>看前台 ↗</a>}
          </>
        )}
      </div>
    </form>
  );
}
