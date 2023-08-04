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
import { dataHook, fetchRecords } from './hooks/DataHook';
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

// Interface for the userSettings prop
export interface Settings {
  upperHRVState: [number, React.Dispatch<React.SetStateAction<number>>];
  lowerHRVState: [number, React.Dispatch<React.SetStateAction<number>>];
  passcodeState: [String, React.Dispatch<React.SetStateAction<String>>];
}

/*
 * React Functional Component responsible for setting up global states and creating the routing for the device android application.
 */

const App: React.FC = () => {
  
  // userSettings is a collection of useState arrays for each possible setting
  const userSettings = {
    upperHRVState: useState<number>(16),
    lowerHRVState: useState<number>(107),
    passcodeState: useState<String>("")
  }

  // userState is the user's current stress state
  // 0 : normal
  // -1: fatigued
  // 1: stressed
  const userState = useState<number>();

  /*
   * Callback to trigger whenever a new record is written to the HRV characteristic by the device wearable. 
   * rawRecord is the received value from the HRV characteristic
   */
  const hrvCallback = async (rawRecord:DataView): Promise<void> => {
    await storeRecord(rawRecord);
    await determineUserState();
  };
  
  /*
   * Stores an HRV record given by the raw bits of rawRecord. 
   * rawError is the received value from the HRV characteristic, following the format in design specification 4.5.1.
   */
  const storeRecord = async (rawRecord:DataView): Promise<void> => {
    /* 
     * Parse the HRV Characteristic
     * 
     * UUUUHHHH
     * U: Unix timestamp: uint32
     * H: HRV metric: float32
     * 
     * Arduino is little endian, so read and write to the DataView with the little endian flag set for multibyte datatypes.
     */

    const timestamp = rawRecord.getUint32(0, true);
    const rmssd = rawRecord.getFloat32(4, true).toFixed(2).padStart(6, '0');

    // Format the record
    const record = `${timestamp} ${rmssd}\n`;

    // Get the record's year, month, and day to make the HRV day data file filename
    const currentDatetime = new Date(timestamp);
        
    const year = currentDatetime.getUTCFullYear().toString().padStart(4, '0');
    const month = (currentDatetime.getUTCMonth()+1).toString().padStart(2, '0');
    const day = currentDatetime.getUTCDay().toString().padStart(2, '0');

    const filename = `HRV-${year}${month}${day}.txt`;

    // Attempt to read the day data file.
    try {
      const contents = await Filesystem.readFile({
        path: filename,
        directory: Directory.Data,
        encoding: Encoding.UTF8
      });
      
      // if the record is not already in the data file, append the record. 
      if (!contents.data.includes(record)){
        await Filesystem.appendFile({
          path: filename,
          data: record,
          directory: Directory.Data,
          encoding: Encoding.UTF8
        });
      }

    } catch (error) {
      
      // Write to the day datafile to create a new file.
      await Filesystem.writeFile({
        path: filename,
        data: record,
        directory: Directory.Data,
        encoding: Encoding.UTF8
      });
    }
  }
  
  /*
   * Sets the userState global state based on HRV metrics (see requirements 3.2.2.1.4-3.2.2.1.8, 3.2.2.2.1)
   */
  const determineUserState = async (): Promise<void> => {
    const baselineRecords = await fetchRecords(3 * 24 * 60 * 60); // Records from 3 days ago to now
    const sampleRecords = await fetchRecords(3 * 60 * 60); // Records from 3 hours ago to now

    // If there are no records, end method to avoid division by zero
    if (baselineRecords.length <= 0 || sampleRecords.length <= 0){
      return;
    }

    // Get the mean of each set of records to serve as the respective HRV metric.
    const baselineHRV = baselineRecords.map((record) => record[1]).reduce((acc, curr) => acc + curr, 0) / baselineRecords.length;
    const sampleHRV = sampleRecords.map((record) => record[1]).reduce((acc, curr) => acc + curr, 0) / baselineRecords.length;

    // Get the current user set thresholds
    const upperHRV = userSettings.upperHRVState[0];
    const lowerHRV = userSettings.lowerHRVState[0];

    // If the user is "stressed", write 1 to the userState
    // Else if the user is "fatigued", write -1 to the userState
    // Else write 0 to the user state

    if (sampleHRV > 107 || sampleHRV > 1.15 * baselineHRV || sampleHRV > upperHRV)
      userState[1](1);
    else if (sampleHRV < 16 || sampleHRV < 0.85 * baselineHRV || sampleHRV < lowerHRV)
      userState[1](-1);
    else
      userState[1](0);
  }

  var readjustError = 0; // number of readjust Errors in the last hour
  var timeoutID: NodeJS.Timeout|undefined = undefined; // timeout to handle clearing readjustError
  
  /*
   * Handles error codes sent from the device wearable to the Error characteristic. 
   * rawError is the received value from the characteristic, following the format in design specification 4.5.1.
   */
  const errorCallback = async (rawError: DataView): Promise<void> => {
    
    /* 
     * Parse the Error Characteristic
     * 
     * Z
     * Z: Error code: uint8
     */

    const errorCode = rawError.getUint8(0);

    // If the errorCode is 1, a readjust error has occurred
    if (errorCode == 1) {
      readjustError += 1; // Increment readjust error counter

      // If 5 readjustErrors have occurred in the last hour, set a local notification and reset the timeout
      if (readjustError >= 5) {
        // TODO: local notif if 5 readjust error
        clearTimeout(timeoutID);
      }

      // If this is the first readjust error, set a timeout to clear the reajustError value to 0 after an hour.
      if (readjustError == 1){
        timeoutID = setTimeout(
          () => {
            readjustError = 0;
            timeoutID = undefined
          },
          60*60
        )
      }
    }

    // Log the error code
    console.error('Error Code', errorCode);
  }

  useEffect(() => {dataHook([hrvCallback, errorCallback])}, []); // Start dataHook

  return (
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/tab1">
              <GraphTab userSettings={userSettings} />
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
