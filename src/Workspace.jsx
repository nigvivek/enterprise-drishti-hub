import React, { useState, useRef, useEffect } from "react";
import {
  ShieldCheck, LogOut, FolderPlus, Folder, Cloud, Database, FileText, Check,
  Loader2, ExternalLink, History, Save, Rocket, ChevronDown, Lock, FlaskConical, ArrowRight,
  UploadCloud, X, Home,
} from "lucide-react";
import { T, FONT_IMPORT } from "./tokens.js";
import { MODULE_LIST } from "./modules.js";
import {
  getUser, signOut, isGuest,
  getProjects, createProject, updateProject,
  getConnections, upsertConnection,
  getHistory, addHistoryEntry,
} from "./store.js";
import DataLayerDiagram from "./DataLayerDiagram.jsx";
import ChatAssistant from "./ChatAssistant.jsx";

const CONNECTOR_DEFS = [
  { id: "aws", name: "Amazon Web Services", category: "cloud", icon: Cloud, live: true,
    fields: [["accessKeyId", "Access Key ID", "text"], ["secretAccessKey", "Secret Access Key", "password"], ["sessionToken", "Session Token (optional)", "password"], ["region", "Region (e.g. us-east-1)", "text"]] },
  { id: "azure", name: "Microsoft Azure", category: "cloud", icon: Cloud, live: true,
    fields: [["bearerToken", "Access token (az account get-access-token)", "password"], ["subscriptionId", "Subscription ID", "text"]] },
  { id: "gcp", name: "Google Cloud Platform", category: "cloud", icon: Cloud, live: true,
    fields: [["accessToken", "Access token (gcloud auth print-access-token)", "password"], ["projectId", "Project ID", "text"]] },
  { id: "ibm", name: "IBM Cloud", category: "cloud", icon: Cloud, live: true,
    fields: [["apiKey", "IBM Cloud API key", "password"]] },
  { id: "snowflake", name: "Snowflake", category: "database", icon: Database, live: true,
    fields: [["account", "Account identifier (e.g. xy12345.us-east-1)", "text"], ["token", "Personal access / OAuth token", "password"]] },
  { id: "databricks", name: "Databricks", category: "database", icon: Database, live: true,
    fields: [["workspaceUrl", "Workspace URL (https://...cloud.databricks.com)", "text"], ["token", "Personal access token", "password"]] },
  { id: "mysql", name: "MySQL", category: "database", icon: Database, live: false, fields: [["host", "Host", "text"], ["port", "Port", "text"], ["database", "Database name", "text"]] },
  { id: "oracle", name: "Oracle", category: "database", icon: Database, live: false, fields: [["host", "Host", "text"], ["port", "Port / Service name", "text"], ["database", "Database name", "text"]] },
  { id: "teradata", name: "Teradata", category: "database", icon: Database, live: false, fields: [["host", "Host", "text"], ["port", "Port", "text"], ["database", "Database name", "text"]] },
  { id: "files", name: "Files", category: "file", icon: FileText, live: false, fields: [["source", "Source (Local / SharePoint / Drive / S3)", "text"], ["nickname", "Nickname", "text"]] },
];

function ScopeButton({ label, onClick }) {
  return (
    <button onClick={onClick} style={{ fontSize: 9.5, fontWeight: 600, color: T.coral, background: "none", border: `1px solid ${T.coral}55`, borderRadius: 5, padding: "2px 6px", cursor: "pointer", whiteSpace: "nowrap" }}>
      {label}
    </button>
  );
}

