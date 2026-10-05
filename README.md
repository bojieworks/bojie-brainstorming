# 小傑實驗室

把想做但還沒做的事公開，讓朋友說「我也想」。

## 本機開發

```bash
docker run -d --name idea-pg -e POSTGRES_USER=idea -e POSTGRES_PASSWORD=idea -e POSTGRES_DB=idea -p 127.0.0.1:5440:5432 postgres:16-alpine
cp .env.example .env.local   # 填 DATABASE_URL、ADMIN_PASSWORD、SESSION_SECRET
npm install
npm run db:migrate
npm run dev
```

後台在 `/admin`，用 `ADMIN_PASSWORD` 登入。

## 指令

- `npm run db:generate` 依 `lib/db/schema.ts` 產生 migration
- `npm run db:migrate` 套用 migration（部署時也跑這個）

## 部署（Vercel + Neon + Cloudflare R2）

全部免費方案。前端與後端都在 Next.js 裡，只需要一個 Vercel 專案。

1. **Neon**：建專案，複製連線字串當 `DATABASE_URL`。
2. **Cloudflare R2**：建 bucket，開啟公開存取拿到公開網址，建一組 API token（Object Read & Write）。
3. **Resend**：拿 API key。
4. **Vercel**：Import 這個 GitHub repo，填環境變數，Deploy。build 會先跑 migration。

| 變數 | 值 |
|---|---|
| `DATABASE_URL` | Neon 連線字串 |
| `ADMIN_PASSWORD` | 後台密碼 |
| `SESSION_SECRET` | 隨機 32 字元以上 |
| `SITE_URL` | 正式網址，例如 `https://bojie-lab.vercel.app` |
| `R2_ACCOUNT_ID` | Cloudflare 帳號 ID |
| `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` | R2 API token |
| `R2_BUCKET` | bucket 名稱 |
| `R2_PUBLIC_URL` | bucket 的公開網址，例如 `https://pub-xxxx.r2.dev` |
| `RESEND_API_KEY` | Resend 的 key |
| `NOTIFY_EMAIL` | 收通知的信箱 |
| `FROM_EMAIL` | 可省略 |

沒有設 R2 變數時，圖片會存到本機 `UPLOAD_DIR`（本機開發用）。

**Preview 部署**：build 只在 Production 跑 migration。`DATABASE_URL` 建議只勾 Production 環境；要測 Preview，在 Neon 開一個分支資料庫給 Preview 用，免得測試資料寫進正式資料庫。

### 其他主機（Zeabur、VPS）

`npm start` 會先跑 migration 再啟動。圖片可以不用 R2，改掛 volume 並設 `UPLOAD_DIR`。
