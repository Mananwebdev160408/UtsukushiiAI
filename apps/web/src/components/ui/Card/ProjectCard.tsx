"use client";

import Image from "next/image";
import Link from "next/link";
import { Play, MoreVertical, Clock, Film } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ProjectCardProps {
  id: string;
  title: string;
  status: "idle" | "rendering" | "completed" | "error";
  lastUpdated: string;
  image?: string;
  duration?: string;
}

export function ProjectCard({
  id,
  title,
  status,
  lastUpdated,
  image,
  duration,
}: ProjectCardProps) {
  return (
    <div className="group bg-black border-2 border-white/5 hover:border-primary transition-all relative neo-shadow overflow-hidden group">
      {/* Status Badge */}
      <div className="absolute top-4 left-4 z-20">
        <div
          className={cn(
            "px-2 py-1 flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-widest",
            status === "completed" && "bg-primary text-black",
            status === "rendering" && "bg-secondary text-white animate-pulse",
            status === "idle" && "bg-white/10 text-white/40",
            status === "error" && "bg-red-600 text-white",
          )}
        >
          {status === "rendering" && (
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
          )}
          {status}
        </div>
      </div>

      <div className="absolute top-4 right-4 z-20">
        <button className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:text-primary transition-colors">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Preview Image */}
      <div className="relative aspect-video w-full bg-white/5 flex items-center justify-center overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <Film className="w-12 h-12 text-white/10" />
        )}

        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center neo-shadow text-black transform scale-0 group-hover:scale-100 transition-transform">
            <Play className="w-6 h-6 fill-black" />
          </div>
        </div>

        {duration && (
          <div className="absolute bottom-4 right-4 px-2 py-1 bg-black/80 backdrop-blur-sm text-white font-bold text-[8px] uppercase tracking-widest">
            {duration}
          </div>
        )}
      </div>

      {/* Content */}
      <Link href={`/projects/${id}`} className="block p-6 space-y-4">
        <h3 className="font-display text-xl uppercase tracking-tighter truncate group-hover:text-primary transition-colors">
          {title}
        </h3>

        <div className="flex items-center justify-between pt-4 border-t border-white/5 text-[9px] font-bold uppercase tracking-widest text-white/20">
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3" />
            {lastUpdated}
          </div>
          <span className="italic">Project_ID: {id}</span>
        </div>
      </Link>
    </div>
  );
}
