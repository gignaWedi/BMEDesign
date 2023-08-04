import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCard, IonFab, IonFabButton, IonIcon, IonButton } from '@ionic/react';
import './AdviceTab.css';
import { chatbubblesOutline, flameOutline, pauseCircleOutline, waterOutline } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import data from './Advice.json';

console.log(data);

const AdviceTab: React.FC = () => {
  
  const [type, setType] = useState<string>("");

  const [text, setText] = useState<string>("");


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
        <IonToolbar>
          <IonTitle>Advice</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className='homepage'>
          <h1>How would you like to relax?</h1>
          <IonButton onClick={() => setType("scent")}>
            <IonIcon icon={flameOutline}/>
            <h1>Scent</h1>
          </IonButton>
          <IonButton onClick={() => setType("water")}>
          <IonIcon icon={waterOutline}/>
            <h1>Water</h1>
          </IonButton>
          <IonButton onClick={() => setType("quote")}>
          <IonIcon icon={chatbubblesOutline}/>
            <h1>Quote</h1>
          </IonButton>
          <IonButton onClick={() => setType("breath")}>
          <IonIcon icon={pauseCircleOutline}/>
            <h1>Breath</h1>
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AdviceTab;
