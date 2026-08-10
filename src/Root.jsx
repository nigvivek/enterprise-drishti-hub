import React, { useState, useRef } from "react";
import LandingPage from "./Landing.jsx";
import AuthScreen from "./Auth.jsx";
import Workspace from "./Workspace.jsx";
import EnterpriseDrishtiHub from "./App.jsx";
import ModuleDetail from "./ModuleDetail.jsx";
import { getCurrentUserEmail, isGuest, clearGuestData, signOut } from "./store.js";
import { useSessionTimeout } from "./useSessionTimeout.js";

export default function Root() {
  const [view, setView] = useState("landing"); // landing | auth | workspace | dashboard | moduleDetail
  const [currentEmail, setCurrentEmail] = useState(() => getCurrentUserEmail());
  const [enabledModuleIds, setEnabledModuleIds] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [activeProject, setActiveProject] = useState(null); // { id, name } | null
  const [timeoutNotice, setTimeoutNotice] = useState(false);

  // In-memory only (never localStorage) — lifted to this level so credentials
  // cached during a "Test & connect" in the workspace can still be reused for
  // live re-validation from the dashboard later in the same browser session,
  // without ever being persisted to disk. Cleared on reload, by design.
  const credCache = useRef({});

  const goLaunch = () => {
    setView(currentEmail ? "workspace" : "auth");
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
      />
    );
  }

  if (view === "auth") {
    return (
      <AuthScreen
        timeoutNotice={timeoutNotice}
        onSignedIn={(email) => { setCurrentEmail(email); setTimeoutNotice(false); setView("workspace"); }}
        onBackToSite={() => { setTimeoutNotice(false); setView("landing"); }}
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
        onSelectModule={(m) => { setSelectedModule(m); setView("moduleDetail"); window.scrollTo(0, 0); }}
      />
    </>
  );
}
