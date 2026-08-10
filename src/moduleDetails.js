// Per-module detail content: a ~50-word plain-language commentary and a
// simple pipeline flow (rendered as an original diagram, not copied from
// anywhere) showing how that module actually processes a request.

export const MODULE_DETAILS = {
  impact: {
    commentary:
      "When a regulatory change clears the relevance filter, this module retrieves your existing control library and proposes which controls it affects and how severe the gap is. It also runs real region-based data guideline validation against your connected sources — matching each connection's actual region to the regulation that applies there (GDPR, CCPA, PIPEDA, and others) and showing the impact on that specific connection.",
    flow: ["Regulatory change", "Retrieve control library", "Propose mapping & gap", "Human review"],
    exampleFlow: ["New clause: DORA Art. 28", "Control TPRM-014 retrieved", "Gap found: insufficient evidence", "Assigned to R. Okafor"],
  },
  controls: {
    commentary:
      "Controls are tested against live system state on a schedule, not attested to once a year. Machine-checkable controls (MFA enforcement, encryption at rest) run as deterministic rule evaluations against retrieved configuration; a control that passed last week and fails this week raises a drift event immediately, with AI only used to explain and cluster related failures.",
    flow: ["Live system state", "Rule evaluation", "Pass / fail / drift", "Cluster & alert"],
    exampleFlow: ["Check: MFA on admin group", "Query run against IdP API", "Result: 91 / 91 passing", "No drift — no alert raised"],
  },
  evidence: {
    commentary:
      "Pulls every check result, ticket, and attestation for a control over an audit period and drafts an auditor-ready narrative, citing the specific underlying record behind every claim. Evidence artifacts are hash-chained at capture and again at packaging, so tampering is detectable. The draft is not exportable until a control owner reviews and signs it.",
    flow: ["Pull check results", "Draft narrative", "Hash-chain package", "Human sign-off"],
    exampleFlow: ["Control: IAM-002, Q3 2026", "14 check results pulled", "Narrative drafted (v3)", "Signed off by R. Okafor"],
  },
  overview: {
    commentary:
      "Shows a real, live graphical view of every connected data source across the enterprise — resource counts by category and by connection, built entirely from actual connection data, no simulation. A live re-check can re-query connected sources using session-cached credentials and surface exactly what changed since the last check.",
    flow: ["All connected sources", "Aggregate by category", "Real graphical view", "Live change detection"],
    exampleFlow: ["3 sources connected", "142 resources tracked", "Check for changes run", "2 new files detected"],
  },
  predictive: {
    commentary:
      "Load a historical CSV and get real statistical anomaly detection — a genuine z-score calculation against your data, not a canned example. A simple, transparent linear projection then estimates the next period's anomaly count from the actual trend in your file, clearly labeled as a basic projection rather than a trained model.",
    flow: ["Historical file loaded", "Real z-score detection", "Trend bucketed over time", "Linear projection"],
    exampleFlow: ["claims_history.csv loaded", "14 anomalies found (|z|>2)", "Trend: rising 0.8/month", "Next period: ~5 projected"],
  },
  gateway: {
    commentary:
      "Every AI call in EDH routes through this gateway. Self-hosted models are the default; external providers are strictly opt-in fallbacks, never a silent default. Routing weighs cost, latency, and provider health with automatic failover, while every call is metered by token and cost, attributed to the module and project that triggered it, for budget control and audit.",
    flow: ["AI call request", "Route by cost/latency/health", "Execute (self-hosted default)", "Meter tokens & cost"],
    exampleFlow: ["Call: draft evidence narrative", "Routed to vLLM — 210ms, $0.00", "Logged: 1,240 tokens", "Attributed to Evidence module"],
  },
};
