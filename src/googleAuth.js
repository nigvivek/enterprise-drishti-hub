// Loads the Google Identity Services script once, and provides a minimal
// helper to read the name/email out of the returned credential.
//
// NOTE: this decodes the JWT client-side WITHOUT verifying its signature.
// That's fine for reading a display name/email to key local storage by —
// it is NOT proof of identity. Real verification has to happen server-side
// (the backend validates the token against Google's public keys). Do not
// use this as an authorization check for anything sensitive.

let scriptPromise = null;

export function loadGoogleScript() {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve(window.google);
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export function decodeGoogleCredential(credential) {
  try {
    const payload = credential.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const data = JSON.parse(decodeURIComponent(escape(json)));
    return { email: data.email, name: data.name || data.email?.split("@")[0] };
  } catch {
    return null;
  }
}
