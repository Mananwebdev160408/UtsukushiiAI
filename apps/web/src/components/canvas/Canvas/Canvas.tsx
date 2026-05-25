"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useProject } from '@/hooks/useProject';
import { api } from '@/lib/api/client';
import { useCanvasStore } from '@/stores/canvasStore';
import {
  Plus,
  Minus,
  Move,
  Hand,
  Square,
  Maximize2,
  MousePointer2,
  Trash2,
  Save,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

type Tool = "select" | "pan" | "draw";

interface Panel {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: "mask" | "prop";
  label: string;
}


const SNAP_GRID = 5; // percent

function snapToGrid(val: number): number {
  return Math.round(val / SNAP_GRID) * SNAP_GRID;
}

// ─── Resize Handle ────────────────────────────────────────────────────────────
type ResizeDir = "nw" | "ne" | "sw" | "se";

function ResizeHandle({
  dir,
  onResize,
  color,
}: {
  dir: ResizeDir;
  onResize: (dx: number, dy: number, dir: ResizeDir) => void;
  color: string;
}) {
  const startRef = useRef<{ x: number; y: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    startRef.current = { x: e.clientX, y: e.clientY };

    const onMouseMove = (ev: MouseEvent) => {
      if (!startRef.current) return;
      const dx = ev.clientX - startRef.current.x;
      const dy = ev.clientY - startRef.current.y;
      startRef.current = { x: ev.clientX, y: ev.clientY };
      onResize(dx, dy, dir);
    };

    const onMouseUp = () => {
      startRef.current = null;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const posClass = {
    nw: "-top-2 -left-2 cursor-nw-resize",
    ne: "-top-2 -right-2 cursor-ne-resize",
    sw: "-bottom-2 -left-2 cursor-sw-resize",
    se: "-bottom-2 -right-2 cursor-se-resize",
  }[dir];

  return (
    <div
      onMouseDown={handleMouseDown}
      className={cn(
        "absolute w-4 h-4 border-2 border-black z-10",
        posClass,
        color,
      )}
    />
  );
}

// ─── Canvas Component ─────────────────────────────────────────────────────────
export function Canvas() {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const tool = useCanvasStore((s) => s.tool);
  const setTool = useCanvasStore((s) => s.setTool);
  const selectedPanel = useCanvasStore((s) => s.selectedPanelId);
  const selectPanel = useCanvasStore((s) => s.selectPanel);
  const params = useParams();
  const projectId = String(params.id || "");
  const { panels: storePanels, setPanels: setStorePanels } = useProject(projectId);

  // Local panels state used for interactive editing; initialize from project store
  const [panels, setPanels] = useState<Panel[]>(() => {
    if (storePanels && storePanels.length > 0) {
      return storePanels.map((p) => ({
        id: p.id,
        x: p.bbox?.x ?? p.bbox?.x ?? 0,
        y: p.bbox?.y ?? 0,
        w: p.bbox?.width ?? 10,
        h: p.bbox?.height ?? 10,
        type: 'mask',
        label: p.label || 'Panel',
      }));
    }
    return [];
  });

  // Sync when storePanels change (e.g., after fetch)
  useEffect(() => {
    if (!storePanels) return;
    setPanels(
      storePanels.map((p) => ({
        id: p.id,
        x: p.bbox?.x ?? 0,
        y: p.bbox?.y ?? 0,
        w: p.bbox?.width ?? 10,
        h: p.bbox?.height ?? 10,
        type: 'mask',
        label: p.label || 'Panel',
      })),
    );
  }, [storePanels]);
  
  const [saved, setSaved] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [detectedPreview, setDetectedPreview] = useState<Panel[] | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const isDraggingPane = useRef(false);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  // ── Keyboard shortcuts (7.7) ────────────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Guard: ignore if typing in an input
      if ((e.target as HTMLElement).tagName === "INPUT" || (e.target as HTMLElement).tagName === "TEXTAREA") return;

      if (e.key === "v" || e.key === "V") setTool("select");
      if (e.key === "h" || e.key === "H") setTool("pan");
      if (e.key === "d" || e.key === "D") setTool("draw");
      if ((e.key === "Delete" || e.key === "Backspace") && selectedPanel) {
        setPanels((prev) => prev.filter((p) => p.id !== selectedPanel));
        selectPanel(null);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
      // Zoom shortcuts
      if ((e.ctrlKey || e.metaKey) && (e.key === "+" || e.key === "=")) {
        e.preventDefault();
        setZoom((z) => Math.min(3, +(z + 0.1).toFixed(1)));
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "-") {
        e.preventDefault();
        setZoom((z) => Math.max(0.2, +(z - 0.1).toFixed(1)));
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "0") {
        e.preventDefault();
        handleZoomToFit();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedPanel, setTool]);

  // ── Save handler ────────────────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    setSaved(true);

    (async () => {
      try {
        if (!projectId) return;

        // Fetch existing panels from API
        const existingResp = await api.projects.panels.list(projectId);
        const existing = existingResp.data || [];
        const existingIds = new Set(existing.map((p: any) => p.id));

        // Create or update each local panel
        for (let i = 0; i < panels.length; i++) {
          const p = panels[i];
          const payload = { index: i, bbox: { x: p.x, y: p.y, width: p.w, height: p.h }, label: p.label };
          if (!p.id || p.id.startsWith('p_') || p.id === '__preview') {
            const created = await api.projects.panels.create(projectId, payload);
            // replace temp id with real id in local state
            if (created.success && created.data) {
              setPanels((prev) => prev.map((pp) => (pp.id === p.id ? { ...pp, id: created.data.id || created.data._id || created.data } : pp)));
            }
          } else {
            await api.projects.panels.update(projectId, p.id, payload);
          }
        }

        // Delete panels removed locally
        for (const ex of existing) {
          if (!panels.find((p) => p.id === ex.id)) {
            await api.projects.panels.remove(projectId, ex.id);
          }
        }

        // Refresh panels from API and update store
        const refreshed = await api.projects.panels.list(projectId);
        if (refreshed.success) {
          setStorePanels(refreshed.data as any);
        }
      } catch (err) {
        console.error('Failed to save panels', err);
      } finally {
        setTimeout(() => setSaved(false), 2000);
      }
    })();
  }, [panels, projectId, setStorePanels]);

  // ── Zoom-to-fit (7.6) ───────────────────────────────────────────────────────
  const handleZoomToFit = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // ── Pan handling (for pan tool) and Draw handling (for draw tool) ─────────
  const isDrawing = useRef(false);
  const drawStart = useRef<{ x: number; y: number } | null>(null);

  const handleStageMouseDown = (e: React.MouseEvent) => {
    // Pan
    if (tool === "pan") {
      isDraggingPane.current = true;
      panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };

      const onMove = (ev: MouseEvent) => {
        if (!isDraggingPane.current) return;
        setPan({
          x: panStart.current.panX + (ev.clientX - panStart.current.x),
          y: panStart.current.panY + (ev.clientY - panStart.current.y),
        });
      };
      const onUp = () => {
        isDraggingPane.current = false;
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
      return;
    }

    // Draw
    if (tool === "draw") {
      if (!stageRef.current) return;
      isDrawing.current = true;
      const rect = stageRef.current.getBoundingClientRect();
      const localX = ((e.clientX - rect.left) / rect.width) * 100;
      const localY = ((e.clientY - rect.top) / rect.height) * 100;
      drawStart.current = { x: localX, y: localY };

      const onMoveDraw = (ev: MouseEvent) => {
        if (!isDrawing.current || !drawStart.current || !stageRef.current) return;
        const rect2 = stageRef.current.getBoundingClientRect();
        const curX = ((ev.clientX - rect2.left) / rect2.width) * 100;
        const curY = ((ev.clientY - rect2.top) / rect2.height) * 100;
        const x = Math.min(drawStart.current.x, curX);
        const y = Math.min(drawStart.current.y, curY);
        const w = Math.abs(curX - drawStart.current.x);
        const h = Math.abs(curY - drawStart.current.y);
        // temporary preview as last panel
        setPanels((prev) => {
          const preview: Panel = { id: '__preview', x, y, w, h, type: 'mask', label: 'Preview' };
          const withoutPreview = prev.filter(p => p.id !== '__preview');
          return [...withoutPreview, preview];
        });
      };

      const onUpDraw = (ev: MouseEvent) => {
        if (!isDrawing.current || !drawStart.current || !stageRef.current) return;
        isDrawing.current = false;
        const rect2 = stageRef.current.getBoundingClientRect();
        const curX = ((ev.clientX - rect2.left) / rect2.width) * 100;
        const curY = ((ev.clientY - rect2.top) / rect2.height) * 100;
        const x = Math.min(drawStart.current.x, curX);
        const y = Math.min(drawStart.current.y, curY);
        const w = Math.max(5, Math.abs(curX - drawStart.current.x));
        const h = Math.max(5, Math.abs(curY - drawStart.current.y));
        const id = `p_${Date.now()}`;
        setPanels((prev) => {
          const cleaned = prev.filter(p => p.id !== '__preview');
          const newPanel: Panel = { id, x: snapToGrid(x), y: snapToGrid(y), w: snapToGrid(w), h: snapToGrid(h), type: 'mask', label: 'New Panel' };
          return [...cleaned, newPanel];
        });

        // Immediately persist created panel to backend and replace temp id with real id
        (async () => {
          try {
            if (!projectId) return;
            const payload = { index: 0, bbox: { x: snapToGrid(x), y: snapToGrid(y), width: snapToGrid(w), height: snapToGrid(h) }, label: 'New Panel' };
            const created = await api.projects.panels.create(projectId, payload);
            if (created && created.success && created.data) {
              const realId = created.data.id || created.data._id || created.data;
              setPanels((prev) => prev.map((p) => (p.id === id ? { ...p, id: realId } : p)));
              // refresh store panels
              const refreshed = await api.projects.panels.list(projectId);
              if (refreshed && refreshed.success) {
                setStorePanels(refreshed.data as any);
              }
            }
          } catch (err) {
            console.error('Failed creating panel on draw', err);
          }
        })();
        drawStart.current = null;
        window.removeEventListener('mousemove', onMoveDraw);
        window.removeEventListener('mouseup', onUpDraw);
      };

      window.addEventListener('mousemove', onMoveDraw);
      window.addEventListener('mouseup', onUpDraw);
      return;
    }

    // Default: no-op
  };

  // ── Panel drag (select tool) ─────────────────────────────────────────────────
  const handlePanelDrag = (
    e: React.MouseEvent,
    panelId: string,
    stageRect: DOMRect,
  ) => {
    if (tool !== "select") return;
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const panel = panels.find((p) => p.id === panelId);
    if (!panel) return;
    const startPx = panel.x;
    const startPy = panel.y;

    const onMove = (ev: MouseEvent) => {
      const dx = ((ev.clientX - startX) / (stageRect.width * zoom)) * 100;
      const dy = ((ev.clientY - startY) / (stageRect.height * zoom)) * 100;
      setPanels((prev) =>
        prev.map((p) =>
          p.id === panelId
            ? {
                ...p,
                x: snapToGrid(Math.max(0, Math.min(100 - p.w, startPx + dx))),
                y: snapToGrid(Math.max(0, Math.min(100 - p.h, startPy + dy))),
              }
            : p,
        ),
      );
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  // ── Panel resize (7.2) ───────────────────────────────────────────────────────
  const handleResize = (
    panelId: string,
    dx: number,
    dy: number,
    dir: ResizeDir,
    stageRect: DOMRect,
  ) => {
    const dxPct = (dx / (stageRect.width * zoom)) * 100;
    const dyPct = (dy / (stageRect.height * zoom)) * 100;

    setPanels((prev) =>
      prev.map((p) => {
        if (p.id !== panelId) return p;
        let { x, y, w, h } = p;

        if (dir === "se") {
          w = snapToGrid(Math.max(10, w + dxPct));
          h = snapToGrid(Math.max(10, h + dyPct));
        } else if (dir === "sw") {
          const newW = snapToGrid(Math.max(10, w - dxPct));
          x = snapToGrid(x + (w - newW));
          w = newW;
          h = snapToGrid(Math.max(10, h + dyPct));
        } else if (dir === "ne") {
          w = snapToGrid(Math.max(10, w + dxPct));
          const newH = snapToGrid(Math.max(10, h - dyPct));
          y = snapToGrid(y + (h - newH));
          h = newH;
        } else if (dir === "nw") {
          const newW = snapToGrid(Math.max(10, w - dxPct));
          const newH = snapToGrid(Math.max(10, h - dyPct));
          x = snapToGrid(x + (w - newW));
          y = snapToGrid(y + (h - newH));
          w = newW;
          h = newH;
        }

        return { ...p, x, y, w, h };
      }),
    );
  };

  const cursorClass =
    tool === "pan"
      ? isDraggingPane.current
        ? "cursor-grabbing"
        : "cursor-grab"
      : tool === "draw"
        ? "cursor-crosshair"
        : "cursor-default";

  return (
    <>
    <div className="h-full flex flex-col bg-background-dark relative overflow-hidden">
      {/* ── Toolbar (7.4) ─────────────────────────────────────────────────── */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 bg-black border-4 border-black shadow-neo z-40">
        <ToolButton
          id="tool-select"
          icon={<MousePointer2 className="w-4 h-4" />}
          label="Select (V)"
          active={tool === "select"}
          onClick={() => setTool("select")}
        />
        <ToolButton
          id="tool-pan"
          icon={<Hand className="w-4 h-4" />}
          label="Pan (H)"
          active={tool === "pan"}
          onClick={() => setTool("pan")}
        />
        <ToolButton
          id="tool-draw"
          icon={<Square className="w-4 h-4" />}
          label="Draw Panel (D)"
          active={tool === "draw"}
          onClick={() => setTool("draw")}
        />

        <div className="w-[2px] h-8 bg-white/20 mx-2" />

        <ToolButton
          id="tool-zoom-fit"
          icon={<Maximize2 className="w-4 h-4" />}
          label="Zoom to Fit (Ctrl+0)"
          active={false}
          onClick={handleZoomToFit}
        />

        {selectedPanel && (
          <>
            <div className="w-[2px] h-8 bg-white/20 mx-2" />
            <ToolButton
              id="tool-delete"
              icon={<Trash2 className="w-4 h-4" />}
              label="Delete (Del)"
              active={false}
              onClick={() => {
                setPanels((prev) => prev.filter((p) => p.id !== selectedPanel));
                selectPanel(null);
              }}
              danger
            />
          </>
        )}

        <div className="w-[2px] h-8 bg-white/20 mx-2" />

        <button
          id="tool-save"
          onClick={handleSave}
          className={cn(
            "flex items-center gap-2 px-3 py-2 border-2 font-mono text-[10px] uppercase font-black transition-all",
            saved
              ? "bg-primary text-black border-primary"
              : "text-white/60 border-white/10 hover:bg-white/10",
          )}
          title="Save (Ctrl+S)"
        >
          <Save className="w-4 h-4" />
          {saved ? "Saved!" : "Save"}
        </button>

        <button
          id="tool-detect"
          onClick={async () => {
            if (!projectId) return;
            setDetecting(true);
            try {
              const resp = await api.projects.panels.detect(projectId, {});
              if (resp && resp.success && resp.data) {
                const panelsFromApi = resp.data.panels || resp.data || [];
                const mapped = panelsFromApi.map((p: any, idx: number) => {
                  const b = p.bbox || p;
                  return {
                    id: `__det_${idx}`,
                    x: (b.x || 0) * 100,
                    y: (b.y || 0) * 100,
                    w: (b.width || b.w || 0) * 100,
                    h: (b.height || b.h || 0) * 100,
                    type: 'mask',
                    label: p.label || 'Detected',
                  } as Panel;
                });

                // Add preview panels locally but do not persist yet
                setPanels((prev) => {
                  const cleaned = prev.filter((pp) => typeof pp.id === 'string' && !pp.id.startsWith('__det'));
                  return [...cleaned, ...mapped];
                });
                setDetectedPreview(mapped);
              }
            } catch (err) {
              console.error('Detect failed', err);
            } finally {
              setDetecting(false);
            }
          }}
          className={cn(
            "flex items-center gap-2 px-3 py-2 border-2 font-mono text-[10px] uppercase font-black transition-all ml-2",
            detecting
              ? "bg-primary text-black border-primary"
              : "text-white/60 border-white/10 hover:bg-white/10",
          )}
          title="Detect Panels"
        >
          <Search className="w-4 h-4" />
          {detecting ? "Detecting..." : "Detect"}
        </button>
      </div>

      {/* Shortcut hint */}
      <div className="absolute top-6 right-6 z-40 font-mono text-[9px] text-white/20 text-right space-y-0.5 uppercase tracking-widest select-none">
        <p>V · Select &nbsp; H · Pan &nbsp; D · Draw</p>
        <p>Del · Remove &nbsp; Ctrl+S · Save &nbsp; Ctrl+0 · Fit</p>
      </div>

      {/* ── Canvas Stage ─────────────────────────────────────────────────── */}
      <div
        ref={stageRef}
        className={cn("flex-1 relative overflow-hidden flex items-center justify-center p-20", cursorClass)}
        onMouseDown={handleStageMouseDown}
        onClick={() => tool === "select" && selectPanel(null)}
      >
        <div
          className="relative transition-none"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center center",
          }}
        >
          {/* Stage */}
          <div className="relative aspect-[9/16] h-[60vh] max-h-[750px] min-h-[400px] bg-black border-4 border-white shadow-neo overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-50"
              style={{ backgroundImage: "url('/images/hero.png')" }}
            />

            {/* Grid overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-10"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
                backgroundSize: "5% 5%",
              }}
            />

            {/* Panels */}
            {panels.map((p) => {
              const isSelected = selectedPanel === p.id;
              const panelColor = p.type === "mask" ? "bg-secondary" : "bg-accent";
              const borderColor = p.type === "mask" ? "border-secondary" : "border-accent";

              return (
                <div
                  key={p.id}
                  onClick={(e) => {
                    if (tool === "select") {
                      e.stopPropagation();
                      selectPanel(p.id);
                    }
                  }}
                  onMouseDown={(e) => {
                    if (!stageRef.current) return;
                    const rect = stageRef.current.getBoundingClientRect();
                    handlePanelDrag(e, p.id, rect);
                  }}
                  className={cn(
                    "absolute border-2 transition-colors",
                    p.type === "mask" ? "border-secondary/60 bg-secondary/10" : "border-accent/60 bg-accent/10",
                    isSelected && "border-4",
                    isSelected && borderColor,
                    tool === "select" && "cursor-move",
                  )}
                  style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.w}%`, height: `${p.h}%` }}
                >
                  {/* Label */}
                  <div className={cn("absolute -top-7 left-0 px-2 py-0.5 text-[10px] font-black uppercase italic shadow-[2px_2px_0px_#000] border-2 border-black", panelColor, "text-black")}>
                    {p.label}
                  </div>

                  {/* Resize handles (7.2) — shown when selected */}
                  {isSelected && tool === "select" && (
                    <>
                      {(["nw", "ne", "sw", "se"] as ResizeDir[]).map((dir) => (
                        <ResizeHandle
                          key={dir}
                          dir={dir}
                          color={panelColor}
                          onResize={(dx, dy, d) => {
                            if (!stageRef.current) return;
                            const rect = stageRef.current.getBoundingClientRect();
                            handleResize(p.id, dx, dy, d, rect);
                          }}
                        />
                      ))}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Zoom controls (bottom-right) ───────────────────────────────── */}
      <div className="absolute bottom-6 right-6 flex items-center gap-1 bg-black border-4 border-black p-1 shadow-hard-sm z-40">
        <button
          id="zoom-out"
          onClick={() => setZoom((z) => Math.max(0.2, +(z - 0.1).toFixed(1)))}
          className="p-2 text-white/40 hover:text-primary transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomToFit}
          className="w-14 text-center font-mono text-[10px] text-white font-black hover:text-primary transition-colors"
          title="Zoom to Fit"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          id="zoom-in"
          onClick={() => setZoom((z) => Math.min(3, +(z + 0.1).toFixed(1)))}
          className="p-2 text-white/40 hover:text-primary transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Active tool indicator (bottom-left) */}
      <div className="absolute bottom-6 left-6 z-40 font-mono text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        TOOL: {tool.toUpperCase()}
      </div>
    </div>

      {/* Detect Preview Modal */}
      {detectedPreview && detectedPreview.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-[900px] max-w-[95%] bg-background p-6 rounded shadow-2xl border-2 border-white/10">
            <h3 className="text-white font-black uppercase mb-4">Detected Panels Preview</h3>
            <div className="grid grid-cols-3 gap-3 max-h-[60vh] overflow-auto mb-4">
              {detectedPreview.map((p, idx) => (
                <div key={p.id} className="bg-black/30 p-2 border border-white/5">
                  <div className="text-white text-sm font-mono mb-2">{p.label} #{idx + 1}</div>
                  <div className="w-full h-28 bg-cover bg-center" style={{ backgroundImage: "url('/images/hero.png')" }} />
                  <div className="text-white/60 text-xs mt-1">x:{(p.x).toFixed(1)} y:{(p.y).toFixed(1)} w:{(p.w).toFixed(1)} h:{(p.h).toFixed(1)}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={async () => {
                  // Discard previews
                  setPanels((prev) => prev.filter((pp) => !(typeof pp.id === 'string' && pp.id.startsWith('__det'))));
                  setDetectedPreview(null);
                }}
                className="px-4 py-2 border rounded text-white/80 hover:bg-white/5"
              >
                Discard
              </button>
              <button
                onClick={async () => {
                  if (!projectId) return;
                  // Persist detectedPreview panels
                  for (let i = 0; i < detectedPreview.length; i++) {
                    const p = detectedPreview[i];
                    try {
                      const payload = { index: i, bbox: { x: +(p.x/100).toFixed(6), y: +(p.y/100).toFixed(6), width: +(p.w/100).toFixed(6), height: +(p.h/100).toFixed(6) }, label: p.label };
                      const created = await api.projects.panels.create(projectId, payload);
                      if (created && created.success && created.data) {
                        const realId = created.data.id || created.data._id || created.data;
                        setPanels((prev) => prev.map((pp) => (pp.id === p.id ? { ...pp, id: realId } : pp)));
                      }
                    } catch (err) {
                      console.error('Failed saving detected panel', err);
                    }
                  }
                  // Refresh panels from API
                  const refreshed = await api.projects.panels.list(projectId);
                  if (refreshed && refreshed.success) {
                    setStorePanels(refreshed.data as any);
                  }
                  setDetectedPreview(null);
                }}
                className="px-4 py-2 bg-primary text-black font-black rounded"
              >
                Save All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ToolButton({
  id,
  icon,
  label,
  active,
  onClick,
  danger,
}: {
  id: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      id={id}
      onClick={onClick}
      title={label}
      className={cn(
        "p-3 transition-all border-2",
        active
          ? "bg-primary text-black border-black shadow-hard-xs"
          : danger
            ? "text-red-400 border-transparent hover:bg-red-500/10"
            : "text-white/40 border-transparent hover:bg-white/10 hover:text-white",
      )}
    >
      {icon}
    </button>
  );
}
