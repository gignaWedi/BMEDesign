import { IonCard, IonCol, IonContent, IonGrid, IonHeader, IonPage, IonRow, IonTitle, IonToolbar, useIonRouter } from "@ionic/react";
import './HomeScreen.css';
import { App } from "@capacitor/app";

/*
 * React Functional Component responsible for creating the front end of the home screen for the user. 
 * The content depends on the current userState.
 */
const HomeScreen: React.FC<{stressState: number}>  = ({stressState}) => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className='ion-text-center'>
          <IonTitle><h1>Tranquil+</h1></IonTitle>
        </IonToolbar>
      </IonHeader>
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
                <h1>{stressState == 1? "Stressed": stressState  == -1? "Fatigued":"Normal"}</h1>
              </IonCard>
            </IonCol>
          </IonRow>

        </IonGrid>
      </IonContent> 
    </IonPage>
  );
}

export default HomeScreen;