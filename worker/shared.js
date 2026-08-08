export async function safeJson(resp) {
  const text = await resp.text();
  try {
    return { data: JSON.parse(text), raw: text };
  } catch {
    return { data: null, raw: text };
  }
}
