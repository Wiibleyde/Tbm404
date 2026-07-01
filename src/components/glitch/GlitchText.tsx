"use client";

import { useEffect, useRef, useState } from "react";

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@%&/\\<>*+=—";
const FRAME_MS = 40;

interface GlitchTextProps {
  text: string;
  className?: string;
  duration?: number;
  as?: "span" | "h1" | "h2" | "p";
}

// Reveals text left-to-right while scrambling the not-yet-revealed tail.
export function GlitchText({ text, className, duration = 900, as = "span" }: GlitchTextProps) {
  const [display, setDisplay] = useState(text);
  const Tag = as;
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = null;
    const id = setInterval(() => {
      if (startRef.current === null) startRef.current = performance.now();
      const progress = Math.min(1, (performance.now() - startRef.current) / duration);
      setDisplay(scramble(text, progress));
      if (progress >= 1) clearInterval(id);
    }, FRAME_MS);

    return () => clearInterval(id);
  }, [text, duration]);

  return (
    <Tag className={className} data-text={text} aria-label={text}>
      {display}
    </Tag>
  );
}

function scramble(text: string, progress: number): string {
  const revealed = Math.floor(text.length * progress);
  let out = "";
  for (let i = 0; i < text.length; i++) {
    if (i < revealed || text[i] === " ") {
      out += text[i];
    } else {
      out += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
    }
  }
  return out;
}
