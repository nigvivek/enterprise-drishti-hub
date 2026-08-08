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
  ShieldAlert, Activity, Bug, Server, Cloud, Database, UploadCloud, FileCheck2,
  Plug, Link2, FileText, Loader2, ScanLine, ArrowLeft,
  Route, Zap, Wallet, GitBranch, CircleDot, ArrowRightLeft,
} from "lucide-react";

import { T, FONT_IMPORT } from "./tokens.js";

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

const alerts = [
  { id: 1, sev: "critical", title: "Unpatched critical CVE-2026-31442 on payment gateway host", asset: "pay-gw-03", age: "6d", control: "VULN-002" },
  { id: 2, sev: "high", title: "Anomalous privileged login — outside geo-fence", asset: "okta:jsmith", age: "22m", control: "IAM-002" },
  { id: 3, sev: "high", title: "TLS certificate expiring — customer API gateway", asset: "api-edge-01", age: "2h", control: "CFG-018" },
  { id: 4, sev: "medium", title: "EDR agent offline > 24h", asset: "wkstn-4471", age: "1d", control: "END-009" },
  { id: 5, sev: "medium", title: "New public S3 bucket detected", asset: "s3://reports-tmp", age: "41m", control: "CFG-018" },
];

const severityBreakdown = [
  { name: "Critical", value: 3, color: T.red },
  { name: "High", value: 11, color: T.amber },
  { name: "Medium", value: 27, color: T.cyan },
  { name: "Low", value: 44, color: T.mutedDim },
];

const vulnAging = [
  { bucket: "0-7d", count: 18 }, { bucket: "8-14d", count: 12 }, { bucket: "15-30d", count: 9 },
  { bucket: "31-60d", count: 5 }, { bucket: "60d+", count: 3 },
];

const mttTrend = [
  { m: "Feb", mttd: 42, mttr: 190 }, { m: "Mar", mttd: 38, mttr: 175 }, { m: "Apr", mttd: 35, mttr: 160 },
  { m: "May", mttd: 31, mttr: 148 }, { m: "Jun", mttd: 28, mttr: 130 }, { m: "Jul", mttd: 24, mttr: 121 }, { m: "Aug", mttd: 21, mttr: 108 },
];

const cloudProviders = [
  { id: "aws", name: "Amazon Web Services", short: "AWS", connected: true, method: "IAM role (cross-account, read-only)", accounts: 6, resources: 1842, findings: 14, lastScan: "9 min ago", color: "#E8A33D" },
  { id: "gcp", name: "Google Cloud Platform", short: "GCP", connected: true, method: "Workload Identity Federation", accounts: 3, resources: 967, findings: 6, lastScan: "22 min ago", color: "#4ADE80" },
  { id: "azure", name: "Microsoft Azure", short: "Azure", connected: true, method: "Service Principal + Reader role", accounts: 4, resources: 1310, findings: 11, lastScan: "14 min ago", color: "#22D3C5" },
  { id: "ibm", name: "IBM Cloud", short: "IBM Cloud", connected: false, method: "API key + IAM service ID", accounts: 0, resources: 0, findings: 0, lastScan: "never", color: "#7C8CF8" },
];

const cloudFindings = [
  { id: 1, provider: "AWS", svc: "S3", title: "Bucket policy allows public read", resource: "reports-tmp-prod", sev: "critical", control: "CFG-018" },
  { id: 2, provider: "Azure", svc: "Storage", title: "Blob container missing encryption scope", resource: "edh-blob-store-02", sev: "high", control: "CFG-018" },
  { id: 3, provider: "GCP", svc: "IAM", title: "Service account has Owner role (over-privileged)", resource: "svc-etl-pipeline@edh", sev: "high", control: "IAM-002" },
  { id: 4, provider: "AWS", svc: "EC2", title: "Security group open to 0.0.0.0/0 on port 22", resource: "sg-04a1c9", sev: "medium", control: "CFG-018" },
  { id: 5, provider: "Azure", svc: "Key Vault", title: "Soft-delete not enabled", resource: "edh-kv-prod", sev: "medium", control: "IAM-002" },
];

