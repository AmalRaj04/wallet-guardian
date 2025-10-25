"use client";

import { useEffect, useRef, ReactNode } from "react";

interface InfiniteScrollProps {
  children: ReactNode;
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  threshold?: number;
  className?: string;
}

export default function InfiniteScroll({
  children,
  hasMore,
  isLoading,
  onLoadMore,
  threshold = 100,
  className = "",
}: InfiniteScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const loading = loadingRef.current;
    if (!container || !loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      { root: container, rootMargin: `${threshold}px`, threshold: 0.1 }
    );

    observer.observe(loading);
    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore, threshold]);

  return (
    <div ref={containerRef} className={className}>
      {children}
      <div ref={loadingRef} className="h-4" />
      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-blue" />
        </div>
      )}
    </div>
  );
}
