import React, { useState, useEffect } from "react";
import {
  ShieldCheck, ScrollText, GitCompareArrows, ClipboardCheck, FileStack,
  LayoutDashboard, Radar as RadarIcon, ShieldAlert, Cloud, FileCheck2,
  ArrowRight, Quote, Lock, Server, Globe, Check, X, Bug, Activity, MessageSquarePlus, Route, Loader2,
} from "lucide-react";
import { T, FONT_IMPORT } from "./tokens.js";
import DataLayerDiagram from "./DataLayerDiagram.jsx";

const SALES_EMAIL = "nehatyagi.in@gmail.com";

const MODULES = [
  { id: "regintel", module: "Module 1", icon: ScrollText, name: "Regulatory Change Intelligence", desc: "Every relevant regulatory change, filtered to what actually applies to your entities and jurisdictions." },
  { id: "impact", module: "Module 2", icon: GitCompareArrows, name: "Compliance Impact Analysis", desc: "AI-proposed, human-approved mapping from regulatory change to the control it actually affects." },
  { id: "controls", module: "Module 3", icon: ClipboardCheck, name: "Continuous Control Validation", desc: "Controls tested against live system state, not a once-a-year attestation." },
  { id: "evidence", module: "Module 4", icon: FileStack, name: "AI-Driven Audit Evidence", desc: "Hash-chained, tamper-evident evidence packages generated in minutes, signed by a human before export." },
  { id: "overview", module: "Module 5", icon: LayoutDashboard, name: "Enterprise Compliance Dashboard", desc: "One posture score, drillable by framework, business unit, and jurisdiction." },
  { id: "predictive", module: "Module 6", icon: RadarIcon, name: "Predictive Regulatory Risk", desc: "Model-scored risk by topic, with the sample size and confidence shown — never a black box." },
  { id: "cyber", module: "Module 7", icon: ShieldAlert, name: "Cybersecurity Monitoring", desc: "Your existing SIEM/EDR signal, correlated to the control and obligation it puts at risk." },
  { id: "cloud", module: "Module 8", icon: Cloud, name: "Cloud Ecosystem Connect", desc: "Read-only, least-privilege connectors into AWS, GCP, Azure, and IBM Cloud." },
  { id: "filegov", module: "Module 9", icon: FileCheck2, name: "File Governance & Scan", desc: "Drop in a document, get an immediate read on sensitive data and which obligation it triggers." },
  { id: "gateway", module: "Module 10", icon: Route, name: "AI Gateway & Cost Governance", desc: "Routes every AI call across self-hosted and opt-in fallback models by cost, latency, and health — with full token and spend attribution for audit." },
];

const TESTIMONIALS = [
  { quote: "Placeholder quote — swap in a real customer testimonial before this goes live. Keep it specific: what changed, in numbers, for their team.", name: "Name, Title", org: "Company / Industry" },
  { quote: "Placeholder quote — e.g., a compliance lead describing time saved on evidence collection for a specific audit cycle.", name: "Name, Title", org: "Company / Industry" },
  { quote: "Placeholder quote — e.g., a CISO describing how cloud + cyber findings finally landed in one place instead of three dashboards.", name: "Name, Title", org: "Company / Industry" },
];

const SECURITY_FEATURES = [
  { icon: ShieldAlert, title: "Correlated alert stream", body: "Every SIEM/EDR alert linked to the exact control and regulatory obligation it puts at risk — not a separate, disconnected feed." },
  { icon: Cloud, title: "Cross-cloud posture", body: "AWS, GCP, Azure, and IBM Cloud findings normalized into one severity taxonomy, so a misconfigured bucket looks the same regardless of provider." },
  { icon: Bug, title: "Vulnerability aging", body: "Unpatched criticals tracked against your own SLA, not just a scanner's CVSS score — the number auditors actually ask for." },
  { icon: Activity, title: "MTTD / MTTR tracking", body: "Detection and response time trended over time, the same metrics your board and your next audit will both want to see." },
];

