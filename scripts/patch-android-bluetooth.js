const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const android=path.join(root,'android');
const javaRoot=path.join(android,'app','src','main','java');
function findFile(dir,name){
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    const target=path.join(dir,entry.name);
    if(entry.isDirectory()){const found=findFile(target,name);if(found)return found}
    else if(entry.name===name)return target;
  }
  return null;
}
const mainActivity=findFile(javaRoot,'MainActivity.java');
if(!mainActivity)throw new Error('Capacitor MainActivity.java was not found');
const main=fs.readFileSync(mainActivity,'utf8');
const packageMatch=main.match(/^package\s+([\w.]+);/m);
if(!packageMatch)throw new Error('Could not read the Android app package name');
const packageName=packageMatch[1];
const javaDir=path.join(javaRoot,...packageName.split('.'));
fs.mkdirSync(javaDir,{recursive:true});

const plugin=`package ${packageName};

import android.Manifest;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothManager;
import android.bluetooth.BluetoothSocket;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.provider.Settings;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Set;
import java.util.UUID;

@CapacitorPlugin(
    name = "BluetoothTerminal",
    permissions = {
        @Permission(alias = "bluetoothConnect", strings = { Manifest.permission.BLUETOOTH_CONNECT })
    }
)
public class BluetoothTerminalPlugin extends Plugin {
    private static final UUID SPP_UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");
    private volatile BluetoothSocket socket;
    private volatile boolean stopping = false;

    @PluginMethod
    public void getPairedDevices(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S &&
            getPermissionState("bluetoothConnect") != PermissionState.GRANTED) {
            requestPermissionForAlias("bluetoothConnect", call, "pairedPermissionResult");
            return;
        }
        resolvePairedDevices(call);
    }

    @PermissionCallback
    private void pairedPermissionResult(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S &&
            getPermissionState("bluetoothConnect") != PermissionState.GRANTED) {
            call.reject("Nearby devices permission is required to list paired Bluetooth devices.");
            return;
        }
        resolvePairedDevices(call);
    }

    private void resolvePairedDevices(PluginCall call) {
        BluetoothAdapter adapter = getAdapter();
        if (adapter == null) {
            call.reject("Bluetooth is not available on this phone.");
            return;
        }
        if (!adapter.isEnabled()) {
            JSObject result = new JSObject();
            result.put("enabled", false);
            result.put("devices", new JSArray());
            call.resolve(result);
            return;
        }
        try {
            JSArray devices = new JSArray();
            Set<BluetoothDevice> bonded = adapter.getBondedDevices();
            for (BluetoothDevice device : bonded) {
                JSObject item = new JSObject();
                item.put("name", device.getName() == null ? "Bluetooth device" : device.getName());
                item.put("address", device.getAddress());
                devices.put(item);
            }
            JSObject result = new JSObject();
            result.put("enabled", true);
            result.put("devices", devices);
            call.resolve(result);
        } catch (SecurityException error) {
            call.reject("Allow Nearby devices access, then refresh the list.");
        }
    }

    @PluginMethod
    public void openBluetoothSettings(PluginCall call) {
        try {
            Intent intent = new Intent(Settings.ACTION_BLUETOOTH_SETTINGS);
            getActivity().startActivity(intent);
            call.resolve();
        } catch (Exception error) {
            call.reject("Could not open Bluetooth settings.");
        }
    }

    @PluginMethod
    public void connect(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S &&
            getPermissionState("bluetoothConnect") != PermissionState.GRANTED) {
            call.reject("Allow Nearby devices access and refresh the paired device list first.");
            return;
        }
        String address = call.getString("address");
        if (address == null || address.trim().isEmpty()) {
            call.reject("Choose a paired Bluetooth device.");
            return;
        }
        BluetoothAdapter adapter = getAdapter();
        if (adapter == null || !adapter.isEnabled()) {
            call.reject("Turn on Bluetooth, then try again.");
            return;
        }
        disconnectSocket(false);
        stopping = false;
        new Thread(() -> {
            BluetoothSocket candidate = null;
            try {
                BluetoothDevice device = adapter.getRemoteDevice(address);
                candidate = device.createRfcommSocketToServiceRecord(SPP_UUID);
                candidate.connect();
                socket = candidate;
                JSObject state = new JSObject();
                state.put("connected", true);
                state.put("name", device.getName() == null ? "ESP32" : device.getName());
                state.put("address", address);
                notifyListeners("connectionState", state);
                call.resolve(state);
                readLoop(candidate);
            } catch (Exception error) {
                if (candidate != null) try { candidate.close(); } catch (Exception ignored) {}
                if (!stopping) {
                    JSObject state = new JSObject();
                    state.put("connected", false);
                    state.put("message", "Could not connect. Make sure the ESP32 is paired and not connected to another app.");
                    notifyListeners("connectionState", state);
                    call.reject("Could not connect to the paired ESP32. Check pairing and make sure no other terminal is connected.");
                }
            }
        }, "MedWeb-Bluetooth-SPP").start();
    }

    private void readLoop(BluetoothSocket activeSocket) {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(activeSocket.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            while (!stopping && activeSocket.isConnected() && (line = reader.readLine()) != null) {
                JSObject event = new JSObject();
                event.put("line", line);
                notifyListeners("line", event);
            }
        } catch (Exception ignored) {
        } finally {
            try { activeSocket.close(); } catch (Exception ignored) {}
            if (socket == activeSocket) socket = null;
            JSObject state = new JSObject();
            state.put("connected", false);
            state.put("message", "Bluetooth connection closed.");
            notifyListeners("connectionState", state);
        }
    }

    @PluginMethod
    public void send(PluginCall call) {
        String text = call.getString("text", "");
        BluetoothSocket activeSocket = socket;
        if (activeSocket == null || !activeSocket.isConnected()) {
            call.reject("Connect to an ESP32 before sending.");
            return;
        }
        try {
            OutputStream output = activeSocket.getOutputStream();
            output.write(text.getBytes(StandardCharsets.UTF_8));
            output.flush();
            JSObject result = new JSObject();
            result.put("sent", true);
            call.resolve(result);
        } catch (Exception error) {
            call.reject("Could not send data over Bluetooth.");
        }
    }

    @PluginMethod
    public void disconnect(PluginCall call) {
        stopping = true;
        disconnectSocket(true);
        call.resolve();
    }

    private void disconnectSocket(boolean emit) {
        BluetoothSocket activeSocket = socket;
        socket = null;
        if (activeSocket != null) try { activeSocket.close(); } catch (Exception ignored) {}
        if (emit) {
            JSObject state = new JSObject();
            state.put("connected", false);
            state.put("message", "Disconnected.");
            notifyListeners("connectionState", state);
        }
    }

    private BluetoothAdapter getAdapter() {
        BluetoothManager manager = (BluetoothManager) getContext().getSystemService(Context.BLUETOOTH_SERVICE);
        return manager == null ? null : manager.getAdapter();
    }
}
`;
fs.writeFileSync(path.join(javaDir,'BluetoothTerminalPlugin.java'),plugin,'utf8');

