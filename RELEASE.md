# Releasing Roughboard to Google Play

A practical, ordered checklist to publish Roughboard as a **paid** app on the
Google Play Store. Items marked **[REQUIRED]** will block publishing if skipped.

---

## 0. Pre-submit code state

**Target SDK — already done.** The app targets **API 35** (Android 15) via
Capacitor 7, AGP 8.7.2, Gradle 8.11.1, and JDK 21 — meeting Google Play's current
requirement for new apps. This has been built and verified running on-device
(minSdk 23).

**[REQUIRED] Versioning.** Every upload needs a higher `versionCode`. Bump
`versionCode`/`versionName` in `android/app/build.gradle` for each release.

Recommended (not required): set `minifyEnabled true` in the `release` block to
shrink the app, then re-test export/share and drawing before shipping.

---

## 1. Developer account & payments

1. **[REQUIRED]** Create a Google Play **Developer account** ($25 one-time) at
   <https://play.google.com/console>. A personal account is fine.
2. **[REQUIRED for paid apps]** Set up a **payments/merchant profile**
   (Settings → Payments) with your bank + tax details, so you can receive money.
   Google's service fee is **15%** on the first $1M/year, 30% above.

---

## 2. Signing (mostly done)

- This repo already creates a release key and signs via `android/keystore.properties`.
- **[REQUIRED] Opt in to Play App Signing** (the default for new apps): you upload
  with your *upload key* (the one here) and Google manages the final app signing
  key. **Back up `roughboard-release.keystore` and its passwords** — losing the
  upload key means you can't publish updates.

Build the upload artifact:

```bash
cd android && ./gradlew bundleRelease
# -> android/app/build/outputs/bundle/release/app-release.aab   (upload THIS)
```

Play requires an **`.aab`** (App Bundle), not an APK.

---

## 3. Create the app & store listing

In Play Console → **Create app**:

- App name: **Roughboard**  ·  Default language  ·  App (not game)  ·  **Paid**.
- **[REQUIRED] Store listing:**
  - Short description (≤80 chars), full description (≤4000 chars). Describe it as
    an offline hand-drawn whiteboard. You may factually mention it's *built on the
    open-source Excalidraw editor* — but do **not** use "Excalidraw" as the app
    title or use its logo (trademark). Keep the non-affiliation framing.
  - **App icon** 512×512 (use `docs/playstore-icon-512.png`).
  - **Feature graphic** 1024×500.
  - **Screenshots**: at least 2 phone; add 7"/10" tablet screenshots (the app is
    great on tablets — this also unlocks the tablet/Chromebook audience).
- **[REQUIRED] Privacy policy URL** — already hosted (GitHub Pages, served from
  `/docs`): **https://ramazankara.github.io/roughboard/privacy.html** — paste
  that into Play.

---

## 4. Required content declarations

- **[REQUIRED] Data safety form** → declare **no data collected / no data shared**
  (Roughboard stores everything locally and makes no network calls).
- **[REQUIRED] Content rating** → complete the IARC questionnaire (this app rates
  "Everyone").
- **[REQUIRED] Target audience & content** → choose your audience (not designed
  for children unless you opt in to the extra requirements).
- **[REQUIRED] Ads** → declare **No ads**.
- Government-app / financial-features / data-handling declarations → all "no".

---

## 5. Testing requirement (new personal accounts)

**[REQUIRED for personal accounts created after Nov 2023]** Before you can apply
for production access you must run a **closed test with at least 12 testers who
stay opted-in for 14 consecutive days**.

1. Create a **Closed testing** track, upload the AAB, add 12+ testers (an email
   list or Google Group).
2. Keep them opted in for 14 days, then **apply for production access**.
3. Organization accounts are exempt from this.

---

## 6. Set the price & publish

1. **[REQUIRED]** Set the price under **Monetize → Products → App pricing**, then
   manage per-country pricing (Play can auto-convert from a base price).
2. Create a **Production** release, upload `app-release.aab`, add release notes.
3. Submit for review. First reviews typically take a few days.

---

## Suggested store text

> **Short:** A fast, offline hand-drawn whiteboard for sketches & diagrams.
>
> **Full (excerpt):** Roughboard is a native, fully offline whiteboard for
> hand-drawn sketches, diagrams, and notes. Draw shapes, arrows, text and
> freehand; organise with a shape library; export or share as PNG/SVG. Everything
> stays on your device — no account, no sign-in, no tracking. Built on the
> open-source Excalidraw editor. (Independent app; not affiliated with Excalidraw.)

---

## Final pre-submit checklist

- [x] targetSdk 35 (done — Capacitor 7 / AGP 8.7.2 / Gradle 8.11.1 / JDK 21)
- [ ] versionCode incremented
- [ ] AAB built & signed; upload key backed up
- [x] Privacy policy hosted (ramazankara.github.io/roughboard/privacy.html) + contact email filled
- [ ] Data safety = no collection; content rating done; ads = none
- [ ] Icon 512, feature graphic, phone + tablet screenshots
- [ ] Merchant account active; price set
- [ ] 12-tester / 14-day closed test completed (new accounts)
