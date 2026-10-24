export const STATUS = {
  idea: { label: "想法", emoji: "💭", system: "小傑把這個想法寫下來" },
  forming: { label: "籌備中", emoji: "🙌", system: "開始籌備了" },
  active: { label: "進行中", emoji: "🚀", system: "出發了" },
  done: { label: "做完了", emoji: "✅", system: "做完了" },
  parked: { label: "擱置", emoji: "💤", system: "先放著" },
} as const;

export const EFFORT = {
  under_1h: "一小時內",
  hours_2_3: "兩三個小時",
  morning: "一個早上",
  afternoon: "一個下午",
  evening: "一個晚上",
  full_day: "一整天",
  multi_day: "好幾天",
  ongoing: "長期",
  flexible: "時間彈性",
} as const;

export const EFFORT_KEYS = Object.keys(EFFORT) as [EffortKey, ...EffortKey[]];
export const DEFAULT_EFFORT: EffortKey = "flexible";
export const effortLabel = (k: string | null | undefined) => (k && k in EFFORT ? EFFORT[k as EffortKey] : "");

export const SIZE_LIMIT = { min: 1, max: 50 } as const;
export type SizeMode = "any" | "fixed" | "range";

export function sizeMode(min: number | null, max: number | null): SizeMode {
  if (min === null || max === null) return "any";
  return min === max ? "fixed" : "range";
}

/** 「不限」、「5 人」或「3～6 人」 */
export function sizeLabel(min: number | null, max: number | null) {
  const mode = sizeMode(min, max);
  if (mode === "any") return "不限";
  return mode === "fixed" ? `${min} 人` : `${min}～${max} 人`;
}

/** 卡片上用的短句，不限就不顯示 */
export const sizeShort = (min: number | null, max: number | null) =>
  sizeMode(min, max) === "any" ? "" : `找 ${sizeLabel(min, max)}`;

export const LEVEL = { curious: "先聊聊", serious: "認真的" } as const;

export type StatusKey = keyof typeof STATUS;
export type EffortKey = keyof typeof EFFORT;