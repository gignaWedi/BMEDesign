import { IonCard, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from '@ionic/react';
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

import { Settings } from '../App';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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


const GraphTab: React.FC<{userSettings:Settings}> = ({userSettings}) => {
  
  const [chartData, setChartData] = useState<any>({
    labels: [...Array(7).keys()],
    datasets: [{
      label: 'My First Dataset',
      data: [65, 59, 80, 81, 56, 55, 40],
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  });

  const [timeframe, setTimeframe] = useState<number>(0);

  const getChartData = async (): Promise<void> => {
    // TODO: Loading
    var timePeriod: number

    if (timeframe == 0) {
      timePeriod = 60 * 60;
    } 
    else if (timeframe == 1) {
      timePeriod = 24 * 60 * 60;
    }
    else if (timeframe == 2) {
      timePeriod = 7 * 24 * 60 * 60;
    }
    else {
      console.error("Invalid Timeframe Selection");
      return;
    }

    const records = await fetchRecords(timePeriod);

    if (records.length <= 0)
      return;

    var aggregatedRecords: number[][];
    var labels: string[];

    if (timeframe == 0) {
      labels = records.map((record) => {
            const roundedTimestamp = record[0] - (new Date(record[0]).getMinutes() % 5) * 60; 
            return new Date(roundedTimestamp).toTimeString();
          }
        )
    }

    else if (timeframe == 1) {
      labels = records.map((record) => {
            const roundedTimestamp = record[0] - (new Date(record[0]).getHours() % 2) * 60 * 60; 
            return new Date(roundedTimestamp).toTimeString();
          }
        )
    }

    else {
      labels = records.map((record) => new Date(record[0]).toDateString());
    }

    const unique_labels = [... new Set(labels)];

    const values = new Array<number>(5);

    unique_labels.forEach((label, i) => {
      const vals = records.filter((_, i) => labels[i] == label).map((record) => record[1]);
      
      values[i] = vals.reduce((acc, curr) => acc + curr, 0);
    })

    const colors = await colorRecords(values);

    const data = {
      labels: unique_labels,
      datasets: [{
        label: 'HRV',
        data: values,
        fill: false,
        borderColor: colors,
        tension: 0.1
      }]
    };

    setChartData(data);
  }

  const colorRecords = async (values: number[]): Promise<String[]> => {
    const baselineRecords = await fetchRecords(3*24*60*60);

    // TODO: get the actual userUpper and userLower
    const userUpper = userSettings.upperHRVState[0];
    const userLower = userSettings.lowerHRVState[0];

    if (baselineRecords.length <= 0)
      return [];

    const baselineHRV = baselineRecords.map((record) => record[1]).reduce((acc, curr) => acc + curr, 0) / baselineRecords.length;
    
    // TODO: Actual RGB vals
    const colors = values.map( (HRV) => {
      if (HRV > 107 || HRV > 1.15 * baselineHRV || HRV > userUpper || HRV < 16 || HRV < 0.85 * baselineHRV || HRV < userLower) 
        return "Red";
      
      if (HRV > 1.08 * baselineHRV || HRV < 0.92 * baselineHRV)
        return "Yellow";

      return "Green";
    });

    return colors;
  }

  useEffect(() => {getChartData()}, [timeframe]);
  
  
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>HRV Readings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonCard className='graph'>
          <Line options={options} data={chartData}/>
        </IonCard>
        <IonFab vertical="bottom" horizontal="center" slot="fixed">
          <IonFabButton onClick={() => getChartData()}>
            <IonIcon icon={refreshOutline}></IonIcon>
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default GraphTab;
