# 小傑想做的事

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

Postgres 服務一個、Next.js 服務一個。環境變數同 `.env.example`。`SESSION_SECRET` 至少 32 字元。
