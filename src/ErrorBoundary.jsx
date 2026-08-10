import React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { T, FONT_IMPORT } from "./tokens.js";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error("EDH render error:", error, info?.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ background: T.bg, color: T.text, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif", padding: 24 }}>
          <style>{FONT_IMPORT}</style>
          <div style={{ maxWidth: 480, textAlign: "center" }}>
            <AlertTriangle size={28} color={T.red} style={{ marginBottom: 14 }} />
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 18, marginBottom: 8 }}>Something broke rendering this page</div>
            <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.6, marginBottom: 8 }}>
              This is usually caused by data saved before an app update — most often an old selection referencing a
              module that no longer exists.
            </p>
            <div style={{ fontSize: 11, color: T.mutedDim, fontFamily: "IBM Plex Mono", background: T.panel, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 11px", marginBottom: 20, textAlign: "left", overflowX: "auto" }}>
              {String(this.state.error?.message || this.state.error)}
            </div>
            <button
              onClick={() => { this.setState({ error: null }); this.props.onReset?.(); }}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 600, color: "#FFFFFF", background: T.coral, border: "none", borderRadius: 9, padding: "11px 20px", cursor: "pointer" }}
            >
              <RotateCcw size={15} /> Go back and retry
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
