'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useCanvasStore } from '@/stores/canvasStore';

/**
 * Custom hook for canvas interaction logic.
 * Handles keyboard shortcuts, zoom gestures, and coordinate transforms.
 */
export function useCanvas() {
  const {
    zoom,
    panX,
    panY,
    tool,
    selectedPanelId,
    showGrid,
    snapToGrid,
    setZoom,
    zoomIn,
    zoomOut,
    zoomToFit,
    setPan,
    setTool,
    selectPanel,
    toggleGrid,
    toggleSnap,
    resetView,
  } = useCanvasStore();

  // ── Keyboard Shortcuts ──────────────────────────────────────────

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'v':
          setTool('select');
          break;
        case 'h':
          setTool('pan');
          break;
        case 'd':
          setTool('draw');
          break;
        case 'delete':
        case 'backspace':
          // Delete selected panel — handled by parent component
          break;
        case '=':
        case '+':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            zoomIn();
          }
          break;
        case '-':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            zoomOut();
          }
          break;
        case '0':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            zoomToFit();
          }
          break;
        case 'g':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            toggleGrid();
          }
          break;
        case 'escape':
          selectPanel(null);
          setTool('select');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setTool, zoomIn, zoomOut, zoomToFit, toggleGrid, selectPanel]);

  // ── Coordinate Transforms ───────────────────────────────────────

  const screenToCanvas = useCallback(
    (screenX: number, screenY: number) => ({
      x: (screenX - panX) / zoom,
      y: (screenY - panY) / zoom,
    }),
    [zoom, panX, panY],
  );

  const canvasToScreen = useCallback(
    (canvasX: number, canvasY: number) => ({
      x: canvasX * zoom + panX,
      y: canvasY * zoom + panY,
    }),
    [zoom, panX, panY],
  );

  // ── Snap to Grid ────────────────────────────────────────────────

  const snapValue = useCallback(
    (value: number) => {
      if (!snapToGrid) return value;
      const gridSize = useCanvasStore.getState().gridSize;
      return Math.round(value / gridSize) * gridSize;
    },
    [snapToGrid],
  );

  return {
    zoom,
    panX,
    panY,
    tool,
    selectedPanelId,
    showGrid,
    snapToGrid,
    setZoom,
    zoomIn,
    zoomOut,
    zoomToFit,
    setPan,
    setTool,
    selectPanel,
    toggleGrid,
    toggleSnap,
    resetView,
    screenToCanvas,
    canvasToScreen,
    snapValue,
  };
}
