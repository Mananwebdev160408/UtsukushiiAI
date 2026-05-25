"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("GLOBAL_ERROR:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-black min-h-screen flex flex-col items-center justify-center font-display text-white overflow-hidden relative">
        {/* Stripe background */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: "repeating-linear-gradient(45deg, #ff0000 0, #ff0000 1px, transparent 0, transparent 50%)",
            backgroundSize: "12px 12px",
          }}
        />

        <div className="relative z-10 text-center px-6 max-w-2xl space-y-10">
          {/* Error stamp */}
          <div className="flex justify-center">
            <div className="relative w-32 h-32 border-6 border-red-500 flex items-center justify-center shadow-[0_0_40px_rgba(255,0,0,0.3)] rotate-3">
              <AlertTriangle className="w-16 h-16 text-red-500" />
              <div className="absolute -top-3 -right-3 bg-red-500 text-white font-black text-[10px] uppercase px-2 py-1 border-2 border-black">
                500
              </div>
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-4">
            <h1
              className="font-black text-6xl md:text-8xl uppercase italic tracking-tighter"
              style={{ textShadow: "4px 4px 0 #ff0000" }}
            >
              System Crash
            </h1>
            <p className="font-mono text-sm text-white/40 uppercase tracking-[0.2em] leading-relaxed">
              A critical forge error occurred. Our engineers have been notified.
            </p>
          </div>

          {/* Error details */}
          {error.message && (
            <div className="bg-black border-4 border-red-500/30 p-6 text-left space-y-2 font-mono text-[11px]">
              <p className="text-red-400">&gt; EXCEPTION: {error.message}</p>
              {error.digest && <p className="text-white/20">&gt; DIGEST: {error.digest}</p>}
              <p className="text-red-400 animate-pulse">&gt; CORE_DUMP_INITIATED...</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={reset}
              className="flex items-center justify-center gap-3 bg-red-500 text-white border-4 border-black px-10 py-4 font-black uppercase text-lg italic shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              <RefreshCw className="w-5 h-5" />
              Retry
            </button>
            <Link
              href="/projects"
              className="flex items-center justify-center gap-3 bg-black text-white border-4 border-white/20 px-10 py-4 font-black uppercase text-lg italic hover:border-white/60 transition-all"
            >
              <Home className="w-5 h-5" />
              Return to Hub
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
