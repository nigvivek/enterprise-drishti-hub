import React from "react";
import { Cloud, Database, FileText, Server } from "lucide-react";
import { T } from "./tokens.js";

/**
 * An original composition (not a copy of any vendor's marketing graphic):
 * a central EDH node with orbiting connector nodes for the data-layer
 * sources it reads from. Provider identity is conveyed with plain text
 * labels, not reproduced logos.
 */
export default function DataLayerDiagram({ compact = false }) {
  const size = compact ? 320 : 420;
  const nodes = [
    { label: "AWS", angle: -60, icon: Cloud },
    { label: "Azure", angle: -20, icon: Cloud },
    { label: "GCP", angle: 20, icon: Cloud },
    { label: "IBM Cloud", angle: 60, icon: Cloud },
    { label: "On-Prem DB", angle: 130, icon: Database },
    { label: "Files", angle: 175, icon: FileText },
    { label: "Data Center", angle: -130, icon: Server },
  ];
  const cx = size / 2;
  const cy = size / 2;
  const orbit = size * 0.38;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" height="100%" style={{ maxWidth: size }}>
      <circle cx={cx} cy={cy} r={orbit} fill="none" stroke={T.border} strokeWidth="1" strokeDasharray="3 5" />
      <circle cx={cx} cy={cy} r={orbit * 0.62} fill="none" stroke={T.border} strokeWidth="1" opacity="0.5" />

      {nodes.map((n, i) => {
        const rad = (n.angle * Math.PI) / 180;
        const x = cx + orbit * Math.cos(rad);
        const y = cy + orbit * Math.sin(rad);
        const Icon = n.icon;
        return (
          <g key={n.label}>
            <line x1={cx} y1={cy} x2={x} y2={y} stroke={T.borderLight} strokeWidth="1.2" />
            <circle cx={x} cy={y} r="26" fill={T.panel} stroke={T.border} strokeWidth="1.2" />
            <foreignObject x={x - 11} y={y - 18} width="22" height="22">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
                <Icon size={14} color={T.cyan} />
              </div>
            </foreignObject>
            <text x={x} y={y + 15} textAnchor="middle" fontSize="9.5" fontFamily="IBM Plex Mono, monospace" fill={T.muted}>
              {n.label}
            </text>
          </g>
        );
      })}

      {/* Central node */}
      <circle cx={cx} cy={cy} r="46" fill={T.panel} stroke={T.amber} strokeWidth="1.6" />
      <foreignObject x={cx - 16} y={cy - 26} width="32" height="32">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.amber} strokeWidth="2">
            <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" />
          </svg>
        </div>
      </foreignObject>
      <text x={cx} y={cy + 20} textAnchor="middle" fontSize="10" fontWeight="700" fontFamily="Space Grotesk, sans-serif" fill={T.text}>
        EDH
      </text>
    </svg>
  );
}
