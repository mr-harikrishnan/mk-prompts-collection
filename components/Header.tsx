"use client";

import React from "react";
import { Instagram, Menu, ArrowLeft } from "lucide-react";
import { CreatorSettings } from "../types";

interface HeaderProps {
  settings: CreatorSettings;
  showAdminMenu?: boolean;
  onOpenAdminSidebar?: () => void;
  activeView?: "showcase" | "dashboard";
  onBackToShowcase?: () => void;
}

export default function Header({
  settings,
  showAdminMenu = false,
  onOpenAdminSidebar,
  activeView = "showcase",
  onBackToShowcase,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Brand Title Row */}
      <div className="flex items-center justify-between w-full sm:w-auto gap-4">
        <div className="flex items-center gap-3">
          {activeView === "dashboard" && onBackToShowcase && (
            <button
              type="button"
              onClick={onBackToShowcase}
              className="flex items-center justify-center w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 cursor-pointer transition-colors border border-slate-200/30"
              title="Back to Showcase"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          )}
          <h1 className="text-base font-extrabold text-slate-900 leading-tight tracking-wider uppercase select-none">
            {settings.pageName}
          </h1>
        </div>
        {showAdminMenu && (
          <button
            type="button"
            onClick={onOpenAdminSidebar}
            className="md:hidden flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200/60 hover:bg-slate-100 rounded-xl text-slate-700 font-bold text-[10px] uppercase tracking-wide cursor-pointer transition-colors"
          >
            <Menu className="w-3.5 h-3.5 text-orange-500" />
            Controls
          </button>
        )}
      </div>

      {/* Instagram Tracker Badge (Far Right / End) */}
      <a
        href={settings.instagramLink}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-200/60 rounded-full hover:bg-slate-100 hover:border-slate-300 transition-all duration-200 cursor-pointer shadow-sm group sm:ml-auto"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white">
          <Instagram className="w-4 h-4" />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-700 leading-none group-hover:text-slate-900">
            @{settings.instagramUsername}
          </span>
          <span className="text-[10px] font-medium text-slate-400 mt-0.5 leading-none">
            {settings.followersText}
          </span>
        </div>
      </a>
    </header>
  );
}
