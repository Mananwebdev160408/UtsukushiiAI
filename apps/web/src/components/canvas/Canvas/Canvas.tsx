"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Maximize,
  Minimize,
  Layers,
  Activity,
  Trash2,
  Plus,
  Minus,
  Move,
  CornerDownRight,
  Sparkles,
  Hand,
  Crop,
  Brush,
  PlayCircle,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function Canvas() {
  const [zoom, setZoom] = useState(1);
  const [selectedPanel, setSelectedPanel] = useState<string | null>(null);

  const panels = [
    { id: "p1", x: 10, y: 10, w: 40, h: 40, type: "mask", label: "Char_01" },
    { id: "p2", x: 55, y: 10, w: 35, h: 25, type: "prop", label: "Effect_04" },
    { id: "p3", x: 10, y: 55, w: 80, h: 35, type: "mask", label: "BG_01" },
  ];

  return (
    <div className="h-full flex flex-col bg-background-dark relative overflow-hidden bg-dot-grid">
      {/* Canvas Toolbar Overlay */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-black border-4 border-black dark:border-white shadow-neo z-40">
        <button className="p-3 text-primary hover:bg-white/10 transition-colors uppercase font-black text-[10px] flex items-center gap-2">
          <Hand className="w-4 h-4" />
        </button>
        <button className="p-3 text-white hover:bg-white/10 transition-colors uppercase font-black text-[10px] flex items-center gap-2">
          <Crop className="w-4 h-4" />
        </button>
        <button className="p-3 text-white hover:bg-white/10 transition-colors uppercase font-black text-[10px] flex items-center gap-2">
          <Brush className="w-4 h-4" />
        </button>
        <div className="w-[2px] h-8 bg-white/20 mx-2" />
        <button className="p-3 text-secondary hover:bg-white/10 transition-colors uppercase font-black text-[10px] flex items-center gap-2">
          <PlayCircle className="w-4 h-4" />
        </button>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 relative overflow-auto cursor-crosshair flex items-center justify-center p-20">
        <div
          className="relative transition-transform duration-200 ease-out"
          style={{
            transform: `scale(${zoom})`,
          }}
        >
          {/* The Stage */}
          <div className="relative aspect-[9/16] h-[60vh] max-h-[750px] min-h-[400px] bg-black border-4 border-black dark:border-white shadow-neo overflow-hidden group">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-50 grayscale transition-all duration-500 group-hover:grayscale-0"
              style={{ backgroundImage: "url('/images/hero.png')" }}
            />

            {/* Grid Overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            ></div>

            {/* Panels / Masks */}
            {panels.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedPanel(p.id)}
                className={cn(
                  "absolute border-2 transition-all cursor-move",
                  p.type === "mask"
                    ? "border-secondary/50 bg-secondary/10"
                    : "border-tertiary/50 bg-tertiary/10",
                  selectedPanel === p.id &&
                    (p.type === "mask"
                      ? "border-secondary border-4"
                      : "border-tertiary border-4"),
                )}
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: `${p.w}%`,
                  height: `${p.h}%`,
                }}
              >
                {/* SVG Outline for mask */}
                {p.type === "mask" && (
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    style={{ filter: "drop-shadow(0 0 2px #ff00ff)" }}
                  >
                    <path
                      d="M10,20 Q50,0 90,20 T180,100 T150,300 T50,300 T10,100 T10,20"
                      fill="none"
                      stroke="#ff00ff"
                      strokeDasharray="5,5"
                      strokeWidth="2"
                    ></path>
                  </svg>
                )}

                {/* Info Badge */}
                <div
                  className={cn(
                    "absolute -top-7 left-0 px-2 py-0.5 text-[10px] font-black uppercase italic shadow-[2px_2px_0px_#000] border-2 border-black",
                    p.type === "mask"
                      ? "bg-secondary text-black"
                      : "bg-tertiary text-black",
                  )}
                >
                  {p.label}
                </div>

                {/* Resizers */}
                {selectedPanel === p.id && (
                  <>
                    <div
                      className={cn(
                        "absolute -top-1.5 -left-1.5 w-3 h-3 border-2 border-black",
                        p.type === "mask" ? "bg-secondary" : "bg-tertiary",
                      )}
                    />
                    <div
                      className={cn(
                        "absolute -top-1.5 -right-1.5 w-3 h-3 border-2 border-black",
                        p.type === "mask" ? "bg-secondary" : "bg-tertiary",
                      )}
                    />
                    <div
                      className={cn(
                        "absolute -bottom-1.5 -left-1.5 w-3 h-3 border-2 border-black",
                        p.type === "mask" ? "bg-secondary" : "bg-tertiary",
                      )}
                    />
                    <div
                      className={cn(
                        "absolute -bottom-1.5 -right-1.5 w-3 h-3 border-2 border-black",
                        p.type === "mask" ? "bg-secondary" : "bg-tertiary",
                      )}
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Zoom Controls (Bottom Right) */}
      <div className="absolute bottom-6 right-6 flex items-center gap-2 bg-black border-4 border-black p-1 shadow-hard-sm z-40">
        <button
          onClick={() => setZoom((z) => Math.max(0.2, z - 0.1))}
          className="p-2 text-white/40 hover:text-primary transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <div className="w-12 text-center">
          <span className="font-mono text-[10px] text-white font-black">
            {Math.round(zoom * 100)}%
          </span>
        </div>
        <button
          onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
          className="p-2 text-white/40 hover:text-primary transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
