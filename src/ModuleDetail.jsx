import React from "react";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { T, FONT_IMPORT } from "./tokens.js";
import { MODULE_DETAILS } from "./moduleDetails.js";

function wrapLabel(text, maxCharsPerLine) {
  const words = text.split(" ");
  const lines = [];
  let current = "";
  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxCharsPerLine && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  });
  if (current) lines.push(current);
  return lines;
}

function FlowDiagram({ stages, accentColor }) {
  const boxW = 190;
  const gap = 44;
  const lineHeight = 16;
  const vPadding = 22;
  const maxCharsPerLine = 20;

  const wrapped = stages.map((label) => wrapLabel(label, maxCharsPerLine));
  const maxLines = Math.max(...wrapped.map((l) => l.length));
  const boxH = Math.max(64, maxLines * lineHeight + vPadding);
  const width = stages.length * boxW + (stages.length - 1) * gap;
  const height = boxH + 20;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ maxWidth: width }}>
      {stages.map((label, i) => {
        const x = i * (boxW + gap);
        const lines = wrapped[i];
        const cy = 10 + boxH / 2;
        const startY = cy - ((lines.length - 1) * lineHeight) / 2;
        return (
          <g key={label}>
            <rect x={x} y={10} width={boxW} height={boxH} rx={12} fill={T.panel} stroke={i === stages.length - 1 ? (accentColor || T.coral) : T.border} strokeWidth={i === stages.length - 1 ? 1.6 : 1.2} />
            <text x={x + boxW / 2} textAnchor="middle" fontFamily="'Space Grotesk', sans-serif" fontWeight="600" fontSize="12" fill={T.text}>
              {lines.map((line, li) => (
                <tspan key={li} x={x + boxW / 2} y={startY + li * lineHeight}>{line}</tspan>
              ))}
            </text>
            {i < stages.length - 1 && (
              <g>
                <line x1={x + boxW} y1={cy} x2={x + boxW + gap - 6} y2={cy} stroke={T.borderLight} strokeWidth="1.6" />
                <polygon points={`${x + boxW + gap - 6},${cy - 5} ${x + boxW + gap},${cy} ${x + boxW + gap - 6},${cy + 5}`} fill={T.borderLight} />
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export default function ModuleDetail({ moduleDef, onBack, onLaunch }) {
  const detail = MODULE_DETAILS[moduleDef.id];
  const Icon = moduleDef.icon;

  return (
    <div style={{ background: T.bg, color: T.text, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <style>{FONT_IMPORT}</style>

      <div style={{ borderBottom: `1px solid ${T.border}`, padding: "16px 24px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 7, background: "none", border: "none", color: T.muted, fontSize: 13, cursor: "pointer", padding: 0 }}>
            <ArrowLeft size={14} /> Back to platform overview
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "56px 24px 80px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <div style={{ width: 44, height: 44, borderRadius: 11, background: T.panel, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon size={20} color={T.coral} />
          </div>
          <div style={{ fontSize: 11, color: T.mutedDim, fontFamily: "IBM Plex Mono", textTransform: "uppercase", letterSpacing: "0.08em" }}>{moduleDef.tier}</div>
        </div>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 34, margin: "10px 0 20px", lineHeight: 1.15 }}>{moduleDef.label}</h1>

        <p style={{ fontSize: 16, color: T.muted, lineHeight: 1.7, marginBottom: 40, maxWidth: 720 }}>{detail.commentary}</p>

        <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 16, padding: "28px 24px", marginBottom: 24, overflowX: "auto" }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, letterSpacing: "0.08em", color: T.amber, textTransform: "uppercase", marginBottom: 16 }}>How a request flows through this module</div>
          <FlowDiagram stages={detail.flow} accentColor={T.coral} />
        </div>

        <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 16, padding: "28px 24px", marginBottom: 40, overflowX: "auto" }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, letterSpacing: "0.08em", color: T.cyan, textTransform: "uppercase", marginBottom: 16 }}>Example data trace (illustrative)</div>
          <FlowDiagram stages={detail.exampleFlow} accentColor={T.cyan} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5, color: T.mutedDim, marginBottom: 32 }}>
          <Sparkles size={13} color={T.indigo} />
          Like every module in EDH, AI outputs here are drafts with citations — a human reviewer signs off before anything becomes a system-of-record fact.
        </div>

        <button onClick={onLaunch} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: "#FFFFFF", background: T.coral, border: "none", borderRadius: 9, padding: "12px 20px", cursor: "pointer" }}>
          See it in the dashboard <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
