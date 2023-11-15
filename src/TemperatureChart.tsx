import {useEffect, useMemo, useRef, useState} from "react";
import {createChart, CrosshairMode} from "lightweight-charts";
import moment from "moment";
//eslint-disable-next-line
//@ts-ignore
import mqtt from "mqtt/dist/mqtt.esm";

const TemperatureChart = ({width, height, temperatures, setLatestTemperature}: any) => {

  const topic = 'esp32/temperature-bot/web'
  const [currentLine, setCurrentLine] = useState<any>(null)

  const chartData = useMemo(() => {
    return temperatures.map((item: any) => {
      const offset = new Date().getTimezoneOffset() * -1;
      const offsetHours = offset / 60;
      return {
        //default time is utc so we need to convert to local time by adding offset
        time: +moment(item.createdAt).add(offsetHours, 'hours').format('X'),
        value: +item.temperature,
      }
    })
  }, [temperatures])

  const chartContainerRef = useRef<any>();
  useEffect(() => {
    const client = mqtt.connect("wss://emqx.vietcombank.co.uk:8084/mqtt");
    const chart = createChart(chartContainerRef.current, {
      width,
      height,
      layout: {
        background: {
          // type: 'solid',
          color: "#fff",
        },
        // lineColor: '#2B2B43',
        textColor: '#191919',
      },
      grid: {
        vertLines: {
          color: "rgba(197, 203, 206, 0.5)",
        },
        horzLines: {
          color: "rgba(197, 203, 206, 0.5)",
        },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        mode: CrosshairMode.Magnet,
      },
      rightPriceScale: {
        borderColor: "rgba(197, 203, 206, 0.8)",
      },
    });
    try {
      const lineSeries = chart.addAreaSeries({
        topColor: 'rgba(33, 150, 243, 0.56)',
        bottomColor: 'rgba(33, 150, 243, 0.04)',
        lineColor: 'rgba(33, 150, 243, 1)',
        lineWidth: 2,
      });
      lineSeries.setData(chartData);


      chart.subscribeCrosshairMove((param) => {
        if (param.time) {
          const currentLine: any = param.seriesData.get(lineSeries);
          setCurrentLine(currentLine);
        }
      });

      client.on("connect", () => {
        console.log("Connected to EMQ server");
        // Subscribe to topics or perform other actions here
        client.subscribe(topic);
      });
      client.on("error", (error: any) => {
        console.error("MQTT Error:", error);
      });

      client.on("close", () => {
        console.log("Connection to EMQ server closed");
      });
      client.on("message", (receivedTopic: any, message: any) => {
        console.log(
          `Received message on topic ${receivedTopic}: ${message.toString()}`
        );
        // // Handle the incoming message as needed
        const newBar = JSON.parse(message.toString());
        console.log("newBar", newBar);
        if (+chartData.time === +newBar.time) {
          console.log("duplicate");
          return;
        }
        //if new bar time is less than last bar time then return
        const lastBar = chartData[chartData.length - 1];
        if (!lastBar) {
          return;
        }
        if (+lastBar.time > +newBar.time) {
          return;
        }
        setLatestTemperature(newBar);
        const offset = new Date().getTimezoneOffset() * -1;
        const offsetHours = offset / 60;
        const newBarNormalized: any = {
          time: +moment(newBar.createdAt).add(offsetHours, 'hours').format('X'),
          value: +newBar.temperature,
        }
        lineSeries.update(newBarNormalized);
        console.log("add new bar", newBarNormalized)

      });
    } catch (err: any) {
      console.log("err", err.message);
    }
    return () => {
      // window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [width, height, chartData, setLatestTemperature]);

  return (
    <div style={{position: 'relative'}}>
      <div className='chart-legend'>
        {currentLine?.value} °C
      </div>
      <div ref={chartContainerRef}/>
    </div>
  );
}
export default TemperatureChart
