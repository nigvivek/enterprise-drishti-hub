// Real, on-page testimonial storage using Cloudflare KV — no email client,
// no mailto:, submissions land directly in storage and are served back to
// the page. Requires a KV namespace bound as TESTIMONIALS in wrangler.jsonc
// (see TESTIMONIALS_SETUP.md) — until that's configured, both endpoints
// return a clear "not configured" error instead of crashing.

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}

function escapeText(s) {
  // Belt-and-suspenders: React already escapes on render, but strip any
  // HTML-looking content at write time too so stored data is plain text.
  return String(s).replace(/[<>]/g, "");
}

export async function listTestimonials(env) {
  if (!env.TESTIMONIALS) return json({ ok: false, error: "Testimonials storage not configured — see TESTIMONIALS_SETUP.md" }, 501);

  const list = await env.TESTIMONIALS.list({ prefix: "testimonial:" });
  const items = await Promise.all(
    list.keys.map(async (k) => {
      const raw = await env.TESTIMONIALS.get(k.name);
      return raw ? JSON.parse(raw) : null;
    })
  );
  const testimonials = items
    .filter(Boolean)
    .sort((a, b) => b.submittedAt - a.submittedAt)
    .slice(0, 30);

  return json({ ok: true, testimonials });
}

export async function submitTestimonial(env, body, clientIp) {
  if (!env.TESTIMONIALS) return json({ ok: false, error: "Testimonials storage not configured — see TESTIMONIALS_SETUP.md" }, 501);

  const name = (body.name || "").trim();
  const title = (body.title || "").trim();
  const org = (body.org || "").trim();
  const quote = (body.quote || "").trim();

  if (!name || name.length > 80) return json({ ok: false, error: "Name is required (max 80 characters)" }, 400);
  if (!quote || quote.length < 20 || quote.length > 500) return json({ ok: false, error: "Testimonial must be 20–500 characters" }, 400);
  if (title.length > 100 || org.length > 100) return json({ ok: false, error: "Title/company must be under 100 characters" }, 400);

  // Basic per-IP rate limit: one submission per 10 minutes.
  if (clientIp) {
    const rateLimitKey = `ratelimit:${clientIp}`;
    const existing = await env.TESTIMONIALS.get(rateLimitKey);
    if (existing) return json({ ok: false, error: "Please wait a few minutes before submitting again" }, 429);
    await env.TESTIMONIALS.put(rateLimitKey, "1", { expirationTtl: 600 });
  }

  const id = `testimonial:${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const record = {
    name: escapeText(name),
    title: escapeText(title),
    org: escapeText(org),
    quote: escapeText(quote),
    submittedAt: Date.now(),
  };
  await env.TESTIMONIALS.put(id, JSON.stringify(record));

  return json({ ok: true, testimonial: record });
}
