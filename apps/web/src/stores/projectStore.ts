import { create } from 'zustand';
import type { Project, Panel, MangaPage, AudioInfo } from '@/types';

interface ProjectState {
  // Data
  projects: Project[];
  activeProject: Project | null;
  panels: Panel[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  removeProject: (id: string) => void;
  setActiveProject: (project: Project | null) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  setPanels: (panels: Panel[]) => void;
  addPanel: (panel: Panel) => void;
  updatePanel: (id: string, updates: Partial<Panel>) => void;
  removePanel: (id: string) => void;
  reorderPanels: (startIndex: number, endIndex: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useProjectStore = create<ProjectState>()((set) => ({
  projects: [],
  activeProject: null,
  panels: [],
  isLoading: false,
  error: null,

  setProjects: (projects) => set({ projects }),
  addProject: (project) =>
    set((state) => ({ projects: [project, ...state.projects] })),
  removeProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      activeProject: state.activeProject?.id === id ? null : state.activeProject,
    })),
  setActiveProject: (project) => set({ activeProject: project }),
  updateProject: (id, updates) =>
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      activeProject:
        state.activeProject?.id === id
          ? { ...state.activeProject, ...updates }
          : state.activeProject,
    })),
  setPanels: (panels) => set({ panels }),
  addPanel: (panel) =>
    set((state) => ({ panels: [...state.panels, panel] })),
  updatePanel: (id, updates) =>
    set((state) => ({
      panels: state.panels.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),
  removePanel: (id) =>
    set((state) => ({
      panels: state.panels.filter((p) => p.id !== id),
    })),
  reorderPanels: (startIndex, endIndex) =>
    set((state) => {
      const result = [...state.panels];
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return { panels: result.map((p, i) => ({ ...p, index: i })) };
    }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