const TIERS = [
  {
    name: "Free Trial",
    price: "$0",
    period: "30 days",
    tagline: "See your posture before you commit to anything.",
    cta: "Start free trial",
    highlight: false,
    features: [
      "All 10 modules, full functionality",
      "1 cloud provider connector",
      "Up to 50 controls monitored",
      "Shared demo environment",
      "Community support",
      "No credit card required",
    ],
  },
  {
    name: "Standard Edition",
    price: "Contact us",
    period: "annual license",
    tagline: "For a single business unit or mid-size compliance function.",
    cta: "Talk to sales",
    highlight: true,
    features: [
      "All 10 modules, full functionality",
      "Up to 4 cloud provider connectors",
      "Unlimited controls & evidence packages",
      "Dedicated tenant, your choice of region",
      "SSO/SAML, role-based access control",
      "Email + chat support, business hours",
    ],
  },
  {
    name: "Enterprise Edition",
    price: "Custom",
    period: "annual license",
    tagline: "Fully self-hosted, inside your own network.",
    cta: "Request a demo",
    highlight: false,
    features: [
      "Deployed entirely inside your VPC / on-prem",
      "Unlimited cloud connectors & databases",
      "Your own self-hosted AI inference layer",
      "Custom SLA, dedicated solutions engineer",
      "Audit-ready deployment & model governance docs",
      "Multi-entity, multi-jurisdiction support",
    ],
  },
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
/*  Contact / signup modal — builds a mailto: so it actually sends        */
/*  somewhere with zero backend. Swap for a real form endpoint            */
/*  (Formspree/EmailJS, or the backend in architecture.md) when ready.    */
/* ---------------------------------------------------------------------- */
function ContactModal({ plan, onClose }) {
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`EDH — ${plan} inquiry from ${form.company || form.name || "website"}`);
    const body = encodeURIComponent(
      `Plan interested in: ${plan}\n\nName: ${form.name}\nWork email: ${form.email}\nCompany: ${form.company}\n\nMessage:\n${form.message}`
    );
    window.location.href = `mailto:${SALES_EMAIL}?subject=${subject}&body=${body}`;
    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "#000000B3", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 16, padding: 28, width: "100%", maxWidth: 440 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <div>
            <div style={{ fontSize: 10.5, color: T.amber, fontFamily: "IBM Plex Mono", textTransform: "uppercase", letterSpacing: "0.08em" }}>{plan}</div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 18, marginTop: 4 }}>Get in touch</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.mutedDim }}>
            <X size={18} />
          </button>
        </div>
        <p style={{ fontSize: 12, color: T.mutedDim, marginBottom: 20 }}>
          This opens your email client with a message pre-filled to our team — nothing is sent until you hit send there.
        </p>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { k: "name", label: "Name", type: "text", required: true },
            { k: "email", label: "Work email", type: "email", required: true },
            { k: "company", label: "Company", type: "text", required: false },
          ].map((f) => (
            <div key={f.k}>
              <label style={{ fontSize: 11.5, color: T.mutedDim, display: "block", marginBottom: 5 }}>{f.label}{f.required && " *"}</label>
              <input
                type={f.type}
                required={f.required}
                value={form[f.k]}
                onChange={set(f.k)}
                style={{ width: "100%", boxSizing: "border-box", background: T.panelAlt, border: `1px solid ${T.border}`, borderRadius: 8, padding: "9px 11px", color: T.text, fontSize: 13, fontFamily: "'Inter', sans-serif" }}
              />
            </div>
          ))}
          <div>
            <label style={{ fontSize: 11.5, color: T.mutedDim, display: "block", marginBottom: 5 }}>What are you hoping to solve?</label>
            <textarea
              rows={3}
              value={form.message}
              onChange={set("message")}
              style={{ width: "100%", boxSizing: "border-box", background: T.panelAlt, border: `1px solid ${T.border}`, borderRadius: 8, padding: "9px 11px", color: T.text, fontSize: 13, fontFamily: "'Inter', sans-serif", resize: "vertical" }}
            />
          </div>
          <button type="submit" style={{ marginTop: 6, fontSize: 13.5, fontWeight: 600, color: "#FFFFFF", background: T.coral, border: "none", borderRadius: 9, padding: "11px 16px", cursor: "pointer" }}>
            Send to our team
          </button>
        </form>
      </div>
    </div>
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

