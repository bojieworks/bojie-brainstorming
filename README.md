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

## 部署（Zeabur）

1. Zeabur 建專案，加一個 **PostgreSQL** 服務。
2. 再加一個 **Git** 服務，連這個 repo。Zeabur 會自動偵測 Next.js。
3. 在 Next.js 服務的 Volumes 掛一個 volume 到 `/data/uploads`。
4. 環境變數：

| 變數 | 值 |
|---|---|
| `DATABASE_URL` | 從 PostgreSQL 服務複製連線字串 |
| `ADMIN_PASSWORD` | 後台密碼 |
| `SESSION_SECRET` | 隨機 32 字元以上 |
| `SITE_URL` | 正式網址，例如 `https://idea.example.tw` |
| `UPLOAD_DIR` | `/data/uploads` |
| `RESEND_API_KEY` | Resend 的 key |
| `NOTIFY_EMAIL` | 收通知的信箱 |
| `FROM_EMAIL` | 可省略，預設用 Resend 測試寄件者 |

5. 部署。啟動指令 `npm start` 會先跑 migration 再啟動。
6. 綁網域，把 `SITE_URL` 改成正式網址後重新部署一次。
