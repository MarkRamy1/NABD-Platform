# NABD Deployment Guide

Live site: **https://markramy1.github.io/NABD-Platform/**

---

## GitHub Pages (recommended)

The repo uses **GitHub Actions** (`.github/workflows/pages.yml`) to deploy static files from the repository root.

### One-time setup

1. Open **Settings → Pages**
2. Under **Build and deployment**, set **Source** to **GitHub Actions**
3. (Optional) **Settings → Secrets and variables → Actions** — add:
   - `GOOGLE_CLIENT_ID` — OAuth 2.0 Web client ID
   - `GOOGLE_API_KEY` — API key restricted to Calendar API + your domain

   If secrets are missing, the site still deploys; Google Calendar sync is disabled until they are set.

4. Push to `main` — the workflow bundles the app and deploys automatically

### What gets deployed

```
index.html, script.js, style.css, bootstrap.*, i18n.js,
hospital-names.js, mockReviews.js, google-calendar-*.js,
Hospitals_Greater_Cairo_Region.csv, Favicon_Nabd.jpeg,
hospital.png, locales/
```

### Verify after deploy

- [ ] Hospitals load on **Ratings** tab
- [ ] EN / AR language switch works
- [ ] Register form shows **Phone Number** / **رقم الهاتف** placeholder
- [ ] Appointment booking saves locally
- [ ] (With secrets) Google Calendar consent + event creation works

---

## Local development

```bash
git clone https://github.com/MarkRamy1/NABD-Platform.git
cd NABD-Platform
cp google-calendar-config.example.js google-calendar-config.js
# Edit google-calendar-config.js (gitignored)
python -m http.server 8000
```

Open http://localhost:8000

---

## Netlify (alternative)

| Setting | Value |
|---------|--------|
| Build command | *(empty)* |
| Publish directory | `.` (repo root) |

Add `google-calendar-config.js` locally (not committed) or inject via Netlify environment at build time.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Blank Ratings page | Check Network tab for CSV 404; ensure `Hospitals_Greater_Cairo_Region.csv` is deployed |
| `auth.phone` as placeholder | Update `locales/*/common.json` and redeploy |
| Calendar sync fails | Add GitHub secrets; add `https://markramy1.github.io` to OAuth authorized origins |
| Pages not updating | Confirm Pages source is **GitHub Actions**, not “Deploy from branch” |
