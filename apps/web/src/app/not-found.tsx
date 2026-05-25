"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Home, RefreshCw } from "lucide-react";

export default function NotFound() {
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 150);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center relative overflow-hidden font-display selection:bg-primary selection:text-black">
      {/* Dot grid background */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(#ccff00 1px, transparent 1px)", backgroundSize: "32px 32px" }}
      />

      {/* Glitch overlay */}
      {glitch && (
        <div className="absolute inset-0 z-50 pointer-events-none">
          <div className="absolute inset-0 bg-primary/5 translate-x-[3px]" />
          <div className="absolute inset-0 bg-secondary/5 -translate-x-[3px]" />
        </div>
      )}

      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto space-y-12">
        {/* 404 Hero */}
        <div className="relative">
          <h1
            className="font-display font-black text-[150px] md:text-[200px] leading-none uppercase italic tracking-tighter text-white select-none"
            style={{
              WebkitTextStroke: "2px #ccff00",
              textShadow: glitch ? "6px 0 #ff00ff, -6px 0 #00ffff" : "8px 8px 0 #ccff00",
              transition: "text-shadow 0.05s",
            }}
          >
            404
          </h1>
          <div className="absolute -bottom-4 left-0 right-0 h-1 bg-primary" />
        </div>

        {/* Message */}
        <div className="space-y-4">
          <h2 className="font-black text-3xl md:text-5xl uppercase italic text-white tracking-tighter">
            Signal Lost
          </h2>
          <p className="font-mono text-sm text-white/40 uppercase tracking-[0.2em] leading-relaxed max-w-sm mx-auto">
            The page you're looking for has been corrupted, deleted, or never existed in this timeline.
          </p>
        </div>

        {/* Terminal readout */}
        <div className="bg-black border-4 border-white/10 p-6 text-left space-y-2 font-mono text-[11px] max-w-md mx-auto">
          <p className="text-primary">&gt; ERROR_CODE: 404_NOT_FOUND</p>
          <p className="text-white/30">&gt; PATH: {typeof window !== "undefined" ? window.location.pathname : "/unknown"}</p>
          <p className="text-white/30">&gt; STATUS: ROUTE_UNMAPPED</p>
          <p className="text-primary animate-pulse">&gt; SCANNING_ALTERNATE_ROUTES...</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/projects"
            className="flex items-center justify-center gap-3 bg-primary text-black border-4 border-black px-10 py-4 font-black uppercase text-lg italic shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
          >
            <Home className="w-5 h-5" />
            Return to Hub
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-3 bg-black text-white border-4 border-white/20 px-10 py-4 font-black uppercase text-lg italic hover:border-white/60 transition-all"
          >
            <RefreshCw className="w-5 h-5" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
