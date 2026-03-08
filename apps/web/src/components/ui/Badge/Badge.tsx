'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';

// ── Badge / Chip ──────────────────────────────────────────────────────

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neon';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

const badgeStyles: Record<BadgeVariant, string> = {
  default: 'bg-white/10 text-white/70',
  success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  warning: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  danger: 'bg-red-500/15 text-red-400 border-red-500/20',
  info: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  neon: 'bg-[#C8FF00]/10 text-[#C8FF00] border-[#C8FF00]/20',
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-white/50',
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  danger: 'bg-red-400',
  info: 'bg-blue-400',
  neon: 'bg-[#C8FF00]',
};

export function Badge({ variant = 'default', children, dot = false, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full border border-transparent',
        badgeStyles[variant],
        className,
      )}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />
      )}
      {children}
    </span>
  );
}

// ── Tooltip ───────────────────────────────────────────────────────────

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

const tooltipPositions = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

export function Tooltip({ content, children, position = 'top' }: TooltipProps) {
  return (
    <div className="relative group inline-flex">
      {children}
      <div
        className={cn(
          'absolute z-50 px-2.5 py-1.5 text-xs font-medium text-white bg-[#1A1A2A] border border-white/10 rounded-lg',
          'opacity-0 invisible group-hover:opacity-100 group-hover:visible',
          'transition-all duration-150 whitespace-nowrap pointer-events-none',
          'shadow-xl',
          tooltipPositions[position],
        )}
      >
        {content}
      </div>
    </div>
  );
}

// ── Select ────────────────────────────────────────────────────────────

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export function Select({ label, error, options, className, id, ...props }: SelectProps) {
  const selectId = id || `select-${label?.toLowerCase().replace(/\s/g, '-')}`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium mb-1.5 text-white/60">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white',
          'focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/30 focus:border-[#C8FF00]/50',
          'transition-all duration-200 appearance-none cursor-pointer',
          '[&>option]:bg-[#0A0A0F] [&>option]:text-white',
          className,
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
