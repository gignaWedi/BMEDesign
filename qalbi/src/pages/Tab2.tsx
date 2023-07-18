import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCard, IonFab, IonFabButton, IonIcon } from '@ionic/react';
import { Filesystem, Directory } from '@capacitor/filesystem';
import './Tab2.css';
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
import { useEffect, useState } from 'react';
import { refreshOutline } from 'ionicons/icons'; 

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

const Tab2: React.FC = () => {
  
  const [data, setData] = useState<any>({
    labels: [...Array(7).keys()],
    datasets: [{
      label: 'My First Dataset',
      data: [65, 59, 80, 81, 56, 55, 40],
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  }); 

  // TODO Make proper get data function using BluetoothLE + Rolling Average?
  function getData() {
    const start = Date.now()
    var rawdata = ""
  
    for (let i = 0; i < 2016; i++)
        rawdata = rawdata + (start + 60000 * 5 * i) +  " " +  (Math.random()*50 + 70) + "\n"
  
    const datas = rawdata.split('\n').map(element => element.split(' '))
  
    const labels = datas.slice(-288).map(element => new Date(+element[0]).toString())
  
    const data = {
      labels: labels,
      datasets: [{
        label: 'HRV',
        data: datas.slice(-288).map(element => element[1]),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    };
  
    setData(data);
  }

  useEffect(() => {
    getData();
  }, []);
  
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>HRV Readings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonCard className='graph'>
          <Line options={options} data={data}/>
        </IonCard>
        <IonFab vertical="bottom" horizontal="center" slot="fixed">
          <IonFabButton onClick={() => getData()}>
            <IonIcon icon={refreshOutline}></IonIcon>
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default Tab2;
