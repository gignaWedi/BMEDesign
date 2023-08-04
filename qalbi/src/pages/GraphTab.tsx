import { IonButton, IonButtons, IonCard, IonCol, IonContent, IonFab, IonFabButton, IonGrid, IonHeader, IonIcon, IonPage, IonRow, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './GraphTab.css';
import { useState, useEffect } from 'react';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { refreshOutline } from 'ionicons/icons';
import { fetchRecords } from '../hooks/DataHook';

import { Preferences } from '@capacitor/preferences';
const LOWER_HRV = "lower_hrv";
const UPPER_HRV = "upper_hrv";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// options for chart.js
export const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
  },
  scales : {
    x : {
      ticks: {
        display: false
      }
    },
    y :{
      title : {
        display: true,
        text: "HRV"
      }
    }
  }
};

/*
 * React Functional Component responsible for creating the front end of the graph tab for the user.
 * Takes in userSettings as a prop to read the HRV thresholds
 */
const GraphTab: React.FC = () => {
  
  // Stateful variable for the current chart.js data
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [{
    }]
  });

  // Stateful variable for the timeframe the user selects
  // 0: 1 hour
  // 1: 1 day
  // 2: 1 week

  const [timeframe, setTimeframe] = useState<number>(0);

  /*
   * Sets the graphData based on the HRV records that are within the current timeframe.
   */ 
  const getChartData = async (): Promise<void> => {
    // TODO: Loading screen while loading data

    var timePeriod: number; // Number of seconds to look back for records

    // Set timePeriod based on timeframe selection
    if (timeframe == 0) {
      timePeriod = 60 * 60; // 1 hour in seconds
    } 
    else if (timeframe == 1) {
      timePeriod = 24 * 60 * 60; // 1 day in seconds
    }
    else if (timeframe == 2) {
      timePeriod = 7 * 24 * 60 * 60; // 1 week in seconds
    }
    else {
      // If the timeframe is not 0, 1, or 2, throw an error
      console.error("Invalid Timeframe Selection");
      return;
    }

    const records = await fetchRecords(timePeriod); // Fetch the records for the corresponding time period

    // If no records exist, end execution to avoid division by zero
    if (records.length <= 0)
      return;

    var labels: string[]; // variable to hold the labels for each time point

    // If timeframe selection is 1 hr, "floor" each timestamp to a minute that is divisible by 5
    if (timeframe == 0) {
      labels = records.map((record) => {
            const roundedTimestamp = record[0] - (new Date(record[0]).getMinutes() % 5) * 60; 
            return new Date(roundedTimestamp).toTimeString();
          }
        )
    }

    // If timeframe selection is 1 day, "floor" each timestamp to an even hour.
    else if (timeframe == 1) {
      labels = records.map((record) => {
            const roundedTimestamp = record[0] - (new Date(record[0]).getHours() % 2) * 60 * 60; 
            return new Date(roundedTimestamp).toTimeString();
          }
        )
    }

    // If timeframe selection is 1 week, get the current day.
    else {
      labels = records.map((record) => new Date(record[0]).toDateString());
    }

    const unique_labels = [... new Set(labels)]; // Pull unique labels

    const values = new Array<number>(unique_labels.length); // Array to store aggregated values for each unique label

    // For each unique label, store the average of all record HRV with the same label
    unique_labels.forEach((label, i) => {
      const vals = records.filter((_, i) => labels[i] == label).map((record) => record[1]);
      
      values[i] = vals.reduce((acc, curr) => acc + curr, 0)/vals.length;
    })

    const colors = await colorRecords(values); // Get the colors according to their value.

    // Set chartData to a chart.js data object
    const data = {
      labels: unique_labels,
      datasets: [{
        label: 'HRV',
        data: values,
        fill: false,
        borderColor: colors,
        backgroundColor: colors,
        tension: 0.1
      }]
    };

    setChartData(data);
  }

  /*
   * Assigns a color to each HRV record based on its HRV value. 
   * Takes in an array of HRV values. 
   * Returns an array of RGB values.
   */
  const colorRecords = async (values: number[]): Promise<String[]> => {
    const baselineRecords = await fetchRecords(3 * 24 * 60 * 60); // Records from 3 days ago to now

    // If there are no records, end method to avoid division by zero
    if (baselineRecords.length <= 0)
      return [];

    // Get baselineHRV from the average of the record's HRV values.
    const baselineHRV = baselineRecords.map((record) => record[1]).reduce((acc, curr) => acc + curr, 0) / baselineRecords.length;

    // Get the current user set thresholds
    const {value: rawUpperHrv} = await Preferences.get({key: UPPER_HRV});
    const userUpper = Number(rawUpperHrv || "200");
    
    const {value: rawLowerHrv} = await Preferences.get({key: LOWER_HRV});
    const userLower = Number(rawLowerHrv || "0");
    
    // Colors corresponsing to each record
    const colors = values.map( (HRV) => {
      // If the record is stressed or fatigued, map the record to a red color
      if (HRV > 107 || HRV > 1.15 * baselineHRV || HRV > userUpper || HRV < 16 || HRV < 0.85 * baselineHRV || HRV < userLower) 
        return "#c46c7b";
      
      // Else If the records is close to stressed or close to fatigued, map the record to a yellow color
      if (HRV > 1.08 * baselineHRV || HRV < 0.92 * baselineHRV)
        return "#f0d973";

      // Else map the record to a green color
      return "#91f2a6";
    });

    return colors;
  }

  useEffect(() => {getChartData()}, [timeframe]); // getChartData on startup and every timeframe change
  
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>HRV Readings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        
        <IonGrid className="homepage">
            
          <IonRow style={{"flexGrow":1, "width":"100%"}}>
            <IonCol className='full'>
                <IonCard className='full'>
                  <Line options={options} data={chartData}/>
                </IonCard>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <IonButtons>
                <IonButton onClick={() => setTimeframe(0)}>
                  Past Hour
                </IonButton>
                <IonButton onClick={() => setTimeframe(1)}>
                  Today
                </IonButton>
                <IonButton onClick={() => setTimeframe(2)}>
                  This Week
                </IonButton>
              </IonButtons>
            </IonCol>
          </IonRow>

        </IonGrid>
          
      </IonContent>
    </IonPage>
  );
};

export default GraphTab;
