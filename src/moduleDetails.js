// Per-module detail content: a ~50-word plain-language commentary and a
// simple pipeline flow (rendered as an original diagram, not copied from
// anywhere) showing how that module actually processes a request.

export const MODULE_DETAILS = {
  regintel: {
    commentary:
      "Continuously ingests regulatory sources, diffs each new version at the clause level against what came before, and classifies changes against your applicability profile. Only changes that actually apply to your jurisdictions and licenses generate an alert, each with a plain-language summary cited back to the exact source clause — nothing is summarized without a traceable source.",
    flow: ["Ingest sources", "Diff & classify", "Filter by applicability", "Cited summary"],
    exampleFlow: ["EU AI Act Art. 6 update detected", "Diffed v2.3 → v2.4", "Applies to: EU entity, AI governance", "Cited summary sent to owner"],
  },
  impact: {
    commentary:
      "When a regulatory change clears the relevance filter, this module retrieves your existing control library and proposes which controls it affects and how severe the gap is — no control, insufficient control, or already sufficient. Every proposal is a draft with citations to both the regulation and your internal policy text; a compliance owner accepts, edits, or rejects it.",
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
      "Rolls up every other module's output into one posture score, drillable by framework, business unit, and jurisdiction. This view is deliberately not another AI call — it's deterministic aggregation over data the other modules already validated, so it stays fast, reproducible, and exactly as trustworthy as the records feeding it.",
    flow: ["All module data", "Aggregate by framework/BU", "Posture score", "Drill down"],
    exampleFlow: ["9 modules report in", "Aggregated by framework", "Posture score: 76", "Drilldown: DORA at 76%"],
  },
  predictive: {
    commentary:
      "A gradient-boosted model — not a language model — scores regulatory risk by topic using your own control-drift history, remediation timeliness, and enforcement base rates for comparable entities. The language model's only job is turning that score into a readable brief with mitigation suggestions, always shown with its confidence interval and sample size, never a bare number.",
    flow: ["Historical & control data", "Gradient-boosted scoring", "LLM narrative", "Confidence-scored brief"],
    exampleFlow: ["90-day control-drift history", "Model scores AML topic: 78", "LLM drafts risk brief", "Shown with n=47, wide CI"],
  },
  riskanalysis: {
    commentary:
      "Scores counterparties, vendors, and portfolios not on a single attribute, but on how their connections combine — a jurisdiction change, an unverified beneficial-owner update, an overdue control, read together rather than in isolation. The scoring model reads from the same relationship graph the next module builds, and every score cites the specific factors driving it.",
    flow: ["Entity + relationship data", "Contextual scoring model", "Cited risk drivers", "Human review"],
    exampleFlow: ["Counterparty flagged in AML screen", "3 factors combined: UBO, jurisdiction, control status", "Score: 82 — cited drivers shown", "Routed to compliance owner"],
  },
  relgraph: {
    commentary:
      "Builds one graph connecting counterparties, vendors, jurisdictions, controls, and the regulations they fall under — so a change in one place (a new beneficial owner, a sub-processor added without notice) is visible everywhere it's relevant, instead of living in whichever system happened to record it first. Every other module reads from this same graph.",
    flow: ["Connected entity data", "Resolve relationships", "Build shared graph", "Feed every module"],
    exampleFlow: ["New vendor sub-processor added", "Linked to existing DPA + control", "Graph updated in place", "Risk analysis module notified"],
  },
  gateway: {
    commentary:
      "Every AI call in EDH routes through this gateway. Self-hosted models are the default; external providers are strictly opt-in fallbacks, never a silent default. Routing weighs cost, latency, and provider health with automatic failover, while every call is metered by token and cost, attributed to the module and project that triggered it, for budget control and audit.",
    flow: ["AI call request", "Route by cost/latency/health", "Execute (self-hosted default)", "Meter tokens & cost"],
    exampleFlow: ["Call: draft evidence narrative", "Routed to vLLM — 210ms, $0.00", "Logged: 1,240 tokens", "Attributed to Evidence module"],
  },
};
