import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Tab1.css';
import { BleClient, numberToUUID } from '@capacitor-community/bluetooth-le';
import { useState, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';

const BATTERY_SERVICE = numberToUUID(0x180f);
const BATTERY_CHARACTERISTIC = numberToUUID(0x2a19);


function onDisconnect(deviceId: string): void {
  console.log(`device ${deviceId} disconnected`);
}

function parseBattery(value: DataView): number {
  
  const heartRate = value.getUint8(0);
  
  return heartRate;
}

const DEVICE_ID = "device_id"

const Tab1: React.FC = () => {
  const [number, setNumber] = useState<number>(0);
  
  const data_loop = async () => {
    try {
      await BleClient.initialize()

      const { value } = await Preferences.get({key: DEVICE_ID});
      var id: string;
      if (value) {
        id = value;
      } else {
        const device = await BleClient.requestDevice({
          services: [BATTERY_SERVICE]
        })

        id = device.deviceId;
        Preferences.set( {key: DEVICE_ID, value: id})
      }

      await BleClient.connect(id, (deviceId) => onDisconnect(deviceId));
      console.log('connected to device');

      await BleClient.startNotifications(
        id,
        BATTERY_SERVICE,
        BATTERY_CHARACTERISTIC,
        (value) => {
          console.log('current heart rate', setNumber(parseBattery(value))); //stateful
        }
      );
      
      setTimeout(async () => {
        await BleClient.stopNotifications(id, BATTERY_SERVICE, BATTERY_CHARACTERISTIC);
        await BleClient.disconnect(id);
        console.log('disconnected from device');
      }, 1000000);

    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {data_loop()}, [])
  
  
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tab 1</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonTitle>{number}</IonTitle>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
