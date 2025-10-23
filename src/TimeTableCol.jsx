function TimeTableCol({ directionArray, direction }) {

    return (
        <div className="flex flex-row justify-between full-col -z-10 text-white rounded-md ">
            <div className="direction flex text-left items-center text-4xl font-bold pl-2 w-full border-2 border-solid border-white">
                <h2>{direction}</h2>
            </div>
            <div className="flex">
                {directionArray
                    .slice(0, 4)
                    .map((trainObj, index) => {
                        return <div className={`line-info cell-${index} rounded-r-xl pr-3 pl-5 -mr-3 bg-black border-2 border-solid border-white`}>
                            <div className="mr-1 w-16 h-16"><img width="100%" src={`signage/${trainObj.line}.svg`} alt="Train line logo"></img></div>
                            <div className="flex flex-col justify-center">
                                <span className="font-bold text-3xl leading-[0.95]">{Math.floor(trainObj.relativeTime) < 1 ? "Arriving" : Math.floor(trainObj.relativeTime)}</span><span className="leading-[0.95] text-sm">{Math.floor(trainObj.relativeTime) < 1 ? "" : ""}</span>
                            </div>
                        </div>
                    })}
            </div>

        </div>
    )
}

export default TimeTableCol;