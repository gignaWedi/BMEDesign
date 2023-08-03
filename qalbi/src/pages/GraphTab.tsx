import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './GraphTab.css';
import { BleClient, numberToUUID } from '@capacitor-community/bluetooth-le';
import { useState, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';

const BATTERY_SERVICE = numberToUUID(0x180f);
const BATTERY_CHARACTERISTIC = numberToUUID(0x2a19);


function parseBattery(value: DataView): number {
  const heartRate = value.getFloat32(0, true);
  return heartRate;
}

const DEVICE_ID = "device_id"

const GraphTab: React.FC = () => {
  const [number, setNumber] = useState<number>(NaN);
  
  const data_loop = async () => {
    try {
      await BleClient.initialize()

      const { value } = await Preferences.get({key: DEVICE_ID});
      var id: string;
      
      const device = await BleClient.requestDevice({
        services: [BATTERY_SERVICE]
      })
      
      id = device.deviceId;

      /*
      if (value) {
        id = value;
      } else {
        const device = await BleClient.requestDevice({
          services: [BATTERY_SERVICE]
        })

        id = device.deviceId;
        Preferences.set( {key: DEVICE_ID, value: id})
      }
      */

      await BleClient.connect(id, (deviceId) => onDisconnect(deviceId));
      console.log('connected to device');

      await BleClient.startNotifications(
        id,
        BATTERY_SERVICE,
        BATTERY_CHARACTERISTIC,
        (value) => {
          setNumber(parseBattery(value)); //stateful
        }
      );
      
      setTimeout(async () => {
        await BleClient.stopNotifications(id, BATTERY_SERVICE, BATTERY_CHARACTERISTIC);
        await BleClient.disconnect(id);
        console.log('disconnected from device');
      }, 10000000000000);

    } catch (error) {
      console.error(error);
    }
  };

  function onDisconnect(deviceId: string): void {
    console.log(`device ${deviceId} disconnected`);

    data_loop();
  }

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

export default GraphTab;
