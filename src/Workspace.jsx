import React, { useState } from "react";
import {
  ShieldCheck, LogOut, FolderPlus, Folder, Cloud, Database, FileText, Check,
  Loader2, ExternalLink, History, Save, Rocket, ChevronDown, Lock,
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

function ConnectorCard({ def, connection, onConnect }) {
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
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4, maxHeight: 160, overflowY: "auto" }}>
              {connection.resources.map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, padding: "5px 8px", background: T.panel, borderRadius: 6 }}>
                  <span style={{ color: T.text }}>{r.name}</span>
                  <span style={{ color: T.mutedDim, fontFamily: "IBM Plex Mono" }}>{r.service} · {r.type}</span>
                </div>
              ))}
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
          <button type="submit" disabled={connecting} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#0A0E17", background: T.cyan, border: "none", borderRadius: 7, padding: "8px 12px", cursor: "pointer" }}>
            {connecting ? <Loader2 size={13} className="spin" /> : <Check size={13} />} {connecting ? "Connecting…" : "Test & connect"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function Workspace({ email, onLaunchDashboard, onSignedOut, onBackToSite }) {
  const user = getUser(email);
  const guest = isGuest(email);

  const [projects, setProjects] = useState(() => getProjects(email));
  const [activeProjectId, setActiveProjectId] = useState(() => getProjects(email)[0]?.id || null);
  const [connections, setConnections] = useState(() => getConnections(email));
  const [selectedModules, setSelectedModules] = useState([]);
  const [history, setHistory] = useState(() => getHistory(email));
  const [saveNotice, setSaveNotice] = useState("");

  const hasConnection = connections.some((c) => c.status === "connected");
  const activeProject = projects.find((p) => p.id === activeProjectId);

  const handleConnect = (conn) => {
    const updated = upsertConnection(email, conn) ? getConnections(email) : connections;
    setConnections(updated);
  };

  const toggleModule = (id) => {
    setSelectedModules((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));
  };
  const toggleAll = () => {
    setSelectedModules((prev) => (prev.length === MODULE_LIST.length ? [] : MODULE_LIST.map((m) => m.id)));
  };

  const handleNewProject = () => {
    const name = window.prompt("Project name?");
    if (!name) return;
    const project = createProject(email, name);
    setProjects(getProjects(email));
    setActiveProjectId(project.id);
  };

  const saveToProject = (targetId) => {
    let pid = targetId;
    if (pid === "__new__") {
      const name = window.prompt("New project name?");
      if (!name) return;
      const project = createProject(email, name);
      setProjects(getProjects(email));
      pid = project.id;
      setActiveProjectId(pid);
    }
    updateProject(email, pid, {
      connectionIds: connections.filter((c) => c.status === "connected").map((c) => c.id),
      selectedModules,
    });
    setProjects(getProjects(email));
    setSaveNotice("Saved to project.");
    setTimeout(() => setSaveNotice(""), 2500);
  };

  const launch = () => {
    if (!selectedModules.length) return;
    addHistoryEntry(email, {
      projectId: activeProjectId,
      projectName: activeProject?.name || "No project",
      modules: selectedModules,
      connectionCount: connections.filter((c) => c.status === "connected").length,
    });
    setHistory(getHistory(email));
    onLaunchDashboard(selectedModules);
  };

  return (
    <div style={{ background: T.bg, color: T.text, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <style>{FONT_IMPORT}{`.spin { animation: edh-spin 0.9s linear infinite; } @keyframes edh-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* Top bar */}
      <div style={{ borderBottom: `1px solid ${T.border}`, padding: "14px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={onBackToSite} style={{ display: "flex", alignItems: "center", gap: 9, background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 0 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: `linear-gradient(135deg, ${T.amber}, ${T.cyan})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldCheck size={15} color="#0A0E17" />
          </div>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14.5 }}>Enterprise Drishti Hub</span>
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12.5, fontWeight: 600 }}>{guest ? "Guest session" : user?.name}</div>
            <div style={{ fontSize: 10.5, color: T.mutedDim }}>{guest ? "not saved beyond this browser" : user?.email}</div>
          </div>
          <button onClick={() => { signOut(); onSignedOut(); }} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: T.mutedDim, background: "none", border: `1px solid ${T.border}`, borderRadius: 8, padding: "7px 11px", cursor: "pointer" }}>
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "36px 28px 80px" }}>
        {/* Hero row: diagram + positioning */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 32, alignItems: "center", marginBottom: 40 }}>
          <div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: T.amber, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Your workspace</div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 26, margin: "0 0 10px" }}>
              EDH sits on top of your data layer — connect it, then decide what runs.
            </h1>
            <p style={{ fontSize: 13.5, color: T.muted, lineHeight: 1.6, maxWidth: 560 }}>
              Establish at least one connection to your cloud, database, or file layer below. Once EDH can see your
              data layer, choose which of the nine modules to run against it — one, several, or all — and save the
              setup to a project you can come back to.
            </p>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <DataLayerDiagram compact />
          </div>
        </div>

        {/* Projects */}
        <SectionCard eyebrow="Projects" title="Which project is this for?" icon={Folder}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => setActiveProjectId(p.id)}
                style={{
                  fontSize: 12.5, fontWeight: 600, padding: "8px 14px", borderRadius: 999, cursor: "pointer",
                  border: `1px solid ${activeProjectId === p.id ? T.amber : T.border}`,
                  background: activeProjectId === p.id ? T.amberDim : "transparent",
                  color: activeProjectId === p.id ? T.amber : T.muted,
                }}
              >
                {p.name}
              </button>
            ))}
            <button onClick={handleNewProject} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: T.cyan, background: "none", border: `1px dashed ${T.borderLight}`, borderRadius: 999, padding: "8px 14px", cursor: "pointer" }}>
              <FolderPlus size={13} /> New project
            </button>
          </div>
          {!projects.length && <div style={{ fontSize: 12, color: T.mutedDim, marginTop: 10 }}>No projects yet — optional. You can also just connect and launch without one.</div>}
        </SectionCard>

        {/* Connectivity */}
        <SectionCard eyebrow="Data layer" title="Connect your cloud, databases, and files" icon={Cloud}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.mutedDim, textTransform: "uppercase", letterSpacing: "0.06em", margin: "4px 0 10px" }}>Cloud</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12, marginBottom: 22 }}>
            {CONNECTOR_DEFS.filter((d) => d.category === "cloud").map((d) => (
              <ConnectorCard key={d.id} def={d} connection={connections.find((c) => c.id === d.id)} onConnect={handleConnect} />
            ))}
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.mutedDim, textTransform: "uppercase", letterSpacing: "0.06em", margin: "4px 0 10px" }}>Databases & data platforms</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12, marginBottom: 22 }}>
            {CONNECTOR_DEFS.filter((d) => d.category === "database").map((d) => (
              <ConnectorCard key={d.id} def={d} connection={connections.find((c) => c.id === d.id)} onConnect={handleConnect} />
            ))}
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.mutedDim, textTransform: "uppercase", letterSpacing: "0.06em", margin: "4px 0 10px" }}>Files</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
            {CONNECTOR_DEFS.filter((d) => d.category === "file").map((d) => (
              <ConnectorCard key={d.id} def={d} connection={connections.find((c) => c.id === d.id)} onConnect={handleConnect} />
            ))}
          </div>
        </SectionCard>

        {/* Module selection — gated */}
        <SectionCard eyebrow="Run" title="Choose which modules to run" icon={Check}>
          {!hasConnection ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px", background: T.panelAlt, border: `1px dashed ${T.borderLight}`, borderRadius: 10, color: T.mutedDim, fontSize: 12.5 }}>
              <Lock size={15} /> Connect at least one data source above to unlock module selection.
            </div>
          ) : (
            <>
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

                <button
                  onClick={launch}
                  disabled={!selectedModules.length}
                  style={{
                    marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 600,
                    color: "#0A0E17", background: selectedModules.length ? T.amber : T.border, border: "none", borderRadius: 9,
                    padding: "11px 18px", cursor: selectedModules.length ? "pointer" : "not-allowed",
                  }}
                >
                  <Rocket size={15} /> Launch Dashboard
                </button>
              </div>
            </>
          )}
        </SectionCard>

        {/* History */}
        {!!history.length && (
          <SectionCard eyebrow="History" title="Previous runs" icon={History}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {history.slice(0, 8).map((h) => (
                <div key={h.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
                  <div>
                    <div style={{ fontSize: 12.5, color: T.text }}>{h.projectName} · {h.modules.length} module{h.modules.length !== 1 ? "s" : ""}</div>
                    <div style={{ fontSize: 10.5, color: T.mutedDim, fontFamily: "IBM Plex Mono" }}>{new Date(h.timestamp).toLocaleString()}</div>
                  </div>
                  <button onClick={() => setSelectedModules(h.modules)} style={{ fontSize: 11, color: T.cyan, background: "none", border: `1px solid ${T.border}`, borderRadius: 7, padding: "6px 10px", cursor: "pointer" }}>
                    Restore selection
                  </button>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* DataGuard callout */}
        <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 14, padding: 22, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: T.text, marginBottom: 4 }}>Need deeper data-quality analysis on a connected source?</div>
            <div style={{ fontSize: 12, color: T.muted, maxWidth: 560 }}>
              EDH focuses on compliance, control, and cyber-risk posture. If you need more detailed technical
              data-quality analysis on the data itself, try DataGuard.
            </div>
          </div>
          <a href="https://dataguard.dataquality.health/" target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 600, color: T.cyan, background: T.cyanDim, border: `1px solid #1D5A56`, borderRadius: 9, padding: "9px 15px", textDecoration: "none", flexShrink: 0 }}>
            Try DataGuard <ExternalLink size={12} />
          </a>
        </div>
      </div>
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
