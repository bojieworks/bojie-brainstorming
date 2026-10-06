# 小傑實驗室

把想做但還沒做的事公開放著，朋友看到有興趣就按「我也想」。一起做完的事會變成集章卡上的一個章，集滿 3 章換一張小傑券。

- 單一作者：只有小傑能開企劃，朋友不用帳號、不用登入。
- 不是報名：「我也想」只是舉手，後續由小傑私下聯絡。
- 不是社群：沒有留言、按讚、排行榜，全站 `noindex`。

---

## 目錄

- [功能總覽](#功能總覽)
- [技術架構](#技術架構)
- [專案結構](#專案結構)
- [本機開發](#本機開發)
- [環境變數](#環境變數)
- [資料庫與 Migration](#資料庫與-migration)
- [部署](#部署)
- [日常使用](#日常使用)
- [設計系統](#設計系統)
- [安全機制](#安全機制)
- [已知限制](#已知限制)
- [疑難排解](#疑難排解)
- [授權](#授權)

---

## 功能總覽

### 前台（朋友看的）

| 路徑 | 內容 |
|---|---|
| `/` | 首頁：開場、正在發生、想做的事（可依分類篩選，`?c=分類`）、一起做過的 |
| `/p/[slug]` | 企劃詳細頁：三格摘要、想一起的人數、「我也想」、為什麼想做、更新紀錄。狀態為「做完了」時自動切成回顧模式 |
| `/about` | 關於頁，內容由後台編輯，含集章圖解 |
| `/card/[token]` | 朋友的私人集章卡：章、小傑券、兌換 |

**我也想的流程**

1. 朋友按「我也想」，跳出 bottom sheet（桌面版是置中視窗）。
2. 填名字、選「有興趣」或「認真的」，其餘選填：一句話、聯絡方式、是否公開名字。
3. 送出後小傑收到 email，後台待辦多一筆。
4. 同一支手機再按一次是「修改」，可以改內容或取消。

名字預設不公開，其他朋友只看得到人數。

**身份怎麼認**

朋友沒有帳號，網站用兩種方式認人：

- 瀏覽器 localStorage 裡的隨機識別碼，以同一支手機為單位。
- 集章卡連結。打開過一次之後，換手機也認得出是同一個人。

### 後台（小傑用的）

`/admin`，用密碼登入。

| 分頁 | 內容 |
|---|---|
| 待辦 | 還沒聯絡的表態、等兌現的券。勾選即完成 |
| 企劃 | 新增與編輯企劃、改狀態、發更新（可附照片）、看誰想一起、標記不是朋友、刪除 |
| 朋友 | 建人並取得集章卡連結、手動蓋章、看他的券與表態紀錄 |
| 券菜單 | 小傑券可以換的項目 |
| 分類 | 新增、改名、換色、刪除分類。有企劃在用的分類不能刪 |
| 關於頁 | 編輯前台關於頁的文字 |

### 企劃生命週期

```
💭 想法 → 🙌 籌備中 → 🚀 進行中 → ✅ 做完了
任何狀態都可以 → 💤 擱置
```

- 改狀態時，前台更新紀錄會自動加一則，例如「開始籌備了」。
- 「開放加入」是獨立開關。想法和籌備中預設開放，做完了和擱置預設關閉。
- 改成「做完了」時，後台會展開回顧區塊：回顧、照片、一起去的人。勾選的朋友各自自動蓋一章。

### 集章規則

- 一起做完一件事蓋一章。長期企劃由小傑手動蓋，例如「連續來四週」。
- 每 3 章解鎖一張小傑券。
- 章不會被扣，券不會過期。
- 沒有排行榜，朋友之間看不到彼此的卡。

---

## 技術架構

前端與後端都在同一個 Next.js 專案裡，不需要分開部署。

| 層 | 技術 |
|---|---|
| 框架 | Next.js 16（App Router、Server Actions、Turbopack） |
| 語言 | TypeScript |
| UI | React 19，純 CSS，沒有 UI 套件 |
| 資料庫 | PostgreSQL，透過 Drizzle ORM 存取 |
| 驗證 | 單一密碼，加上 `jose` 簽發的 JWT session cookie |
| 圖片 | 瀏覽器先壓縮，伺服器用 `sharp` 轉成 WebP，存到 Cloudflare R2（或本機硬碟） |
| Email | Resend HTTP API |
| 分享圖 | `next/og` 動態產生 Open Graph 圖片 |
| 表單驗證 | Zod |

### 資料流

```
瀏覽器 ──表單──▶ Server Action ──▶ lib/*（商業邏輯）──▶ Drizzle ──▶ Postgres
   │                                    │
   └─ 圖片 ──▶ /api/upload ──▶ sharp ──▶ R2 或本機
                                        └─▶ Resend（通知信）
```

- 頁面全部是動態渲染（`force-dynamic`），每次都讀最新資料，不靠快取。
- 寫入都走 Server Actions，沒有公開的 REST API。唯一的 API 路由是 `/api/upload`。

---

## 專案結構

```
app/
  page.tsx                 首頁
  p/[slug]/                企劃詳細頁、表態 actions、分享圖
  card/[token]/            集章卡、兌換 action
  about/                   關於頁
  admin/                   後台（全部需登入）
    login/                 登入頁與登入 action
    projects/ friends/ rewards/ categories/ about/
    error.tsx              後台錯誤畫面
  api/upload/route.ts      圖片上傳（需登入）
  uploads/[...file]/       本機模式下回傳圖片
  fonts/                   自架的標題字型與授權
  error.tsx global-error.tsx not-found.tsx
  icon.tsx opengraph-image.tsx
  globals.css              全站樣式與設計 token
components/
  public/                  前台元件（卡片、我也想、小人圖示、集章圖解…）
  admin/                   後台元件（企劃表單、圖片欄位、更新面板…）
  card/                    集章卡互動
lib/
  db/schema.ts             資料表定義
  db/index.ts              資料庫連線（延遲建立，build 時不需資料庫）
  auth/                    session 與後台權限檢查
  projects.ts interests.ts friends.ts categories.ts settings.ts
  uploads.ts client-upload.ts
  rate-limit.ts email.ts format.ts labels.ts og.ts use-modal.ts
drizzle/                   SQL migration 檔
scripts/
  migrate.mjs              套用 migration
  huninn-chars.txt         標題字型截字用的字元清單
proxy.ts                   擋未登入者進 /admin
vercel.json                Vercel build 指令
```

---

## 本機開發

### 需求

- Node.js 20.9 以上（開發時用 24）
- Docker，用來跑 Postgres

### 第一次設定

```bash
# 1. 起一個 Postgres（用 5440 避免撞到其他專案的 5432/5433）
docker run -d --name idea-pg \
  -e POSTGRES_USER=idea -e POSTGRES_PASSWORD=idea -e POSTGRES_DB=idea \
  -p 127.0.0.1:5440:5432 postgres:16-alpine

# 2. 環境變數
cp .env.example .env.local
#    至少填：
#    DATABASE_URL=postgres://idea:idea@127.0.0.1:5440/idea
#    ADMIN_PASSWORD=自己設
#    SESSION_SECRET=至少 32 字元的隨機字串
#    SITE_URL=http://localhost:3000

# 3. 安裝並建表
npm install
set -a && . ./.env.local && set +a && npm run db:migrate

# 4. 啟動
npm run dev
```

- 前台：http://localhost:3000
- 後台：http://localhost:3000/admin

第一次進後台，建議依序做這幾件事：

1. 到「券菜單」按「先放三個預設的」。
2. 到「企劃」新增幾個企劃，記得打開「已發布」。

分類已經內建六個：戶外、旅行、創作、學習、專案、生活。

### 之後每次開發

```bash
docker start idea-pg   # 如果容器停了
npm run dev
```

### 指令

| 指令 | 用途 |
|---|---|
| `npm run dev` | 開發伺服器 |
| `npm run build` | 正式版 build |
| `npm start` | 先套用 migration 再啟動正式版，給 VPS 或 Zeabur 用 |
| `npm run typecheck` | TypeScript 型別檢查 |
| `npm run db:generate` | 依 `lib/db/schema.ts` 的變更產生新的 migration 檔 |
| `npm run db:migrate` | 套用 migration，需要 `DATABASE_URL` |

### 在手機上看

手機跟電腦連同一個 Wi-Fi，用電腦的區網 IP 開。查 IP 的指令：

```bash
ipconfig getifaddr en0
```

例如 `http://192.168.0.10:3000`。

---

## 環境變數

| 變數 | 必填 | 說明 |
|---|---|---|
| `DATABASE_URL` | 是 | Postgres 連線字串 |
| `ADMIN_PASSWORD` | 是 | 後台登入密碼 |
| `SESSION_SECRET` | 是 | 簽 session cookie 用，至少 32 字元。換掉它會讓所有人登出 |
| `SITE_URL` | 是 | 網站網址，不要結尾斜線。用在通知信連結、集章卡連結、分享圖網址 |
| `RESEND_API_KEY` | 否 | 沒設就不寄信，通知內容只印在伺服器 log |
| `NOTIFY_EMAIL` | 否 | 收通知的信箱，跟 `RESEND_API_KEY` 一起設才會寄 |
| `FROM_EMAIL` | 否 | 寄件者。預設是 Resend 的測試寄件者 `onboarding@resend.dev` |
| `R2_ACCOUNT_ID` | 否 | Cloudflare 帳號 ID |
| `R2_ACCESS_KEY_ID` | 否 | R2 API token 的 Access Key ID |
| `R2_SECRET_ACCESS_KEY` | 否 | R2 API token 的 Secret |
| `R2_BUCKET` | 否 | R2 bucket 名稱 |
| `R2_PUBLIC_URL` | 否 | bucket 的公開網址，例如 `https://pub-xxxx.r2.dev` |
| `UPLOAD_DIR` | 否 | 沒設 R2 時圖片存放的資料夾，預設 `./data/uploads` |

R2 的五個變數要全部設了才會啟用，少一個就退回存本機硬碟。

產生 `SESSION_SECRET`：

```bash
openssl rand -base64 48
```

---

## 資料庫與 Migration

### 資料表

| 表 | 用途 |
|---|---|
| `projects` | 企劃 |
| `updates` | 企劃的更新紀錄，`kind` 分 `manual`（手動）與 `system`（改狀態自動產生） |
| `interests` | 「我也想」的表態。取消是軟刪除（`cancelled_at`），不是朋友是 `status = spam` |
| `friends` | 有集章卡的朋友，`token` 就是卡片網址的那一段 |
| `stamps` | 章 |
| `reward_items` | 券菜單 |
| `redemptions` | 兌換紀錄，`(friend_id, coupon_index)` 唯一，同一張券不能換兩次 |
| `categories` | 分類 |
| `settings` | 站台文字設定，目前只有關於頁 |
| `rate_limits` | 表態與登入的次數計數 |

想一起的人數和可用的券都是即時計算，不另外存。

### 改資料表結構的流程

1. 修改 `lib/db/schema.ts`。
2. 執行 `npm run db:generate`，會在 `drizzle/` 產生新的 SQL 檔。
3. **打開那個 SQL 檔檢查。** 改欄位型別、要轉換舊資料時，通常需要手動補 `USING` 或 `UPDATE`。
4. 執行 `npm run db:migrate` 套用到本機。
5. commit 時把 SQL 檔和 `drizzle/meta` 一起 commit。

部署時 migration 會自動執行，不用手動跑。

### 備份

Neon 有時間點還原，保留時間依方案而定。要自己留一份的話：

```bash
pg_dump "$DATABASE_URL" > backup-$(date +%F).sql
```

---

## 部署

建議用全部免費的組合：

| 角色 | 服務 | 免費額度 |
|---|---|---|
| 網站（前端加後端） | Vercel Hobby | 個人非商業用途 |
| 資料庫 | Neon Free | 0.5GB，閒置 5 分鐘後休眠，喚醒約 1 秒 |
| 圖片 | Cloudflare R2 | 10GB 儲存，讀取流量不收費 |
| Email | Resend | 每天 100 封 |

### 步驟

**1. GitHub**

把程式推到 GitHub repo，建議設為 private。

**2. Neon（資料庫）**

1. 到 neon.tech 註冊，建一個 Project，region 選 Singapore 或 Tokyo。
2. 在 Dashboard 的 Connection string 複製連線字串，選 pooled 版本。這串就是 `DATABASE_URL`。

**3. Cloudflare R2（圖片）**

1. 到 Cloudflare Dashboard → R2 → Create bucket，例如 `bojie-lab`。
2. 打開 bucket 的 Settings → Public access → 開啟 R2.dev subdomain，拿到 `https://pub-xxxx.r2.dev`，填進 `R2_PUBLIC_URL`。
3. 回 R2 首頁 → Manage R2 API Tokens → Create API token，權限選 Object Read & Write，範圍限定這個 bucket。
4. 記下 Access Key ID、Secret Access Key，以及頁面上的 Account ID。

**4. Resend（Email）**

到 resend.com 註冊，建一個 API Key。沒有自己的網域時，只能寄到註冊 Resend 用的那個信箱，所以 `NOTIFY_EMAIL` 要填那個。

**5. Vercel（網站）**

1. 到 vercel.com 用 GitHub 登入 → Add New → Project → 選這個 repo。
2. Framework 會自動偵測為 Next.js。Build Command 已經寫在 `vercel.json`，不用改。
3. 在 Environment Variables 填上[環境變數](#環境變數)。`DATABASE_URL` **只勾 Production**，見下方說明。
4. 按 Deploy。build 時會自動建資料表。
5. 完成後拿到 `https://專案名.vercel.app`。把 `SITE_URL` 改成這個網址，然後重新部署一次。

**6. 自訂網域（可選）**

在 Vercel 專案的 Settings → Domains 加網域，照它給的 DNS 設定去網域商那邊設。完成後記得改 `SITE_URL` 並重新部署。

### 部署後檢查

- [ ] 首頁、詳細頁、關於頁都打得開
- [ ] 後台登入正常
- [ ] 新增企劃並上傳一張手機照片，前台看得到圖
- [ ] 用另一支手機按「我也想」，信箱收到通知
- [ ] 把企劃連結貼到 LINE，有預覽圖
- [ ] 建一個朋友，打開集章卡連結正常

### Preview 部署

`scripts/migrate.mjs` 只在 Vercel 的 Production build 執行 migration，Preview build 會跳過。

但 Preview 部署在執行時一樣會連 `DATABASE_URL`。為了避免測試資料寫進正式資料庫，有兩種做法：

- 這個變數只勾 Production 環境，Preview 就打不開資料庫相關頁面。
- 在 Neon 開一個分支資料庫，把它的連線字串設在 Preview 環境。

### 其他主機（VPS、Zeabur、Docker）

- `npm run build`，然後 `npm start`。`start` 會先跑 migration 再啟動。
- 圖片可以不用 R2：掛一個持久化的 volume，設 `UPLOAD_DIR` 指向它，圖片會從 `/uploads/...` 回傳。

---

## 日常使用

| 想做的事 | 去哪裡 |
|---|---|
| 寫下新想法 | 後台 → 企劃 → 寫下一個想法。先不打開「已發布」，就只有你看得到 |
| 有人想一起 | 會收到 email。後台待辦勾「已聯絡」 |
| 人夠了要開始 | 企劃編輯頁把狀態改成「籌備中」，填確定日期。前台會出現「加入 Google 日曆」 |
| 發近況 | 企劃編輯頁右側「發一則更新」，可附一張照片 |
| 做完了 | 狀態改「做完了」，填回顧、傳照片、勾一起去的朋友，他們會自動蓋章 |
| 給朋友集章卡 | 後台 → 朋友 → 建立 → 複製連結，用 LINE 私下傳給他 |
| 長期活動蓋章 | 朋友頁 →「手動蓋一章」 |
| 朋友要兌換 | 會收到 email。兌現後在待辦勾掉 |
| 改關於頁 | 後台 → 關於頁。空一行分段，`## ` 開頭是小標題，單獨一行 `[集章圖解]` 會放入圖解 |
| 分享企劃 | 直接複製企劃網址。LINE 和 FB 會自動抓預覽圖 |

**填參考連結的格式**

一行一個，「名稱 網址」，例如 `路線紀錄 https://...`。網址要 http 或 https 開頭，其他格式會被忽略。只填網址的話，前台會顯示網域名稱。

---

## 設計系統

氣質是「朋友攤開給你翻的企劃筆記本」。

### 顏色

所有顏色都是 `app/globals.css` 開頭的 CSS 變數。

| 變數 | 色值 | 用途 |
|---|---|---|
| `--paper` | `#f2f4f0` | 頁面底色 |
| `--surface` | `#fbfcfa` | 卡片、輸入框 |
| `--ink` | `#1b2027` | 主要文字 |
| `--ink-2` | `#5c6470` | 次要文字 |
| `--line` | `#d6dad3` | 格線、邊框 |
| `--hl` | `#ffe34d` | 螢光筆黃，唯一的強調色，用在主要按鈕與劃重點 |

分類色在後台「分類」設定。

### 字體

| 用途 | 字體 | 載入方式 |
|---|---|---|
| 標題 | Lab Rounded（jf open 粉圓的截字版） | 自架，`app/fonts/lab-rounded.woff2`，約 1.1MB |
| 內文 | Noto Sans TC | `next/font/google`，依字元範圍按需下載 |
| 規格、日期 | IBM Plex Mono | `next/font/google` |
| 手寫旁注 | 芫荽 Iansui | `next/font/google` |

### 標題字型要加字時

截字範圍是 Big5 常用字 5401 字加英數標點，清單在 `scripts/huninn-chars.txt`。標題用到範圍外的字時，那個字會以 Noto Sans TC 顯示。要補字的步驟：

```bash
python3 -m venv /tmp/fontenv && /tmp/fontenv/bin/pip install fonttools brotli
curl -L -o /tmp/huninn.ttf https://cdn.jsdelivr.net/gh/justfont/open-huninn-font@master/font/jf-openhuninn-2.1.ttf
# 把要加的字貼到 scripts/huninn-chars.txt 結尾
/tmp/fontenv/bin/pyftsubset /tmp/huninn.ttf --text-file=scripts/huninn-chars.txt \
  --flavor=woff2 --layout-features='*' --output-file=/tmp/sub.woff2
```

截完之後還要把字型內部名稱改成 Lab Rounded 再存回 `app/fonts/lab-rounded.woff2`。原因是「huninn」是授權保留的字型名稱，修改版不能沿用，詳見[授權](#授權)。

### 斷點

| 寬度 | 版面 |
|---|---|
| < 768px | 單欄、底部 sticky 按鈕、bottom sheet |
| ≥ 768px | 首頁卡片兩欄 |
| ≥ 960px | 詳細頁右側摘要卡，視窗改成置中 |

所有動畫都會尊重系統的「減少動態效果」設定。

---

## 安全機制

| 項目 | 做法 |
|---|---|
| 後台登入 | 單一密碼，比對內容時不會提早結束，避免從回應時間猜出密碼。成功後發 30 天的 HttpOnly session cookie，正式環境加 Secure |
| 後台保護 | `proxy.ts` 擋 `/admin/*` 路徑。每個後台 Server Action 開頭再用 `requireAdmin()` 檢查一次 |
| 圖片上傳 | 需要登入，只收圖片，伺服器重新編碼成 WebP |
| 次數限制 | 同一 IP 每 10 分鐘最多表態 5 次、登入失敗 5 次 |
| 防機器人 | 表態表單有 honeypot 欄位 |
| 集章卡 | 22 字元隨機 token，猜不到。頁面設 noindex |
| 不是朋友 | 被標記的人再送表態，不會新增、不會寄信、不算人數 |
| 搜尋引擎 | 全站 noindex |

---

## 已知限制

- **換手機認不出人**：沒有集章卡的朋友換手機再表態，會變成第二筆。後台會標「同名已有一筆」提醒你。
- **HEIC 照片**：只有 Safari 能在瀏覽器裡壓縮 HEIC，其他瀏覽器會原檔上傳。從 iPhone 相簿選照片通常會自動轉成 JPEG。
- **Vercel 上傳上限 4.5MB**：照片會先在瀏覽器縮到 1600px，正常照片都遠低於上限。
- **Neon 休眠**：閒置 5 分鐘後第一個訪客會多等約 1 秒。
- **Resend 沒有自有網域時**：只能寄到註冊信箱。
- **分享圖字型**：產圖時即時向 Google Fonts 取字，取不到就不產圖。
- **沒有自動化測試與 Lint**：目前只有型別檢查。

---

## 疑難排解

**新增頁面後 dev server 回 404**

Turbopack 快取沒更新，重啟 `npm run dev`。

**`DATABASE_URL is not set`**

本機沒載入 `.env.local`。`npm run dev` 會自動讀，但 `npm run db:migrate` 不會，要先執行：

```bash
set -a && . ./.env.local && set +a
```

**`password authentication failed for user "idea"`**

port 被其他 Postgres 佔用，例如另一個專案也用 5433。用以下指令查是誰佔著，再換一個 port：

```bash
lsof -i :5440
```

**後台一直跳回登入頁**

- 可能是 `SESSION_SECRET` 換過，或少於 32 字元。
- 也可能是 10 分鐘內密碼輸錯 5 次，等 10 分鐘再試。

**上傳圖片失敗**

- 正式環境：檢查 R2 的五個變數都有設，而且 token 有 Object Write 權限。
- 本機：檢查 `data/uploads` 可以寫入。

**收不到通知信**

- 看伺服器 log 有沒有 `[notify]` 字樣。有的話代表沒設 `RESEND_API_KEY` 或 `NOTIFY_EMAIL`。
- 有自己網域的話，要在 Resend 驗證網域後才能改 `FROM_EMAIL`。

**LINE 預覽圖是舊的或沒有**

- 確認 `SITE_URL` 是正式網址。
- LINE 會快取預覽圖。在網址後面加 `?v=2` 再分享，就會重新抓。

---

## 授權

- 程式碼：私人專案，未開放授權。
- 標題字型：衍生自 [jf open 粉圓](https://github.com/justfont/open-huninn-font) 2.1，採 SIL Open Font License 1.1，全文見 `app/fonts/OFL-huninn.txt`。截字後屬於修改版，依授權規定不得使用保留名稱「open huninn」「huninn」，因此改名為 Lab Rounded。
- 其餘字體 Noto Sans TC、IBM Plex Mono、芫荽，透過 Google Fonts 以 OFL 授權使用。
