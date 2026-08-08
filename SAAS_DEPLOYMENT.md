# Deploying Enterprise Drishti Hub (EDH) as a SaaS Application

## First — a scope note worth reading before you deploy

Everything built so far (the dashboard, the landing page) is a **frontend prototype with mock data and no backend**. Turning it into a real multi-tenant SaaS product — the way you'd have deployed something like DataGuard — involves two separate jobs:

1. **Hosting the current frontend on the internet** — straightforward, covered below.
2. **Making it an actual SaaS product**: multi-tenant data isolation, real authentication, billing, and a real backend (Postgres, the API layer, the AI orchestration service) as described in `architecture.md`. That's the bulk of the work and isn't something any deployment guide can shortcut — it's the Phase 1–2 build described in that doc.

I don't have visibility into how you deployed DataGuard specifically (that context isn't in this conversation) — if you tell me the stack you used there (e.g., AWS + ECS, Vercel, a specific PaaS), I can tailor this to match it exactly rather than default to a generic path. What follows is a solid, widely-used default: **Vercel/Render for the frontend, a managed Postgres, and Stripe for billing** — swap any piece for what DataGuard used if it differs.

---

## Step 1 — Decide your tenancy model (do this before writing any deployment config)

| Model | What it means | When to use it |
|---|---|---|
| **Single-tenant per customer** | Each customer gets their own isolated deployment (own database, sometimes own subdomain or own infra) | Matches EDH's "self-hosted" positioning best — sell it as "we run your private instance" or "you run it, we support it." Common for compliance/security products selling into regulated industries who won't accept shared infra. |
| **Multi-tenant, shared infra, row-level isolation** | One deployment, one database, every table has a `tenant_id`, enforced by Postgres Row-Level Security | Classic SaaS — cheaper to run, faster to iterate, but a harder sell to a customer whose whole reason for buying is "our compliance data must not commingle with anyone else's." |
| **Hybrid** | Multi-tenant for trials/SMB tier, single-tenant (or fully self-hosted, customer-run) for enterprise tier | What most compliance/security SaaS vendors converge on. Worth planning for from day one even if you launch with just one tier. |

Given EDH's whole pitch is "self-hosted, nothing leaves your network," **the hybrid model is the one that doesn't contradict your own product's positioning** — a multi-tenant free/trial tier to get people in the door, and "deploy EDH inside your own VPC" as the actual enterprise offer (which is what all the Kubernetes/Helm material in `architecture.md` Section 5 already gives you).

---

## Step 2 — Frontend hosting (what you can do today, with what exists now)

The current build is a static Vite/React bundle. Fastest path to a public URL:

### Vercel (recommended for the frontend tier)
```bash
npm i -g vercel
cd enterprise-drishti-hub-app
vercel --prod
```
Vercel auto-detects Vite, builds it, and gives you `https://your-project.vercel.app`. Point a custom domain (`app.yourdomain.com`) at it from the Vercel dashboard → Domains — it issues the TLS cert automatically.

### Alternative — your own infrastructure (matches the self-hosted story better)
Use the Dockerfile already in the project:
```bash
docker build -t edh-frontend .
```
Push that image to a container registry (ECR/GCR/ACR/Docker Hub) and run it on any container host — ECS Fargate, Cloud Run, Azure Container Apps, or a plain VPS behind Caddy/nginx (the README already documents the VPS + Caddy path). This is the better long-term choice once you're also running the backend, since frontend and backend end up living in the same infra anyway.

**Either way, this step alone gets you a public marketing/demo site — it does not give you real user accounts, real data, or billing.**

---

## Step 3 — Backend, database, and auth (this is the actual SaaS build)

Per `architecture.md`, stand up:

1. **Postgres** (managed: RDS / Cloud SQL / Azure Database for PostgreSQL, or self-hosted if you're keeping the whole stack in your own infra) — add a `tenant_id` column strategy from day one even if you start single-tenant; retrofitting multi-tenancy later is painful.
2. **API layer** (FastAPI/NestJS per the architecture doc) deployed alongside the frontend — same container host, separate service.
3. **Authentication** — for a SaaS launch, the fastest credible option is an auth provider (Auth0, Clerk, WorkOS, or AWS Cognito) rather than hand-rolling it; WorkOS or a similar provider is worth a specific look since it's built around SSO/SAML, which enterprise compliance buyers will ask for immediately.
4. **The self-hosted LLM serving layer** — this is the one piece that's genuinely awkward in a multi-tenant SaaS: running a GPU inference cluster per tenant is expensive, but a shared inference layer serving multiple tenants' prompts is a step away from the "nothing leaves your environment" pitch, since it's now *your* environment, not theirs. Two honest options:
   - Shared inference cluster, with prompts/embeddings strictly isolated per tenant at the application layer, and this fact stated plainly in your security documentation (this is what most "self-hosted AI" SaaS vendors actually do for their hosted tier).
   - Enterprise tier only gets the fully self-hosted deployment (customer's own GPU, customer's own network) — SaaS tier runs on a smaller/no-LLM feature set or a hosted API model instead. This keeps the two tiers honest about what "self-hosted" actually means in each.

---

## Step 4 — Billing

For a SaaS launch, **Stripe Billing** is the default choice — subscription tiers, usage-based add-ons (e.g., per-connected-cloud-account, per-GB-of-evidence-storage), and a customer portal for self-serve plan changes, without building billing infra yourself. Stripe Checkout + Stripe Customer Portal covers most of this out of the box; you only need to build the webhook handlers that sync subscription status into your own `tenant` table (active/past-due/canceled → feature gating).

---

## Step 5 — Domain, TLS, DNS

- Buy/point your domain (Route 53, Cloudflare, Namecheap — whatever you used for DataGuard is fine here too).
- `app.yourdomain.com` → frontend/API
- `www.yourdomain.com` or bare domain → the marketing landing page (can be the same deployment, different route, as it is now)
- TLS: automatic if you're on Vercel/Cloud Run/similar; automatic via Caddy if you're self-hosting on a VPS (already documented in the project README).

---

## Step 6 — Production hardening checklist before real customer data touches this

- [ ] Row-Level Security (or equivalent hard isolation) verified with an actual cross-tenant access test, not just code review
- [ ] Auth provider configured with MFA available/required for admin roles
- [ ] Rate limiting and WAF in front of the API (Cloudflare, AWS WAF, or your host's equivalent)
- [ ] Secrets (DB creds, API keys, LLM endpoint credentials) in a secrets manager, never in `.env` files committed anywhere
- [ ] Backups configured and **restore-tested** (not just "backups are running" — actually restore one and verify)
- [ ] A real privacy policy and DPA (data processing agreement) — for a compliance product specifically, customers will ask for this before signing, not after
- [ ] SOC 2 / ISO 27001 roadmap started early — selling a compliance product without your own compliance posture is a credibility gap prospects will notice

---

## What I'd need from you to make this specific instead of generic

If you share how DataGuard was actually deployed — cloud provider, whether it was containers/serverless/VMs, which auth and billing providers you used — I can rewrite this as an exact, copy-pasteable runbook matching that stack rather than the general-purpose version above.
