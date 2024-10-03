import { useEffect, useState } from 'react';
import './App.css';

//added proxy to package.json to circumvent CORS issue
// "proxy": "https://api.prod.obanyc.com/api/siri",

function BusTime(){


  useEffect(() => {
    fetch(`/stop-monitoring.json?key=${process.env.REACT_APP_BUS_KEY}&OperatorRef=MTA&MonitoringRef=302462&LineRef=MTA NYCT_B26`)
    .then((response) => response.json())
    .then((data) => {
      let nextBusesAtStop = data.Siri.ServiceDelivery.StopMonitoringDelivery[0].MonitoredStopVisit
      let incomingBusArray = nextBusesAtStop.map((bus) => {
        let info = bus.MonitoredVehicleJourney
        console.log(info)
        let currentTimeInUTC = Date.now();
        let timeString = info.MonitoredCall.ExpectedDepartureTime.slice(0, -10);
        let departureTimeInUTC = new Date(timeString).getTime();
        console.log(departureTimeInUTC - currentTimeInUTC)
        // console.log(departureTimeInUTC);

        let busObj = {
          lineName: info.PublishedLineName,
          destination: info.DestinationName,
          distanceInMins: Math.ceil(Math.abs(currentTimeInUTC - departureTimeInUTC) / (1000 * 60))
          
        }
        return busObj;
      })
      console.log(incomingBusArray)

    })
    .catch((err)=> console.log(err))
  }, []);

  return(
    <div>
      <p>Hi!</p>
      </div>
  );

}

export default BusTime;
