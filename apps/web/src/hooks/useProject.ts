'use client';

import { useCallback, useEffect } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { api } from '@/lib/api/client';
import type { Project, Panel } from '@/types';

/**
 * Custom hook for project data management.
 * Handles fetching, CRUD, and panel operations.
 */
export function useProject(projectId?: string) {
  const {
    projects,
    activeProject,
    panels,
    isLoading,
    error,
    setProjects,
    addProject,
    removeProject,
    setActiveProject,
    updateProject,
    setPanels,
    addPanel,
    updatePanel,
    removePanel,
    reorderPanels,
    setLoading,
    setError,
  } = useProjectStore();

  // Fetch all projects
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.projects.list();
      if (response.success && response.data) {
        setProjects(response.data);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }, [setProjects, setLoading, setError]);

  // Fetch single project
  const fetchProject = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.projects.get(id);
      if (response.success && response.data) {
        setActiveProject(response.data);
        return response.data;
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch project');
    } finally {
      setLoading(false);
    }
    return null;
  }, [setActiveProject, setLoading, setError]);

  // Create new project
  const createProject = useCallback(async (data: { title: string; description?: string; aspectRatio?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.projects.create(data);
      if (response.success && response.data) {
        addProject(response.data);
        return response.data;
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
    return null;
  }, [addProject, setLoading, setError]);

  // Delete project
  const deleteProject = useCallback(async (id: string) => {
    try {
      const response = await api.projects.delete(id);
      if (response.success) {
        removeProject(id);
        return true;
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to delete project');
    }
    return false;
  }, [removeProject, setError]);

  // Auto-fetch project if ID is provided
  useEffect(() => {
    if (projectId && (!activeProject || activeProject.id !== projectId)) {
      fetchProject(projectId);
    }
  }, [projectId, activeProject, fetchProject]);

  return {
    projects,
    activeProject,
    panels,
    isLoading,
    error,
    fetchProjects,
    fetchProject,
    createProject,
    deleteProject,
    updateProject,
    setPanels,
    addPanel,
    updatePanel,
    removePanel,
    reorderPanels,
    setActiveProject,
  };
}
