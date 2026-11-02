'use client';

import React, { useRef, useState, MouseEvent } from 'react';
import { motion } from 'framer-motion';

interface MagneticButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
}

export default function MagneticButton({
  children,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
}: MagneticButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    if (disabled || !btnRef.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = btnRef.current.getBoundingClientRect();
    const x = (clientX - (left + width / 2)) * 0.18;
    const y = (clientY - (top + height / 2)) * 0.18;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={btnRef}
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 200, damping: 15, mass: 0.2 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      className={`relative inline-flex items-center justify-center font-bold rounded-xl transition-shadow select-none overflow-hidden cursor-pointer ${className}`}
    >
      {/* Background Pulse Glow */}
      {!disabled && (
        <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#FF7A1A] to-[#FF4D00] opacity-90 blur-sm pointer-events-none -z-10 group-hover:opacity-100 transition-opacity" />
      )}
      {children}
    </motion.button>
  );
}
