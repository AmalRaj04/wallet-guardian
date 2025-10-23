'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  neonColor?: 'blue' | 'purple' | 'pink' | 'green';
  onClick?: () => void;
  hover?: boolean;
}

export default function GlassCard({ 
  children, 
  className, 
  neonColor, 
  onClick, 
  hover = true 
}: GlassCardProps) {
  const neonClasses = {
    blue: 'border-neon-blue/30 shadow-neon-blue/20',
    purple: 'border-neon-purple/30 shadow-neon-purple/20',
    pink: 'border-neon-pink/30 shadow-neon-pink/20',
    green: 'border-neon-green/30 shadow-neon-green/20',
  };

  return (
    <motion.div
      className={cn(
        'glass-card',
        neonColor && neonClasses[neonColor],
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      whileHover={hover ? { scale: 1.02, y: -2 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {children}
    </motion.div>
  );
}