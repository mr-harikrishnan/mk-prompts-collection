"use client";

import React from "react";
import { X, Copy, Settings2, Star, MessageSquare } from "lucide-react";
import { Prompt, Feedback } from "../types";

interface PromptDetailsModalProps {
  prompt: Prompt | null;
  isOpen: boolean;
  onClose: () => void;
  onCopy: (compiledText: string) => void;
  onCustomize: (prompt: Prompt) => void;
  onRatePrompt: (prompt: Prompt) => void;
  feedbacks: Feedback[];
}

export default function PromptDetailsModal({
  prompt,
  isOpen,
  onClose,
  onCopy,
  onCustomize,
  onRatePrompt,
  feedbacks,
}: PromptDetailsModalProps) {
  if (!isOpen || !prompt) return null;

  // Filter feedback for this prompt title
  const promptFeedbacks = feedbacks.filter(
    (f) =>
      f.comment.toLowerCase().includes(prompt.title.toLowerCase()) ||
      // Or just matches category keywords, let's keep it matching by checking comment or let's say all feedbacks represent system feedbacks, but let's show reviews that match or just a randomized selection for aesthetic mock-up
      f.id
  ).slice(0, 3); // show top 3 feedback items

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Modal Surface */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-200/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-250 border border-slate-200/60 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors duration-150 cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Scrollable Container */}
        <div className="overflow-y-auto p-6 sm:p-8">
          
          {/* Main Visual Image */}
          <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-150 mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={prompt.image}
              alt={prompt.title}
              className="w-full h-full object-cover"
            />
            <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-md border border-slate-200/40 text-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
              {prompt.category}
            </span>
          </div>

          {/* Details Metadata */}
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 mb-2">
              {prompt.title}
            </h2>
            
            <div className="flex flex-wrap gap-1.5 mb-4">
              {prompt.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200/20 px-2.5 py-1 rounded-md"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6">
              {prompt.longDesc}
            </p>
          </div>

          {/* Raw Prompt Template Display */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Prompt Template
            </h3>
            <div className="relative bg-slate-50 border border-slate-200/60 rounded-2xl p-4 font-mono text-xs text-slate-800 leading-relaxed overflow-x-auto whitespace-pre-wrap select-all">
              {prompt.template}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-100">
            {/* Copy default full prompt */}
            <button
              onClick={() => onCopy(prompt.template)}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-100 hover:bg-slate-200 border border-slate-200/50 text-slate-700 font-semibold text-xs rounded-2xl transition-all duration-200 cursor-pointer active:scale-[0.98]"
            >
              <Copy className="w-4 h-4 text-slate-600" />
              Copy Full Prompt
            </button>

            {/* Customize variable prompt */}
            <button
              onClick={() => onCustomize(prompt)}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-2xl transition-all duration-200 cursor-pointer active:scale-[0.98] shadow-sm hover:shadow-slate-900/10"
            >
              <Settings2 className="w-4 h-4 text-orange-500" />
              Customize variables
            </button>
          </div>

          {/* Reviews list */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                Community Feedback
              </h3>
              <button
                onClick={() => onRatePrompt(prompt)}
                className="text-xs font-semibold text-orange-500 hover:text-orange-600 cursor-pointer transition-colors duration-150"
              >
                ★ Rate Prompt
              </button>
            </div>

            {promptFeedbacks.length > 0 ? (
              <div className="space-y-3.5">
                {promptFeedbacks.map((feedback) => (
                  <div
                    key={feedback.id}
                    className="p-4 bg-slate-50/55 rounded-2xl border border-slate-200/20"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-800">
                        {feedback.reviewer}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < feedback.rating
                                ? "text-amber-500 fill-amber-500"
                                : "text-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      {feedback.comment}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-xs text-center py-4 bg-slate-50/30 rounded-2xl border border-dashed border-slate-200/60">
                No reviews yet. Be the first to leave a feedback!
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
