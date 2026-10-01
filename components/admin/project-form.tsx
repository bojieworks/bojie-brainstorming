"use client";

import { useActionState, useState } from "react";
import type { Project } from "@/lib/db";
import { CATEGORY, EFFORT, SIZE, STATUS, type StatusKey } from "@/lib/labels";
import { saveProject, type SaveState } from "@/app/admin/projects/actions";

type Props = { project: Project | null };

export function ProjectForm({ project }: Props) {
  const bound = saveProject.bind(null, project?.id ?? null);
  const [state, action, pending] = useActionState<SaveState, FormData>(bound, { message: "" });
  const [status, setStatus] = useState<StatusKey>(project?.status ?? "idea");
  const linksText = (project?.links ?? []).map((l) => `${l.label} ${l.url}`).join("\n");

  return (
    <form action={action} className="form">
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
        <label className="toggle" style={{ margin: 0 }}>
          <input type="checkbox" name="published" defaultChecked={project?.published ?? false} /><i />已發布
        </label>
      </div>

      <div className={`done-fields${status === "done" ? "" : " hidden"}`}>
        <span className="lbl">做完了，補一下回顧</span>
        <div className="row">
          <label htmlFor="retro">回顧 <small>怎麼樣、好不好玩、下次要改什麼</small></label>
          <textarea className="input" id="retro" name="retro" defaultValue={project?.retro ?? ""} />
        </div>
        <div className="row">
          <label htmlFor="wentWith">一起去的人 <small>用頓號分開</small></label>
          <input className="input" id="wentWith" name="wentWith" defaultValue={project?.wentWith ?? ""} />
        </div>
      </div>

      <div className="two">
        <div className="row">
          <label htmlFor="emoji">Emoji</label>
          <input className="input" id="emoji" name="emoji" defaultValue={project?.emoji ?? "💭"} />
        </div>
        <div className="row">
          <label htmlFor="category">分類</label>
          <select className="input" id="category" name="category" defaultValue={project?.category ?? "life"}>
            {Object.entries(CATEGORY).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
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
        <textarea className="input" id="why" name="why" style={{ minHeight: 140 }} defaultValue={project?.why ?? ""} />
      </div>

      <div className="row">
        <span className="lbl">投入程度</span>
        <div className="pills">
          {Object.entries(EFFORT).map(([k, v]) => (
            <label key={k}>
              <input type="radio" name="effort" value={k} defaultChecked={(project?.effort ?? "afternoon") === k} />
              <span>{v}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="two">
        <div className="row">
          <label htmlFor="timeHint">時間感 <small>可以很模糊</small></label>
          <input className="input" id="timeHint" name="timeHint" placeholder="今年秋天、隨時、某個連假" defaultValue={project?.timeHint ?? ""} />
        </div>
        <div className="row">
          <label htmlFor="idealSize">想找幾人</label>
          <select className="input" id="idealSize" name="idealSize" defaultValue={project?.idealSize ?? ""}>
            <option value="">不限</option>
            {Object.entries(SIZE).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
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
        <label htmlFor="links">參考連結 <small>一行一個，「名稱 網址」</small></label>
        <textarea className="input" id="links" name="links" style={{ minHeight: 64 }} placeholder={"路線紀錄 https://…"} defaultValue={linksText} />
      </div>
      <div className="row">
        <label htmlFor="coverUrl">封面圖網址 <small>沒有就用 emoji</small></label>
        <input className="input" id="coverUrl" name="coverUrl" type="url" defaultValue={project?.coverUrl ?? ""} />
      </div>
      <div className="row">
        <label htmlFor="groupUrl">群組連結 <small>只有你看得到，前台不顯示</small></label>
        <input className="input" id="groupUrl" name="groupUrl" placeholder="LINE 群邀請連結" defaultValue={project?.groupUrl ?? ""} />
      </div>

      <div className="bar">
        <button className="btn primary" type="submit" disabled={pending}>{pending ? "儲存中…" : "儲存"}</button>
        <span className="saved" role="status">
          {state.message ? <span style={{ color: "#9a3b2e" }}>{state.message}</span> : state.savedAt ? "儲存了 · 剛剛" : ""}
        </span>
        <span className="spacer" />
        {project && (
          <a className="mini-btn" href={`/p/${project.slug}`} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center" }}>看前台 ↗</a>
        )}
      </div>
    </form>
  );
}
