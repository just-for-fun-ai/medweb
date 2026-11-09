# ESP32 live monitor setup

MedWeb connects to an ESP32 WebSocket endpoint on the same Wi-Fi network. Open Devices, enter the address (for example ws://192.168.1.42:81) and choose an editable display name. The device must send JSON at least once per second, with its real unique hardware ID and numeric readings:

```json
{"id":"AA:BB:CC:DD:EE:FF","heartRate":72,"spo2":98,"temperature":36.7,"gyro":{"x":0.02,"y":-0.01,"z":0.99}}
```

The app computes gyro magnitude from the three axes. It never creates sample devices or readings. A generic ESP32 cannot be discovered or read automatically: sensor wiring, libraries, calibration and WebSocket firmware vary by board. Install compatible firmware and connect sensors before using this monitor. Use a trusted local network; this demo WebSocket connection is unencrypted. Serve the UI over local HTTP because browser HTTPS pages block plain ws:// connections. Do not expose it to the public internet.

## Email alerts

Run `npm install`, copy `.env.example` to `.env`, then set SMTP credentials for a real mailbox/provider that you control and run `npm start`. Configure the recipient in Settings. Never commit `.env`. SMTP setup cannot create a mailbox; sign up with an email provider separately.
