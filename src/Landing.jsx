import React, { useState, useEffect } from "react";
import {
  ShieldCheck, ScrollText, GitCompareArrows, ClipboardCheck, FileStack,
  LayoutDashboard, Radar as RadarIcon, BrainCircuit, Network,
  ArrowRight, Quote, Lock, Server, Globe, Check, X, Activity, MessageSquarePlus, Route, Loader2, Database,
} from "lucide-react";
import { T, FONT_IMPORT } from "./tokens.js";
import DataLayerDiagram from "./DataLayerDiagram.jsx";

const MODULES = [
  { id: "overview", tier: "Module", icon: LayoutDashboard, label: "Risk Analysis Dashboard", desc: "One posture score, drillable by framework, business unit, and jurisdiction — with a real, live graphical view of your connected enterprise data." },
  { id: "impact", tier: "Module", icon: GitCompareArrows, label: "Compliance Impact Analysis", desc: "AI-proposed, human-approved mapping from regulatory change to the control it actually affects — now with region-based data guideline validation against your connected sources." },
  { id: "predictive", tier: "Module", icon: RadarIcon, label: "Predictive Regulatory Risk & Audit Evidence", desc: "Load historical data for real statistical anomaly detection and a transparent trend projection, alongside hash-chained audit evidence generation — merged into one module." },
  { id: "controls", tier: "Module", icon: ClipboardCheck, label: "Continuous Control Validation", desc: "Controls tested against live system state, not a once-a-year attestation." },
  { id: "gateway", tier: "Platform", icon: Route, label: "AI Gateway & Cost Governance", desc: "Technical infrastructure for AI routing, failover, and cost tracking — kept separate from the functional business modules." },
];

const TESTIMONIALS = [
  { quote: "Placeholder quote — swap in a real customer testimonial before this goes live. Keep it specific: what changed, in numbers, for their team.", name: "Name, Title", org: "Company / Industry" },
  { quote: "Placeholder quote — e.g., a compliance lead describing time saved on evidence collection for a specific audit cycle.", name: "Name, Title", org: "Company / Industry" },
  { quote: "Placeholder quote — e.g., a CISO describing how cloud + cyber findings finally landed in one place instead of three dashboards.", name: "Name, Title", org: "Company / Industry" },
];

const SECURITY_FEATURES = [
  { icon: Lock, title: "Self-hosted AI, by default", body: "Every model runs on infrastructure you control. No regulatory text, control data, or credentials are a required input to any third-party API." },
  { icon: Database, title: "Credentials never persisted", body: "Every connector — cloud, database, or file — is used once per request and never written to storage. You control exactly what EDH can see." },
  { icon: FileStack, title: "Hash-chained evidence", body: "Audit evidence is content-hashed at capture and again at export, so tampering after the fact is detectable, not just discouraged." },
  { icon: Activity, title: "Full AI output audit trail", body: "Every AI-generated finding is tagged with model version and source citations, retained indefinitely for model-risk review." },
];

function NavLink({ href, children }) {
  return <a href={href} style={{ fontSize: 13.5, color: T.muted, textDecoration: "none" }}>{children}</a>;
}

function SectionEyebrow({ children }) {
  return (
    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: "0.14em", color: T.amber, textTransform: "uppercase", marginBottom: 10 }}>
      {children}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  Book a Demo — real on-page submission via the Worker + KV backend,     */
