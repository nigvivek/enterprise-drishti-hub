# Enabling Google Sign-In

By default, the "Sign in with Google" button on the auth screen renders disabled with a setup hint. Email and guest sign-in work regardless — this is optional.

## 1. Create an OAuth Client ID
1. Go to https://console.cloud.google.com/apis/credentials (create/select a project first if you don't have one).
2. **Create Credentials** → **OAuth client ID**.
3. Application type: **Web application**.
4. Under **Authorized JavaScript origins**, add every origin this app is actually served from — for example:
   - `http://localhost:5173` (local dev)
   - `https://enterprise-drishti-hub.er-<yourname>.workers.dev` (Cloudflare Workers default)
   - `https://www.enterprise-drishti-hub.com` (your custom domain, if used)
5. You do **not** need a redirect URI for this flow (it uses Google Identity Services' popup/One Tap flow, not a redirect-based OAuth flow).
6. Save, then copy the generated **Client ID** (ends in `.apps.googleusercontent.com`).

## 2. Configure it in the project
Open `src/googleConfig.js` and paste it in:
```js
export const GOOGLE_CLIENT_ID = "123456789-abc123.apps.googleusercontent.com";
```

## 3. Rebuild and redeploy
```bash
npm run build
git add src/googleConfig.js
git commit -m "Configure Google Sign-In client ID"
git push
```

## What this integration does and doesn't do
- It renders Google's real sign-in button and receives a real signed JWT credential back from Google.
- It decodes that JWT **client-side, without verifying the signature** — enough to read a name/email for display and to key local storage by, not enough to prove identity to a server. There is no server here to verify it against.
- If you build the real backend described in `architecture.md`, that backend should verify the token's signature against Google's public keys before trusting it for anything sensitive — this frontend-only version is not that.
