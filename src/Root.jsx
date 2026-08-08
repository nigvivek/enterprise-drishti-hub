import React, { useState } from "react";
import LandingPage from "./Landing.jsx";
import AuthScreen from "./Auth.jsx";
import Workspace from "./Workspace.jsx";
import EnterpriseDrishtiHub from "./App.jsx";
import { getCurrentUserEmail } from "./store.js";

export default function Root() {
  const [view, setView] = useState("landing"); // landing | auth | workspace | dashboard
  const [currentEmail, setCurrentEmail] = useState(() => getCurrentUserEmail());
  const [enabledModuleIds, setEnabledModuleIds] = useState(null);

  const goLaunch = () => {
    // "Launch Dashboard" always routes through the signed-in workspace first —
    // sign in if needed, otherwise straight to the workspace.
    setView(currentEmail ? "workspace" : "auth");
  };

  if (view === "auth") {
    return (
      <AuthScreen
        onSignedIn={(email) => { setCurrentEmail(email); setView("workspace"); }}
        onBackToSite={() => setView("landing")}
      />
    );
  }

  if (view === "workspace" && currentEmail) {
    return (
      <Workspace
        email={currentEmail}
        onLaunchDashboard={(moduleIds) => { setEnabledModuleIds(moduleIds); setView("dashboard"); }}
        onSignedOut={() => { setCurrentEmail(null); setView("landing"); }}
        onBackToSite={() => setView("landing")}
      />
    );
  }

  if (view === "dashboard") {
    return <EnterpriseDrishtiHub enabledModuleIds={enabledModuleIds} onBack={() => setView("workspace")} />;
  }

  return <LandingPage onLaunch={goLaunch} />;
}
