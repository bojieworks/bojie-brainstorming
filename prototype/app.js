/* ---------- 小人 tally ---------- */
const PERSON = `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7" r="4"/><path d="M4 21a8 8 0 0 1 16 0z"/></svg>`;
function tally(count, { size = "", animate = false, newest = false, faded = false, max = 5 } = {}) {
  if (count <= 0) {
    return `<span class="tally empty ${size}" aria-label="還沒有人">${PERSON}</span>`;
  }
  const shown = Math.min(count, max);
  const cls = ["tally", size, animate ? "animate" : "", faded ? "faded" : ""].join(" ");
  let html = "";
  for (let i = 0; i < shown; i++) {
    const isNew = newest && i === shown - 1;
    html += `<i style="--i:${i}"${isNew ? ' class="new"' : ''}>${PERSON}</i>`;
  }
  if (count > max) html += `<b>+${count - max}</b>`;
  return `<span class="${cls}" role="img" aria-label="${count} 人想一起">${html}</span>`;
}
function joinButtonHTML(count, joined) {
  return joined
    ? `你說過想一起 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>`
    : `我也想 👋`;
}
document.querySelectorAll("[data-tally]").forEach(el => {
  const n = +el.dataset.tally;
  el.outerHTML = tally(n, { size: el.dataset.size || "", max: +(el.dataset.max || 8), animate: el.hasAttribute("data-animate"), faded: el.hasAttribute("data-faded") });
});

/* ---------- categories & projects (home) ---------- */
const CATS = {
  outdoor: { name: "戶外", c: "var(--cat-outdoor)" },
  travel:  { name: "旅行", c: "var(--cat-travel)" },
  create:  { name: "創作", c: "var(--cat-create)" },
  learn:   { name: "學習", c: "var(--cat-learn)" },
  project: { name: "專案", c: "var(--cat-project)" },
  life:    { name: "生活", c: "var(--cat-life)" },
};
const STATUS = { forming: "籌備中", active: "進行中" };
const PROJECTS = [
  { id: "trail", emoji: "🏔️", title: "爬大縱走", one: "三天兩夜，從北到南慢慢走，不趕路", cat: "outdoor", status: "forming", effort: "一週以上", when: "10 月", size: "找 3~5 人", count: 6 },
  { id: "climb", emoji: "🧗", title: "每週三去攀岩", one: "下班後兩小時，爬完去吃宵夜", cat: "outdoor", status: "active", effort: "一個下午", when: "每週三", size: "越多越好", count: 8 },
  { id: "podcast", emoji: "🎙️", title: "做 Podcast", one: "兩個人聊天，不剪，錄完就放上去", cat: "create", status: "idea", effort: "長期", when: "隨時", size: "找 1~2 人", count: 2 },
  { id: "county", emoji: "✈️", title: "去一個沒去過的縣市", one: "隨便挑一個，週五晚上出發", cat: "travel", status: "idea", effort: "一個週末", when: "今年內", size: "找 1~2 人", count: 2 },
  { id: "camp", emoji: "🏕️", title: "秋天去露營", one: "什麼都不做的那種，帶書、帶咖啡、帶椅子", cat: "outdoor", status: "idea", effort: "一個週末", when: "11 月", size: "找 3~5 人", count: 4 },
  { id: "island", emoji: "🚗", title: "環島", one: "開車，逆時針，每天只決定明天去哪", cat: "travel", status: "idea", effort: "一週以上", when: "明年春天", size: "找 3~5 人", count: 7 },
  { id: "ramen", emoji: "🍜", title: "吃遍台北的拉麵", one: "一個月一間，吃完打分數", cat: "life", status: "idea", effort: "一個下午", when: "隨時", size: "越多越好", count: 5 },
  { id: "n3", emoji: "📚", title: "一起把日文 N3 考過", one: "一週一次線上讀書會，互相逼", cat: "learn", status: "idea", effort: "長期", when: "明年 7 月", size: "越多越好", count: 3 },
  { id: "zine", emoji: "🎨", title: "做一本 zine", one: "主題還沒想到，先湊到人再說", cat: "create", status: "idea", effort: "一週以上", when: "今年內", size: "找 3~5 人", count: 1 },
  { id: "movie", emoji: "🎬", title: "在頂樓投影放一部電影", one: "借一台投影機，搬幾張椅子上去", cat: "life", status: "idea", effort: "一個下午", when: "夏天", size: "越多越好", count: 3 },
  { id: "bot", emoji: "💻", title: "做一個記帳 LINE bot", one: "自己用的就好，不上架", cat: "project", status: "idea", effort: "長期", when: "隨時", size: "找 1~2 人", count: 0 },
  { id: "half", emoji: "🏃", title: "跑一場半馬", one: "從完全不跑開始，一起練半年", cat: "outdoor", status: "idea", effort: "長期", when: "明年 3 月", size: "越多越好", count: 0 },
];

