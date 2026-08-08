# Deploying Enterprise Drishti Hub (EDH) via Cloudflare

This covers getting the current build live on a real URL through Cloudflare — the same general path as a Cloudflare Pages + Tunnel deployment. Two ways to do it depending on where you want the app actually running.

---

## Option A — Cloudflare Pages (Cloudflare hosts the build)

Best if you want Cloudflare's global CDN serving the static frontend directly, with zero servers for you to manage. Right choice for the marketing/landing site and demo-tier dashboard as it stands today (static, mock data).

### 1. Push the project to a Git repo
Cloudflare Pages deploys from GitHub or GitLab.
```bash
cd enterprise-drishti-hub-app
git init
git add .
git commit -m "Enterprise Drishti Hub"
```
Create a repo on GitHub (via the website, or `gh repo create`), then:
```bash
git remote add origin https://github.com/<you>/enterprise-drishti-hub.git
git push -u origin main
```

### 2. Connect it in Cloudflare
1. Log into the Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Select the repo you just pushed.
3. Build settings:
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Click **Save and Deploy**. First build takes 1–2 minutes; you'll get a live URL at `https://enterprise-drishti-hub.pages.dev` immediately.

### 3. Point your own domain at it
1. In the Pages project → **Custom domains** → **Set up a custom domain**.
2. Enter `app.yourdomain.com` (or whatever subdomain you want).
3. If your domain's DNS is already on Cloudflare (it needs to be, for this path), Cloudflare adds the CNAME automatically and issues the TLS certificate — usually live within a few minutes. If your domain is registered elsewhere, add it as a site in Cloudflare first (**Add a site** → follow the nameserver-change prompts) before this step.

### 4. Auto-redeploy on every push
This is already wired up by step 2 — every `git push` to `main` triggers a new build and deploy automatically. No extra config needed.

### If the build fails with `Rollup failed to resolve import "/src/main.jsx"`
This means Vite found `index.html` but couldn't find the `src/` folder it points to — the build ran, but `src/` wasn't actually present in what Cloudflare pulled from your repo. In order of likelihood:

1. **`src/` didn't get pushed.** Check the file tree on your repo's GitHub page — you should see `src/main.jsx`, `src/App.jsx`, `src/Landing.jsx`, `src/Root.jsx`, and `src/tokens.js` listed alongside `index.html` and `package.json`. If `src/` is missing entirely, it wasn't committed. Verify locally before pushing:
   ```bash
   git ls-files | grep src/
   ```
   If that returns nothing, add and push it explicitly:
   ```bash
   git add src/
   git commit -m "Add src directory"
   git push
   ```

2. **Wrong build root.** If this project lives inside a larger repo (e.g., `enterprise-drishti-hub-app/` is a subfolder of a bigger monorepo you pushed), Cloudflare needs to know to build from that subfolder. In the Pages project → **Settings** → **Builds & deployments** → **Root directory**, set it to the path of `enterprise-drishti-hub-app/` relative to your repo root. Without this, Cloudflare builds from the repo's actual root and won't find `index.html`/`src/` where it expects them.

3. **Committed `node_modules` bloated the push and something got silently dropped or timed out.** The project didn't ship with a `.gitignore`, so if you ran `git add .` before this was added, `node_modules` (100+ packages) may have been committed too. Add the `.gitignore` now included in this project, remove `node_modules` from git's tracking, and repush:
   ```bash
   git rm -r --cached node_modules dist
   git add .gitignore
   git commit -m "Stop tracking node_modules and dist"
   git push
   ```

After any of the above, trigger a fresh deploy from the Cloudflare Pages dashboard (**Deployments** → **Retry deployment**, or just push again) rather than assuming the next auto-push will pick up the fix — Pages sometimes caches a failed build's dependency install.

---

## Option B — Cloudflare Tunnel (you host it, Cloudflare fronts it)

Best once there's a real backend (Postgres, API, self-hosted LLM inference) — you keep the whole stack, including any regulated data, inside your own infrastructure, and Cloudflare only handles the public-facing routing, TLS, and DDoS protection at the edge. This is the closer match to EDH's actual "self-hosted" positioning, and the more likely path if DataGuard's Cloudflare setup was fronting your own servers rather than Cloudflare-hosted static assets.

