"use client";

import React from "react";
import { Instagram } from "lucide-react";
import { CreatorSettings } from "../types";

interface HeaderProps {
  settings: CreatorSettings;
}

export default function Header({
  settings,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Brand Title Only */}
      <div>
        <h1 className="text-base font-extrabold text-slate-900 leading-tight tracking-wider uppercase">
          {settings.pageName}
        </h1>
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
