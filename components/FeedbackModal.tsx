"use client";

import React, { useState } from "react";
import { X, Star, Sparkles } from "lucide-react";
import { Prompt, Feedback } from "../types";

interface FeedbackModalProps {
  prompt: Prompt | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitFeedback: (feedback: Omit<Feedback, "id" | "date">) => void;
}

export default function FeedbackModal({
  prompt,
  isOpen,
  onClose,
  onSubmitFeedback,
}: FeedbackModalProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewer, setReviewer] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewer.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!comment.trim()) {
      setError("Please leave a short review comment.");
      return;
    }

    // compile a comment that includes the prompt's title if provided, so we can link it
    const finalComment = prompt
      ? `[Prompt: ${prompt.title}] ${comment}`
      : comment;

    onSubmitFeedback({
      rating,
      reviewer: reviewer.trim(),
      comment: finalComment.trim(),
    });

    // Reset Form
    setReviewer("");
    setComment("");
    setRating(5);
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Modal Surface */}
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200/60 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors duration-150 cursor-pointer z-20"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Feedback Form Content */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 overflow-y-auto flex-1">
          <div className="text-center mb-6">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-3">
              <Star className="w-5 h-5 fill-amber-500" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-950">
              Submit Prompt Review
            </h3>
            <p className="text-slate-500 text-xs mt-1">
              {prompt ? `Reviewing: ${prompt.title}` : "Share your experience with the prompts world!"}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-150 rounded-xl text-rose-600 text-xs font-semibold text-center">
              {error}
            </div>
          )}

          {/* Interactive Star Picker */}
          <div className="flex flex-col items-center justify-center mb-6">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Your Rating
            </span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-amber-500 transition-colors duration-100 cursor-pointer"
                >
                  <Star
                    className={`w-8 h-8 transition-transform duration-100 active:scale-95 ${
                      star <= (hoverRating ?? rating)
                        ? "text-amber-500 fill-amber-500 scale-105"
                        : "text-slate-200"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Your Name
              </label>
              <input
                type="text"
                value={reviewer}
                onChange={(e) => setReviewer(e.target.value)}
                placeholder="e.g. Sophia Bennett"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/70 rounded-xl text-slate-800 text-xs font-medium focus:outline-none focus:bg-white focus:border-orange-500 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Comments & Review
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="How did this prompt perform? What settings did you try?"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/70 rounded-xl text-slate-800 text-xs font-medium focus:outline-none focus:bg-white focus:border-orange-500 transition-all duration-200 resize-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-2xl transition-all duration-200 cursor-pointer shadow-sm hover:shadow-slate-900/10 active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 text-orange-500" />
            Submit Review
          </button>
        </form>

      </div>
    </div>
  );
}