export default function LandingPage({ onLaunch, onSelectModule }) {
  const [contactPlan, setContactPlan] = useState(null); // null | string

  return (
    <div style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif", minHeight: "100vh" }}>
      <style>{FONT_IMPORT}{`html { scroll-behavior: smooth; } .edh-spin { animation: edh-spin 0.9s linear infinite; } @keyframes edh-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {contactPlan && <ContactModal plan={contactPlan} onClose={() => setContactPlan(null)} />}

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
            <NavLink href="#pricing">Pricing</NavLink>
            <NavLink href="#security">Security</NavLink>
            <NavLink href="#about">About</NavLink>
            <NavLink href="#feedback">Feedback</NavLink>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
          </div>
          <div style={{ display: "flex", gap: 26, marginTop: 40, flexWrap: "wrap" }}>
            {[["10", "integrated modules"], ["4", "cloud providers connected"], ["0", "third-party data exposure"]].map(([n, l]) => (
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
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 30, margin: "0 0 12px" }}>Ten modules. One posture.</h2>
        <p style={{ fontSize: 14.5, color: T.muted, maxWidth: 560, marginBottom: 40 }}>
          Every module writes to the same control, obligation, and evidence model — so a finding in one place shows up
          everywhere it's relevant, instead of living in a spreadsheet someone forgets to update.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {MODULES.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.name}
                onClick={() => onSelectModule(m)}
                style={{ textAlign: "left", cursor: "pointer", background: T.panel, border: `1px solid ${T.border}`, borderRadius: 13, padding: 20, font: "inherit", color: "inherit" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: T.panelAlt, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                    <Icon size={16} color={T.amber} />
                  </div>
                  <ArrowRight size={14} color={T.mutedDim} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 6 }}>{m.name}</div>
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
              that existing data layer through read-only, least-privilege connectors, and every one of the ten
              modules runs as a view on top of what's already there.
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
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 30, margin: "0 0 12px" }}>Cybersecurity monitoring, in compliance context.</h2>
        <p style={{ fontSize: 14.5, color: T.muted, maxWidth: 620, marginBottom: 32 }}>
          EDH doesn't replace your SIEM or EDR — it sits on top of the telemetry you already collect and answers the
          question those tools don't: which control does this finding put at risk, and which regulation does that
          control satisfy.
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
          {[["21m", "avg. MTTD"], ["1.8d", "avg. MTTR"], ["3", "open critical vulns"], ["4", "clouds correlated"]].map(([v, l]) => (
            <div key={l}>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 22, color: T.cyan }}>{v}</div>
              <div style={{ fontSize: 11, color: T.mutedDim }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ---- Pricing ---- */}
      <div id="pricing" style={{ maxWidth: 1180, margin: "0 auto", padding: "80px 24px", scrollMarginTop: 70 }}>
        <SectionEyebrow>Pricing</SectionEyebrow>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 30, margin: "0 0 12px" }}>Start free. Scale into your own environment.</h2>
        <p style={{ fontSize: 14.5, color: T.muted, maxWidth: 560, marginBottom: 40 }}>
          Every tier runs the same ten modules. What changes is where it's deployed, how much of your environment it
          watches, and what kind of support sits behind it.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              style={{
                position: "relative", background: tier.highlight ? T.panel : T.panelAlt,
                border: `1px solid ${tier.highlight ? T.amber : T.border}`, borderRadius: 16, padding: 26,
                display: "flex", flexDirection: "column",
              }}
            >
              {tier.highlight && (
                <div style={{ position: "absolute", top: -12, left: 24, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.text, background: T.amber, padding: "3px 10px", borderRadius: 999, fontFamily: "IBM Plex Mono" }}>
                  Most common
                </div>
              )}
              <div style={{ fontSize: 15, fontWeight: 600, color: T.text, marginTop: tier.highlight ? 6 : 0 }}>{tier.name}</div>
              <div style={{ fontSize: 12, color: T.mutedDim, marginTop: 4, marginBottom: 18 }}>{tier.tagline}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 7, marginBottom: 22 }}>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 30, color: T.text }}>{tier.price}</span>
                <span style={{ fontSize: 11.5, color: T.mutedDim }}>{tier.period}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, marginBottom: 24 }}>
                {tier.features.map((f) => (
                  <div key={f} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12.5, color: T.muted }}>
                    <Check size={14} color={tier.highlight ? T.coral : T.cyan} style={{ flexShrink: 0, marginTop: 1 }} />
                    {f}
                  </div>
                ))}
              </div>
              <button
                onClick={() => setContactPlan(tier.name)}
                style={{
                  fontSize: 13, fontWeight: 600, borderRadius: 9, padding: "11px 16px", cursor: "pointer",
                  border: tier.highlight ? "none" : `1px solid ${T.borderLight}`,
                  background: tier.highlight ? T.coral : "transparent",
                  color: tier.highlight ? "#FFFFFF" : T.text,
                }}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11.5, color: T.mutedDim, marginTop: 20 }}>
          Standard and Enterprise pricing is customized to entity count, jurisdiction coverage, and cloud footprint —
          every "talk to sales" button above opens a short form that emails our team directly.
        </div>
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
        <button onClick={onLaunch} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: "#FFFFFF", background: T.coral, border: "none", borderRadius: 9, padding: "13px 22px", cursor: "pointer" }}>
          Launch Dashboard <ArrowRight size={15} />
        </button>
      </div>

      {/* ---- Footer ---- */}
      <div style={{ borderTop: `1px solid ${T.border}`, padding: "28px 24px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div style={{ fontSize: 11.5, color: T.mutedDim }}>© 2026 Enterprise Drishti Hub. Self-hosted compliance & cyber risk platform.</div>
          <div style={{ display: "flex", gap: 18 }}>
            <span style={{ fontSize: 11.5, color: T.mutedDim }}>Privacy</span>
            <a href="#security" style={{ fontSize: 11.5, color: T.mutedDim, textDecoration: "none" }}>Security</a>
            <button onClick={() => setContactPlan("General inquiry")} style={{ fontSize: 11.5, color: T.mutedDim, background: "none", border: "none", cursor: "pointer", padding: 0 }}>Contact</button>
          </div>
        </div>
      </div>
    </div>
  );
}
