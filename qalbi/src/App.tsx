import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { heartCircleOutline, square, triangle } from 'ionicons/icons';
import GraphTab from './pages/GraphTab';
import AdviceTab from './pages/AdviceTab';
import SettingsTab from './pages/SettingsTab';
import { useState, useEffect } from 'react';
import { fetchRecords } from './hooks/DataHook';
import { Filesystem, Encoding, Directory } from '@capacitor/filesystem';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => {
  
  const userSettings = {
    upperHRVState: useState<number>(),
    lowerHRVState: useState<number>(),
    passcodeState: useState<number>()
  }

  const userState = useState<number>();

  var readjustError = 0;
  
  const hrvCallback = async (rawRecord:DataView): Promise<void> => {
    await storeRecord(rawRecord);
    await determineUserState();
  };
  
  const storeRecord = async (rawRecord:DataView): Promise<void> => {
    const timestamp = rawRecord.getInt32(0, true);
    const rmssd = rawRecord.getFloat32(4, true).toFixed(2).padStart(6);

    const record = `${timestamp} ${rmssd}\n`;

    const currentDatetime = new Date(timestamp);
        
    const year = currentDatetime.getUTCFullYear().toString().padStart(4, '0');
    const month = currentDatetime.getUTCMonth().toString().padStart(2, '0');
    const day = currentDatetime.getUTCDay().toString().padStart(2, '0');

    const filename = `HRV-${year}${month}${day}.txt`;

    try {
      const contents = await Filesystem.readFile({
        path: filename,
        directory: Directory.Data,
        encoding: Encoding.UTF8
      });
      
      if (!contents.data.includes(record)){
        await Filesystem.appendFile({
          path: filename,
          data: record,
          directory: Directory.Data,
          encoding: Encoding.UTF8
        });
      }

    } catch (error) {
      await Filesystem.writeFile({
        path: filename,
        data: record,
        directory: Directory.Data,
        encoding: Encoding.UTF8
      });
    }

  }
  
  const determineUserState = async (): Promise<void> => {
    const baselineRecords = await fetchRecords(3 * 24 * 60 * 60);
    const sampleRecords = await fetchRecords(3 * 60 * 60);

    if (baselineRecords.length <= 0 || sampleRecords.length <= 0){
      return;
    }

    const baselineHRV = baselineRecords.map((record) => record[1]).reduce((acc, curr) => acc + curr, 0) / baselineRecords.length;
    const sampleHRV = sampleRecords.map((record) => record[1]).reduce((acc, curr) => acc + curr, 0) / baselineRecords.length;

    const upperHRV = userSettings.upperHRVState[0];
    const lowerHRV = userSettings.lowerHRVState[0];

    if (sampleHRV > 107 || sampleHRV > 1.15 * baselineHRV || upperHRV != undefined && sampleHRV > upperHRV)
      userState[1](1);
    else if (sampleHRV < 16 || sampleHRV < 0.85 * baselineHRV || lowerHRV != undefined && sampleHRV < lowerHRV)
      userState[1](-1);
    else
      userState[1](0);
  }

  return (
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/tab1">
              <GraphTab />
            </Route>
            <Route exact path="/tab2">
              <AdviceTab />
            </Route>
            <Route path="/tab3">
              <SettingsTab />
            </Route>
            <Route exact path="/">
              <Redirect to="/tab1" />
            </Route>
          </IonRouterOutlet>
          <IonTabBar slot="bottom">
            <IonTabButton tab="tab1" href="/tab1">
              <IonIcon aria-hidden="true" icon={triangle} />
              <IonLabel>Tab 1</IonLabel>
            </IonTabButton>
            <IonTabButton tab="tab2" href="/tab2">
              <IonIcon aria-hidden="true" icon={heartCircleOutline} />
              <IonLabel>HRV</IonLabel>
            </IonTabButton>
            <IonTabButton tab="tab3" href="/tab3">
              <IonIcon aria-hidden="true" icon={square} />
              <IonLabel>Tab 3</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
