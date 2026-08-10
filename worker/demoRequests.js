// Real, on-page "Book a Demo" storage — no email client, no mailto:. Reuses
// the same KV namespace as testimonials.js (bound as TESTIMONIALS) under a
// different key prefix, so there's only one KV namespace to set up (see
// TESTIMONIALS_SETUP.md). Until that's configured, this returns a clear
// "not configured" error instead of crashing.

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}

function escapeText(s) {
  return String(s).replace(/[<>]/g, "");
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitDemoRequest(env, body, clientIp) {
  if (!env.TESTIMONIALS) return json({ ok: false, error: "Demo request storage not configured — see TESTIMONIALS_SETUP.md" }, 501);

  const name = (body.name || "").trim();
  const email = (body.email || "").trim();
  const company = (body.company || "").trim();
  const message = (body.message || "").trim();

  if (!name || name.length > 80) return json({ ok: false, error: "Name is required (max 80 characters)" }, 400);
  if (!email || !EMAIL_RE.test(email) || email.length > 150) return json({ ok: false, error: "A valid work email is required" }, 400);
  if (company.length > 150) return json({ ok: false, error: "Company must be under 150 characters" }, 400);
  if (message.length > 800) return json({ ok: false, error: "Message must be under 800 characters" }, 400);

  // Independent rate limit from testimonials, so the two features don't compete for the same window.
  if (clientIp) {
    const rateLimitKey = `ratelimit-demo:${clientIp}`;
    const existing = await env.TESTIMONIALS.get(rateLimitKey);
    if (existing) return json({ ok: false, error: "Please wait a few minutes before submitting again" }, 429);
    await env.TESTIMONIALS.put(rateLimitKey, "1", { expirationTtl: 600 });
  }

  const id = `demo:${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const record = {
    name: escapeText(name),
    email: escapeText(email),
    company: escapeText(company),
    message: escapeText(message),
    submittedAt: Date.now(),
  };
  await env.TESTIMONIALS.put(id, JSON.stringify(record));

  return json({ ok: true });
}
