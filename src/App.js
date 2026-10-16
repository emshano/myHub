import { useEffect, useState } from 'react';
import SingleTrainStatus from './SingleTrainStatus.jsx';
import './App.css';
import StandbyWorldMap from './StandbyWorldMap.jsx';
// import BusTime from './BusTime';
// import SpirographP5 from './SpirographP5.jsx';

function Clock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date(Date.now()));
    }, 1000);
    return () => { clearInterval(timer) }
  }, [time]);

  return (
    <div className="flex h-full flex-col items-end justify-end clock">
      <p className='text-4xl -mb-2'>{time.toDateString().substring(0, time.toDateString().length - 5)}</p>
      <p className='whitespace-nowrap text-[150px] leading-[130px] -tracking-widest 2xl:text-[180px] 2xl:leading-[180px]'>{time.toTimeString().substring(0, 8)}</p>
    </div>);
}

function App() {
  return (
    <div className="wrapper flex flex-col h-screen p-5 justify-between">
      <div className="flex flex-col gap-4">
        <SingleTrainStatus trainLineFeed="gtfs" trainLine="3" station="249" northTerminus="Manhattan" southTerminus="East New York" />
        <SingleTrainStatus trainLineFeed="gtfs-ace" trainLine="C" station="A47" northTerminus="Manhattan" southTerminus="Queens" />
        {/* <BusTime/> */}
      </div>
      <div className='flex flex-col items-end justify-between overflow-visible'>
        <div className='w-full overflow-visible lg:w-2/5'>
          <Clock />
        </div>
        <div className='w-full min-w-0 lg:w-3/5'>
          <StandbyWorldMap />
        </div>
      </div>

    </div>
  );
}

export default App;