/*  not a mailto: popup. Falls back to a clear "not configured" message    */
/*  if the backend isn't set up yet, rather than pretending to succeed.    */
/* ---------------------------------------------------------------------- */
function BookDemoForm() {
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const resp = await fetch("/api/demo-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await resp.json();
      if (!result.ok) {
        setError(result.error || "Couldn't submit — try again in a moment.");
        setStatus("error");
        return;
      }
      setStatus("done");
    } catch (err) {
      setError("Network error — try again.");
      setStatus("error");
    }
  };

  if (status === "done") {
    return (
      <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 14, padding: 32, textAlign: "center" }}>
        <Check size={26} color={T.green} style={{ marginBottom: 10 }} />
        <div style={{ fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 6 }}>Request received.</div>
        <div style={{ fontSize: 13, color: T.muted }}>We'll follow up at {form.email} to schedule your walkthrough.</div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 14, padding: 26, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={{ fontSize: 12, color: T.mutedDim, display: "block", marginBottom: 5 }}>Name *</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: 12, color: T.mutedDim, display: "block", marginBottom: 5 }}>Work email *</label>
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} />
        </div>
      </div>
      <div>
        <label style={{ fontSize: 12, color: T.mutedDim, display: "block", marginBottom: 5 }}>Company</label>
        <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} style={inputStyle} />
      </div>
      <div>
        <label style={{ fontSize: 12, color: T.mutedDim, display: "block", marginBottom: 5 }}>What would you like to see in the demo?</label>
        <textarea rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} style={{ ...inputStyle, resize: "vertical" }} />
      </div>
      {error && <div style={{ fontSize: 12, color: T.red, background: T.redDim, borderRadius: 8, padding: "8px 11px" }}>{error}</div>}
      <button
        type="submit"
        disabled={status === "loading"}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 14, fontWeight: 600, color: "#FFFFFF", background: T.coral, border: "none", borderRadius: 9, padding: "12px 18px", cursor: "pointer" }}
      >
        {status === "loading" && <Loader2 size={15} className="edh-spin" />}
        {status === "loading" ? "Submitting…" : "Book demo"}
      </button>
      <div style={{ fontSize: 10.5, color: T.mutedDim, textAlign: "center" }}>Posted directly to our team — no email client opens.</div>
    </form>
  );
}

