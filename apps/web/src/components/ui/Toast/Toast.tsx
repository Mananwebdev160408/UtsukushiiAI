'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useUIStore } from '@/stores/uiStore';

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const styles = {
  success: 'border-emerald-500/30 bg-emerald-500/10',
  error: 'border-red-500/30 bg-red-500/10',
  info: 'border-blue-500/30 bg-blue-500/10',
  warning: 'border-amber-500/30 bg-amber-500/10',
};

const iconColors = {
  success: 'text-emerald-400',
  error: 'text-red-400',
  info: 'text-blue-400',
  warning: 'text-amber-400',
};

function ToastItem({
  id,
  type,
  message,
  duration = 5000,
}: {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}) {
  const removeToast = useUIStore((s) => s.removeToast);
  const Icon = icons[type];

  useEffect(() => {
    const timer = setTimeout(() => removeToast(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, removeToast]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex items-start gap-3 px-4 py-3 rounded-xl border',
        'bg-[#0A0A0F]/95 backdrop-blur-md shadow-2xl',
        'min-w-[320px] max-w-[420px]',
        styles[type],
      )}
    >
      <Icon className={cn('w-5 h-5 mt-0.5 shrink-0', iconColors[type])} />
      <p className="text-sm text-white/90 flex-1">{message}</p>
      <button
        onClick={() => removeToast(id)}
        className="text-white/30 hover:text-white/70 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

export function ToastContainer() {
  const toastQueue = useUIStore((s) => s.toastQueue);

  return (
    <div className="fixed top-4 right-4 z-100 flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {toastQueue.map((toast) => (
          <ToastItem
            key={toast.id}
            id={toast.id}
            type={toast.type}
            message={toast.message}
            duration={toast.duration}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
