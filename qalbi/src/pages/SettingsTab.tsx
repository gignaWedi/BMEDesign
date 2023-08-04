import { IonButton, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonInput, IonItem, IonPage, IonRow, IonTitle, IonToggle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './SettingsTab.css';
import { Preferences } from '@capacitor/preferences';
import { checkmark, checkmarkCircleOutline, pencilOutline } from 'ionicons/icons';

const LOWER_HRV = "lower_hrv";
const UPPER_HRV = "upper_hrv";
const PASSCODE = "passcode";
const NOTIFICATIONS = "notifications";

const SettingsTab: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
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
              <IonInput
                placeholder="Old Passcode"
              />
              <IonInput
                placeholder='New Passcode'
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
