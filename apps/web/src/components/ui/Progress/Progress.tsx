'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';

// ── Progress Bar ──────────────────────────────────────────────────────

interface ProgressProps {
  value: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
}

const barColors = {
  default: 'from-[#C8FF00] to-[#a8df00]',
  success: 'from-emerald-400 to-green-500',
  warning: 'from-amber-400 to-yellow-500',
  danger: 'from-red-400 to-rose-500',
};

const barHeights = { sm: 'h-1', md: 'h-2', lg: 'h-3' };

export function Progress({
  value,
  size = 'md',
  variant = 'default',
  showLabel = false,
  label,
  animated = true,
}: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className="w-full">
      {(showLabel || label) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-xs text-white/50">{label}</span>}
          {showLabel && <span className="text-xs font-mono text-white/60">{Math.round(clamped)}%</span>}
        </div>
      )}
      <div className={cn('w-full bg-white/5 rounded-full overflow-hidden', barHeights[size])}>
        <div
          className={cn(
            'h-full rounded-full bg-linear-to-r transition-all duration-500 ease-out',
            barColors[variant],
            animated && clamped < 100 && 'animate-pulse',
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

const spinnerSizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };

export function Spinner({ size = 'md', color = '#C8FF00' }: SpinnerProps) {
  return (
    <svg
      className={cn('animate-spin', spinnerSizes[size])}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke={color} strokeWidth="4" />
      <path
        className="opacity-75"
        fill={color}
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// ── Skeleton Loader ───────────────────────────────────────────────────

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className, variant = 'text', width, height }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-white/5 rounded',
        variant === 'circular' && 'rounded-full',
        variant === 'text' && 'rounded h-4',
        className,
      )}
      style={{ width, height }}
    />
  );
}
