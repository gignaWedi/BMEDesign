import { IonButton, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonInput, IonItem, IonPage, IonRow, IonTitle, IonToast, IonToggle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './SettingsTab.css';
import { Preferences } from '@capacitor/preferences';
import { checkmark, checkmarkCircleOutline, pencilOutline } from 'ionicons/icons';
import { useEffect, useState } from 'react';

// Preference IDs for each setting
const LOWER_HRV = "lower_hrv";
const UPPER_HRV = "upper_hrv";
const PASSCODE = "passcode";
const NOTIFICATIONS = "notifications";

/*
 * React Functional Component responsible for creating the front end of the settings tab for the user.
 */
const SettingsTab: React.FC = () => {
  
  // Component states for each setting
  const [passcode, setPasscode] = useState<string>("");
  const [upperHRV, setUpperHRV] = useState<number>(107);
  const [lowerHRV, setLowerHRV] = useState<number>(16);
  const [notifications, setNotifications] = useState<boolean>(false);

  const [changes, setChanges] = useState(false); // State for if any changes are present

  const [ready, setReady] = useState(false); // State if settings tab is ready

  const [message, setMessage] = useState(""); // State holding toast message to confirm submission

  // Load all settings from preferences
  const getSettings = async () => {
    setPasscode((await Preferences.get({key:PASSCODE})).value || "");
    setUpperHRV(Number((await Preferences.get({key:UPPER_HRV})).value  || "107" ));
    setLowerHRV(Number((await Preferences.get({key:LOWER_HRV})).value  || "16" ));
    setNotifications(Boolean((await Preferences.get({key:NOTIFICATIONS})).value  || ""));
    setReady(true);
  };
  
  // On render, load all settings
  useEffect (() => {getSettings()}, []);

  // For each setting, on local update, update the corresponding preference.
  useEffect( () => {
    if (ready) Preferences.set({key:PASSCODE, value:passcode}); 
  }, [passcode]);

  useEffect( () => {
    if (ready) Preferences.set({key:UPPER_HRV, value:(upperHRV).toString()}); 
  }, [upperHRV]);

  useEffect( () => {
    if (ready) Preferences.set({key:LOWER_HRV, value:(lowerHRV).toString()}); 
  }, [lowerHRV]);

  useEffect( () => {
    if (ready) Preferences.set({key:NOTIFICATIONS, value:(notifications).toString()}); 
  }, [notifications]);
  
  useEffect(
    () => console.log(passcode, upperHRV, lowerHRV, notifications), [passcode, upperHRV, lowerHRV, notifications]
  )

  // TODO: ensure valid 
  // Save local changes to preferences
  const saveChanges = () => {
    // Pull values from HTML elements and store in each state
    //@ts-ignore
    setNotifications(document.getElementById('notif-toggle').checked);
    //@ts-ignore
    setLowerHRV(document.getElementById('lower-input').focusedValue || lowerHRV);
    //@ts-ignore
    setUpperHRV(document.getElementById('upper-input').focusedValue || upperHRV);
    
    // Unset the changes state and send confimation message
    setChanges(false);
    setMessage("Saved Changes");

    // Clear fields
    //@ts-ignore
    document.getElementById('upper-input').focusedValue = "";
    //@ts-ignore
    document.getElementById('lower-input').focusedValue = "";
  }

  // Handle passcode changes
  const changePasscode = () => {
    
    // Get new code
    //@ts-ignore
    const newcode:string = document.getElementById('new-passcode-input').focusedValue || ""
    
    // If there is a passcode already, get the inputted old pass code
    var oldcode = "";
    if (passcode != "") {
      //@ts-ignore
      oldcode = document.getElementById('old-passcode-input').focusedValue || "";
    }

    // Check if the new code is valid
    if (newcode != "" && (newcode.length > 6 || newcode.length < 4)) {
      setMessage("Invalid New Passcode");
      return;
    }

    // Check if the old code matches the new code
    if (passcode != "" && passcode != oldcode as string) {
      setMessage("Incorrect Old Passcode");
      return;
    }

    // Set the passcode 
    setPasscode(newcode);
    setMessage("Set New Passcode");
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className='ion-text-center'>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        
        <IonToast
          isOpen={message!=""}
          onDidDismiss={() => setMessage("")}
          duration={3000}
          message={message}
          position='top'
        ></IonToast>
        
        
        {ready && <IonGrid className="homepage">
          <IonRow className='setting'>
            <IonCol size='10' className="ion-text-start">
              Enable Notifications
            </IonCol>

            <IonCol size='2' className="ion-text-end">
              <IonToggle
                id='notif-toggle'
                defaultChecked={notifications}
                onIonChange={(event) => setChanges(true)}
              />
            </IonCol>
          </IonRow>

          <IonRow className='setting'>
            <IonCol size='10' className="ion-text-start">
              Lower Threshold
            </IonCol>

            <IonCol size='2' className="ion-text-end">
              <IonInput
                id='lower-input'
                placeholder={lowerHRV.toString()}
                onIonChange={(event) => setChanges(true)}
                type='number'
              />
            </IonCol>
          </IonRow>

          <IonRow className='setting'>
            <IonCol size='10' className="ion-text-start">
              Upper Threshold
            </IonCol>

            <IonCol size='2' className="ion-text-end">
              <IonInput
                id='upper-input'
                placeholder={upperHRV.toString()}
                onIonChange={(event) => setChanges(true)}
                type='number'
              />
            </IonCol>
          </IonRow>

          <IonRow className='setting'>
              <IonCol className='ion-text-center'>
                <IonButton
                  disabled={!changes}
                  onClick={saveChanges}
                >Save Changes</IonButton>
              </IonCol>
          </IonRow>

          <IonRow className='setting'>
            <IonCol size='6' className="ion-text-start">
              {passcode == ""? undefined:<IonInput
                placeholder="Old Passcode"
                type="number"
                id="old-passcode-input"
              />}
              <IonInput
                placeholder='New Passcode'
                type="number"
                id="new-passcode-input"
              />
            </IonCol>

            <IonCol size='6' className="ion-text-end">
              <IonButton
                onClick={changePasscode}
              >
                Change Passcode
              </IonButton>
            </IonCol>
          </IonRow>

        </IonGrid>}
      </IonContent>
    </IonPage>
  );
};

export default SettingsTab;
