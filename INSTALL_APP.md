# Install JV MedWeb on Android

Download the Android APK from the official GitHub release:

[JV MedWeb Android v1.1.0 — BLE](https://github.com/just-for-fun-ai/medweb/releases/tag/medweb-android-v1.1.0)

1. Open the release link on your Android phone.
2. Download `JV-MedWeb-Android-v1.1.0.apk`.
3. Open the downloaded APK and follow Android's install prompts. Android may ask you to allow installs from your browser for this install.
4. Launch **JV MedWeb**.

### v1.1.0 BLE update
- Direct Bluetooth Low Energy connection to a nearby compatible ESP32.
- BLE device selection and live notification readings.
- Heart rate, SpO₂, temperature and gyroscope dashboard.
- Local configurable threshold alerts and alert history.
- Sound alert toggle.
- Existing Wi-Fi WebSocket connection retained as fallback.

The APK is built by GitHub Actions and debug-signed for sideload installation. It is not distributed through Google Play. Verify the release SHA-256 checksum before installing.

BLE requires compatible ESP32 firmware using the UUIDs and JSON format in [ESP32_SETUP.md](ESP32_SETUP.md). Bluetooth range is limited; BLE cannot provide remote push alerts when the phone is away from the device. Email delivery still requires a separately configured SMTP server.

The installable HTTPS website remains available at https://just-for-fun-ai.github.io/medweb/. Web BLE support varies by browser; Android native app is the recommended BLE option.