function cardHTML(p, i) {
  const cat = CATS[p.cat];
  const href = p.id === "trail" ? "project.html" : "project.html";
  return `<a class="card" href="${href}" style="--cat:${cat.c}; animation-delay:${Math.min(i * 50, 300)}ms" data-cat="${p.cat}">
    <div class="row1">
      <span class="emoji" aria-hidden="true">${p.emoji}</span>
      <h3 class="title">${p.title}</h3>
      ${STATUS[p.status] ? `<span class="stamp">${STATUS[p.status]}</span>` : ""}
    </div>
    <p class="one">${p.one}</p>
    <div class="foot">
      <div class="spec"><span>${p.effort}</span><span>${p.when}</span><span>${p.size}</span></div>
      ${p.count > 0 ? tally(p.count, { max: 3 }) : ""}
    </div>
  </a>`;
}

const live = document.getElementById("live-cards");
const ideas = document.getElementById("idea-cards");
if (live && ideas) {
  const liveList = PROJECTS.filter(p => p.status !== "idea");
  const ideaList = PROJECTS.filter(p => p.status === "idea");
  live.innerHTML = liveList.map(cardHTML).join("");
  ideas.innerHTML = ideaList.map(cardHTML).join("");
  document.getElementById("idea-count").textContent = ideaList.length;

  const chips = document.getElementById("chips");
  chips.innerHTML = `<button class="chip" aria-pressed="true" data-cat="all">全部</button>` +
    Object.entries(CATS).map(([k, v]) => `<button class="chip" aria-pressed="false" data-cat="${k}" style="--c:${v.c}"><i></i>${v.name}</button>`).join("");
  chips.addEventListener("click", e => {
    const b = e.target.closest(".chip"); if (!b) return;
    const current = chips.querySelector('[aria-pressed="true"]');
    const next = (b === current && b.dataset.cat !== "all") ? chips.querySelector('[data-cat="all"]') : b;
    chips.querySelectorAll(".chip").forEach(c => c.setAttribute("aria-pressed", c === next));
    const cat = next.dataset.cat;
    const list = cat === "all" ? ideaList : ideaList.filter(p => p.cat === cat);
    ideas.innerHTML = list.length ? list.map(cardHTML).join("")
      : `<p class="empty-line">這個分類還沒有想法，可能是我還沒想到。<button class="linkish" data-cat="all" style="margin-left:8px">看全部</button></p>`;
    document.getElementById("idea-count").textContent = list.length;
    history.replaceState(null, "", cat === "all" ? location.pathname : `?c=${cat}`);
  });
  ideas.addEventListener("click", e => {
    const b = e.target.closest("button[data-cat]"); if (!b) return;
    chips.querySelector('[data-cat="all"]').click();
  });
}

