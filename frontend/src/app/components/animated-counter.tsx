import { useEffect, useRef, useState } from "react";
import { useInView, animate } from "motion/react";

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  suffixClassName?: string;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  suffix,
  suffixClassName,
  duration = 1.8,
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(0, value, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });
    return () => controls.stop();
  }, [isInView, value, duration]);

  return (
    <span ref={ref} className={className}>
      {display.toLocaleString()}
      {suffix && <sup className={suffixClassName}>{suffix}</sup>}
    </span>
  );
}
