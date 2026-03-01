"use client";

import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Sliders,
  Sparkles,
  Zap,
  Layout,
  Maximize,
  ChevronLeft,
  Volume2,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export default function StyleEditorPage() {
  const [intensity, setIntensity] = useState(75);
  const [depth, setDepth] = useState(42);
  const [glitch, setGlitch] = useState(88);
  const [aberration, setAberration] = useState(12);

  return (
    <div className="fixed inset-0 flex flex-col bg-background-dark overflow-hidden font-display selection:bg-primary selection:text-black">
      {/* Top Breadcrumb Bar */}
      <div className="h-14 bg-black border-b-4 border-black dark:border-white/10 flex items-center px-6 justify-between z-50 shrink-0">
        <div className="flex items-center gap-6">
          <Link
            href="/projects"
            className="text-white/40 hover:text-primary transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="h-6 w-px bg-white/20"></div>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-primary uppercase tracking-widest italic">
              Project / Tokyo Drift / Scene 04
            </span>
            <h1 className="text-sm font-black uppercase text-white tracking-widest italic">
              AI Animation Style Editor
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="px-6 py-2 bg-secondary text-black font-black uppercase text-xs border-2 border-black shadow-hard-xs hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all italic">
            Export
          </button>
        </div>
      </div>

      <main className="flex-1 flex overflow-hidden relative">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 z-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#363a27 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        ></div>

        {/* Left/Center: Preview Area */}
        <section className="flex-1 flex flex-col relative z-10 border-r-4 border-black bg-black/40 backdrop-blur-sm p-8 justify-center items-center">
          {/* Preview Container */}
          <div className="relative w-full max-w-[360px] aspect-[9/16] group">
            <div
              className="w-full h-full bg-cover bg-center border-[6px] border-black relative overflow-hidden shadow-hard transition-all group-hover:grayscale-0 grayscale contrast-125"
              style={{ backgroundImage: "url('/images/hero.png')" }}
            >
              {/* Overlay UI */}
              <div className="absolute top-4 right-4 bg-black/80 text-primary px-2 py-1 font-mono text-[10px] border border-primary animate-pulse">
                REC ●
              </div>

              {/* Face Tracking Simulation */}
              <div className="absolute top-[20%] left-[30%] w-[40%] h-[15%] border-2 border-accent shadow-[0_0_10px_#00ffff]">
                <div className="absolute -top-5 left-0 text-accent font-mono text-[8px] bg-black px-1 uppercase tracking-tighter">
                  FACE_TRACK_01
                </div>
              </div>

              {/* CRT Scanline Effect */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,6px_100%] pointer-events-none opacity-30"></div>
            </div>

            {/* Playback Controls */}
            <div className="absolute -bottom-16 left-0 right-0 flex items-center justify-between px-4">
              <button className="text-white/40 hover:text-primary transition-colors">
                <SkipBack className="w-8 h-8" />
              </button>
              <button className="bg-primary text-black rounded-full p-4 hover:scale-110 transition-transform border-4 border-black shadow-hard-xs">
                <Play className="w-8 h-8 fill-black" />
              </button>
              <button className="text-white/40 hover:text-primary transition-colors">
                <SkipForward className="w-8 h-8" />
              </button>
            </div>
          </div>

          <div className="absolute bottom-8 right-8 font-mono text-[10px] text-white/20 text-right uppercase tracking-[0.2em]">
            RENDER_TIME: 0.04s <br />
            RES: 1080x1920
          </div>
        </section>

        {/* Right: Control Panel */}
        <aside className="w-full lg:w-[420px] bg-[#0a0a0a] flex flex-col border-l-4 border-black z-20 overflow-y-auto">
          <div className="p-8 border-b-4 border-black bg-background-dark/50">
            <h3 className="text-primary font-mono text-xs font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
              <Zap className="w-4 h-4" /> Global Style Matrix
            </h3>

            <div className="relative">
              <select className="w-full bg-black text-white border-4 border-white/10 px-5 py-4 font-mono text-sm focus:outline-none focus:border-primary appearance-none cursor-pointer hover:bg-white/5 transition-all uppercase tracking-widest italic font-bold">
                <option>Cyberpunk Noir</option>
                <option>Retro 90s Anime</option>
                <option>Sketch Lineart</option>
                <option>Oil Painting</option>
              </select>
            </div>
          </div>

          <div className="flex-1 p-8 space-y-12">
            {/* Motion Group */}
            <div className="space-y-8">
              <div className="flex justify-between items-end border-b-2 border-white/10 pb-2">
                <label className="text-white font-black font-display uppercase tracking-widest text-xl italic">
                  Motion Core
                </label>
                <span className="text-white/20 font-mono text-[10px]">
                  GRP_01
                </span>
              </div>

              <Slider
                label="Motion Intensity"
                value={intensity}
                onChange={setIntensity}
                color="primary"
              />
              <Slider
                label="Parallax Depth"
                value={depth}
                onChange={setDepth}
                color="primary"
              />
            </div>

            {/* FX Group */}
            <div className="space-y-8">
              <div className="flex justify-between items-end border-b-2 border-white/10 pb-2">
                <label className="text-white font-black font-display uppercase tracking-widest text-xl italic">
                  FX Processor
                </label>
                <span className="text-white/20 font-mono text-[10px]">
                  GRP_02
                </span>
              </div>

              <Slider
                label="Glitch Frequency"
                value={glitch}
                onChange={setGlitch}
                color="secondary"
              />
              <Slider
                label="Chromatic Aberration"
                value={aberration}
                onChange={setAberration}
                color="secondary"
              />
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-1 gap-4">
              <ToggleRow label="Face Preservation" active={true} />
              <ToggleRow label="Temporal Consistency" active={false} />
            </div>

            {/* Prompt Box */}
            <div className="space-y-4">
              <label className="block text-white/40 font-mono text-[10px] uppercase tracking-widest font-black">
                Negative Prompt Link
              </label>
              <textarea
                className="w-full bg-black text-white border-4 border-white/10 p-5 font-mono text-xs focus:outline-none focus:border-primary focus:bg-primary/5 h-32 resize-none transition-all shadow-inner"
                placeholder="Enter elements to exclude..."
                defaultValue="low quality, blurry, mutated hands, text, watermark"
              />
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="p-8 bg-black border-t-4 border-black sticky bottom-0 z-30">
            <div className="flex items-center justify-between mb-6">
              <span className="text-white/20 font-mono text-[9px] uppercase tracking-[0.3em]">
                EST. COST: 4 CREDITS
              </span>
              <button className="text-primary hover:text-white font-mono text-[10px] uppercase tracking-widest font-bold underline decoration-dotted decoration-primary/40 underline-offset-4">
                Reset Defaults
              </button>
            </div>
            <button className="w-full h-16 bg-primary text-black font-display font-black text-xl uppercase italic tracking-wider border-4 border-black shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-3 active:scale-95">
              <Sparkles className="w-6 h-6" />
              Apply Style
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
}

function Slider({
  label,
  value,
  onChange,
  color,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  color: "primary" | "secondary";
}) {
  return (
    <div className="group">
      <div className="flex justify-between mb-4 font-mono text-[10px] uppercase font-black tracking-widest">
        <span className="text-white/40">{label}</span>
        <span
          className={cn(
            color === "primary" ? "text-primary" : "text-secondary",
          )}
        >
          {value}%
        </span>
      </div>
      <div className="relative h-6 flex items-center cursor-pointer">
        <div className="absolute w-full h-2 bg-black border-2 border-white/5"></div>
        <div
          className={cn(
            "absolute h-2 border-y-2 border-l-2 border-black transition-all",
            color === "primary" ? "bg-primary" : "bg-secondary",
          )}
          style={{ width: `${value}%` }}
        ></div>
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div
          className={cn(
            "absolute w-4 h-8 border-4 border-black shadow-hard-xs transition-all pointer-events-none",
            color === "primary" ? "bg-primary" : "bg-secondary",
          )}
          style={{ left: `calc(${value}% - 8px)` }}
        ></div>
      </div>
    </div>
  );
}

function ToggleRow({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center justify-between p-5 bg-black border-4 border-white/5 hover:border-white/10 transition-all group">
      <span className="font-mono text-[10px] text-white uppercase tracking-widest font-black italic">
        {label}
      </span>
      <button
        className={cn(
          "w-12 h-6 border-4 relative transition-all",
          active ? "bg-secondary border-secondary" : "bg-black border-white/20",
        )}
      >
        <div
          className={cn(
            "absolute top-0.5 w-4 h-4 border-2 border-black transition-all",
            active ? "right-0.5 bg-black" : "left-0.5 bg-white/20",
          )}
        ></div>
      </button>
    </div>
  );
}
