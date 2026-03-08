'use client';

import React, { forwardRef, useState } from 'react';
import { cn } from '@/lib/utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const inputId = id || `input-${label?.toLowerCase().replace(/\s/g, '-')}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'block text-sm font-medium mb-1.5 transition-colors',
              focused ? 'text-[#C8FF00]' : 'text-white/60',
              error && 'text-red-400',
            )}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full bg-white/5 border rounded-lg px-3 py-2.5 text-sm text-white',
              'placeholder:text-white/30',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2',
              error
                ? 'border-red-500/50 focus:ring-red-500/30 focus:border-red-400'
                : 'border-white/10 focus:ring-[#C8FF00]/30 focus:border-[#C8FF00]/50',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className,
            )}
            onFocus={(e) => {
              setFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        {hint && !error && <p className="mt-1 text-xs text-white/40">{hint}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';

// ── Textarea ──────────────────────────────────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || `textarea-${label?.toLowerCase().replace(/\s/g, '-')}`;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium mb-1.5 text-white/60">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full bg-white/5 border rounded-lg px-3 py-2.5 text-sm text-white',
            'placeholder:text-white/30 resize-none',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2',
            error
              ? 'border-red-500/50 focus:ring-red-500/30'
              : 'border-white/10 focus:ring-[#C8FF00]/30 focus:border-[#C8FF00]/50',
            className,
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