/* ---------- detail: sticky bar + sheet ---------- */
const sheet = document.getElementById("sheet");
if (sheet) {
  const firstCta = document.getElementById("first-cta");
  const sticky = document.getElementById("sticky");
  if (firstCta && sticky) {
    const ctas = [...document.querySelectorAll(".cta-block.mobile-only")];
    const state = new Map();
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => state.set(en.target, en));
      const first = state.get(firstCta);
      const passedFirst = first && !first.isIntersecting && first.boundingClientRect.top < 0;
      const anyVisible = [...state.values()].some(en => en.isIntersecting);
      sticky.classList.toggle("show", !!passedFirst && !anyVisible);
    }, { threshold: 0 });
    ctas.forEach(c => io.observe(c));
  }

  const KEY = "idea.me";
  const JOINED = "idea.joined.trail";
  const me = JSON.parse(localStorage.getItem(KEY) || "{}");
  const COUNT = "idea.count.trail";
  let count = +(localStorage.getItem(COUNT) || sheet.dataset.count);
  const formView = document.getElementById("sheet-form");
  const okView = document.getElementById("sheet-ok");
  const nameInput = document.getElementById("name");
  const submit = document.getElementById("submit");
  const cancelRow = document.getElementById("cancel-row");

  function setJoinedUI(joined) {
    document.querySelectorAll("[data-join]").forEach(b => {
      b.classList.toggle("joined", joined);
      b.classList.toggle("primary", !joined);
      b.innerHTML = joinButtonHTML(count, joined);
    });
    document.querySelectorAll("[data-count-text]").forEach(el => el.textContent = `${count} 人想一起`);
    document.querySelectorAll("[data-count-tally]").forEach(el => el.innerHTML = tally(count, { size: el.dataset.size || "", max: +(el.dataset.max || 8) }));
  }
  const joined = () => localStorage.getItem(JOINED) === "1";
  setJoinedUI(joined());

  function open() {
    formView.classList.remove("hidden"); okView.classList.add("hidden");
    nameInput.value = me.name || "";
    cancelRow.classList.toggle("hidden", !joined());
    document.body.classList.add("sheet-open");
    sheet.setAttribute("aria-hidden", "false");
    setTimeout(() => (me.name ? document.querySelector('input[name="level"]') : nameInput).focus(), 260);
  }
  function close() {
    document.body.classList.remove("sheet-open");
    sheet.setAttribute("aria-hidden", "true");
  }
  document.querySelectorAll("[data-join]").forEach(b => b.addEventListener("click", open));
  document.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", close));
  document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });

  const form = document.getElementById("join-form");
  const validate = () => { submit.disabled = !(nameInput.value.trim() && form.level.value); };
  form.addEventListener("input", validate); validate();

  document.getElementById("contact-toggle").addEventListener("click", e => {
    e.target.closest("p").classList.add("hidden");
    document.getElementById("contact-field").classList.remove("hidden");
    document.getElementById("contact").focus();
  });

  form.addEventListener("submit", e => {
    e.preventDefault();
    submit.disabled = true; submit.textContent = "跟小傑說…";
    setTimeout(() => {
      me.name = nameInput.value.trim();
      localStorage.setItem(KEY, JSON.stringify(me));
      if (!joined()) { count += 1; localStorage.setItem(JOINED, "1"); localStorage.setItem(COUNT, count); }
      formView.classList.add("hidden"); okView.classList.remove("hidden");
      document.getElementById("ok-tally").innerHTML = tally(count, { size: "xl", newest: true, max: 10 });
      document.getElementById("ok-count").textContent = `現在 ${count} 人想一起`;
      setJoinedUI(true);
      submit.disabled = false; submit.textContent = "跟小傑說";
    }, 500);
  });

  document.getElementById("cancel").addEventListener("click", () => {
    localStorage.removeItem(JOINED); count -= 1; localStorage.setItem(COUNT, count); setJoinedUI(false);
    formView.innerHTML = `<div class="success"><h2>好，取消了。</h2><p class="muted">改變心意再按一次。</p></div>`;
    setTimeout(() => { close(); location.reload(); }, 1600);
  });

  document.getElementById("copy")?.addEventListener("click", e => {
    navigator.clipboard?.writeText(location.href);
    const b = e.currentTarget, t = b.innerHTML; b.textContent = "複製好了"; setTimeout(() => (b.innerHTML = t), 1500);
  });
}

