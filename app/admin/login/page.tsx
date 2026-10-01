import { LoginForm } from "./login-form";

export const metadata = { title: "登入後台" };

export default async function LoginPage(props: PageProps<"/admin/login">) {
  const sp = await props.searchParams;
  const next = typeof sp.next === "string" ? sp.next : "/admin";
  return (
    <div className="wrap admin" style={{ maxWidth: 420 }}>
      <header className="top">
        <span className="brand">小傑想做的事 <small>後台</small></span>
      </header>
      <h1 className="h2" style={{ marginTop: 32 }}>你是小傑嗎</h1>
      <LoginForm next={next} />
    </div>
  );
}
