"use client";

import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Music,
  Layers,
  Trash2,
  Scissors,
  Activity,
  Plus,
  Undo2,
  Redo2,
  Minimize2,
  Scan,
  Zap,
  Volume2,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

export function Timeline() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(165); // 00:02:45:00
  const duration = 900; // 15:00 minutes

  return (
    <div className="h-full flex flex-col bg-[#171810] border-t-6 border-black z-40 relative overflow-hidden font-display">
      {/* Timeline Toolbar */}
      <div className="h-16 bg-[#252525] border-b-4 border-black flex items-center px-4 justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 pr-4 border-r-2 border-white/10">
            <button className="bg-white/5 border-2 border-black p-2 hover:bg-primary hover:text-black transition-all shadow-hard-xs active:shadow-none active:translate-y-0.5">
              <Undo2 className="w-4 h-4" />
            </button>
            <button className="bg-white/5 border-2 border-black p-2 hover:bg-primary hover:text-black transition-all shadow-hard-xs active:shadow-none active:translate-y-0.5">
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 pl-2">
            <button
              className="bg-white/5 border-2 border-black p-2 hover:bg-secondary hover:text-white transition-all shadow-hard-xs active:shadow-none active:translate-y-0.5"
              title="Split Clip"
            >
              <Scissors className="w-4 h-4" />
            </button>
            <button
              className="bg-white/5 border-2 border-black p-2 hover:bg-primary hover:text-black transition-all shadow-hard-xs active:shadow-none active:translate-y-0.5"
              title="Magnet Snap"
            >
              <Scan className="w-4 h-4" />
            </button>
            <button className="bg-secondary text-white border-4 border-black px-4 py-1.5 font-black uppercase text-[10px] hover:bg-secondary/80 transition-all shadow-hard-xs ml-2 flex items-center gap-2 italic tracking-widest">
              <Zap className="w-3.5 h-3.5 fill-white" />
              Auto-Sync
            </button>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="bg-black px-6 py-2 border-2 border-white/10 flex items-center justify-center">
            <span className="text-primary font-mono text-xl font-black tracking-[0.2em]">
              {formatTimeFull(currentTime)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black uppercase text-white/40 tracking-widest italic">
            Zoom Level
          </span>
          <input
            type="range"
            className="w-32 accent-primary h-2 bg-black border border-white/10 rounded-none appearance-none cursor-pointer"
          />
        </div>
      </div>

      {/* Tracks Area */}
      <div className="flex-1 overflow-x-auto overflow-y-auto relative bg-[#1a1a1a] p-4 custom-scrollbar">
        {/* Time Ruler */}
        <div className="h-8 w-[3000px] border-b-2 border-white/10 flex items-end text-[9px] text-white/40 font-mono select-none mb-4 tracking-widest pb-1 sticky top-0 bg-[#1a1a1a] z-20">
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className="flex-1 border-l border-white/20 pl-1"
              style={{ width: "75px" }}
            >
              {(i * 15).toString().padStart(2, "0")}:00
            </div>
          ))}
        </div>

        {/* Video Track 1 */}
        <div className="h-14 w-[3000px] bg-slate-900/30 mb-2 border-2 border-black relative group shadow-hard-xs">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 z-10"></div>
          <span className="absolute left-4 top-1.5 text-[8px] font-black text-blue-400 bg-black/80 px-2 py-0.5 border border-blue-900 uppercase italic tracking-widest z-20">
            VISUAL_LAYER
          </span>

          {/* Clips */}
          <div className="absolute left-[5%] w-[18%] h-full bg-blue-500/20 border-r-2 border-blue-500/40 overflow-hidden group/clip">
            <div
              className="absolute inset-0 bg-cover bg-center grayscale opacity-40"
              style={{ backgroundImage: "url('/images/hero.png')" }}
            />
          </div>
        </div>

        {/* Audio Track */}
        <div className="h-20 w-[3000px] bg-black border-2 border-black relative overflow-hidden flex items-end shadow-hard-xs">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary z-10"></div>
          <span className="absolute left-4 top-2 text-[8px] font-black text-primary bg-black/80 px-2 py-0.5 border border-primary z-20 italic tracking-widest uppercase">
            MASTER_SYNC
          </span>

          <div className="flex items-end gap-[2px] h-full w-full px-4 py-4 opacity-60">
            {[...Array(200)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-primary/30 hover:bg-primary transition-colors"
                style={{ height: `${Math.random() * 60 + 10}%` }}
              />
            ))}
          </div>
        </div>

        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 z-50 pointer-events-none flex flex-col items-center"
          style={{ left: `${(currentTime / duration) * 100}%` }}
        >
          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-10 border-t-secondary"></div>
          <div className="w-[2px] flex-1 bg-secondary shadow-[1px_0_0_0_#000]"></div>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="h-20 bg-black border-t-4 border-black flex justify-center items-center gap-10 relative z-50">
        <button className="text-white/40 hover:text-white transition-colors">
          <SkipBack className="w-6 h-6" />
        </button>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="bg-primary text-black border-2 border-white shadow-hard-sm hover:translate-y-1 hover:shadow-none transition-all active:scale-95 p-4 flex items-center justify-center group"
        >
          {isPlaying ? (
            <Pause className="w-8 h-8 fill-black" />
          ) : (
            <Play className="w-8 h-8 fill-black" />
          )}
        </button>

        <button className="text-white/40 hover:text-white transition-colors">
          <SkipForward className="w-6 h-6" />
        </button>

        <div className="absolute right-8 flex items-center gap-3 text-white/40">
          <Volume2 className="w-5 h-5" />
          <div className="w-24 h-1.5 bg-white/10 relative">
            <div className="absolute left-0 top-0 h-full w-2/3 bg-white"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTimeFull(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = "12";
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}:${ms}`;
}
