import { useEffect, useRef } from "react";
import { touchActivity, isSessionExpired, SESSION_TIMEOUT_MS } from "./store.js";

/**
 * Tracks user activity (mouse, keyboard, scroll, touch) and calls onTimeout
 * once 20 minutes pass with none of it — regardless of which screen is
 * active (landing, auth, workspace, dashboard). Checks every 15s rather
 * than relying on a single long-lived timer, so it survives the tab being
 * backgrounded/throttled by the browser.
 */
export function useSessionTimeout(active, onTimeout) {
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  useEffect(() => {
    if (!active) return;

    touchActivity(); // mark activity the moment a session starts being tracked

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    let throttle = false;
    const markActive = () => {
      if (throttle) return;
      throttle = true;
      setTimeout(() => { throttle = false; }, 5000); // update at most once per 5s
      touchActivity();
    };
    events.forEach((e) => window.addEventListener(e, markActive, { passive: true }));

    const interval = setInterval(() => {
      if (isSessionExpired()) onTimeoutRef.current();
    }, 15000);

    return () => {
      events.forEach((e) => window.removeEventListener(e, markActive));
      clearInterval(interval);
    };
  }, [active]);
}

export { SESSION_TIMEOUT_MS };
