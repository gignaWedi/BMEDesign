import { IonCard, IonCol, IonContent, IonGrid, IonPage, IonRow, useIonRouter } from "@ionic/react";
import './HomeScreen.css';
import { App } from "@capacitor/app";

/*
 * React Functional Component responsible for creating the front end of the home screen for the user. 
 * The content depends on the current userState.
 */
const HomeScreen: React.FC<{stressState: number}>  = ({stressState}) => {
  // Back button goes back home
  const router = useIonRouter();
  App.addListener("backButton", (event) => {
    console.log(router.push("/"));
  })
  
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