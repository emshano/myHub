function TimeTableCol({ directionArray, direction }) {

    return (
        <div className="flex flex-row items-center justify-between full-col text-black -z-10 bg-white rounded-md">
            <div className="text-left bg-white text-4xl font-bold pl-2">{direction}</div>
            <div className="flex">
                {directionArray
                    .slice(0, 4)
                    .map((trainObj, index) => {
                        return <div className={`line-info cell-${index} rounded-r-xl pr-3 pl-5 -mr-3`}>
                            <div className="mr-1 w-16 h-16"><img width="100%" src={`signage/${trainObj.line}.svg`} alt="Train line logo"></img></div>
                            <div className="flex flex-col justify-center">
                                <span className="font-bold text-3xl leading-[0.95]">{Math.floor(trainObj.relativeTime) < 1 ? "Arriving" : Math.floor(trainObj.relativeTime)}</span><span className="leading-[0.95] text-sm">{Math.floor(trainObj.relativeTime) < 1 ? "" : "mins"}</span>
                            </div>
                        </div>
                    })}
            </div>

        </div>
    )
}

export default TimeTableCol;