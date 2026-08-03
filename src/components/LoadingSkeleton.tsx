import React from 'react';
import { motion } from 'motion/react';

export const ShimmerPulse: React.FC<{ className?: string }> = ({ className = 'h-4 w-full' }) => {
  return (
    <div
      className={`relative overflow-hidden bg-zinc-200/80 dark:bg-zinc-800/80 rounded-lg ${className}`}
    >
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 dark:via-zinc-700/50 to-transparent"
        animate={{ translateX: ['-100%', '100%'] }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: 'linear',
        }}
      />
    </div>
  );
};

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <ShimmerPulse className="h-4 w-24" />
            <ShimmerPulse className="h-8 w-8 rounded-xl" />
          </div>
          <ShimmerPulse className="h-8 w-16" />
          <div className="flex items-center gap-2 pt-1">
            <ShimmerPulse className="h-3 w-12 rounded-full" />
            <ShimmerPulse className="h-3 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <ShimmerPulse className="h-6 w-40" />
        <div className="flex gap-2">
          <ShimmerPulse className="h-9 w-24 rounded-xl" />
          <ShimmerPulse className="h-9 w-24 rounded-xl" />
        </div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="flex items-center gap-4 py-2 border-b border-zinc-50 dark:border-zinc-850/50">
            {Array.from({ length: cols }).map((_, cIdx) => (
              <ShimmerPulse
                key={cIdx}
                className={`h-4 ${cIdx === 0 ? 'w-1/4' : cIdx === 1 ? 'w-1/3' : 'w-1/6'}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const GraphSkeleton: React.FC = () => {
  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <ShimmerPulse className="h-5 w-44" />
          <ShimmerPulse className="h-3 w-32" />
        </div>
        <ShimmerPulse className="h-8 w-28 rounded-xl" />
      </div>
      <div className="h-56 flex items-end justify-between gap-3 pt-6 border-b border-zinc-100 dark:border-zinc-800">
        {[40, 75, 55, 90, 65, 80, 45, 95, 70, 85].map((heightPct, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
            <div
              className="w-full bg-zinc-200/80 dark:bg-zinc-800/80 rounded-t-lg relative overflow-hidden"
              style={{ height: `${heightPct}%` }}
            >
              <ShimmerPulse className="h-full w-full" />
            </div>
            <ShimmerPulse className="h-3 w-6" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in p-1">
      {/* Top Welcome Header Skeleton */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 dark:border-emerald-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <ShimmerPulse className="h-7 w-64 rounded-lg" />
            <ShimmerPulse className="h-4 w-96 rounded-lg" />
          </div>
          <ShimmerPulse className="h-10 w-32 rounded-xl" />
        </div>
      </div>

      {/* Metric Cards Skeleton */}
      <CardSkeleton count={4} />

      {/* Main Content Split: Graph + Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <GraphSkeleton />
          <TableSkeleton rows={4} cols={4} />
        </div>
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 shadow-xs space-y-4">
            <ShimmerPulse className="h-5 w-36" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 space-y-2">
                <ShimmerPulse className="h-4 w-3/4" />
                <ShimmerPulse className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
