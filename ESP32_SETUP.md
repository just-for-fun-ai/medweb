# ESP32 live monitor setup

## Bluetooth Low Energy (BLE) — Android

MedWeb Android can connect directly to a nearby compatible ESP32 using BLE. It does not require the phone and ESP32 to share Wi-Fi. Keep Bluetooth enabled and grant the app Bluetooth permissions when Android asks.

The BLE device must expose the following GATT service and characteristic:

- **Service UUID:** `7a1b0001-5e4a-4c2d-9f10-1234567890ab`
- **Read/Notify characteristic UUID:** `7a1b0002-5e4a-4c2d-9f10-1234567890ab`
- Characteristic properties: Notify (Read optional)
- Payload: UTF-8 JSON, sent as a notification. Keep each JSON packet small enough for the negotiated BLE MTU.

Example notification payload:

```json
{"id":"ESP32-BLE-01","name":"Ward monitor","heartRate":72,"spo2":98,"temperature":36.7,"gyro":{"x":0.02,"y":-0.01,"z":0.99}}
```

The app computes gyro magnitude from the three axes. Readings should use numeric values. Device ID should be stable and unique. MedWeb thresholds, local alert history, and optional alert sound remain in the app.

### Arduino ESP32 BLE example (sensor values are placeholders)

Install the **NimBLE-Arduino** library in Arduino IDE. This example demonstrates the BLE service and notification format; replace the placeholder values with your actual sensor readings and ensure calibration/wiring is correct.

```cpp
#include <NimBLEDevice.h>

static const char* SERVICE_UUID = "7a1b0001-5e4a-4c2d-9f10-1234567890ab";
static const char* DATA_UUID    = "7a1b0002-5e4a-4c2d-9f10-1234567890ab";
NimBLECharacteristic* dataChar;

void setup() {
  Serial.begin(115200);
  NimBLEDevice::init("MedWeb-ESP32");
  NimBLEServer* server = NimBLEDevice::createServer();
  NimBLEService* service = server->createService(SERVICE_UUID);
  dataChar = service->createCharacteristic(
    DATA_UUID,
    NIMBLE_PROPERTY::READ | NIMBLE_PROPERTY::NOTIFY
  );
  dataChar->setValue("{\"id\":\"ESP32-BLE-01\",\"name\":\"MedWeb monitor\",\"heartRate\":72,\"spo2\":98,\"temperature\":36.7,\"gyro\":{\"x\":0.02,\"y\":-0.01,\"z\":0.99}}");
  service->start();
  NimBLEAdvertising* advertising = NimBLEDevice::getAdvertising();
  advertising->addServiceUUID(SERVICE_UUID);
  advertising->start();
}

void loop() {
  // Replace demo values with sensor data. Notify about once per second.
  String payload = "{\"id\":\"ESP32-BLE-01\",\"name\":\"MedWeb monitor\",\"heartRate\":72,\"spo2\":98,\"temperature\":36.7,\"gyro\":{\"x\":0.02,\"y\":-0.01,\"z\":0.99}}";
  dataChar->setValue(payload.c_str());
  dataChar->notify();
  delay(1000);
}
```

**Important:** This is a communication example, not medical-grade firmware. The example readings are placeholders. Connect, calibrate, validate and test the actual sensors before using readings. Do not rely on MedWeb as a clinical alarm or replace professional monitoring.

## Wi-Fi WebSocket (legacy)

The app also retains the existing network connection. Enter a WebSocket endpoint and display name. The device must send JSON at least once per second, with its real unique hardware ID and numeric readings:

```json
{"id":"AA:BB:CC:DD:EE:FF","heartRate":72,"spo2":98,"temperature":36.7,"gyro":{"x":0.02,"y":-0.01,"z":0.99}}
```

For browser HTTPS pages, the ESP32 endpoint must use `wss://`; browser pages block insecure `ws://` connections from secure pages. The legacy endpoint is unencrypted when using ws://, so use only on a trusted local network and do not expose it to the public internet.

## Email alerts

Run `npm install`, copy `.env.example` to `.env`, set SMTP credentials for a mailbox/provider you control, and run `npm start`. Configure the recipient in Settings. Never commit `.env`. Email alert delivery still requires a server and internet/network connection; local BLE alerts and alert sound can work while the phone is connected to the BLE monitor.
