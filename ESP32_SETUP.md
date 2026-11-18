# JV MedWeb BLE setup

This branch changes MedWeb from Wi-Fi/WebSocket to Bluetooth Low Energy.

**BLE UART service:** `6E400001-B5A3-F393-E0A9-E50E24DCCA9E`  
**Notify characteristic (device → app):** `6E400003-B5A3-F393-E0A9-E50E24DCCA9E`

Send JSON notifications like:
```json
{"id":"ESP32-01","heartRate":72,"spo2":98,"temperature":36.7,"gyro":{"x":0.02,"y":-0.01,"z":0.99}}
```
The app scans, connects, subscribes to notifications and updates dashboard/threshold alerts.

**Compatibility:** Uses Web Bluetooth. Android Chrome supports it; availability in Capacitor Android WebView may vary. If BLE scanning fails in the APK, a native Capacitor BLE plugin integration is needed. Test this branch in Android Chrome first.

BLE is short range. It cannot provide remote push alerts outside Bluetooth range. Remote notifications/email require internet-connected backend infrastructure.
