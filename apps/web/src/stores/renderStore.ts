import { create } from 'zustand';
import type { RenderJob, RenderSettings, EffectsConfig, TransitionEffect } from '@/types';

const DEFAULT_EFFECTS: EffectsConfig = {
  parallax: true,
  glow: true,
  zoom: true,
  animation: true,
  wiggle: true,
  textOverlay: false,
};

const DEFAULT_SETTINGS: RenderSettings = {
  quality: 'standard',
  fps: 24,
  width: 1080,
  height: 1920,
  codec: 'libx264',
  effects: DEFAULT_EFFECTS,
  transition: 'fade',
  transitionDuration: 0.5,
};

interface RenderState {
  // Current render
  currentJob: RenderJob | null;
  settings: RenderSettings;
  jobHistory: RenderJob[];
  isSubmitting: boolean;

  // Actions
  setCurrentJob: (job: RenderJob | null) => void;
  updateJobProgress: (progress: number, stage: string, message: string) => void;
  completeJob: (resultUrl: string, duration: number, fileSize: number) => void;
  failJob: (error: string) => void;
  setSettings: (settings: Partial<RenderSettings>) => void;
  setEffects: (effects: Partial<EffectsConfig>) => void;
  setJobHistory: (jobs: RenderJob[]) => void;
  addToHistory: (job: RenderJob) => void;
  setSubmitting: (submitting: boolean) => void;
  resetSettings: () => void;
}

export const useRenderStore = create<RenderState>()((set) => ({
  currentJob: null,
  settings: DEFAULT_SETTINGS,
  jobHistory: [],
  isSubmitting: false,

  setCurrentJob: (currentJob) => set({ currentJob }),
  updateJobProgress: (progress, stage, message) =>
    set((s) => ({
      currentJob: s.currentJob
        ? { ...s.currentJob, progress, currentStage: stage, message, status: 'processing' }
        : null,
    })),
  completeJob: (resultUrl, durationSeconds, fileSizeBytes) =>
    set((s) => {
      const completedJob: RenderJob | null = s.currentJob
        ? {
            ...s.currentJob,
            status: 'completed',
            progress: 100,
            resultUrl,
            durationSeconds,
            fileSizeBytes,
            completedAt: new Date().toISOString(),
          }
        : null;
      return {
        currentJob: completedJob,
        jobHistory: completedJob ? [completedJob, ...s.jobHistory] : s.jobHistory,
      };
    }),
  failJob: (error) =>
    set((s) => ({
      currentJob: s.currentJob
        ? { ...s.currentJob, status: 'failed', error }
        : null,
    })),
  setSettings: (updates) =>
    set((s) => ({ settings: { ...s.settings, ...updates } })),
  setEffects: (effectUpdates) =>
    set((s) => ({
      settings: {
        ...s.settings,
        effects: { ...s.settings.effects, ...effectUpdates },
      },
    })),
  setJobHistory: (jobHistory) => set({ jobHistory }),
  addToHistory: (job) =>
    set((s) => ({ jobHistory: [job, ...s.jobHistory] })),
  setSubmitting: (isSubmitting) => set({ isSubmitting }),
  resetSettings: () => set({ settings: DEFAULT_SETTINGS }),
}));
