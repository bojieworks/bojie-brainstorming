import { DEFAULT_ABOUT, getSetting } from "@/lib/settings";
import { AboutForm } from "./about-form";

export const metadata = { title: "關於頁" };

export default async function AdminAboutPage() {
  const value = await getSetting("about", DEFAULT_ABOUT);
  return (
    <>
      <h1 className="h2">關於頁</h1>
      <p className="muted" style={{ margin: "0 0 20px", fontSize: 14 }}>前台「關於」頁的全部內容。全部刪掉存檔會回到預設文字。</p>
      <div style={{ maxWidth: 720 }}>
        <AboutForm initial={value} />
      </div>
    </>
  );
}
