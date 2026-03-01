"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Search,
  Layers,
  Music,
  Image as ImageIcon,
  Settings,
  Activity,
  CheckCircle,
  Plus,
  Film,
  Hammer,
  Menu,
  ChevronLeft,
  Sparkles as AutoFixHigh,
  Layers as LayersIcon,
} from "lucide-react";
import { Canvas } from "@/components/canvas/Canvas/Canvas";
import { PanelEditor } from "@/components/canvas/PanelEditor/PanelEditor";
import { Timeline } from "@/components/timeline/Timeline/Timeline";
import { cn } from "@/lib/utils/cn";

export default function ProjectCanvasPage() {
  const params = useParams();
  const [activeAssetTab, setActiveAssetTab] = useState("Assets");
  const [isLeftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setRightSidebarOpen] = useState(true);

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
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-black uppercase text-white tracking-widest italic truncate max-w-[200px] md:max-w-none">
              Project Alpha // v2.4
            </h1>
            <span className="text-[10px] font-mono text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 font-bold italic hidden sm:block">
              BETA_SYNC_ACTIVE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex bg-black border-2 border-white/10 p-1 mr-2">
            <button
              onClick={() => setLeftSidebarOpen(!isLeftSidebarOpen)}
              className={cn(
                "p-1.5 transition-colors",
                isLeftSidebarOpen ? "text-primary" : "text-white/20",
              )}
            >
              <ImageIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setRightSidebarOpen(!isRightSidebarOpen)}
              className={cn(
                "p-1.5 transition-colors",
                isRightSidebarOpen ? "text-primary" : "text-white/20",
              )}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
          <Link
            href={`/projects/${params.id}/render`}
            className="px-4 md:px-6 py-2 bg-primary text-black font-black uppercase text-[10px] md:text-xs border-2 border-black shadow-hard-xs hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all italic"
          >
            Render
          </Link>
          <button className="px-4 md:px-6 py-2 bg-transparent text-white font-black uppercase text-[10px] md:text-xs border-2 border-white hover:bg-white/10 transition-all italic hidden sm:block">
            Save
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar: Asset List & Navigation */}
        <aside
          className={cn(
            "border-r-4 border-black bg-slate-900/40 flex flex-col z-40 transition-all duration-300",
            isLeftSidebarOpen ? "w-72" : "w-0 -translate-x-full",
          )}
        >
          <div className="w-72 flex flex-col h-full overflow-hidden">
            {/* Tools Menu */}
            <div className="flex flex-col gap-1 p-4 border-b-4 border-black bg-background-dark/50">
              <NavButton
                icon={<ImageIcon className="w-4 h-4" />}
                label="Assets"
                active={activeAssetTab === "Assets"}
                onClick={() => setActiveAssetTab("Assets")}
              />
              <NavButton
                icon={<LayersIcon className="w-4 h-4" />}
                label="Layers"
                active={activeAssetTab === "Layers"}
                onClick={() => setActiveAssetTab("Layers")}
              />
              <NavButton
                icon={<Music className="w-4 h-4" />}
                label="Audio"
                active={activeAssetTab === "Audio"}
                onClick={() => setActiveAssetTab("Audio")}
              />
              <NavButton
                icon={<Activity className="w-4 h-4" />}
                label="History"
                active={activeAssetTab === "History"}
                onClick={() => setActiveAssetTab("History")}
              />
            </div>

            {/* Asset Thumbnails */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-primary scrollbar-track-black">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest italic">
                  Scene Panels
                </h3>
                <button className="text-primary hover:text-white transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {[1, 2, 3, 4, 5].map((idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "group relative cursor-pointer border-4 transition-all shadow-hard-xs hover:shadow-hard p-2 bg-black",
                      idx === 1
                        ? "border-primary"
                        : "border-black/50 hover:border-white/40",
                    )}
                  >
                    <div
                      className="w-full aspect-square bg-cover bg-center mb-2 grayscale group-hover:grayscale-0 transition-all duration-300"
                      style={{ backgroundImage: "url('/images/hero.png')" }}
                    ></div>
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[10px] font-black text-white uppercase italic">
                        Scene {idx.toString().padStart(2, "0")}
                      </span>
                      {idx === 1 && (
                        <span className="text-[8px] font-mono text-primary font-bold italic">
                          ACTIVE
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Center Canvas Area */}
        <div className="flex-1 flex flex-col relative bg-background-dark overflow-hidden transition-all duration-300">
          <Canvas />
        </div>

        {/* Right Sidebar: AI Controls */}
        <aside
          className={cn(
            "border-l-4 border-black bg-slate-900/40 flex flex-col z-40 transition-all duration-300",
            isRightSidebarOpen ? "w-80" : "w-0 translate-x-full",
          )}
        >
          <div className="w-80 h-full overflow-hidden">
            <PanelEditor />
          </div>
        </aside>
      </div>

      {/* Rhythm Timeline (Anchored at Bottom) */}
      <div className="h-64 md:h-80 w-full shrink-0 relative z-50 border-t-4 border-black shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <Timeline />
      </div>
    </div>
  );
}

function NavButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3 font-black text-xs uppercase tracking-widest transition-all italic border-4",
        active
          ? "bg-primary text-black border-black shadow-hard-xs"
          : "text-white/40 hover:bg-white/5 border-transparent hover:border-white/10",
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
