import { useEffect, useState } from 'react';
import SingleTrainStatus from './SingleTrainStatus.jsx';
import './App.css';
// import BusTime from './BusTime';

function dimorphicImage(){

}

function Splash() {
  const [time, setTime] = useState(new Date())
  const baseURL = "https://www.pokencyclopedia.info/sprites/gen5/ani_black-white/ani_bw_";
  const baseURL2 = "https://www.pokencyclopedia.info/sprites/gen2/ani_6/3ani__";

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
    <img 
    id="pkmn"
    src={`${baseURL}${pokeSwitch%251 < 10? `00${pokeSwitch%251}`: pokeSwitch%251 < 100? `0${pokeSwitch%251}`: pokeSwitch%251}.gif`}
    onError={event => {
      event.target.src = `${baseURL}${pokeSwitch%251 < 10? `00${pokeSwitch%251}`: pokeSwitch%251 < 100? `0${pokeSwitch%251}`: pokeSwitch%251}_m.gif`
      event.target.src = `${baseURL}${pokeSwitch%251 < 10? `00${pokeSwitch%251}`: pokeSwitch%251 < 100? `0${pokeSwitch%251}`: pokeSwitch%251}_f.gif`
      event.onerror = null
    }}/>
    {/* {console.log(time.getHours())} */}
    <h1>{`${(time.getHours() < 10 && time.getHours() >=1 ) ? "0" : ""}${time.getHours() == 0 ? "12": time.getHours()}:${time.getMinutes() < 10 ? "0" : ""}${time.getMinutes()}:${time.getSeconds() < 10 ? "0" : ""}${time.getSeconds()}`}</h1>
    <h2>{time.toDateString().substring(0, time.toDateString().length - 5)}</h2>

  </div>);
}

//B21 is D Bay Pkwy and N07 is N Bay Pkwy
function App() { 
  return (
    <div className="wrapper flex flex-col content-between">
      <div className="totalInfo flex flex-col">
        <SingleTrainStatus trainLineFeed="gtfs" trainLine="3" station="249" northTerminus="Manhattan" southTerminus="East New York"/>

        <SingleTrainStatus trainLineFeed="gtfs-ace" trainLine="C" station="A47" northTerminus="Manhattan" southTerminus="Queens"/>

        {/* <BusTime/> */}
      </div>
      <Splash></Splash>
      
    </div>
  );
}

export default App;
