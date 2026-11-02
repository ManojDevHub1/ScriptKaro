'use client';

import React, { useRef, useState, MouseEvent } from 'react';

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
}

export default function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(255, 122, 26, 0.12)',
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden rounded-2xl glass-panel transition-all duration-300 border border-white/[0.08] hover:border-[#FF7A1A]/40 group ${className}`}
    >
      {/* Dynamic Cursor Spotlight (Desktop/Mouse) */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 hidden md:block"
        style={{
          opacity,
          background: `radial-gradient(420px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 75%)`,
        }}
      />

      {/* Static Accent Highlights */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-[#FF7A1A]/[0.02] to-transparent pointer-events-none" />

      {/* Child Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
