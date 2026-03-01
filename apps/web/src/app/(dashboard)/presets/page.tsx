"use client";

import { useState } from "react";
import {
  Search,
  Settings2 as Tune,
  ArrowRight,
  Star,
  Flame,
  Zap,
  Palette,
  LayoutGrid,
  Filter,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export default function PresetsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Styles");

  const filters = [
    "All Styles",
    "Black & White",
    "Neon",
    "Glitch",
    "Vintage",
    "Cyberpunk",
  ];

  const presets = [
    {
      id: "p1",
      title: "Glitch Noir",
      description:
        "High-contrast monochrome with digital artifacts and signal decay.",
      tags: ["#cyberpunk", "#manga", "#dark"],
      image: "/images/hero.png",
      popular: true,
      stats: { contrast: "Hard", grain: "ISO 3200" },
    },
    {
      id: "p2",
      title: "Cyberpunk Neon",
      description:
        "Saturated phosphorescent colors with heavy bloom and chromatic aberration.",
      tags: ["#neon", "#future", "#glow"],
      image: "/images/hero.png",
      stats: { saturation: "Overdrive", bloom: "90%" },
    },
    {
      id: "p3",
      title: "Classic Shonen",
      description:
        "Bold speed lines, vibrant primary colors, and dramatic shadow blocking.",
      tags: ["#action", "#90s", "#anime"],
      image: "/images/hero.png",
      stats: { lines: "Thick Ink", motion: "Dynamic" },
    },
    {
      id: "p4",
      title: "Vaporwave",
      description:
        "Pastel gradients, scanlines, and VHS tracking distortion effects.",
      tags: ["#retro", "#pastel", "#lofi"],
      image: "/images/hero.png",
      new: true,
      stats: { vibe: "Chill", scanlines: "CRT" },
    },
    {
      id: "p5",
      title: "Ink Bleed",
      description:
        "Traditional sumi-e aesthetic with spreading ink textures and paper grain.",
      tags: ["#traditional", "#art", "#japan"],
      image: "/images/hero.png",
      stats: { texture: "Washi", lines: "Brush" },
    },
    {
      id: "p6",
      title: "Shojo Sparkle",
      description:
        "Soft focus, floral bokeh overlays, and emotive color palettes.",
      tags: ["#romance", "#drama", "#light"],
      image: "/images/hero.png",
      stats: { softness: "Maximum", effects: "Bubbles" },
    },
  ];

  return (
    <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-10 border-b-6 border-black dark:border-white/10 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-primary">
            <Palette className="w-5 h-5" />
            <span className="font-mono text-xs font-black uppercase tracking-[0.3em]">
              Library // Loaded 24 Sets
            </span>
          </div>
          <h1 className="text-7xl md:text-9xl font-black uppercase italic tracking-tighter text-white leading-[0.8]">
            Style <br />
            <span
              className="text-transparent"
              style={{
                WebkitTextStroke: "2px white",
                textShadow: "6px 6px 0px #CCFF00",
              }}
            >
              Presets
            </span>
          </h1>
        </div>

        <div className="relative p-6 max-w-xs mb-4 transform rotate-1 bg-white border-4 border-black text-black shadow-hard-primary hidden lg:block">
          <p className="font-bold text-sm uppercase leading-tight italic font-mono">
            "Select a visual paradigm to overwrite reality!"
          </p>
          <div className="absolute -bottom-5 left-[20%] w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[15px] border-t-black"></div>
          <div className="absolute -bottom-4 left-[21%] w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[12px] border-t-white"></div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row gap-4 bg-surface-dark border-4 border-black p-4 shadow-hard">
          <div className="relative flex-1">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-white/20" />
            <input
              type="text"
              placeholder="SEARCH STYLE ALGORITHMS..."
              className="w-full bg-black border-4 border-white/10 h-16 pl-16 pr-6 font-mono font-black text-lg text-white focus:border-primary outline-none transition-all placeholder:text-white/10"
            />
          </div>
          <button className="bg-primary hover:bg-white text-black h-16 px-10 font-black uppercase text-xl border-4 border-black flex items-center justify-center gap-3 shadow-hard-xs hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all italic">
            <Filter className="w-6 h-6" />
            Filter
          </button>
          <Link
            href="/projects/new/edit"
            className="bg-secondary hover:bg-white text-black h-16 px-10 font-black uppercase text-xl border-4 border-black flex items-center justify-center gap-3 shadow-hard-xs hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all italic"
          >
            <Zap className="w-6 h-6" />
            New Style
          </Link>
        </div>

        <div className="flex gap-4 flex-wrap">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={cn(
                "px-6 py-2 font-black uppercase text-xs border-4 transition-all italic",
                activeFilter === f
                  ? "bg-white text-black border-black shadow-hard-xs"
                  : "bg-transparent text-white/40 border-white/10 hover:border-white hover:text-white",
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Preset Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pb-20">
        {presets.map((p) => (
          <article
            key={p.id}
            className="group relative bg-surface-dark border-4 border-black shadow-hard hover:shadow-neo transition-all duration-300 flex flex-col"
          >
            <div className="relative aspect-video overflow-hidden border-b-4 border-black">
              <div
                className="absolute inset-0 bg-cover bg-center grayscale contrast-125 transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                style={{ backgroundImage: `url(${p.image})` }}
              />

              {p.popular && (
                <div className="absolute top-0 right-0 bg-black text-primary px-4 py-1.5 font-black text-[10px] uppercase border-l-4 border-b-4 border-white italic tracking-widest z-10">
                  POPULAR
                </div>
              )}

              {p.new && (
                <div className="absolute top-0 right-0 bg-primary text-black px-4 py-1.5 font-black text-[10px] uppercase border-l-4 border-b-4 border-black italic tracking-widest z-10 shadow-hard-xs">
                  NEW_ENTRY
                </div>
              )}

              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity mix-blend-overlay"></div>
            </div>

            <div className="p-8 flex-1 flex flex-col gap-6">
              <div className="space-y-2">
                <h3 className="font-black text-4xl uppercase italic leading-none text-white group-hover:text-primary transition-colors tracking-tighter">
                  {p.title}
                </h3>
                <p className="text-white/40 text-xs font-mono uppercase tracking-widest leading-relaxed">
                  {p.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 border-t-2 border-white/5 pt-6">
                {Object.entries(p.stats).map(([label, val]) => (
                  <div key={label} className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-white/20 tracking-widest mb-1">
                      {label}
                    </span>
                    <span className="text-xs font-black uppercase text-white italic">
                      {val}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 mt-auto">
                {p.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[9px] font-black uppercase text-primary bg-primary/10 px-2 py-0.5 border border-primary/20 italic"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <button className="w-full mt-4 py-4 bg-white/5 hover:bg-white text-white hover:text-black border-4 border-white/10 hover:border-black font-black uppercase text-sm transition-all flex items-center justify-center gap-3 italic tracking-widest shadow-hard-xs hover:shadow-none hover:translate-x-1 hover:translate-y-1">
                Deploy Preset
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Footer Info */}
      <div className="flex justify-center border-t-4 border-white/5 py-12">
        <p className="font-mono text-[10px] text-white/10 uppercase tracking-[0.4em]">
          © 2024 UtsukushiiAI // Style Synthesis Node 0x442
        </p>
      </div>
    </main>
  );
}
