import { useState, useEffect } from 'react';

interface CountdownProps {
  data: {
    expiredDateTime: Date;
    startDateTime: Date;
    textSize: string;
  };
}

export const CountdownTimer = ({ data }: CountdownProps) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentCountdown, setCurrentCountdown] = useState('start');

  const expiredDateTime = data.expiredDateTime;
  const startDateTime = data.startDateTime;
  const textSize = data.textSize;

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now(); // Move this inside the updateTimer function.

      let targetDateTime;
      if (now < expiredDateTime.getTime()) {
        targetDateTime = expiredDateTime;
        setCurrentCountdown('end');
      } else if (now < startDateTime.getTime()) {
        targetDateTime = startDateTime;
        setCurrentCountdown('start');
      } else {
        setIsInitialized(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return; // Both times are in the past, so just exit without setting an interval.
      }

      const distance = targetDateTime.getTime() - now;

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
      setIsInitialized(true);
    };

    const interval = setInterval(updateTimer, 1000);
    updateTimer(); // Call it once immediately before the interval starts.

    return () => clearInterval(interval);
  }, [startDateTime, expiredDateTime]);

  const countdownLabel = currentCountdown === 'start' ? 'Session starts:' : 'Session ends:';

  if (!isInitialized) {
    return null; // Render nothing until initialized.
  }

  if (
    timeLeft.days === 0 &&
    timeLeft.hours === 0 &&
    timeLeft.minutes === 0 &&
    timeLeft.seconds === 0
  ) {
    return <div className={`font-bold ${textSize}`}>Session ended</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center p-1 font-mono text-xl text-green-400 bg-black rounded shadow-md ">
      <div className={`font-bold ${textSize} mb-1 text-center `}>{countdownLabel}</div>
      <div className="flex space-x-4">
        {timeLeft.days > 0 && (
          <div className="flex flex-col items-center">
            <div className={`font-bold ${textSize}`}>{timeLeft.days}</div>
            <div className={`${textSize}`}>D</div>
          </div>
        )}
        <div className="flex flex-col items-center">
          <div className={`font-bold ${textSize}`}>{timeLeft.hours.toString().padStart(2, '0')}</div>
          <div className={`${textSize}`}>H</div>
        </div>
        <div className="flex flex-col items-center">
          <div className={`font-bold ${textSize}`}>{timeLeft.minutes.toString().padStart(2, '0')}</div>
          <div className={`${textSize}`}>M</div>
        </div>
        <div className="flex flex-col items-center">
          <div className={`font-bold ${textSize}`}>{timeLeft.seconds.toString().padStart(2, '0')}</div>
          <div className={`${textSize}`}>S</div>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
