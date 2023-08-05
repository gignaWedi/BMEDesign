import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCard, IonFab, IonFabButton, IonIcon, IonButton, IonToast } from '@ionic/react';
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
          <IonTitle>Advice</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className='homepage'>
          How would you like to relax?
          
          <IonButton onClick={() => setType("scent")}>
            <IonIcon icon={flameOutline}/>
            Scent
          </IonButton>

          <IonButton onClick={() => setType("water")}>
          <IonIcon icon={waterOutline}/>
            Water
          </IonButton>
          
          <IonButton onClick={() => setType("quote")}>
          <IonIcon icon={chatbubblesOutline}/>
            Quote
          </IonButton>
          
          <IonButton onClick={() => setType("breath")}>
          <IonIcon icon={pauseCircleOutline}/>
            Breath
          </IonButton>
        </div>
      </IonContent>

      <IonToast
        message={toTitleCase(type) + ":\n" + text}
        duration={10000}
        buttons={[
          {
            text: 'Dismiss',
            role: 'cancel',
          },
        ]}
        layout="stacked"
        icon={bulbOutline}
        isOpen={text != ""}
        onDidDismiss={() => {setText(""); setType("")}}
        position='middle'
      ></IonToast>

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
