# Enabling Real Testimonial Storage

The "Share your testimonial" form on the landing page is already wired to post directly to the page — no email client opens. Until you complete this one-time setup, it gracefully falls back to showing the placeholder quotes instead (nothing breaks either way).

## 1. Create a KV namespace
```powershell
npx wrangler kv namespace create TESTIMONIALS
```
This prints something like:
```
🌀 Creating namespace with title "enterprise-drishti-hub-TESTIMONIALS"
✨ Success!
Add the following to your configuration file:
{ "kv_namespaces": [ { "binding": "TESTIMONIALS", "id": "a1b2c3d4e5f6..." } ] }
```
Copy that `id` value.

## 2. Add it to `wrangler.jsonc`
Open `wrangler.jsonc` and find the commented-out block near the bottom. Uncomment it and paste in your real id:
```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "enterprise-drishti-hub",
  "main": "worker/index.js",
  "compatibility_date": "2026-08-05",
  "compatibility_flags": ["nodejs_compat"],
  "assets": {
    "directory": "./dist",
    "binding": "ASSETS",
    "not_found_handling": "single-page-application"
  },
  "kv_namespaces": [
    { "binding": "TESTIMONIALS", "id": "a1b2c3d4e5f6..." }
  ]
}
```
**Important:** this must be valid JSON once uncommented — remove the `//` comment lines around it, and make sure there's a comma after the `assets` block, exactly like the example above.

## 3. Deploy
```powershell
git add wrangler.jsonc
git commit -m "Enable testimonial storage"
git push
```

Once live, submissions on the page write directly to this KV namespace and show up immediately for every visitor — no moderation queue exists yet.

## What this does and doesn't protect against
- **Validation**: name required (≤80 chars), testimonial 20–500 characters, title/company ≤100 chars.
- **Rate limiting**: one submission per IP address per 10 minutes.
- **Sanitization**: angle brackets stripped at write time; React also escapes everything on render, so stored content can't inject HTML/scripts.
- **No moderation**: submissions appear on the live page immediately, with no review step and no authentication on the endpoint. That's a deliberate trade-off to match "submitted on the page itself" — but before pointing this at a real public audience, you'll want at least a lightweight moderation step (e.g., a separate `pending` status with an admin-only approval action) rather than relying on rate limiting alone.

## Managing submissions directly
List everything currently stored:
```powershell
npx wrangler kv key list --namespace-id=<your-id>
```
Delete a specific one (e.g., spam or a request to remove a quote):
```powershell
npx wrangler kv key delete "testimonial:172..." --namespace-id=<your-id>
```
