import { useEffect, useState } from 'react';
import SingleTrainStatus from './SingleTrainStatus.jsx';
import './App.css';
// import BusTime from './BusTime';

function Clock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date(Date.now()));
    }, 1000);
    return () => { clearInterval(timer) }
  }, [time]);

  return (
    <div className="flex flex-col items-center">
      <h1>{time.toTimeString().substring(0,8)}</h1>
      <h2>{time.toDateString().substring(0, time.toDateString().length - 5)}</h2>
    </div>);
}

function App() {


  return (
    <div className="wrapper flex flex-col h-screen p-5">
      <div className="totalInfo flex flex-col lg:flex-row justify-around">
        <SingleTrainStatus trainLineFeed="gtfs" trainLine="3" station="249" northTerminus="Manhattan" southTerminus="East New York" />
        <SingleTrainStatus trainLineFeed="gtfs-ace" trainLine="C" station="A47" northTerminus="Manhattan" southTerminus="Queens" />
        {/* <BusTime/> */}
      </div>
      <Clock />

    </div>
  );
}

export default App;
