"use client";

export type Me = { name?: string; clientKey: string; friendToken?: string };

const KEY = "idea.me";

export function loadMe(): Me {
  if (typeof window === "undefined") return { clientKey: "" };
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "{}") as Partial<Me>;
    if (!raw.clientKey) {
      raw.clientKey = crypto.randomUUID();
      localStorage.setItem(KEY, JSON.stringify(raw));
    }
    return raw as Me;
  } catch {
    const fresh = { clientKey: crypto.randomUUID() };
    localStorage.setItem(KEY, JSON.stringify(fresh));
    return fresh;
  }
}

export function saveMe(patch: Partial<Me>) {
  const me = { ...loadMe(), ...patch };
  localStorage.setItem(KEY, JSON.stringify(me));
  return me;
}
