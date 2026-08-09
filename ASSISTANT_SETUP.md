# Enabling the In-App AI Assistant

The chat bubble (bottom-right corner of the workspace and dashboard) is wired up and ready, but needs your own Anthropic API key to actually respond. Until configured, it returns a clear "not configured" message instead of failing silently.

## What it does — and deliberately doesn't do

- Answers questions about EDH's modules and how the workspace works
- Can navigate you around the app (e.g., "take me to the risk analysis module") using a constrained tool call — it can only jump to a fixed list of real screens, nothing else
- **Refuses anything outside EDH's scope** — general knowledge questions, coding help, unrelated topics — by design, via the system prompt in `worker/assistant.js`
- **Cannot** actually connect data sources, run compliance checks, or modify your data — navigation only. If you ask it to "connect AWS for me," it should tell you it can only take you to that screen, not do it for you.

## 1. Get an Anthropic API key
1. Go to https://console.anthropic.com/settings/keys
2. Create a new API key.
3. This uses paid API credits per request — a lightweight chat like this is inexpensive, but it's not free. Check current pricing at https://docs.claude.com before rolling this out broadly.

## 2. Set it as a Cloudflare secret (never commit it to the repo)
```powershell
npx wrangler secret put ANTHROPIC_API_KEY
```
Paste the key when prompted. This stores it encrypted in Cloudflare, not in your source code or `wrangler.jsonc`.

## 3. Redeploy
Secrets take effect on the next deploy:
```powershell
git add .
git commit -m "Trigger redeploy after adding assistant secret"
git push
```
(An empty/trivial commit is enough — the secret itself doesn't need to be in git, and shouldn't be.)

## Keeping the model identifier current
`worker/assistant.js` specifies a model string (`claude-sonnet-5` as of this writing). Anthropic updates model names over time — if the assistant starts returning model-not-found errors, check https://docs.claude.com for the current model identifier and update that one line.

## Cost control
There's currently no per-user rate limiting on this endpoint beyond conversation length (capped at 40 messages per session client-side). Before exposing this to real users at scale, consider adding the same per-IP rate limiting pattern already used for testimonials (`worker/testimonials.js`) to `worker/assistant.js`.
