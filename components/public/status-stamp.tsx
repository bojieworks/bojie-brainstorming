import { STATUS, type StatusKey } from "@/lib/labels";

export function StatusStamp({ status, doneAt }: { status: StatusKey; doneAt?: string }) {
  if (status === "idea") return null;
  if (status === "done") return <span className="stamp done">做完了{doneAt ? ` · ${doneAt}` : ""}</span>;
  return <span className="stamp">{STATUS[status].label}</span>;
}
