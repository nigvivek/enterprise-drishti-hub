import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, RadarChart, PolarGrid,
  PolarAngleAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import {
  ShieldCheck, ScrollText, GitCompareArrows, ClipboardCheck, FileStack,
  LayoutDashboard, TrendingUp, Radar as RadarIcon, Bell, Search, ChevronRight,
  AlertTriangle, CheckCircle2, Clock, XCircle, ExternalLink, Sparkles,
  Activity, Database, ArrowLeft, Home, UploadCloud, Loader2,
  Route, Zap, Wallet, GitBranch, CircleDot, ArrowRightLeft, FlaskConical,
} from "lucide-react";

import { T, FONT_IMPORT } from "./tokens.js";
import { getConnections, upsertConnection } from "./store.js";
import ChatAssistant from "./ChatAssistant.jsx";

/* ---------------------------------------------------------------------- */
/*  Mock data                                                              */
/* ---------------------------------------------------------------------- */
import { MODULE_LIST } from "./modules.js";

const riskPulseData = [
  { subject: "Regulatory", value: 72 },
  { subject: "Control Health", value: 84 },
  { subject: "Cyber Posture", value: 61 },
  { subject: "Evidence Readiness", value: 90 },
  { subject: "Remediation Velocity", value: 58 },
];

const trendData = [
  { m: "Feb", score: 71 }, { m: "Mar", score: 74 }, { m: "Apr", score: 70 },
  { m: "May", score: 76 }, { m: "Jun", score: 79 }, { m: "Jul", score: 75 }, { m: "Aug", score: 78 },
];

const frameworkCoverage = [
  { name: "SOC 2 Type II", pass: 94, remediation: 4, fail: 2 },
  { name: "ISO 27001", pass: 88, remediation: 9, fail: 3 },
  { name: "GDPR", pass: 91, remediation: 6, fail: 3 },
  { name: "DORA", pass: 76, remediation: 15, fail: 9 },
  { name: "SOX", pass: 97, remediation: 3, fail: 0 },
  { name: "PCI DSS", pass: 85, remediation: 11, fail: 4 },
];

const deadlines = [
  { name: "DORA ICT Risk Management RTS", date: "2026-09-15", days: 41, sev: "high" },
  { name: "EU AI Act — GPAI obligations", date: "2026-10-02", days: 58, sev: "med" },
  { name: "SEC Cyber Disclosure amendments", date: "2026-08-20", days: 15, sev: "high" },
  { name: "CCPA regs update (annual review)", date: "2026-11-01", days: 88, sev: "low" },
];

const impactFindings = [
  { id: 1, reg: "DORA — ICT sub-outsourcing", control: "TPRM-014 Third-Party Notification", gap: "Insufficient", effort: "Medium", owner: "R. Okafor", status: "In Review", due: "Sep 10" },
  { id: 2, reg: "EU AI Act — risk classification", control: "MDL-002 Model Risk Register", gap: "No control", effort: "High", owner: "S. Patel", status: "Open", due: "Sep 22" },
  { id: 3, reg: "SEC — materiality disclosure", control: "IR-007 Incident Disclosure Runbook", gap: "Insufficient", effort: "Low", owner: "J. Lindqvist", status: "Remediating", due: "Aug 18" },
  { id: 4, reg: "CCPA/CPRA — deletion timeline", control: "PRIV-031 DSR Fulfillment SLA", gap: "Insufficient", effort: "Low", owner: "M. Chen", status: "Remediating", due: "Aug 25" },
  { id: 5, reg: "DORA — ICT sub-outsourcing", control: "TPRM-009 Vendor Contract Clauses", gap: "Sufficient (verify)", effort: "Low", owner: "R. Okafor", status: "Accepted", due: "—" },
];

const controlsList = [
  { id: "IAM-002", name: "MFA enforced — privileged accounts", framework: "SOC 2 / ISO 27001", status: "pass", lastCheck: "12 min ago", trend: [1,1,1,0,1,1,1] },
  { id: "CFG-018", name: "S3 buckets — encryption at rest", framework: "SOC 2 / PCI DSS", status: "drift", lastCheck: "3 min ago", trend: [1,1,1,1,1,0,0] },
  { id: "CHG-005", name: "Change mgmt — approval evidence", framework: "SOX / ISO 27001", status: "pass", lastCheck: "1 hr ago", trend: [1,1,1,1,1,1,1] },
  { id: "HR-011", name: "Offboarding — access revoked ≤24h", framework: "SOC 2", status: "fail", lastCheck: "8 min ago", trend: [0,1,0,0,1,0,0] },
  { id: "BCP-004", name: "Backup restore test — quarterly", framework: "ISO 27001 / DORA", status: "pass", lastCheck: "6 hr ago", trend: [1,1,1,1,1,1,1] },
  { id: "VEN-022", name: "Vendor due diligence — annual", framework: "TPRM / DORA", status: "attest", lastCheck: "2 days ago", trend: [1,1,0,1,1,1,1] },
];

const evidencePackages = [
  { id: "EV-2026-Q3-041", control: "IAM-002 MFA Enforcement", period: "Q3 2026", status: "signed", hash: "8f3a…c19e", size: "14 artifacts" },
  { id: "EV-2026-Q3-039", control: "CHG-005 Change Approval", period: "Q3 2026", status: "draft", hash: "pending", size: "22 artifacts" },
  { id: "EV-2026-Q2-108", control: "BCP-004 Backup Restore", period: "Q2 2026", status: "exported", hash: "2b7d…4a01", size: "6 artifacts" },
  { id: "EV-2026-Q3-042", control: "CFG-018 Encryption at Rest", period: "Q3 2026", status: "draft", hash: "pending", size: "9 artifacts" },
];

const predictiveRisks = [
  { topic: "AML / Transaction Monitoring", score: 78, trend: "up", delta: "+11 pts / 90d", drivers: "3 overdue remediations · 2 peer enforcement actions", n: 47 },
  { topic: "ICT Third-Party Risk (DORA)", score: 71, trend: "up", delta: "+18 pts / 90d", drivers: "New RTS effective in 41 days · 1 sub-outsourcing gap open", n: 22 },
  { topic: "AI Model Governance", score: 64, trend: "up", delta: "+9 pts / 90d", drivers: "No control mapped to risk classification duty", n: 15 },
  { topic: "Consumer Data Rights", score: 38, trend: "down", delta: "−6 pts / 90d", drivers: "DSR SLA remediation on track, ahead of schedule", n: 31 },
  { topic: "Capital Adequacy Reporting", score: 22, trend: "flat", delta: "±1 pt / 90d", drivers: "Stable — no material findings in 180 days", n: 58 },
];

