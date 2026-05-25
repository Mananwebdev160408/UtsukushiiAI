"use client";

import { useState } from "react";
import { BookOpen, Tag, Link2, User, Hash } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const GENRES = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy",
  "Horror", "Isekai", "Mecha", "Romance", "Sci-Fi",
  "Seinen", "Shonen", "Shojo", "Slice of Life", "Supernatural",
];

export interface MangaMetadata {
  author: string;
  genre: string;
  series: string;
  tags: string;
}

export function MetadataInput({
  value,
  onChange,
}: {
  value: MangaMetadata;
  onChange: (data: MangaMetadata) => void;
}) {
  const [customTag, setCustomTag] = useState("");

  const update = (key: keyof MangaMetadata, val: string) => {
    onChange({ ...value, [key]: val });
  };

  const addTag = () => {
    if (!customTag.trim()) return;
    const existing = value.tags ? value.tags.split(",").map((t) => t.trim()) : [];
    if (!existing.includes(customTag.trim())) {
      update("tags", [...existing, customTag.trim()].join(", "));
    }
    setCustomTag("");
  };

  const removeTag = (tag: string) => {
    const remaining = value.tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t && t !== tag)
      .join(", ");
    update("tags", remaining);
  };

  const tags = value.tags
    ? value.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <div className="space-y-8 bg-black/40 border-4 border-white/10 p-8">
      <div className="flex items-center gap-3 border-b-2 border-white/10 pb-4">
        <BookOpen className="w-5 h-5 text-primary" />
        <h3 className="font-display font-black text-xl uppercase italic text-white">
          Source Metadata
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Author */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 font-mono text-[10px] font-black uppercase text-white/40 tracking-[0.4em]">
            <User className="w-3 h-3" /> Author
          </label>
          <input
            id="metadata-author"
            type="text"
            placeholder="e.g. Eiichiro Oda"
            value={value.author}
            onChange={(e) => update("author", e.target.value)}
            className="w-full bg-black border-4 border-white/10 px-4 py-3 text-white font-mono text-sm outline-none focus:border-primary focus:bg-primary/5 transition-all placeholder-white/20 uppercase"
          />
        </div>

        {/* Series */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 font-mono text-[10px] font-black uppercase text-white/40 tracking-[0.4em]">
            <Link2 className="w-3 h-3" /> Series
          </label>
          <input
            id="metadata-series"
            type="text"
            placeholder="e.g. One Piece"
            value={value.series}
            onChange={(e) => update("series", e.target.value)}
            className="w-full bg-black border-4 border-white/10 px-4 py-3 text-white font-mono text-sm outline-none focus:border-primary focus:bg-primary/5 transition-all placeholder-white/20 uppercase"
          />
        </div>
      </div>

      {/* Genre */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 font-mono text-[10px] font-black uppercase text-white/40 tracking-[0.4em]">
          <Hash className="w-3 h-3" /> Genre
        </label>
        <div className="flex flex-wrap gap-2">
          {GENRES.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => update("genre", g === value.genre ? "" : g)}
              className={cn(
                "px-3 py-1.5 border-2 font-mono text-[10px] font-black uppercase transition-all",
                value.genre === g
                  ? "bg-primary text-black border-black shadow-[2px_2px_0_#000]"
                  : "bg-white/5 text-white/60 border-white/10 hover:border-primary hover:text-primary",
              )}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 font-mono text-[10px] font-black uppercase text-white/40 tracking-[0.4em]">
          <Tag className="w-3 h-3" /> Tags
        </label>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 bg-white/10 border-2 border-white/20 px-3 py-1 font-mono text-[10px] text-white uppercase"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-white/40 hover:text-red-400 transition-colors ml-1 font-black"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-3">
          <input
            id="metadata-tag-input"
            type="text"
            placeholder="Add tag..."
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
            className="flex-1 bg-black border-4 border-white/10 px-4 py-3 text-white font-mono text-sm outline-none focus:border-primary focus:bg-primary/5 transition-all placeholder-white/20"
          />
          <button
            type="button"
            onClick={addTag}
            className="px-6 border-4 border-black bg-primary text-black font-black uppercase text-xs shadow-hard-xs hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
