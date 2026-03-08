import { create } from 'zustand';

type CanvasTool = 'select' | 'pan' | 'draw' | 'zoom';

interface CanvasState {
  // Viewport
  zoom: number;
  panX: number;
  panY: number;
  tool: CanvasTool;
  selectedPanelId: string | null;

  // History
  canUndo: boolean;
  canRedo: boolean;

  // Grid
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;

  // Actions
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomToFit: () => void;
  setPan: (x: number, y: number) => void;
  setTool: (tool: CanvasTool) => void;
  selectPanel: (id: string | null) => void;
  toggleGrid: () => void;
  toggleSnap: () => void;
  resetView: () => void;
}

export const useCanvasStore = create<CanvasState>()((set) => ({
  zoom: 1,
  panX: 0,
  panY: 0,
  tool: 'select',
  selectedPanelId: null,
  canUndo: false,
  canRedo: false,
  showGrid: false,
  snapToGrid: true,
  gridSize: 20,

  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(5, zoom)) }),
  zoomIn: () => set((s) => ({ zoom: Math.min(5, s.zoom * 1.2) })),
  zoomOut: () => set((s) => ({ zoom: Math.max(0.1, s.zoom / 1.2) })),
  zoomToFit: () => set({ zoom: 1, panX: 0, panY: 0 }),
  setPan: (panX, panY) => set({ panX, panY }),
  setTool: (tool) => set({ tool }),
  selectPanel: (id) => set({ selectedPanelId: id }),
  toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
  toggleSnap: () => set((s) => ({ snapToGrid: !s.snapToGrid })),
  resetView: () => set({ zoom: 1, panX: 0, panY: 0, selectedPanelId: null }),
}));
