import {
  LayoutDashboard, ScrollText, GitCompareArrows, ClipboardCheck, FileStack,
  Radar as RadarIcon, Route, BrainCircuit, Network,
} from "lucide-react";

export const MODULE_LIST = [
  { id: "overview", label: "Command Center", icon: LayoutDashboard, module: "Module 5" },
  { id: "regintel", label: "Regulatory Change Intel", icon: ScrollText, module: "Module 1" },
  { id: "impact", label: "Compliance Impact Analysis", icon: GitCompareArrows, module: "Module 2" },
  { id: "controls", label: "Continuous Control Validation", icon: ClipboardCheck, module: "Module 3" },
  { id: "evidence", label: "Audit Evidence Generation", icon: FileStack, module: "Module 4" },
  { id: "predictive", label: "Predictive Regulatory Risk", icon: RadarIcon, module: "Module 6" },
  { id: "riskanalysis", label: "AI-Powered Contextual Risk Analysis", icon: BrainCircuit, module: "Module 7" },
  { id: "relgraph", label: "Enterprise Context & Relationship Graph", icon: Network, module: "Module 8" },
  { id: "gateway", label: "AI Gateway & Cost Governance", icon: Route, module: "Module 9" },
];

export const ALL_MODULE_IDS = MODULE_LIST.map((m) => m.id);
