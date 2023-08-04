import { IonCol, IonContent, IonGrid, IonHeader, IonInput, IonItem, IonPage, IonRow, IonTitle, IonToggle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './SettingsTab.css';

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
              <h1>Enable Notifications</h1>
            </IonCol>

            <IonCol size='2' className="ion-text-end">
              <IonToggle
              />
            </IonCol>
          </IonRow>

          <IonRow className='setting'>
            <IonCol size='10' className="ion-text-start">
              <h1>Lower Threshold</h1>
            </IonCol>

            <IonCol size='2' className="ion-text-end">
              <IonInput
                placeholder='16'
              />
            </IonCol>
          </IonRow>

          <IonRow className='setting'>
            <IonCol size='10' className="ion-text-start">
              <h1>Upper Threshold</h1>
            </IonCol>

            <IonCol size='2' className="ion-text-end">
              <IonInput
                placeholder='107'
              />
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default SettingsTab;