/* ---------- 集章卡 ---------- */
const cardPage = document.querySelector(".card-page");
if (cardPage) {
  const PER_COUPON = 3;
  const me = JSON.parse(localStorage.getItem("idea.me") || "{}");
  me.name = cardPage.dataset.friend; me.friend = cardPage.dataset.token;
  localStorage.setItem("idea.me", JSON.stringify(me));

  const STAMPS = [
    { emoji: "🏝️", title: "去蘭嶼待一週", date: "2025.08", href: "done.html" },
    { emoji: "🧑‍🍳", title: "一起做年菜", date: "2025.02", href: "done.html" },
    { emoji: "🖼️", title: "在家辦一場小展", date: "2024.12", href: "done.html" },
    { emoji: "🧗", title: "每週三去攀岩 · 連續來四週", date: "2025.09", href: "project.html", note: "小傑手動蓋的" },
  ];
  const REDEEMED = JSON.parse(localStorage.getItem("idea.redeemed." + me.friend) || "[]");
  const ITEMS = { drink: "請你一杯飲料", help: "幫你一件事", pick: "下一個企劃你來指定" };

  const total = STAMPS.length;
  const slots = Math.max(PER_COUPON, Math.ceil(total / PER_COUPON) * PER_COUPON);
  const grid = document.getElementById("stamp-grid");
  grid.innerHTML = [...Array(slots)].map((_, i) => {
    const s = STAMPS[i];
    return s
      ? `<a class="stamp pop" style="--i:${i}" href="${s.href}" title="${s.title}"><span class="e" aria-hidden="true">${s.emoji}</span><span class="d">${s.date}</span></a>`
      : `<span class="stamp empty" aria-hidden="true"><span class="n">${i + 1}</span></span>`;
  }).join("");

  const toNext = PER_COUPON - (total % PER_COUPON || PER_COUPON);
  document.getElementById("stamp-note").textContent =
    toNext === 0 ? "剛好集滿一排，有一張新的券 ↑" : `再 ${toNext} 章就有下一張券 ↑`;

  const unlocked = Math.floor(total / PER_COUPON);
  const coupons = document.getElementById("coupons");
  function renderCoupons() {
    let html = "";
    for (let i = 0; i < unlocked; i++) {
      const r = REDEEMED[i];
      const from = `第 ${i * PER_COUPON + 1}–${(i + 1) * PER_COUPON} 章`;
      if (!r) html += `<div class="coupon"><div><div class="name">小傑券</div><div class="from">${from}</div></div><button class="btn primary" data-redeem="${i}">兌換</button></div>`;
      else if (!r.done) html += `<div class="coupon pending"><div><div class="name">小傑券 · ${ITEMS[r.item]}</div><div class="from">${from}</div></div><span class="state">等小傑來約</span></div>`;
      else html += `<div class="coupon used"><div><div class="name">小傑券 · ${ITEMS[r.item]}</div><div class="from">${from}</div></div><span class="state">已兌現 ${r.done}</span></div>`;
    }
    html += `<div class="coupon locked"><div><div class="name">下一張</div></div><span class="state">還差 ${toNext || PER_COUPON} 章</span></div>`;
    coupons.innerHTML = html;
  }
  renderCoupons();

  document.getElementById("stamp-list").innerHTML = STAMPS.map(s =>
    `<li><time>${s.date.slice(2)}</time><div><a href="${s.href}">${s.emoji} ${s.title}</a>${s.note ? `<br><span class="muted" style="font-size:13px">${s.note}</span>` : ""}</div></li>`
  ).join("");

  const sheet = document.getElementById("redeem-sheet");
  const form = document.getElementById("redeem-form");
  const submit = document.getElementById("redeem-submit");
  let current = null;
  const open = i => { current = i; form.reset(); submit.disabled = true;
    document.getElementById("redeem-form-view").classList.remove("hidden"); document.getElementById("redeem-ok").classList.add("hidden");
    document.body.classList.add("sheet-open"); sheet.setAttribute("aria-hidden", "false");
    setTimeout(() => form.item[0].focus(), 260); };
  const close = () => { document.body.classList.remove("sheet-open"); sheet.setAttribute("aria-hidden", "true"); };
  coupons.addEventListener("click", e => { const b = e.target.closest("[data-redeem]"); if (b) open(+b.dataset.redeem); });
  document.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", close));
  document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
  form.addEventListener("change", () => { submit.disabled = !form.item.value; });
  form.addEventListener("submit", e => {
    e.preventDefault(); submit.disabled = true; submit.textContent = "跟小傑說…";
    setTimeout(() => {
      REDEEMED[current] = { item: form.item.value };
      localStorage.setItem("idea.redeemed." + me.friend, JSON.stringify(REDEEMED));
      renderCoupons();
      document.getElementById("redeem-form-view").classList.add("hidden"); document.getElementById("redeem-ok").classList.remove("hidden");
      submit.textContent = "跟小傑說";
    }, 500);
  });
}

/* ---------- admin prototype behaviours ---------- */
document.querySelectorAll(".check").forEach(b => b.addEventListener("click", () => {
  const on = b.getAttribute("aria-pressed") !== "true";
  b.setAttribute("aria-pressed", on);
  b.closest("li").classList.toggle("done-row", on);
}));
const statusGroup = document.getElementById("status");
if (statusGroup) {
  const doneFields = document.getElementById("done-fields");
  const sync = () => doneFields.classList.toggle("hidden", statusGroup.querySelector("input:checked").value !== "done");
  statusGroup.addEventListener("change", sync); sync();
  document.getElementById("save").addEventListener("click", () => {
    const s = document.getElementById("saved"); s.textContent = "儲存了 · 剛剛";
  });
}
document.getElementById("copy-link")?.addEventListener("click", e => {
  const b = e.currentTarget; b.textContent = "複製好了"; setTimeout(() => (b.textContent = "複製"), 1500);
});
