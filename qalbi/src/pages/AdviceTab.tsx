import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonIcon, IonButton, IonPopover, IonText, IonCol, IonGrid, IonRow } from '@ionic/react';
import './AdviceTab.css';
import { bulbOutline, chatbubblesOutline, flameOutline, pauseCircleOutline, waterOutline } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import data from './Advice.json';

/*
 * React Functional Component responsible for creating the front end of the advice tab for the user.
 */
const AdviceTab: React.FC = () => {
  
  const [type, setType] = useState<string>(""); // State for the type of advice selected
  const [text, setText] = useState<string>(""); // State for the toast message

  // On type selection, load a random piece of corresponding advice from the Advice json
  useEffect( () => {
    if (Object.keys(data).includes(type)){
      //@ts-ignore
      const strings = data[type]
      setText(strings[Math.floor(Math.random()*strings.length)]);
    }
  }
   , [type])

  useEffect( () => {
    if (text != "") {
      console.log(text)
    }
  }, [text])
  
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className='ion-text-center'>
          <IonTitle><h1>Advice</h1></IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        
        <IonPopover
          isOpen={text != ""}
          onDidDismiss={() => {setText(""); setType("")}}
        >
          <div className='popover ion-text-center ion-padding'>
            <IonIcon icon={bulbOutline}/>
            <IonText>
              <h2>{toTitleCase(type) + ":\n\n" + text}</h2>
            </IonText>
          </div>
        </IonPopover>
        
        <IonGrid className="homepage">
          <h1>How would you like to relax?</h1>
          
          <IonRow>
            <IonCol>
              <IonButton onClick={() => setType("scent")}>
                <IonIcon icon={flameOutline} size='large'/>
                <h2> Scent</h2>
              </IonButton>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <IonButton onClick={() => setType("water")}>
                <IonIcon icon={waterOutline} size='large'/>
                <h2> Water</h2>
              </IonButton>
            </IonCol>
          </IonRow>
          
          <IonRow>
            <IonCol>
              <IonButton onClick={() => setType("quote")}>
                <IonIcon icon={chatbubblesOutline} size='large'/>
                <h2> Quote</h2>
              </IonButton>
            </IonCol>
          </IonRow>
              
          <IonRow>
            <IonCol>
              <IonButton onClick={() => setType("breath")}>
                <IonIcon icon={pauseCircleOutline} size='large'/>
                <h2> Breath</h2>
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>

    </IonPage>
  );
};

// Make strings title case
function toTitleCase(str:string) {
  return str.replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}

export default AdviceTab;
