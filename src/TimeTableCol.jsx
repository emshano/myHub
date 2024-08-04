function TimeTableCol({directionArray, direction}) {

    return(
        <div className="timeColumn">
            <h3>{direction}</h3>
            {directionArray
            .slice(0,4)
            .map((trainObj)=>{
                return <div className="innerColumn">
                    <div className="line-info">
                            <div className="smallLogo"><img width="100%"src={`signage/${trainObj.line}.svg`} alt="Train line logo"></img></div>
                            <div><p>{Math.floor(trainObj.relativeTime) < 1 ? "Arriving" : Math.floor(trainObj.relativeTime) + " mins"}</p></div>
                    </div>
                    {/* <div><p>{trainObj.time}</p></div> */}
                </div>
            })}
          </div>
    )
}

export default TimeTableCol;