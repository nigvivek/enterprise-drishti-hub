import { safeJson, describeUnexpectedResponse } from "./shared.js";

const HTML_HINT =
  "For Databricks specifically: this almost always means either (1) the personal access token is expired/revoked — " +
  "generate a fresh one under User Settings → Developer → Access tokens, (2) PATs are disabled for this workspace " +
  "by an admin (Admin Console → Advanced → Personal Access Tokens), or (3) the workspace enforces SSO in a way that " +
  "intercepts API requests too, not just browser logins — ask your workspace admin whether token auth is permitted " +
  "for the API. Also double-check the workspace URL has no trailing path (should end at .cloud.databricks.com or " +
  "similar, not something like /login or a specific page).";

export async function browseDatabricksSchemas(body) {
  const workspaceUrl = (body.workspaceUrl || "").trim();
  const token = (body.token || "").trim();
  const catalogName = (body.catalogName || "").trim();
  if (!workspaceUrl || !token || !catalogName) {
    return { ok: false, error: "workspaceUrl, token, and catalogName are required" };
  }
  const base = workspaceUrl.replace(/\/$/, "");
  try {
    const resp = await fetch(`${base}/api/2.1/unity-catalog/schemas?catalog_name=${encodeURIComponent(catalogName)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const { data, raw } = await safeJson(resp);
    if (!resp.ok || !data) {
      return { ok: false, error: data?.message || describeUnexpectedResponse(resp, data, raw) };
    }
    return { ok: true, schemas: (data.schemas || []).map((s) => ({ name: s.name, fullName: s.full_name })) };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

export async function browseDatabricksTables(body) {
  const workspaceUrl = (body.workspaceUrl || "").trim();
  const token = (body.token || "").trim();
  const catalogName = (body.catalogName || "").trim();
  const schemaName = (body.schemaName || "").trim();
  if (!workspaceUrl || !token || !catalogName || !schemaName) {
    return { ok: false, error: "workspaceUrl, token, catalogName, and schemaName are required" };
  }
  const base = workspaceUrl.replace(/\/$/, "");
  try {
    const resp = await fetch(`${base}/api/2.1/unity-catalog/tables?catalog_name=${encodeURIComponent(catalogName)}&schema_name=${encodeURIComponent(schemaName)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const { data, raw } = await safeJson(resp);
    if (!resp.ok || !data) {
      return { ok: false, error: data?.message || describeUnexpectedResponse(resp, data, raw) };
    }
    return { ok: true, tables: (data.tables || []).map((t) => ({ name: t.name, fullName: t.full_name, type: t.table_type })) };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

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
        errors.push(`Databricks: ${data?.message || describeUnexpectedResponse(resp, data, raw, HTML_HINT)}`);
      } else {
        (data.clusters || []).forEach((c) => resources.push({ service: "Databricks", name: c.cluster_name, type: "cluster" }));
      }
    } catch (e) {
      errors.push(`Databricks: ${e.message}`);
    }
  }

  return { ok: resources.length > 0 || errors.length === 0, resources, errors };
}
