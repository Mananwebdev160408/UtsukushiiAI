'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRenderStore } from '@/stores/renderStore';
import type { RenderSettings } from '@/types';

/**
 * Custom hook for render job management.
 * Handles job submission, WebSocket progress tracking, and history.
 */
export function useRender(projectId?: string) {
  const {
    currentJob,
    settings,
    jobHistory,
    isSubmitting,
    setCurrentJob,
    updateJobProgress,
    completeJob,
    failJob,
    setSettings,
    setEffects,
    setSubmitting,
    resetSettings,
  } = useRenderStore();

  const wsRef = useRef<WebSocket | null>(null);

  // Submit render job
  const submitRender = useCallback(async (mangaPath: string, audioPath: string) => {
    if (!projectId) return;
    setSubmitting(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_ML_WORKER_URL || 'http://localhost:8001'}/render/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          manga_path: mangaPath,
          audio_path: audioPath,
          settings: {
            quality: settings.quality,
            fps: settings.fps,
            width: settings.width,
            height: settings.height,
            codec: settings.codec,
            effects: settings.effects,
            transition: settings.transition,
            transition_duration: settings.transitionDuration,
          },
        }),
      });

      const data = await response.json();
      if (data.job_id) {
        setCurrentJob({
          id: data.job_id,
          projectId,
          status: 'queued',
          progress: 0,
          currentStage: 'queued',
          message: 'Job submitted',
        });
        // Start polling for progress
        startProgressPolling(data.job_id);
      }
    } catch (err: any) {
      failJob(err?.message || 'Failed to submit render');
    } finally {
      setSubmitting(false);
    }
  }, [projectId, settings, setCurrentJob, failJob, setSubmitting]);

  // Cancel render
  const cancelRender = useCallback(async () => {
    if (!projectId) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_ML_WORKER_URL || 'http://localhost:8001'}/render/cancel/${projectId}`, {
        method: 'POST',
      });
      setCurrentJob(currentJob ? { ...currentJob, status: 'cancelled' } : null);
    } catch (err) {
      console.error('Failed to cancel render:', err);
    }
  }, [projectId, currentJob, setCurrentJob]);

  // Poll for progress (fallback when WebSocket is not available)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startProgressPolling = useCallback((jobId: string) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_ML_WORKER_URL || 'http://localhost:8001'}/render/status/${jobId}`
        );
        const data = await res.json();

        if (data.status === 'completed') {
          completeJob(data.result_url || '', data.duration || 0, data.file_size || 0);
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        } else if (data.status === 'failed') {
          failJob(data.error || 'Render failed');
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        } else if (data.status === 'cancelled') {
          setCurrentJob(currentJob ? { ...currentJob, status: 'cancelled' } : null);
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        } else {
          updateJobProgress(data.progress || 0, data.stage || '', data.message || '');
        }
      } catch {
        // Silent fail — will retry next interval
      }
    }, 2000);
  }, [updateJobProgress, completeJob, failJob, setCurrentJob, currentJob]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // Get music suggestion
  const suggestMusic = useCallback(async (mangaPath: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_ML_WORKER_URL || 'http://localhost:8001'}/suggest/music`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ manga_path: mangaPath }),
        }
      );
      return await res.json();
    } catch {
      return null;
    }
  }, []);

  return {
    currentJob,
    settings,
    jobHistory,
    isSubmitting,
    submitRender,
    cancelRender,
    suggestMusic,
    setSettings,
    setEffects,
    resetSettings,
  };
}
