import { safeJson } from "./shared.js";

export async function connectDatabricks(body) {
  const workspaceUrl = (body.workspaceUrl || "").trim();
  const token = (body.token || "").trim();
  if (!workspaceUrl || !token) return { ok: false, error: "workspaceUrl and token are required" };

  const base = workspaceUrl.replace(/\/$/, "");
  const resources = [];
  const errors = [];

  try {
    const resp = await fetch(`${base}/api/2.1/unity-catalog/catalogs`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const { data } = await safeJson(resp);
    if (resp.ok && data?.catalogs?.length) {
      data.catalogs.forEach((c) => resources.push({ service: "Databricks", name: c.name, type: "catalog" }));
    }
  } catch {
    // Unity Catalog may not be enabled on this workspace — fall through to clusters below.
  }

  if (!resources.length) {
    try {
      const resp = await fetch(`${base}/api/2.0/clusters/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { data, raw } = await safeJson(resp);
      if (!resp.ok || !data) {
        errors.push(`Databricks: ${data?.message || `HTTP ${resp.status} — ${raw.slice(0, 150)}`}`);
      } else {
        (data.clusters || []).forEach((c) => resources.push({ service: "Databricks", name: c.cluster_name, type: "cluster" }));
      }
    } catch (e) {
      errors.push(`Databricks: ${e.message}`);
    }
  }

  return { ok: resources.length > 0 || errors.length === 0, resources, errors };
}
