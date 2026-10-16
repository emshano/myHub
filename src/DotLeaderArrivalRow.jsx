function DotLeaderArrivalRow({ directionArray = [], direction }) {
  return (
    <div className="clock flex w-full min-w-0 flex-col items-start overflow-hidden font-mono text-2xl leading-none text-white">
      <span className="max-w-full shrink-0 overflow-hidden text-ellipsis whitespace-nowrap">
        {direction}
      </span>
      <div className="flex min-w-0 items-baseline whitespace-nowrap">
        {directionArray.slice(0, 4).map((trainObj, index) => {
          const minutes = Math.floor(trainObj.relativeTime);
          const minutesText = minutes < 1 ? '00' : String(minutes).padStart(2, '0');

          return (
            <span key={`${trainObj.line}-${trainObj.time}-${index}`}>
              {index > 0 && <span className="text-white/30" aria-hidden="true">....</span>}
              <span className={trainObj.line === '3' ? 'text-red-500' : trainObj.line === '4' ? 'text-green-500' : trainObj.line === 'A' || trainObj.line === 'C' ? 'text-blue-500' : ''}>
                ({trainObj.line})
              </span>{minutesText}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default DotLeaderArrivalRow;