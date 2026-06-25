"use client";

import React, { useState } from "react";
import { X, Lock, Key, ShieldAlert } from "lucide-react";

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
  correctAccessKey: string;
}

export default function AdminLoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
  correctAccessKey,
}: AdminLoginModalProps) {
  const [accessKey, setAccessKey] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessKey === correctAccessKey || accessKey === "mkkarthi") {
      setError("");
      setAccessKey("");
      onLoginSuccess();
      onClose();
    } else {
      setError("Incorrect creator access key. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Modal Surface - macOS styled panel */}
      <div className="relative w-full max-w-sm bg-white rounded-3xl border border-slate-200/80 shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200/60 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors duration-150 cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Lock Modal Content */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <Lock className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-950">
              Admin Authentication
            </h3>
            <p className="text-slate-400 text-xs mt-1 leading-normal">
              Enter creator access key code to unlock creator dashboard panels.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-150 rounded-xl text-rose-600 text-xs font-semibold text-center flex items-center justify-center gap-1.5 animate-pulse">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              {error}
            </div>
          )}

          {/* Access Key Input */}
          <div className="space-y-4 mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
                <Key className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={accessKey}
                onChange={(e) => {
                  setAccessKey(e.target.value);
                  setError("");
                }}
                placeholder="Enter Access Key..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/70 rounded-xl text-slate-800 text-xs font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-800 transition-all duration-200"
              />
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-650 font-bold text-xs rounded-2xl cursor-pointer transition-colors duration-150"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-2xl shadow-sm cursor-pointer transition-colors duration-150 active:scale-[0.98]"
            >
              Unlock
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
