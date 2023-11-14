import { useEffect, useState } from "react";
import { getTimeLeftForTimer } from "../../../../utils/helpers";
import classes from "../../Item.module.sass";
import * as workerTimers from "worker-timers";


const TIME = {
  0: "Days",
  1: "Hours",
  2: "Minutes",
  3: "Seconds",
};

const Countdown = ({ startDate, duration, onTimeEnd }) => {

  const [timeLeft, setTimeLeft] = useState(() => new Array(4).fill(0));

  useEffect(() => {
    let interval = workerTimers.setInterval(() => {
      const timeLeft = getTimeLeftForTimer(
        startDate,
        duration);
      if (timeLeft.length) {
        setTimeLeft(timeLeft);
      } else {
        if (interval) workerTimers.clearInterval(interval);
        interval = null;
        setTimeLeft(new Array(4).fill(0));
        if (typeof onTimeEnd === "function") onTimeEnd();
      }
    }, 1000);
    return () => {
      if (interval) workerTimers.clearInterval(interval);
    };
  }, [duration, startDate, onTimeEnd]);

  return (
    <div className={classes.timer}>
      {
        timeLeft.map((time, ind) => (
          <div className={classes.unit} key={ind}>
            <p>{`${time}`.padStart(2, "0")}</p>
            <span>{TIME[ind]}</span>
          </div>
        ))
      }
    </div>
  );
};

export default Countdown;
