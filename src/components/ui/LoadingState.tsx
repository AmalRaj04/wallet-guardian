"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import GlassCard from "./GlassCard";

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
  size?: "sm" | "md" | "lg";
}

export function LoadingState({
  message = "Loading...",
  fullScreen = false,
  size = "md",
}: LoadingStateProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  };

  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className={`${sizeClasses[size]} text-neon-blue`} />
      </motion.div>
      {message && (
        <p className="text-gray-400 text-sm animate-pulse">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gradient-main flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
}

interface SkeletonProps {
  className?: string;
  count?: number;
}

export function Skeleton({ className = "", count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`skeleton rounded-lg ${className}`}
          style={{
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </>
  );
}

export function CardSkeleton() {
  return (
    <GlassCard className="p-6">
      <div className="space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex space-x-2 mt-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </GlassCard>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-3 w-1/6" />
          </div>
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <GlassCard className="p-6">
      <Skeleton className="h-6 w-32 mb-4" />
      <div className="h-64 flex items-end space-x-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="flex-1" />
        ))}
      </div>
    </GlassCard>
  );
}

export default LoadingState;
