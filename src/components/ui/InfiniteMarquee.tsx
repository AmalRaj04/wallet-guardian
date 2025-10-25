"use client";

import { ReactNode } from "react";

interface InfiniteMarqueeProps {
  children: ReactNode;
  speed?: "slow" | "normal" | "fast";
  pauseOnHover?: boolean;
  className?: string;
  direction?: "left" | "right";
}

export default function InfiniteMarquee({
  children,
  speed = "normal",
  pauseOnHover = true,
  className = "",
  direction = "left",
}: InfiniteMarqueeProps) {
  const speedMap = {
    slow: "60s",
    normal: "40s",
    fast: "20s",
  };

  const animationDuration = speedMap[speed];
  const animationDirection =
    direction === "left" ? "scroll-left" : "scroll-right";

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <style jsx>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @keyframes scroll-right {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }
      `}</style>
      <div
        className={`flex gap-8 md:gap-12 ${pauseOnHover ? "hover:[animation-play-state:paused]" : ""}`}
        style={{
          animation: `${animationDirection} ${animationDuration} linear infinite`,
          width: "max-content",
        }}
      >
        {/* First set of children */}
        <div className="flex gap-8 md:gap-12">{children}</div>
        {/* Duplicate for seamless loop */}
        <div className="flex gap-8 md:gap-12" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
