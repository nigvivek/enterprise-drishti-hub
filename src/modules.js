import {
  LayoutDashboard, GitCompareArrows, ClipboardCheck,
  Radar as RadarIcon, Route,
} from "lucide-react";

// tier: "module" = core functional business module
//       "feature" = still fully accessible, but embedded/linked rather than a
//                   standalone functional module (per explicit product decision)
//       "platform" = technical/operational infrastructure — rendered as a
//                    pinned top-of-sidebar item, not part of the tiered
//                    Modules/Features grouping (also per explicit decision)
export const MODULE_LIST = [
  { id: "overview", label: "Risk Analysis Dashboard", icon: LayoutDashboard, tier: "module", tierLabel: "Module" },
  { id: "impact", label: "Compliance Impact Analysis", icon: GitCompareArrows, tier: "module", tierLabel: "Module" },
  { id: "predictive", label: "Predictive Regulatory Risk & Audit Evidence", icon: RadarIcon, tier: "module", tierLabel: "Module" },
  { id: "controls", label: "Continuous Control Validation", icon: ClipboardCheck, tier: "module", tierLabel: "Module" },
  { id: "gateway", label: "AI Gateway & Cost Governance", icon: Route, tier: "platform", tierLabel: "Platform" },
];

export const ALL_MODULE_IDS = MODULE_LIST.map((m) => m.id);
export const FUNCTIONAL_MODULE_IDS = MODULE_LIST.filter((m) => m.tier === "module").map((m) => m.id);
