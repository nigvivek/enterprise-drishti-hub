import { safeJson } from "./shared.js";

export async function connectIbm(body) {
  const { apiKey } = body;
  if (!apiKey) return { ok: false, error: "apiKey is required" };

  const resources = [];
  const errors = [];

  let accessToken;
  try {
    const resp = await fetch("https://iam.cloud.ibm.com/identity/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body: new URLSearchParams({ grant_type: "urn:ibm:params:oauth:grant-type:apikey", apikey: apiKey }),
    });
    const { data, raw } = await safeJson(resp);
    if (!resp.ok || !data) {
      return { ok: false, error: `IAM token exchange failed: ${data?.errorMessage || `HTTP ${resp.status} — ${raw.slice(0, 150)}`}` };
    }
    accessToken = data.access_token;
  } catch (e) {
    return { ok: false, error: `IAM token exchange failed: ${e.message}` };
  }

  try {
    const resp = await fetch("https://resource-controller.cloud.ibm.com/v2/resource_instances", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const { data, raw } = await safeJson(resp);
    if (!resp.ok || !data) {
      errors.push(`Resource instances: ${data?.message || `HTTP ${resp.status} — ${raw.slice(0, 150)}`}`);
    } else {
      (data.resources || []).forEach((r) =>
        resources.push({ service: r.resource_plan_id?.includes("cloud-object-storage") ? "Cloud Object Storage" : "IBM Cloud resource", name: r.name, type: r.state || "instance" })
      );
    }
  } catch (e) {
    errors.push(`Resource instances: ${e.message}`);
  }

  return { ok: resources.length > 0 || errors.length === 0, resources, errors };
}
