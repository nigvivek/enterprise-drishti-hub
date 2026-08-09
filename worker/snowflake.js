import { safeJson, describeUnexpectedResponse } from "./shared.js";

const HTML_HINT = "This usually means the account identifier is wrong (should look like xy12345.us-east-1, not a full URL) or the token has expired.";

export async function connectSnowflake(body) {
  const account = (body.account || "").trim();
  const token = (body.token || "").trim();
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
      errors.push(`Snowflake: ${data?.message || describeUnexpectedResponse(resp, data, raw, HTML_HINT)}`);
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
