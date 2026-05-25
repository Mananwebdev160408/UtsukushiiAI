"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Zap, Layers, Music, Cpu, CheckCircle2 } from "lucide-react";

const PHASES = [
  { label: "Analyzing Manga Composition", icon: Layers },
  { label: "Extracting Character Layers", icon: Cpu },
  { label: "Injecting Beat Sync Transients", icon: Music },
  { label: "Synthesizing Kinetic Motion", icon: Zap },
  { label: "Finalizing Project Database", icon: CheckCircle2 },
];

export function UploadProgress({
  progress,
  phaseIndex,
  fileName,
}: {
  progress: number;
  phaseIndex: number;
  fileName?: string;
}) {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const currentPhase = PHASES[Math.min(phaseIndex, PHASES.length - 1)];
  const PhaseIcon = currentPhase.icon;

  return (
    <div className="relative w-full overflow-hidden bg-black border-4 border-primary p-8 shadow-neo">
      {/* Animated scan line */}
      <motion.div
        className="absolute inset-x-0 h-[2px] bg-primary/40 pointer-events-none"
        animate={{ top: ["0%", "100%", "0%"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full"
          />
          <div>
            <p className="font-mono text-[10px] text-primary uppercase tracking-[0.4em] font-black">
              FORGE_ENGINE // ACTIVE
            </p>
            {fileName && (
              <p className="font-mono text-xs text-white/40 mt-1 truncate max-w-[200px]">
                {fileName}
              </p>
            )}
          </div>
        </div>
        <motion.div
          key={phaseIndex}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-12 h-12 bg-primary/10 border-2 border-primary flex items-center justify-center"
        >
          <PhaseIcon className="w-6 h-6 text-primary" />
        </motion.div>
      </div>

      {/* Phase Text */}
      <div className="mb-6 min-h-[28px]">
        <AnimatePresence mode="wait">
          <motion.p
            key={phaseIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="font-display font-black text-xl uppercase italic text-white tracking-tight"
          >
            {currentPhase.label}
            <span className="text-primary animate-pulse">...</span>
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Progress Bar */}
      <div className="space-y-3">
        <div className="flex justify-between font-mono text-[10px] font-black uppercase tracking-widest">
          <span className="text-white/40">Cluster_Compute_Load</span>
          <span className="text-primary">{Math.round(clampedProgress)}%</span>
        </div>
        <div className="h-6 bg-black border-2 border-white/10 p-1 relative overflow-hidden">
          <motion.div
            className="h-full bg-primary relative"
            initial={{ width: "0%" }}
            animate={{ width: `${clampedProgress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Shimmer */}
            <motion.div
              className="absolute inset-y-0 right-0 w-8 bg-white/30"
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </motion.div>
        </div>
      </div>

      {/* Phase steps */}
      <div className="mt-8 flex items-center gap-2">
        {PHASES.map((phase, i) => (
          <motion.div
            key={i}
            className="flex-1 h-1 rounded-full overflow-hidden bg-white/10"
            initial={false}
          >
            <motion.div
              className="h-full bg-primary"
              animate={{ width: i < phaseIndex ? "100%" : i === phaseIndex ? `${(clampedProgress % (100 / PHASES.length)) * PHASES.length}%` : "0%" }}
              transition={{ duration: 0.4 }}
            />
          </motion.div>
        ))}
      </div>

      {/* Console log lines */}
      <div className="mt-6 bg-black/60 border border-white/5 p-4 font-mono text-[9px] space-y-1">
        {PHASES.slice(0, Math.min(phaseIndex + 1, PHASES.length)).map((p, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={i === phaseIndex ? "text-primary" : "text-white/30"}
          >
            &gt; {i === phaseIndex ? "RUNNING" : "DONE"} — {p.label.toUpperCase()}
          </motion.p>
        ))}
      </div>
    </div>
  );
}
