"use client";

import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Sparkles,
  Zap,
  ChevronLeft,
  Layers,
  Eye,
  Type,
  Sliders,
  Sun,
  Wand2,
  Film,
  Cpu,
  AlertCircle,
} from "lucide-react";
import { useState, useCallback } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { motion, AnimatePresence } from "framer-motion";

// ─── Style Presets (9.5) ───────────────────────────────────────────────────────
const STYLE_PRESETS = [
  {
    id: "ink",
    name: "Ink",
    description: "Classic manga ink lines",
    filter: "grayscale(1) contrast(1.4)",
    accent: "#ffffff",
  },
  {
    id: "vibrant",
    name: "Vibrant",
    description: "Hyper-saturated colors",
    filter: "saturate(2.5) contrast(1.2)",
    accent: "#ccff00",
  },
  {
    id: "vintage",
    name: "Vintage",
    description: "Retro 90s anime warmth",
    filter: "sepia(0.6) contrast(1.1) brightness(0.95)",
    accent: "#ff9900",
  },
  {
    id: "dark_noir",
    name: "Dark Noir",
    description: "Cinematic shadow look",
    filter: "grayscale(0.3) brightness(0.7) contrast(1.5)",
    accent: "#ff00ff",
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    description: "Neon hue shifts",
    filter: "hue-rotate(90deg) saturate(2) brightness(0.9)",
    accent: "#00ffff",
  },
  {
    id: "sketch",
    name: "Sketch",
    description: "Pencil lineart look",
    filter: "grayscale(1) invert(1) contrast(2) brightness(1.4)",
    accent: "#aaaaaa",
  },
];

// ─── Effect Toggles (9.1) ──────────────────────────────────────────────────────
const EFFECTS = [
  { id: "glow", label: "Glow FX", desc: "Edge glow on characters" },
  { id: "glitch", label: "Glitch", desc: "Digital corruption frames" },
  { id: "cinematic_pan", label: "Cinematic Pan", desc: "Ken Burns camera moves" },
  { id: "parallax", label: "Parallax", desc: "Multi-layer depth motion" },
  { id: "chromatic", label: "Chromatic Aberration", desc: "RGB split on motion" },
  { id: "vignette", label: "Vignette", desc: "Edge darkening" },
];

// ─── Sub-panel labels ─────────────────────────────────────────────────────────
const PANELS = [
  { id: "style", icon: Wand2, label: "Style" },
  { id: "effects", icon: Zap, label: "FX" },
  { id: "motion", icon: Sliders, label: "Motion" },
  { id: "depth", icon: Layers, label: "Depth" },
  { id: "prompt", icon: Type, label: "Prompt" },
];

// ─── Slider ────────────────────────────────────────────────────────────────────
function ControlSlider({
  label,
  value,
  onChange,
  color = "primary",
  unit = "%",
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  color?: "primary" | "secondary" | "accent";
  unit?: string;
}) {
  const colorClass = { primary: "bg-primary", secondary: "bg-secondary", accent: "bg-accent" }[color];
  const textClass = { primary: "text-primary", secondary: "text-secondary", accent: "text-accent" }[color];

  return (
    <div className="group">
      <div className="flex justify-between mb-3 font-mono text-[10px] uppercase font-black tracking-widest">
        <span className="text-white/40">{label}</span>
        <span className={textClass}>{value}{unit}</span>
      </div>
      <div className="relative h-5 flex items-center cursor-pointer">
        <div className="absolute w-full h-1.5 bg-black border border-white/5" />
        <div
          className={cn("absolute h-1.5 border-y border-l border-black transition-none", colorClass)}
          style={{ width: `${value}%` }}
        />
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        {/* Thumb */}
        <div
          className={cn("absolute w-3 h-6 border-2 border-black shadow-hard-xs transition-none pointer-events-none", colorClass)}
          style={{ left: `calc(${value}% - 6px)` }}
        />
      </div>
    </div>
  );
}

