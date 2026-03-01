"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  SortAsc,
  LayoutGrid,
  List as ListIcon,
  Loader2,
  Edit3,
  Download,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { ProjectCard } from "@/components/ui/Card/ProjectCard";
import { cn } from "@/lib/utils/cn";
import { api } from "@/lib/api/client";

interface Project {
  id: string;
  title: string;
  status: "idle" | "rendering" | "completed" | "error" | "draft" | "processing";
  lastUpdated: string;
  duration?: string;
  image?: string;
  tags?: string[];
  scenes?: number;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const res = await api.projects.list();
        if (res.success) {
          // Add some mock data properties to match the new design
          const enhancedData = (res.data as any[]).map((p, idx) => ({
            ...p,
            tags:
              idx % 2 === 0
                ? ["#Cyberpunk", "#Action"]
                : ["#SliceOfLife", "#Chill"],
            scenes: Math.floor(Math.random() * 30) + 5,
            status: idx === 0 ? "processing" : p.status,
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

  const activeProject = projects.find(
    (p) => p.status === "processing" || p.status === "rendering",
  );

  return (
    <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 font-body">
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
              className="block w-full pl-12 pr-4 py-3 border-4 border-black bg-surface-dark text-white placeholder-white/20 focus:outline-none focus:shadow-neo focus:ring-0 font-mono text-sm uppercase transition-all"
              placeholder="SEARCH PROJECTS..."
              type="text"
            />
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <button className="flex items-center gap-2 border-4 border-black bg-white text-black px-4 py-2 font-mono font-bold text-sm shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
              <Filter className="w-4 h-4" />
              <span>FILTER</span>
            </button>
            <button className="flex items-center gap-2 border-4 border-black bg-white text-black px-4 py-2 font-mono font-bold text-sm shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
              <SortAsc className="w-4 h-4" />
              <span>SORT: DATE</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-4 mb-12">
        {["all", "ongoing", "completed", "drafts"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "border-4 border-black px-8 py-3 font-mono font-bold uppercase transition-all shadow-hard-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]",
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

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {loading
          ? [...Array(6)].map((_, i) => (
              <div
                key={i}
                className="aspect-video bg-surface-dark border-4 border-black animate-pulse shadow-hard"
              />
            ))
          : projects
              .filter(
                (p) =>
                  filter === "all" ||
                  (filter === "ongoing" &&
                    (p.status === "processing" ||
                      p.status === "rendering" ||
                      p.status === "idle")) ||
                  (filter === "completed" && p.status === "completed") ||
                  p.status === filter,
              )
              .map((p) => {
                const isCompleted = p.status === "completed";
                const projectLink = isCompleted
                  ? `/projects/${p.id}/render`
                  : `/projects/${p.id}`;

                return (
                  <div
                    key={p.id}
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
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
      </div>

      {/* Floating Action Button */}
      <Link
        href="/projects/new"
        className="fixed bottom-12 right-12 w-20 h-20 bg-primary rounded-full border-6 border-black flex items-center justify-center shadow-neo hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all z-50 group scale-100 hover:scale-110"
      >
        <Plus className="w-10 h-10 text-black group-hover:rotate-90 transition-transform stroke-[4px]" />
      </Link>
    </main>
  );
}
