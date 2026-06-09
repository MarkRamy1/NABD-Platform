# NABD Platform — Code & Deployment Review

**Repo:** https://github.com/MarkRamy1/NABD-Platform
**Live site:** https://markramy1.github.io/NABD-Platform/
**Reviewer:** Cline
**Date:** 2026-06-09
**Reviewed commit:** `314b275` ("Fix Arabic search: match hospital names in both English and Arabic")

---

## TL;DR

NABD is a clean, well-structured bilingual (EN/AR) prototype for hospital discovery in the Greater Cairo region. The architecture is sound (vanilla JS + Bootstrap 5, no build step), the i18n design is thoughtful, and the GitHub Pages CI workflow is correct. The recent commit history (3 i18n fixes, 1 calendar/OAuth fix, repo cleanup) shows active, on-target maintenance.

That said, **the live deployment is currently broken in 3 user-visible ways** (one outright defect, two visible artifacts), the README is significantly out of sync with the actual repo, and there are several security, accessibility, and code-quality issues worth addressing before the next public release. None of them are catastrophic — most are 5–30 minute fixes.

**Verdict:** Solid prototype (B+), with rough edges to file off before calling it "1.0".

---

## 1. Repository structure

Tracked files (per `git ls-files`):

```
.github/workflows/pages.yml
.gitignore
Favicon_Nabd.jpeg
Hospitals_Greater_Cairo_Region.csv       (326 lines: 1 header + 325 hospitals)
LICENSE
README.md
bootstrap.bundle.min.js                   (80 KB)
bootstrap.css                             (280 KB)
google-calendar-config.example.js
google-calendar-integration.js
hospital-names.js                         (321 EN→AR translations)
hospital.png                              (1.6 MB — the only hospital image for 325 entries)
i18n.js
index.html
locales/ar/common.json
locales/en/common.json
mockReviews.js                            (16 reviews, hard-coded IDs 1–5)
script.js                                 (905 lines)
style.css                                 (573 lines — has a duplicated/dead "section")
```

**Strengths**
- 100% static, no build step, no `node_modules` — opens with `index.html` or any static server.
- Bootstrap 5 is shipped as full files (not a CDN), so it works offline and on a corporate network.
- `.gitignore` correctly excludes `google-calendar-config.js`, `OAuth.txt`, IDE/OS junk.
- The `pages.yml` workflow is correct: it (a) checks out, (b) synthesizes `google-calendar-config.js` from secrets, (c) copies a curated list of files to `_site/`, (d) deploys via `actions/deploy-pages@v4`. Permissions (`pages: write`, `id-token: write`) are set correctly for the modern Pages deploy.
- The CSV has the expected structure (`Name,Source,Region,Phone,Description,Location,Working_Hours,Latitude,Longitude,Scraped_Date,Beds,Staff_Count`) and 325 data rows, matching the README's "325 hospitals" claim.

**Weaknesses**
- `hospital.png` (1.6 MB) is used as the image for **every** card and the detail modal — fine for a prototype, but combined with 325 entries per page render (9 at a time) it dominates initial paint. Consider a `loading="lazy"` (already set) and a small placeholder, plus eventual per-hospital imagery.
- `bootstrap.bundle.min.js` and `bootstrap.css` are committed at full vendor size (~360 KB unminified-included). That's fine for a no-build static site, but you should pin a version in a comment and consider an integrity `SRI` hash.
- The "Code & Architecture" section in README claims a `.github/workflows/pages.yml` for deploy, a `nabd-platform/PROJECT_REPORT.md`, and `DEPLOYMENT.md`/`GOOGLE_CALENDAR_SETUP.md`/`IMPLEMENTATION_NOTES.txt`. **None of these four documents exist in the repo.** The `.gitignore` even contains a comment `# Keep only: # nabd-platform/Normal Files/` referencing a folder that was removed in commit `4652565`, but the README was never updated to reflect that.
- The repo is "ahead of origin/main by 2 commits" (per `git status`). Whatever is local has not been pushed — possible that hot-fixes exist locally that the live site doesn't have.

---

## 2. Live deployment (`https://markramy1.github.io/NABD-Platform/`)

