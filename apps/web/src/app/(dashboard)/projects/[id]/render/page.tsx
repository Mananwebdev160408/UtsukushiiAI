"use client";

import {
  Download,
  Share2,
  Verified,
  Film,
  Music,
  Play,
  Zap,
  CheckCircle2,
  Scan,
  MoreVertical,
  Edit3,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils/cn";

export default function ExportResultPage() {
  const params = useParams();
  const [progress, setProgress] = useState(75);

  return (
    <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col gap-12 relative overflow-hidden font-display">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 z-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#ccff00 2px, transparent 2px)",
          backgroundSize: "32px 32px",
        }}
      ></div>

      <div className="z-10 grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Left Column: Preview & Status */}
        <div className="flex flex-col gap-10">
          {/* Rendering Header */}
          <div className="bg-black text-white p-8 border-6 border-black dark:border-white shadow-hard hover:shadow-neo transition-all transform -rotate-2">
            <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">
              Rendering <br />
              <span className="text-primary">Masterpiece...</span>
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
              }}
            >
              {/* CRT Scanline Effect */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,6px_100%] pointer-events-none opacity-40"></div>

              {/* Console Logs Overlay */}
              <div className="absolute bottom-6 left-6 font-mono text-primary text-[10px] bg-black/80 px-4 py-3 border-2 border-primary/20 backdrop-blur-sm space-y-1 uppercase tracking-widest leading-relaxed italic font-bold">
                <p>&gt; FRAME: {Math.floor(progress * 27.5)}/2750</p>
                <p>&gt; LAYER: FX_OVERLAY_03 (ACTIVE)</p>
                <p>&gt; SHADER: NEON_VULKAN_PIPE</p>
              </div>
            </div>

            {/* Progress Bar Container */}
            <div className="mt-6 h-12 bg-black border-6 border-black relative overflow-hidden">
              <div
                className="h-full bg-primary absolute top-0 left-0 transition-all duration-500 shadow-[0_0_30px_#ccff00]"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-0 bottom-0 w-2 bg-white opacity-40"></div>
              </div>
              <div className="h-full w-full opacity-10 bg-stripes"></div>
            </div>
          </div>

          {/* Tech Stats */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white text-black border-6 border-black p-6 shadow-hard transition-all hover:bg-primary group">
              <p className="text-[10px] font-black uppercase text-black/40 mb-2 tracking-widest italic group-hover:text-black/60">
                Resolution
              </p>
              <p className="text-3xl font-black italic tracking-tighter">
                4K_ULTRA_HD
              </p>
            </div>
            <div className="bg-white text-black border-6 border-black p-6 shadow-hard transition-all hover:bg-secondary group">
              <p className="text-[10px] font-black uppercase text-black/40 mb-2 tracking-widest italic group-hover:text-black/60">
                Audio Bitrate
              </p>
              <p className="text-3xl font-black italic tracking-tighter">
                320_KBPS
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Export Actions */}
        <div className="flex flex-col gap-10">
          {/* Success Stamp Area */}
          <div className="flex-1 bg-surface-dark border-6 border-black border-dashed flex items-center justify-center p-12 relative overflow-hidden shadow-hard hover:shadow-neo hover:border-solid transition-all group min-h-[400px]">
            <div className="absolute top-6 left-6 text-white/10 font-black text-4xl group-hover:text-primary transition-colors">
              +
            </div>
            <div className="absolute top-6 right-6 text-white/10 font-black text-4xl group-hover:text-primary transition-colors">
              +
            </div>
            <div className="absolute bottom-6 left-6 text-white/10 font-black text-4xl group-hover:text-primary transition-colors">
              +
            </div>
            <div className="absolute bottom-6 right-6 text-white/10 font-black text-4xl group-hover:text-primary transition-colors">
              +
            </div>

            <div className="relative w-72 h-72 flex items-center justify-center">
              {/* Rotating Ring */}
              <div className="absolute inset-0 border-[24px] border-black border-t-primary rounded-full animate-spin transition-transform duration-[4000ms]"></div>
              <div className="absolute inset-4 border-[12px] border-dashed border-white/5 rounded-full"></div>

              {/* Success Stamp Card */}
              <div className="absolute inset-4 flex flex-col items-center justify-center text-center transform rotate-12 z-10 bg-black/90 backdrop-blur-sm border-6 border-primary shadow-hard-primary p-6">
                <Verified className="w-16 h-16 text-primary mb-4" />
                <h3 className="text-white font-black text-2xl uppercase tracking-widest leading-none border-y-4 border-primary/20 py-2 mb-2 italic">
                  AUTHENTIC_MMV
                </h3>
                <p className="text-primary font-black text-xs tracking-widest font-mono">
                  ID: #8829-XJ-SYNTH
                </p>
              </div>
            </div>
          </div>

          {/* Social Distribution Area */}
          <div className="bg-white text-black border-6 border-black p-8 shadow-hard space-y-8">
            <div className="flex items-center justify-between border-b-6 border-black pb-4">
              <h3 className="text-3xl font-black uppercase italic tracking-tighter">
                Distribute Media
              </h3>
              <Link
                href={`/projects/${params.id}`}
                className="flex items-center gap-2 bg-black text-white px-4 py-2 font-black uppercase text-[10px] border-2 border-black hover:bg-primary hover:text-black transition-all italic shadow-hard-xs hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
              >
                <Edit3 className="w-3 h-3" />
                Edit Project
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SocialButton
                platform="TikTok"
                color="#000"
                icon={<Music className="w-8 h-8" />}
                active
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
            <button className="w-full bg-primary hover:bg-black hover:text-primary border-6 border-black py-6 px-10 flex items-center justify-between shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all group italic">
              <div className="flex flex-col items-start gap-1">
                <span className="font-black text-2xl uppercase italic tracking-tighter">
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
      <footer className="w-full border-t-6 border-black dark:border-white py-12 flex flex-col md:flex-row justify-between items-center gap-8 z-10 bg-background-dark/80 backdrop-blur-md px-10 -mx-10 mt-12 bg-manga-dots bg-[size:24px_24px] opacity-80">
        <div className="flex gap-12 font-mono text-xs font-black uppercase tracking-widest italic text-white/40">
          <span className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-primary shadow-[0_0_15px_#ccff00]"></span>
            RENDER_ENGINE: <span className="text-white">VULKAN_GPU_RTX</span>
          </span>
          <span className="flex items-center gap-3">
            QUEUE_POS: <span className="text-primary">#1_STABLE</span>
          </span>
        </div>
        <div className="flex gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="w-12 h-2 bg-white/5 border border-white/10 overflow-hidden"
            >
              <div className="w-[85%] h-full bg-primary/20"></div>
            </div>
          ))}
        </div>
        <span className="font-mono text-[10px] text-white/20 italic tracking-[0.4em] uppercase">
          Build_2.4.0_Stable_Sync
        </span>
      </footer>
    </main>
  );
}

function SocialButton({
  platform,
  color,
  icon,
  active,
}: {
  platform: string;
  color: string;
  icon: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      className="relative group border-6 border-black p-6 flex flex-col items-center justify-center gap-4 shadow-hard hover:shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all h-40 overflow-hidden"
      style={{ backgroundColor: color }}
    >
      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
      {active && (
        <span className="absolute top-2 right-2 bg-white text-black font-black text-[9px] px-2 py-0.5 border-2 border-black italic tracking-widest z-20 shadow-hard-xs">
          READY
        </span>
      )}
      <div className="text-white drop-shadow-[4px_4px_0px_#000] group-hover:scale-125 transition-transform duration-500">
        {icon}
      </div>
      <span className="font-black uppercase text-xl italic tracking-tighter text-white drop-shadow-[4px_4px_0px_#000]">
        {platform}
      </span>
    </button>
  );
}
