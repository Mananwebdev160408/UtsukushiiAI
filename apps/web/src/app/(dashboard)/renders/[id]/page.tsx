"use client";

import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Music,
  Film,
  CheckCircle,
  Download,
  Share2,
  Activity,
  Rocket,
  Zap,
  Verified,
  Scan,
  MoreVertical,
  Volume2,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";

export default function RenderResultPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(75);

  return (
    <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col gap-12 relative overflow-hidden font-display">
      {/* Dynamic Background Pattern */}
      <div
        className="absolute inset-0 z-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(white 2px, transparent 2px)",
          backgroundSize: "32px 32px",
        }}
      ></div>

      <div className="z-10 grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Left Column: Preview & Status */}
        <div className="flex flex-col gap-10">
          {/* Rendering Header */}
          <div className="bg-black text-white p-6 border-6 border-black dark:border-white shadow-hard hover:shadow-neo transition-all transform -rotate-2">
            <h1 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter leading-none">
              Rendering <br />
              <span className="text-primary group-hover:text-white transition-colors">
                Masterpiece...
              </span>
            </h1>
          </div>

          {/* Video Preview Container */}
          <div className="relative group bg-surface-dark border-6 border-black p-4 shadow-neo-orange">
            {/* Progress Overlay */}
            <div className="absolute top-6 right-6 z-20 bg-primary text-black font-black px-4 py-2 border-4 border-black shadow-hard-xs uppercase text-xs italic">
              {progress}% PROCESSED
            </div>

            <div
              className="relative aspect-video bg-black border-4 border-black overflow-hidden group-hover:grayscale-0 transition-all duration-700 grayscale contrast-125"
              style={{
                backgroundImage: "url('/images/hero.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* CRT Scanline Overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,6px_100%] pointer-events-none"></div>

              {/* Glitch Overlay */}
              <div className="absolute top-0 left-0 w-full h-full bg-secondary opacity-0 animate-pulse mix-blend-overlay group-hover:opacity-10"></div>

              {/* Playback Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="w-24 h-24 bg-white text-black border-6 border-black flex items-center justify-center shadow-hard hover:scale-110 active:scale-95 transition-all">
                  <Play className="w-10 h-10 fill-black" />
                </button>
              </div>

              {/* Console Logs Overlay */}
              <div className="absolute bottom-6 left-6 font-mono text-primary text-[10px] bg-black/80 px-3 py-2 border border-primary/20 backdrop-blur-sm space-y-1 uppercase tracking-widest leading-relaxed">
                <p className="flex items-center gap-2">
                  &gt; FRAME: {Math.floor(progress * 27.5)}/2750
                </p>
                <p className="flex items-center gap-2">
                  &gt; LAYER: FX_VOX_03 (ALPHA)
                </p>
                <p className="flex items-center gap-2 flex items-center gap-2">
                  &gt; BUF: 12.4GB // VULKAN_RTX
                </p>
              </div>
            </div>

            {/* Progress Bar Container */}
            <div className="mt-6 h-10 bg-black border-6 border-black relative overflow-hidden">
              <div
                className="h-full bg-primary absolute top-0 left-0 transition-all duration-500 shadow-[0_0_20px_rgba(204,255,0,0.5)] z-10"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-white opacity-40 shadow-[0_0_10px_white]"></div>
              </div>
              {/* Stripe Background */}
              <div className="h-full w-full opacity-10 bg-stripes"></div>
            </div>
          </div>

          {/* Tech Details Card */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <TechStat label="RES" value="4K_UHD" />
            <TechStat label="AUDIO" value="320KBPS" color="secondary" />
            <TechStat label="FPS" value="30_CONST" />
            <TechStat label="FORMAT" value="H.264" color="primary" />
          </div>
        </div>

        {/* Right Column: Export Actions */}
        <div className="flex flex-col gap-10">
          {/* Success Stamp Card */}
          <div className="flex-1 bg-surface-dark border-6 border-black border-dashed flex items-center justify-center p-12 relative overflow-hidden shadow-hard-xs group hover:shadow-neo hover:border-solid transition-all">
            <div className="absolute top-4 left-4 text-white/10 font-black text-2xl group-hover:text-primary transition-colors opacity-40">
              +
            </div>
            <div className="absolute top-4 right-4 text-white/10 font-black text-2xl group-hover:text-primary transition-colors opacity-40">
              +
            </div>
            <div className="absolute bottom-4 left-4 text-white/10 font-black text-2xl group-hover:text-primary transition-colors opacity-40">
              +
            </div>
            <div className="absolute bottom-4 right-4 text-white/10 font-black text-2xl group-hover:text-primary transition-colors opacity-40">
              +
            </div>

            <div className="relative w-80 h-80 flex items-center justify-center">
              {/* Giant Loader Graphic */}
              <div className="absolute inset-0 border-[32px] border-black border-t-primary rounded-full transition-transform duration-[2000ms] animate-[spin_4s_linear_infinite]"></div>
              <div className="absolute inset-6 border-[12px] border-dashed border-white/5 rounded-full"></div>

              {/* Success Center Card */}
              <div className="absolute inset-4 flex flex-col items-center justify-center text-center transform rotate-6 z-10 bg-black border-6 border-primary shadow-hard-primary p-6">
                <Verified className="w-16 h-16 text-primary mb-4" />
                <h3 className="text-white font-black text-3xl uppercase tracking-widest leading-none border-y-4 border-primary/20 py-2 mb-2 italic">
                  AUTHENTIC_MMV
                </h3>
                <p className="text-primary font-black text-sm tracking-widest uppercase">
                  EXPORT_VERIFIED
                </p>
                <div className="mt-4 flex items-center gap-2 font-mono text-[9px] text-white/40">
                  <Scan className="w-3 h-3" />
                  ID: #8829-XJ-SYNTH
                </div>
              </div>
            </div>
          </div>

          {/* Distribution Container */}
          <div className="bg-white text-black border-6 border-black p-8 shadow-hard space-y-8">
            <div className="flex justify-between items-center border-b-6 border-black pb-4">
              <h3 className="text-3xl font-black uppercase italic tracking-tighter">
                DISTRIBUTE_MEDIA
              </h3>
              <Share2 className="w-8 h-8" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SocialButton
                platform="TikTok"
                color="#010101"
                icon={<Music className="w-8 h-8" />}
                badge="NEW"
              />
              <SocialButton
                platform="Reels"
                color="#FF0050"
                icon={<Film className="w-8 h-8" />}
              />
              <SocialButton
                platform="Shorts"
                color="#FF0000"
                icon={<Play className="w-8 h-8 fill-white" />}
              />
            </div>

            {/* Main Download Button */}
            <button className="w-full bg-primary hover:bg-black hover:text-primary border-6 border-black py-6 px-10 flex items-center justify-between shadow-hard hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group">
              <div className="flex flex-col items-start gap-1">
                <span className="font-black text-2xl uppercase italic leading-none tracking-tighter">
                  Download Master
                </span>
                <span className="font-mono text-[10px] font-black opacity-60 uppercase tracking-[0.2em]">
                  MP4 • 248MB • HDR_SYNTH
                </span>
              </div>
              <Download className="w-12 h-12 bg-black text-primary p-2 border-4 border-primary group-hover:bg-primary group-hover:text-black group-hover:border-black transition-all" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info Hub */}
      <footer className="w-full border-t-6 border-black dark:border-white py-12 flex flex-col md:flex-row justify-between items-center gap-8 z-10 bg-background-dark/80 backdrop-blur-md px-6 -mx-6 mt-12">
        <div className="flex gap-12 font-mono text-xs font-black uppercase tracking-widest italic text-white/40">
          <span className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_10px_#ccff00]"></span>
            RENDER_ENGINE: <span className="text-white">VULKAN_RTX</span>
          </span>
          <span className="flex items-center gap-3">
            QUEUE_POS: <span className="text-primary">#1_STABLE</span>
          </span>
        </div>
        <div className="flex gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-12 h-2 bg-white/5 border border-white/10 overflow-hidden"
            >
              <div className="w-[80%] h-full bg-primary/20"></div>
            </div>
          ))}
        </div>
        <span className="font-mono text-[10px] text-white/20 italic tracking-[0.4em]">
          USAI_v2.4.0 // ARCHIVE_READY
        </span>
      </footer>
    </main>
  );
}

