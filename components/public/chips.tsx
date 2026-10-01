"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CATEGORY, type CategoryKey } from "@/lib/labels";

export function Chips() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const current = (sp.get("c") as CategoryKey | null) ?? "all";

  const go = (key: string) => {
    const next = key === "all" || key === current ? "" : key;
    router.replace(next ? `${pathname}?c=${next}#ideas` : `${pathname}#ideas`, { scroll: false });
  };

  return (
    <div className="chips" role="group" aria-label="分類">
      <button className="chip" aria-pressed={current === "all"} onClick={() => go("all")}>全部</button>
      {(Object.keys(CATEGORY) as CategoryKey[]).map((k) => (
        <button
          key={k}
          className="chip"
          aria-pressed={current === k}
          onClick={() => go(k)}
          style={{ ["--c" as string]: CATEGORY[k].color }}
        >
          <i />{CATEGORY[k].label}
        </button>
      ))}
    </div>
  );
}
