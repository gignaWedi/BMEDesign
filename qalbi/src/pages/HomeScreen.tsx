import { IonButton, IonCard, IonCol, IonContent, IonGrid, IonHeader, IonPage, IonRow, IonText, IonTitle, IonToolbar } from "@ionic/react";
import { Settings, StressState } from "../App";
//@ts-ignore
import LockScreen from 'react-lock-screen';
import { useState } from "react";
import './HomeScreen.css';

const HomeScreen: React.FC<{userSettings:Settings, userState: StressState}>  = ({userSettings, userState}) => {
  
  return (
    <IonPage>
      <IonContent fullscreen>
        <IonGrid className="homepage">
          
          <IonRow style={{"flexGrow":1, "alignItems":"flex-end"}}>
            <IonCol>
              <h1>Your current stress level</h1>
            </IonCol>
          </IonRow>

          <IonRow style={{"flexGrow":2, "alignItems":"flex-start"}}>
            <IonCol>
              <IonCard className="ion-padding">
                <h1>{userState[0] == 1? "Stressed": userState[0] == -1? "Fatigued":"Normal"}</h1>
              </IonCard>
            </IonCol>
          </IonRow>

        </IonGrid>
      </IonContent> 
    </IonPage>
  );
}

export default HomeScreen;