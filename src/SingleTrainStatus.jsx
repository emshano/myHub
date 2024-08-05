import { useEffect, useState } from 'react';
import GtfsRealtimeBindings from 'gtfs-realtime-bindings';
import axios from 'axios';
import TimeTableCol from './TimeTableCol'
import './App.css';
import stations from "./mta_dict/mtaStations"
import mtaStations from './mta_dict/mtaStations';


function SingleTrainStatus({trainLineFeed, trainLine, station, northTerminus, southTerminus}) {

  const [departures, setDepartures] = useState({north: [], south: []});
  // const [south, setSouth] = useState([]);
  const [stationCode, setStation] = useState(station);
  
  const formatTime = (s) => {
    const dtFormat = new Intl.DateTimeFormat('en-US', {
      timeStyle: 'short',
      timeZone: "America/New_York"
    });
    
    return dtFormat.format(new Date(s));
  };


useEffect(()=> {
const timer = setInterval(() => {
  axios.get(`https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2F${trainLineFeed}`, {responseType : "arraybuffer"})
  .then((response) => {
    var northBound = [];
    var southBound = [];

    let bufferArray = new Uint8Array(response.data);
    var feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(bufferArray);


    feed.entity.forEach((entity, i) => {
      //var tripUpdate = entity.tripUpdate
      if(i%2===0 || i == 0){
        try {
          var routeID = entity.tripUpdate.trip.routeId
          var stopTimes = entity.tripUpdate.stopTimeUpdate
          console.log(entity);

            stopTimes.forEach((stopTime) => {
              if (stopTime.stopId === `${station}N` || stopTime.stopId === `${station}S` ){
                var trainTime = formatTime(stopTime.departure.time * 1e3);
                var relTime = ((stopTime.departure.time * 1000) - Date.now())/60000
                let trainObj = {
                    time: trainTime,
                    line: routeID,
                    relativeTime: relTime
                }
                //var trainTime = stopTime.departure.time
                //console.log(trainTime)

                if (stopTime.stopId === `${station}N`){
                  northBound.push(trainObj)
                }
                else if (stopTime.stopId === `${station}S`){
                  southBound.push(trainObj)
                }
              }

          })
          
        } catch (err) {
          console.log(err)
        }
      }
  });
  var northy = northBound
  console.log("north:")
  northy.sort((a,b) =>  a.relativeTime - b.relativeTime);
  console.log(northy)

  

  var southy = southBound
  console.log("south:")
  southy.sort((a,b) =>  a.relativeTime - b.relativeTime);
  console.log(southy)


  setDepartures({north: northy, south: southy})

  }).catch((error) => {
    console.log(error);
  });
}, 15000);

//fetch
return () => clearInterval(timer);
}, []);

  return (
    <div className="">
    <div className="stationTitle">
      <div className="imgContainer"> <img className="logo" src={`signage/${trainLine}.svg`} alt="Train line logo"></img></div>
      <div className="title">
        <h2> {mtaStations[stationCode].stop_name}</h2>
      </div>
    </div>
      <p className="updated">Last updated: {new Date().toTimeString().substring(0,8)} </p>

      <div className="timeTable">
        <TimeTableCol directionArray={departures.north} direction={northTerminus}/>
        <TimeTableCol directionArray={departures.south} direction={southTerminus}/>
      </div>
  </div>
  );
}

export default SingleTrainStatus;
