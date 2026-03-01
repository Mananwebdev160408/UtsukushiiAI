"use client";

import { useState } from "react";

import {
  Settings,
  Maximize,
  Target,
  Trash2,
  ArrowUpRight,
  Search,
  Activity,
  Layers,
  Wand2,
  Scissors,
  Cpu,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function PanelEditor() {
  const [activeTab, setActiveTab] = useState("Depth EST");

  return (
    <aside className="w-full h-full border-l-4 border-black dark:border-white bg-[#1f230f] flex flex-col z-40 relative font-display overflow-hidden">
      {/* Tab Switcher */}
      <div className="flex border-b-4 border-black dark:border-white bg-background-dark">
        <button className="flex-1 py-4 text-center font-black text-xs uppercase bg-primary text-black border-r-4 border-black italic tracking-widest transition-all">
          Depth EST
        </button>
        <button className="flex-1 py-4 text-center font-black text-xs uppercase text-white/40 hover:text-white hover:bg-white/5 transition-all italic tracking-widest">
          Parallax
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-primary scrollbar-track-black">
        {/* Depth Map Preview */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-black uppercase text-white tracking-[0.2em] italic">
              Depth Map Preview
            </label>
            <span className="text-[9px] font-mono text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 font-bold">
              GENERATED
            </span>
          </div>
          <div className="w-full aspect-video bg-slate-900 border-4 border-black relative overflow-hidden group shadow-hard-sm">
            <div
              className="absolute inset-0 bg-cover bg-center grayscale contrast-150 opacity-70"
              style={{ backgroundImage: "url('/images/hero.png')" }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex items-end p-3">
              <button className="w-full bg-black/60 hover:bg-primary hover:text-black border-2 border-white/10 text-[10px] py-1.5 uppercase font-black tracking-widest transition-all italic">
                Regenerate Map
              </button>
            </div>
          </div>
        </div>

        {/* Parameters */}
        <div className="space-y-8 pt-4">
          <ControlSlider label="Depth Separation" value={85} />
          <ControlSlider label="Edge Dilate" value={20} suffix="px" />

          {/* Toggles */}
          <div className="space-y-4 pt-6 border-t-2 border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-white uppercase italic tracking-widest">
                Invert Map
              </span>
              <button className="w-12 h-7 bg-black border-4 border-slate-700 relative transition-all group">
                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-slate-700 group-hover:bg-slate-500 transition-all"></div>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-white uppercase italic tracking-widest">
                Smart Fill
              </span>
              <button className="w-12 h-7 bg-primary border-4 border-primary relative shadow-[0_0_15px_rgba(204,255,0,0.3)] transition-all">
                <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-black"></div>
              </button>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-6">
          <button className="w-full py-5 bg-white text-black font-black uppercase tracking-[0.2em] text-xs border-4 border-black shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-3 italic">
            <Scissors className="w-5 h-5" />
            Split Layers
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-black/40 border-l-4 border-primary p-4 space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <Activity className="w-3 h-3" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              System Log
            </span>
          </div>
          <p className="text-[10px] font-mono text-white/40 leading-relaxed uppercase">
            GPU Memory utilization at 45%.
            <br />
            Depth estimation model v2.1 loaded. <br />
            Ready for slice command.
          </p>
        </div>
      </div>
    </aside>
  );
}

function ControlSlider({
  label,
  value,
  suffix = "%",
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">
          {label}
        </label>
        <span className="text-xs font-mono font-black text-primary">
          {value}
          {suffix}
        </span>
      </div>
      <div className="relative h-2 w-full bg-black border-2 border-slate-800">
        <div
          className="absolute top-0 left-0 h-full bg-primary shadow-[0_0_10px_rgba(204,255,0,0.4)]"
          style={{ width: `${value}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-5 bg-primary border-2 border-black -ml-2"
          style={{ left: `${value}%` }}
        />
      </div>
    </div>
  );
}