const connectedDatabases = [
  { id: "db-1", name: "prod-payments-pg", engine: "PostgreSQL (RDS)", provider: "AWS", encryption: "AES-256 at rest", access: "Private VPC only", classification: "PCI scope", status: "pass" },
  { id: "db-2", name: "customer-profiles-sql", engine: "Azure SQL Database", provider: "Azure", encryption: "TDE enabled", access: "Public endpoint + firewall rules", classification: "PII", status: "drift" },
  { id: "db-3", name: "analytics-bq", engine: "BigQuery", provider: "GCP", encryption: "Google-managed keys", access: "Org-level IAM", classification: "Internal", status: "pass" },
  { id: "db-4", name: "legacy-ledger-db2", engine: "Db2 on Cloud", provider: "IBM Cloud", encryption: "Unknown — not yet scanned", access: "Unknown", classification: "Unclassified", status: "attest" },
  { id: "db-5", name: "sessions-cache-redis", engine: "ElastiCache Redis", provider: "AWS", encryption: "In-transit TLS only", access: "Private VPC only", classification: "Internal", status: "pass" },
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
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10.5, color: T.indigo, background: "#161B33", border: `1px solid #2B3568`, padding: "2px 7px", borderRadius: 6, fontFamily: "'IBM Plex Mono', monospace" }}>
      <Sparkles size={10} /> AI-drafted · cited
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
        <Panel eyebrow="Coverage by framework" title="Control status across regulatory frameworks">
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

        <Panel eyebrow="Countdown" title="Upcoming regulatory deadlines">
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
      <Panel eyebrow="AI-proposed, human-approved" title="Compliance impact findings">
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
      <Panel eyebrow="Continuous validation" title="Control checks — live status">
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
      <Panel eyebrow="WORM-stored · hash-chained" title="Audit evidence packages">
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
      <Panel eyebrow="Gradient-boosted risk model" title="Risk by topic">
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
/*  Tab: Cybersecurity Monitoring                                          */
/* ---------------------------------------------------------------------- */
function Cyber() {
  const sevColor = { critical: T.red, high: T.amber, medium: T.cyan, low: T.mutedDim };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <KPI label="Open alerts" value="85" icon={ShieldAlert} />
        <KPI label="MTTD" value="21m" tone="good" sub="↓ from 42m" icon={Activity} />
        <KPI label="MTTR" value="1.8d" tone="good" sub="↓ from 190m avg" icon={Server} />
        <KPI label="Compliance-linked incidents" value="4" tone="warn" sub="Mapped to control obligations" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16 }}>
        <Panel eyebrow="Live" title="Alert stream — correlated to controls">
          <div style={{ display: "flex", flexDirection: "column" }}>
            {alerts.map((a) => (
              <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: `1px solid ${T.border}` }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ width: 7, height: 7, borderRadius: 999, background: sevColor[a.sev] }} />
                  <div>
                    <div style={{ fontSize: 12.5, color: T.text }}>{a.title}</div>
                    <div style={{ fontSize: 11, color: T.mutedDim, fontFamily: "IBM Plex Mono" }}>{a.asset} · linked to {a.control}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: T.mutedDim }}>{a.age}</span>
                  <Pill tone={a.sev === "critical" ? "bad" : a.sev === "high" ? "warn" : "neutral"}>{a.sev}</Pill>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel eyebrow="By severity" title="Open alert mix">
          <ResponsiveContainer width="100%" height={190}>
            <PieChart>
              <Pie data={severityBreakdown} dataKey="value" nameKey="name" innerRadius={48} outerRadius={75} paddingAngle={2}>
                {severityBreakdown.map((s, i) => <Cell key={i} fill={s.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: T.panelAlt, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginTop: 6 }}>
            {severityBreakdown.map((s) => (
              <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: T.muted }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: s.color }} />{s.name}
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Panel eyebrow="Aging" title="Unpatched vulnerability age">
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={vulnAging}>
              <CartesianGrid stroke={T.border} vertical={false} />
              <XAxis dataKey="bucket" tick={{ fill: T.muted, fontSize: 11 }} axisLine={{ stroke: T.border }} tickLine={false} />
              <YAxis tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: T.panelAlt, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" fill={T.cyan} radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
        <Panel eyebrow="Detection & response" title="MTTD / MTTR trend">
          <ResponsiveContainer width="100%" height={190}>
            <LineChart data={mttTrend}>
              <CartesianGrid stroke={T.border} vertical={false} />
              <XAxis dataKey="m" tick={{ fill: T.muted, fontSize: 11 }} axisLine={{ stroke: T.border }} tickLine={false} />
              <YAxis tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: T.panelAlt, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="mttd" name="MTTD (min)" stroke={T.cyan} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="mttr" name="MTTR (min)" stroke={T.indigo} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  Tab: Cloud Ecosystem Connect (Module 8)                                */
/* ---------------------------------------------------------------------- */
function CloudEcosystem() {
  const [providers, setProviders] = useState(cloudProviders);
  const [connecting, setConnecting] = useState(null);

  const toggle = (id) => {
    const p = providers.find((x) => x.id === id);
    if (p.connected) {
      setProviders(providers.map((x) => (x.id === id ? { ...x, connected: false, accounts: 0, resources: 0, findings: 0, lastScan: "never" } : x)));
      return;
    }
    setConnecting(id);
    setTimeout(() => {
      setProviders((prev) => prev.map((x) => (x.id === id ? { ...x, connected: true, accounts: x.accounts || 2, resources: x.resources || 400, findings: x.findings || 5, lastScan: "just now" } : x)));
      setConnecting(null);
    }, 1400);
  };

  const totalResources = providers.filter(p => p.connected).reduce((s, p) => s + p.resources, 0);
  const totalFindings = providers.filter(p => p.connected).reduce((s, p) => s + p.findings, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <KPI label="Clouds connected" value={`${providers.filter(p => p.connected).length}/${providers.length}`} icon={Cloud} />
        <KPI label="Resources monitored" value={totalResources.toLocaleString()} icon={Server} />
        <KPI label="Open cloud findings" value={totalFindings} tone="warn" icon={AlertTriangle} />
        <KPI label="Databases discovered" value={connectedDatabases.length} icon={Database} />
      </div>

      <Panel eyebrow="API gateway integration · read-only, least-privilege" title="Connect your cloud ecosystem">
        <p style={{ fontSize: 12, color: T.muted, marginBottom: 16, lineHeight: 1.6 }}>
          EDH connects to each provider through its native API gateway using short-lived, read-only credentials
          (cross-account IAM roles, workload identity federation, or service principals — never long-lived static keys
          where the provider supports better). No workload data is copied out; EDH pulls configuration and posture
          metadata only, and every check runs from inside your own network boundary.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 14 }}>
          {providers.map((p) => (
            <div key={p.id} style={{ border: `1px solid ${T.border}`, borderRadius: 12, padding: 16, background: T.panelAlt }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: `${p.color}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Cloud size={15} color={p.color} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{p.short}</div>
                    <div style={{ fontSize: 10.5, color: T.mutedDim }}>{p.name}</div>
                  </div>
                </div>
                <Pill tone={p.connected ? "good" : "neutral"}>{p.connected ? "connected" : "not connected"}</Pill>
              </div>
              <div style={{ fontSize: 11, color: T.mutedDim, marginTop: 10, fontFamily: "IBM Plex Mono" }}>{p.method}</div>
              {p.connected && (
                <div style={{ display: "flex", gap: 14, marginTop: 10, fontSize: 11.5, color: T.muted }}>
                  <span>{p.accounts} accounts</span>
                  <span>{p.resources.toLocaleString()} resources</span>
                  <span style={{ color: p.findings > 10 ? T.amber : T.muted }}>{p.findings} findings</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                <span style={{ fontSize: 10.5, color: T.mutedDim, fontFamily: "IBM Plex Mono" }}>last scan: {p.lastScan}</span>
                <button
                  onClick={() => toggle(p.id)}
                  disabled={connecting === p.id}
                  style={{
                    display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 600, padding: "6px 12px", borderRadius: 8,
                    cursor: "pointer", border: `1px solid ${p.connected ? T.border : T.borderLight}`,
                    background: p.connected ? "transparent" : T.cyanDim, color: p.connected ? T.mutedDim : T.cyan,
                  }}
                >
                  {connecting === p.id ? <Loader2 size={12} className="spin" /> : <Plug size={12} />}
                  {connecting === p.id ? "Connecting…" : p.connected ? "Disconnect" : "Connect"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel eyebrow="Aggregated across connected clouds" title="Cross-cloud security findings → mapped to controls">
        <div style={{ display: "flex", flexDirection: "column" }}>
          {cloudFindings.map((f) => (
            <div key={f.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: `1px solid ${T.border}` }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <Pill tone="indigo">{f.provider}</Pill>
                <div>
                  <div style={{ fontSize: 12.5, color: T.text }}>{f.title}</div>
                  <div style={{ fontSize: 11, color: T.mutedDim, fontFamily: "IBM Plex Mono" }}>{f.svc} · {f.resource} · linked to {f.control}</div>
                </div>
              </div>
              <Pill tone={f.sev === "critical" ? "bad" : f.sev === "high" ? "warn" : "neutral"}>{f.sev}</Pill>
            </div>
          ))}
        </div>
      </Panel>

      <Panel eyebrow="Discovered via cloud connectors · read-only" title="Databases inside the connected ecosystem">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
            <thead>
              <tr style={{ textAlign: "left", color: T.mutedDim, fontFamily: "IBM Plex Mono", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <th style={{ padding: "0 10px 10px 0" }}>Database</th>
                <th style={{ padding: "0 10px 10px" }}>Engine</th>
                <th style={{ padding: "0 10px 10px" }}>Provider</th>
                <th style={{ padding: "0 10px 10px" }}>Encryption</th>
                <th style={{ padding: "0 10px 10px" }}>Access</th>
                <th style={{ padding: "0 10px 10px" }}>Data class</th>
                <th style={{ padding: "0 0 10px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {connectedDatabases.map((d) => (
                <tr key={d.id} style={{ borderTop: `1px solid ${T.border}` }}>
                  <td style={{ padding: "10px 10px 10px 0", color: T.text, display: "flex", alignItems: "center", gap: 7 }}><Database size={12} color={T.mutedDim} />{d.name}</td>
                  <td style={{ padding: "10px", color: T.muted }}>{d.engine}</td>
                  <td style={{ padding: "10px", color: T.muted }}>{d.provider}</td>
                  <td style={{ padding: "10px", color: T.muted }}>{d.encryption}</td>
                  <td style={{ padding: "10px", color: T.muted }}>{d.access}</td>
                  <td style={{ padding: "10px" }}><Pill tone={d.classification === "PII" || d.classification === "PCI scope" ? "warn" : "neutral"}>{d.classification}</Pill></td>
                  <td style={{ padding: "10px" }}><Pill tone={statusTone[d.status]}>{d.status}</Pill></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ fontSize: 11, color: T.mutedDim, marginTop: 12 }}>
          EDH connects to each database read-only, through the cloud provider's own network boundary (VPC peering / private
          endpoint) — no direct internet-facing credentials are stored, and no row-level data is extracted for this inventory
          view. Row-level scanning for sensitive data happens only when you explicitly run a classification scan.
        </div>
      </Panel>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  Tab: File Governance & Scan (Module 9)                                 */
/* ---------------------------------------------------------------------- */
function scanTextForFindings(text) {
  const findings = [];
  const patterns = [
    { type: "Email address", re: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, obligation: "GDPR Art. 5 & 32 · CCPA §1798.100" },
    { type: "Possible SSN", re: /\b\d{3}-\d{2}-\d{4}\b/g, obligation: "GDPR Art. 9 (special category) · CCPA" },
    { type: "Possible credit card number", re: /\b(?:\d[ -]*?){13,16}\b/g, obligation: "PCI DSS Req. 3" },
    { type: "Possible phone number", re: /\b\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4}\b/g, obligation: "GDPR Art. 5" },
    { type: "API key / secret-like token", re: /\b(?:sk|pk|key|secret|token)[-_A-Za-z0-9]{10,}\b/gi, obligation: "Internal — secrets in a document is itself a control failure" },
    { type: "IP address", re: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, obligation: "Internal network exposure — review before external sharing" },
  ];
  patterns.forEach((p) => {
    const matches = text.match(p.re);
    if (matches && matches.length) findings.push({ type: p.type, count: matches.length, obligation: p.obligation, sample: matches[0] });
  });
  return findings;
}

function FileGovernance() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | reading | scanning | done
  const [result, setResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setResult(null);
    setStatus("reading");
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      setStatus("scanning");
      setTimeout(() => {
        const findings = scanTextForFindings(text);
        const riskScore = Math.min(96, findings.reduce((s, x) => s + x.count * 6, 8));
        setResult({
          findings,
          riskScore,
          controlsMapped: findings.length ? Math.min(findings.length + 1, 5) : 1,
          words: text ? text.trim().split(/\s+/).length : 0,
        });
        setStatus("done");
      }, 900);
    };
    reader.onerror = () => setStatus("done");
    const readableTypes = ["text/", "application/json", "application/csv"];
    if (readableTypes.some((t) => f.type.startsWith(t)) || f.name.match(/\.(txt|csv|json|md|log|yaml|yml)$/i)) {
      reader.readAsText(f);
    } else {
      // Non-text formats (pdf/docx/xlsx): metadata-level mock scan since parsing needs a backend
      setTimeout(() => {
        setStatus("scanning");
        setTimeout(() => {
          setResult({
            findings: [{ type: "Document requires backend parsing", count: 1, obligation: "Connect the docx/pdf parsing service (see architecture.md §3.4)", sample: f.name }],
            riskScore: 35,
            controlsMapped: 1,
            words: null,
            unsupported: true,
          });
          setStatus("done");
        }, 900);
      }, 300);
    }
  };

  const reset = () => { setFile(null); setResult(null); setStatus("idle"); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <KPI label="Files scanned this month" value="128" icon={FileCheck2} />
        <KPI label="Avg. sensitive findings / file" value="3.4" tone="warn" icon={ScanLine} />
        <KPI label="Currently connected sources" value="Local upload" icon={UploadCloud} />
      </div>

      <Panel eyebrow="Drag & drop, or connect a source" title="Upload a file to run governance & compliance analysis">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]); }}
          style={{
            border: `1.5px dashed ${dragOver ? T.cyan : T.borderLight}`, borderRadius: 12, padding: "34px 20px",
            textAlign: "center", background: dragOver ? T.cyanDim : T.panelAlt, transition: "all .15s",
          }}
        >
          <UploadCloud size={26} color={dragOver ? T.cyan : T.mutedDim} style={{ marginBottom: 10 }} />
          <div style={{ fontSize: 13, color: T.text, fontWeight: 500 }}>Drop a file here, or</div>
          <label style={{ display: "inline-block", marginTop: 10, cursor: "pointer" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: T.cyan, border: `1px solid ${T.cyan}55`, padding: "7px 14px", borderRadius: 8, background: T.cyanDim }}>
              Browse files
            </span>
            <input type="file" style={{ display: "none" }} onChange={(e) => handleFile(e.target.files?.[0])} />
          </label>
          <div style={{ fontSize: 11, color: T.mutedDim, marginTop: 12 }}>
            .txt · .csv · .json · .log · .yaml scan fully in-browser for this prototype. .pdf / .docx / .xlsx route to the
            backend parsing service once connected (see architecture.md).
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 16, flexWrap: "wrap" }}>
            <Pill tone="neutral"><Link2 size={10} style={{ marginRight: 4, verticalAlign: -1 }} />Connect SharePoint</Pill>
            <Pill tone="neutral"><Link2 size={10} style={{ marginRight: 4, verticalAlign: -1 }} />Connect Google Drive</Pill>
            <Pill tone="neutral"><Link2 size={10} style={{ marginRight: 4, verticalAlign: -1 }} />Connect S3 bucket</Pill>
          </div>
        </div>

        {file && (
          <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: T.panelAlt, border: `1px solid ${T.border}`, borderRadius: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <FileText size={16} color={T.mutedDim} />
              <div>
                <div style={{ fontSize: 12.5, color: T.text }}>{file.name}</div>
                <div style={{ fontSize: 11, color: T.mutedDim, fontFamily: "IBM Plex Mono" }}>{(file.size / 1024).toFixed(1)} KB · {file.type || "unknown type"}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {status !== "idle" && status !== "done" && (
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: T.cyan }}>
                  <Loader2 size={13} className="spin" /> {status === "reading" ? "Reading file…" : "Running compliance scan…"}
                </span>
              )}
              {status === "done" && <Pill tone="good">scan complete</Pill>}
              <button onClick={reset} style={{ fontSize: 11.5, color: T.mutedDim, background: "none", border: `1px solid ${T.border}`, borderRadius: 7, padding: "5px 10px", cursor: "pointer" }}>Clear</button>
            </div>
          </div>
        )}
      </Panel>

      {result && (
        <>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <KPI label="Risk score" value={result.riskScore} tone={result.riskScore > 60 ? "bad" : result.riskScore > 30 ? "warn" : "good"} icon={ShieldAlert} />
            <KPI label="Sensitive data findings" value={result.findings.reduce((s, f) => s + f.count, 0)} tone={result.findings.length ? "warn" : "good"} icon={ScanLine} />
            <KPI label="Obligations mapped" value={result.controlsMapped} icon={GitCompareArrows} />
            {result.words != null && <KPI label="Words scanned" value={result.words.toLocaleString()} icon={FileText} />}
          </div>

          <Panel eyebrow="AI-assisted classification, in-browser pattern scan" title={`Governance & compliance findings — ${file.name}`}>
            <AiTag />
            {result.findings.length === 0 ? (
              <div style={{ marginTop: 14, fontSize: 13, color: T.green, display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircle2 size={16} /> No obvious sensitive-data patterns detected in this file.
              </div>
            ) : (
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column" }}>
                {result.findings.map((f, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: `1px solid ${T.border}` }}>
                    <div>
                      <div style={{ fontSize: 12.5, color: T.text, fontWeight: 500 }}>{f.type}{f.count > 1 ? ` × ${f.count}` : ""}</div>
                      <div style={{ fontSize: 11, color: T.mutedDim, marginTop: 2 }}>Maps to: {f.obligation}</div>
                    </div>
                    <Pill tone="warn">{f.count} match{f.count > 1 ? "es" : ""}</Pill>
                  </div>
                ))}
              </div>
            )}
            <div style={{ marginTop: 14, fontSize: 11, color: T.mutedDim, lineHeight: 1.6 }}>
              This is a pattern-level scan running client-side for the prototype. Production classification (module 3.2 /
              3.4 in architecture.md) uses the self-hosted embedding + classification model for higher-recall PII/PHI/PCI
              detection, and writes results to the evidence store with the same human sign-off gate as every other AI
              output in EDH.
            </div>
          </Panel>
        </>
      )}
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

      <Panel eyebrow="Routing & failover" title="Provider pool — cost, latency & availability">
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

      <Panel eyebrow="Live" title="Recent failover & circuit-breaker events">
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

      <Panel eyebrow="Auditing" title="Token & cost attribution by module">
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
export default function EnterpriseDrishtiHub({ onBack, enabledModuleIds }) {
  const NAV = enabledModuleIds && enabledModuleIds.length
    ? MODULE_LIST.filter((m) => enabledModuleIds.includes(m.id))
    : MODULE_LIST;
  const [tab, setTab] = useState(NAV[0]?.id || "overview");
  const active = useMemo(() => NAV.find((n) => n.id === tab) || NAV[0], [tab, NAV]);

  const panels = {
    overview: <Overview />, regintel: <RegIntel />, impact: <Impact />,
    controls: <Controls />, evidence: <Evidence />, predictive: <Predictive />, cyber: <Cyber />,
    cloud: <CloudEcosystem />, filegov: <FileGovernance />, gateway: <Gateway />,
  };

  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.text, fontFamily: "'Inter', sans-serif", display: "flex" }}>
      <style>{FONT_IMPORT}{`.spin { animation: edh-spin 0.9s linear infinite; } @keyframes edh-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* Sidebar */}
      <div style={{ width: 258, borderRight: `1px solid ${T.border}`, padding: "22px 14px", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 10px", marginBottom: 26 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg, ${T.amber}, ${T.cyan})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldCheck size={17} color="#0A0E17" />
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

        {onBack && (
          <button
            onClick={onBack}
            style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 8, fontSize: 11.5, color: T.muted, background: "transparent", border: "none", cursor: "pointer", padding: "8px 10px", textAlign: "left" }}
          >
            <ArrowLeft size={13} /> Back to workspace
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
        <div style={{ borderBottom: `1px solid ${T.border}`, padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 10.5, color: T.mutedDim, fontFamily: "IBM Plex Mono" }}>{active.module}</div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 19 }}>{active.label}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, background: T.panel, border: `1px solid ${T.border}`, borderRadius: 9, padding: "7px 11px" }}>
              <Search size={13} color={T.mutedDim} />
              <span style={{ fontSize: 12, color: T.mutedDim }}>Search controls, regulations, evidence…</span>
            </div>
            <Bell size={16} color={T.mutedDim} />
            <div style={{ width: 30, height: 30, borderRadius: 999, background: T.indigo, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11.5, fontWeight: 700, color: "#0A0E17" }}>JL</div>
          </div>
        </div>
        <div style={{ padding: "22px 28px 40px" }}>{panels[tab]}</div>
      </div>
    </div>
  );
}
