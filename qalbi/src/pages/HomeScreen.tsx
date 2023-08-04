import { IonButton, IonCard, IonCol, IonContent, IonGrid, IonHeader, IonPage, IonRow, IonText, IonTitle, IonToolbar } from "@ionic/react";
//@ts-ignore
import LockScreen from 'react-lock-screen';
import { useState } from "react";
import './HomeScreen.css';

const HomeScreen: React.FC<{stressState: number}>  = ({stressState}) => {
  
  return (
    <IonPage>
      <IonContent fullscreen>
        <IonGrid className="homepage">
          
          <IonRow style={{"flexGrow":1, "alignItems":"flex-end"}}>
            <IonCol>
              Your current stress level
            </IonCol>
          </IonRow>

          <IonRow style={{"flexGrow":2, "alignItems":"flex-start"}}>
            <IonCol>
              <IonCard className="ion-padding">
                {stressState == 1? "Stressed": stressState  == -1? "Fatigued":"Normal"}
              </IonCard>
            </IonCol>
          </IonRow>

        </IonGrid>
      </IonContent> 
    </IonPage>
  );
}

export default HomeScreen;