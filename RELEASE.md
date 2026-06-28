# Releasing Roughboard to Google Play

A practical, ordered checklist to publish Roughboard as a **paid** app on the
Google Play Store. Items marked **[REQUIRED]** will block publishing if skipped.

---

## 0. One required code change before you submit

**[REQUIRED] Bump the target SDK.** Google Play requires new apps to target a
recent Android API level (API 35 / Android 15 as of late 2025; Play shows the
exact current requirement when you upload). This project currently targets
**API 34**, which Play will reject for a new app.

- Edit `android/variables.gradle`: set `compileSdkVersion` and `targetSdkVersion`
  to the required level (e.g. `35`).
- API 35 needs **Android Gradle Plugin 8.6+**, which in practice means upgrading
  **Capacitor 6 → 7** (`npm i @capacitor/core@7 @capacitor/cli@7 @capacitor/android@7`
  and the plugins), and **JDK 21** instead of 17.
- Install the platform: `sdkmanager "platforms;android-35" "build-tools;35.0.0"`.
- Rebuild and re-test on a device after upgrading.

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
- **[REQUIRED] Privacy policy URL** — host `PRIVACY.md` somewhere public (e.g.
  GitHub Pages or the raw GitHub URL) and paste the link. Fill in your contact
  email in that file first.

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

- [ ] targetSdk bumped to Play's required level (and re-tested)
- [ ] versionCode incremented
- [ ] AAB built & signed; upload key backed up
- [ ] Privacy policy hosted; URL + contact email filled in
- [ ] Data safety = no collection; content rating done; ads = none
- [ ] Icon 512, feature graphic, phone + tablet screenshots
- [ ] Merchant account active; price set
- [ ] 12-tester / 14-day closed test completed (new accounts)
