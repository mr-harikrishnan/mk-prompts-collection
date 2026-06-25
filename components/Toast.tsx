"use client";

import React, { useEffect } from "react";
import { Check } from "lucide-react";

interface ToastProps {
  message: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function Toast({ message, isOpen, onClose }: ToastProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-xl">
        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
          <Check className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-xs font-semibold select-none">{message}</span>
      </div>
    </div>
  );
}
