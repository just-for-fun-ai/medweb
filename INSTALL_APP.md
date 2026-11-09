# Install JV MedWeb as an app

MedWeb is now an installable Progressive Web App (PWA), not a native APK/IPA. First publish the PR to an HTTPS web host. The install prompt does not work from an ordinary LAN HTTP address; localhost is an exception for development. For live ESP32 use from an HTTPS-installed PWA, the ESP32 WebSocket endpoint must use `wss://` because browsers block `ws://` from secure pages.

- **Android / Chrome:** open the HTTPS MedWeb URL, then tap **Install app** if shown. Otherwise use Chrome's ⋮ menu → **Install app** or **Add to Home screen**.
- **iPhone / iPad / Safari:** open the HTTPS URL, tap **Share**, then **Add to Home Screen**.
- **Desktop Chrome / Edge:** open the HTTPS URL and choose **Install** from the address bar or browser menu.

After installation, the app opens in a standalone window and caches its interface for offline viewing. Live device connections and email delivery still require network access. The repository PR must be merged/deployed before its published app can be installed.

This project does not include a signed Android APK or iOS App Store package. Those require a separate native build and distribution setup.
