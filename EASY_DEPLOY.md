# Easy Deployment — Enterprise Drishti Hub

The simplest path to a live public URL, no server to manage. Five steps, ~10 minutes.

## 1. Unzip the project
Extract `enterprise-drishti-hub-app.zip` anywhere on your machine.

## 2. Push it to GitHub
```bash
cd enterprise-drishti-hub-app
git init
git add .
git commit -m "Enterprise Drishti Hub"
```
Create an empty repo at github.com/new (don't add a README/license there), then:
```bash
git remote add origin https://github.com/<your-username>/enterprise-drishti-hub.git
git push -u origin main
```

> **Getting `error: src refspec main does not match any`?** Your local branch isn't actually named `main` — older versions of Git default to `master` instead. Check what you're on:
> ```bash
> git branch
> ```
> If it shows `master` (not `main`), rename it and push again:
> ```bash
> git branch -M main
> git push -u origin main
> ```
> If `git branch` shows nothing at all, `git commit` never actually succeeded earlier — commonly because Git asked for your identity first (see the `git config --global user.name`/`user.email` step) and the commit silently didn't happen. Run `git commit -m "Enterprise Drishti Hub"` again, confirm it reports a commit was made, then retry the push.

> **Getting `remote: Repository not found` / `fatal: repository '...' not found`?** GitHub is saying that exact URL doesn't exist under your account yet. Almost always one of these:
> 1. **The repo was never actually created on GitHub.** Step 2 assumes you created an empty repo at github.com/new first — if that part got skipped, go create it now (same name as in your `git remote add` command), then retry the push. No need to redo `git init`/`git add`/`git commit`.
> 2. **A typo in the URL** — double check the username and repo name in `git remote add origin ...` exactly match what's shown on the repo's GitHub page. Check what's currently set with:
>    ```bash
>    git remote -v
>    ```
>    If it's wrong, fix it with:
>    ```bash
>    git remote set-url origin https://github.com/<your-username>/<exact-repo-name>.git
>    ```
> 3. **You authenticated as a different GitHub account than the one that owns the repo** — the "complete authentication in your browser" prompt logs you into whatever account you pick there; if you have multiple GitHub accounts, make sure you picked the one the repo actually belongs to.

> **Getting `! [rejected] main -> main (non-fast-forward)`?** This means the GitHub repo already has a commit in it that your local repo doesn't — almost always because the "Add a README file" (or `.gitignore`/license) checkbox was left checked when the repo was created, even though step 2 says to leave it empty. Since this is a brand-new project and there's nothing on GitHub worth keeping, the simplest fix is to overwrite it with what you have locally:
> ```bash
> git push -u origin main --force
> ```
> If the repo actually has something on GitHub you *do* want to keep, pull and merge instead of forcing:
> ```bash
> git pull origin main --allow-unrelated-histories
> git push -u origin main
> ```

## 3. Connect it to Cloudflare Pages
1. Go to the Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Pick the repo you just pushed.
3. Set these two build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Click **Save and Deploy**.

> **Getting `Failed: root directory not found`?** This means the **Root directory** field in build settings has something typed into it (commonly `enterprise-drishti-hub-app`) that doesn't exist in the repo. Following step 2 exactly, `index.html` and `package.json` sit at the **root** of the repo itself — there's no extra subfolder inside it. Fix: go to the Pages project → **Settings** → **Builds & deployments** → **Root directory**, and clear that field so it's blank (or just `/`), then retry the deployment. Only set a root directory here if your repo has this project nested inside a larger folder structure.

> **Getting `The version of Vite used in the project ("5.4.21") cannot be automatically configured. Please update the Vite version to at least "6.0.0"`?** Cloudflare Pages' newer build system requires Vite 6+ to auto-detect the framework. The project now pins Vite 6 in `package.json` — if you downloaded the zip before this fix, update two lines in `package.json`:
> ```json
> "vite": "^6.0.0",
> "@vitejs/plugin-react": "^4.3.4"
> ```
> Then locally, regenerate the lockfile against the new version and push:
> ```bash
> rm -rf node_modules package-lock.json
> npm install
> git add package.json package-lock.json
> git commit -m "Bump Vite to v6 for Cloudflare Pages"
> git push
> ```
> Cloudflare picks up the new push and rebuilds automatically.

## 4. Wait ~1–2 minutes
You'll get a live link automatically: `https://enterprise-drishti-hub.pages.dev`

## 5. (Optional) Put your own domain on it
Pages project → **Custom domains** → **Set up a custom domain** → enter `app.yourdomain.com`. If that domain's DNS is already on Cloudflare, the certificate and routing are set up automatically — usually live within a few minutes.

---

**That's it.** From here on, every `git push` to `main` redeploys automatically — no need to repeat these steps.

## If something goes wrong
The two most common issues, both already covered in detail in `CLOUDFLARE_DEPLOYMENT.md`:
- **Build fails on `/src/main.jsx`** → the `src/` folder didn't actually get pushed to GitHub. Check the repo page for a `src/` folder; if it's missing, run `git add src/ && git commit -m "add src" && git push`.
- **Want to run it on your own server instead of Cloudflare hosting it** → see "Option B — Cloudflare Tunnel" in `CLOUDFLARE_DEPLOYMENT.md`.
