"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  Plus,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Loader2,
  Edit3,
  Download,
  Trash2,
  Copy,
  MoreHorizontal,
  X,
  Check,
  ChevronDown,
  Film,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { api } from "@/lib/api/client";
import type { Project as BaseProject } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

type Project = BaseProject & {
  tags?: string[];
  scenes?: number;
};

type SortField = "date" | "name" | "status";
type SortDir = "asc" | "desc";

// ─── New Project Modal ────────────────────────────────────────────────────────

const ASPECT_RATIOS = ["9:16", "16:9", "1:1", "4:5", "3:4"];

function NewProjectModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (project: Project) => void;
}) {
  const [name, setName] = useState("UNTITLED_PROJECT");
  const [description, setDescription] = useState("");
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName("UNTITLED_PROJECT");
      setDescription("");
      setAspectRatio("9:16");
      setError("");
      setTimeout(() => inputRef.current?.select(), 100);
    }
  }, [open]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.projects.create({
        title: name.trim(),
        description: description.trim() || undefined,
        aspectRatio,
      });
      if (res.success && res.data) {
        const enhanced: Project = {
          ...res.data,
          tags: [`#${aspectRatio.replace(":", "x")}`, "#Draft"],
          scenes: 0,
        };
        onCreated(enhanced);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none"
          >
            <div className="bg-surface-dark border-6 border-black shadow-neo w-full max-w-2xl pointer-events-auto relative overflow-hidden">
              {/* Top accent bar */}
              <div className="absolute top-0 left-0 w-full h-2 bg-primary" />

              <div className="p-8 md:p-12 pt-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-10">
                  <div>
                    <h2 className="font-display font-black text-4xl uppercase italic tracking-tighter text-white">
                      New Project
                    </h2>
                    <p className="font-mono text-xs text-white/30 uppercase tracking-[0.3em] mt-2">
                      Initialize a new mission sequence
                    </p>
                  </div>
                  <button
                    id="new-project-close"
                    onClick={onClose}
                    className="text-white/40 hover:text-white transition-colors p-1"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleCreate} className="space-y-8">
                  {/* Project Name */}
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] font-black uppercase text-white/40 tracking-[0.4em] block">
                      Mission_Identifier
                    </label>
                    <input
                      ref={inputRef}
                      id="new-project-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value.toUpperCase())}
                      placeholder="CYBERPUNK_MISSION_01"
                      required
                      className="w-full bg-black border-4 border-white/10 px-5 py-4 text-white font-display font-black text-xl uppercase italic outline-none focus:border-primary focus:bg-primary/5 transition-all"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] font-black uppercase text-white/40 tracking-[0.4em] block">
                      Mission_Brief (optional)
                    </label>
                    <textarea
                      id="new-project-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter mission description..."
                      rows={3}
                      className="w-full bg-black border-4 border-white/10 px-5 py-4 text-white font-mono text-sm outline-none focus:border-primary focus:bg-primary/5 transition-all resize-none"
                    />
                  </div>

                  {/* Aspect Ratio */}
                  <div className="space-y-3">
                    <label className="font-mono text-[10px] font-black uppercase text-white/40 tracking-[0.4em] block">
                      Aspect_Ratio
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {ASPECT_RATIOS.map((ratio) => (
                        <button
                          key={ratio}
                          type="button"
                          id={`aspect-ratio-${ratio.replace(":", "x")}`}
                          onClick={() => setAspectRatio(ratio)}
                          className={cn(
                            "border-4 px-5 py-3 font-mono font-black text-sm uppercase transition-all shadow-hard-xs hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5",
                            aspectRatio === ratio
                              ? "bg-primary text-black border-black"
                              : "bg-black text-white border-white/10 hover:border-white/40",
                          )}
                        >
                          {ratio}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <p className="text-red-400 font-mono text-xs uppercase tracking-widest border-2 border-red-400/20 bg-red-400/5 px-4 py-3">
                      ERROR: {error}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 py-4 bg-black text-white border-2 border-white/10 font-mono font-bold uppercase text-xs tracking-widest hover:border-white/40 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      id="new-project-submit"
                      type="submit"
                      disabled={loading || !name.trim()}
                      className={cn(
                        "flex-[2] py-4 bg-primary text-black font-display font-black text-xl uppercase italic border-4 border-black shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-3",
                        (loading || !name.trim()) && "opacity-50 cursor-not-allowed",
                      )}
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Plus className="w-5 h-5" />
                      )}
                      {loading ? "Initializing..." : "Create Project"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Rename Modal ──────────────────────────────────────────────────────────────

function RenameModal({
  project,
  onClose,
  onRenamed,
}: {
  project: Project | null;
  onClose: () => void;
  onRenamed: (id: string, newName: string) => void;
}) {
  const [name, setName] = useState(project?.title || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (project) setName(project.title);
  }, [project]);

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !name.trim()) return;
    setLoading(true);
    try {
      await api.projects.update(project.id, { title: name.trim() });
      onRenamed(project.id, name.trim());
      onClose();
    } catch (err) {
      console.error("RENAME_ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {project && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none"
          >
            <div className="bg-surface-dark border-6 border-black shadow-hard w-full max-w-md pointer-events-auto p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-secondary" />
              <h3 className="font-display font-black text-2xl uppercase italic text-white mb-6">
                Rename Project
              </h3>
              <form onSubmit={handleRename} className="space-y-6">
                <input
                  id="rename-project-input"
                  autoFocus
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black border-4 border-white/10 px-5 py-4 text-white font-bold uppercase outline-none focus:border-primary transition-all"
                />
                <div className="flex gap-4">
                  <button type="button" onClick={onClose} className="flex-1 py-3 border-2 border-white/10 text-white font-mono uppercase text-xs hover:border-white/30 transition-all">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} className="flex-[2] py-3 bg-secondary text-black font-display font-black uppercase italic border-4 border-black shadow-hard-xs hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Save
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Project Card Actions Menu ────────────────────────────────────────────────

function ProjectCardMenu({
  project,
  onRename,
  onDuplicate,
  onDelete,
}: {
  project: Project;
  onRename: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        id={`project-menu-${project.id}`}
        onClick={(e) => { e.preventDefault(); setOpen(!open); }}
        className="flex items-center justify-center w-10 h-10 bg-white border-2 border-black hover:bg-black hover:text-white transition-all shadow-[3px_3px_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none"
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className="absolute bottom-14 right-0 z-50 w-48 bg-white border-4 border-black shadow-neo overflow-hidden"
          >
            <button
              onClick={() => { onRename(); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 font-mono font-bold text-xs uppercase hover:bg-primary transition-colors text-left border-b-2 border-black"
            >
              <Edit3 className="w-4 h-4" /> Rename
            </button>
            <button
              onClick={() => { onDuplicate(); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 font-mono font-bold text-xs uppercase hover:bg-primary transition-colors text-left border-b-2 border-black"
            >
              <Copy className="w-4 h-4" /> Duplicate
            </button>
            <button
              onClick={() => { onDelete(); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 font-mono font-bold text-xs uppercase hover:bg-red-500 hover:text-white transition-colors text-left text-red-600"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [renameTarget, setRenameTarget] = useState<Project | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const res = await api.projects.list();
        if (res.success) {
          const enhancedData = (res.data as Project[]).map((p) => ({
            ...p,
            tags: [
              p.aspectRatio ? `#${p.aspectRatio.replace(":", "x")}` : "#Manga",
              p.status === "completed" ? "#Ready" : "#InProgress",
            ],
            scenes: p.mangaPages.length,
          }));
          setProjects(enhancedData);
        }
      } catch (err) {
        console.error("FETCH_PROJECTS_ERROR:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Close sort menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target as Node)) {
        setShowSortMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Handlers
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    setDeletingId(id);
    // Optimistic update
    setProjects((prev) => prev.filter((p) => p.id !== id));
    try {
      await api.projects.delete(id);
    } catch {
      // Revert if failed — refetch
      const res = await api.projects.list();
      if (res.success) setProjects(res.data as Project[]);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDuplicate = async (project: Project) => {
    try {
      const res = await api.projects.create({
        title: `${project.title}_COPY`,
        description: project.description,
        aspectRatio: project.aspectRatio,
      });
      if (res.success && res.data) {
        const dup: Project = {
          ...res.data,
          tags: project.tags,
          scenes: 0,
        };
        setProjects((prev) => [dup, ...prev]);
      }
    } catch (err) {
      console.error("DUPLICATE_ERROR:", err);
    }
  };

  const handleRenamed = (id: string, newTitle: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, title: newTitle } : p)),
    );
  };

  const handleProjectCreated = (project: Project) => {
    setProjects((prev) => [project, ...prev]);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
    setShowSortMenu(false);
  };

  // Filtered + sorted projects
  const displayedProjects = useMemo(() => {
    let result = projects.filter((p) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "ongoing" &&
          (p.status === "processing" || p.status === "rendering" || p.status === "idle")) ||
        (filter === "completed" && p.status === "completed") ||
        (filter === "drafts" && p.status === "idle");

      const matchesSearch =
        !searchQuery ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesFilter && matchesSearch;
    });

    result = result.sort((a, b) => {
      let valA: string | number = "";
      let valB: string | number = "";
      if (sortField === "date") {
        valA = new Date(a.lastUpdated || a.createdAt || "").getTime();
        valB = new Date(b.lastUpdated || b.createdAt || "").getTime();
      } else if (sortField === "name") {
        valA = a.title.toLowerCase();
        valB = b.title.toLowerCase();
      } else if (sortField === "status") {
        valA = a.status;
        valB = b.status;
      }
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [projects, filter, searchQuery, sortField, sortDir]);

  const activeProject = projects.find(
    (p) => p.status === "processing" || p.status === "rendering",
  );

  return (
    <main className="max-w-360 mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 font-body">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b-6 border-black dark:border-white pb-8">
        <div>
          <h2 className="font-display font-black text-6xl md:text-8xl uppercase tracking-tighter leading-none mb-4 italic">
            Project
            <br />
            Hub
          </h2>
          <p className="font-mono text-sm md:text-base font-bold bg-primary text-black inline-block px-3 py-1 border-2 border-black shadow-[4px_4px_0px_#000]">
            MANAGE YOUR MANGA MUSIC VIDEOS
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
          {/* Search */}
          <div className="relative w-full md:w-80 group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/20 group-focus-within:text-primary transition-colors">
              <Search className="w-5 h-5" />
            </div>
            <input
              id="projects-search"
              className="block w-full pl-12 pr-4 py-3 border-4 border-black bg-surface-dark text-white placeholder-white/20 focus:outline-none focus:shadow-neo focus:ring-0 font-mono text-sm uppercase transition-all"
              placeholder="SEARCH PROJECTS..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            {/* Sort dropdown */}
            <div className="relative" ref={sortMenuRef}>
              <button
                id="projects-sort-btn"
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center gap-2 border-4 border-black bg-white text-black px-4 py-2 font-mono font-bold text-sm shadow-hard-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
              >
                {sortDir === "asc" ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                <span>SORT: {sortField.toUpperCase()}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              <AnimatePresence>
                {showSortMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute top-full mt-2 left-0 z-50 bg-white border-4 border-black shadow-hard w-40 overflow-hidden"
                  >
                    {(["date", "name", "status"] as SortField[]).map((field) => (
                      <button
                        key={field}
                        onClick={() => toggleSort(field)}
                        className={cn(
                          "w-full flex items-center justify-between px-4 py-3 font-mono font-bold text-xs uppercase border-b-2 border-black last:border-0 transition-colors",
                          sortField === field ? "bg-primary text-black" : "hover:bg-black hover:text-white",
                        )}
                      >
                        {field}
                        {sortField === field && (sortDir === "asc" ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />)}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* New Project button */}
            <button
              id="new-project-btn"
              onClick={() => setShowNewModal(true)}
              className="flex items-center gap-2 border-4 border-black bg-primary text-black px-6 py-2 font-mono font-bold text-sm shadow-hard-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
            >
              <Plus className="w-5 h-5 stroke-[3px]" />
              <span>NEW</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-4 mb-12">
        {["all", "ongoing", "completed", "drafts"].map((f) => (
          <button
            key={f}
            id={`filter-${f}`}
            onClick={() => setFilter(f)}
            className={cn(
              "border-4 border-black px-8 py-3 font-mono font-bold uppercase transition-all shadow-hard-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5",
              filter === f ? "bg-primary text-black" : "bg-white text-black",
            )}
          >
            {f === "all"
              ? "All Systems"
              : f === "ongoing"
                ? "Active Ongoing"
                : f}
          </button>
        ))}
      </div>

      {/* Active Processing Section */}
      {activeProject && (
        <div className="mb-16 bg-surface-dark border-6 border-black p-8 shadow-neo-orange relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-3 bg-secondary"></div>
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="w-full md:w-1/3 aspect-video border-4 border-black bg-gray-900 relative overflow-hidden">
              {activeProject.image ? (
                <img
                  src={activeProject.image}
                  alt={activeProject.title}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-stripes opacity-20">
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                </div>
              )}
              <div className="absolute inset-0 bg-primary/10 mix-blend-overlay"></div>
            </div>
            <div className="flex-1 w-full space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-display font-black text-3xl uppercase italic text-white flex items-center gap-4">
                    {activeProject.title}
                    <span className="bg-secondary text-white border-2 border-black px-3 py-1 font-mono text-xs font-bold uppercase shadow-[3px_3px_0px_#000] rotate-2">
                      {activeProject.status}
                    </span>
                  </h3>
                  <p className="font-mono text-sm mt-2 text-white/40 uppercase tracking-widest">
                    Estimated time: 5 mins remaining // SYSTEM_BUSY
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative w-full h-10 border-4 border-black bg-white overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-primary border-r-4 border-black animate-pulse"
                    style={{ width: "75%" }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center font-mono font-black text-sm z-10 mix-blend-difference text-white uppercase tracking-[0.2em]">
                    75% PROCESSED
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && displayedProjects.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-32 gap-8 text-center"
        >
          <div className="w-24 h-24 border-6 border-black bg-white/5 flex items-center justify-center shadow-hard">
            <Film className="w-12 h-12 text-white/20" />
          </div>
          <div>
            <h3 className="font-display font-black text-3xl uppercase italic text-white mb-3">
              {searchQuery ? "No Results Found" : "No Projects Yet"}
            </h3>
            <p className="font-mono text-sm text-white/30 uppercase tracking-widest">
              {searchQuery
                ? `Nothing matches "${searchQuery}"`
                : "Initialize your first mission to get started."}
            </p>
          </div>
          {!searchQuery && (
            <button
              onClick={() => setShowNewModal(true)}
              className="flex items-center gap-2 border-4 border-black bg-primary text-black px-8 py-4 font-display font-black text-xl uppercase italic shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              <Plus className="w-6 h-6" />
              Create First Project
            </button>
          )}
        </motion.div>
      )}

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {loading
          ? [...Array(6)].map((_, i) => (
              <div
                key={i}
                className="aspect-video bg-surface-dark border-4 border-black animate-pulse shadow-hard"
              />
            ))
          : displayedProjects.map((p) => {
              const isCompleted = p.status === "completed";
              const projectLink = isCompleted
                ? `/projects/${p.id}/render`
                : `/projects/${p.id}`;

              return (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: deletingId === p.id ? 0.4 : 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group bg-surface-dark border-6 border-black shadow-hard hover:-translate-y-2 hover:translate-x-2 hover:shadow-neo transition-all duration-300 flex flex-col h-full relative overflow-hidden"
                >
                  <Link
                    href={projectLink}
                    className="relative w-full aspect-video border-b-6 border-black overflow-hidden bg-gray-900 block"
                  >
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.title}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-stripes opacity-10">
                        <Edit3 className="w-12 h-12 text-white/5" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "absolute top-4 right-4 border-2 border-black px-3 py-1 font-mono text-xs font-bold uppercase shadow-[4px_4px_0_#000] translate-x-1 -translate-y-1",
                        isCompleted
                          ? "bg-primary text-black"
                          : "bg-white text-black",
                      )}
                    >
                      {isCompleted ? "READY" : p.status.toUpperCase()}
                    </div>
                  </Link>

                  <div className="p-8 flex flex-col flex-1 gap-6">
                    <Link href={projectLink}>
                      <h3 className="font-display font-black text-2xl mb-3 leading-tight uppercase italic group-hover:text-primary transition-colors tracking-tighter">
                        {p.title}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {p.tags?.map((t) => (
                          <span
                            key={t}
                            className="font-mono text-[10px] font-bold border-2 border-black px-2 py-0.5 bg-white text-black shadow-[2px_2px_0_#000]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </Link>

                    <div className="mt-auto flex items-center justify-between border-t-4 border-black pt-6">
                      <span className="font-mono text-xs font-bold text-white/40 uppercase tracking-widest">
                        {p.scenes || 0} Scenes
                      </span>
                      <div className="flex gap-3">
                        {isCompleted && (
                          <button
                            className="flex items-center justify-center w-10 h-10 bg-white border-2 border-black hover:bg-black hover:text-white transition-all shadow-[3px_3px_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none"
                            title="Download"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                        )}
                        <Link
                          href={`/projects/${p.id}`}
                          className="flex items-center justify-center w-10 h-10 bg-primary border-2 border-black hover:bg-black hover:text-white transition-all shadow-[3px_3px_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none"
                          title="Open Editor"
                        >
                          <Edit3 className="w-5 h-5" />
                        </Link>
                        {/* More actions */}
                        <ProjectCardMenu
                          project={p}
                          onRename={() => setRenameTarget(p)}
                          onDuplicate={() => handleDuplicate(p)}
                          onDelete={() => handleDelete(p.id)}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
      </div>

      {/* Floating Action Button */}
      <button
        id="fab-new-project"
        onClick={() => setShowNewModal(true)}
        className="fixed bottom-12 right-12 w-20 h-20 bg-primary rounded-full border-6 border-black flex items-center justify-center shadow-neo hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all z-50 group scale-100 hover:scale-110"
        title="New Project"
      >
        <Plus className="w-10 h-10 text-black group-hover:rotate-90 transition-transform stroke-[4px]" />
      </button>

      {/* Modals */}
      <NewProjectModal
        open={showNewModal}
        onClose={() => setShowNewModal(false)}
        onCreated={handleProjectCreated}
      />
      <RenameModal
        project={renameTarget}
        onClose={() => setRenameTarget(null)}
        onRenamed={handleRenamed}
      />
    </main>
  );
}
