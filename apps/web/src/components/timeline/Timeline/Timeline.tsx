"use client";

import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Music,
  Undo2,
  Redo2,
  Scissors,
  Scan,
  Zap,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useProject } from "@/hooks/useProject";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";

// ─── Constants ─────────────────────────────────────────────────────────────────
const DEFAULT_DURATION = 180; // seconds (3 min track)
const DEFAULT_BPM = 128;
const PIXELS_PER_SECOND = 12; // px at zoom=1

// Sample panel sequence chips
const PANEL_CHIPS = [
  { id: "s1", label: "Scene_01", start: 0, duration: 15, color: "bg-secondary" },
  { id: "s2", label: "Scene_02", start: 18, duration: 20, color: "bg-accent" },
  { id: "s3", label: "Scene_03", start: 42, duration: 12, color: "bg-primary" },
  { id: "s4", label: "Scene_04", start: 58, duration: 18, color: "bg-secondary" },
  { id: "s5", label: "Scene_05", start: 80, duration: 22, color: "bg-accent" },
];

// Transition markers between panels
const TRANSITIONS = [
  { id: "t1", at: 15, type: "fade" },
  { id: "t2", at: 38, type: "cut" },
  { id: "t3", at: 54, type: "wipe" },
  { id: "t4", at: 76, type: "zoom" },
];

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}:${ms.toString().padStart(2, "0")}`;
}

// ─── Beat Marker Row ─────────────────────────────────────────────────────────
function BeatMarkerTrack({ zoom, duration, bpm }: { zoom: number; duration: number; bpm: number }) {
  const beatInterval = 60 / Math.max(1, bpm);
  const totalBeats = Math.ceil(duration / beatInterval);
  const ppb = beatInterval * PIXELS_PER_SECOND * zoom; // px per beat

  return (
    <div
      className="relative h-5 bg-black/60 border-b border-white/5 select-none shrink-0"
      style={{ width: `${duration * PIXELS_PER_SECOND * zoom}px` }}
    >
      {[...Array(totalBeats)].map((_, i) => {
        const isBar = i % 4 === 0;
        return (
          <div
            key={i}
            className="absolute top-0 bottom-0 flex flex-col items-center"
            style={{ left: `${i * ppb}px` }}
          >
            <div
              className={cn(
                "w-px",
                isBar ? "h-full bg-primary/50" : "h-2 bg-white/10 mt-auto",
              )}
            />
            {isBar && (
              <span className="absolute bottom-1 left-1 font-mono text-[7px] text-primary/60">
                {Math.floor(i / 4) + 1}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Playhead ─────────────────────────────────────────────────────────────────
function Playhead({
  currentTime,
  zoom,
  onScrub,
  trackRef,
  duration,
}: {
  currentTime: number;
  zoom: number;
  onScrub: (t: number) => void;
  trackRef: React.RefObject<HTMLDivElement | null>;
  duration: number;
}) {
  const leftPx = currentTime * PIXELS_PER_SECOND * zoom;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    const scrub = (ev: MouseEvent) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const scrollLeft = trackRef.current.scrollLeft;
      const rawPx = ev.clientX - rect.left + scrollLeft;
      const t = Math.max(0, Math.min(duration, rawPx / (PIXELS_PER_SECOND * zoom)));
      onScrub(t);
    };
    const up = () => {
      window.removeEventListener("mousemove", scrub);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", scrub);
    window.addEventListener("mouseup", up);
  };

  return (
    <div
      className="absolute top-0 bottom-0 z-50 flex flex-col items-center pointer-events-none"
      style={{ left: `${leftPx}px` }}
    >
      {/* Head */}
      <div
        className="w-5 h-5 bg-secondary border-2 border-black flex items-center justify-center cursor-col-resize pointer-events-auto shadow-hard-xs"
        onMouseDown={handleMouseDown}
        title="Drag to scrub"
        style={{ marginTop: "-2px" }}
      >
        <div className="w-px h-3 bg-black/60" />
      </div>
      {/* Line */}
      <div className="w-[2px] flex-1 bg-secondary shadow-[0_0_6px_#ff00ff]" />
    </div>
  );
}

// ─── Ruler ───────────────────────────────────────────────────────────────────
function TimeRuler({
  zoom,
  onScrubRuler,
  trackRef,
  duration,
}: {
  zoom: number;
  onScrubRuler: (t: number) => void;
  trackRef: React.RefObject<HTMLDivElement | null>;
  duration: number;
}) {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const scrollLeft = trackRef.current.scrollLeft;
    const rawPx = e.clientX - rect.left + scrollLeft;
    const t = Math.max(0, rawPx / (PIXELS_PER_SECOND * zoom));
    onScrubRuler(t);
  };

  const markers: number[] = [];
  // markers every 5s — clamp when rendering
  for (let s = 0; s <= 10000; s += 5) {
    markers.push(s);
  }

  return (
    <div
      className="relative h-8 bg-[#1a1a1a] border-b-2 border-black flex items-end text-[9px] font-mono text-white/30 select-none shrink-0 cursor-pointer hover:bg-white/5 transition-colors"
      style={{ width: `${duration * PIXELS_PER_SECOND * zoom}px` }}
      onClick={handleClick}
    >
      {markers.map((s) => {
        if (s > duration) return null;
        return (
          <div
            key={s}
            className="absolute bottom-0 flex flex-col items-center"
            style={{ left: `${s * PIXELS_PER_SECOND * zoom}px` }}
          >
            <span className="pb-1 pl-1 text-[8px] tracking-tighter">{formatTime(s)}</span>
            <div className="w-px h-3 bg-white/20" />
          </div>
        );
      })}
    </div>
  );
}

// ─── Panel Sequence Track ─────────────────────────────────────────────────────
function PanelSequenceTrack({
  zoom,
  selectedChip,
  onSelect,
  duration,
}: {
  zoom: number;
  selectedChip: string | null;
  onSelect: (id: string | null) => void;
  duration: number;
}) {
  return (
    <div
      className="relative h-12 bg-black/30 border-b border-white/5 shrink-0"
      style={{ width: `${duration * PIXELS_PER_SECOND * zoom}px` }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent z-10" />
      <span className="absolute left-3 top-1 text-[8px] font-black text-accent bg-black/80 px-1 border border-accent/30 z-20 italic tracking-widest uppercase">
        PANEL_SEQ
      </span>

      {PANEL_CHIPS.map((chip) => (
        <motion.div
          key={chip.id}
          onClick={() => onSelect(selectedChip === chip.id ? null : chip.id)}
          whileHover={{ y: -2 }}
          className={cn(
            "absolute top-2 bottom-2 border-2 border-black cursor-pointer flex items-center px-2 overflow-hidden group z-10",
            chip.color,
            selectedChip === chip.id && "ring-2 ring-white ring-offset-1 ring-offset-black",
          )}
          style={{
            left: `${chip.start * PIXELS_PER_SECOND * zoom}px`,
            width: `${chip.duration * PIXELS_PER_SECOND * zoom}px`,
          }}
          title={`${chip.label} — ${chip.duration}s`}
        >
          <span className="font-mono text-[9px] font-black uppercase text-black truncate">
            {chip.label}
          </span>
        </motion.div>
      ))}

      {/* Transition markers (8.4) */}
      {TRANSITIONS.map((t) => (
        <div
          key={t.id}
          className="absolute top-0 bottom-0 flex flex-col items-center z-20 group cursor-pointer"
          style={{ left: `${t.at * PIXELS_PER_SECOND * zoom}px` }}
          title={`Transition: ${t.type}`}
        >
          <div className="w-1 h-full bg-white/30 group-hover:bg-white transition-colors" />
          <div className="absolute top-0 -translate-x-1/2 bg-white/90 text-black text-[7px] font-black uppercase px-1 border border-black opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {t.type}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Audio / Waveform Track ───────────────────────────────────────────────────
function AudioTrack({ zoom, duration }: { zoom: number; duration: number }) {
  const bars = useMemo_bars(zoom, duration);
  return (
    <div
      className="relative h-16 bg-black border-b border-white/5 overflow-hidden flex items-end shrink-0"
      style={{ width: `${duration * PIXELS_PER_SECOND * zoom}px` }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary z-10" />
      <span className="absolute left-3 top-2 text-[8px] font-black text-primary bg-black/80 px-1 border border-primary/30 z-20 italic tracking-widest uppercase">
        MASTER_AUDIO
      </span>

      <div className="flex items-end gap-[1px] h-full w-full px-2 py-3 opacity-70">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 bg-primary/50 hover:bg-primary transition-colors min-w-[1px]"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

// Stable waveform bars (computed once to avoid re-render jitter)
function useMemo_bars(zoom: number, duration: number) {
  const count = Math.floor((duration * zoom * PIXELS_PER_SECOND) / 3);
  // Use seeded pseudo-random for stable bars
  const bars: number[] = [];
  let seed = 42;
  for (let i = 0; i < count; i++) {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    bars.push(((seed >>> 0) % 70) + 15);
  }
  return bars;
}

// ─── Main Timeline ─────────────────────────────────────────────────────────────
export function Timeline() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [currentTime, setCurrentTime] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [selectedChip, setSelectedChip] = useState<string | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const lastTimestamp = useRef<number>(0);

  const params = useParams();
  const projectId = params?.id as string | undefined;
  const { activeProject } = useProject(projectId);

  const duration = activeProject?.audioInfo?.duration || DEFAULT_DURATION;
  const bpm = activeProject?.audioInfo?.bpm || DEFAULT_BPM;
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ── Playback tick (8.6) ─────────────────────────────────────────────────────
  useEffect(() => {
    // If we have an audio element, let it drive playback/timeupdate
    if (audioRef.current) {
      if (isPlaying) audioRef.current.play().catch(() => {});
      else audioRef.current.pause();
      return;
    }

    if (!isPlaying) {
      cancelAnimationFrame(animRef.current);
      return;
    }
    lastTimestamp.current = performance.now();

    const tick = (now: number) => {
      const delta = (now - lastTimestamp.current) / 1000;
      lastTimestamp.current = now;
      setCurrentTime((t) => {
        const next = t + delta;
        if (next >= duration) {
          if (isLooping) return 0;
          setIsPlaying(false);
          return duration;
        }
        return next;
      });
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying, isLooping, duration]);

  // ── Auto-scroll playhead into view ─────────────────────────────────────────
  useEffect(() => {
    if (!trackRef.current || !isPlaying) return;
    const leftPx = currentTime * PIXELS_PER_SECOND * zoom;
    const { scrollLeft, clientWidth } = trackRef.current;
    if (leftPx > scrollLeft + clientWidth - 100 || leftPx < scrollLeft) {
      trackRef.current.scrollLeft = Math.max(0, leftPx - clientWidth / 2);
    }
  }, [currentTime, zoom, isPlaying]);

  const handleScrub = useCallback((t: number) => {
    setCurrentTime(t);
    if (audioRef.current) audioRef.current.currentTime = t;
  }, []);

  const handleSkipBack = () => {
    setCurrentTime(0);
    if (audioRef.current) audioRef.current.currentTime = 0;
  };

  const handleSkipForward = () => {
    setCurrentTime(duration);
    if (audioRef.current) audioRef.current.currentTime = duration;
    setIsPlaying(false);
  };

  return (
    <div className="h-full flex flex-col bg-[#171810] border-t-6 border-black z-40 relative overflow-hidden font-display">
      {/* Hidden audio element controlled by timeline */}
      <audio
        ref={audioRef}
        src={activeProject?.audioInfo?.url}
        onTimeUpdate={(e) => setCurrentTime((e.target as HTMLAudioElement).currentTime)}
        onEnded={() => {
          if (isLooping) {
            if (audioRef.current) audioRef.current.currentTime = 0;
            setIsPlaying(true);
          } else {
            setIsPlaying(false);
          }
        }}
        style={{ display: "none" }}
      />
      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div className="h-14 bg-[#252525] border-b-4 border-black flex items-center px-4 justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 pr-3 border-r-2 border-white/10">
            <button className="bg-white/5 border border-white/10 p-1.5 hover:bg-primary hover:text-black transition-all">
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button className="bg-white/5 border border-white/10 p-1.5 hover:bg-primary hover:text-black transition-all">
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-1 pl-1">
            <button className="bg-white/5 border border-white/10 p-1.5 hover:bg-secondary hover:text-white transition-all" title="Split">
              <Scissors className="w-3.5 h-3.5" />
            </button>
            <button className="bg-white/5 border border-white/10 p-1.5 hover:bg-primary hover:text-black transition-all" title="Snap">
              <Scan className="w-3.5 h-3.5" />
            </button>
            <button className="bg-secondary text-white border-2 border-black px-3 py-1 font-black uppercase text-[9px] hover:bg-secondary/80 transition-all shadow-hard-xs ml-1 flex items-center gap-1.5 italic">
              <Zap className="w-3 h-3 fill-white" />
              Auto-Sync
            </button>
          </div>
        </div>

        {/* Time display */}
        <div className="bg-black px-4 py-1.5 border-2 border-white/10">
          <span className="text-primary font-mono text-lg font-black tracking-[0.2em]">
            {formatTime(currentTime)}
          </span>
        </div>

        {/* Zoom slider */}
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-black uppercase text-white/30 tracking-widest">Zoom</span>
          <input
            type="range"
            min="0.5"
            max="4"
            step="0.1"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-24 accent-primary cursor-pointer"
          />
          <span className="font-mono text-[9px] text-white/40 w-8">{zoom.toFixed(1)}x</span>
        </div>
      </div>

      {/* ── Tracks Scroll Area ───────────────────────────────────────────── */}
      <div
        ref={trackRef}
        className="flex-1 overflow-x-auto overflow-y-auto relative select-none"
        style={{ scrollbarWidth: "thin" }}
      >
        <div
          className="relative flex flex-col"
          style={{ width: `${duration * PIXELS_PER_SECOND * zoom}px`, minHeight: "100%" }}
        >
          {/* Ruler (click to scrub) */}
          <TimeRuler zoom={zoom} onScrubRuler={handleScrub} trackRef={trackRef} duration={duration} />

          {/* Beat Markers (8.3) */}
          <BeatMarkerTrack zoom={zoom} duration={duration} bpm={bpm} />

          {/* Panel Sequence Track (8.5) + Transitions (8.4) */}
          <PanelSequenceTrack zoom={zoom} selectedChip={selectedChip} onSelect={setSelectedChip} duration={duration} />

          {/* Audio waveform track */}
          <AudioTrack zoom={zoom} duration={duration} />

          {/* Playhead (8.2) — overlaid on all tracks */}
          <Playhead
            currentTime={currentTime}
            zoom={zoom}
            onScrub={handleScrub}
            trackRef={trackRef}
            duration={duration}
          />
        </div>
      </div>

      {/* ── Playback Controls (8.6) ──────────────────────────────────────── */}
      <div className="h-16 bg-black border-t-4 border-black flex justify-center items-center gap-6 relative z-50 shrink-0">
        {/* Skip Back */}
        <button
          onClick={handleSkipBack}
          className="text-white/40 hover:text-white transition-colors"
          title="Skip to Start"
        >
          <SkipBack className="w-5 h-5" />
        </button>

        {/* Play / Pause */}
        <button
          id="timeline-play-pause"
          onClick={() => setIsPlaying(!isPlaying)}
          className="bg-primary text-black border-2 border-white shadow-hard-sm hover:translate-y-0.5 hover:shadow-none transition-all active:scale-95 p-3 flex items-center justify-center"
        >
          <AnimatePresence mode="wait" initial={false}>
            {isPlaying ? (
              <motion.div key="pause" initial={{ scale: 0.7 }} animate={{ scale: 1 }} exit={{ scale: 0.7 }}>
                <Pause className="w-7 h-7 fill-black" />
              </motion.div>
            ) : (
              <motion.div key="play" initial={{ scale: 0.7 }} animate={{ scale: 1 }} exit={{ scale: 0.7 }}>
                <Play className="w-7 h-7 fill-black" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* Skip Forward */}
        <button
          onClick={handleSkipForward}
          className="text-white/40 hover:text-white transition-colors"
          title="Skip to End"
        >
          <SkipForward className="w-5 h-5" />
        </button>

        {/* Loop */}
        <button
          id="timeline-loop"
          onClick={() => setIsLooping(!isLooping)}
          className={cn(
            "p-2 border-2 transition-all",
            isLooping ? "bg-primary text-black border-black" : "border-white/10 text-white/30 hover:text-white",
          )}
          title="Loop"
        >
          <Repeat className="w-4 h-4" />
        </button>

        {/* Volume */}
        <div className="absolute right-6 flex items-center gap-3">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="text-white/40 hover:text-primary transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <div className="relative w-20 h-2 bg-white/10 cursor-pointer group">
            <div
              className="absolute left-0 top-0 h-full bg-white group-hover:bg-primary transition-colors"
              style={{ width: `${isMuted ? 0 : volume}%` }}
            />
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseInt(e.target.value));
                setIsMuted(false);
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <span className="font-mono text-[9px] text-white/20 w-6 text-right">
            {isMuted ? "0" : volume}
          </span>
        </div>
      </div>
    </div>
  );
}
