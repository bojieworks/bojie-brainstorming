export const STATUS = {
  idea: { label: "想法", emoji: "💭", system: "小傑把這個想法寫下來" },
  forming: { label: "籌備中", emoji: "🙌", system: "開始籌備了" },
  active: { label: "進行中", emoji: "🚀", system: "出發了" },
  done: { label: "做完了", emoji: "✅", system: "做完了" },
  parked: { label: "擱置", emoji: "💤", system: "先放著" },
} as const;

export const EFFORT = {
  afternoon: "一個下午",
  weekend: "一個週末",
  week_plus: "一週以上",
  ongoing: "長期",
} as const;

export const SIZE = {
  one_two: "找 1~2 人",
  three_five: "找 3~5 人",
  six_ten: "找 6~10 人",
} as const;

export const LEVEL = { curious: "先聊聊", serious: "認真的" } as const;

export type StatusKey = keyof typeof STATUS;
export type EffortKey = keyof typeof EFFORT;
export type SizeKey = keyof typeof SIZE;
export const sizeLabel = (k: string | null | undefined) => (k && k in SIZE ? SIZE[k as SizeKey] : "");
