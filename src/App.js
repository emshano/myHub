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
    <div className="flex flex-col items-end clock">
      <p className='text-4xl -mb-4'>{time.toDateString().substring(0, time.toDateString().length - 5)}</p>
      <p className='text-[180px] leading-[180px] -tracking-widest'>{time.toTimeString().substring(0, 8)}</p>
    </div>);
}

function App() {
  return (
    <div className="wrapper flex flex-col h-screen p-5 justify-between">
      <div className="flex flex-col">
        <SingleTrainStatus trainLineFeed="gtfs" trainLine="3" station="249" northTerminus="Manhattan" southTerminus="East New York" />
        <SingleTrainStatus trainLineFeed="gtfs-ace" trainLine="C" station="A47" northTerminus="Manhattan" southTerminus="Queens" />
        {/* <BusTime/> */}
      </div>
      <div className=''>
        <Clock />
      </div>

    </div>
  );
}

export default App;