/* ---------------------------------------------------------------------- */
/*  Testimonials — real on-page submit/list via the Worker + KV backend,   */
/*  not a mailto: popup. Falls back to placeholder quotes if the backend   */
/*  isn't configured yet (fresh deploys, before a KV namespace is set up). */
/* ---------------------------------------------------------------------- */
function TestimonialsSection() {
  const [submitted, setSubmitted] = useState([]);
  const [backendReady, setBackendReady] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", title: "", org: "", quote: "" });
  const [status, setStatus] = useState("idle"); // idle | loading | error | done
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/testimonials")
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setSubmitted(data.testimonials || []);
          setBackendReady(true);
        }
      })
      .catch(() => {}); // stay on placeholders if the backend isn't reachable/configured
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const resp = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await resp.json();
      if (!data.ok) {
        setError(data.error || "Couldn't submit — try again in a moment.");
        setStatus("error");
        return;
      }
      setSubmitted((prev) => [data.testimonial, ...prev]);
      setForm({ name: "", title: "", org: "", quote: "" });
      setStatus("done");
      setTimeout(() => { setShowForm(false); setStatus("idle"); }, 1800);
    } catch (err) {
      setError("Network error — try again.");
      setStatus("error");
    }
  };

  const display = backendReady && submitted.length ? submitted : backendReady ? [] : TESTIMONIALS;

  return (
    <div id="feedback" style={{ borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, scrollMarginTop: 70 }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "80px 24px" }}>
        <SectionEyebrow>What End Users Feel</SectionEyebrow>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap", gap: 14 }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 30, margin: 0 }}>What teams say once it's running.</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 600, color: T.cyan, background: T.cyanDim, border: `1px solid ${T.cyan}55`, borderRadius: 999, padding: "8px 14px", cursor: "pointer" }}
          >
            <MessageSquarePlus size={14} /> {showForm ? "Close" : "Share your testimonial"}
          </button>
        </div>

        {!backendReady && (
          <div style={{ fontSize: 11.5, color: T.mutedDim, fontFamily: "IBM Plex Mono", border: `1px solid ${T.border}`, borderRadius: 999, padding: "5px 11px", display: "inline-block", marginBottom: 20 }}>
            placeholder content below — connect testimonial storage (see TESTIMONIALS_SETUP.md) to collect real ones
          </div>
        )}

        {showForm && (
          <form onSubmit={submit} style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 14, padding: 22, marginBottom: 28, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, color: T.mutedDim, display: "block", marginBottom: 4 }}>Name *</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: T.mutedDim, display: "block", marginBottom: 4 }}>Title</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: T.mutedDim, display: "block", marginBottom: 4 }}>Company</label>
                <input value={form.org} onChange={(e) => setForm({ ...form, org: e.target.value })} style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11, color: T.mutedDim, display: "block", marginBottom: 4 }}>Your testimonial * (20–500 characters)</label>
              <textarea required rows={3} maxLength={500} value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} style={{ ...inputStyle, resize: "vertical" }} />
            </div>
            {error && <div style={{ fontSize: 12, color: T.red, background: T.redDim, borderRadius: 7, padding: "8px 10px" }}>{error}</div>}
            <button
              type="submit"
              disabled={status === "loading"}
              style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 600, color: "#FFFFFF", background: T.coral, border: "none", borderRadius: 9, padding: "9px 16px", cursor: "pointer" }}
            >
              {status === "loading" && <Loader2 size={14} className="edh-spin" />}
              {status === "done" ? "Submitted — thank you!" : status === "loading" ? "Submitting…" : "Submit testimonial"}
            </button>
            <div style={{ fontSize: 10.5, color: T.mutedDim }}>Posted directly to this page — no email client opens, nothing to send yourself.</div>
          </form>
        )}

        {display.length === 0 ? (
          <div style={{ fontSize: 13, color: T.mutedDim, padding: "24px 0" }}>Be the first to share how EDH is working for your team.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            {display.map((t, i) => (
              <div key={i} style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 14, padding: 22, display: "flex", flexDirection: "column" }}>
                <Quote size={18} color={T.amberDim} style={{ marginBottom: 12 }} />
                <p style={{ fontSize: 13.5, color: T.muted, lineHeight: 1.65, flex: 1 }}>{t.quote}</p>
                <div style={{ marginTop: 18, paddingTop: 14, borderTop: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{t.name}{t.title ? `, ${t.title}` : ""}</div>
                  <div style={{ fontSize: 11.5, color: T.mutedDim }}>{t.org || t.org === "" ? t.org : ""}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = { width: "100%", boxSizing: "border-box", background: T.panelAlt, border: `1px solid ${T.border}`, borderRadius: 7, padding: "8px 10px", color: T.text, fontSize: 12.5, fontFamily: "'Inter', sans-serif" };

export default function LandingPage({ onLaunch, onGoGateway, onSelectModule }) {
  const coreModuleCount = MODULES.filter((m) => m.tier === "Module").length;

  return (
    <div style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif", minHeight: "100vh" }}>
      <style>{FONT_IMPORT}{`html { scroll-behavior: smooth; } .edh-spin { animation: edh-spin 0.9s linear infinite; } @keyframes edh-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* ---- Nav ---- */}
      <div style={{ borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0, background: `${T.bg}F2`, backdropFilter: "blur(8px)", zIndex: 20 }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="#top" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none", color: "inherit" }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: T.coral, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShieldCheck size={17} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15, lineHeight: 1.1 }}>Enterprise Drishti Hub</div>
              <div style={{ fontSize: 9.5, color: T.mutedDim, fontFamily: "IBM Plex Mono" }}>EDH · self-hosted</div>
            </div>
          </a>

          <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
            <NavLink href="#platform-principles">Platform</NavLink>
            <NavLink href="#modules">Modules</NavLink>
            <NavLink href="#pricing">Book a Demo</NavLink>
            <NavLink href="#security">Security</NavLink>
            <NavLink href="#about">About</NavLink>
            <NavLink href="#feedback">Feedback</NavLink>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={onGoGateway}
              title="AI Gateway & Cost Governance"
              style={{
                display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: T.text,
                background: "transparent", border: `1px solid ${T.borderLight}`, borderRadius: 8, padding: "9px 13px", cursor: "pointer",
              }}
            >
              <Route size={14} color={T.indigo} /> AI Gateway
            </button>
            <button
              onClick={onLaunch}
              style={{
                display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 600, color: "#FFFFFF",
                background: T.coral, border: "none", borderRadius: 8, padding: "9px 16px", cursor: "pointer",
              }}
            >
              Launch Dashboard <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ---- Hero ---- */}
      <div id="top" style={{ maxWidth: 1180, margin: "0 auto", padding: "88px 24px 64px", display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 48, alignItems: "center", scrollMarginTop: 70 }}>
        <div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 11.5, color: T.cyan, background: T.cyanDim, border: `1px solid #1D5A56`, padding: "5px 11px", borderRadius: 999, fontFamily: "IBM Plex Mono" }}>
              <Lock size={11} /> 100% self-hosted — no data leaves your network
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 11.5, color: T.amber, background: T.amberDim, border: `1px solid #6B5218`, padding: "5px 11px", borderRadius: 999, fontFamily: "IBM Plex Mono" }}>
              Built for banking &amp; capital markets
            </div>
          </div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "clamp(34px, 4.2vw, 52px)", lineHeight: 1.08, margin: 0, letterSpacing: "-0.01em" }}>
            One line of sight across <span style={{ color: T.amber }}>regulatory</span>, <span style={{ color: T.cyan }}>control</span>, and <span style={{ color: T.indigo }}>cyber</span> risk.
          </h1>
          <p style={{ fontSize: 16, color: T.muted, lineHeight: 1.65, marginTop: 22, maxWidth: 540 }}>
            "Drishti" — vision. Enterprise Drishti Hub unifies regulatory intelligence, continuous control validation,
            audit evidence, and cybersecurity monitoring into a single, self-hosted platform — so your compliance
            posture is something you can see in real time, not reconstruct once a year for an auditor.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap" }}>
            <button onClick={onLaunch} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: "#FFFFFF", background: T.coral, border: "none", borderRadius: 9, padding: "12px 20px", cursor: "pointer" }}>
              Launch Dashboard <ArrowRight size={15} />
            </button>
            <button onClick={onGoGateway} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: T.text, background: "transparent", border: `1px solid ${T.borderLight}`, borderRadius: 9, padding: "12px 20px", cursor: "pointer" }}>
              <Route size={15} color={T.indigo} /> AI Gateway & Cost Governance
            </button>
          </div>
          <div style={{ display: "flex", gap: 26, marginTop: 40, flexWrap: "wrap" }}>
            {[[String(MODULES.length), "integrated capabilities"], ["4", "cloud providers connected"], ["0", "third-party data exposure"]].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 26, color: T.text }}>{n}</div>
                <div style={{ fontSize: 11.5, color: T.mutedDim }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Signature visual — composite risk pulse preview */}
        <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 16, padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, letterSpacing: "0.08em", color: T.mutedDim, textTransform: "uppercase" }}>Composite Risk Pulse</div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10.5, color: T.green }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: T.green }} /> live
            </div>
          </div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 48, color: T.amber }}>76</div>
          <div style={{ fontSize: 12, color: T.muted, marginBottom: 20 }}>↑ 3 pts vs. last week — driven by ICT third-party risk</div>
          {[["Regulatory", 72, T.amber], ["Control Health", 84, T.green], ["Cyber Posture", 61, T.cyan], ["Evidence Readiness", 90, T.green], ["Remediation Velocity", 58, T.amber]].map(([label, val, color]) => (
            <div key={label} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 4 }}>
                <span style={{ color: T.muted }}>{label}</span>
                <span style={{ color: T.text, fontFamily: "IBM Plex Mono" }}>{val}</span>
              </div>
              <div style={{ height: 6, borderRadius: 4, background: T.panelAlt, overflow: "hidden" }}>
                <div style={{ width: `${val}%`, height: "100%", background: color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ---- Modules ---- */}
      <div id="modules" style={{ maxWidth: 1180, margin: "0 auto", padding: "80px 24px", scrollMarginTop: 70 }}>
        <SectionEyebrow>Platform</SectionEyebrow>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 30, margin: "0 0 12px" }}>{coreModuleCount} modules. One posture.</h2>
        <p style={{ fontSize: 14.5, color: T.muted, maxWidth: 620, marginBottom: 40 }}>
          {coreModuleCount} core business modules, plus embedded features and platform infrastructure kept
          deliberately separate — all writing to the same control, obligation, and evidence model, so a finding in
          one place shows up everywhere it's relevant.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {MODULES.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.label}
                onClick={() => onSelectModule(m)}
                style={{ textAlign: "left", cursor: "pointer", background: T.panel, border: `1px solid ${T.border}`, borderRadius: 13, padding: 20, font: "inherit", color: "inherit" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: T.panelAlt, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                    <Icon size={16} color={T.amber} />
                  </div>
                  <ArrowRight size={14} color={T.mutedDim} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{m.label}</div>
                  <span style={{ fontSize: 9, fontWeight: 700, color: m.tier === "Module" ? T.coral : m.tier === "Feature" ? T.cyan : T.indigo, background: m.tier === "Module" ? T.coralDim : m.tier === "Feature" ? T.cyanDim : T.indigoDim, borderRadius: 5, padding: "2px 6px", fontFamily: "IBM Plex Mono", flexShrink: 0 }}>{m.tier}</span>
                </div>
                <div style={{ fontSize: 12.5, color: T.muted, lineHeight: 1.55 }}>{m.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ---- Data Layer ---- */}
      <div id="data-layer" style={{ borderTop: `1px solid ${T.border}`, background: T.panelAlt, scrollMarginTop: 70 }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "80px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
          <div>
            <SectionEyebrow>Architecture</SectionEyebrow>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 30, margin: "0 0 14px" }}>EDH sits on top of your data layer — it doesn't replace it.</h2>
            <p style={{ fontSize: 14.5, color: T.muted, lineHeight: 1.65, marginBottom: 18 }}>
              Your cloud accounts, on-prem databases, and file systems stay exactly where they are. EDH connects to
              that existing data layer through read-only, least-privilege connectors, and every module, feature, and
              platform capability runs as a view on top of what's already there.
            </p>
            <p style={{ fontSize: 14.5, color: T.muted, lineHeight: 1.65 }}>
              In the workspace, you connect what you want EDH to see — a cloud account, an on-prem MySQL/Oracle/
              Teradata instance, a file source — before choosing which modules to run against it. Nothing runs
              against data EDH hasn't been explicitly connected to.
            </p>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <DataLayerDiagram />
          </div>
        </div>
      </div>

      {/* ---- Platform principles (self-hosted) ---- */}
      <div id="platform-principles" style={{ borderTop: `1px solid ${T.border}`, background: T.panelAlt, scrollMarginTop: 70 }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "70px 24px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 32 }}>
          {[
            { icon: Lock, title: "Nothing leaves your network", body: "Every AI model runs on infrastructure you control. No regulatory text, control data, or evidence is ever sent to a third-party API." },
            { icon: Server, title: "Human sign-off, always", body: "AI drafts and cites its sources. A person approves before anything becomes a system-of-record fact — built into the API layer, not just the UI." },
            { icon: Globe, title: "Multi-cloud by design", body: "Native, least-privilege connectors into AWS, GCP, Azure, and IBM Cloud — normalized into one findings model." },
          ].map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title}>
                <Icon size={20} color={T.cyan} style={{ marginBottom: 14 }} />
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.6 }}>{f.body}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ---- Security ---- */}
      <div id="security" style={{ maxWidth: 1180, margin: "0 auto", padding: "80px 24px", scrollMarginTop: 70 }}>
        <SectionEyebrow>Security</SectionEyebrow>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 30, margin: "0 0 12px" }}>Built to be trusted with regulated data.</h2>
        <p style={{ fontSize: 14.5, color: T.muted, maxWidth: 620, marginBottom: 32 }}>
          Compliance data is some of the most sensitive material an enterprise holds — a live map of exactly where
          its posture is weakest. Every design decision here starts from that fact.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 28 }}>
          {SECURITY_FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 13, padding: 20 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: T.panelAlt, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                  <Icon size={16} color={T.cyan} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 6 }}>{f.title}</div>
                <div style={{ fontSize: 12.5, color: T.muted, lineHeight: 1.55 }}>{f.body}</div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", background: T.panelAlt, border: `1px solid ${T.border}`, borderRadius: 13, padding: "18px 22px" }}>
          {[["0", "third-party data exposure by default"], ["0", "credentials persisted after use"], ["100%", "of AI outputs carry a source citation"]].map(([v, l]) => (
            <div key={l}>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 22, color: T.cyan }}>{v}</div>
              <div style={{ fontSize: 11, color: T.mutedDim }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ---- Book a Demo ---- */}
      <div id="pricing" style={{ maxWidth: 760, margin: "0 auto", padding: "80px 24px", scrollMarginTop: 70 }}>
        <SectionEyebrow>Get started</SectionEyebrow>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 30, margin: "0 0 12px" }}>Book a demo.</h2>
        <p style={{ fontSize: 14.5, color: T.muted, maxWidth: 560, marginBottom: 32 }}>
          Tell us a bit about your team and we'll follow up to set up a walkthrough tailored to your entities,
          jurisdictions, and data footprint. This goes straight to our team — no email client opens.
        </p>
        <BookDemoForm />
      </div>

      {/* ---- About ---- */}
      <div id="about" style={{ maxWidth: 1180, margin: "0 auto", padding: "80px 24px", scrollMarginTop: 70 }}>
        <SectionEyebrow>About</SectionEyebrow>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 30, margin: "0 0 32px" }}>Built by people who've sat across the table from an auditor.</h2>
        <div style={{ display: "grid", gridTemplateColumns: "0.4fr 0.6fr", gap: 40, alignItems: "start" }}>
          <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24 }}>
            {/* Photo hook: drop a real image at /public/neha-tyagi.jpg and swap the div below for
                <img src="/neha-tyagi.jpg" alt="Neha Tyagi" style={{ width: 64, height: 64, borderRadius: 999, objectFit: "cover", marginBottom: 16 }} /> */}
            <div style={{ width: 64, height: 64, borderRadius: 999, background: T.indigoDim, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 20, color: T.indigo }}>
              NT
            </div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>Neha Tyagi</div>
            <div style={{ fontSize: 12.5, color: T.mutedDim, marginTop: 2, marginBottom: 14 }}>Senior Vice President — Product Owner, Data &amp; AI</div>
            <div style={{ fontSize: 12.5, color: T.muted, lineHeight: 1.65, border: `1px solid ${T.border}`, borderRadius: 10, padding: 14, background: T.panelAlt }}>
              18+ years in global financial services across North America, EMEA, and APAC, with a career built on
              regulatory program leadership, capital markets platform strategy, and enterprise data architecture.
              Currently leads platform enablement and U.S. regulatory mandates for Government Securities Services at
              BNY Mellon, spanning tri-party repo clearing and settlement. Previously drove post-merger data
              integration and enterprise data lake programs at IBM across major North American banks, and led
              infrastructure strategy consulting at EY. MBA in Applied Finance, IIM Calcutta.
            </div>
            <a href="https://www.linkedin.com/in/neha-tyagi-13895a7/" target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: T.cyan, marginTop: 12, textDecoration: "none" }}>
              View LinkedIn profile <ArrowRight size={11} />
            </a>
          </div>
          <div style={{ fontSize: 14, color: T.muted, lineHeight: 1.75 }}>
            <p>
              Enterprise Drishti Hub grew out of 18 years spent inside the regulatory mandates and platform
              modernization programs of global banking — watching compliance teams rebuild the same evidence from
              scratch every audit cycle, and control validation live in spreadsheets that were stale the moment
              they were exported.
            </p>
            <p>
              EDH is built to sit inside your own network, with AI that drafts and cites rather than decides, so the
              humans who are accountable for compliance stay in the loop on every finding that matters — while the
              busywork of tracking regulatory change, chasing evidence, and correlating security signal to controls
              happens continuously in the background.
            </p>
          </div>
        </div>
      </div>

      {/* ---- What End Users Feel (testimonials) ---- */}
      <TestimonialsSection />

      {/* ---- Final CTA ---- */}
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 30, margin: "0 0 14px" }}>See your whole risk posture in one place.</h2>
        <p style={{ fontSize: 14.5, color: T.muted, marginBottom: 28 }}>Self-hosted. Human-approved. Built for banking and capital markets.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={onLaunch} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: "#FFFFFF", background: T.coral, border: "none", borderRadius: 9, padding: "13px 22px", cursor: "pointer" }}>
            Launch Dashboard <ArrowRight size={15} />
          </button>
          <button onClick={onGoGateway} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: T.text, background: "transparent", border: `1px solid ${T.borderLight}`, borderRadius: 9, padding: "13px 22px", cursor: "pointer" }}>
            <Route size={15} color={T.indigo} /> AI Gateway & Cost Governance
          </button>
        </div>
      </div>

      {/* ---- Footer ---- */}
      <div style={{ borderTop: `1px solid ${T.border}`, padding: "28px 24px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div style={{ fontSize: 11.5, color: T.mutedDim }}>© 2026 Enterprise Drishti Hub. Self-hosted compliance & cyber risk platform.</div>
          <div style={{ display: "flex", gap: 18 }}>
            <span style={{ fontSize: 11.5, color: T.mutedDim }}>Privacy</span>
            <a href="#security" style={{ fontSize: 11.5, color: T.mutedDim, textDecoration: "none" }}>Security</a>
            <a href="#pricing" style={{ fontSize: 11.5, color: T.mutedDim, textDecoration: "none" }}>Contact</a>
          </div>
        </div>
      </div>
    </div>
  );
}