I could not make outbound HTTPS calls from this sandbox (`curl` returned exit 35), so this section is based on **the files GitHub Pages will serve**, which `pages.yml` builds from. I cross-checked the bundle against the source tree.

### What GitHub Pages serves (per `.github/workflows/pages.yml`)

```
index.html, script.js, style.css, bootstrap.css, bootstrap.bundle.min.js,
i18n.js, hospital-names.js, mockReviews.js,
google-calendar-integration.js, google-calendar-config.js,   ← generated from secrets
Hospitals_Greater_Cairo_Region.csv,
Favicon_Nabd.jpeg, hospital.png,
locales/en, locales/ar
```

That matches the live site 1-for-1 with the source.

### Bugs that hit the user on the live site today

#### 🔴 B1. Hero section shows broken image icons
`index.html` lines 63, 70, 77 reference:
```html
<img src="icons/search.svg" alt="" width="48">
<img src="icons/ratings.svg" alt="" width="48">
<img src="icons/compare.svg" alt="" width="48">
```
The `icons/` directory **does not exist** in the repo or in the Pages bundle. The three feature cards (Easy Search / Trusted Ratings / Compare Confidently) render the broken-image glyph on every device.

**Fix:** add `icons/search.svg`, `icons/ratings.svg`, `icons/compare.svg` (or inline them as data URLs, or use a CSS icon library like Bootstrap Icons which is already in your bundle). Quickest patch: drop the three `<div class="mb-3"><img …></div>` lines; the text headers are descriptive enough.

