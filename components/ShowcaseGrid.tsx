"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Search, Sparkles, SlidersHorizontal, Copy } from "lucide-react";
import { Prompt } from "../types";

interface ShowcaseGridProps {
  prompts: Prompt[];
  onSelectPrompt: (prompt: Prompt) => void;
  onTriggerLogin: () => void;
  isLoading?: boolean;
}

const CATEGORIES = [
  "All Collection",
  "Love & Couples",
  "Long Distance",
  "Aesthetic Art",
  "4K Posters",
  "Customizable",
];

const SkeletonCard = () => (
  <div className="group bg-white rounded-3xl border border-slate-200/50 overflow-hidden flex flex-col shadow-sm">
    <div className="relative aspect-[768/1376] bg-slate-100 animate-pulse border-b border-slate-100 flex items-center justify-center">
      <div className="w-10 h-10 rounded-full bg-slate-250/20" />
    </div>
    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
      <div>
        <div className="flex gap-1.5 mb-3">
          <div className="w-12 h-3.5 bg-slate-100 animate-pulse rounded-md" />
          <div className="w-16 h-3.5 bg-slate-100 animate-pulse rounded-md" />
        </div>
        <div className="w-3/4 h-5 bg-slate-200/50 animate-pulse rounded-md mb-2" />
        <div className="w-full h-3 bg-slate-100 animate-pulse rounded-md mb-1.5" />
        <div className="w-5/6 h-3 bg-slate-100 animate-pulse rounded-md" />
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="w-12 h-4 bg-slate-100 animate-pulse rounded-md" />
        <div className="w-20 h-8 bg-slate-200/60 animate-pulse rounded-xl" />
      </div>
    </div>
  </div>
);

export default function ShowcaseGrid({ prompts, onSelectPrompt, onTriggerLogin, isLoading = false }: ShowcaseGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Collection");

  // Debouncing search query updates
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Filtering prompts based on search keyword and category
  const filteredPrompts = useMemo(() => {
    return prompts.filter((prompt) => {
      // 1. Category filter
      if (selectedCategory !== "All Collection") {
        if (selectedCategory === "Customizable") {
          // All prompts with templates are dynamically customizable via the AI Prompt Consultant
          if (!prompt.template) return false;
        } else if (prompt.category !== selectedCategory) {
          return false;
        }
      }

      // 2. Search query filter
      if (!debouncedSearchQuery.trim()) return true;

      const query = debouncedSearchQuery.toLowerCase();
      const matchTitle = (prompt.title || "").toLowerCase().includes(query);
      const matchCategory = (prompt.category || "").toLowerCase().includes(query);
      const matchDesc = (prompt.shortDesc || "").toLowerCase().includes(query) || (prompt.longDesc || "").toLowerCase().includes(query);
      const matchTags = (prompt.tags || []).some((tag) => (tag || "").toLowerCase().includes(query));
      const matchTemplate = (prompt.template || "").toLowerCase().includes(query);
      const matchVariables = (prompt.variables || []).some((v) => (v.name || "").toLowerCase().includes(query) || (v.label || "").toLowerCase().includes(query));
      const matchKey = (prompt.promptKey || "").toLowerCase().includes(query);

      return matchTitle || matchCategory || matchDesc || matchTags || matchTemplate || matchVariables || matchKey;
    });
  }, [prompts, debouncedSearchQuery, selectedCategory]);

  return (
    <section className="flex-1 w-full max-w-7xl mx-auto px-6 py-8">
      {/* Header Section */}
      <div className="mb-6 text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center sm:justify-start gap-2">
          Explore Prompt World
          <Sparkles className="w-5 h-5 text-orange-500 animate-pulse" />
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Premium hand-crafted prompts for visual art generators.
        </p>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 -mx-6 px-6 scrollbar-none">
        <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0 mr-1 hidden sm:block" />
        <div className="flex gap-2">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-all duration-200 border ${
                selectedCategory === category
                  ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                  : "bg-white border-slate-200/60 text-slate-600 hover:border-slate-300 hover:text-slate-900"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Search bar */}
      <div className="sticky top-[114px] sm:top-[78px] z-25 bg-slate-50/95 backdrop-blur-md py-4 mb-10 -mx-6 px-6 border-b border-slate-200/10">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search titles, tags, custom variables..."
            value={searchQuery}
            onChange={(e) => {
              const val = e.target.value;
              setSearchQuery(val);
              if (val.trim() === "mkloveart143") {
                onTriggerLogin();
                setSearchQuery("");
              }
            }}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200/80 rounded-2xl text-slate-800 text-sm font-medium placeholder-slate-400 focus:outline-none focus:border-orange-500/80 focus:ring-4 focus:ring-orange-500/5 transition-all duration-200 shadow-sm"
          />
        </div>
      </div>

      {/* Showcase Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      ) : filteredPrompts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredPrompts.map((prompt) => (
            <div
              key={prompt.id}
              className="group bg-white rounded-3xl border border-slate-200/50 hover:border-slate-300/80 overflow-hidden flex flex-col transition-apple hover:shadow-[0_8px_30px_rgb(0,0,0,0.02)]"
            >
              {/* Image Preview Container */}
              <div className="relative aspect-[768/1376] bg-slate-100 overflow-hidden border-b border-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={prompt.image}
                  alt={prompt.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                
                {/* Category Badge overlay */}
                <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md border border-slate-200/40 text-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                  {prompt.category}
                </span>

                {/* Unique Key Overlay */}
                {prompt.promptKey && (
                  <span className="absolute top-4 right-4 bg-slate-900/95 backdrop-blur-md text-orange-400 text-[10px] font-mono font-black tracking-widest px-2.5 py-1 rounded-full shadow-sm">
                    {prompt.promptKey}
                  </span>
                )}

                {/* Copies Counter Overlay */}
                <span className="absolute bottom-4 right-4 flex items-center gap-1 bg-slate-950/80 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                  <Copy className="w-3 h-3 text-orange-500" />
                  {prompt.copyCount} copied
                </span>
              </div>

              {/* Content Panel */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {prompt.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md"
                      >
                        #{tag}
                      </span>
                    ))}
                    {prompt.tags.length > 3 && (
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-md">
                        +{prompt.tags.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-extrabold text-slate-900 leading-tight mb-2 group-hover:text-orange-500 transition-colors duration-200">
                    {prompt.title}
                  </h3>

                  {/* Short description */}
                  <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 mb-6">
                    {prompt.shortDesc}
                  </p>
                </div>

                {/* Card CTA Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-1">
                    {/* Tiny star rating */}
                    <span className="text-amber-500 text-sm font-bold">★</span>
                    <span className="text-slate-800 text-xs font-bold">{prompt.stars}</span>
                    <span className="text-slate-400 text-[10px] font-medium">({prompt.totalReviews})</span>
                  </div>

                  <button
                    onClick={() => onSelectPrompt(prompt)}
                    className="px-4 py-2 bg-slate-50 hover:bg-orange-500 hover:text-white border border-slate-200/40 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer transition-all duration-200"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full flex flex-col items-center justify-center py-20 bg-white border border-slate-200/40 rounded-3xl text-center">
          <Sparkles className="w-10 h-10 text-slate-300 animate-pulse mb-3" />
          <h3 className="text-slate-800 font-extrabold text-lg">No Prompts Found</h3>
          <p className="text-slate-400 text-xs mt-1 max-w-sm">
            Try adjusting your search query or switching categories.
          </p>
        </div>
      )}
    </section>
  );
}
