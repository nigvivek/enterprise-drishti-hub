import React, { useState, useMemo } from "react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, RadarChart, PolarGrid,
  PolarAngleAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import {
  ShieldCheck, ScrollText, GitCompareArrows, ClipboardCheck, FileStack,
  LayoutDashboard, TrendingUp, Radar as RadarIcon, Bell, Search, ChevronRight,
  AlertTriangle, CheckCircle2, Clock, XCircle, ExternalLink, Sparkles,
  Activity, Database, ArrowLeft, Home,
  Route, Zap, Wallet, GitBranch, CircleDot, ArrowRightLeft, FlaskConical,
} from "lucide-react";

import { T, FONT_IMPORT } from "./tokens.js";
import { getConnections } from "./store.js";
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

const regChanges = [
  { id: 1, title: "Amendment to ICT third-party risk RTS", reg: "DORA", jurisdiction: "EU", date: "Aug 3, 2026", relevance: 96, status: "new", summary: "Adds explicit sub-outsourcing notification timelines for critical ICT third-party providers; effective 90 days from publication." },
  { id: 2, title: "Guidance on AI system risk classification", reg: "EU AI Act", jurisdiction: "EU", date: "Aug 1, 2026", relevance: 88, status: "new", summary: "Clarifies which internal fraud-detection models fall under 'high-risk' classification, triggering conformity assessment duties." },
  { id: 3, title: "Cyber incident materiality disclosure FAQ", reg: "SEC", jurisdiction: "US", date: "Jul 29, 2026", relevance: 91, status: "reviewed", summary: "Staff guidance narrows the materiality window for Item 1.05 8-K disclosures following a confirmed breach." },
  { id: 4, title: "Update to consumer data deletion timelines", reg: "CCPA/CPRA", jurisdiction: "US-CA", date: "Jul 24, 2026", relevance: 64, status: "reviewed", summary: "Shortens the deletion-request fulfillment window from 45 to 30 calendar days for verified consumer requests." },
  { id: 5, title: "Revised capital buffer calculation methodology", reg: "Basel III", jurisdiction: "Global", date: "Jul 18, 2026", relevance: 42, status: "dismissed", summary: "Applies only to G-SIBs above threshold; assessed as not applicable to current entity structure." },
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

const riskAnalysisFindings = [
  { id: 1, entity: "Meridian Trading Partners LLC", riskScore: 82, trend: "up", drivers: "3 flagged wire transfers · beneficial owner in sanctioned-adjacent jurisdiction", relatedControls: ["AML-014", "KYC-007"] },
  { id: 2, entity: "Northbridge Capital Advisors", riskScore: 64, trend: "up", drivers: "Recent UBO change not yet re-verified · 2 overdue periodic reviews", relatedControls: ["KYC-007"] },
  { id: 3, entity: "Vendor: CloudLedger Data Services", riskScore: 58, trend: "flat", drivers: "Sub-processor added without notice · DPA amendment pending", relatedControls: ["TPRM-009"] },
  { id: 4, entity: "Consumer lending portfolio — Region 4", riskScore: 41, trend: "down", drivers: "Delinquency trending down after remediation; 1 control still in progress", relatedControls: ["CFG-018"] },
];

const relationshipGraphNodes = [
  { id: "org", label: "Your Entity", type: "org" },
  { id: "cust1", label: "Meridian Trading Partners", type: "counterparty" },
  { id: "cust2", label: "Northbridge Capital", type: "counterparty" },
  { id: "vendor1", label: "CloudLedger Data Services", type: "vendor" },
  { id: "reg1", label: "DORA (EU)", type: "regulation" },
  { id: "reg2", label: "AML/BSA (US)", type: "regulation" },
  { id: "ctrl1", label: "AML-014", type: "control" },
  { id: "ctrl2", label: "TPRM-009", type: "control" },
  { id: "jur1", label: "Jurisdiction: Cyprus", type: "jurisdiction" },
];
const relationshipGraphEdges = [
  { from: "org", to: "cust1", label: "counterparty" },
  { from: "org", to: "cust2", label: "counterparty" },
  { from: "org", to: "vendor1", label: "vendor" },
  { from: "cust1", to: "jur1", label: "beneficial owner in" },
  { from: "cust1", to: "ctrl1", label: "monitored by" },
  { from: "vendor1", to: "ctrl2", label: "governed by" },
  { from: "vendor1", to: "reg1", label: "in scope of" },
  { from: "ctrl1", to: "reg2", label: "satisfies" },
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
function Overview() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <KPI label="Composite Risk Pulse" value="76" tone="warn" sub="↑ 3 pts vs. last week" icon={Activity} />
        <KPI label="Controls Passing" value="87%" tone="good" sub="412 of 473 controls" icon={ClipboardCheck} />
        <KPI label="Open Findings" value="19" tone="warn" sub="6 due within 14 days" icon={AlertTriangle} />
        <KPI label="Critical Vulns" value="3" tone="bad" sub="1 exceeds SLA" icon={Bug} />
        <KPI label="Evidence Signed (Q3)" value="41" tone="good" sub="2 packages awaiting sign-off" icon={FileStack} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.4fr", gap: 16 }}>
        <Panel eyebrow="Unified Risk Pulse" title="Cross-domain posture">
          <ResponsiveContainer width="100%" height={230}>
            <RadarChart data={riskPulseData} outerRadius="75%">
              <PolarGrid stroke={T.border} />
              <PolarAngleAxis dataKey="subject" tick={{ fill: T.muted, fontSize: 10.5, fontFamily: "IBM Plex Mono" }} />
              <Radar dataKey="value" stroke={T.amber} fill={T.amber} fillOpacity={0.28} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel eyebrow="90-day trend" title="Compliance posture score">
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={T.amber} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={T.amber} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={T.border} vertical={false} />
              <XAxis dataKey="m" tick={{ fill: T.muted, fontSize: 11 }} axisLine={{ stroke: T.border }} tickLine={false} />
              <YAxis domain={[50, 100]} tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: T.panelAlt, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="score" stroke={T.amber} strokeWidth={2} fill="url(#scoreFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>
      </div>

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

/* ---------------------------------------------------------------------- */
/*  Tab: Regulatory Change Intelligence                                    */
/* ---------------------------------------------------------------------- */
function RegIntel() {
  const [open, setOpen] = useState(regChanges[0].id);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <KPI label="Sources monitored" value="34" sub="Gov gazettes, regulators, internal policy" />
        <KPI label="Changes this week" value="12" sub="5 above relevance threshold" tone="warn" />
        <KPI label="Pending review" value="2" sub="Routed to compliance owners" tone="warn" />
      </div>
      {regChanges.map((c) => (
        <Panel key={c.id} style={{ cursor: "pointer" }}>
          <div onClick={() => setOpen(open === c.id ? null : c.id)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <Pill tone="indigo">{c.reg}</Pill>
                <Pill>{c.jurisdiction}</Pill>
                <span style={{ fontSize: 13.5, color: T.text, fontWeight: 500 }}>{c.title}</span>
              </div>
              <ChevronRight size={16} color={T.mutedDim} style={{ transform: open === c.id ? "rotate(90deg)" : "none", transition: "transform .15s", flexShrink: 0 }} />
            </div>
            <div style={{ display: "flex", gap: 14, alignItems: "center", marginTop: 8, fontSize: 11.5, color: T.mutedDim, fontFamily: "IBM Plex Mono" }}>
              <span>{c.date}</span>
              <span>Relevance {c.relevance}</span>
              <Pill tone={statusTone[c.status]}>{c.status}</Pill>
            </div>
            {open === c.id && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${T.border}` }}>
                <AiTag />
                <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.6, marginTop: 8 }}>{c.summary}</p>
                <a style={{ fontSize: 12, color: T.cyan, display: "inline-flex", alignItems: "center", gap: 4, marginTop: 6 }}>
                  View source clause <ExternalLink size={11} />
                </a>
              </div>
            )}
          </div>
        </Panel>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  Tab: Impact Analysis                                                    */
/* ---------------------------------------------------------------------- */
function Impact() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <KPI label="Open gaps" value="8" tone="warn" />
        <KPI label="No control exists" value="2" tone="bad" />
        <KPI label="Avg. time to remediation plan" value="3.2d" tone="good" />
      </div>
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
function Evidence() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <KPI label="Packages this quarter" value="47" />
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

/* ---------------------------------------------------------------------- */
/*  Tab: Predictive Risk                                                   */
/* ---------------------------------------------------------------------- */
function Predictive() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Panel eyebrow="Model-scored, not vibes — feature importance available on request" title="Topic risk trend (90-day)">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={predictiveTrend}>
            <CartesianGrid stroke={T.border} vertical={false} />
            <XAxis dataKey="m" tick={{ fill: T.muted, fontSize: 11 }} axisLine={{ stroke: T.border }} tickLine={false} />
            <YAxis tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: T.panelAlt, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12 }} />
            <Line type="monotone" dataKey="aml" name="AML" stroke={T.red} strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="dora" name="ICT/DORA" stroke={T.amber} strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="ai" name="AI Governance" stroke={T.indigo} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Panel>
      <Panel eyebrow="Gradient-boosted risk model" title="Risk by topic" right={<SimTag />}>
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
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  Tab: AI-Powered Contextual Risk Analysis (Module 7)                    */
/* ---------------------------------------------------------------------- */
function RiskAnalysis({ connections = [] }) {
  const liveConnections = connections.filter((c) => c.status === "connected");
  const fileConn = liveConnections.find((c) => c.category === "file");
  const connectedFiles = fileConn?.resources || [];
  const statusColor = { up: T.red, down: T.green, flat: T.mutedDim };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <KPI label="Connected data sources" value={liveConnections.length} sub="Real — from your workspace connections" icon={Route} />
        <KPI label="Connected documents" value={connectedFiles.length} sub="Real — actual connected files" icon={FileStack} />
        <KPI label="High-risk entities" value={2} tone="bad" sub="Simulated example set" />
        <KPI label="Avg. contextual risk score" value="61" tone="warn" sub="Simulated example set" />
      </div>

      <Panel eyebrow="Real" title="Data sources feeding this analysis">
        {liveConnections.length === 0 ? (
          <div style={{ fontSize: 12.5, color: T.mutedDim }}>
            No live connections yet. Connect a cloud, database, or file source from the workspace to feed real data
            into this analysis — until then, the findings below are a simulated illustration of what this module does.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {liveConnections.map((c) => (
              <div key={c.id}>
                {(c.resources?.length ? c.resources.map((r) => r.name) : [c.name]).map((itemName, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, padding: "8px 10px", background: T.panelAlt, borderRadius: 8, marginBottom: 4 }}>
                    <span style={{ color: T.text }}>{itemName}</span>
                    <span style={{ color: T.mutedDim, fontFamily: "IBM Plex Mono" }}>{c.category}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </Panel>

      {connectedFiles.length > 0 && (
        <Panel eyebrow="Real — no simulation" title="Connected documents">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {connectedFiles.map((f, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 11px", background: T.panelAlt, borderRadius: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <FileStack size={13} color={T.coral} />
                  <span style={{ fontSize: 12.5, color: T.text }}>{f.name}</span>
                </div>
                <span style={{ fontSize: 11, color: T.mutedDim, fontFamily: "IBM Plex Mono" }}>{(f.size / 1024).toFixed(1)} KB · {f.type || "unknown type"}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 10.5, color: T.mutedDim, marginTop: 10, lineHeight: 1.5 }}>
            These are your actual connected files. Contextual risk scoring on document contents (entity extraction,
            clause analysis) isn't built yet — the findings below remain a simulated example until that's connected.
          </div>
        </Panel>
      )}

      <Panel eyebrow="Simulated example" title="Contextual risk findings" right={<SimTag />}>
        <p style={{ fontSize: 12, color: T.muted, marginBottom: 16, lineHeight: 1.6 }}>
          This is a worked example of what contextual risk analysis produces once connected to real counterparty,
          transaction, and vendor data: entities scored not on a single attribute, but on how their connections —
          jurisdiction, ownership changes, control status — combine into an overall risk picture.
        </p>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {riskAnalysisFindings.map((f) => (
            <div key={f.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${T.border}` }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: T.text, fontWeight: 500 }}>{f.entity}</div>
                <div style={{ fontSize: 11.5, color: T.mutedDim, marginTop: 2 }}>{f.drivers}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                  {f.relatedControls.map((c) => <Pill key={c} tone="neutral">{c}</Pill>)}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <ArrowRightLeft size={12} color={statusColor[f.trend]} style={{ transform: f.trend === "down" ? "scaleY(-1)" : "none" }} />
                <div style={{ width: 40, textAlign: "center", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18, color: f.riskScore > 70 ? T.red : f.riskScore > 45 ? T.amber : T.green }}>{f.riskScore}</div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  Tab: Enterprise Context & Relationship Graph (Module 8)                */
/* ---------------------------------------------------------------------- */
function RelationshipGraph({ connections = [] }) {
  const liveConnections = connections.filter((c) => c.status === "connected");
  const fileConn = liveConnections.find((c) => c.category === "file");
  const connectedFiles = (fileConn?.resources || []).slice(0, 6); // cap displayed nodes so the graph stays readable
  const typeColor = { org: T.coral, counterparty: T.amber, vendor: T.cyan, regulation: T.indigo, control: T.green, jurisdiction: T.red, document: T.coral };

  // Simple manual layout — original composition, not force-directed physics, kept
  // deterministic so the same example graph always renders the same way.
  const positions = {
    org: { x: 300, y: 170 }, cust1: { x: 100, y: 60 }, cust2: { x: 100, y: 280 },
    vendor1: { x: 500, y: 60 }, reg1: { x: 560, y: 170 }, reg2: { x: 480, y: 290 },
    ctrl1: { x: 260, y: 30 }, ctrl2: { x: 500, y: 300 }, jur1: { x: 60, y: 170 },
  };
  const fileNodes = connectedFiles.map((f, i) => ({ id: `file-${i}`, label: f.name, type: "document", real: true }));
  fileNodes.forEach((n, i) => { positions[n.id] = { x: 160 + i * 90, y: 330 }; });
  const fileEdges = fileNodes.map((n) => ({ from: "org", to: n.id, label: "document", real: true }));

  const allNodes = [...relationshipGraphNodes, ...fileNodes];
  const allEdges = [...relationshipGraphEdges, ...fileEdges];
  const viewHeight = fileNodes.length ? 380 : 340;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <KPI label="Connected data sources" value={liveConnections.length} sub="Real — from your workspace connections" icon={Route} />
        <KPI label="Connected documents in graph" value={fileNodes.length} sub="Real — actual connected files" icon={FileStack} />
        <KPI label="Simulated entities" value={relationshipGraphNodes.length} tone="warn" sub="Illustrative example set" />
      </div>

      <Panel eyebrow="Real" title="Data sources feeding this graph">
        {liveConnections.length === 0 ? (
          <div style={{ fontSize: 12.5, color: T.mutedDim }}>
            No live connections yet. The example graph below shows the kind of relationships this module maps once
            real counterparty, vendor, and regulatory data is connected.
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {liveConnections.map((c) =>
              (c.resources?.length ? c.resources.map((r) => r.name) : [c.name]).map((itemName, i) => (
                <Pill key={`${c.id}-${i}`} tone="info">{itemName}</Pill>
              ))
            )}
          </div>
        )}
      </Panel>

      <Panel eyebrow={fileNodes.length ? "Mixed — real documents, illustrative relationships" : "Simulated example"} title="Entity relationship map" right={<SimTag />}>
        <p style={{ fontSize: 12, color: T.muted, marginBottom: 16, lineHeight: 1.6 }}>
          A single graph connecting counterparties, vendors, jurisdictions, controls, and the regulations they fall
          under — the same underlying model every other module reads from, visualized directly.
          {fileNodes.length > 0
            ? " Your connected document(s) below are shown as real nodes (solid coral fill); the surrounding counterparty/vendor/regulation entities are still a worked example."
            : " This is a worked example; real nodes populate automatically as data connects."}
        </p>
        <svg viewBox={`0 0 620 ${viewHeight}`} width="100%" style={{ maxWidth: 620 }}>
          {allEdges.map((e, i) => {
            const a = positions[e.from], b = positions[e.to];
            if (!a || !b) return null;
            return (
              <g key={i}>
                <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={e.real ? T.coral : T.borderLight} strokeWidth={e.real ? "1.6" : "1.2"} strokeDasharray={e.real ? "none" : "none"} />
                <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 4} textAnchor="middle" fontSize="8.5" fill={T.mutedDim} fontFamily="IBM Plex Mono">{e.label}</text>
              </g>
            );
          })}
          {allNodes.map((n) => {
            const p = positions[n.id];
            if (!p) return null;
            const color = typeColor[n.type] || T.mutedDim;
            return (
              <g key={n.id}>
                <circle cx={p.x} cy={p.y} r={n.type === "org" ? 34 : 26} fill={n.real ? color : T.panel} stroke={color} strokeWidth="1.8" />
                <text x={p.x} y={p.y + 3} textAnchor="middle" fontSize="9" fontWeight="600" fontFamily="'Space Grotesk', sans-serif" fill={n.real ? "#FFFFFF" : T.text}>
                  {n.label.length > 16 ? n.label.slice(0, 14) + "…" : n.label}
                </text>
              </g>
            );
          })}
        </svg>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 14 }}>
          {Object.entries(typeColor).map(([type, color]) => (
            <div key={type} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10.5, color: T.muted }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: color }} /> {type}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
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
export default function EnterpriseDrishtiHub({ onBack, onHome, enabledModuleIds, activeProject, email, connections: connectionsProp }) {
  const connections = connectionsProp || (email ? getConnections(email) : []);
  const NAV = enabledModuleIds && enabledModuleIds.length
    ? MODULE_LIST.filter((m) => enabledModuleIds.includes(m.id))
    : MODULE_LIST;
  const [tab, setTab] = useState(NAV[0]?.id || "overview");
  const active = useMemo(() => NAV.find((n) => n.id === tab) || NAV[0], [tab, NAV]);

  const panels = {
    overview: <Overview />, regintel: <RegIntel />, impact: <Impact />,
    controls: <Controls />, evidence: <Evidence />, predictive: <Predictive />,
    riskanalysis: <RiskAnalysis connections={connections} />, relgraph: <RelationshipGraph connections={connections} />,
    gateway: <Gateway />,
  };

  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.text, fontFamily: "'Inter', sans-serif", display: "flex" }}>
      <style>{FONT_IMPORT}{`.spin { animation: edh-spin 0.9s linear infinite; } @keyframes edh-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* Sidebar */}
      <div style={{ width: 258, borderRight: `1px solid ${T.border}`, padding: "22px 14px", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 10px", marginBottom: 26 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: T.coral, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldCheck size={17} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14.5, lineHeight: 1.1 }}>Enterprise Drishti Hub</div>
            <div style={{ fontSize: 9.5, color: T.mutedDim, fontFamily: "IBM Plex Mono" }}>EDH · self-hosted</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map((n) => {
            const Icon = n.icon;
            const isActive = tab === n.id;
            return (
              <button
                key={n.id}
                onClick={() => setTab(n.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 9,
                  background: isActive ? T.panel : "transparent",
                  border: isActive ? `1px solid ${T.borderLight}` : "1px solid transparent",
                  color: isActive ? T.text : T.muted, textAlign: "left", cursor: "pointer", fontSize: 12.5, fontFamily: "'Inter', sans-serif",
                }}
              >
                <Icon size={15} color={isActive ? T.amber : T.mutedDim} />
                <div>
                  <div style={{ fontWeight: isActive ? 600 : 500 }}>{n.label}</div>
                  <div style={{ fontSize: 9.5, color: T.mutedDim, fontFamily: "IBM Plex Mono" }}>{n.module}</div>
                </div>
              </button>
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
              <span style={{ fontSize: 10.5, color: T.mutedDim, fontFamily: "IBM Plex Mono" }}>{active.module}</span>
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
