import { useEffect, useState } from 'react';
import SingleTrainStatus from './SingleTrainStatus.jsx';
import './App.css';
// import BusTime from './BusTime';

function Splash() {
  const [time, setTime] = useState(new Date())
  const [time2, setTime2] = useState(new Date())
  const baseURL = "https://www.pokencyclopedia.info/sprites/gen3/ani_emerald/ani_e_";
  const baseURL2 = "https://www.pokencyclopedia.info/sprites/3ds/ani_6/3ani__";

  const [pokeNum, setPokeNum] = useState(1); //dexNumber
  const [pokeSwitch, setPokeSwitch] =  useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date(Date.now()));
    }, 1000);
    return () => {clearInterval(timer)}
  }, [time])

  useEffect(() => {
  const timer = setInterval(() => {
    setPokeSwitch(pokeSwitch + 1);
}, 60000);
    return () => {clearInterval(timer)}
  }, [pokeSwitch])




  return(
  <div className="vidWrap">
    <img id="pkmn" src={`${baseURL2}${pokeSwitch%368 < 10? `00${pokeSwitch%368}`: pokeSwitch%368 < 100? `0${pokeSwitch%368}`: pokeSwitch%368}__xy.gif`}/>
    {/* {console.log(time.getHours())} */}
    <h1>{`${(time.getHours() < 10 && time.getHours() >=1 ) ? "0" : ""}${time.getHours() == 0 ? "12": time.getHours()}:${time.getMinutes() < 10 ? "0" : ""}${time.getMinutes()}:${time.getSeconds() < 10 ? "0" : ""}${time.getSeconds()}`}</h1>
    <h2>{time.toDateString()}</h2>

  </div>);
}

//B21 is D Bay Pkwy and N07 is N Bay Pkwy
function App() { 
  return (
    <div className="wrapper">
      <div className="totalInfo">
        <SingleTrainStatus trainLineFeed="gtfs-ace" trainLine="C" station="A47"/>
        <SingleTrainStatus trainLineFeed="gtfs" trainLine="3" station="249"/>

        {/* <BusTime/> */}
      </div>
      <Splash></Splash>
      
    </div>
  );
}

export default App;
