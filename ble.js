import { BleClient } from '@capacitor-community/bluetooth-le';

const SERVICE_UUID = '7a1b0001-5e4a-4c2d-9f10-1234567890ab';
const DATA_UUID = '7a1b0002-5e4a-4c2d-9f10-1234567890ab';
let initialized = false;

export async function initializeBLE(){
  if(!initialized){ await BleClient.initialize(); initialized=true; }
}
export async function pickAndConnectBLE(onData,onStatus){
  await initializeBLE();
  onStatus?.('Choose a nearby MedWeb BLE device…');
  const device = await BleClient.requestDevice({services:[SERVICE_UUID]});
  const id = device.deviceId;
  await BleClient.connect(id,()=>onStatus?.('BLE disconnected'));
  onStatus?.('Connected to '+(device.name||'BLE device')+'; subscribing…');
  await BleClient.startNotifications(id,SERVICE_UUID,DATA_UUID,(value)=>{
    try{
      const text=new TextDecoder().decode(value);
      const data=JSON.parse(text);
      if(data && typeof data==='object') onData({...data,id:data.id||id,deviceId:data.deviceId||id,name:data.name||device.name||'BLE monitor'});
    }catch(err){onStatus?.('Received BLE data but JSON parsing failed');}
  });
  return {id,name:device.name||'BLE monitor',disconnect:()=>BleClient.disconnect(id)};
}
export async function disconnectBLE(deviceId){try{await BleClient.disconnect(deviceId)}catch{}}
export const MEDWEB_BLE_UUIDS={service:SERVICE_UUID,data:DATA_UUID};
