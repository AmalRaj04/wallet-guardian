"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { gsap } from "gsap";
import GlassCard from "./GlassCard";

interface InteractiveGlassCardProps {
  children: React.ReactNode;
  className?: string;
  enableParticles?: boolean;
  enableTilt?: boolean;
  enableMagnetism?: boolean;
  enableBorderGlow?: boolean;
  clickEffect?: boolean;
  particleCount?: number;
  glowColor?: string;
  disableAnimations?: boolean;
  neonColor?: "blue" | "purple" | "pink" | "green";
  onClick?: () => void;
  hover?: boolean;
  tiltIntensity?: number; // 0-1, default 1 (full tilt)
  magnetismIntensity?: number; // 0-1, default 1 (full magnetism)
}

const InteractiveGlassCard: React.FC<InteractiveGlassCardProps> = ({
  children,
  className = "",
  enableParticles = true,
  enableTilt = true,
  enableMagnetism = true,
  enableBorderGlow = true,
  clickEffect = true,
  particleCount = 8,
  glowColor = "132, 0, 255",
  disableAnimations = false,
  neonColor,
  onClick,
  hover = true,
  tiltIntensity = 1,
  magnetismIntensity = 1,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement[]>([]);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const isHoveredRef = useRef(false);

  const createParticle = useCallback(
    (x: number, y: number) => {
      const el = document.createElement("div");
      el.style.cssText = `
      position: absolute;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: rgba(${glowColor}, 1);
      box-shadow: 0 0 6px rgba(${glowColor}, 0.6);
      pointer-events: none;
      z-index: 100;
      left: ${x}px;
      top: ${y}px;
    `;
      return el;
    },
    [glowColor]
  );

  const clearAllParticles = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    particlesRef.current.forEach((particle) => {
      gsap.to(particle, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: "back.in(1.7)",
        onComplete: () => particle.remove(),
      });
    });
    particlesRef.current = [];
  }, []);

  const animateParticles = useCallback(() => {
    if (!cardRef.current || !isHoveredRef.current || disableAnimations) return;

    const rect = cardRef.current.getBoundingClientRect();

    for (let i = 0; i < particleCount; i++) {
      const timeoutId = setTimeout(() => {
        if (!isHoveredRef.current || !cardRef.current) return;

        const particle = createParticle(
          Math.random() * rect.width,
          Math.random() * rect.height
        );
        cardRef.current.appendChild(particle);
        particlesRef.current.push(particle);

        gsap.fromTo(
          particle,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" }
        );

        gsap.to(particle, {
          x: (Math.random() - 0.5) * 100,
          y: (Math.random() - 0.5) * 100,
          rotation: Math.random() * 360,
          duration: 2 + Math.random() * 2,
          ease: "none",
          repeat: -1,
          yoyo: true,
        });

        gsap.to(particle, {
          opacity: 0.3,
          duration: 1.5,
          ease: "power2.inOut",
          repeat: -1,
          yoyo: true,
        });
      }, i * 100);
      timeoutsRef.current.push(timeoutId);
    }
  }, [createParticle, particleCount, disableAnimations]);

  useEffect(() => {
    if (disableAnimations || !cardRef.current) return;
    const element = cardRef.current;

    const handleMouseEnter = () => {
      isHoveredRef.current = true;
      if (enableParticles) {
        animateParticles();
      }
    };

    const handleMouseLeave = () => {
      isHoveredRef.current = false;
      clearAllParticles();

      // Reset border glow
      if (enableBorderGlow) {
        element.style.setProperty("--glow-intensity", "0");
      }

      if (enableTilt || enableMagnetism) {
        gsap.to(element, {
          rotateX: 0,
          rotateY: 0,
          x: 0,
          y: 0,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Update border glow position
      if (enableBorderGlow) {
        const relativeX = (x / rect.width) * 100;
        const relativeY = (y / rect.height) * 100;
        element.style.setProperty("--glow-x", `${relativeX}%`);
        element.style.setProperty("--glow-y", `${relativeY}%`);
        element.style.setProperty("--glow-intensity", "1");
      }

      if (enableTilt) {
        const rotateX = ((y - centerY) / centerY) * -8 * tiltIntensity;
        const rotateY = ((x - centerX) / centerX) * 8 * tiltIntensity;
        gsap.to(element, {
          rotateX,
          rotateY,
          duration: 0.2,
          ease: "power2.out",
          transformPerspective: 1000,
        });
      }

      if (enableMagnetism) {
        const magnetX = (x - centerX) * 0.03 * magnetismIntensity;
        const magnetY = (y - centerY) * 0.03 * magnetismIntensity;
        gsap.to(element, {
          x: magnetX,
          y: magnetY,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (!clickEffect) return;

      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const maxDistance = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - rect.width, y),
        Math.hypot(x, y - rect.height),
        Math.hypot(x - rect.width, y - rect.height)
      );

      const ripple = document.createElement("div");
      ripple.style.cssText = `
        position: absolute;
        width: ${maxDistance * 2}px;
        height: ${maxDistance * 2}px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(${glowColor}, 0.4) 0%, rgba(${glowColor}, 0.2) 30%, transparent 70%);
        left: ${x - maxDistance}px;
        top: ${y - maxDistance}px;
        pointer-events: none;
        z-index: 1000;
      `;
      element.appendChild(ripple);

      gsap.fromTo(
        ripple,
        { scale: 0, opacity: 1 },
        {
          scale: 1,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
          onComplete: () => ripple.remove(),
        }
      );
    };

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);
    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("click", handleClick);

    return () => {
      isHoveredRef.current = false;
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("click", handleClick);
      clearAllParticles();
    };
  }, [
    animateParticles,
    clearAllParticles,
    disableAnimations,
    enableTilt,
    enableMagnetism,
    clickEffect,
    enableParticles,
    glowColor,
  ]);

  return (
    <>
      <style>{`
        .interactive-glass-card {
          --glow-x: 50%;
          --glow-y: 50%;
          --glow-intensity: 0;
          --glow-radius: 200px;
        }
        
        .interactive-glass-card.border-glow::after {
          content: '';
          position: absolute;
          inset: 0;
          padding: 2px;
          background: radial-gradient(
            var(--glow-radius) circle at var(--glow-x) var(--glow-y),
            rgba(${glowColor}, calc(var(--glow-intensity) * 0.8)) 0%,
            rgba(${glowColor}, calc(var(--glow-intensity) * 0.4)) 30%,
            transparent 60%
          );
          border-radius: inherit;
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: subtract;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          pointer-events: none;
          transition: opacity 0.3s ease;
          z-index: 1;
          opacity: 0;
        }
        
        .interactive-glass-card.border-glow:hover::after {
          opacity: 1;
        }
        
        /* Prevent horizontal scrollbar from appearing */
        .interactive-glass-card-container {
          overflow: visible;
        }
      `}</style>
      <div className="interactive-glass-card-container">
        <div
          ref={cardRef}
          className={`interactive-glass-card relative ${enableBorderGlow ? "border-glow" : ""}`}
          style={
            {
              transformStyle: "preserve-3d",
              "--glow-x": "50%",
              "--glow-y": "50%",
              "--glow-intensity": "0",
              "--glow-radius": "200px",
            } as React.CSSProperties
          }
        >
          <GlassCard
            className={className}
            neonColor={neonColor}
            onClick={onClick}
            hover={hover}
          >
            {children}
          </GlassCard>
        </div>
      </div>
    </>
  );
};

export default InteractiveGlassCard;
