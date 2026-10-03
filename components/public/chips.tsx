"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Category } from "@/lib/db";

export function Chips({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const current = sp.get("c") ?? "all";

  const go = (key: string) => {
    if (key === current) return;
    router.replace(key === "all" ? pathname : `${pathname}?c=${key}`, { scroll: false });
  };

  return (
    <div className="chips" role="group" aria-label="分類">
      <button className="chip" aria-pressed={current === "all"} onClick={() => go("all")}>全部</button>
      {categories.map((c) => (
        <button
          key={c.key}
          className="chip"
          aria-pressed={current === c.key}
          onClick={() => go(c.key)}
          style={{ ["--c" as string]: c.color }}
        >
          <i />{c.label}
        </button>
      ))}
    </div>
  );
}