// ─── Toggle Switch ─────────────────────────────────────────────────────────────
function EffectToggle({
  label,
  desc,
  active,
  onChange,
}: {
  label: string;
  desc: string;
  active: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!active)}
      className={cn(
        "w-full flex items-center justify-between p-4 border-4 transition-all text-left group",
        active
          ? "bg-primary/10 border-primary shadow-hard-xs"
          : "bg-black/20 border-white/5 hover:border-white/10",
      )}
    >
      <div>
        <p className={cn("font-mono text-[10px] font-black uppercase tracking-widest", active ? "text-primary" : "text-white")}>
          {label}
        </p>
        <p className="font-mono text-[9px] text-white/30 mt-0.5 uppercase tracking-wider">{desc}</p>
      </div>
      <div className={cn("w-11 h-6 border-2 relative transition-all shrink-0", active ? "bg-primary border-black" : "bg-black border-white/20")}>
        <motion.div
          layout
          className={cn("absolute top-0.5 w-4 h-4 border-2 border-black", active ? "bg-black" : "bg-white/20")}
          style={{ [active ? "right" : "left"]: "2px" }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </div>
    </button>
  );
}

// ─── Main Editor Page ──────────────────────────────────────────────────────────
export default function StyleEditorPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePanel, setActivePanel] = useState("style");
  const [selectedPreset, setSelectedPreset] = useState("vibrant");
  const [effects, setEffects] = useState<Record<string, boolean>>({
    glow: true,
    glitch: false,
    cinematic_pan: true,
    parallax: true,
    chromatic: false,
    vignette: true,
  });
  // Motion sliders (9.3)
  const [intensity, setIntensity] = useState(75);
  const [depth, setDepth] = useState(42);
  const [glitchFreq, setGlitchFreq] = useState(28);
  const [aberration, setAberration] = useState(15);
  const [svdScale, setSvdScale] = useState(60);
  const [svdFreq, setSvdFreq] = useState(45);
  // Depth map (9.2)
  const [showDepthMap, setShowDepthMap] = useState(false);
  // Prompt overlays (9.4)
  const [promptText, setPromptText] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("low quality, blurry, mutated hands, text, watermark");

  const toggleEffect = useCallback((id: string, val: boolean) => {
    setEffects((prev) => ({ ...prev, [id]: val }));
  }, []);

  const currentPreset = STYLE_PRESETS.find((p) => p.id === selectedPreset);
  const previewFilter = [
    currentPreset?.filter || "",
    effects.glow ? "drop-shadow(0 0 8px #ccff00)" : "",
  ].filter(Boolean).join(" ");

  return (
    <div className="fixed inset-0 flex flex-col bg-background-dark overflow-hidden font-display selection:bg-primary selection:text-black">
      {/* ── Top Bar ─────────────────────────────────────────────────────── */}
      <div className="h-14 bg-black border-b-4 border-black flex items-center px-6 justify-between z-50 shrink-0">
        <div className="flex items-center gap-6">
          <Link href="/projects" className="text-white/40 hover:text-primary transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="h-6 w-px bg-white/20" />
          <div className="flex flex-col">
            <span className="text-[9px] font-mono text-primary uppercase tracking-widest italic">
              Project / Scene_04
            </span>
            <h1 className="text-sm font-black uppercase text-white tracking-widest italic">
              AI Animation Style Editor
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Active effects count */}
          {Object.values(effects).filter(Boolean).length > 0 && (
            <span className="font-mono text-[9px] text-primary border border-primary/30 bg-primary/10 px-2 py-1 uppercase tracking-widest">
              {Object.values(effects).filter(Boolean).length} FX ACTIVE
            </span>
          )}
          <button className="px-6 py-2 bg-secondary text-black font-black uppercase text-xs border-2 border-black shadow-hard-xs hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all italic">
            Export
          </button>
        </div>
      </div>

      <main className="flex-1 flex overflow-hidden relative">
        {/* Dot bg */}
        <div
          className="absolute inset-0 z-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(#363a27 1px, transparent 1px)", backgroundSize: "20px 20px" }}
        />

        {/* ── Preview ─────────────────────────────────────────────────── */}
        <section className="flex-1 flex flex-col relative z-10 border-r-4 border-black bg-black/40 backdrop-blur-sm p-8 justify-center items-center gap-20">
          <div className="relative w-full max-w-[320px] aspect-[9/16] group">
            {/* Main preview */}
            <div
              className="w-full h-full bg-cover bg-center border-[6px] border-black relative overflow-hidden shadow-hard"
              style={{
                backgroundImage: "url('/images/hero.png')",
                filter: previewFilter,
              }}
            >
              {/* DepthMap overlay (9.2) */}
              <AnimatePresence>
                {showDepthMap && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.7 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(ellipse at 30% 35%, rgba(0,0,255,0.6) 0%, rgba(0,255,0,0.3) 40%, rgba(255,0,0,0.5) 80%)",
                      mixBlendMode: "multiply",
                    }}
                  >
                    <div className="absolute inset-x-4 top-6 flex items-center gap-1">
                      <span className="font-mono text-[8px] text-white bg-black/80 px-2 py-0.5 uppercase tracking-widest">
                        DEPTH_MAP_PREVIEW
                      </span>
                    </div>
                    {/* Depth contour lines */}
                    {[20, 40, 60, 80].map((pct) => (
                      <div
                        key={pct}
                        className="absolute inset-x-0 border-t border-white/10"
                        style={{ top: `${pct}%` }}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Prompt overlay (9.4) */}
              {promptText && (
                <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center px-4">
                  <div className="bg-black/80 text-white font-display font-black text-lg uppercase italic px-4 py-2 border-2 border-white/20 text-center max-w-full break-words">
                    {promptText}
                  </div>
                </div>
              )}

              {/* Style preset badge */}
              <div
                className="absolute top-3 right-3 px-2 py-1 border-2 border-black font-mono text-[8px] font-black uppercase"
                style={{ backgroundColor: currentPreset?.accent, color: "#000" }}
              >
                {currentPreset?.name}
              </div>

              {/* REC indicator */}
              {isPlaying && (
                <div className="absolute top-3 left-3 bg-black/80 text-red-500 px-2 py-1 font-mono text-[9px] border border-red-500/30 animate-pulse">
                  REC ●
                </div>
              )}

              {/* CRT scanlines */}
              <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(0,0,0,0) 50%, rgba(0,0,0,0.3) 50%)",
                  backgroundSize: "100% 4px",
                }}
              />
            </div>

            {/* Playback controls */}
            <div className="absolute -bottom-14 left-0 right-0 flex items-center justify-between px-4">
              <button className="text-white/40 hover:text-primary transition-colors">
                <SkipBack className="w-7 h-7" />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="bg-primary text-black rounded-full p-3 hover:scale-110 transition-transform border-4 border-black shadow-hard-xs"
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7 fill-black" />
                ) : (
                  <Play className="w-7 h-7 fill-black" />
                )}
              </button>
              <button className="text-white/40 hover:text-primary transition-colors">
                <SkipForward className="w-7 h-7" />
              </button>
            </div>
          </div>

          {/* Depth map toggle */}
          <button
            onClick={() => setShowDepthMap(!showDepthMap)}
            className={cn(
              "flex items-center gap-2 font-mono text-[10px] uppercase font-black tracking-widest border-2 px-4 py-2 transition-all",
              showDepthMap
                ? "bg-accent text-black border-black"
                : "text-white/30 border-white/10 hover:text-white hover:border-white/30",
            )}
          >
            <Layers className="w-3.5 h-3.5" />
            {showDepthMap ? "Hide" : "Show"} Depth Map
          </button>

          <div className="absolute bottom-8 right-8 font-mono text-[9px] text-white/20 text-right uppercase tracking-[0.15em]">
            RENDER_TIME: 0.04s <br />
            PRESET: {currentPreset?.name.toUpperCase()}
          </div>
        </section>

        {/* ── Right Control Panel ─────────────────────────────────────── */}
        <aside className="w-full lg:w-[400px] bg-[#0a0a0a] flex flex-col border-l-4 border-black z-20">
          {/* Panel tabs */}
          <div className="flex border-b-4 border-black shrink-0">
            {PANELS.map((p) => (
              <button
                key={p.id}
                onClick={() => setActivePanel(p.id)}
                className={cn(
                  "flex-1 flex flex-col items-center gap-1 py-3 border-r-2 border-black last:border-r-0 font-mono text-[9px] uppercase font-black tracking-widest transition-all",
                  activePanel === p.id
                    ? "bg-primary text-black"
                    : "text-white/30 hover:text-white hover:bg-white/5",
                )}
              >
                <p.icon className="w-4 h-4" />
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {/* ── Style Presets (9.5) ──────────────────────────────── */}
              {activePanel === "style" && (
                <motion.div
                  key="style"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="p-6 space-y-4"
                >
                  <h3 className="font-mono text-[10px] text-primary uppercase tracking-[0.3em] font-black flex items-center gap-2">
                    <Wand2 className="w-3.5 h-3.5" /> Visual Style Matrix
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {STYLE_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => setSelectedPreset(preset.id)}
                        className={cn(
                          "p-4 border-4 text-left transition-all group",
                          selectedPreset === preset.id
                            ? "border-black shadow-hard"
                            : "border-white/5 hover:border-white/20",
                        )}
                        style={selectedPreset === preset.id ? { backgroundColor: preset.accent + "22", borderColor: preset.accent } : {}}
                      >
                        {/* Mini preview */}
                        <div
                          className="w-full aspect-video mb-3 bg-cover bg-center border-2 border-black"
                          style={{
                            backgroundImage: "url('/images/hero.png')",
                            filter: preset.filter,
                          }}
                        />
                        <p className="font-black text-sm uppercase italic text-white leading-none">
                          {preset.name}
                        </p>
                        <p className="font-mono text-[9px] text-white/30 mt-1 uppercase">
                          {preset.description}
                        </p>
                        {selectedPreset === preset.id && (
                          <div className="mt-2 w-full h-1 rounded-full" style={{ backgroundColor: preset.accent }} />
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ── Effects (9.1) ─────────────────────────────────────── */}
              {activePanel === "effects" && (
                <motion.div
                  key="effects"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="p-6 space-y-3"
                >
                  <h3 className="font-mono text-[10px] text-primary uppercase tracking-[0.3em] font-black flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5" /> Effect Processor
                  </h3>
                  {EFFECTS.map((fx) => (
                    <EffectToggle
                      key={fx.id}
                      label={fx.label}
                      desc={fx.desc}
                      active={effects[fx.id] ?? false}
                      onChange={(v) => toggleEffect(fx.id, v)}
                    />
                  ))}
                </motion.div>
              )}

              {/* ── Motion Sliders (9.3) ──────────────────────────────── */}
              {activePanel === "motion" && (
                <motion.div
                  key="motion"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="p-6 space-y-8"
                >
                  <div className="space-y-6">
                    <h4 className="font-mono text-[10px] text-white/40 uppercase tracking-widest font-black border-b border-white/10 pb-2">
                      SVD Motion Core
                    </h4>
                    <ControlSlider label="SVD Motion Scale" value={svdScale} onChange={setSvdScale} color="primary" />
                    <ControlSlider label="SVD Frequency" value={svdFreq} onChange={setSvdFreq} color="primary" />
                    <ControlSlider label="Motion Intensity" value={intensity} onChange={setIntensity} color="primary" />
                    <ControlSlider label="Parallax Depth" value={depth} onChange={setDepth} color="primary" />
                  </div>
                  <div className="space-y-6">
                    <h4 className="font-mono text-[10px] text-white/40 uppercase tracking-widest font-black border-b border-white/10 pb-2">
                      FX Processor
                    </h4>
                    <ControlSlider label="Glitch Frequency" value={glitchFreq} onChange={setGlitchFreq} color="secondary" />
                    <ControlSlider label="Chromatic Aberration" value={aberration} onChange={setAberration} color="secondary" />
                  </div>
                </motion.div>
              )}

              {/* ── Depth Map (9.2) ───────────────────────────────────── */}
              {activePanel === "depth" && (
                <motion.div
                  key="depth"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="p-6 space-y-6"
                >
                  <h3 className="font-mono text-[10px] text-primary uppercase tracking-[0.3em] font-black flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5" /> Depth Map Controls
                  </h3>

                  <EffectToggle
                    label="Show Depth Preview"
                    desc="MiDaS-v3 DPT depth overlay"
                    active={showDepthMap}
                    onChange={setShowDepthMap}
                  />

                  <div className="bg-black border-4 border-white/10 p-4 space-y-3">
                    <p className="font-mono text-[9px] text-white/40 uppercase tracking-widest">
                      Depth Legend
                    </p>
                    <div className="flex gap-2 items-center">
                      <div className="w-4 h-4 bg-blue-500 border border-black" />
                      <span className="font-mono text-[9px] text-white/60 uppercase">Foreground (Near)</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <div className="w-4 h-4 bg-green-500 border border-black" />
                      <span className="font-mono text-[9px] text-white/60 uppercase">Mid-ground</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <div className="w-4 h-4 bg-red-500 border border-black" />
                      <span className="font-mono text-[9px] text-white/60 uppercase">Background (Far)</span>
                    </div>
                  </div>

                  <ControlSlider label="Depth Sensitivity" value={depth} onChange={setDepth} color="accent" />
                  <ControlSlider label="Parallax Strength" value={intensity} onChange={setIntensity} color="accent" />

                  <div className="bg-primary/5 border border-primary/20 p-3 flex gap-2">
                    <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <p className="font-mono text-[9px] text-white/40 uppercase leading-relaxed">
                      Depth map generated by MiDaS-v3-DPT model on render
                    </p>
                  </div>
                </motion.div>
              )}

              {/* ── Prompt Overlays (9.4) ─────────────────────────────── */}
              {activePanel === "prompt" && (
                <motion.div
                  key="prompt"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="p-6 space-y-6"
                >
                  <h3 className="font-mono text-[10px] text-primary uppercase tracking-[0.3em] font-black flex items-center gap-2">
                    <Type className="w-3.5 h-3.5" /> Text Overlays
                  </h3>

                  <div className="space-y-2">
                    <label className="font-mono text-[10px] text-white/40 uppercase tracking-widest font-black block">
                      Overlay Text
                    </label>
                    <input
                      type="text"
                      id="prompt-overlay-text"
                      value={promptText}
                      onChange={(e) => setPromptText(e.target.value)}
                      placeholder="Add text overlay to panel..."
                      className="w-full bg-black border-4 border-white/10 px-4 py-3 text-white font-display font-bold uppercase outline-none focus:border-primary focus:bg-primary/5 transition-all placeholder-white/20 text-sm"
                    />
                    <p className="font-mono text-[9px] text-white/20 uppercase">
                      Preview updates live in the panel viewer
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="font-mono text-[10px] text-white/40 uppercase tracking-widest font-black block">
                      Positive Prompt
                    </label>
                    <textarea
                      className="w-full bg-black border-4 border-white/10 px-4 py-3 text-white font-mono text-xs outline-none focus:border-primary focus:bg-primary/5 transition-all placeholder-white/20 h-24 resize-none"
                      placeholder="cinematic lighting, ultra detailed, manga style..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-mono text-[10px] text-white/40 uppercase tracking-widest font-black block">
                      Negative Prompt
                    </label>
                    <textarea
                      value={negativePrompt}
                      onChange={(e) => setNegativePrompt(e.target.value)}
                      className="w-full bg-black border-4 border-white/10 px-4 py-3 text-white font-mono text-xs outline-none focus:border-secondary focus:bg-secondary/5 transition-all placeholder-white/20 h-24 resize-none"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Action Bar */}
          <div className="p-6 bg-black border-t-4 border-black shrink-0">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/20 font-mono text-[9px] uppercase tracking-[0.3em]">
                EST. COST: {Math.round((intensity + depth + svdScale) / 10)} CREDITS
              </span>
              <button className="text-primary hover:text-white font-mono text-[9px] uppercase tracking-widest font-bold underline decoration-dotted decoration-primary/40 underline-offset-4">
                Reset Defaults
              </button>
            </div>
            <button className="w-full h-14 bg-primary text-black font-display font-black text-xl uppercase italic border-4 border-black shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-3 active:scale-95">
              <Sparkles className="w-5 h-5" />
              Apply Style
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
}
