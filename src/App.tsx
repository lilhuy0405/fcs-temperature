import TemperatureChart from "./TemperatureChart.tsx";
import {useEffect, useState} from "react";
import moment from "moment";
import {Progress} from "antd";

function App() {
  const [temperatures, setTemperatures] = useState<any>([]);
  const [currentHumidity, setCurrentHumidity] = useState<any>(null);
  const fetchData = async () => {
    try {
      const url = "https://lilhuy-supabase.click/temperature?limit=1000";
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setTemperatures(data.data)
      setCurrentHumidity(data.data[data.data.length - 1])
    } catch (err: any) {
      console.log("err", err);
    }
  }
  useEffect(() => {
    fetchData();
  }, []);
  const lastTemperature = temperatures[temperatures.length - 1];

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
            <span>Nhiệt độ: {lastTemperature?.temperature} °C | </span>
            <span>Cảm giác như: {lastTemperature?.heatIndex} °C | </span>
            <span>Cập nhật lúc: {moment(lastTemperature?.createdAt).format('DD/MM HH:MM')}</span>
          </div>
          <TemperatureChart
            width={600}
            height={300}
            temperatures={temperatures}
            setCurrentHumidity={setCurrentHumidity}
          />
          <div>
            <h3 className='text-center my-3'>Độ ẩm</h3>
            <div className="center-flex">
              <Progress
                type={'circle'}
                size={150}
                percent={currentHumidity?.humidity}
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