function TechStat({
  label,
  value,
  color = "white",
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="bg-black border-4 border-white/10 p-5 shadow-hard-xs hover:border-white transition-all group overflow-hidden relative">
      <div
        className={cn(
          "absolute top-0 right-0 w-12 h-12 -mr-6 -mt-6 rotate-45 transition-colors opacity-20",
          color === "primary"
            ? "bg-primary"
            : color === "secondary"
              ? "bg-secondary"
              : "bg-white",
        )}
      ></div>
      <p className="text-[10px] font-black uppercase text-white/40 mb-2 tracking-widest italic">
        {label}
      </p>
      <p
        className={cn(
          "text-lg font-black tracking-tighter italic",
          color === "primary"
            ? "text-primary"
            : color === "secondary"
              ? "text-secondary"
              : "text-white",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function SocialButton({
  platform,
  color,
  icon,
  badge,
}: {
  platform: string;
  color: string;
  icon: React.ReactNode;
  badge?: string;
}) {
  return (
    <button
      className="relative group border-6 border-black p-6 flex flex-col items-center justify-center gap-4 shadow-hard hover:shadow-neo transition-all h-40 overflow-hidden"
      style={{ backgroundColor: color }}
    >
      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
      {badge && (
        <span className="absolute top-2 right-2 bg-white text-black font-black text-[9px] px-2 py-0.5 border-2 border-black italic tracking-widest z-20">
          {badge}
        </span>
      )}
      <div className="text-white drop-shadow-hard-xs group-hover:scale-125 transition-transform duration-500">
        {icon}
      </div>
      <span className="font-black uppercase text-xl italic tracking-tighter text-white drop-shadow-hard-xs">
        {platform}
      </span>
    </button>
  );
}
