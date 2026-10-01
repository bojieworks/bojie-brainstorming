type Mail = { subject: string; text: string };

export async function notifyOwner(mail: Mail) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  if (!key || !to) {
    console.log(`[notify] ${mail.subject}\n${mail.text}`);
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.FROM_EMAIL ?? "小傑想做的事 <onboarding@resend.dev>",
        to: [to],
        subject: mail.subject,
        text: mail.text,
      }),
    });
    if (!res.ok) console.error("[notify] resend failed", res.status, await res.text());
  } catch (e) {
    console.error("[notify] resend error", e);
  }
}