const predictiveTrend = [
  { m: "Feb", aml: 58, dora: 41, ai: 40 }, { m: "Mar", aml: 61, dora: 46, ai: 44 },
  { m: "Apr", aml: 65, dora: 52, ai: 49 }, { m: "May", aml: 68, dora: 58, ai: 53 },
  { m: "Jun", aml: 71, dora: 62, ai: 57 }, { m: "Jul", aml: 74, dora: 67, ai: 61 },
  { m: "Aug", aml: 78, dora: 71, ai: 64 },
];

// Reference table of well-known regional data-protection regulations, keyed by
// common cloud region prefixes so a connection's region can be matched to the
// guideline that applies to it. Factual/informational only — not legal advice.
const REGION_GUIDELINES = [
  { prefixes: ["eu-", "europe-", "uksouth", "ukwest"], law: "GDPR", jurisdiction: "European Union / UK", summary: "Requires a documented legal basis for processing, data minimization, and breach notification within 72 hours of discovery." },
  { prefixes: ["us-west-1"], law: "CCPA/CPRA", jurisdiction: "California, US", summary: "Grants consumers rights to access, delete, and opt out of the sale/sharing of their personal information; applies based on where data subjects reside, not strictly server region." },
  { prefixes: ["ca-central-", "canadacentral", "canadaeast"], law: "PIPEDA", jurisdiction: "Canada", summary: "Requires consent for collection/use of personal information and mandates breach reporting to the federal privacy commissioner." },
  { prefixes: ["ap-southeast-1", "southeastasia"], law: "PDPA", jurisdiction: "Singapore", summary: "Requires consent-based collection, a Data Protection Officer for many organizations, and breach notification for significant harm." },
  { prefixes: ["ap-south-1", "centralindia", "southindia"], law: "DPDP Act", jurisdiction: "India", summary: "Requires notice and consent for processing digital personal data, with cross-border transfer restrictions to be specified by rule." },
  { prefixes: ["sa-east-1", "brazilsouth"], law: "LGPD", jurisdiction: "Brazil", summary: "Modeled closely on GDPR — requires a legal basis for processing and grants data subjects access, correction, and deletion rights." },
  { prefixes: ["us-"], law: "Sector-specific US rules (no single federal law)", jurisdiction: "United States", summary: "No general federal data-protection statute — applicable rules depend on sector (GLBA for financial services, HIPAA for health) and the residency of the data subjects, not the server region alone." },
];

const gatewayProviders = [
  { name: "Self-hosted vLLM — primary", kind: "self-hosted", model: "Llama-3.1-70B", status: "healthy", latencyMs: 210, costPer1k: 0.00, weight: 60 },
  { name: "Self-hosted Ollama — secondary", kind: "self-hosted", model: "Qwen2.5-14B", status: "healthy", latencyMs: 165, costPer1k: 0.00, weight: 30 },
  { name: "OpenAI — opt-in fallback", kind: "external", model: "gpt-4.1-mini", status: "healthy", latencyMs: 480, costPer1k: 0.15, weight: 8 },
  { name: "Anthropic — opt-in fallback", kind: "external", model: "claude-haiku", status: "circuit-open", latencyMs: 890, costPer1k: 0.25, weight: 2 },
];

const gatewayFailoverEvents = [
  { time: "09:41 UTC", text: "Self-hosted vLLM (primary) latency crossed 400ms threshold — routed next 12 requests to Ollama (secondary)" },
  { time: "08:14 UTC", text: "Anthropic fallback returned 3 consecutive 5xx — circuit breaker opened, excluded from routing pool" },
  { time: "Yesterday 22:03", text: "Self-hosted vLLM restarted for model reload — 40s of traffic routed to Ollama secondary with zero failed requests" },
];

const gatewayCostByModule = [
  { module: "Regulatory Change Intel", tokens: "2.1M", cost: 0 },
  { module: "Compliance Impact Analysis", tokens: "1.4M", cost: 0 },
  { module: "Audit Evidence Generation", tokens: "3.8M", cost: 0 },
  { module: "Predictive Regulatory Risk", tokens: "0.6M", cost: 0 },
  { module: "Cybersecurity Monitoring", tokens: "0.9M", cost: 0.14 },
  { module: "File Governance & Scan", tokens: "1.1M", cost: 0.09 },
];

const gatewayCostTrend = [
  { d: "Aug 1", cost: 0.4 }, { d: "Aug 3", cost: 0.9 }, { d: "Aug 5", cost: 0.7 }, { d: "Aug 7", cost: 1.6 },
  { d: "Aug 9", cost: 1.2 }, { d: "Aug 11", cost: 2.1 }, { d: "Aug 13", cost: 1.8 }, { d: "Aug 15", cost: 0.9 },
];

const gatewayBudgets = [
  { project: "Q3 Compliance Pilot", capUsd: 500, usedUsd: 335, pct: 67 },
  { project: "EU Entity — DORA Rollout", capUsd: 250, usedUsd: 61, pct: 24 },
  { project: "Default workspace", capUsd: 100, usedUsd: 92, pct: 92 },
];

const obligationRefs = [
  { law: "GDPR Art. 5 & 32", note: "Personal data must be processed securely and minimized to what's necessary." },
  { law: "CCPA/CPRA §1798.100", note: "Consumers' personal information must be inventoried and access-controlled." },
  { law: "PCI DSS Req. 3", note: "Stored cardholder data must be rendered unreadable (masked/encrypted/tokenized)." },
];

/* ---------------------------------------------------------------------- */
/*  Small building blocks                                                  */
/* ---------------------------------------------------------------------- */
function Panel({ title, eyebrow, right, children, style }) {
  return (
    <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 14, padding: "18px 20px", ...style }}>
      {(title || right) && (
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            {eyebrow && <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, letterSpacing: "0.09em", color: T.mutedDim, textTransform: "uppercase", marginBottom: 4 }}>{eyebrow}</div>}
            {title && <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 600, color: T.text }}>{title}</div>}
          </div>
          {right}
        </div>
      )}
      {children}
    </div>
  );
}

function KPI({ label, value, sub, tone = "neutral", icon: Icon }) {
  const color = tone === "good" ? T.green : tone === "bad" ? T.red : tone === "warn" ? T.amber : T.text;
  return (
    <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 14, padding: "18px 20px", flex: 1, minWidth: 170 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, letterSpacing: "0.08em", color: T.mutedDim, textTransform: "uppercase" }}>{label}</div>
        {Icon && <Icon size={15} color={T.mutedDim} />}
      </div>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 30, fontWeight: 700, color, marginTop: 8 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function Pill({ children, tone = "neutral" }) {
  const map = {
    neutral: { bg: "#1A2333", fg: T.muted },
    good: { bg: T.greenDim, fg: T.green },
    bad: { bg: T.redDim, fg: T.red },
    warn: { bg: T.amberDim, fg: T.amber },
    info: { bg: T.cyanDim, fg: T.cyan },
    indigo: { bg: "#232A57", fg: T.indigo },
  };
  const s = map[tone];
  return (
    <span style={{ background: s.bg, color: s.fg, fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 999, whiteSpace: "nowrap", fontFamily: "'IBM Plex Mono', monospace" }}>
      {children}
    </span>
  );
}