### 1. Run the app on your own server
Using the Docker setup already in the project:
```bash
cd enterprise-drishti-hub-app
docker compose up -d --build
```
This serves it on `localhost:8080` on whatever machine/VM/server you're running it on.

> **Getting `docker : The term 'docker' is not recognized...`?** Docker isn't installed, or isn't running, on whatever machine you're on:
> - **If this is your own Windows machine:** install Docker Desktop from docker.com, launch it from the Start menu, and wait for the tray icon to say "Docker Desktop is running" before retrying — installing it doesn't start it. Full walkthrough (including the WSL 2 prompt it may ask for) is in `WINDOWS_INSTALL.md`.
> - **If this is a Linux server/VPS:** Docker likely isn't installed yet. Install it with `curl -fsSL https://get.docker.com | sh`, then log out and back in (or run `newgrp docker`) so your user picks up permission to run it without `sudo`.
> - **If you're on macOS:** same as Windows — Docker Desktop needs to be launched and fully started, not just installed.
>

### 2. Install `cloudflared` on that same server
```bash
# Debian/Ubuntu
curl -L https://pkg.cloudflare.com/cloudflared-stable-linux-amd64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb

# macOS
brew install cloudflared

# Windows
winget install --id Cloudflare.cloudflared
```

### 3. Authenticate and create a named tunnel
```bash
cloudflared tunnel login
cloudflared tunnel create edh-prod
```
This opens a browser to pick which Cloudflare zone (domain) the tunnel is allowed to use, and creates a tunnel credentials file locally.

> **Already have a `cert.pem` from a previous login (e.g., from another machine or an earlier tunnel)?** Skip `cloudflared tunnel login` entirely — just put that file where `cloudflared` expects it, then go straight to `tunnel create`:
> ```bash
> mkdir -p ~/.cloudflared
> cp /path/to/your/cert.pem ~/.cloudflared/cert.pem
> cloudflared tunnel create edh-prod
> ```
> On Windows (PowerShell), the equivalent target is `$env:USERPROFILE\.cloudflared\cert.pem`:
> ```powershell
> mkdir $env:USERPROFILE\.cloudflared -Force
> Copy-Item C:\path\to\your\cert.pem $env:USERPROFILE\.cloudflared\cert.pem
> cloudflared tunnel create edh-prod
> ```
> `cloudflared` only re-prompts for login if it can't find a valid `cert.pem` in that folder — if the copied cert is for the wrong zone/account, `tunnel create` will fail with an auth error and you'll need to run `tunnel login` after all.

### 4. Route a hostname to the tunnel
```bash
cloudflared tunnel route dns edh-prod app.yourdomain.com
```

### 5. Configure and run it
Create `~/.cloudflared/config.yml`:
```yaml
tunnel: edh-prod
credentials-file: /home/<you>/.cloudflared/<tunnel-id>.json

ingress:
  - hostname: app.yourdomain.com
    service: http://localhost:8080
  - service: http_status:404
```
Then:
```bash
cloudflared tunnel run edh-prod
```
`https://app.yourdomain.com` is now live, routed through Cloudflare's edge to your server — with no inbound ports opened on your firewall/router at all, since the tunnel makes an outbound-only connection.

### 6. Run it as a persistent service (so it survives reboots)
```bash
sudo cloudflared service install
sudo systemctl enable --now cloudflared
```

---

## Which one matches what you did with DataGuard?

If DataGuard's Cloudflare setup was **"push code, Cloudflare builds and hosts it"** → that's Option A, and the steps above are close to a direct match already.

If it was **"my own server, Cloudflare just fronts the domain and handles TLS/tunnel"** → that's Option B.

If it was something more specific — Cloudflare Workers, Cloudflare's own KV/D1 for data, Access policies for auth — tell me which pieces and I'll fold those in; those are different enough from either path above that it's worth getting right rather than guessing.

---

## Once real (non-mock) data is involved

Same caveat as before: this gets the current frontend live on a URL. Real user accounts, tenant isolation, and the backend/database/AI layer are the separate, larger build described in `architecture.md` and `SAAS_DEPLOYMENT.md`. Cloudflare Access (part of Cloudflare Zero Trust) is worth knowing about for that stage too — it can sit in front of either deployment option above and require SSO login before anyone reaches the app at all, which is worth turning on the moment this stops being a demo.
