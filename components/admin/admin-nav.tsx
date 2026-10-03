"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "待辦", exact: true },
  { href: "/admin/projects", label: "企劃" },
  { href: "/admin/friends", label: "朋友" },
  { href: "/admin/rewards", label: "券菜單" },
  { href: "/admin/categories", label: "分類" },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav className="admin-nav">
      {items.map((i) => {
        const active = i.exact ? path === i.href : path.startsWith(i.href);
        return (
          <Link key={i.href} href={i.href} aria-current={active ? "page" : undefined}>{i.label}</Link>
        );
      })}
    </nav>
  );
}
