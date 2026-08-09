import React, { useEffect, useRef, useState } from "react";
import { ShieldCheck, ArrowRight, User, Mail } from "lucide-react";
import { T, FONT_IMPORT } from "./tokens.js";
import { upsertUser, setCurrentUserEmail, guestEmail } from "./store.js";
import { GOOGLE_CLIENT_ID } from "./googleConfig.js";
import { loadGoogleScript, decodeGoogleCredential } from "./googleAuth.js";

export default function AuthScreen({ onSignedIn, onBackToSite, timeoutNotice }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [googleReady, setGoogleReady] = useState(false);
  const googleBtnRef = useRef(null);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    loadGoogleScript()
      .then((google) => {
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (resp) => {
            const info = decodeGoogleCredential(resp.credential);
            if (!info) return;
            const user = upsertUser({ email: info.email, name: info.name, provider: "google" });
            setCurrentUserEmail(user.email);
            onSignedIn(user.email);
          },
        });
        if (googleBtnRef.current) {
          google.accounts.id.renderButton(googleBtnRef.current, { theme: "filled_black", size: "large", width: 320 });
        }
        setGoogleReady(true);
      })
      .catch(() => setGoogleReady(false));
  }, []);

  const continueWithEmail = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    const user = upsertUser({ email: email.trim().toLowerCase(), name: name.trim(), provider: "email" });
    setCurrentUserEmail(user.email);
    onSignedIn(user.email);
  };

  const continueAsGuest = () => {
    setCurrentUserEmail(guestEmail());
    onSignedIn(guestEmail());
  };

  return (
    <div style={{ background: T.bg, color: T.text, minHeight: "100vh", fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <style>{FONT_IMPORT}</style>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <button onClick={onBackToSite} style={{ background: "none", border: "none", color: T.mutedDim, fontSize: 12.5, cursor: "pointer", marginBottom: 24, padding: 0 }}>
          ← Back to site
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 28 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: T.coral, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldCheck size={18} color="#FFFFFF" />
          </div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 17 }}>Enterprise Drishti Hub</div>
        </div>

        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 24, margin: "0 0 6px" }}>Sign in to your workspace</h1>
        {timeoutNotice && (
          <div style={{ fontSize: 12, color: T.coral, background: T.coralDim, borderRadius: 8, padding: "8px 12px", marginBottom: 10 }}>
            Your previous session ended after 20 minutes of inactivity.
          </div>
        )}
        <p style={{ fontSize: 13, color: T.muted, marginBottom: 28 }}>
          Your projects, connections, and run history are saved to this browser under your account.
        </p>

        <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24 }}>
          <div ref={googleBtnRef} style={{ display: "flex", justifyContent: "center", minHeight: 40 }} />
          {!GOOGLE_CLIENT_ID && (
            <div style={{ fontSize: 11, color: T.mutedDim, textAlign: "center", marginTop: 8, lineHeight: 1.5 }}>
              Google sign-in needs a Client ID configured in <code style={{ fontFamily: "IBM Plex Mono" }}>src/googleConfig.js</code> — see the comment there for setup steps.
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "20px 0" }}>
            <div style={{ flex: 1, height: 1, background: T.border }} />
            <span style={{ fontSize: 11, color: T.mutedDim }}>or</span>
            <div style={{ flex: 1, height: 1, background: T.border }} />
          </div>

          <form onSubmit={continueWithEmail} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div>
              <label style={{ fontSize: 11.5, color: T.mutedDim, display: "block", marginBottom: 5 }}>Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jordan Lee" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 11.5, color: T.mutedDim, display: "block", marginBottom: 5 }}>Email</label>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" style={inputStyle} />
            </div>
            <button type="submit" style={{ marginTop: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontSize: 13.5, fontWeight: 600, color: "#FFFFFF", background: T.coral, border: "none", borderRadius: 9, padding: "10px 16px", cursor: "pointer" }}>
              <Mail size={14} /> Continue with email <ArrowRight size={13} />
            </button>
          </form>

          <button onClick={continueAsGuest} style={{ width: "100%", marginTop: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontSize: 13, fontWeight: 600, color: T.text, background: "transparent", border: `1px solid ${T.borderLight}`, borderRadius: 9, padding: "10px 16px", cursor: "pointer" }}>
            <User size={14} /> Continue as guest
          </button>
        </div>

        <p style={{ fontSize: 10.5, color: T.mutedDim, marginTop: 16, lineHeight: 1.6 }}>
          This is a local, browser-based identity for this prototype — there's no password, and nothing is verified
          server-side. It exists to keep your history and projects around between visits, not to secure real data.
        </p>
      </div>
    </div>
  );
}

const inputStyle = { width: "100%", boxSizing: "border-box", background: T.panelAlt, border: `1px solid ${T.border}`, borderRadius: 8, padding: "9px 11px", color: T.text, fontSize: 13, fontFamily: "'Inter', sans-serif" };
