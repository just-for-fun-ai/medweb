# Install JV MedWeb on Android

Download the Android APK from the official GitHub release:

[JV MedWeb Android v1.0.0](https://github.com/just-for-fun-ai/medweb/releases/tag/medweb-android-v1.0.0)

1. Scan the QR code or open the release link on your Android phone.
2. Tap **JV-MedWeb-Android-v1.0.0.apk** to download it.
3. Open the downloaded APK and follow Android's install prompts. Android may ask you to allow installs from your browser for this one install.
4. Launch **JV MedWeb** from your app list.

The APK is built from this public repository by GitHub Actions and is debug-signed for sideload installation. It is not distributed through Google Play. Review the release page and its SHA-256 checksum before installing.

This native Android app contains the MedWeb interface and can connect to ESP32 devices on the same Wi-Fi. It expects firmware to send the JSON format in [ESP32_SETUP.md](ESP32_SETUP.md). The default ESP32 WebSocket protocol is unencrypted; use only on a trusted local network. Email alerts still require a separately configured SMTP server.

The installable HTTPS website remains available at https://just-for-fun-ai.github.io/medweb/ for iPhone and browser installation. iPhones cannot install Android APKs; use Safari's **Share → Add to Home Screen** for the web app.
