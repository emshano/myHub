function TimeTableCol({ directionArray, direction }) {

    return (
        <div className=" biggy flex flex-row justify-between items-center text-black -z-10 bg-white rounded-full w-full">
            <div className=" lefty flex flex-col items-start text-4xl font-bold pl-2 w-full justify-start place-self-stretch rounded-l-3xl">
                <span className="">{direction}</span>
            </div>
            <div className="flex">
                {directionArray
                    .slice(0, 4)
                    .map((trainObj, index) => {
                        return <div className={`line-info cell-${index} rounded-r-3xl pr-4 pl-6 -ml-10 `}>
                            <div className=" ml-5 mr-1 w-16 h-16"><img width="100%" src={`signage/${trainObj.line}.svg`} alt="Train line logo"></img></div>
                            <div className="flex flex-col justify-center">
                                <span className={`font-bold text-5xl leading-[0.95] ${Math.floor(trainObj.relativeTime) < 1 ? "animate-pulse text-red-500": ""}`}>{Math.floor(trainObj.relativeTime) < 1 ? "0" : Math.floor(trainObj.relativeTime)}</span>
                            </div>
                        </div>
                    })}
            </div>

        </div>
    )
}

export default TimeTableCol;