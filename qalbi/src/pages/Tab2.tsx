import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCard, IonCardContent } from '@ionic/react';
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

const start = Date.now()
var rawdata = ""

for (let i = 0; i < 2016; i++)
    rawdata = rawdata + (start + 60000 * 5 * i) +  " " +  (Math.random()*50 + 70) + "\n"

const datas = rawdata.split('\n').map(element => element.split(' '))

console.log(datas[0][0])

const Tab2: React.FC = () => {
  
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
  
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tab 2</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonCard className='graph'>
          <Line options={options} data={data}/>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default Tab2;
