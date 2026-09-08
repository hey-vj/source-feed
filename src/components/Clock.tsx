import { useEffect, useState } from "react";
import { formatClock, formatDate } from "../lib/time";

export function Clock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="text-right leading-none">
      <div className="tabular text-[40px] font-medium tracking-tight text-white/95">
        {formatClock(now)}
      </div>
      <div className="mt-2 text-[13px] text-[var(--muted)]">{formatDate(now)}</div>
    </div>
  );
}
