# Enterprise Drishti Hub (EDH) — Deployment Guide

This is currently a **static frontend prototype** — mock data, no backend, no auth. That's fine for demos and stakeholder review, but before this touches real compliance/security data it needs the backend, auth, and RBAC layers described in `architecture.md`. Everything below is about getting *this UI* running and reachable; treat internet exposure as "demo access," not "production compliance system."

---

## 1. Run it on your local machine

**Requirements:** Node.js 20+ (check with `node -v`).

```bash
cd sentinel-grc-app
npm install
npm run dev
```

Open **http://localhost:5173**. Hot-reloads on save.

To view it from your phone or another device on the same Wi-Fi, `vite.config.js` is already set to bind `0.0.0.0`, so use your machine's LAN IP instead: `http://<your-local-ip>:5173` (find it with `ipconfig getifaddr en0` on Mac, `hostname -I` on Linux, or `ipconfig` on Windows).

---

## 2. Run it via Docker (recommended — same artifact everywhere)

**Requirements:** Docker Desktop (or Docker Engine on Linux).

```bash
cd sentinel-grc-app
docker compose up --build
```

Open **http://localhost:8080**. This builds the production bundle and serves it with nginx — the exact same container you'd run on a server. `docker compose up -d` runs it in the background; `docker compose down` stops it.

---

## 3. Put it on the internet

You have three real options, roughly in order of effort vs. control. Given the "self-hosted" direction of this whole product, **3B is the one to grow into** — but 3A is the fastest way to show someone a link today.

### 3A. Fastest — free static hosts (good for demos, not for self-hosted data)
Vercel or Netlify will build and host the static bundle for free in a few minutes:

```bash
npm i -g vercel
cd sentinel-grc-app
vercel
```
or drag-and-drop the `dist/` folder (after `npm run build`) into netlify.com/drop.

Caveat: once this app has a real backend with actual compliance/security data, you don't want that data flowing through a third-party host — that's the point of everything in `architecture.md`. Use this path only for the current mock-data prototype.

### 3B. Self-hosted on a server you control (matches the product's actual design goal)

Any small VPS (Hetzner, DigitalOcean, a spare on-prem box) works. Steps:

1. **Get a server + point a domain at it** — an A record for `edh.yourdomain.com` → the server's IP.
2. **Install Docker** on the server (`curl -fsSL https://get.docker.com | sh`).
3. **Copy this project to the server** (`scp -r sentinel-grc-app user@your-server:~/` or `git clone` if you push it to a repo).
4. **Put a reverse proxy in front for automatic HTTPS.** Caddy is the simplest — it gets a Let's Encrypt certificate automatically. Add this `Caddyfile` next to `docker-compose.yml`:

   ```
   edh.yourdomain.com {
       reverse_proxy localhost:8080
   }
   ```

   Then run Caddy alongside the app:
   ```bash
   docker run -d --name caddy --network host \
     -v $PWD/Caddyfile:/etc/caddy/Caddyfile \
     -v caddy_data:/data \
     caddy:2-alpine
   docker compose up -d --build
   ```
   Now `https://edh.yourdomain.com` serves the dashboard with a valid cert, auto-renewed.
5. **Lock it down before sharing the link.** At minimum, put it behind basic auth or a VPN/WireGuard until the real auth layer (module governance section of `architecture.md`) exists — right now anyone with the URL sees everything.

### 3C. No server, no port-forwarding — Cloudflare Tunnel
If you want to expose the copy running on your *local machine* without renting a server or opening router ports:

```bash
docker compose up -d          # dashboard running on localhost:8080
brew install cloudflared      # or the Linux/Windows equivalent
cloudflared tunnel --url http://localhost:8080
```

This prints a public `https://*.trycloudflare.com` URL that tunnels straight to your laptop. Good for a quick share link; the tunnel dies when you close the terminal. For something durable, `cloudflared` also supports named, persistent tunnels tied to your own domain.

---

## Where this needs to go next

This static bundle is step one. To make it a real (self-hosted) product per `architecture.md`:
- Stand up the Postgres + API layer and swap the mock arrays in `src/App.jsx` for real fetch calls.
- Put it behind your IdP (SSO/SAML) — the dashboard should never be reachable without auth once real data is behind it.
- Deploy via the Kubernetes/Helm approach in the architecture doc once you're past single-container prototyping — Section 5 has the full self-hosted stack.
