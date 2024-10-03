import { useEffect, useState } from 'react';
import SingleTrainStatus from './SingleTrainStatus.jsx';
import './App.css';
// import BusTime from './BusTime';

function App() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date(Date.now()));
    }, 1000);
    return () => { clearInterval(timer) }
  }, [time]);
  
  return (
    <div className="wrapper flex flex-col content-between">
      <div className="totalInfo flex flex-col">
        <SingleTrainStatus trainLineFeed="gtfs" trainLine="3" station="249" northTerminus="Manhattan" southTerminus="East New York" />
        <SingleTrainStatus trainLineFeed="gtfs-ace" trainLine="C" station="A47" northTerminus="Manhattan" southTerminus="Queens" />
        {/* <BusTime/> */}
      </div>
      <div className="vidWrap">
        {/* {console.log(time.getHours())} */}
        <h1>{`${(time.getHours() < 10 && time.getHours() >= 1) ? "0" : ""}${time.getHours() === 0 ? "12" : time.getHours()}:${time.getMinutes() < 10 ? "0" : ""}${time.getMinutes()}:${time.getSeconds() < 10 ? "0" : ""}${time.getSeconds()}`}</h1>
        <h2>{time.toDateString().substring(0, time.toDateString().length - 5)}</h2>
      </div>

    </div>
  );
}

export default App;
