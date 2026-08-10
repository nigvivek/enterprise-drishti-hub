import React, { useState, useRef } from "react";
import LandingPage from "./Landing.jsx";
import AuthScreen from "./Auth.jsx";
import Workspace from "./Workspace.jsx";
import EnterpriseDrishtiHub from "./App.jsx";
import ModuleDetail from "./ModuleDetail.jsx";
import ErrorBoundary from "./ErrorBoundary.jsx";
import { getCurrentUserEmail, isGuest, clearGuestData, signOut } from "./store.js";
import { useSessionTimeout } from "./useSessionTimeout.js";

function RootInner() {
  const [view, setView] = useState("landing"); // landing | auth | workspace | dashboard | moduleDetail
  const [currentEmail, setCurrentEmail] = useState(() => getCurrentUserEmail());
  const [enabledModuleIds, setEnabledModuleIds] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [activeProject, setActiveProject] = useState(null); // { id, name } | null
  const [timeoutNotice, setTimeoutNotice] = useState(false);
  const [pendingGateway, setPendingGateway] = useState(false); // true while waiting on auth to complete a Gateway shortcut click

  // In-memory only (never localStorage) — lifted to this level so credentials
  // cached during a "Test & connect" in the workspace can still be reused for
  // live re-validation from the dashboard later in the same browser session,
  // without ever being persisted to disk. Cleared on reload, by design.
  const credCache = useRef({});

  const goLaunch = () => {
    setView(currentEmail ? "workspace" : "auth");
  };

  // "AI Gateway & Cost Governance" is platform infrastructure, not a functional
  // module — this jumps straight to it, skipping the project/connect/select
  // workspace flow entirely, since Gateway doesn't depend on a connected data
  // source the way the functional modules do.
  const goGateway = () => {
    if (!currentEmail) {
      setPendingGateway(true);
      setView("auth");
      return;
    }
    setEnabledModuleIds(["gateway"]);
    setView("dashboard");
  };

  const handleSessionTimeout = () => {
    if (currentEmail && isGuest(currentEmail)) clearGuestData();
    signOut();
    setCurrentEmail(null);
    setActiveProject(null);
    setEnabledModuleIds(null);
    credCache.current = {};
    setView("landing");
    setTimeoutNotice(true);
  };

  // Tracked whenever there's an actual session (signed in or guest) — a
  // signed-out visitor browsing the marketing site doesn't need this running.
  useSessionTimeout(!!currentEmail, handleSessionTimeout);

  if (view === "moduleDetail" && selectedModule) {
    return (
      <ModuleDetail
        moduleDef={selectedModule}
        onBack={() => setView("landing")}
        onLaunch={goLaunch}
        onGoGateway={goGateway}
      />
    );
  }

  if (view === "auth") {
    return (
      <AuthScreen
        timeoutNotice={timeoutNotice}
        onSignedIn={(email) => {
          setCurrentEmail(email);
          setTimeoutNotice(false);
          if (pendingGateway) {
            setPendingGateway(false);
            setEnabledModuleIds(["gateway"]);
            setView("dashboard");
          } else {
            setView("workspace");
          }
        }}
        onBackToSite={() => { setTimeoutNotice(false); setPendingGateway(false); setView("landing"); }}
      />
    );
  }

  if (view === "workspace" && currentEmail) {
    return (
      <Workspace
        email={currentEmail}
        activeProject={activeProject}
        onActiveProjectChange={setActiveProject}
        credCache={credCache}
        onLaunchDashboard={(moduleIds) => { setEnabledModuleIds(moduleIds); setView("dashboard"); }}
        onGoGateway={goGateway}
        onSignedOut={() => { setCurrentEmail(null); setActiveProject(null); credCache.current = {}; setView("landing"); }}
        onBackToSite={() => setView("landing")}
      />
    );
  }

  if (view === "dashboard") {
    return (
      <EnterpriseDrishtiHub
        enabledModuleIds={enabledModuleIds}
        activeProject={activeProject}
        email={currentEmail}
        credCache={credCache}
        onBack={() => setView("workspace")}
        onHome={() => setView("landing")}
      />
    );
  }

  return (
    <>
      {timeoutNotice && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, background: "#C63D2F", color: "#FFFFFF", textAlign: "center", padding: "10px", fontSize: 13, fontFamily: "'Inter', sans-serif", zIndex: 200 }}>
          You were signed out after 20 minutes of inactivity.
          <button onClick={() => setTimeoutNotice(false)} style={{ marginLeft: 14, background: "none", border: "1px solid #FFFFFF", color: "#FFFFFF", borderRadius: 6, padding: "2px 9px", cursor: "pointer", fontSize: 12 }}>Dismiss</button>
        </div>
      )}
      <LandingPage
        onLaunch={goLaunch}
        onGoGateway={goGateway}
        onSelectModule={(m) => { setSelectedModule(m); setView("moduleDetail"); window.scrollTo(0, 0); }}
      />
    </>
  );
}

export default function Root() {
  const [resetKey, setResetKey] = React.useState(0);
  return (
    <ErrorBoundary key={resetKey} onReset={() => setResetKey((k) => k + 1)}>
      <RootInner />
    </ErrorBoundary>
  );
}
