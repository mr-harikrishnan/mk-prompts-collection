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
import { Bot } from "lucide-react";

import { useLocalStorage } from "../hooks/useLocalStorage";
import {
  INITIAL_PROMPTS,
  DEFAULT_FEEDBACKS,
  DEFAULT_SETTINGS,
  DEFAULT_METRICS,
} from "../data/mockData";
import { Prompt, Feedback, CreatorSettings, VisitorMetrics } from "../types";



export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorDetails, setErrorDetails] = useState("");
  
  // Real database states
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [settings, setSettings] = useState<CreatorSettings>(DEFAULT_SETTINGS);
  const [metrics, setMetrics] = useState<VisitorMetrics>(DEFAULT_METRICS);
  
  // Admin auth persists locally for convenience
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useLocalStorage<boolean>("mk_is_admin", false);

  // Layout navigation state
  const [activeView, setActiveView] = useState<"showcase" | "dashboard">("showcase");
  const [isAdminSidebarOpen, setIsAdminSidebarOpen] = useState(false);

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

  // Fetch initial data from database endpoints
  useEffect(() => {
    async function initData() {
      try {
        setIsLoading(true);

        const [settingsRes, promptsRes, feedbacksRes, metricsRes] = await Promise.all([
          fetch("/api/settings").then((r) => r.json()),
          fetch("/api/prompts").then((r) => r.json()),
          fetch("/api/feedbacks").then((r) => r.json()),
          fetch("/api/metrics").then((r) => r.json()),
        ]);

        if (settingsRes.success && promptsRes.success && feedbacksRes.success && metricsRes.success) {
          setSettings(settingsRes.data);
          setPrompts(promptsRes.data);
          setFeedbacks(feedbacksRes.data);
          setMetrics(metricsRes.data);
          setIsError(false);
        } else {
          setIsError(true);
          const errorMsg = settingsRes.message || promptsRes.message || feedbacksRes.message || metricsRes.message || "Failed to load database config";
          setErrorDetails(errorMsg);
        }

        // Record a visit metrics log
        fetch("/api/metrics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ actionType: "visit" }),
        })
          .then((r) => r.json())
          .then((res) => {
            if (res.success) setMetrics(res.data);
          })
          .catch((e) => console.warn("Failed to register page visit:", e));

      } catch (err: any) {
        console.error("Failed to load backend DB data:", err);
        setIsError(true);
        setErrorDetails(err.message || "Connection failed");
      } finally {
        setIsLoading(false);
        setIsMounted(true);
      }
    }

    initData();
  }, []);

  // Synchronize URL hash with activeView for browser back/forward navigation
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
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    }
  }, [activeView, isAdminLoggedIn]);

  // Force activeView and hash to dashboard if logged in as admin
  useEffect(() => {
    if (isMounted && isAdminLoggedIn) {
      setTimeout(() => {
        setActiveView("dashboard");
      }, 0);
      if (window.location.hash !== "#dashboard") {
        window.location.hash = "dashboard";
      }
    }
  }, [isMounted, isAdminLoggedIn]);

  // Prevent background scroll when any modal is open
  useEffect(() => {
    const isAnyModalOpen =
      isDetailsOpen ||
      isCustomizerOpen ||
      isFeedbackOpen ||
      isLoginOpen ||
      isFollowUpOpen;

    if (isAnyModalOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isDetailsOpen, isCustomizerOpen, isFeedbackOpen, isLoginOpen, isFollowUpOpen]);

  // If not mounted yet (SSR phase), render basic loading shell to protect hydration
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500 font-bold text-xs select-none">
        Loading Prompts World...
      </div>
    );
  }

  // Handle prompt copy trigger
  const handleCopy = (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text)
        .then(() => {
          if (selectedPrompt) {
            // Post copy transaction to metrics endpoint
            fetch("/api/metrics", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                actionType: "copy",
                promptTitle: selectedPrompt.title,
                category: selectedPrompt.category,
                promptId: selectedPrompt.id,
              }),
            })
              .then((r) => r.json())
              .then((res) => {
                if (res.success) {
                  setMetrics(res.data);
                  // Refresh prompts copy counts
                  fetch("/api/prompts")
                    .then((r) => r.json())
                    .then((pData) => {
                      if (pData.success) setPrompts(pData.data);
                    });
                }
              })
              .catch((err) => console.warn("Failed to log copy metrics:", err));
          }

          // Open toast
          setToastMsg("Prompt copied to clipboard!");
          setIsToastOpen(true);

          // Trigger Instagram popup 350ms later
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
    fetch("/api/prompts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPromptData),
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setPrompts((prev) => [res.data, ...prev]);
          setToastMsg("New prompt created successfully!");
          setIsToastOpen(true);
        } else {
          alert("Failed to create prompt: " + res.message);
        }
      })
      .catch((err) => {
        console.error("Add prompt error:", err);
        alert("Failed to save prompt. Please try again.");
      });
  };

  // Delete prompt (admin)
  const handleDeletePrompt = (id: string) => {
    if (confirm("Are you sure you want to delete this prompt from the database?")) {
      fetch(`/api/prompts/${id}`, {
        method: "DELETE",
      })
        .then((r) => r.json())
        .then((res) => {
          if (res.success) {
            setPrompts((prev) => prev.filter((p) => p.id !== id));
            setToastMsg("Prompt removed successfully.");
            setIsToastOpen(true);
          } else {
            alert("Delete failed: " + res.message);
          }
        })
        .catch((err) => {
          console.error("Delete prompt error:", err);
          alert("Failed to delete. Please try again.");
        });
    }
  };

  // Update prompt (admin)
  const handleUpdatePrompt = (updatedPrompt: Prompt) => {
    fetch(`/api/prompts/${updatedPrompt.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedPrompt),
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setPrompts((prev) =>
            prev.map((p) => (p.id === updatedPrompt.id ? res.data : p))
          );
          setToastMsg("Prompt updated successfully!");
          setIsToastOpen(true);
        } else {
          alert("Update failed: " + res.message);
        }
      })
      .catch((err) => {
        console.error("Update prompt error:", err);
        alert("Failed to update. Please try again.");
      });
  };

  // Submit rating feedbacks
  const handleSubmitFeedback = (newReview: Omit<Feedback, "id" | "date">) => {
    fetch("/api/feedbacks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newReview),
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setFeedbacks((prev) => [res.data, ...prev]);
          // Refresh prompts to show new average stars rating
          fetch("/api/prompts")
            .then((r) => r.json())
            .then((pData) => {
              if (pData.success) setPrompts(pData.data);
            });
          setToastMsg("Thank you for your rating feedback!");
          setIsToastOpen(true);
        } else {
          alert("Feedback submit failed: " + res.message);
        }
      })
      .catch((err) => {
        console.error("Submit feedback error:", err);
        alert("Failed to submit feedback. Please try again.");
      });
  };

  // Delete feedbacks (admin)
  const handleDeleteAllFeedback = () => {
    if (confirm("Are you sure you want to purge all follower review submissions?")) {
      fetch("/api/feedbacks", {
        method: "DELETE",
      })
        .then((r) => r.json())
        .then((res) => {
          if (res.success) {
            setFeedbacks([]);
            setToastMsg("All community reviews purged.");
            setIsToastOpen(true);
          } else {
            alert("Feedback purge failed: " + res.message);
          }
        })
        .catch((err) => {
          console.error("Purge feedbacks error:", err);
          alert("Failed to purge reviews. Please try again.");
        });
    }
  };

  // Update Settings (admin)
  const handleUpdateSettings = (newSettings: CreatorSettings) => {
    fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSettings),
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setSettings(res.data);
          setToastMsg("Creator settings updated successfully!");
          setIsToastOpen(true);
        } else {
          alert("Settings update failed: " + res.message);
        }
      })
      .catch((err) => {
        console.error("Update settings error:", err);
        alert("Failed to save settings. Please try again.");
      });
  };

  return (
    <>
      {/* Background decoration (Responsive Image Background) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none select-none z-0">
        <img
          src="/images/userscreenbg.png"
          alt="Background"
          className="w-full h-full object-cover opacity-35"
        />
        {/* Semi-translucent overlay to protect contrast of texts & cards */}
        <div className="absolute inset-0 bg-slate-50/70 backdrop-blur-[2px]" />
      </div>

      {/* Main Workspace Frame */}
      <div className="relative z-10 flex flex-col min-h-screen bg-transparent text-slate-900 transition-colors duration-300">
        
        {/* 2. Global header navigation profile banner */}
        <Header
          settings={settings}
          showAdminMenu={activeView === "dashboard" && isAdminLoggedIn}
          onOpenAdminSidebar={() => setIsAdminSidebarOpen(true)}
        />

        {activeView === "showcase" || !isAdminLoggedIn ? (
          isError ? (
            <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 flex flex-col items-center justify-center text-center">
              <div className="max-w-md bg-white border border-slate-200/80 rounded-3xl p-8 shadow-sm space-y-4">
                <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                  <Bot className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 font-apple">Database Connection Failed</h3>
                <p className="text-slate-500 text-xs leading-normal">
                  Could not load prompts from the database cluster. Please verify your MongoDB Network Access / IP Whitelisting rules.
                </p>
                {errorDetails && (
                  <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl font-mono text-[9px] text-slate-500 text-left max-h-24 overflow-y-auto break-all">
                    {errorDetails}
                  </div>
                )}
                <button
                  onClick={() => window.location.reload()}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Retry Connection
                </button>
              </div>
            </div>
          ) : (
            <ShowcaseGrid
              prompts={prompts}
              onSelectPrompt={(prompt) => {
                setSelectedPrompt(prompt);
                setIsDetailsOpen(true);
              }}
              onTriggerLogin={() => setIsLoginOpen(true)}
              isLoading={isLoading}
            />
          )
        ) : (
          isError ? (
            <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 flex flex-col items-center justify-center text-center">
              <div className="max-w-md bg-white border border-slate-200/80 rounded-3xl p-8 shadow-sm space-y-4">
                <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                  <Bot className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 font-apple">Admin Dashboard Blocked</h3>
                <p className="text-slate-500 text-xs leading-normal">
                  Mongoose was unable to connect to the database. Accessing dashboard metrics requires a database connection.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Retry Connection
                </button>
              </div>
            </div>
          ) : (
            <AdminDashboard
              prompts={prompts}
              feedbacks={feedbacks}
              settings={settings}
              metrics={metrics}
              onAddPrompt={handleAddPrompt}
              onDeletePrompt={handleDeletePrompt}
              onUpdatePrompt={handleUpdatePrompt}
              onUpdateSettings={handleUpdateSettings}
              onDeleteAllFeedback={handleDeleteAllFeedback}
              isSidebarOpen={isAdminSidebarOpen}
              onSidebarClose={() => setIsAdminSidebarOpen(false)}
              onLogout={() => {
                setIsAdminLoggedIn(false);
                setActiveView("showcase");
              }}
            />
          )
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