function S3Browser({ bucket, getCreds, onSelectScope }) {
  const [open, setOpen] = useState(false);
  const [prefix, setPrefix] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  const load = async (p) => {
    const creds = getCreds();
    if (!creds) { setError("Reconnect first — credentials for this session aren't cached (e.g. after a page reload)."); return; }
    setLoading(true);
    setError("");
    try {
      const resp = await fetch("/api/browse/s3-objects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...creds, bucket, prefix: p }),
      });
      const result = await resp.json();
      if (!result.ok) { setError(result.error || "Browse failed"); setLoading(false); return; }
      setData(result);
      setPrefix(p);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const toggle = () => {
    if (!open) load("");
    setOpen(!open);
  };

  return (
    <div style={{ borderTop: `1px solid ${T.border}`, padding: "6px 8px" }}>
      <button onClick={toggle} style={{ fontSize: 10, color: T.cyan, background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 4 }}>
        {open ? "Hide" : "Browse"} objects <ChevronDown size={9} style={{ transform: open ? "rotate(180deg)" : "none" }} />
      </button>
      {open && (
        <div style={{ marginTop: 6 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 9.5, color: T.mutedDim, fontFamily: "IBM Plex Mono" }}>s3://{bucket}/{prefix}</span>
            <ScopeButton label="Use this path" onClick={() => onSelectScope({ level: "bucket/prefix", path: `s3://${bucket}/${prefix}` })} />
          </div>
          {loading && <div style={{ fontSize: 10, color: T.mutedDim }}>Loading…</div>}
          {error && <div style={{ fontSize: 10, color: T.red }}>{error}</div>}
          {data && (
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {prefix && (
                <button onClick={() => load(prefix.split("/").slice(0, -2).join("/") + (prefix.split("/").length > 2 ? "/" : ""))} style={{ fontSize: 10, color: T.muted, background: "none", border: "none", textAlign: "left", cursor: "pointer", padding: "3px 0" }}>
                  .. (up one level)
                </button>
              )}
              {data.folders.map((f) => (
                <div key={f.path} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <button onClick={() => load(f.path)} style={{ fontSize: 10.5, color: T.amber, background: "none", border: "none", textAlign: "left", cursor: "pointer", padding: "3px 0" }}>
                    📁 {f.name}
                  </button>
                  <ScopeButton label="Use" onClick={() => onSelectScope({ level: "prefix", path: `s3://${bucket}/${f.path}` })} />
                </div>
              ))}
              {data.files.map((file) => (
                <div key={file.path} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 10.5, color: T.text, padding: "3px 0" }}>{file.name}</span>
                  <ScopeButton label="Use" onClick={() => onSelectScope({ level: "object", path: `s3://${bucket}/${file.path}` })} />
                </div>
              ))}
              {!data.folders.length && !data.files.length && <div style={{ fontSize: 10, color: T.mutedDim }}>Empty.</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DatabricksBrowser({ catalog, getCreds, onSelectScope }) {
  const [open, setOpen] = useState(false);
  const [schemas, setSchemas] = useState(null);
  const [expandedSchema, setExpandedSchema] = useState(null);
  const [tables, setTables] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadSchemas = async () => {
    const creds = getCreds();
    if (!creds) { setError("Reconnect first — credentials for this session aren't cached (e.g. after a page reload)."); return; }
    setLoading(true);
    setError("");
    try {
      const resp = await fetch("/api/browse/databricks-schemas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...creds, catalogName: catalog }),
      });
      const result = await resp.json();
      if (!result.ok) { setError(result.error || "Browse failed"); setLoading(false); return; }
      setSchemas(result.schemas);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const loadTables = async (schemaName) => {
    if (expandedSchema === schemaName) { setExpandedSchema(null); return; }
    setExpandedSchema(schemaName);
    if (tables[schemaName]) return;
    const creds = getCreds();
    try {
      const resp = await fetch("/api/browse/databricks-tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...creds, catalogName: catalog, schemaName }),
      });
      const result = await resp.json();
      setTables((prev) => ({ ...prev, [schemaName]: result.ok ? result.tables : [] }));
    } catch {
      setTables((prev) => ({ ...prev, [schemaName]: [] }));
    }
  };

  const toggle = () => {
    if (!open && !schemas) loadSchemas();
    setOpen(!open);
  };

  return (
    <div style={{ borderTop: `1px solid ${T.border}`, padding: "6px 8px" }}>
      <button onClick={toggle} style={{ fontSize: 10, color: T.cyan, background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 4 }}>
        {open ? "Hide" : "Browse"} schemas & tables <ChevronDown size={9} style={{ transform: open ? "rotate(180deg)" : "none" }} />
      </button>
      {open && (
        <div style={{ marginTop: 6 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 9.5, color: T.mutedDim, fontFamily: "IBM Plex Mono" }}>{catalog}</span>
            <ScopeButton label="Use this catalog" onClick={() => onSelectScope({ level: "catalog", path: catalog })} />
          </div>
          {loading && <div style={{ fontSize: 10, color: T.mutedDim }}>Loading…</div>}
          {error && <div style={{ fontSize: 10, color: T.red }}>{error}</div>}
          {schemas && (
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {schemas.map((s) => (
                <div key={s.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <button onClick={() => loadTables(s.name)} style={{ fontSize: 10.5, color: T.amber, background: "none", border: "none", textAlign: "left", cursor: "pointer", padding: "3px 0" }}>
                      🗂 {s.name}
                    </button>
                    <ScopeButton label="Use schema" onClick={() => onSelectScope({ level: "schema", path: `${catalog}.${s.name}` })} />
                  </div>
                  {expandedSchema === s.name && (
                    <div style={{ marginLeft: 14, display: "flex", flexDirection: "column", gap: 3 }}>
                      {!tables[s.name] && <div style={{ fontSize: 10, color: T.mutedDim }}>Loading tables…</div>}
                      {tables[s.name]?.map((t) => (
                        <div key={t.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 10.5, color: T.text, padding: "2px 0" }}>{t.name}</span>
                          <ScopeButton label="Use table" onClick={() => onSelectScope({ level: "table", path: `${catalog}.${s.name}.${t.name}` })} />
                        </div>
                      ))}
                      {tables[s.name]?.length === 0 && <div style={{ fontSize: 10, color: T.mutedDim }}>No tables.</div>}
                    </div>
                  )}
                </div>
              ))}
              {!schemas.length && <div style={{ fontSize: 10, color: T.mutedDim }}>No schemas found.</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileConnector({ connection, onConnect }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);
  const files = connection?.resources || [];

  const addFiles = (fileList) => {
    const newEntries = Array.from(fileList).map((f) => ({
      service: "File", type: f.type || "unknown", name: f.name, size: f.size,
    }));
    if (!newEntries.length) return;
    onConnect({
      id: "files", name: "Files", category: "file", status: "connected", live: true,
      meta: {}, resources: [...files, ...newEntries], connectedAt: new Date().toISOString(),
    });
  };

  const removeFile = (name) => {
    const remaining = files.filter((f) => f.name !== name);
    onConnect({
      id: "files", name: "Files", category: "file", status: remaining.length ? "connected" : "not connected",
      meta: {}, resources: remaining, connectedAt: new Date().toISOString(),
    });
  };

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
        style={{
          border: `1.5px dashed ${dragOver ? T.coral : T.borderLight}`, borderRadius: 12, padding: "22px 16px",
          textAlign: "center", background: dragOver ? T.coralDim : T.panelAlt, transition: "all .15s", marginBottom: files.length ? 14 : 0,
        }}
      >
        <UploadCloud size={22} color={dragOver ? T.coral : T.mutedDim} style={{ marginBottom: 8 }} />
        <div style={{ fontSize: 12.5, color: T.text, fontWeight: 500 }}>Drop files here, or</div>
        <button
          onClick={() => inputRef.current?.click()}
          style={{ marginTop: 8, fontSize: 11.5, fontWeight: 600, color: T.coral, border: `1px solid ${T.coral}55`, padding: "6px 12px", borderRadius: 8, background: T.coralDim, cursor: "pointer" }}
        >
          Browse files
        </button>
        <input ref={inputRef} type="file" multiple style={{ display: "none" }} onChange={(e) => addFiles(e.target.files)} />
        <div style={{ fontSize: 10, color: T.mutedDim, marginTop: 8 }}>
          File names, sizes, and types are captured for reference — content isn't uploaded anywhere by this connector.
        </div>
      </div>

      {files.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {files.map((f) => (
            <div key={f.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 11px", background: T.panelAlt, borderRadius: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                <FileText size={13} color={T.coral} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                <span style={{ fontSize: 10.5, color: T.mutedDim, fontFamily: "IBM Plex Mono", flexShrink: 0 }}>{formatBytes(f.size)}</span>
              </div>
              <button onClick={() => removeFile(f.name)} style={{ background: "none", border: "none", color: T.mutedDim, cursor: "pointer", flexShrink: 0, padding: 2 }}>
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ConnectorCard({ def, connection, onConnect, onCredentialsCached, getCachedCredentials, onSelectScope }) {
  const [open, setOpen] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const [showResources, setShowResources] = useState(false);
  const Icon = def.icon;
  const connected = connection?.status === "connected";

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setConnecting(true);

    if (!def.live) {
      // Simulated connectors (on-prem DB / files): no real network path exists to a
      // private on-prem database from a public edge Worker without a customer-side
      // agent, so this stays a labeled simulation until that agent exists.
      setTimeout(() => {
        onConnect({ id: def.id, name: def.name, category: def.category, status: "connected", live: false, meta: form, connectedAt: new Date().toISOString() });
        setConnecting(false);
        setOpen(false);
      }, 1100);
      return;
    }

    try {
      const resp = await fetch(`/api/connect/${def.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await resp.json();
      if (!result.ok && (!result.resources || result.resources.length === 0)) {
        setError(result.error || result.errors?.join("; ") || "Connection failed");
        setConnecting(false);
        return;
      }
      onConnect({
        id: def.id,
        name: def.name,
        category: def.category,
        status: "connected",
        live: true,
        meta: { ...Object.fromEntries(Object.entries(form).filter(([k]) => !/token|key|secret/i.test(k))) }, // never persist secrets
        resources: result.resources || [],
        partialErrors: result.errors || [],
        connectedAt: new Date().toISOString(),
      });
      // Cache the raw credentials in memory (parent-held ref, never localStorage) so
      // browsing into objects/schemas/tables doesn't require re-entering them each time.
      onCredentialsCached?.(def.id, form);
      setConnecting(false);
      setOpen(false);
    } catch (err) {
      setError(err.message || "Network error reaching the connector");
      setConnecting(false);
    }
  };

  return (
    <div style={{ border: `1px solid ${connected ? T.cyan + "55" : T.border}`, borderRadius: 12, background: T.panelAlt, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: T.panel, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon size={15} color={connected ? T.cyan : T.mutedDim} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: T.text }}>{def.name}</span>
              {def.live && <span style={{ fontSize: 9, fontWeight: 700, color: T.green, background: T.greenDim, borderRadius: 4, padding: "1px 5px" }}>LIVE</span>}
            </div>
            <div style={{ fontSize: 10.5, color: T.mutedDim, fontFamily: "IBM Plex Mono" }}>
              {connected ? `connected${connection.resources?.length ? ` · ${connection.resources.length} resource${connection.resources.length !== 1 ? "s" : ""} found` : ""}` : "not connected"}
            </div>
            {connection?.validationScope && (
              <div style={{ fontSize: 10, color: T.coral, fontFamily: "IBM Plex Mono", marginTop: 2 }}>
                scope: {connection.validationScope.path} ({connection.validationScope.level})
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => setOpen(!open)}
          style={{ fontSize: 11, fontWeight: 600, color: connected ? T.cyan : T.text, background: "none", border: `1px solid ${T.border}`, borderRadius: 7, padding: "6px 11px", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
        >
          {connected ? <Check size={12} /> : null} {connected ? "Reconfigure" : "Configure"} <ChevronDown size={11} style={{ transform: open ? "rotate(180deg)" : "none" }} />
        </button>
      </div>

      {connected && connection.resources?.length > 0 && (
        <div style={{ padding: "0 14px 12px" }}>
          <button onClick={() => setShowResources(!showResources)} style={{ fontSize: 11, color: T.cyan, background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 4 }}>
            {showResources ? "Hide" : "Show"} resources <ChevronDown size={10} style={{ transform: showResources ? "rotate(180deg)" : "none" }} />
          </button>
          {showResources && (
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4, maxHeight: 320, overflowY: "auto" }}>
              {connection.resources.map((r, i) => {
                const browsableS3 = def.id === "aws" && r.service === "S3" && r.type === "bucket";
                const browsableDatabricks = def.id === "databricks" && r.service === "Databricks" && r.type === "catalog";
                return (
                  <div key={i} style={{ background: T.panel, borderRadius: 6, overflow: "hidden" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, padding: "5px 8px" }}>
                      <span style={{ color: T.text }}>{r.name}</span>
                      <span style={{ color: T.mutedDim, fontFamily: "IBM Plex Mono" }}>{r.service} · {r.type}</span>
                    </div>
                    {browsableS3 && (
                      <S3Browser bucket={r.name} getCreds={() => getCachedCredentials(def.id)} onSelectScope={(scope) => onSelectScope(def.id, scope)} />
                    )}
                    {browsableDatabricks && (
                      <DatabricksBrowser catalog={r.name} getCreds={() => getCachedCredentials(def.id)} onSelectScope={(scope) => onSelectScope(def.id, scope)} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {open && (
        <form onSubmit={submit} style={{ padding: "0 14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          {def.fields.map(([key, label, type]) => (
            <div key={key}>
              <label style={{ fontSize: 10.5, color: T.mutedDim, display: "block", marginBottom: 4 }}>{label}</label>
              <input
                type={type === "password" ? "password" : "text"}
                autoComplete="off"
                value={form[key] || ""}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                style={{ width: "100%", boxSizing: "border-box", background: T.panel, border: `1px solid ${T.border}`, borderRadius: 7, padding: "7px 9px", color: T.text, fontSize: 12.5, fontFamily: "'Inter', sans-serif" }}
              />
            </div>
          ))}
          {def.live ? (
            <div style={{ fontSize: 10, color: T.mutedDim, lineHeight: 1.5 }}>
              This calls the real {def.name} API. Credentials are sent once to make this request and are never
              written to storage — only the resulting resource list and non-secret fields are saved. Use a
              read-only, least-privilege credential.
            </div>
          ) : (
            <div style={{ fontSize: 10, color: T.mutedDim, lineHeight: 1.5 }}>
              This connector is simulated — reaching a private on-prem database from a public connector needs a
              customer-side agent/tunnel, which isn't built yet. This captures configuration only.
            </div>
          )}
          {error && <div style={{ fontSize: 11, color: T.red, background: T.redDim, borderRadius: 6, padding: "7px 9px" }}>{error}</div>}
          <button type="submit" disabled={connecting} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#FFFFFF", background: T.cyan, border: "none", borderRadius: 7, padding: "8px 12px", cursor: "pointer" }}>
            {connecting ? <Loader2 size={13} className="spin" /> : <Check size={13} />} {connecting ? "Connecting…" : "Test & connect"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function Workspace({ email, activeProject, onActiveProjectChange, onLaunchDashboard, onSignedOut, onBackToSite }) {
  const user = getUser(email);
  const guest = isGuest(email);

  const [projects, setProjects] = useState(() => getProjects(email));
  const [connections, setConnections] = useState(() => getConnections(email));
  const [selectedModules, setSelectedModules] = useState([]);
  const [history, setHistory] = useState(() => getHistory(email));
  const [saveNotice, setSaveNotice] = useState("");
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [signInPrompt, setSignInPrompt] = useState(false);
  const [scopeNotice, setScopeNotice] = useState("");
  const [step, setStep] = useState(1); // 1: project, 2: connect, 3: modules, 4: validate & launch
  const [validation, setValidation] = useState(null);

  // In-memory only (never written to localStorage) — lets "Browse" calls reuse
  // the credentials from the most recent successful connect for this provider,
  // without re-prompting on every click. Cleared on page reload by design.
  const credCache = useRef({});

  const activeProjectId = activeProject?.id || null;
  const hasConnection = connections.some((c) => c.status === "connected");

  // Default to the first existing project on load, if one exists and none is selected yet.
  React.useEffect(() => {
    if (!activeProject && projects.length) onActiveProjectChange(projects[0]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleConnect = (conn) => {
    const updated = upsertConnection(email, conn) ? getConnections(email) : connections;
    setConnections(updated);
  };

  const handleCredentialsCached = (defId, form) => {
    credCache.current[defId] = form;
  };

  const handleSelectScope = (defId, scope) => {
    const conn = connections.find((c) => c.id === defId);
    if (!conn) return;
    const updatedConn = { ...conn, validationScope: scope };
    const updated = upsertConnection(email, updatedConn) ? getConnections(email) : connections;
    setConnections(updated);
    setScopeNotice(`Validation scope set: ${scope.path} (${scope.level} level)`);
    setTimeout(() => setScopeNotice(""), 3500);
  };

  const toggleModule = (id) => {
    setSelectedModules((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));
  };
  const toggleAll = () => {
    setSelectedModules((prev) => (prev.length === MODULE_LIST.length ? [] : MODULE_LIST.map((m) => m.id)));
  };

  const handleNewProject = () => {
    if (guest) { setSignInPrompt(true); setProjectMenuOpen(false); return; }
    const name = window.prompt("Project name?");
    if (!name) return;
    const project = createProject(email, name);
    setProjects(getProjects(email));
    onActiveProjectChange(project);
    setProjectMenuOpen(false);
  };

  const selectProject = (project) => {
    onActiveProjectChange(project);
    setProjectMenuOpen(false);
  };

  const saveToProject = (targetId) => {
    if (guest) { setSignInPrompt(true); return; }
    let pid = targetId;
    if (pid === "__new__") {
      const name = window.prompt("New project name?");
      if (!name) return;
      const project = createProject(email, name);
      setProjects(getProjects(email));
      pid = project.id;
      onActiveProjectChange(project);
    }
    updateProject(email, pid, {
      connectionIds: connections.filter((c) => c.status === "connected").map((c) => c.id),
      selectedModules,
    });
    setProjects(getProjects(email));
    setSaveNotice("Saved to project.");
    setTimeout(() => setSaveNotice(""), 2500);
  };

  const liveConns = connections.filter((c) => c.status === "connected");
  const totalResources = liveConns.reduce((s, c) => s + (c.resources?.length || 0), 0);
  const scopedConns = liveConns.filter((c) => c.validationScope).length;

  const runValidation = () => {
    setValidation({
      connectionsChecked: liveConns.length,
      resourcesInScope: totalResources,
      scopedConnections: scopedConns,
      modulesSelected: selectedModules.length,
      // Readiness is a simple, transparent heuristic over real inputs above —
      // not a model score. It's meant to flag gaps, not simulate an audit result.
      readiness: liveConns.length === 0 ? 0 : Math.min(100, 40 + liveConns.length * 15 + scopedConns * 10),
      ranAt: new Date().toISOString(),
    });
  };

  const launch = () => {
    if (!selectedModules.length) return;
    const fileConn = connections.find((c) => c.id === "files" && c.status === "connected");
    addHistoryEntry(email, {
      projectId: activeProjectId,
      projectName: activeProject?.name || "No project",
      modules: selectedModules,
      moduleLabels: selectedModules.map((id) => MODULE_LIST.find((m) => m.id === id)?.label || id),
      fileNames: (fileConn?.resources || []).map((f) => f.name),
      connectionCount: connections.filter((c) => c.status === "connected").length,
    });
    setHistory(getHistory(email));
    onLaunchDashboard(selectedModules);
  };

  return (
    <div style={{ background: T.bg, color: T.text, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <style>{FONT_IMPORT}{`.spin { animation: edh-spin 0.9s linear infinite; } @keyframes edh-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {signInPrompt && (
        <div onClick={() => setSignInPrompt(false)} style={{ position: "fixed", inset: 0, background: "#00000066", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 14, padding: 26, maxWidth: 360 }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Sign in required</div>
            <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.6, marginBottom: 18 }}>
              To create or access a project, you need to sign in. Guest sessions don't have persistent projects since
              guest data doesn't survive a sign-out or session timeout.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setSignInPrompt(false)} style={{ fontSize: 12.5, color: T.muted, background: "none", border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 14px", cursor: "pointer" }}>Cancel</button>
              <button onClick={() => { signOut(); onSignedOut(); }} style={{ fontSize: 12.5, fontWeight: 600, color: "#FFFFFF", background: T.coral, border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer" }}>Sign in</button>
            </div>
          </div>
        </div>
      )}

      {/* Top bar — sticky/frozen so the project switcher stays reachable while scrolling */}
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: `${T.bg}F5`, backdropFilter: "blur(6px)", borderBottom: `1px solid ${T.border}`, padding: "14px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={onBackToSite} style={{ display: "flex", alignItems: "center", gap: 9, background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 0 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: T.coral, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldCheck size={15} color="#FFFFFF" />
          </div>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14.5 }}>Enterprise Drishti Hub</span>
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* Project switcher */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setProjectMenuOpen(!projectMenuOpen)}
              style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 600, color: T.text, background: T.panelAlt, border: `1px solid ${T.border}`, borderRadius: 8, padding: "7px 12px", cursor: "pointer" }}
            >
              <Folder size={13} color={T.amber} />
              {activeProject ? activeProject.name : guest ? "No project (guest)" : "Select project"}
              <ChevronDown size={12} style={{ transform: projectMenuOpen ? "rotate(180deg)" : "none" }} />
            </button>
            {projectMenuOpen && (
              <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10, minWidth: 220, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 30, overflow: "hidden" }}>
                {projects.length === 0 && (
                  <div style={{ padding: "12px 14px", fontSize: 12, color: T.mutedDim }}>{guest ? "Guests can't create projects." : "No projects yet."}</div>
                )}
                {projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => selectProject(p)}
                    style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 14px", fontSize: 12.5, color: p.id === activeProjectId ? T.coral : T.text, background: p.id === activeProjectId ? T.coralDim : "transparent", border: "none", cursor: "pointer" }}
                  >
                    {p.name}
                  </button>
                ))}
                <button
                  onClick={handleNewProject}
                  style={{ display: "flex", alignItems: "center", gap: 6, width: "100%", textAlign: "left", padding: "10px 14px", fontSize: 12.5, fontWeight: 600, color: T.cyan, background: "none", border: "none", borderTop: `1px solid ${T.border}`, cursor: "pointer" }}
                >
                  <FolderPlus size={13} /> New project
                </button>
              </div>
            )}
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12.5, fontWeight: 600 }}>{guest ? "Guest session" : user?.name}</div>
            <div style={{ fontSize: 10.5, color: T.mutedDim }}>{guest ? "not saved beyond this browser" : user?.email}</div>
          </div>
          <button onClick={onBackToSite} title="Home" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: T.mutedDim, background: "none", border: `1px solid ${T.border}`, borderRadius: 8, padding: "7px 11px", cursor: "pointer" }}>
            <Home size={13} /> Home
          </button>
          <button onClick={() => { signOut(); onSignedOut(); }} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: T.mutedDim, background: "none", border: `1px solid ${T.border}`, borderRadius: 8, padding: "7px 11px", cursor: "pointer" }}>
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "36px 28px 80px" }}>

        {/* Step indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
          {[
            { n: 1, label: "Project" },
            { n: 2, label: "Connect a source" },
            { n: 3, label: "Choose modules" },
            { n: 4, label: "Validate & launch" },
          ].map((s, i) => (
            <React.Fragment key={s.n}>
              <button
                onClick={() => s.n < step && setStep(s.n)}
                disabled={s.n > step}
                style={{
                  display: "flex", alignItems: "center", gap: 8, background: "none", border: "none",
                  cursor: s.n < step ? "pointer" : "default", padding: "6px 4px",
                }}
              >
                <span style={{
                  width: 24, height: 24, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11.5, fontWeight: 700, fontFamily: "IBM Plex Mono",
                  background: s.n === step ? T.coral : s.n < step ? T.greenDim : T.panelAlt,
                  color: s.n === step ? "#FFFFFF" : s.n < step ? T.green : T.mutedDim,
                  border: `1px solid ${s.n === step ? T.coral : s.n < step ? T.green : T.border}`,
                }}>
                  {s.n < step ? <Check size={12} /> : s.n}
                </span>
                <span style={{ fontSize: 12.5, fontWeight: s.n === step ? 600 : 500, color: s.n === step ? T.text : T.mutedDim }}>{s.label}</span>
              </button>
              {i < 3 && <div style={{ flex: 1, minWidth: 20, height: 1, background: s.n < step ? T.green : T.border }} />}
            </React.Fragment>
          ))}
        </div>

        {/* ---- Step 1: Project ---- */}
        {step === 1 && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 32, alignItems: "center", marginBottom: 32 }}>
              <div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: T.amber, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Step 1 of 4</div>
                <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 26, margin: "0 0 10px" }}>
                  Start with a project.
                </h1>
                <p style={{ fontSize: 13.5, color: T.muted, lineHeight: 1.6, maxWidth: 560 }}>
                  Everything you connect and every module you run gets saved under a project, so you can pick up
                  exactly where you left off. Use the switcher in the top bar to select an existing one, or create a
                  new one — it takes a few seconds.
                </p>
              </div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <DataLayerDiagram compact />
              </div>
            </div>

            <SectionCard eyebrow="Project" title={activeProject ? `Using: ${activeProject.name}` : "No project selected yet"} icon={Folder}>
              {activeProject ? (
                <div style={{ fontSize: 12.5, color: T.muted }}>
                  You're set — click <strong style={{ color: T.text }}>Continue</strong> below, or use the switcher in
                  the top bar to pick a different project first.
                </div>
              ) : guest ? (
                <div style={{ fontSize: 12.5, color: T.muted }}>
                  Guest sessions don't have persistent projects. You can still continue and connect sources, but
                  nothing will be saved once you sign out or your session times out.
                </div>
              ) : (
                <div style={{ fontSize: 12.5, color: T.muted }}>
                  Use <strong style={{ color: T.text }}>+ New project</strong> in the top bar to create one, then come back here.
                </div>
              )}
            </SectionCard>

            {!!history.length && (
              <SectionCard eyebrow="History" title="Previous runs" icon={History}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {history.slice(0, 8).map((h) => {
                    const moduleNames = h.moduleLabels?.length
                      ? h.moduleLabels
                      : h.modules.map((id) => MODULE_LIST.find((m) => m.id === id)?.label || id); // fallback for entries saved before this field existed
                    return (
                      <div key={h.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "11px 0", borderBottom: `1px solid ${T.border}`, gap: 12 }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 12.5, color: T.text, fontWeight: 500 }}>{h.projectName}</div>
                          <div style={{ fontSize: 11, color: T.muted, marginTop: 3, lineHeight: 1.5 }}>{moduleNames.join(", ")}</div>
                          {h.fileNames?.length > 0 && (
                            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4, fontSize: 10.5, color: T.coral }}>
                              <FileText size={11} /> {h.fileNames.join(", ")}
                            </div>
                          )}
                          <div style={{ fontSize: 10, color: T.mutedDim, fontFamily: "IBM Plex Mono", marginTop: 4 }}>{new Date(h.timestamp).toLocaleString()}</div>
                        </div>
                        <button onClick={() => { setSelectedModules(h.modules); setStep(3); }} style={{ fontSize: 11, color: T.cyan, background: "none", border: `1px solid ${T.border}`, borderRadius: 7, padding: "6px 10px", cursor: "pointer", flexShrink: 0 }}>
                          Restore
                        </button>
                      </div>
                    );
                  })}
                </div>
              </SectionCard>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setStep(2)} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 600, color: "#FFFFFF", background: T.coral, border: "none", borderRadius: 9, padding: "11px 20px", cursor: "pointer" }}>
                Continue <ArrowRight size={15} />
              </button>
            </div>
          </>
        )}

        {/* ---- Step 2: Connect ---- */}
        {step === 2 && (
          <>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: T.amber, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Step 2 of 4</div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 24, margin: "0 0 20px" }}>Connect a data source.</h1>

            <SectionCard eyebrow="Data layer" title="Connect your cloud, databases, and files" icon={Cloud}>
              {scopeNotice && (
                <div style={{ fontSize: 11.5, color: T.coral, background: T.coralDim, borderRadius: 8, padding: "8px 12px", marginBottom: 14 }}>{scopeNotice}</div>
              )}
              <div style={{ fontSize: 11, fontWeight: 700, color: T.mutedDim, textTransform: "uppercase", letterSpacing: "0.06em", margin: "4px 0 10px" }}>Cloud</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12, marginBottom: 22 }}>
                {CONNECTOR_DEFS.filter((d) => d.category === "cloud").map((d) => (
                  <ConnectorCard key={d.id} def={d} connection={connections.find((c) => c.id === d.id)} onConnect={handleConnect} onCredentialsCached={handleCredentialsCached} getCachedCredentials={(id) => credCache.current[id]} onSelectScope={handleSelectScope} />
                ))}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.mutedDim, textTransform: "uppercase", letterSpacing: "0.06em", margin: "4px 0 10px" }}>Databases & data platforms</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12, marginBottom: 22 }}>
                {CONNECTOR_DEFS.filter((d) => d.category === "database").map((d) => (
                  <ConnectorCard key={d.id} def={d} connection={connections.find((c) => c.id === d.id)} onConnect={handleConnect} onCredentialsCached={handleCredentialsCached} getCachedCredentials={(id) => credCache.current[id]} onSelectScope={handleSelectScope} />
                ))}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.mutedDim, textTransform: "uppercase", letterSpacing: "0.06em", margin: "4px 0 10px" }}>Files</div>
              <FileConnector connection={connections.find((c) => c.id === "files")} onConnect={handleConnect} />
            </SectionCard>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button onClick={() => setStep(1)} style={{ fontSize: 13, color: T.muted, background: "none", border: `1px solid ${T.border}`, borderRadius: 9, padding: "10px 18px", cursor: "pointer" }}>
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!hasConnection}
                style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 600, color: "#FFFFFF", background: hasConnection ? T.coral : T.border, border: "none", borderRadius: 9, padding: "11px 20px", cursor: hasConnection ? "pointer" : "not-allowed" }}
              >
                Continue <ArrowRight size={15} />
              </button>
            </div>
            {!hasConnection && <div style={{ fontSize: 11.5, color: T.mutedDim, textAlign: "right", marginTop: 8 }}>Connect at least one source to continue.</div>}
          </>
        )}

        {/* ---- Step 3: Modules ---- */}
        {step === 3 && (
          <>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: T.amber, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Step 3 of 4</div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 24, margin: "0 0 20px" }}>Choose which modules to run.</h1>

            <SectionCard eyebrow="Run" title="Select one, several, or all" icon={Check}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{ fontSize: 12, color: T.mutedDim }}>{selectedModules.length} of {MODULE_LIST.length} selected</span>
                <button onClick={toggleAll} style={{ fontSize: 11.5, fontWeight: 600, color: T.cyan, background: "none", border: "none", cursor: "pointer" }}>
                  {selectedModules.length === MODULE_LIST.length ? "Clear all" : "Select all"}
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 10, marginBottom: 20 }}>
                {MODULE_LIST.map((m) => {
                  const Icon = m.icon;
                  const checked = selectedModules.includes(m.id);
                  return (
                    <label key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", border: `1px solid ${checked ? T.amber + "66" : T.border}`, borderRadius: 10, background: checked ? T.amberDim + "33" : T.panelAlt, cursor: "pointer" }}>
                      <input type="checkbox" checked={checked} onChange={() => toggleModule(m.id)} style={{ accentColor: T.amber, width: 15, height: 15 }} />
                      <Icon size={14} color={checked ? T.amber : T.mutedDim} />
                      <span style={{ fontSize: 12.5, color: T.text }}>{m.label}</span>
                    </label>
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <select
                  onChange={(e) => e.target.value && saveToProject(e.target.value)}
                  defaultValue=""
                  style={{ fontSize: 12.5, background: T.panelAlt, border: `1px solid ${T.border}`, borderRadius: 8, padding: "9px 11px", color: T.text }}
                >
                  <option value="" disabled>Save to project…</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  <option value="__new__">+ New project</option>
                </select>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, color: T.mutedDim }}><Save size={12} /> {saveNotice}</span>
              </div>
            </SectionCard>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button onClick={() => setStep(2)} style={{ fontSize: 13, color: T.muted, background: "none", border: `1px solid ${T.border}`, borderRadius: 9, padding: "10px 18px", cursor: "pointer" }}>
                Back
              </button>
              <button
                onClick={() => { setValidation(null); setStep(4); }}
                disabled={!selectedModules.length}
                style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 600, color: "#FFFFFF", background: selectedModules.length ? T.coral : T.border, border: "none", borderRadius: 9, padding: "11px 20px", cursor: selectedModules.length ? "pointer" : "not-allowed" }}
              >
                Continue <ArrowRight size={15} />
              </button>
            </div>
            {!selectedModules.length && <div style={{ fontSize: 11.5, color: T.mutedDim, textAlign: "right", marginTop: 8 }}>Select at least one module to continue.</div>}
          </>
        )}

        {/* ---- Step 4: Validate & launch ---- */}
        {step === 4 && (
          <>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: T.amber, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Step 4 of 4</div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 24, margin: "0 0 20px" }}>Validate, then launch.</h1>

            <SectionCard eyebrow="Readiness check" title="Run validation before launching" icon={Check}>
              <p style={{ fontSize: 12.5, color: T.muted, marginBottom: 16, lineHeight: 1.6 }}>
                This checks what's actually connected and selected — a real count, not a simulated score. It's a
                sanity check before launch, not a compliance audit result.
              </p>
              {!validation ? (
                <button onClick={runValidation} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 600, color: T.text, background: T.panelAlt, border: `1px solid ${T.borderLight}`, borderRadius: 9, padding: "11px 18px", cursor: "pointer" }}>
                  <FlaskConical size={15} /> Run validation
                </button>
              ) : (
                <div>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
                    <ValStat label="Connections checked" value={validation.connectionsChecked} good={validation.connectionsChecked > 0} />
                    <ValStat label="Resources in scope" value={validation.resourcesInScope} good={validation.resourcesInScope > 0} />
                    <ValStat label="Scoped connections" value={validation.scopedConnections} good={validation.scopedConnections > 0} />
                    <ValStat label="Modules selected" value={validation.modulesSelected} good={validation.modulesSelected > 0} />
                  </div>
                  <div style={{ marginBottom: 4, fontSize: 12, color: T.mutedDim }}>Readiness</div>
                  <div style={{ height: 10, borderRadius: 6, background: T.panelAlt, overflow: "hidden", marginBottom: 6 }}>
                    <div style={{ width: `${validation.readiness}%`, height: "100%", background: validation.readiness > 70 ? T.green : validation.readiness > 40 ? T.amber : T.red }} />
                  </div>
                  <div style={{ fontSize: 11, color: T.mutedDim, marginBottom: 20 }}>
                    {validation.readiness}% — {validation.scopedConnections === 0 ? "consider setting a DB/schema/table validation scope on your connections for more precise results (see Step 2)." : "connections have scopes set — good to launch."}
                  </div>
                  <button onClick={runValidation} style={{ fontSize: 11.5, color: T.cyan, background: "none", border: "none", cursor: "pointer", padding: 0 }}>Re-run validation</button>
                </div>
              )}
            </SectionCard>

            <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 14, padding: 22, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, flexWrap: "wrap", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: T.text, marginBottom: 4 }}>Need deeper data-quality analysis on a connected source?</div>
                <div style={{ fontSize: 12, color: T.muted, maxWidth: 560 }}>
                  EDH focuses on compliance, control, and cyber-risk posture. If you need more detailed technical
                  data-quality analysis on the data itself, try DataGuard.
                </div>
              </div>
              <a href="https://dataguard.dataquality.health/" target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 600, color: T.cyan, background: T.cyanDim, border: `1px solid ${T.cyan}55`, borderRadius: 9, padding: "9px 15px", textDecoration: "none", flexShrink: 0 }}>
                Try DataGuard <ExternalLink size={12} />
              </a>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button onClick={() => setStep(3)} style={{ fontSize: 13, color: T.muted, background: "none", border: `1px solid ${T.border}`, borderRadius: 9, padding: "10px 18px", cursor: "pointer" }}>
                Back
              </button>
              <button
                onClick={launch}
                style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 600, color: "#FFFFFF", background: T.coral, border: "none", borderRadius: 9, padding: "11px 20px", cursor: "pointer" }}
              >
                <Rocket size={15} /> Launch Dashboard
              </button>
            </div>
          </>
        )}
      </div>
      <ChatAssistant
        onAction={(action) => {
          const m = action.target?.match(/^workspace-step-(\d)$/);
          if (m) setStep(Number(m[1]));
        }}
      />
    </div>
  );
}

function ValStat({ label, value, good }) {
  return (
    <div style={{ minWidth: 110 }}>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 22, color: good ? T.green : T.mutedDim }}>{value}</div>
      <div style={{ fontSize: 10.5, color: T.mutedDim }}>{label}</div>
    </div>
  );
}

function SectionCard({ eyebrow, title, icon: Icon, children }) {
  return (
    <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 14, padding: 22, marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <Icon size={13} color={T.amber} />
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, letterSpacing: "0.08em", color: T.amber, textTransform: "uppercase" }}>{eyebrow}</span>
      </div>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 16, marginBottom: 16 }}>{title}</div>
      {children}
    </div>
  );
}
