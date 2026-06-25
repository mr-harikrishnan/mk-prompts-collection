"use client";

import React from "react";
import { X, Instagram, Heart, ArrowRight } from "lucide-react";
import { CreatorSettings } from "../types";

interface FollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CreatorSettings;
}

export default function FollowUpModal({ isOpen, onClose, settings }: FollowUpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Modal Surface */}
      <div className="relative w-full max-w-sm bg-white rounded-3xl border border-slate-200/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200/60 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors duration-150 cursor-pointer z-20"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content Container */}
        <div className="p-6 sm:p-8 text-center overflow-y-auto flex-1">
          {/* Heart icon */}
          <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mx-auto mb-4 animate-bounce">
            <Heart className="w-6 h-6 fill-orange-500" />
          </div>

          <h3 className="text-lg font-extrabold text-slate-950 mb-2">
            Connect with MK Love Art
          </h3>
          
          <p className="text-slate-500 text-xs leading-relaxed mb-6">
            Thank you for copying the prompt! Join our creative community of{" "}
            <span className="font-bold text-slate-850">{settings.followersText}</span> on Instagram to get daily updates, art tips, and secret prompt customizers!
          </p>

          {/* Instagram ID Badge */}
          <div className="mb-6 p-4 bg-slate-50 border border-slate-200/50 rounded-2xl flex items-center justify-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white">
              <Instagram className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-800">
                @{settings.instagramUsername}
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                Official Instagram Page
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2">
            <a
              href={settings.instagramLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-2xl transition-all duration-200 shadow-sm hover:shadow-slate-900/10 cursor-pointer"
            >
              Follow Creator
              <ArrowRight className="w-4 h-4 text-orange-500" />
            </a>
            
            <button
              onClick={onClose}
              className="w-full py-3 text-slate-400 hover:text-slate-700 text-xs font-bold rounded-2xl hover:bg-slate-50 transition-all duration-150 cursor-pointer"
            >
              Maybe Later
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
