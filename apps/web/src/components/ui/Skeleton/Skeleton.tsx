"use client";

import { cn } from "@/lib/utils/cn";

// ─── Base Skeleton ─────────────────────────────────────────────────────────────
function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-white/5 border-2 border-white/5",
        className,
      )}
    >
      {/* Shimmer sweep */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/8 to-transparent" />
    </div>
  );
}

// ─── Project Card Skeleton ─────────────────────────────────────────────────────
export function ProjectCardSkeleton() {
  return (
    <div className="bg-surface-dark border-6 border-black shadow-hard flex flex-col">
      <SkeletonBlock className="w-full aspect-video border-b-6 border-black" />
      <div className="p-8 space-y-4 flex-1">
        <SkeletonBlock className="h-7 w-3/4" />
        <div className="flex gap-2">
          <SkeletonBlock className="h-5 w-16" />
          <SkeletonBlock className="h-5 w-20" />
        </div>
        <div className="pt-4 border-t-4 border-black flex items-center justify-between">
          <SkeletonBlock className="h-4 w-20" />
          <div className="flex gap-2">
            <SkeletonBlock className="w-10 h-10" />
            <SkeletonBlock className="w-10 h-10" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Grid Skeleton ───────────────────────────────────────────────────
export function ProjectGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
      {[...Array(count)].map((_, i) => (
        <ProjectCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ─── Editor Panel Skeleton ─────────────────────────────────────────────────────
export function EditorPanelSkeleton() {
  return (
    <div className="h-full bg-[#0a0a0a] flex flex-col p-6 space-y-6">
      <SkeletonBlock className="h-6 w-1/2" />
      <SkeletonBlock className="h-40 w-full" />
      <SkeletonBlock className="h-5 w-full" />
      <SkeletonBlock className="h-5 w-3/4" />
      <SkeletonBlock className="h-5 w-full" />
      <SkeletonBlock className="h-5 w-2/3" />
      <div className="mt-auto space-y-3">
        <SkeletonBlock className="h-3 w-full" />
        <SkeletonBlock className="h-14 w-full" />
      </div>
    </div>
  );
}

// ─── Layer Manager Skeleton ────────────────────────────────────────────────────
export function LayerListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3 p-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 bg-white/5 border-2 border-white/5">
          <SkeletonBlock className="w-12 h-12 shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonBlock className="h-4 w-3/4" />
            <SkeletonBlock className="h-3 w-1/2" />
          </div>
          <SkeletonBlock className="w-6 h-6 shrink-0" />
        </div>
      ))}
    </div>
  );
}

// ─── Settings Skeleton ─────────────────────────────────────────────────────────
export function SettingsSkeleton() {
  return (
    <div className="space-y-6 p-8">
      <SkeletonBlock className="h-8 w-1/3" />
      <SkeletonBlock className="h-4 w-1/2" />
      <div className="grid grid-cols-2 gap-6 mt-8">
        <div className="space-y-2">
          <SkeletonBlock className="h-3 w-1/3" />
          <SkeletonBlock className="h-12 w-full" />
        </div>
        <div className="space-y-2">
          <SkeletonBlock className="h-3 w-1/3" />
          <SkeletonBlock className="h-12 w-full" />
        </div>
        <div className="col-span-2 space-y-2">
          <SkeletonBlock className="h-3 w-1/4" />
          <SkeletonBlock className="h-28 w-full" />
        </div>
      </div>
    </div>
  );
}

// ─── Timeline Skeleton ─────────────────────────────────────────────────────────
export function TimelineSkeleton() {
  return (
    <div className="h-full bg-[#171810] flex flex-col">
      <div className="h-14 bg-[#252525] border-b-4 border-black flex items-center px-4 gap-3">
        <SkeletonBlock className="h-8 w-20" />
        <SkeletonBlock className="h-8 w-8" />
        <SkeletonBlock className="h-8 w-8" />
        <div className="ml-auto">
          <SkeletonBlock className="h-10 w-36" />
        </div>
      </div>
      <div className="flex-1 p-4 space-y-3">
        <SkeletonBlock className="h-8 w-full" />
        <SkeletonBlock className="h-5 w-full" />
        <SkeletonBlock className="h-12 w-full" />
        <SkeletonBlock className="h-16 w-full" />
      </div>
      <div className="h-20 bg-black border-t-4 border-black flex items-center justify-center gap-8 px-8">
        <SkeletonBlock className="w-6 h-6" />
        <SkeletonBlock className="w-14 h-14" />
        <SkeletonBlock className="w-6 h-6" />
      </div>
    </div>
  );
}
