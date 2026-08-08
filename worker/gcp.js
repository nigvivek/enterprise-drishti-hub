import { safeJson } from "./shared.js";

export async function connectGcp(body) {
  const { accessToken, projectId } = body;
  if (!accessToken || !projectId) {
    return { ok: false, error: "accessToken and projectId are required" };
  }

  const resources = [];
  const errors = [];

  try {
    const resp = await fetch(`https://storage.googleapis.com/storage/v1/b?project=${encodeURIComponent(projectId)}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const { data, raw } = await safeJson(resp);
    if (!resp.ok || !data) {
      errors.push(`Cloud Storage: ${data?.error?.message || `HTTP ${resp.status} — ${raw.slice(0, 150)}`}`);
    } else {
      (data.items || []).forEach((b) => resources.push({ service: "Cloud Storage", name: b.name, type: "bucket" }));
    }
  } catch (e) {
    errors.push(`Cloud Storage: ${e.message}`);
  }

  try {
    const resp = await fetch(`https://bigquery.googleapis.com/bigquery/v2/projects/${encodeURIComponent(projectId)}/datasets`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const { data, raw } = await safeJson(resp);
    if (!resp.ok || !data) {
      errors.push(`BigQuery: ${data?.error?.message || `HTTP ${resp.status} — ${raw.slice(0, 150)}`}`);
    } else {
      (data.datasets || []).forEach((d) => resources.push({ service: "BigQuery", name: d.datasetReference?.datasetId, type: "dataset" }));
    }
  } catch (e) {
    errors.push(`BigQuery: ${e.message}`);
  }

  return { ok: resources.length > 0 || errors.length === 0, resources, errors };
}