function AiTag() {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10.5, color: T.indigo, background: T.indigoDim, border: `1px solid ${T.indigo}55`, padding: "2px 7px", borderRadius: 6, fontFamily: "'IBM Plex Mono', monospace" }}>
      <Sparkles size={10} /> AI-drafted · cited
    </span>
  );
}

function SimTag() {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10.5, color: T.mutedDim, background: T.panelAlt, border: `1px solid ${T.border}`, padding: "2px 7px", borderRadius: 6, fontFamily: "'IBM Plex Mono', monospace" }}>
      <FlaskConical size={10} /> Simulated — not from a live source
    </span>
  );
}

function Sparkline({ data }) {
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 60},${18 - v * 14}`).join(" ");
  return (
    <svg width="64" height="20" viewBox="0 0 64 20">
      <polyline points={pts} fill="none" stroke={data[data.length - 1] ? T.green : T.red} strokeWidth="1.6" />
    </svg>
  );
}

const statusTone = { pass: "good", drift: "warn", fail: "bad", attest: "info", new: "indigo", reviewed: "neutral", dismissed: "neutral", signed: "good", draft: "warn", exported: "info", Open: "bad", "In Review": "warn", Remediating: "info", Accepted: "good" };

/* ---------------------------------------------------------------------- */
/*  Tab: Overview / Command Center                                         */
/* ---------------------------------------------------------------------- */
const RECONNECT_ENDPOINTS = { aws: "aws", azure: "azure", gcp: "gcp", ibm: "ibm", snowflake: "snowflake", databricks: "databricks" };

function Overview({ connections = [], email, credCache, onConnectionsChange }) {
  const [checking, setChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);
  const [changeLog, setChangeLog] = useState([]);
  const [autoCheck, setAutoCheck] = useState(false);

  const liveConnections = connections.filter((c) => c.status === "connected");
  const totalResources = liveConnections.reduce((s, c) => s + (c.resources?.length || 0), 0);
  const byCategory = ["cloud", "database", "file"].map((cat) => ({
    name: cat === "cloud" ? "Cloud" : cat === "database" ? "Database/Platform" : "Files",
    value: liveConnections.filter((c) => c.category === cat).reduce((s, c) => s + (c.resources?.length || 0), 0),
  })).filter((d) => d.value > 0);
  const byConnection = liveConnections.map((c) => ({ name: c.name, resources: c.resources?.length || 0 }));
  const categoryColor = { Cloud: T.cyan, "Database/Platform": T.amber, Files: T.coral };

  const checkForChanges = async () => {
    if (!credCache) return;
    setChecking(true);
    const events = [];
    for (const conn of liveConnections) {
      const endpoint = RECONNECT_ENDPOINTS[conn.id];
      const creds = credCache.current?.[conn.id];
      if (!endpoint || !creds) continue; // no re-check path (e.g. files) or credentials no longer cached this session
      try {
        const resp = await fetch(`/api/connect/${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(creds),
        });
        const result = await resp.json();
        if (!result.resources) continue;
        const oldNames = new Set((conn.resources || []).map((r) => r.name));
        const newNames = new Set(result.resources.map((r) => r.name));
        const added = result.resources.filter((r) => !oldNames.has(r.name));
        const removed = [...oldNames].filter((n) => !newNames.has(n));
        if (added.length || removed.length) {
          events.push({ connection: conn.name, added: added.map((r) => r.name), removed, time: new Date().toISOString() });
          onConnectionsChange?.({ ...conn, resources: result.resources });
        }
      } catch {
        // network hiccup on one connector shouldn't stop checking the rest
      }
    }
    setChangeLog((prev) => [...events, ...prev].slice(0, 20));
    setLastChecked(new Date());
    setChecking(false);
  };

  useEffect(() => {
    if (!autoCheck) return;
    const interval = setInterval(checkForChanges, 60000);
    return () => clearInterval(interval);
  }, [autoCheck, connections]); // eslint-disable-line react-hooks/exhaustive-deps

  const rechecakbleCount = liveConnections.filter((c) => RECONNECT_ENDPOINTS[c.id] && credCache?.current?.[c.id]).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <KPI label="Connected sources" value={liveConnections.length} sub="Real — enterprise-wide" icon={Database} />
        <KPI label="Total resources tracked" value={totalResources} sub="Real — across all connections" icon={FileStack} />
        <KPI label="Live re-check available" value={`${rechecakbleCount}/${liveConnections.length}`} sub="Sources with cached session credentials" icon={Route} />
        <KPI label="Last checked" value={lastChecked ? lastChecked.toLocaleTimeString() : "never"} sub={autoCheck ? "Auto-checking every 60s" : "Manual"} />
      </div>

      <Panel
        eyebrow="Real — enterprise data, no simulation"
        title="Resources by source, across your connected enterprise"
        right={
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={() => setAutoCheck(!autoCheck)} style={{ fontSize: 10.5, fontWeight: 600, color: autoCheck ? T.green : T.mutedDim, background: autoCheck ? T.greenDim : "transparent", border: `1px solid ${autoCheck ? T.green : T.border}`, borderRadius: 6, padding: "4px 9px", cursor: "pointer" }}>
              {autoCheck ? "Auto-check ON" : "Auto-check OFF"}
            </button>
            <button onClick={checkForChanges} disabled={checking || !rechecakbleCount} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10.5, fontWeight: 600, color: T.text, background: T.panelAlt, border: `1px solid ${T.borderLight}`, borderRadius: 6, padding: "4px 9px", cursor: rechecakbleCount ? "pointer" : "not-allowed" }}>
              {checking && <Loader2 size={11} className="spin" />} Check for changes
            </button>
          </div>
        }
      >
        {liveConnections.length === 0 ? (
          <div style={{ fontSize: 12.5, color: T.mutedDim }}>No connections yet — connect a source in the workspace to populate this view with real data.</div>
        ) : (
          <>
            {rechecakbleCount === 0 && (
              <div style={{ fontSize: 11, color: T.mutedDim, background: T.panelAlt, borderRadius: 8, padding: "8px 11px", marginBottom: 14 }}>
                Live re-checking needs credentials cached earlier this session (from connecting in the workspace) — if
                the page was reloaded since then, reconnect in the workspace to re-enable this.
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 20 }}>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={byCategory} dataKey="value" nameKey="name" innerRadius={45} outerRadius={72} paddingAngle={2}>
                    {byCategory.map((d, i) => <Cell key={i} fill={categoryColor[d.name] || T.mutedDim} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: T.panelAlt, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={byConnection} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid stroke={T.border} horizontal={false} />
                  <XAxis type="number" tick={{ fill: T.muted, fontSize: 10.5 }} axisLine={{ stroke: T.border }} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fill: T.muted, fontSize: 10.5 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: T.panelAlt, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="resources" fill={T.coral} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </Panel>

      {changeLog.length > 0 && (
        <Panel eyebrow="Real" title="Detected data changes">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {changeLog.map((e, i) => (
              <div key={i} style={{ padding: "10px 12px", background: T.panelAlt, borderRadius: 8, fontSize: 12 }}>
                <div style={{ fontWeight: 600, color: T.text, marginBottom: 4 }}>{e.connection} — {new Date(e.time).toLocaleString()}</div>
                {e.added.length > 0 && <div style={{ color: T.green }}>+ Added: {e.added.join(", ")}</div>}
                {e.removed.length > 0 && <div style={{ color: T.red }}>− Removed: {e.removed.join(", ")}</div>}
              </div>
            ))}
          </div>
        </Panel>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16 }}>
        <Panel eyebrow="Coverage by framework" title="Control status across regulatory frameworks" right={<SimTag />}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {frameworkCoverage.map((f) => (
              <div key={f.name}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 5 }}>
                  <span style={{ color: T.text, fontWeight: 500 }}>{f.name}</span>
                  <span style={{ color: T.muted, fontFamily: "IBM Plex Mono" }}>{f.pass}% passing</span>
                </div>
                <div style={{ display: "flex", height: 8, borderRadius: 5, overflow: "hidden", background: T.panelAlt }}>
                  <div style={{ width: `${f.pass}%`, background: T.green }} />
                  <div style={{ width: `${f.remediation}%`, background: T.amber }} />
                  <div style={{ width: `${f.fail}%`, background: T.red }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel eyebrow="Countdown" title="Upcoming regulatory deadlines" right={<SimTag />}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {deadlines.map((d) => (
              <div key={d.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 10, borderBottom: `1px solid ${T.border}` }}>
                <div>
                  <div style={{ fontSize: 12.5, color: T.text, fontWeight: 500 }}>{d.name}</div>
                  <div style={{ fontSize: 11, color: T.mutedDim, fontFamily: "IBM Plex Mono" }}>{d.date}</div>
                </div>
                <Pill tone={d.sev === "high" ? "bad" : d.sev === "med" ? "warn" : "neutral"}>{d.days}d</Pill>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function matchRegionGuideline(region) {
  if (!region) return null;
  const r = region.toLowerCase().trim();
  for (const g of REGION_GUIDELINES) {
    if (g.prefixes.some((p) => r.startsWith(p) || r === p)) return g;
  }
  return null;
}

function Impact({ connections = [] }) {
  const liveConnections = connections.filter((c) => c.status === "connected");
  const withRegion = liveConnections.filter((c) => c.meta?.region);
  const withoutRegion = liveConnections.filter((c) => !c.meta?.region);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <KPI label="Open gaps" value="8" tone="warn" />
        <KPI label="No control exists" value="2" tone="bad" />
        <KPI label="Avg. time to remediation plan" value="3.2d" tone="good" />
        <KPI label="Connections with region validated" value={withRegion.length} sub="Real — from connection metadata" icon={Route} />
      </div>

      <Panel eyebrow="Real" title="Region-based data guidelines — validated against connected sources">
        <p style={{ fontSize: 12, color: T.muted, marginBottom: 16, lineHeight: 1.6 }}>
          Every connected source with a known region is checked against the data-protection regulation that applies
          there, and the impact is shown against that specific connection — not a generic list.
        </p>
        {liveConnections.length === 0 ? (
          <div style={{ fontSize: 12.5, color: T.mutedDim }}>No connections yet — connect a source in the workspace to run this validation.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {withRegion.map((c) => {
              const g = matchRegionGuideline(c.meta.region);
              return (
                <div key={c.id} style={{ padding: "12px 14px", background: T.panelAlt, borderRadius: 10, border: `1px solid ${T.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{c.name}</span>
                      <span style={{ fontSize: 10.5, color: T.mutedDim, fontFamily: "IBM Plex Mono" }}>region: {c.meta.region}</span>
                    </div>
                    {g ? <Pill tone="warn">{g.law}</Pill> : <Pill tone="neutral">No specific match</Pill>}
                  </div>
                  {g ? (
                    <>
                      <div style={{ fontSize: 11.5, color: T.muted, lineHeight: 1.6 }}>
                        <strong style={{ color: T.text }}>{g.jurisdiction}</strong> — {g.summary}
                      </div>
                      <div style={{ fontSize: 11, color: T.coral, marginTop: 6 }}>
                        Impact: {c.resources?.length || 0} connected resource{c.resources?.length !== 1 ? "s" : ""} under this connection fall{c.resources?.length === 1 ? "s" : ""} within {g.jurisdiction} scope — confirm data handling for this connection satisfies {g.law} requirements above.
                      </div>
                    </>
                  ) : (
                    <div style={{ fontSize: 11.5, color: T.mutedDim }}>No specific regional guideline matched for region "{c.meta.region}" in our reference table.</div>
                  )}
                </div>
              );
            })}
            {withoutRegion.length > 0 && (
              <div style={{ fontSize: 11, color: T.mutedDim, padding: "8px 2px" }}>
                {withoutRegion.length} connection{withoutRegion.length !== 1 ? "s" : ""} without a determinable region ({withoutRegion.map((c) => c.name).join(", ")}) — region-based validation isn't available for these connector types yet.
              </div>
            )}
          </div>
        )}
      </Panel>

      <Panel eyebrow="AI-proposed, human-approved" title="Compliance impact findings" right={<SimTag />}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
            <thead>
              <tr style={{ textAlign: "left", color: T.mutedDim, fontFamily: "IBM Plex Mono", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <th style={{ padding: "0 10px 10px 0" }}>Regulatory driver</th>
                <th style={{ padding: "0 10px 10px" }}>Affected control</th>
                <th style={{ padding: "0 10px 10px" }}>Gap</th>
                <th style={{ padding: "0 10px 10px" }}>Effort</th>
                <th style={{ padding: "0 10px 10px" }}>Owner</th>
                <th style={{ padding: "0 10px 10px" }}>Status</th>
                <th style={{ padding: "0 0 10px" }}>Due</th>
              </tr>
            </thead>
            <tbody>
              {impactFindings.map((f) => (
                <tr key={f.id} style={{ borderTop: `1px solid ${T.border}` }}>
                  <td style={{ padding: "10px 10px 10px 0", color: T.text }}>{f.reg}</td>
                  <td style={{ padding: "10px", color: T.muted }}>{f.control}</td>
                  <td style={{ padding: "10px" }}><Pill tone={f.gap === "No control" ? "bad" : "warn"}>{f.gap}</Pill></td>
                  <td style={{ padding: "10px", color: T.muted }}>{f.effort}</td>
                  <td style={{ padding: "10px", color: T.muted }}>{f.owner}</td>
                  <td style={{ padding: "10px" }}><Pill tone={statusTone[f.status] || "neutral"}>{f.status}</Pill></td>
                  <td style={{ padding: "10px 0", color: T.mutedDim, fontFamily: "IBM Plex Mono" }}>{f.due}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  Tab: Control Validation                                                */
/* ---------------------------------------------------------------------- */
function Controls() {
  const icons = { pass: CheckCircle2, drift: AlertTriangle, fail: XCircle, attest: Clock };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <KPI label="Controls monitored" value="473" />
        <KPI label="Live drift events" value="2" tone="warn" />
        <KPI label="Failing" value="1" tone="bad" />
        <KPI label="Auto-checked vs. attested" value="81 / 19%" sub="Machine-checkable coverage" />
      </div>
      <Panel eyebrow="Continuous validation" title="Control checks — live status" right={<SimTag />}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {controlsList.map((c) => {
            const Icon = icons[c.status];
            const tone = c.status === "pass" ? T.green : c.status === "fail" ? T.red : c.status === "drift" ? T.amber : T.cyan;
            return (
              <div key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${T.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Icon size={17} color={tone} />
                  <div>
                    <div style={{ fontSize: 13, color: T.text, fontWeight: 500 }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: T.mutedDim, fontFamily: "IBM Plex Mono" }}>{c.id} · {c.framework}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                  <span style={{ fontSize: 11.5, color: T.mutedDim }}>{c.lastCheck}</span>
                  <Sparkline data={c.trend} />
                  <Pill tone={statusTone[c.status]}>{c.status}</Pill>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  Tab: Evidence Generation                                               */
/* ---------------------------------------------------------------------- */
/* ---------------------------------------------------------------------- */
/*  Tab: Predictive Risk & Audit Evidence (merged module)                  */
/* ---------------------------------------------------------------------- */
function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return null;
  const splitRow = (line) => line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
  const headers = splitRow(lines[0]);
  const rows = lines.slice(1).map(splitRow);
  return { headers, rows };
}

function analyzeHistoricalFile(text) {
  const parsed = parseCsv(text);
  if (!parsed) return { error: "Couldn't parse this as CSV — expected a header row plus at least one data row." };
  const { headers, rows } = parsed;

  // Find a date-like column (by header name) and numeric columns (by sampling values).
  const dateColIdx = headers.findIndex((h) => /date|time|month|period/i.test(h));
  const numericCols = headers
    .map((h, i) => i)
    .filter((i) => i !== dateColIdx && rows.slice(0, 20).every((r) => r[i] !== undefined && r[i] !== "" && !isNaN(parseFloat(r[i]))));

  if (!numericCols.length) return { error: "No numeric column detected — anomaly detection needs at least one column of numbers." };

  // Use the first numeric column for anomaly scoring (real z-score, not simulated).
  const col = numericCols[0];
  const values = rows.map((r) => parseFloat(r[col])).filter((v) => !isNaN(v));
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  const stdev = Math.sqrt(variance) || 1;
  const anomalyRows = rows
    .map((r, i) => ({ row: r, z: (parseFloat(r[col]) - mean) / stdev }))
    .filter((r) => Math.abs(r.z) > 2);

  // Bucket anomalies over "time" — by parsed date-column month if available, else by row-order decile.
  let buckets = [];
  if (dateColIdx >= 0) {
    const byMonth = {};
    rows.forEach((r, i) => {
      const raw = r[dateColIdx];
      const d = new Date(raw);
      const key = isNaN(d) ? "unparsed" : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      byMonth[key] = byMonth[key] || { total: 0, anomalies: 0 };
      byMonth[key].total += 1;
      if (Math.abs((parseFloat(r[col]) - mean) / stdev) > 2) byMonth[key].anomalies += 1;
    });
    buckets = Object.entries(byMonth).filter(([k]) => k !== "unparsed").sort(([a], [b]) => (a > b ? 1 : -1)).map(([period, v]) => ({ period, ...v }));
  } else {
    const bucketCount = Math.min(10, Math.max(3, Math.floor(rows.length / 10)));
    const size = Math.ceil(rows.length / bucketCount);
    for (let b = 0; b < bucketCount; b++) {
      const slice = rows.slice(b * size, (b + 1) * size);
      const anomalies = slice.filter((r) => Math.abs((parseFloat(r[col]) - mean) / stdev) > 2).length;
      if (slice.length) buckets.push({ period: `Rows ${b * size + 1}-${b * size + slice.length}`, total: slice.length, anomalies });
    }
  }

  // Real (if simple) linear regression of anomaly count over bucket index, projected one bucket forward.
  let projection = null;
  if (buckets.length >= 3) {
    const n = buckets.length;
    const xs = buckets.map((_, i) => i);
    const ys = buckets.map((b) => b.anomalies);
    const xMean = xs.reduce((a, b) => a + b, 0) / n;
    const yMean = ys.reduce((a, b) => a + b, 0) / n;
    const slope = xs.reduce((s, x, i) => s + (x - xMean) * (ys[i] - yMean), 0) / (xs.reduce((s, x) => s + (x - xMean) ** 2, 0) || 1);
    const intercept = yMean - slope * xMean;
    const predicted = Math.max(0, slope * n + intercept);
    projection = { nextValue: Math.round(predicted * 10) / 10, slope };
  }

  return {
    fileRows: rows.length, columnUsed: headers[col], mean: Math.round(mean * 100) / 100, stdev: Math.round(stdev * 100) / 100,
    anomalyCount: anomalyRows.length, anomalyRate: Math.round((anomalyRows.length / rows.length) * 1000) / 10,
    buckets, projection, sampleAnomalies: anomalyRows.slice(0, 5).map((a) => a.row),
    headers,
  };
}

function Predictive() {
  const [fileName, setFileName] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    setFileName(file.name);
    setError("");
    setAnalysis(null);
    const reader = new FileReader();
    reader.onload = () => {
      const result = analyzeHistoricalFile(String(reader.result));
      if (result.error) setError(result.error);
      else setAnalysis(result);
    };
    reader.onerror = () => setError("Couldn't read this file.");
    reader.readAsText(file);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Panel eyebrow="Real — statistical analysis of your file" title="Load historical data to predict future anomalies">
        <p style={{ fontSize: 12, color: T.muted, marginBottom: 14, lineHeight: 1.6 }}>
          Upload a CSV of historical records (with a date/period column and at least one numeric column — loss
          amounts, transaction counts, exception counts, etc.). This runs a real z-score anomaly detection against
          your data, then a simple linear projection of the anomaly trend — not a trained ML model, but a real,
          transparent calculation over the file you actually loaded.
        </p>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]); }}
          style={{ border: `1.5px dashed ${dragOver ? T.coral : T.borderLight}`, borderRadius: 12, padding: "22px 16px", textAlign: "center", background: dragOver ? T.coralDim : T.panelAlt }}
        >
          <UploadCloud size={22} color={dragOver ? T.coral : T.mutedDim} style={{ marginBottom: 8 }} />
          <div style={{ fontSize: 12.5, color: T.text, fontWeight: 500 }}>Drop a CSV here, or</div>
          <button onClick={() => inputRef.current?.click()} style={{ marginTop: 8, fontSize: 11.5, fontWeight: 600, color: T.coral, border: `1px solid ${T.coral}55`, padding: "6px 12px", borderRadius: 8, background: T.coralDim, cursor: "pointer" }}>
            Browse files
          </button>
          <input ref={inputRef} type="file" accept=".csv,text/csv,text/plain" style={{ display: "none" }} onChange={(e) => handleFile(e.target.files?.[0])} />
        </div>
        {fileName && <div style={{ fontSize: 11.5, color: T.mutedDim, marginTop: 10 }}>Loaded: {fileName}</div>}
        {error && <div style={{ fontSize: 12, color: T.red, background: T.redDim, borderRadius: 8, padding: "8px 11px", marginTop: 10 }}>{error}</div>}
      </Panel>

      {analysis && (
        <>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <KPI label="Rows analyzed" value={analysis.fileRows} sub="Real — from your file" icon={FileStack} />
            <KPI label="Anomalies detected" value={analysis.anomalyCount} tone={analysis.anomalyCount > 0 ? "warn" : "good"} sub={`${analysis.anomalyRate}% of rows, |z| > 2`} />
            <KPI label="Column analyzed" value={analysis.columnUsed} sub={`mean ${analysis.mean}, stdev ${analysis.stdev}`} />
            {analysis.projection && (
              <KPI label="Projected next-period anomalies" value={analysis.projection.nextValue} tone={analysis.projection.slope > 0 ? "warn" : "good"} sub="Linear trend projection" />
            )}
          </div>

          <Panel eyebrow="Real" title="Anomaly trend over time — from your file">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={analysis.buckets}>
                <CartesianGrid stroke={T.border} vertical={false} />
                <XAxis dataKey="period" tick={{ fill: T.muted, fontSize: 10 }} axisLine={{ stroke: T.border }} tickLine={false} />
                <YAxis tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: T.panelAlt, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="anomalies" name="Anomalies" stroke={T.coral} strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
            {analysis.projection && (
              <div style={{ fontSize: 11, color: T.mutedDim, marginTop: 10, lineHeight: 1.6 }}>
                Trend slope: {analysis.projection.slope > 0 ? "increasing" : analysis.projection.slope < 0 ? "decreasing" : "flat"} ({analysis.projection.slope.toFixed(2)}/period).
                Next-period projection is a simple linear extrapolation of this trend, not a trained model — treat it
                as a directional signal, not a precise forecast.
              </div>
            )}
          </Panel>

          {analysis.sampleAnomalies.length > 0 && (
            <Panel eyebrow="Real" title="Sample flagged rows">
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ textAlign: "left", color: T.mutedDim, fontFamily: "IBM Plex Mono", fontSize: 10 }}>
                      {analysis.headers.map((h) => <th key={h} style={{ padding: "0 10px 8px 0" }}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.sampleAnomalies.map((row, i) => (
                      <tr key={i} style={{ borderTop: `1px solid ${T.border}` }}>
                        {row.map((cell, j) => <td key={j} style={{ padding: "8px 10px 8px 0", color: T.muted }}>{cell}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          )}
        </>
      )}

      <Panel eyebrow="Gradient-boosted risk model" title="Risk by topic (regulatory-change based)" right={<SimTag />}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {predictiveRisks.map((r) => (
            <div key={r.topic} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 0", borderBottom: `1px solid ${T.border}` }}>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ fontSize: 13, color: T.text, fontWeight: 500 }}>{r.topic}</div>
                <div style={{ fontSize: 11.5, color: T.mutedDim, marginTop: 2 }}>{r.drivers}</div>
                <div style={{ fontSize: 10.5, color: T.mutedDim, fontFamily: "IBM Plex Mono", marginTop: 2 }}>n = {r.n} historical actions considered</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: 11.5, color: r.trend === "up" ? T.red : r.trend === "down" ? T.green : T.mutedDim, fontFamily: "IBM Plex Mono" }}>{r.delta}</span>
                <div style={{ width: 46, textAlign: "center", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 20, color: r.score > 65 ? T.red : r.score > 40 ? T.amber : T.green }}>{r.score}</div>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <KPI label="Evidence packages this quarter" value="47" />
        <KPI label="Awaiting sign-off" value="2" tone="warn" />
        <KPI label="Hash-chain verified" value="100%" tone="good" />
      </div>
      <Panel eyebrow="WORM-stored · hash-chained" title="Audit evidence packages" right={<SimTag />}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {evidencePackages.map((e) => (
            <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 0", borderBottom: `1px solid ${T.border}` }}>
              <div>
                <div style={{ fontSize: 13, color: T.text, fontWeight: 500 }}>{e.control}</div>
                <div style={{ fontSize: 11, color: T.mutedDim, fontFamily: "IBM Plex Mono" }}>{e.id} · {e.period} · {e.size}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: 11, color: T.mutedDim, fontFamily: "IBM Plex Mono" }}>{e.hash}</span>
                <Pill tone={statusTone[e.status]}>{e.status}</Pill>
              </div>
            </div>
          ))}
        </div>
      </Panel>
      <Panel eyebrow="Example output" title="AI-drafted narrative — IAM-002 MFA Enforcement, Q3 2026">
        <AiTag />
        <p style={{ fontSize: 12.5, color: T.muted, lineHeight: 1.7, marginTop: 10 }}>
          Control IAM-002 requires multi-factor authentication for all privileged accounts across production identity providers.
          Over the audit period, 91 automated checks were executed against the identity provider's admin role group; all 91
          returned a passing result with no exceptions. One access-review artifact (uploaded 2026-07-14) confirms quarterly
          recertification of the privileged group membership. No control drift events were recorded in this period. Evidence
          is drawn from 14 underlying artifacts, each independently hash-verified against capture-time records.
        </p>
        <div style={{ marginTop: 12, fontSize: 11.5, color: T.mutedDim }}>Signed by R. Okafor · Aug 2, 2026 · version 3</div>
      </Panel>
    </div>
  );
}

/*  Tab: AI Gateway & Cost Governance (Module 10)                          */
/* ---------------------------------------------------------------------- */
function Gateway() {
  const [strategy, setStrategy] = useState("cost-optimized");
  const totalTokens = "10.0M";
  const totalCost = gatewayCostByModule.reduce((s, m) => s + m.cost, 0);
  const statusColor = { healthy: T.green, degraded: T.amber, "circuit-open": T.red };
  const statusTone2 = { healthy: "good", degraded: "warn", "circuit-open": "bad" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <KPI label="Tokens this month" value={totalTokens} icon={Zap} />
        <KPI label="Spend this month" value={`$${totalCost.toFixed(2)}`} tone="good" sub="96% served by self-hosted models" icon={Wallet} />
        <KPI label="Providers in pool" value={`${gatewayProviders.filter(p => p.status !== "circuit-open").length}/${gatewayProviders.length}`} icon={Route} />
        <KPI label="Failover events (7d)" value={gatewayFailoverEvents.length} tone="warn" icon={ArrowRightLeft} />
      </div>

      <Panel eyebrow="Routing & failover" title="Provider pool — cost, latency & availability" right={<SimTag />}>
        <p style={{ fontSize: 12, color: T.muted, marginBottom: 16, lineHeight: 1.6 }}>
          Self-hosted models are the default route for every AI call in EDH. External providers are strictly
          opt-in fallbacks a customer can enable for specific low-sensitivity tasks — never a silent default —
          and the gateway continuously re-evaluates cost, latency, and health across whichever pool is configured.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11.5, color: T.mutedDim }}>Active routing strategy:</span>
          {["cost-optimized", "least-latency", "weighted", "quality-scored"].map((s) => (
            <button
              key={s}
              onClick={() => setStrategy(s)}
              style={{
                fontSize: 11, fontWeight: 600, padding: "5px 11px", borderRadius: 999, cursor: "pointer",
                border: `1px solid ${strategy === s ? T.amber : T.border}`,
                background: strategy === s ? T.amberDim : "transparent",
                color: strategy === s ? T.amber : T.muted,
              }}
            >
              {s}
            </button>
          ))}
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
            <thead>
              <tr style={{ textAlign: "left", color: T.mutedDim, fontFamily: "IBM Plex Mono", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <th style={{ padding: "0 10px 10px 0" }}>Provider</th>
                <th style={{ padding: "0 10px 10px" }}>Model</th>
                <th style={{ padding: "0 10px 10px" }}>Status</th>
                <th style={{ padding: "0 10px 10px" }}>Avg latency</th>
                <th style={{ padding: "0 10px 10px" }}>Cost / 1K tokens</th>
                <th style={{ padding: "0 0 10px" }}>Routing weight</th>
              </tr>
            </thead>
            <tbody>
              {gatewayProviders.map((p) => (
                <tr key={p.name} style={{ borderTop: `1px solid ${T.border}` }}>
                  <td style={{ padding: "10px 10px 10px 0", color: T.text, display: "flex", alignItems: "center", gap: 7 }}>
                    <CircleDot size={11} color={statusColor[p.status]} /> {p.name}
                  </td>
                  <td style={{ padding: "10px", color: T.muted, fontFamily: "IBM Plex Mono" }}>{p.model}</td>
                  <td style={{ padding: "10px" }}><Pill tone={statusTone2[p.status]}>{p.status}</Pill></td>
                  <td style={{ padding: "10px", color: T.muted }}>{p.latencyMs}ms</td>
                  <td style={{ padding: "10px", color: T.muted }}>{p.costPer1k === 0 ? "$0.00 (self-hosted)" : `$${p.costPer1k.toFixed(2)}`}</td>
                  <td style={{ padding: "10px", color: T.muted }}>{p.weight}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel eyebrow="Live" title="Recent failover & circuit-breaker events" right={<SimTag />}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {gatewayFailoverEvents.map((e, i) => (
            <div key={i} style={{ display: "flex", gap: 12, padding: "11px 0", borderBottom: `1px solid ${T.border}` }}>
              <GitBranch size={14} color={T.mutedDim} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: 12.5, color: T.text }}>{e.text}</div>
                <div style={{ fontSize: 10.5, color: T.mutedDim, fontFamily: "IBM Plex Mono", marginTop: 2 }}>{e.time}</div>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16 }}>
        <Panel eyebrow="FinOps" title="Spend trend (14 days)">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={gatewayCostTrend}>
              <defs>
                <linearGradient id="costFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={T.cyan} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={T.cyan} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={T.border} vertical={false} />
              <XAxis dataKey="d" tick={{ fill: T.muted, fontSize: 10.5 }} axisLine={{ stroke: T.border }} tickLine={false} />
              <YAxis tick={{ fill: T.muted, fontSize: 10.5 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: T.panelAlt, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12 }} formatter={(v) => [`$${v}`, "Spend"]} />
              <Area type="monotone" dataKey="cost" stroke={T.cyan} strokeWidth={2} fill="url(#costFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel eyebrow="Budget control" title="Project budget caps">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {gatewayBudgets.map((b) => (
              <div key={b.project}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                  <span style={{ color: T.text }}>{b.project}</span>
                  <span style={{ color: T.mutedDim, fontFamily: "IBM Plex Mono" }}>${b.usedUsd} / ${b.capUsd}</span>
                </div>
                <div style={{ height: 7, borderRadius: 4, background: T.panelAlt, overflow: "hidden" }}>
                  <div style={{ width: `${b.pct}%`, height: "100%", background: b.pct > 85 ? T.red : b.pct > 60 ? T.amber : T.green }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel eyebrow="Auditing" title="Token & cost attribution by module" right={<SimTag />}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
            <thead>
              <tr style={{ textAlign: "left", color: T.mutedDim, fontFamily: "IBM Plex Mono", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <th style={{ padding: "0 10px 10px 0" }}>Module</th>
                <th style={{ padding: "0 10px 10px" }}>Tokens (30d)</th>
                <th style={{ padding: "0 0 10px" }}>Cost (30d)</th>
              </tr>
            </thead>
            <tbody>
              {gatewayCostByModule.map((m) => (
                <tr key={m.module} style={{ borderTop: `1px solid ${T.border}` }}>
                  <td style={{ padding: "10px 10px 10px 0", color: T.text }}>{m.module}</td>
                  <td style={{ padding: "10px", color: T.muted, fontFamily: "IBM Plex Mono" }}>{m.tokens}</td>
                  <td style={{ padding: "10px", color: T.muted }}>{m.cost === 0 ? "$0.00" : `$${m.cost.toFixed(2)}`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ fontSize: 11, color: T.mutedDim, marginTop: 12, lineHeight: 1.6 }}>
          Every AI call is metered at the point of execution and attributed to the module, project, and user that
          triggered it — the same record that feeds this view is exportable for audit and cost-recovery purposes,
          per the AI-governance logging described in architecture.md §4.
        </div>
      </Panel>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  App shell                                                              */
/* ---------------------------------------------------------------------- */
export default function EnterpriseDrishtiHub({ onBack, onHome, enabledModuleIds, activeProject, email, credCache, connections: connectionsProp }) {
  const [connections, setConnections] = useState(() => connectionsProp || (email ? getConnections(email) : []));
  const handleConnectionsChange = (updatedConn) => {
    if (email) upsertConnection(email, updatedConn);
    setConnections((prev) => prev.map((c) => (c.id === updatedConn.id ? updatedConn : c)));
  };
  const filteredNav = enabledModuleIds && enabledModuleIds.length
    ? MODULE_LIST.filter((m) => enabledModuleIds.includes(m.id))
    : MODULE_LIST;
  // If every provided id is stale (e.g. from a history entry saved before a
  // module was renamed/removed), filteredNav can come back empty — fall back
  // to the full list rather than rendering with no active module at all.
  const NAV = filteredNav.length ? filteredNav : MODULE_LIST;
  const [tab, setTab] = useState(NAV[0]?.id || "overview");
  const active = useMemo(() => NAV.find((n) => n.id === tab) || NAV[0], [tab, NAV]);

  const panels = {
    overview: <Overview connections={connections} email={email} credCache={credCache} onConnectionsChange={handleConnectionsChange} />,
    impact: <Impact connections={connections} />,
    controls: <Controls />,
    predictive: <Predictive connections={connections} />,
    gateway: <Gateway />,
  };

  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.text, fontFamily: "'Inter', sans-serif", display: "flex" }}>
      <style>{FONT_IMPORT}{`.spin { animation: edh-spin 0.9s linear infinite; } @keyframes edh-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* Sidebar */}
      <div style={{ width: 258, borderRight: `1px solid ${T.border}`, padding: "22px 14px", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 10px", marginBottom: 14 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: T.coral, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldCheck size={17} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14.5, lineHeight: 1.1 }}>Enterprise Drishti Hub</div>
            <div style={{ fontSize: 9.5, color: T.mutedDim, fontFamily: "IBM Plex Mono" }}>EDH · self-hosted</div>
          </div>
        </div>

        {/* Platform tier — pinned at the top, deliberately separate from the functional Modules/Features below */}
        {NAV.filter((n) => n.tier === "platform").map((n) => {
          const Icon = n.icon;
          const isActive = tab === n.id;
          return (
            <button
              key={n.id}
              onClick={() => setTab(n.id)}
              style={{
                display: "flex", alignItems: "center", gap: 9, padding: "9px 12px", borderRadius: 9, width: "100%", marginBottom: 18,
                background: isActive ? T.coralDim : T.panelAlt,
                border: `1px solid ${isActive ? T.coral : T.border}`,
                color: isActive ? T.coral : T.muted, textAlign: "left", cursor: "pointer", fontSize: 12, fontFamily: "'Inter', sans-serif",
              }}
            >
              <Icon size={14} color={isActive ? T.coral : T.mutedDim} />
              <div>
                <div style={{ fontWeight: 600 }}>{n.label}</div>
                <div style={{ fontSize: 9, color: T.mutedDim, fontFamily: "IBM Plex Mono" }}>Technical platform</div>
              </div>
            </button>
          );
        })}

        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {["module"].map((tier) => {
            const items = NAV.filter((n) => n.tier === tier);
            if (!items.length) return null;
            const tierHeading = "Modules";
            return (
              <div key={tier} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 9.5, color: T.mutedDim, fontFamily: "IBM Plex Mono", textTransform: "uppercase", letterSpacing: "0.08em", padding: "6px 12px 4px" }}>{tierHeading}</div>
                {items.map((n) => {
                  const Icon = n.icon;
                  const isActive = tab === n.id;
                  return (
                    <button
                      key={n.id}
                      onClick={() => setTab(n.id)}
                      style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 9, width: "100%",
                        background: isActive ? T.panel : "transparent",
                        border: isActive ? `1px solid ${T.borderLight}` : "1px solid transparent",
                        color: isActive ? T.text : T.muted, textAlign: "left", cursor: "pointer", fontSize: 12.5, fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      <Icon size={15} color={isActive ? T.amber : T.mutedDim} />
                      <div>
                        <div style={{ fontWeight: isActive ? 600 : 500 }}>{n.label}</div>
                        <div style={{ fontSize: 9.5, color: T.mutedDim, fontFamily: "IBM Plex Mono" }}>{n.tierLabel}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {connections.filter((c) => c.status === "connected").length > 0 && (
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 10, color: T.mutedDim, fontFamily: "IBM Plex Mono", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8, padding: "0 4px" }}>
              Connected sources
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3, maxHeight: 200, overflowY: "auto" }}>
              {connections.filter((c) => c.status === "connected").map((c) => {
                // Files (and any connector with individually-named resources) show each
                // real item by name; connectors without itemized resources fall back to
                // the connector's own name.
                const items = c.resources?.length ? c.resources.map((r) => r.name) : [c.name];
                return items.map((itemName, i) => (
                  <div key={`${c.id}-${i}`} style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 8px", fontSize: 11, color: T.muted }}>
                    {c.category === "file" ? <FileStack size={11} color={T.coral} style={{ flexShrink: 0 }} /> : <Database size={11} color={T.cyan} style={{ flexShrink: 0 }} />}
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={itemName}>{itemName}</span>
                  </div>
                ));
              })}
            </div>
          </div>
        )}

        {onBack && (
          <button
            onClick={onBack}
            style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 8, fontSize: 11.5, color: T.muted, background: "transparent", border: "none", cursor: "pointer", padding: "8px 10px", textAlign: "left" }}
          >
            <ArrowLeft size={13} /> Back to workspace
          </button>
        )}
        {onHome && (
          <button
            onClick={onHome}
            style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5, color: T.muted, background: "transparent", border: "none", cursor: "pointer", padding: "8px 10px", textAlign: "left" }}
          >
            <Home size={13} /> Home
          </button>
        )}

        <div style={{ marginTop: onBack ? 10 : "auto", padding: "12px", borderRadius: 10, background: T.panelAlt, border: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: T.green }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: T.green }} /> All AI inference on-prem
          </div>
          <div style={{ fontSize: 10.5, color: T.mutedDim, marginTop: 4 }}>No data leaves your network</div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ position: "sticky", top: 0, zIndex: 15, background: `${T.bg}F5`, backdropFilter: "blur(6px)", borderBottom: `1px solid ${T.border}`, padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
              <span style={{ fontSize: 10.5, color: T.mutedDim, fontFamily: "IBM Plex Mono" }}>{active.tierLabel}</span>
              {activeProject && (
                <span style={{ fontSize: 10, fontWeight: 600, color: T.coral, background: T.coralDim, borderRadius: 5, padding: "1px 7px", fontFamily: "IBM Plex Mono" }}>
                  {activeProject.name}
                </span>
              )}
            </div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 19 }}>{active.label}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, background: T.panel, border: `1px solid ${T.border}`, borderRadius: 9, padding: "7px 11px" }}>
              <Search size={13} color={T.mutedDim} />
              <span style={{ fontSize: 12, color: T.mutedDim }}>Search controls, regulations, evidence…</span>
            </div>
            <Bell size={16} color={T.mutedDim} />
            <div style={{ width: 30, height: 30, borderRadius: 999, background: T.indigo, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11.5, fontWeight: 700, color: "#FFFFFF" }}>JL</div>
          </div>
        </div>
        <div style={{ padding: "22px 28px 40px" }}>{panels[tab]}</div>
      </div>
      <ChatAssistant
        onAction={(action) => {
          if (NAV.some((n) => n.id === action.target)) setTab(action.target);
        }}
      />
    </div>
  );
}
