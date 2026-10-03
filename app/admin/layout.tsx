import Link from "next/link";
import { AdminNav } from "@/components/admin/admin-nav";
import { logout } from "./login/actions";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="wrap admin">
      <header className="top">
        <Link className="brand" href="/admin">小傑實驗室 <small>後台</small></Link>
        <nav style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Link href="/" target="_blank">看前台 ↗</Link>
          <form action={logout}><button className="linkish" type="submit">登出</button></form>
        </nav>
      </header>
      <AdminNav />
      {children}
    </div>
  );
}
