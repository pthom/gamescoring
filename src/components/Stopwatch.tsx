import { useEffect, useRef, useState } from "react";

/** A plain, in-memory turn stopwatch. Not tied to players or saved state —
 *  it resets if the page is reloaded. */
export function Stopwatch() {
  const [running, setRunning] = useState(false);
  const [accumulated, setAccumulated] = useState(0); // ms banked while paused
  const startedAt = useRef(0);
  const [, forceTick] = useState(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => forceTick((n) => n + 1), 250);
    return () => clearInterval(id);
  }, [running]);

  const total = running ? accumulated + (Date.now() - startedAt.current) : accumulated;

  function toggle() {
    if (running) {
      setAccumulated(accumulated + (Date.now() - startedAt.current));
      setRunning(false);
    } else {
      startedAt.current = Date.now();
      setRunning(true);
    }
  }

  function reset() {
    setRunning(false);
    setAccumulated(0);
  }

  const mm = Math.floor(total / 60000);
  const ss = Math.floor((total % 60000) / 1000);
  const label = `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;

  return (
    <div className="timer-bar">
      <span className={running ? "timer-clock running" : "timer-clock"}>
        ⏱ {label}
      </span>
      <div className="timer-controls">
        <button
          className="icon-btn"
          onClick={toggle}
          aria-label={running ? "Pause timer" : "Start timer"}
        >
          {running ? "⏸" : "▶"}
        </button>
        <button className="icon-btn" onClick={reset} aria-label="Reset timer">
          ↺
        </button>
      </div>
    </div>
  );
}
