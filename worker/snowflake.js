import { safeJson } from "./shared.js";

export async function connectSnowflake(body) {
  const { account, token } = body;
  if (!account || !token) return { ok: false, error: "account and token are required" };

  const resources = [];
  const errors = [];

  try {
    const resp = await fetch(`https://${account}.snowflakecomputing.com/api/v2/statements`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Snowflake-Authorization-Token-Type": "OAUTH",
      },
      body: JSON.stringify({ statement: "SHOW DATABASES", timeout: 30 }),
    });
    const { data, raw } = await safeJson(resp);
    if (!resp.ok || !data) {
      errors.push(`Snowflake: ${data?.message || `HTTP ${resp.status} — ${raw.slice(0, 150)}`}`);
    } else {
      const rows = data.data || [];
      // SHOW DATABASES: name is typically column index 1
      rows.forEach((row) => resources.push({ service: "Snowflake", name: row[1] || row[0], type: "database" }));
    }
  } catch (e) {
    errors.push(`Snowflake: ${e.message}`);
  }

  return { ok: resources.length > 0 || errors.length === 0, resources, errors };
}