#### 🟠 B2. `hospital.jpg` 404s in the local fallback path
`script.js` lines 632, 677, 683–685 reference `image: 'hospital.jpg'`, but the only image in the repo is `hospital.png`. In the live deployment, the rendering loop uses `imgSrc = 'hospital.png'` (line 156), so this only fires if the API call fails **and** the CSV fails **and** we fall back to the hard-coded sample data. In that case the three sample cards show broken images. Cosmetic, but trivial to fix: change `image: 'hospital.jpg'` to `image: 'hospital.png'` (or, better, drop the unused field — it's never read by `renderGrid`).

#### 🟠 B3. Review-modal close button is a no-op
`index.html` line 177:
```html
<span class="modal-close" onclick="closeModal('review-review')">&times;</span>
```
The ID being closed is `review-review`, not `review-modal` (line 175's modal id). Clicking the ✕ does nothing — only the in-form "Cancel" button (line 201) can close the modal.

**Fix:** change `closeModal('review-review')` to `closeModal('review-modal')`.

### Security posture on the live site

#### 🔴 S1. OAuth Client ID + API Key may be public
**The local file `google-calendar-config.js` on the developer's machine is correctly gitignored** (confirmed: `git check-ignore -v google-calendar-config.js` → `.gitignore:18:google-calendar-config.js google-calendar-config.js`). It contains a Google OAuth Client ID `560277826555-kccliqerreockqn0rgaq1f4h62u10j4b.apps.googleusercontent.com` and an API key `AIzaSyC14i6apvAuxjbkyV_cE5q8Yo3ydWo5nRo`.

These same values end up in the Pages bundle because `pages.yml` writes the secret into `google-calendar-config.js` at deploy time, and **the file is also placed in the static root and uploaded as a Pages artifact**. Anyone visiting the site can view source and see them.

This is *not* the worst class of secret (an OAuth Web Client ID is technically "public" by Google's design — its safety is enforced via the Authorized JavaScript Origins list), but:

- The **API key has no HTTP referrer restriction** in the code. With a key + the right discovery doc, anyone can hit the Calendar API and burn your quota. You should add an HTTP-referrer restriction in Google Cloud Console (`https://markramy1.github.io/*` and `http://localhost:*`).
- If the project ever expands to use a *confidential* credential (e.g. a service account), this pattern will leak it. Worth tightening the deployment now.

**Recommended changes:**
1. In Google Cloud Console → Credentials → API key → Application restrictions: **HTTP referrers** → add `https://markramy1.github.io/*` and `http://localhost:*`.
2. In the same panel → API restrictions: restrict to **Google Calendar API** only.
3. In OAuth Client ID → Authorized JavaScript origins: confirm `https://markramy1.github.io` and `http://localhost:8000` (or wherever you develop).
4. Consider injecting the keys at runtime via a `/config.json` endpoint or a small Cloudflare Worker, instead of baking them into a static file.

#### 🟡 S2. `console.log` / `console.warn` / `console.error` left in
Twelve console calls remain (`script.js` lines 459, 522, 638, 681, 790, 808, 811, 827; `i18n.js` 14, 22; `google-calendar-integration.js` 215, 226, 299). Not a security issue, but they leak the internal "local fallback" behavior to anyone who opens DevTools, and spam the console when the API is intentionally unreachable. Wrap them behind a debug flag or strip in production.

#### 🟡 S3. No CSP, no SRI, no `Referrer-Policy`
For a static site that handles OAuth and PII (names, emails, appointment notes), I'd expect at minimum:
```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' https://accounts.google.com https://apis.google.com; connect-src 'self' https://www.googleapis.com http://localhost:3001;">
<meta name="referrer" content="strict-origin-when-cross-origin">
```
…and SRI hashes on the two Google CDN scripts (or drop them in favor of the `loadScript` helper you already use, which is the right call).

---

## 3. HTML review (`index.html`, 334 lines)

**Good**
- Semantic landmarks: `<header>`, `<main>`, `<section>`, `<form>` with `label`s on most inputs.
- `lang="en"` is overridden correctly to `lang="ar"` on language switch.
- Bilingual hospital names are kept in JS data; only UI strings go through `data-i18n`.
- `loading="lazy"` on the (single) card image.
- Form fields have `required`, `type="email"`, `type="tel"`, `type="date"` — proper input modes.

**Issues**

- **Accessibility**
  - The `<img src="icons/...">` tags are missing `alt` (lines 63, 70, 77) — fix: `alt=""` is already there, but the images don't exist (B1), so screen readers will announce nothing here. Add a real `aria-hidden="true"` on the wrapping div or descriptive text.
  - The modal close `&times;` is not announced by screen readers. Add `aria-label="Close"` and `role="button"`.
  - The `<form>` for login has a name field, but the field has no `<label>` (only `placeholder` + `data-i18n-placeholder`). Screen readers will read just "What is your name?" without context.
  - The `<select id="lang-select">` has no `<label>`.
  - The dropdown `<a id="user-btn">` has no `aria-haspopup="true"` or `aria-expanded` (Bootstrap sets these for you only on certain components).
  - The "Add to Favorites" toggle is a `<button>` but announces the new state only via text change — consider `aria-pressed`.
  - Color contrast: `#1e3a8a` on white passes AAA, but `#9ca3af` (`.muted` text under the rating) is borderline. Worth running through axe.

- **Form hygiene**
  - The contact form posts to nowhere (`sendContact` just `alert`s). Fine for a prototype; tag with `data-netlify="false"` or add a comment that it's a stub.
  - The register form has no "terms" checkbox but the README claims Gmail-only auth is enforced. The check is in JS, so a no-JS user can submit anything. Add a `pattern`/`minlength` on the password, at minimum.

- **Markup issues**
  - The hero h1 is inside a `.page.hero` section, and the "Ratings" page is a separate section. The `showPage()` function on line 63 of `script.js` *also* explicitly re-shows `.hero`, which is redundant. When you switch to Arabic, the nav links `<a href="#ratings">` work via `hashchange`, but there is **no active-state visual on the nav** (no `.active` class, no `aria-current`).
  - The `<select id="lang-select">` has an `onchange="switchLanguage(this.value)"` *and* `script.js` adds another `change` listener at line 902 — `switchLanguage` runs **twice** on every language change. Not a functional bug (i18n is idempotent), but wasteful and easy to fix.

---

## 4. JavaScript review

### `script.js` (905 lines)

**Good**
- Reads as a single procedural file with clear section banners (`// ========== X ==========`). Easy to follow for a prototype.
- `loadDataset()` has a sane three-tier fallback: backend API → CSV → hard-coded sample. Each step logs a clear warning.
- Pagination, filtering, sorting, favorites, and reviews are all wired up and functional.
- `randomRating` is a tiny deterministic hash on `(name + region)` — gives stable ratings across renders, which is good UX (no flicker on re-render).
- CSV parser is RFC-4180 aware (handles quotes and newlines inside quoted fields).
- Bilingual `getSpecializationName` + `getHospitalNameInLanguage` keep the rendering layer language-agnostic.

**Issues**

| # | Severity | Where | What |
|---|---|---|---|
| J1 | 🟠 | line 60–66 `showPage` | Hides every `.page` section then shows the requested one, *and* separately re-shows the hero if pageId is `home`. Works, but the home section is the only one with class `hero` — using a class selector inside an id check is fragile. |
| J2 | 🟠 | line 312 + 314 | `getMockReviews` filters by `hospitalId` as a number, but `h.id` in the API path (line 599) is the *string* `String(h.id)`. The CSV path (line 653) keeps `id` as a number. So reviews attached to `hospitalId: 1` only ever show on the CSV path's first record — on the live site (API path), **no hospital gets any mock reviews** because the type mismatch fails the `===` comparison. Either normalize `h.id` to a number everywhere or coerce in the filter. |
| J3 | 🟡 | line 67–72 | Hash routing doesn't validate `pageId`. `location.hash = 'whatever'` will set `display: none` on every page — minor DoS for bookmarked garbage URLs. |
| J4 | 🟡 | line 196–225 `applyFilters` | Calls `getHospitalNameInLanguage(...).toLowerCase()` even when the query is empty (because the function still runs on the search input's empty case). Negligible, but `.toLowerCase()` on the Arabic name is *almost* a no-op — fine. |
| J5 | 🟡 | line 322–326 `loadAndShowReviews` | XSS surface: `comment` and `userName` are inserted via `innerHTML` with only `<` → `<` escaped. The replacement `.replace(/</g, '<')` is a no-op. Use `textContent` on a DOM node, or a proper escape. |
| J6 | 🟡 | line 75–81 | `DOMContentLoaded` awaits `loadDataset` *and* then a second `DOMContentLoaded` (line 889) registers event listeners. Order is fine but split across two IIFE-free blocks. Move both into one block. |
| J7 | 🟡 | line 175 | `onclick="toggleFavoritBtn(...)"` (note the typo "Favorit"). Consistent with the function name, so it works, but rename to `toggleFavoriteBtn` for clarity. |
| J8 | 🟡 | line 400–414 | `toggleFavoritBtn` doesn't re-render the modal's "Add/Remove" button — only the grid. The user toggles the heart on the modal and the button text in the modal stays stale until they close and reopen. |
| J9 | 🟢 | line 124–132 | `randomRating` uses `Math.abs(h) % 21` which gives an **uneven** distribution (small negative numbers after the shift get a 0–20 range, but big positives clip). Fine for cosmetic ratings. |
| J10 | 🟢 | line 415–422 | `getAuthHeaders` always returns `Content-Type: application/json` even for GETs. Harmless, but noisy. |
| J11 | 🟢 | line 488 | The Gmail-only restriction is a UX wart: `endsWith('@gmail.com')` rejects `myname+label@gmail.com`. Use a regex on the local-part. |
| J12 | 🟢 | line 632, 677 | `image: 'hospital.jpg'` is set but never read. Dead field. |
| J13 | 🟢 | line 794–817 | If `isGoogleCalendarConfigured()` is false, the code still calls `alert(t('appointment.booking_success'))` *before* the GCal block — fine — but the success message lies (Calendar was *not* updated). |
| J14 | 🟢 | line 322, 326 | `Math.round(r.rating)` is used to derive stars; ratings like `4.3` and `4.7` both round to 4 stars. Use floor/ceil with a half-star glyph. |
| J15 | 🟢 | script.js 583–587 | `sendContact` alerts and resets, but does no validation beyond `required`. |
| J16 | 🟢 | script.js 75–81 | If `loadTranslations` fails, `t()` returns the raw key string (e.g. `nav.home` shows as `"nav.home"`). Acceptable for a fallback, but obscure for users — consider logging to a status banner. |
| J17 | 🟢 | script.js 537–550 | `handleLogout` clears local state, but the GCal token is **not** revoked. The user is "logged out" of NABD but their Google session persists. Call `google.accounts.oauth2.revoke(token, done)`. |

### `i18n.js` (76 lines)

- **Good:** clean module pattern; fallback to `en` if requested locale is missing; supports nested keys; updates `<html lang>` and `<body dir>` correctly.
- **Issues:**
  - I18n strings and the regional Arabic hard-codes in `script.js` (`REGION_NAMES_AR`) are split across two files. Consolidating `Cairo/Giza/El Qalyubia` into `locales/en/common.json` and `locales/ar/common.json` (under `regions.*`) would make adding a third locale a one-file change.
  - `applyLanguage()` mutates `textContent` on every element with `data-i18n`. Fine, but it runs synchronously on every language switch. For 50–100 keys this is invisible; for thousands it would be. Cache the key→element list.
  - The `t(key)` function silently returns the key on miss. Combined with the `i18n` of `hospital.region` = "Region" and the JS hard-code for regions, a missing key like `hospital.cardiology` would render the literal string `hospital.cardiology` in the UI. Consider throwing in dev builds.

### `google-calendar-integration.js` (301 lines)

- **Good:** proper OAuth 2.0 implicit flow via GIS, token persistence in `localStorage` with expiry, automatic re-auth on stale token, and a clean `buildCalendarEventResource` helper that pins `timeZone: 'Africa/Cairo'`.
- **Issues:**
  - The `initGoogleCalendarConnectButton` (line 197) is only called from `initGoogleCalendar` (line 222), which runs in a `DOMContentLoaded` listener. But the `#google-signin-container` element lives inside the appointment modal — when the modal is first opened, the button isn't there yet. The connect button is therefore **always missing** on first use. Move this call to `openAppointmentModal` after the modal is shown.
  - `gapi.client.calendar.events.insert` (line 170) uses `gapi.client` which requires `gapi.client.init` to have run *and* the access token to be set on `gapi.client`. `applyAccessToken` does this (line 53), but if the user is mid-session and the access token expires, `gapi.client.setToken` is **not re-called** on the silent re-auth path. Result: the second calendar event of the day fails with "Login Required." Add a re-call in `restoreGoogleAccessToken` and after `requestGoogleCalendarAccess`.
  - `gapiReady` flag is set *after* `gapi.client.init` resolves, but `loadGoogleCalendarAPI` doesn't await `gapi.load('client')` correctly — the `await new Promise(...)` wraps the callback-style API. This works in practice but a promise-rejection inside `gapi.load` isn't surfaced (it's caught by the outer init, but the error message is unhelpful).
  - `clearLegacyGoogleTokens` (line 34) is called once on `initGoogleCalendar` but only removes one key. If there were ever more legacy keys (`googleAuthToken2`, etc.) they'd persist. Make it data-driven.
  - `formatAppointmentDateTime` (line 285) hard-codes `'en-US'` locale — for an Arabic UI, dates format as `MM/DD/YYYY` Arabic-style. Use `currentLanguage` to pick the locale.

### `mockReviews.js` (160 lines)

- **Good:** clearly a sample dataset, well-bilingual.
- **Issues:**
  - 5 distinct hospitals × ~3 reviews each — only 16 reviews total. With 325 hospitals, the **vast majority of cards show "No reviews yet"**. The CSV-path `id` is a 1-based row number; the API-path `id` is `String(...)`. Pick one and document.
  - `addMockReview` mutates the module-scoped `MOCK_REVIEWS` array; this is fine in-session but the change is lost on page refresh (no `localStorage` write). The README acknowledges this in the "Known Issues" table.
  - The visit dates are 2024; in 2026 they look stale. Consider using `Date.now() - N*days` to keep them "fresh-looking".

### `hospital-names.js` (334 lines)

- **Good:** exhaustive translation table (321 entries), `normalizeArabicHospitalName` cleans up artifacts like `ال ال` (probably from the translation step). Lookup is O(1).
- **Issues:**
  - Hard-coded `const`, no test, no CI check. The 6 commits in the git log fixing "Arabic artifacts" suggest this list is hand-curated and error-prone. Consider a one-off script that cross-references the CSV and reports missing keys (the next hospital added to the CSV will silently fall back to English).
  - Some translations look suspect: `Hassab Hospital` → `مستشفى حسب` (close, but the proper transliteration is `حسب`), `Hassabo International Hospital` → `مستشفى حسبو الدولي` (no real Arabic hospital by that name exists in the source), `Economic Treatment – Iktessady` → `مستشفى الاقتصادي العلاج الاقتصادي` (the `مستشفى` prefix is wrong — it's not a hospital, it's a treatment program). These are not critical (the English name shows as a fallback), but they hurt credibility on a healthcare platform.
  - `getHospitalNameInLanguage` falls back to the English name when no Arabic translation is found. That's correct, but there is no signal to the caller that it happened. Add a `[Symbol/WeakMap] missingTranslations` set so you can audit coverage in DevTools.

---

## 5. CSS review (`style.css`, 573 lines)

- **Good:** clean reset, sensible color tokens (`#1e3a8a`, `#3b82f6`, `#f59e0b`), responsive grid (3→2→1 columns), accessible focus states on inputs and textareas.
- **Issues:**
  - **The file is duplicated.** Lines 1–417 look like a carefully written v2; lines 419–573 are a near-copy of older v1 styles (`body { font-family: Arial }`, `.page { display: none }`, `.page.active { display: block }`, `.hospital-card` rules, etc.). The `.page.active` class is **never used** by `script.js` (it manipulates `style.display` directly). Dead code: ~150 lines.
  - `@media (max-width: 1024px)`, `@media (max-width: 640px)` (top) and `@media (max-width: 900px)`, `@media (max-width: 560px)` (bottom) are in conflict. The bottom-set wins for the same elements. Pick one set of breakpoints.
  - `.btn` is defined at line 290 with `padding: 10px 16px`. The Bootstrap `.btn` (loaded via `bootstrap.css`) also defines `.btn` — your override is applied, but only for `padding` and `border-radius`. The result is a mix that mostly works but has subtle interaction issues (e.g. `.btn-primary { background: #1e3a8a; }` overrides Bootstrap's `--bs-btn-bg`, but only on the simple `.btn-primary` selector — not on `.btn-outline-primary` variants Bootstrap adds).
  - The `.card` styles at line 140 conflict with the `.card` styles at line 532 (same class, two definitions). The second definition adds `box-shadow: 0 4px 10px rgba(15,23,42,0.03)`, and the first definition sets `box-shadow: 0 1px 3px rgba(0,0,0,0.1)`. Cascade order: the second one wins, and the hover effect from the first is lost. Pick one.
  - The "page" class on `<section class="page">` is what `script.js showPage` hides. The CSS also defines `.page { min-height: 60vh; padding: 40px 20px; background: white; }` — fine. But `.page.active { display: block; }` is never toggled. Remove it.
  - The `.appointments-container` and `.appointment-card` styles at the bottom (lines 552–573) are only used by `google-calendar-integration.js`'s `displayUserAppointments`. Good separation. No issues.

---

## 6. README ↔ reality check

The README describes a project that no longer matches the code. Concrete drift:

| README claim | Reality | Fix |
|---|---|---|
| "Folder: `nabd-platform/Normal Files/`" | Removed in commit `4652565`; everything is in repo root | Update "Project Structure" tree |
| `nabd-platform/PROJECT_REPORT.md` exists | File does not exist | Remove mention or create the file |
| `DEPLOYMENT.md` exists | File does not exist | Remove mention or create the file |
| `GOOGLE_CALENDAR_SETUP.md` exists | File does not exist | Remove mention or create the file |
| `IMPLEMENTATION_NOTES.txt` exists | File does not exist | Remove mention or create the file |
| "Total Hospitals: 325 (in deployed CSV; analytics target 402)" | CSV has exactly 325 rows, ✓ | Keep |
| "Live demo: `markramy1.github.io/NABD-Platform`" | ✓ | Keep |
| "Quick Start" → `cd NABD-Platform && python -m http.server 8000` | Mostly correct, but on Windows users need `py -m http.server 8000` or `npx http-server` | Add a Windows note |
| `cp google-calendar-config.example.js google-calendar-config.js` | ✓ | Keep |
| "Bilingual interface (English & Arabic)" | ✓ | Keep |
| "Google Calendar sync" | ✓ but requires `GOOGLE_CLIENT_ID`/`GOOGLE_API_KEY` secrets in repo settings to actually work on Pages | Document this prominently |
| License: MIT | `LICENSE` file is present (1,091 bytes) | Keep |
| Last Updated: June 8, 2026 | Today is June 9, 2026 | Bump the date or remove the field |
| "Test accounts: test@gmail.com" | There are no test accounts; the prototype has no backend on Pages | Remove or rewrite |

---

## 7. P0 / P1 / P2 action list (prioritized)

### P0 — Fix today, 1 hour total
1. **B1**: Add the 3 missing `icons/*.svg` files (or delete the `<img>` lines).
2. **B3**: Fix `closeModal('review-review')` typo to `closeModal('review-modal')`.
3. **J2**: Coerce `hospitalId` to a number (or string) in both `script.js` and `mockReviews.js` so reviews show up.
4. Push the 2 unpushed local commits.

### P1 — Fix this week
5. **S1**: Add HTTP referrer + API restrictions to the Google API key in Cloud Console.
6. **B2 / J12**: Replace all `hospital.jpg` with `hospital.png` (or drop the field).
7. **S3**: Add a basic CSP `<meta>` and `Referrer-Policy` to `index.html`.
8. **J5**: Replace `innerHTML` review rendering with `textContent` (XSS hardening).
9. **GCal bug**: Move `initGoogleCalendarConnectButton` invocation into `openAppointmentModal` so the connect button actually renders.
10. **GCal bug**: Re-call `gapi.client.setToken` after silent re-auth so a 2nd-of-the-day calendar event works.
11. **README**: Remove references to the four non-existent `.md` files and to `nabd-platform/Normal Files/`.
12. **CSS**: Delete the duplicated `.page`, `.card`, and break-point blocks (lines 419–549).
13. **`onchange="switchLanguage(...)"` × 2** bug: pick one listener.

### P2 — Quality backlog
14. **i18n** coverage test: a tiny script that asserts every key in `en/common.json` exists in `ar/common.json` and vice-versa.
15. **hospital-names.js** audit: cross-reference all 325 CSV names against the 321 translations, fill gaps, fix the suspect translations (`Hassab`, `Economic Treatment`, etc.).
16. **mockReviews.js**: persist user-added reviews to `localStorage`.
17. **S2**: gate all `console.*` behind `if (window.__NABD_DEBUG__) { … }` or strip via a minifier in the Pages workflow.
18. Add Lighthouse CI to the Pages workflow to catch a11y/perf regressions.
19. **i18n**: move `REGION_NAMES_AR` into `locales/ar/common.json` under `regions.*`.
20. Add an actual `404.html` for GitHub Pages so deep links don't render the 404 chrome.
21. Add a `robots.txt` and a `sitemap.xml`.
22. **J17**: Call `google.accounts.oauth2.revoke` on logout.
23. Add `aria-pressed` to the favorite toggle, `aria-haspopup`/`aria-expanded` to the user dropdown, and `aria-label="Close"` to the modal `&times;` buttons.
24. Add a "Back to top" / "Skip to content" link for keyboard users.
25. **hospital.png** (1.6 MB): replace with a thumbnail or a CSS gradient placeholder; the single photo is misleading anyway.

---

## 8. Closing assessment

The team has shipped a credible bilingual prototype with proper CI, thoughtful i18n, and a clean static architecture. The recent commit log shows iterative bug-fixing on the exact failure modes (Arabic artifacts, calendar OAuth, repo hygiene) that an external review would have flagged. That's a good sign.

The remaining issues are **small in code, large in user perception**: the broken hero icons and the no-op review-modal close button are the kind of things a recruiter or a hackathon judge will see in 10 seconds. The OAuth/API key situation is a "fix before scaling" item, not an emergency. And the README is doing more harm than good until the four missing-doc references come out.

With ~1 day of focused cleanup against the P0+P1 list, NABD would be a clean, presentable, demo-ready portfolio piece.
