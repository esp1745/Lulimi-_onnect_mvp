import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

const GRAIN_OVERLAY =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

interface HeroVideoBackgroundProps {
  videos: string[];
  intervalSeconds?: number;
}

export function HeroVideoBackground({ videos, intervalSeconds = 10 }: HeroVideoBackgroundProps) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const restartTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (videos.length <= 1) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % videos.length);
    }, intervalSeconds * 1000);
  };

  useEffect(() => {
    restartTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [videos.length, intervalSeconds]);

  const handleSelect = (i: number) => {
    setIndex(i);
    restartTimer();
  };

  return (
    <div className="absolute inset-0 overflow-hidden">
      <AnimatePresence>
        <motion.video
          key={videos[index]}
          autoPlay
          muted
          loop
          playsInline
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "contrast(1.05) brightness(1.05) saturate(1.1)" }}
        >
          <source src={videos[index]} type="video/mp4" />
        </motion.video>
      </AnimatePresence>

      {/* Legibility overlay — lighter up top for a brighter feel, deepening
          toward the bottom so the headline and stats stay readable. */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1A3A35]/30 via-[#1A3A35]/35 to-[#1A3A35]/70" />
      {/* Warm amber wash so the hero reads sunny rather than cold green. */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-[#F5C42C]/15" />

      {/* Grain texture */}
      <div
        className="absolute inset-0 pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: GRAIN_OVERLAY, opacity: 0.3 }}
      />

      {/* Manual shuffle controls */}
      {videos.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 z-10 flex justify-center gap-2">
          {videos.map((video, i) => (
            <button
              key={video}
              type="button"
              onClick={() => handleSelect(i)}
              aria-label={`Show background video ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-7 bg-[#F5C42C]" : "w-2 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
