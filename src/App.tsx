import TemperatureChart from "./TemperatureChart.tsx";
import {useEffect, useState} from "react";
import moment from "moment";
import {Progress} from "antd";

function App() {
  const [temperatures, setTemperatures] = useState<any>([]);
  const [latestTemperature, setLatestTemperature] = useState<any>(null);
  console.log('latestTemperature', latestTemperature)
  const fetchData = async () => {
    try {
      const url = "https://lilhuy-supabase.click/temperature?limit=1000";
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setTemperatures(data.data)
      setLatestTemperature(data.data[data.data.length - 1])
    } catch (err: any) {
      console.log("err", err);
    }
  }
  useEffect(() => {
    fetchData();
  }, []);


  return (
    <>
      <div style={{
        width: '600px',
        margin: '0 auto',
      }}>
        <div>
          <h1 className='text-center'>FCS Temperature</h1>
          <div className='text-center my-3'>
            Nhiệt độ tầng 4 nhà đk đọc từ cảm biến nhiệt độ và độ ẩm DHT22!
          </div>
          <div className='text-center my-3'>
            <span>Nhiệt độ: {latestTemperature?.temperature} °C | </span>
            <span>Cảm giác như: {latestTemperature?.heatIndex} °C | </span>
            <span>Cập nhật lúc: {moment(latestTemperature?.createdAt).format('DD/MM HH:mm')}</span>
          </div>
          <TemperatureChart
            width={600}
            height={300}
            temperatures={temperatures}
            setLatestTemperature={setLatestTemperature}
          />
          <div>
            <h3 className='text-center my-3'>Độ ẩm</h3>
            <div className="center-flex">
              <Progress
                type={'circle'}
                size={150}
                percent={latestTemperature?.humidity}
              />
            </div>
          </div>
          <div className='text-small text-gray my-3'>
            Created by <a href="https://github.com/lilhuy0405" target='_blank'>lilhuy</a> with ESP32, DHT22, MQTT,
            ReactJS, Ant Design
          </div>
        </div>

      </div>
    </>
  )
}

export default App
