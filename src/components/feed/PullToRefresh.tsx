import { useState, useRef, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";

const PULL_THRESHOLD = 80;
const MAX_PULL = 120;

interface PullToRefreshProps {
  children: React.ReactNode;
  queryKeys?: string[][];
}

export function PullToRefresh({ children, queryKeys = [["posts"]] }: PullToRefreshProps) {
  const [refreshing, setRefreshing] = useState(false);
  const pullY = useMotionValue(0);
  const touchStartY = useRef(0);
  const isPulling = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const indicatorY = useTransform(pullY, [0, MAX_PULL], [0, MAX_PULL]);
  const indicatorOpacity = useTransform(pullY, [0, 30, PULL_THRESHOLD], [0, 0.5, 1]);
  const indicatorRotate = useTransform(pullY, [0, MAX_PULL], [0, 360]);
  const indicatorScale = useTransform(pullY, [0, PULL_THRESHOLD, MAX_PULL], [0.5, 1, 1.1]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (refreshing) return;
    const scrollTop = containerRef.current?.closest("[data-scroll-container]")?.scrollTop
      ?? document.documentElement.scrollTop
      ?? window.scrollY;
    if (scrollTop <= 0) {
      touchStartY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  }, [refreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling.current || refreshing) return;
    const delta = Math.max(0, e.touches[0].clientY - touchStartY.current);
    const dampened = Math.min(MAX_PULL, delta * 0.5);
    pullY.set(dampened);
  }, [refreshing, pullY]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current || refreshing) return;
    isPulling.current = false;

    if (pullY.get() >= PULL_THRESHOLD) {
      setRefreshing(true);
      animate(pullY, PULL_THRESHOLD * 0.6, { duration: 0.2 });

      await Promise.all(
        queryKeys.map((key) => queryClient.invalidateQueries({ queryKey: key }))
      );
      // Small delay for visual feedback
      await new Promise((r) => setTimeout(r, 600));

      setRefreshing(false);
    }

    animate(pullY, 0, { duration: 0.3, type: "spring", stiffness: 300, damping: 30 });
  }, [refreshing, pullY, queryClient, queryKeys]);

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {/* Pull indicator */}
      <motion.div
        style={{ y: indicatorY, opacity: indicatorOpacity, scale: indicatorScale }}
        className="absolute left-1/2 -translate-x-1/2 -top-2 z-10 flex items-center justify-center"
      >
        <div className={`h-10 w-10 rounded-full flex items-center justify-center shadow-lg border border-border ${
          refreshing ? "bg-primary text-primary-foreground" : "bg-card text-primary"
        }`}>
          <motion.div style={{ rotate: refreshing ? undefined : indicatorRotate }}>
            <RefreshCw className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`} />
          </motion.div>
        </div>
      </motion.div>

      {/* Content with pull offset */}
      <motion.div style={{ y: indicatorY }}>
        {children}
      </motion.div>
    </div>
  );
}
