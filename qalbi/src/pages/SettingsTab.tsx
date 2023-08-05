import { IonButton, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonInput, IonItem, IonPage, IonRow, IonTitle, IonToggle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './SettingsTab.css';
import { Preferences } from '@capacitor/preferences';
import { checkmark, checkmarkCircleOutline, pencilOutline } from 'ionicons/icons';
import { useEffect, useState } from 'react';

const LOWER_HRV = "lower_hrv";
const UPPER_HRV = "upper_hrv";
const PASSCODE = "passcode";
const NOTIFICATIONS = "notifications";

const SettingsTab: React.FC = () => {
  
  const [passcode, setPasscode] = useState<string>("");
  const [upperHRV, setUpperHRV] = useState<number>(107);
  const [lowerHRV, setLowerHRV] = useState<number>(16);
  const [notifications, setNotifications] = useState<boolean>(false);

  const [ready, setReady] = useState(false);

  const getSettings = async () => {
    setPasscode((await Preferences.get({key:PASSCODE})).value || "");
    setUpperHRV(Number((await Preferences.get({key:UPPER_HRV})).value  || "107" ));
    setLowerHRV(Number((await Preferences.get({key:LOWER_HRV})).value  || "16" ));
    setNotifications(Boolean((await Preferences.get({key:NOTIFICATIONS})).value  || ""));
    setReady(true);
  };
  
  getSettings();

  useEffect( () => {
    if (ready) Preferences.set({key:PASSCODE, value:passcode}); 
  }, [passcode]);

  useEffect( () => {
    if (ready) Preferences.set({key:PASSCODE, value:(upperHRV).toString()}); 
  }, [upperHRV]);

  useEffect( () => {
    if (ready) Preferences.set({key:PASSCODE, value:(lowerHRV).toString()}); 
  }, [lowerHRV]);

  useEffect( () => {
    if (ready) Preferences.set({key:PASSCODE, value:(notifications).toString()}); 
  }, [notifications]);
  
  useEffect(
    () => console.log(passcode, upperHRV, lowerHRV, notifications), [passcode, upperHRV, lowerHRV, notifications]
  )

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className='ion-text-center'>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonGrid className="homepage">
          <IonRow className='setting'>
            <IonCol size='10' className="ion-text-start">
              Enable Notifications
            </IonCol>

            <IonCol size='2' className="ion-text-end">
              <IonToggle
                checked={notifications}
                onIonChange={ (event) => {}}
              />
            </IonCol>
          </IonRow>

          <IonRow className='setting'>
            <IonCol size='10' className="ion-text-start">
              Lower Threshold
            </IonCol>

            <IonCol size='2' className="ion-text-end">
              <IonInput
                placeholder='16'
              />
            </IonCol>
          </IonRow>

          <IonRow className='setting'>
            <IonCol size='10' className="ion-text-start">
              Upper Threshold
            </IonCol>

            <IonCol size='2' className="ion-text-end">
              <IonInput
                placeholder='107'
              />
            </IonCol>
          </IonRow>

          <IonRow className='setting'>
            <IonCol size='6' className="ion-text-start">
              {passcode == ""? undefined:<IonInput
                placeholder="Old Passcode"
                type="number"
              />}
              <IonInput
                placeholder='New Passcode'
                type="number"
              />
            </IonCol>

            <IonCol size='6' className="ion-text-end">
              <IonButton>
                Change Passcode
              </IonButton>
            </IonCol>
          </IonRow>

        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default SettingsTab;
