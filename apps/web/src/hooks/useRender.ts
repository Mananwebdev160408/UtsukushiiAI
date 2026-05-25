'use client';

import { useEffect, useRef, useCallback } from 'react';
import { api } from '@/lib/api/client';
import {
  connectRenderSocket,
  onRenderEvent,
  offRenderEvent,
} from '@/lib/socket/renderSocket';
import { useRenderStore } from '@/stores/renderStore';

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

  // Submit render job
  const submitRender = useCallback(async (_mangaPath: string, _audioPath: string) => {
    if (!projectId) return;
    setSubmitting(true);

    try {
      const response = await api.render.start({
        projectId,
        settings: {
          quality: settings.quality,
          fps: settings.fps,
          resolution: `${settings.width}x${settings.height}`,
          format: settings.codec === 'libx265' ? 'webm' : 'mp4',
          effects: settings.effects,
        },
      });

      const jobId = response.data?._id || response.data?.id;
      if (jobId) {
        setCurrentJob({
          id: jobId,
          projectId,
          status: 'queued',
          progress: 0,
          currentStage: 'queued',
          message: 'Job submitted',
        });
        // Start polling for progress
        startProgressPolling(jobId);
      } else {
        failJob('Render API did not return a job id');
      }
    } catch (err: any) {
      failJob(err?.message || 'Failed to submit render');
    } finally {
      setSubmitting(false);
    }
  }, [projectId, settings, setCurrentJob, failJob, setSubmitting]);

  // Cancel render
  const cancelRender = useCallback(async () => {
    if (!currentJob?.id) return;
    try {
      await api.render.cancel(currentJob.id);
      setCurrentJob(currentJob ? { ...currentJob, status: 'cancelled' } : null);
    } catch (err) {
      console.error('Failed to cancel render:', err);
    }
  }, [currentJob, setCurrentJob]);

  // Poll for progress (fallback when WebSocket is not available)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const normalizeRenderStatus = (status?: string) => {
    if (status === 'pending') return 'queued';
    return status || 'queued';
  };

  const startProgressPolling = useCallback((jobId: string) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    pollIntervalRef.current = setInterval(async () => {
      try {
        const response = await api.render.status(jobId);
        const job = response.data;
        const status = normalizeRenderStatus(job?.status);

        if (status === 'completed') {
          completeJob(job?.outputUrl || '', job?.duration || 0, job?.fileSize || 0);
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        } else if (status === 'failed') {
          failJob(job?.error?.message || 'Render failed');
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        } else if (status === 'cancelled') {
          setCurrentJob({
            id: job?.id || job?._id || jobId,
            projectId: job?.projectId || projectId || '',
            status: 'cancelled',
            progress: job?.progress || 0,
            currentStage: 'cancelled',
            message: 'Render cancelled',
          });
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        } else {
          updateJobProgress(job?.progress || 0, status, 'Rendering in progress');
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

  // WebSocket listeners for real-time render updates
  useEffect(() => {
    const handleProgress = (data: any) => {
      try {
        if (data.jobId === currentJob?.id || data.projectId === projectId) {
          updateJobProgress(data.progress || 0, data.status, data.message || '');
        }
      } catch {}
    };

    const handleComplete = (data: any) => {
      try {
        if (data.jobId === currentJob?.id || data.projectId === projectId) {
          completeJob(data.outputUrl || '', data.duration || 0, data.fileSize || 0);
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        }
      } catch {}
    };

    const handleError = (data: any) => {
      try {
        if (data.jobId === currentJob?.id || data.projectId === projectId) {
          failJob(data.error?.message || 'Render failed');
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        }
      } catch {}
    };

    const handleCancelled = (data: any) => {
      try {
        if (data.jobId === currentJob?.id || data.projectId === projectId) {
          setCurrentJob({
            id: data.jobId || currentJob?.id || '',
            projectId: data.projectId || projectId || '',
            status: 'cancelled',
            progress: data.progress || 0,
            currentStage: 'cancelled',
            message: 'Render cancelled',
          });
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        }
      } catch {}
    };

    connectRenderSocket();
    onRenderEvent('render:progress', handleProgress);
    onRenderEvent('render:complete', handleComplete);
    onRenderEvent('render:error', handleError);
    onRenderEvent('render:cancelled', handleCancelled);

    return () => {
      offRenderEvent('render:progress', handleProgress);
      offRenderEvent('render:complete', handleComplete);
      offRenderEvent('render:error', handleError);
      offRenderEvent('render:cancelled', handleCancelled);
    };
  }, [projectId, currentJob?.id, updateJobProgress, completeJob, failJob, setCurrentJob]);

  // Get music suggestion
  const suggestMusic = useCallback(async (mangaPath: string) => {
    try {
      const res = await api.ml.suggestMusic(mangaPath);
      return res.data;
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
