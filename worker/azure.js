import { safeJson, describeUnexpectedResponse } from "./shared.js";

const HTML_HINT = "This usually means the access token expired (tokens from `az account get-access-token` last ~1 hour) or wasn't scoped to https://management.azure.com.";

export async function connectAzure(body) {
  const bearerToken = (body.bearerToken || "").trim();
  const subscriptionId = (body.subscriptionId || "").trim();
  if (!bearerToken || !subscriptionId) {
    return { ok: false, error: "bearerToken and subscriptionId are required" };
  }

  const resources = [];
  const errors = [];
  const base = `https://management.azure.com/subscriptions/${subscriptionId}`;

  try {
    const resp = await fetch(`${base}/providers/Microsoft.Storage/storageAccounts?api-version=2023-01-01`, {
      headers: { Authorization: `Bearer ${bearerToken}` },
    });
    const { data, raw } = await safeJson(resp);
    if (!resp.ok || !data) {
      errors.push(`Storage accounts: ${data?.error?.message || describeUnexpectedResponse(resp, data, raw, HTML_HINT)}`);
    } else {
      (data.value || []).forEach((acc) => resources.push({ service: "Blob Storage", name: acc.name, type: acc.kind || "StorageV2" }));
    }
  } catch (e) {
    errors.push(`Storage accounts: ${e.message}`);
  }

  try {
    const resp = await fetch(`${base}/providers/Microsoft.Databricks/workspaces?api-version=2023-02-01`, {
      headers: { Authorization: `Bearer ${bearerToken}` },
    });
    const { data } = await safeJson(resp);
    if (resp.ok && data?.value?.length) {
      data.value.forEach((ws) => resources.push({ service: "Databricks", name: ws.name, type: "workspace" }));
    }
    // Databricks provider may not be registered on the subscription — silently skip rather than error, it's optional.
  } catch {
    // optional resource type, ignore failures
  }

  return { ok: resources.length > 0 || errors.length === 0, resources, errors };
}