const manifestPath=path.join(android,'app','src','main','AndroidManifest.xml');
let manifest=fs.readFileSync(manifestPath,'utf8');
const permissions=[
  '<uses-permission android:name="android.permission.BLUETOOTH" android:maxSdkVersion="30" />',
  '<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" android:maxSdkVersion="30" />',
  '<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />'
];
for(const permission of permissions){
  const name=permission.match(/android:name="([^"]+)/)[1];
  if(!manifest.includes(name))manifest=manifest.replace('<application',permission+'\n    <application');
}
fs.writeFileSync(manifestPath,manifest,'utf8');

if(!main.includes('BluetoothTerminalPlugin.class')){
  const updated=main.replace(/public class MainActivity extends BridgeActivity\\s*\\{\\s*\\}/,
    'public class MainActivity extends BridgeActivity {\\n    @Override\\n    public void onCreate(android.os.Bundle savedInstanceState) {\\n        registerPlugin(BluetoothTerminalPlugin.class);\\n        super.onCreate(savedInstanceState);\\n    }\\n}');
  if(updated===main)throw new Error('Could not register the Bluetooth plugin in MainActivity');
  fs.writeFileSync(mainActivity,updated,'utf8');
}
console.log('Added the native Bluetooth Classic Serial Port Profile plugin.');
