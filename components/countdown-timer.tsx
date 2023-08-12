// components/CountdownTimer.tsx
import { useState, useEffect } from 'react';

interface CountdownProps {
  targetDate: Date;
  textSize: string;
}

export const CountdownTimer = ({ targetDate, textSize }: CountdownProps) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [isSessionEnded, setSessionEnded] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const distance = targetDate.getTime() - now;

      if (distance <= 0) {
        setSessionEnded(true);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (isSessionEnded) {
    return <div className={`font-bold ${textSize}`}>Session ended</div>;
  }

  return (
    <div className="flex space-x-4">
      {timeLeft.days > 0 && (
        <div className="flex flex-col items-center">
          <div className={`font-bold ${textSize}`}>{timeLeft.days}</div>
          <div className={`${textSize}`}>Days</div>
        </div>
      )}
      <div className="flex flex-col items-center">
        <div className={`font-bold ${textSize}`}>{timeLeft.hours}</div>
        <div className={`${textSize}`}>Hours</div>
      </div>
      <div className="flex flex-col items-center">
        <div className={`font-bold ${textSize}`}>{timeLeft.minutes}</div>
        <div className={`${textSize}`}>Minutes</div>
      </div>
      <div className="flex flex-col items-center">
        <div className={`font-bold ${textSize}`}>{timeLeft.seconds}</div>
        <div className={`${textSize}`}>Seconds</div>
      </div>
    </div>
  );
};

export default CountdownTimer;
