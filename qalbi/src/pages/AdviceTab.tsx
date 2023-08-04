import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCard, IonFab, IonFabButton, IonIcon } from '@ionic/react';
import { Filesystem, Directory } from '@capacitor/filesystem';
import './AdviceTab.css';

const AdviceTab: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Advice</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        
      </IonContent>
    </IonPage>
  );
};

export default AdviceTab;
