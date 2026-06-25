"use client";

import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import ShowcaseGrid from "../components/ShowcaseGrid";
import PromptDetailsModal from "../components/PromptDetailsModal";
import PromptCustomizer from "../components/PromptCustomizer";
import FeedbackModal from "../components/FeedbackModal";
import AdminLoginModal from "../components/AdminLoginModal";
import AdminDashboard from "../components/AdminDashboard";
import FollowUpModal from "../components/FollowUpModal";
import Toast from "../components/Toast";

import { useLocalStorage } from "../hooks/useLocalStorage";
import {
  INITIAL_PROMPTS,
  DEFAULT_FEEDBACKS,
  DEFAULT_SETTINGS,
  DEFAULT_METRICS,
} from "../data/mockData";
import { Prompt, Feedback, CreatorSettings, VisitorMetrics } from "../types";

interface Star {
  id: number;
  top: string;
  left: string;
  size: string;
  delay: string;
}

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [stars, setStars] = useState<Star[]>([]);
  
  // Offline client-side databases
  const [prompts, setPrompts] = useLocalStorage<Prompt[]>("mk_prompts", INITIAL_PROMPTS);
  const [feedbacks, setFeedbacks] = useLocalStorage<Feedback[]>("mk_feedbacks", DEFAULT_FEEDBACKS);
  const [settings, setSettings] = useLocalStorage<CreatorSettings>("mk_settings", DEFAULT_SETTINGS);
  const [metrics, setMetrics] = useLocalStorage<VisitorMetrics>("mk_metrics", DEFAULT_METRICS);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useLocalStorage<boolean>("mk_is_admin", false);

  // Layout navigation state
  const [activeView, setActiveView] = useState<"showcase" | "dashboard">("showcase");

  // Modals state
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
  
  // Toast notifications
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Trigger mounts and visits tracking safely
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    
    // Increment total visit count on entry
    try {
      const storedMetrics = window.localStorage.getItem("mk_metrics");
      if (storedMetrics) {
        const parsed = JSON.parse(storedMetrics) as VisitorMetrics;
        const updated = {
          ...parsed,
          totalVisits: (parsed.totalVisits || 0) + 1,
        };
        window.localStorage.setItem("mk_metrics", JSON.stringify(updated));
        setMetrics(updated);
      } else {
        const updated = {
          ...DEFAULT_METRICS,
          totalVisits: DEFAULT_METRICS.totalVisits + 1,
        };
        window.localStorage.setItem("mk_metrics", JSON.stringify(updated));
        setMetrics(updated);
      }
    } catch (e) {
      console.warn("Failed to increment page visit metrics:", e);
    }

    return () => clearTimeout(timer);
  }, [setMetrics]);

  // Generate random twinkling stars safely on client mount
  useEffect(() => {
    const timer = setTimeout(() => {
      const generatedStars = Array.from({ length: 80 }).map((_, index) => {
        const size = Math.random() * 2.5 + 0.5; // 0.5px to 3px
        return {
          id: index,
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          size: `${size}px`,
          delay: `${Math.random() * 5}s`,
        };
      });
      setStars(generatedStars);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Synchronize URL hash with activeView for browser back/forward navigation
  // Logging out the admin session if they click the browser back button to leave the dashboard.
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (isAdminLoggedIn) {
        if (hash !== "#dashboard") {
          setIsAdminLoggedIn(false);
          setActiveView("showcase");
        } else {
          setActiveView("dashboard");
        }
      } else {
        setActiveView("showcase");
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    
    // Initial sync
    const initialSyncTimer = setTimeout(() => {
      if (window.location.hash === "#dashboard" && isAdminLoggedIn) {
        setActiveView("dashboard");
      }
    }, 0);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      clearTimeout(initialSyncTimer);
    };
  }, [isAdminLoggedIn, setIsAdminLoggedIn]);

  // Update hash when activeView changes
  useEffect(() => {
    if (activeView === "dashboard" && isAdminLoggedIn) {
      if (window.location.hash !== "#dashboard") {
        window.location.hash = "dashboard";
      }
    } else {
      if (window.location.hash === "#dashboard") {
        // Remove hash from URL without reloading or creating duplicate history
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    }
  }, [activeView, isAdminLoggedIn]);

  // Force activeView and hash to dashboard if logged in as admin (local storage lock)
  useEffect(() => {
    if (isMounted && isAdminLoggedIn) {
      setActiveView("dashboard");
      if (window.location.hash !== "#dashboard") {
        window.location.hash = "dashboard";
      }
    }
  }, [isMounted, isAdminLoggedIn]);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500 font-bold text-xs select-none">
        Loading Prompts World...
      </div>
    );
  }

  // Handle default copy trigger
  const handleCopy = (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text)
        .then(() => {
          if (selectedPrompt) {
            // 1. Increment copies in prompts
            setPrompts((prev) =>
              prev.map((p) =>
                p.id === selectedPrompt.id
                  ? { ...p, copyCount: p.copyCount + 1 }
                  : p
              )
            );

            // 2. Append history date log
            const today = new Date().toISOString().split("T")[0];
            setMetrics((prev) => ({
              ...prev,
              totalCopies: prev.totalCopies + 1,
              copiesHistory: [
                {
                  date: today,
                  promptTitle: selectedPrompt.title,
                  category: selectedPrompt.category,
                },
                ...prev.copiesHistory.slice(0, 19),
              ],
            }));
          }

          // 3. Open toast
          setToastMsg("Prompt copied to clipboard!");
          setIsToastOpen(true);

          // 4. Trigger Instagram popup 350ms later
          setTimeout(() => {
            setIsFollowUpOpen(true);
          }, 350);
        })
        .catch((err) => {
          console.error("Copy failed: ", err);
        });
    }
  };

  // Open customization tool
  const handleOpenCustomize = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setIsDetailsOpen(false); // close details modal
    setIsCustomizerOpen(true); // open customizer
  };

  // Open feedback modal from details
  const handleOpenRate = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setIsDetailsOpen(false);
    setIsFeedbackOpen(true);
  };

  // Add customized prompt (admin)
  const handleAddPrompt = (newPromptData: Omit<Prompt, "id" | "copyCount" | "stars" | "totalReviews">) => {
    const newPrompt: Prompt = {
      ...newPromptData,
      id: `prompt-${Date.now()}`,
      copyCount: 0,
      stars: 5.0,
      totalReviews: 0,
    };
    setPrompts((prev) => [newPrompt, ...prev]);
  };

  // Delete prompt (admin)
  const handleDeletePrompt = (id: string) => {
    if (confirm("Are you sure you want to delete this prompt from the database?")) {
      setPrompts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // Submit rating feedbacks
  const handleSubmitFeedback = (newReview: Omit<Feedback, "id" | "date">) => {
    const review: Feedback = {
      ...newReview,
      id: `review-${Date.now()}`,
      date: new Date().toISOString(),
    };

    setFeedbacks((prev) => [review, ...prev]);

    // If review comment contains prompt title, recalculate its stars
    if (selectedPrompt) {
      setPrompts((prev) =>
        prev.map((p) => {
          if (p.id === selectedPrompt.id) {
            const currentTotal = p.totalReviews;
            const currentStars = p.stars;
            const updatedTotal = currentTotal + 1;
            const updatedStars = parseFloat(
              ((currentStars * currentTotal + newReview.rating) / updatedTotal).toFixed(1)
            );

            return {
              ...p,
              totalReviews: updatedTotal,
              stars: updatedStars,
            };
          }
          return p;
        })
      );
    }

    setToastMsg("Thank you for your rating feedback!");
    setIsToastOpen(true);
  };

  // Delete feedbacks (admin)
  const handleDeleteAllFeedback = () => {
    if (confirm("Are you sure you want to purge all follower review submissions?")) {
      setFeedbacks([]);
    }
  };

  return (
    <>
      {/* Background decoration (Dotted Globe, Stars, Flying Paper Airplane) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none select-none z-0 starry-grid-light bg-slate-50">
        {/* Twinkling stars */}
        <div className="absolute inset-0">
          {stars.map((star) => (
            <div
              key={star.id}
              className="absolute rounded-full bg-orange-500/40 star"
              style={{
                top: star.top,
                left: star.left,
                width: star.size,
                height: star.size,
                animationDelay: star.delay,
                boxShadow: "0 0 3px rgba(249, 115, 22, 0.3)",
              }}
            />
          ))}
        </div>

        {/* Dotted globe vector */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <svg
            className="w-[85%] max-w-5xl h-auto opacity-[0.03] text-slate-800"
            viewBox="0 0 1000 500"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          >
            <ellipse cx="500" cy="250" rx="450" ry="220" />
            <ellipse cx="500" cy="250" rx="300" ry="220" />
            <ellipse cx="500" cy="250" rx="150" ry="220" />
            <line x1="50" y1="250" x2="950" y2="250" />
            <line x1="500" y1="30" x2="500" y2="470" />
            <path d="M 100,250 Q 500,100 900,250" />
            <path d="M 100,250 Q 500,400 900,250" />
            <path
              d="M -100 650 C 300 550, 200 150, 700 300 C 1200 450, 1000 50, 1600 -100"
              stroke="rgba(249, 115, 22, 0.15)"
              strokeWidth="2"
              strokeDasharray="6 6"
              fill="none"
            />
          </svg>
        </div>

        {/* Flying paper airplane along path */}
        <div className="absolute inset-0 w-full h-full">
          <svg
            viewBox="0 0 24 24"
            className="w-8 h-8 text-orange-500/60 fill-orange-500/5 absolute animate-airplane"
            style={{
              transformBox: "fill-box",
              transformOrigin: "center",
            }}
          >
            <path
              d="M1.04 1.57L22.96 12L1.04 22.43L4.91 12L1.04 1.57Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path d="M4.91 12H22.96" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>
      </div>

      {/* Main Workspace Frame */}
      <div className="relative z-10 flex flex-col min-h-screen bg-transparent text-slate-900 transition-colors duration-300">
        
        {/* 2. Global header navigation profile banner */}
        <Header settings={settings} />

        {/* Dynamic viewport renderer (Showcase or Creator Dashboard) */}
        {activeView === "showcase" || !isAdminLoggedIn ? (
          <ShowcaseGrid
            prompts={prompts}
            onSelectPrompt={(prompt) => {
              setSelectedPrompt(prompt);
              setIsDetailsOpen(true);
            }}
            onTriggerLogin={() => setIsLoginOpen(true)}
          />
        ) : (
          <AdminDashboard
            prompts={prompts}
            feedbacks={feedbacks}
            settings={settings}
            metrics={metrics}
            onAddPrompt={handleAddPrompt}
            onDeletePrompt={handleDeletePrompt}
            onUpdateSettings={setSettings}
            onDeleteAllFeedback={handleDeleteAllFeedback}
            onLogout={() => {
              setIsAdminLoggedIn(false);
              setActiveView("showcase");
            }}
          />
        )}

        {/* Footer Credit */}
        <footer className="w-full text-slate-400 text-xs border-t border-slate-200/50 mt-auto py-6">
          <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="select-none">© {new Date().getFullYear()} {settings.pageName} • Crafted with Apple Design Principles</span>
            {!isAdminLoggedIn && (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="hover:text-slate-700 font-bold transition-colors cursor-pointer"
              >
                Admin Access
              </button>
            )}
          </div>
        </footer>
      </div>

      {/* 3. Prompt Details Modal */}
      <PromptDetailsModal
        prompt={selectedPrompt}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onCopy={handleCopy}
        onCustomize={handleOpenCustomize}
        onRatePrompt={handleOpenRate}
        feedbacks={feedbacks}
      />

      {/* 4. AI Prompt Customizer Tool */}
      <PromptCustomizer
        prompt={selectedPrompt}
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        onCopy={handleCopy}
      />

      {/* 5. Rating & Review Feedback modal */}
      <FeedbackModal
        prompt={selectedPrompt}
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        onSubmitFeedback={handleSubmitFeedback}
      />

      {/* 6. Secure Admin Password login badge modal */}
      <AdminLoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={() => {
          setIsAdminLoggedIn(true);
          setActiveView("dashboard");
          setToastMsg("Welcome back, Creator!");
          setIsToastOpen(true);
        }}
        correctAccessKey={settings.accessKey}
      />

      {/* 7. Follow-up Instagram conversion popup */}
      <FollowUpModal
        isOpen={isFollowUpOpen}
        onClose={() => setIsFollowUpOpen(false)}
        settings={settings}
      />

      {/* 8. Toast popup overlays */}
      <Toast
        message={toastMsg}
        isOpen={isToastOpen}
        onClose={() => setIsToastOpen(false)}
      />
    </>
  );
}
