"use client";

import { useEffect, useState } from "react";

interface GlitchNumberProps {
  value: number;
  suffix?: string;
  className?: string;
  duration?: number;
}

// Counts up from 0 to value on mount; the surrounding CSS applies the
// chromatic-aberration glitch, scaled by --glitch on an ancestor.
export function GlitchNumber({
  value,
  suffix = "",
  className,
  duration = 1100,
}: GlitchNumberProps) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let raf = 0;
    let start: number | null = null;

    const tick = (now: number) => {
      if (start === null) start = now;
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(Math.round(eased * value));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  const text = `${display}${suffix}`;
  return (
    <span className={`glitch-text tabular-nums ${className ?? ""}`} data-text={text}>
      {text}
    </span>
  );
}
