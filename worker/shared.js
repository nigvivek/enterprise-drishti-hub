export async function safeJson(resp) {
  const text = await resp.text();
  try {
    return { data: JSON.parse(text), raw: text };
  } catch {
    return { data: null, raw: text };
  }
}

// Detects an HTML response where JSON was expected — almost always means
// the request got redirected to a login/consent page instead of hitting
// the actual API, which usually means the token wasn't accepted.
export function looksLikeHtml(raw) {
  return /^\s*(<!doctype html|<html)/i.test(raw);
}

export function describeUnexpectedResponse(resp, data, raw, htmlHint) {
  if (data) return null; // valid JSON, caller handles it
  if (looksLikeHtml(raw)) {
    return `HTTP ${resp.status} — got a sign-in/HTML page instead of API data. ${htmlHint || "This usually means the token wasn't accepted, or the request was redirected to a login flow instead of the API."}`;
  }
  return `HTTP ${resp.status} — ${raw.slice(0, 150)}`;
}
