const TZ = "Asia/Taipei";

function parts(d: Date | string) {
  const p = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(d));
  const get = (t: string) => p.find((x) => x.type === t)!.value;
  return { y: get("year"), m: get("month"), d: get("day") };
}

export function todayISO() {
  const { y, m, d } = parts(new Date());
  return `${y}-${m}-${d}`;
}

export function monthDay(d: Date | string) {
  const x = parts(d);
  return `${x.m}.${x.d}`;
}

export function yearMonth(d: Date | string) {
  const x = parts(d);
  return `${x.y}.${x.m}`;
}

export function relative(d: Date | string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "剛剛";
  if (m < 60) return `${m} 分鐘前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} 小時前`;
  const day = Math.floor(h / 24);
  if (day < 7) return `${day} 天前`;
  return monthDay(d);
}
