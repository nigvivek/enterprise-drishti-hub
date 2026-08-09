import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Sparkles } from "lucide-react";
import { T, FONT_IMPORT } from "./tokens.js";

export default function ChatAssistant({ onAction }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi — I can explain any module, help you navigate the app, or walk you through connecting a data source. What do you need?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  const send = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setError("");
    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setLoading(true);

    try {
      const resp = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages.map(({ role, content }) => ({ role, content })) }),
      });
      const result = await resp.json();
      if (!result.ok) {
        setError(result.error || "The assistant couldn't respond.");
        setLoading(false);
        return;
      }
      setMessages((prev) => [...prev, { role: "assistant", content: result.reply }]);
      if (result.action?.type === "navigate" && onAction) {
        onAction(result.action);
      }
    } catch (err) {
      setError(err.message || "Network error reaching the assistant.");
    }
    setLoading(false);
  };

  return (
    <>
      <style>{`.edh-chat-spin { animation: edh-chat-spin 0.9s linear infinite; } @keyframes edh-chat-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: "fixed", bottom: 22, right: 22, width: 52, height: 52, borderRadius: 999, zIndex: 500,
            background: T.coral, border: "none", color: "#FFFFFF", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 20px rgba(0,0,0,0.18)",
          }}
        >
          <MessageCircle size={22} />
        </button>
      )}

      {open && (
        <div style={{
          position: "fixed", bottom: 22, right: 22, width: 340, maxHeight: 480, zIndex: 500,
          background: T.bg, border: `1px solid ${T.border}`, borderRadius: 16, boxShadow: "0 12px 36px rgba(0,0,0,0.2)",
          display: "flex", flexDirection: "column", fontFamily: "'Inter', sans-serif",
        }}>
          <style>{FONT_IMPORT}</style>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderBottom: `1px solid ${T.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <Sparkles size={14} color={T.coral} />
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 13 }}>EDH Assistant</span>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: T.mutedDim }}>
              <X size={16} />
            </button>
          </div>

          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10, minHeight: 220 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "85%" }}>
                <div style={{
                  fontSize: 12.5, lineHeight: 1.5, padding: "8px 11px", borderRadius: 10,
                  background: m.role === "user" ? T.coral : T.panel,
                  color: m.role === "user" ? "#FFFFFF" : T.text,
                  border: m.role === "user" ? "none" : `1px solid ${T.border}`,
                }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: T.mutedDim }}>
                <Loader2 size={12} className="edh-chat-spin" /> thinking…
              </div>
            )}
            {error && <div style={{ fontSize: 11.5, color: T.red, background: T.redDim, borderRadius: 8, padding: "7px 10px" }}>{error}</div>}
          </div>

          <form onSubmit={send} style={{ display: "flex", gap: 8, padding: 12, borderTop: `1px solid ${T.border}` }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about EDH, or where to go…"
              style={{ flex: 1, boxSizing: "border-box", background: T.panelAlt, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 10px", color: T.text, fontSize: 12.5, fontFamily: "'Inter', sans-serif" }}
            />
            <button type="submit" disabled={loading || !input.trim()} style={{ background: T.coral, border: "none", borderRadius: 8, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, opacity: loading || !input.trim() ? 0.5 : 1 }}>
              <Send size={14} color="#FFFFFF" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
