import { useEffect, useState } from 'react';
import GtfsRealtimeBindings from 'gtfs-realtime-bindings';
import axios from 'axios';
import DotLeaderArrivalRow from './DotLeaderArrivalRow';
import './App.css';
import mtaStations from './mta_dict/mtaStations';


function SingleTrainStatus({ trainLineFeed, trainLine, station, northTerminus, southTerminus }) {

  const [departures, setDepartures] = useState({ north: [], south: [] });
  // const [south, setSouth] = useState([]);
  const [stationCode, setStation] = useState(station);

  const formatTime = (s) => {
    const dtFormat = new Intl.DateTimeFormat('en-US', {
      timeStyle: 'short',
      timeZone: "America/New_York"
    });

    return dtFormat.format(new Date(s));
  };


  useEffect(() => {
    const timer = setInterval(() => {
      axios.get(`https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2F${trainLineFeed}`, { responseType: "arraybuffer" })
        .then((response) => {
          var northBound = [];
          var southBound = [];

          let bufferArray = new Uint8Array(response.data);
          var feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(bufferArray);

          feed.entity.forEach((entity, i) => {
            //in the A/C/E endpoint, every other index had the tripUpdate property 
            //in the 1/2/3/4/5/6/7 endpoint, it's not structured in the same way

            //so instead of checking if the index is 0 or even, I have to explicitly
            //check if each element in the array has a tripUpdate property
            if (entity.hasOwnProperty("tripUpdate")) {
              try {
                var routeID = entity.tripUpdate.trip.routeId //gets the train route
                var stopTimes = entity.tripUpdate.stopTimeUpdate //gets an array of arrival/departure times at a particular stop
                console.log(entity);

                stopTimes.forEach((stopTime) => {
                  if (stopTime.stopId === `${station}N` || stopTime.stopId === `${station}S`) {
                    var trainTime = formatTime(stopTime.departure.time * 1e3);
                    var relTime = ((stopTime.departure.time * 1000) - Date.now()) / 60000
                    let trainObj = {
                      time: trainTime,
                      line: routeID,
                      relativeTime: relTime
                    }

                    if (stopTime.stopId === `${station}N`) {
                      //maybe we can prevent trains with the relative time that are negative from being added to the array.
                      northBound.push(trainObj)
                    }
                    else if (stopTime.stopId === `${station}S`) {
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
          northy.sort((a, b) => a.relativeTime - b.relativeTime);

          var southy = southBound
          southy.sort((a, b) => a.relativeTime - b.relativeTime);

          setDepartures({ north: northy, south: southy })

        }).catch((error) => {
          console.log(error);
        });
    }, 15000);

    //fetch
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mb-4">
      <div className="flex w-full min-w-0 flex-col items-start overflow-hidden text-4xl leading-none text-white font-extrabold">
        <span className="shrink-0 whitespace-nowrap ">
          <span className={trainLine === '3' ? 'text-red-500' : trainLine === '4' ? 'text-green-500' : trainLine === 'A' || trainLine === 'C' ? 'text-blue-500' : ''}>
            ({trainLine})
          </span>{' '}
          {mtaStations[stationCode].stop_name}
        </span>
        <span className="shrink-0 whitespace-nowrap text-2xl font-thin text-white/60">
          Last updated: {new Date().toTimeString().substring(0, 8)}
        </span>
      </div>



      <div className="timeTable mt-3">
        <DotLeaderArrivalRow directionArray={departures.north} direction={northTerminus} />
        <DotLeaderArrivalRow directionArray={departures.south} direction={southTerminus} />
      </div>
    </div>
  );
}

export default SingleTrainStatus;
