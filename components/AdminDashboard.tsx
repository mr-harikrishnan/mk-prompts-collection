"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  BarChart3,
  PlusCircle,
  Settings,
  MessageSquare,
  Trash2,
  Upload,
  ChevronDown,
  ChevronUp,
  LogOut,
  Calendar,
  Layers,
  Check,
  X,
  Edit
} from "lucide-react";
import { Prompt, Feedback, CreatorSettings, VisitorMetrics, PromptVariable } from "../types";

interface AdminDashboardProps {
  prompts: Prompt[];
  feedbacks: Feedback[];
  settings: CreatorSettings;
  metrics: VisitorMetrics;
  onAddPrompt: (prompt: Omit<Prompt, "id" | "copyCount" | "stars" | "totalReviews">) => void;
  onDeletePrompt: (id: string) => void;
  onUpdatePrompt: (prompt: Prompt) => void;
  onUpdateSettings: (settings: CreatorSettings) => void;
  onDeleteAllFeedback: () => void;
  onLogout: () => void;
  isSidebarOpen: boolean;
  onSidebarClose: () => void;
}

type TabType = "analytics" | "prompts" | "settings" | "feedbacks";

export default function AdminDashboard({
  prompts,
  feedbacks,
  settings,
  metrics,
  onAddPrompt,
  onDeletePrompt,
  onUpdatePrompt,
  onUpdateSettings,
  onDeleteAllFeedback,
  onLogout,
  isSidebarOpen,
  onSidebarClose,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>("analytics");
  const [isFormCollapsed, setIsFormCollapsed] = useState(true);
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Prevent background scroll when mobile sidebar drawer is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isSidebarOpen]);

  // Form states for adding prompt
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Love & Couples");
  const [newShortDesc, setNewShortDesc] = useState("");
  const [newLongDesc, setNewLongDesc] = useState("");
  const [newTemplate, setNewTemplate] = useState("");
  const [newImageBase64, setNewImageBase64] = useState("");
  
  // Custom Variables builder
  const [variableFields, setVariableFields] = useState<PromptVariable[]>([]);
  const [varNameInput, setVarNameInput] = useState("");
  const [varLabelInput, setVarLabelInput] = useState("");
  const [varDefaultInput, setVarDefaultInput] = useState("");
  
  // Settings edit states
  const [editPageName, setEditPageName] = useState(settings.pageName);
  const [editInstaUser, setEditInstaUser] = useState(settings.instagramUsername);
  const [editInstaLink, setEditInstaLink] = useState(settings.instagramLink);
  const [editFollowers, setEditFollowers] = useState(settings.followersText);
  const [editAccessKey, setEditAccessKey] = useState(settings.accessKey);
  const [isSettingsSaved, setIsSettingsSaved] = useState(false);

  // Dynamic Donut Chart Data Calculation
  const categoryStats = useMemo(() => {
    const counts: { [key: string]: number } = {};
    let totalCopies = 0;

    prompts.forEach((p) => {
      const count = Number(p.copyCount) || 0;
      counts[p.category] = (counts[p.category] || 0) + count;
      totalCopies += count;
    });

    const colors = {
      "Love & Couples": "#f97316", // Coral Orange
      "Long Distance": "#2563eb",  // Tech Blue
      "Aesthetic Art": "#8b5cf6",  // Violet
      "4K Posters": "#0f172a",     // Slate Deep Navy
    };

    const categories = Object.keys(counts);

    return categories.map((cat) => {
      const copies = counts[cat];
      const percent = totalCopies > 0 ? (copies / totalCopies) * 100 : 0;
      const color = colors[cat as keyof typeof colors] || "#64748b";
      
      const stat = {
        name: cat,
        value: copies,
        percentage: percent,
        color,
      };
      return stat;
    });
  }, [prompts]);

  // Overall Stats Calculator
  const totalCopiesSum = useMemo(() => {
    return prompts.reduce((acc, curr) => acc + (Number(curr.copyCount) || 0), 0);
  }, [prompts]);

  const averageRating = useMemo(() => {
    if (feedbacks.length === 0) return 5.0;
    const sum = feedbacks.reduce((acc, curr) => acc + curr.rating, 0);
    return parseFloat((sum / feedbacks.length).toFixed(1));
  }, [feedbacks]);

  // Handle Base64 file conversions
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        setIsUploadingImage(true);
        try {
          const res = await fetch("/api/upload", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ image: base64Data }),
          });
          const data = await res.json();
          if (data.success) {
            setNewImageBase64(data.secure_url);
          } else {
            alert("Image upload failed: " + data.message);
          }
        } catch (error) {
          console.error("Upload error:", error);
          alert("Image upload failed. Please try again.");
        } finally {
          setIsUploadingImage(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Add custom variable to builder
  const handleAddVariable = () => {
    if (!varNameInput.trim() || !varLabelInput.trim()) return;
    const sanitizedName = varNameInput.trim().toLowerCase().replace(/\s+/g, "_");
    
    // Check limit of 5 variables
    if (variableFields.length >= 5) {
      alert("You can configure up to 5 variables per prompt template.");
      return;
    }

    setVariableFields((prev) => [
      ...prev,
      {
        name: sanitizedName,
        label: varLabelInput.trim(),
        defaultValue: varDefaultInput.trim() || "N/A",
      },
    ]);

    setVarNameInput("");
    setVarLabelInput("");
    setVarDefaultInput("");
  };

  // Remove a variable builder item
  const handleRemoveVariable = (index: number) => {
    setVariableFields((prev) => prev.filter((_, i) => i !== index));
  };

  // Edit Prompt State triggers
  const handleStartEdit = (prompt: Prompt) => {
    setEditingPromptId(prompt.id);
    setNewTitle(prompt.title);
    setNewCategory(prompt.category);
    setNewShortDesc(prompt.shortDesc);
    setNewLongDesc(prompt.longDesc || "");
    setNewTemplate(prompt.template);
    setNewImageBase64(prompt.image);
    setVariableFields(prompt.variables || []);
    setIsFormCollapsed(false); // expand the form to edit
  };

  const handleCancelEdit = () => {
    setEditingPromptId(null);
    setNewTitle("");
    setNewShortDesc("");
    setNewLongDesc("");
    setNewTemplate("");
    setNewImageBase64("");
    setVariableFields([]);
    setIsFormCollapsed(true);
  };

  // Add/Edit Prompt Submission
  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newShortDesc.trim() || !newTemplate.trim() || !newImageBase64) {
      alert("Please populate all required fields and upload an image illustration.");
      return;
    }

    if (editingPromptId) {
      const original = prompts.find((p) => p.id === editingPromptId);
      onUpdatePrompt({
        id: editingPromptId,
        title: newTitle.trim(),
        category: newCategory,
        shortDesc: newShortDesc.trim(),
        longDesc: newLongDesc.trim() || newShortDesc.trim(),
        template: newTemplate.trim(),
        image: newImageBase64,
        variables: variableFields,
        tags: original?.tags || [newCategory.split(" & ")[0] || "Custom", "Updated"],
        copyCount: original?.copyCount || 0,
        stars: original?.stars || 5.0,
        totalReviews: original?.totalReviews || 0,
      });
    } else {
      onAddPrompt({
        title: newTitle.trim(),
        category: newCategory,
        shortDesc: newShortDesc.trim(),
        longDesc: newLongDesc.trim() || newShortDesc.trim(),
        template: newTemplate.trim(),
        image: newImageBase64,
        variables: variableFields,
        tags: [newCategory.split(" & ")[0] || "Custom", "New", "Aesthetic"],
      });
    }

    // Reset fields
    handleCancelEdit();
  };

  // Settings Save Submit
  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      pageName: editPageName.trim(),
      instagramUsername: editInstaUser.trim(),
      instagramLink: editInstaLink.trim(),
      followersText: editFollowers.trim(),
      accessKey: editAccessKey.trim(),
    });
    setIsSettingsSaved(true);
    setTimeout(() => {
      setIsSettingsSaved(false);
    }, 2000);
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row gap-8">
      {/* Mobile Sidebar Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          onClick={onSidebarClose}
          className="fixed inset-0 z-30 bg-black/35 backdrop-blur-xs md:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Sidebar navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 h-full bg-white p-6 border-r border-slate-200/60 flex flex-col justify-between transition-transform duration-300 ease-in-out shadow-2xl md:translate-x-0 md:static md:z-10 md:shadow-sm md:border md:rounded-3xl md:w-64 md:h-fit md:sticky md:top-[100px] md:p-6 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-orange-500" />
              <span className="font-extrabold text-slate-800 text-sm tracking-wide">
                ADMIN CONTROLS
              </span>
            </div>
            {/* Close button for mobile drawer */}
            <button
              type="button"
              onClick={onSidebarClose}
              className="md:hidden w-7 h-7 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/50 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <nav className="flex flex-col gap-1.5">
            <button
              onClick={() => {
                setActiveTab("analytics");
                onSidebarClose();
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                activeTab === "analytics"
                  ? "bg-slate-900 text-white shadow-md"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Analytics & Stats
            </button>

            <button
              onClick={() => {
                setActiveTab("prompts");
                onSidebarClose();
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                activeTab === "prompts"
                  ? "bg-slate-900 text-white shadow-md"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              Manage Prompts
            </button>

            <button
              onClick={() => {
                setActiveTab("feedbacks");
                onSidebarClose();
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                activeTab === "feedbacks"
                  ? "bg-slate-900 text-white shadow-md"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              User Feedbacks
            </button>

            <button
              onClick={() => {
                setActiveTab("settings");
                onSidebarClose();
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                activeTab === "settings"
                  ? "bg-slate-900 text-white shadow-md"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </nav>
        </div>

        <button
          onClick={() => {
            onLogout();
            onSidebarClose();
          }}
          className="mt-10 flex items-center gap-3 px-4 py-3 text-rose-600 hover:bg-rose-50 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Logout Admin
        </button>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 bg-white border border-slate-200/50 rounded-3xl p-6 sm:p-8 min-h-[60vh] shadow-sm">
        
        {/* TAB 1: ANALYTICS */}
        {activeTab === "analytics" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Analytics Dashboard</h2>
              <p className="text-slate-500 text-xs mt-0.5">Real-time statistics stored locally in offline database.</p>
            </div>

            {/* Metrics Grid cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 bg-slate-50 border border-slate-200/40 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Visits</span>
                <span className="text-2xl font-black text-slate-850 mt-1 block">{metrics.totalVisits}</span>
              </div>
              <div className="p-5 bg-slate-50 border border-slate-200/40 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Copies</span>
                <span className="text-2xl font-black text-slate-850 mt-1 block">{totalCopiesSum}</span>
              </div>
              <div className="p-5 bg-slate-50 border border-slate-200/40 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avg Star Rating</span>
                <span className="text-2xl font-black text-slate-850 mt-1 block">★ {averageRating}</span>
              </div>
              <div className="p-5 bg-slate-50 border border-slate-200/40 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Reviews</span>
                <span className="text-2xl font-black text-slate-850 mt-1 block">{feedbacks.length}</span>
              </div>
            </div>

            {/* Charts Panel: SVG Donut & Cohort Retention */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Donut Chart SVG */}
              <div className="p-6 bg-slate-50/50 border border-slate-200/40 rounded-3xl flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Copy Share by Category</h3>
                  <p className="text-[10px] text-slate-400">Total metrics visual donut chart representation.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 my-6">
                  {/* SVG Circle segments */}
                  <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 200 200" className="w-full h-full">
                      {categoryStats.length > 0 ? (
                        (() => {
                          let runningOffset = 0;
                          return categoryStats.map((stat, i) => {
                            if (stat.percentage <= 0) return null;
                            const circum = 314.16; // 2 * PI * 50
                            const strokeDash = `${(stat.percentage / 100) * circum} ${circum}`;
                            const strokeOffset = runningOffset;
                            runningOffset -= (stat.percentage / 100) * circum;

                            return (
                              <circle
                                key={i}
                                cx="100"
                                cy="100"
                                r="50"
                                fill="transparent"
                                stroke={stat.color}
                                strokeWidth="20"
                                strokeDasharray={strokeDash}
                                strokeDashoffset={strokeOffset}
                                transform="rotate(-90 100 100)"
                                className="transition-all duration-350"
                              />
                            );
                          });
                        })()
                      ) : (
                        <circle cx="100" cy="100" r="50" fill="transparent" stroke="#e2e8f0" strokeWidth="20" />
                      )}
                    </svg>
                    {/* Inner centered label */}
                    <div className="absolute text-center select-none">
                      <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Copies</span>
                      <span className="text-base font-black text-slate-800 leading-none">{totalCopiesSum}</span>
                    </div>
                  </div>

                  {/* Legend list */}
                  <div className="flex-1 space-y-2.5">
                    {categoryStats.map((stat) => (
                      <div key={stat.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: stat.color }} />
                          <span className="font-medium text-slate-600 truncate max-w-[110px]">{stat.name}</span>
                        </div>
                        <span className="font-bold text-slate-800 ml-1">{stat.value} ({stat.percentage.toFixed(0)}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cohort Retention Bars */}
              <div className="p-6 bg-slate-50/50 border border-slate-200/40 rounded-3xl">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">User Cohort Retention</h3>
                  <p className="text-[10px] text-slate-400">Weekly user retention percentages.</p>
                </div>

                <div className="space-y-3.5 mt-6">
                  {metrics.retentionCohort.map((cohort) => (
                    <div key={cohort.week} className="flex items-center gap-3">
                      <span className="text-[10px] font-extrabold text-slate-450 w-6 tracking-wide shrink-0">
                        {cohort.week}
                      </span>
                      <div className="flex-1 bg-slate-100 h-6 rounded-lg overflow-hidden relative">
                        <div
                          className="bg-blue-600 h-full rounded-lg transition-all duration-1000 ease-out"
                          style={{ width: `${cohort.percentage}%` }}
                        />
                        <span className="absolute inset-y-0 right-3 flex items-center text-[10px] font-bold text-slate-600">
                          {cohort.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Copies Data Table */}
            <div className="p-6 bg-slate-50/20 border border-slate-200/40 rounded-3xl">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Copy Analytics Feed</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-150 text-slate-450 font-bold">
                      <th className="py-2.5">Date</th>
                      <th className="py-2.5">Prompt Title</th>
                      <th className="py-2.5">Category</th>
                      <th className="py-2.5 text-right">Action Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    {metrics.copiesHistory.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-3 flex items-center gap-1.5 text-slate-450">
                          <Calendar className="w-3.5 h-3.5" />
                          {item.date}
                        </td>
                        <td className="py-3 font-semibold text-slate-800">{item.promptTitle}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-medium rounded-md text-[10px]">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3 text-right text-emerald-500 font-bold flex items-center justify-end gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Copied
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MANAGE PROMPTS */}
        {activeTab === "prompts" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Manage Showcase Prompts</h2>
                <p className="text-slate-500 text-xs mt-0.5">Upload custom templates and set custom parameters.</p>
              </div>

              <button
                onClick={() => {
                  if (!isFormCollapsed && editingPromptId) {
                    handleCancelEdit();
                  } else {
                    setIsFormCollapsed(!isFormCollapsed);
                  }
                }}
                className="flex items-center gap-1 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-xs text-slate-700 transition-colors duration-150 cursor-pointer"
              >
                {isFormCollapsed ? (
                  <>
                    <ChevronDown className="w-3.5 h-3.5" />
                    Open Form
                  </>
                ) : (
                  <>
                    <ChevronUp className="w-3.5 h-3.5" />
                    {editingPromptId ? "Cancel Edit" : "Collapse Form"}
                  </>
                )}
              </button>
            </div>

            {/* Collapsible Add Form */}
            {!isFormCollapsed && (
              <form onSubmit={handlePromptSubmit} className="p-6 bg-slate-50 border border-slate-200/40 rounded-3xl space-y-6">
                <h3 className="text-sm font-extrabold text-slate-850">
                  {editingPromptId ? "Edit AI Prompt" : "Add New AI Prompt"}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Title */}
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-slate-700 mb-1.5">Prompt Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vintage Polaroid Summer Vibe"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="px-3.5 py-2.5 bg-white border border-slate-200/70 rounded-xl text-slate-800 text-xs font-medium focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>

                  {/* Category */}
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-slate-700 mb-1.5">Category *</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="px-3.5 py-2.5 bg-white border border-slate-200/70 rounded-xl text-slate-800 text-xs font-medium focus:outline-none focus:border-orange-500 transition-colors"
                    >
                      <option value="Love & Couples">Love & Couples</option>
                      <option value="Long Distance">Long Distance</option>
                      <option value="Aesthetic Art">Aesthetic Art</option>
                      <option value="4K Posters">4K Posters</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Short Description */}
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-slate-700 mb-1.5">Short Description *</label>
                    <input
                      type="text"
                      required
                      placeholder="Brief card overview of what this prompt yields..."
                      value={newShortDesc}
                      onChange={(e) => setNewShortDesc(e.target.value)}
                      className="px-3.5 py-2.5 bg-white border border-slate-200/70 rounded-xl text-slate-800 text-xs font-medium focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>

                  {/* Image uploader (Base64 URL) */}
                  <div className="flex flex-col justify-end">
                    <label className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                      Illustration Artwork *
                      {newImageBase64 && <span className="text-[10px] text-emerald-500 font-bold">(Uploaded)</span>}
                    </label>
                    <div className="relative w-full">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                        id="image-file-uploader"
                      />
                      <label
                        htmlFor="image-file-uploader"
                        className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 bg-white border border-dashed border-slate-200/80 rounded-xl hover:border-slate-350 hover:bg-slate-50 transition-colors cursor-pointer text-xs font-semibold text-slate-600"
                      >
                        <Upload className="w-4 h-4 text-slate-400" />
                        {isUploadingImage
                          ? "Uploading to Cloudinary..."
                          : newImageBase64
                          ? "Change Illustration File"
                          : "Upload PNG/JPG File"}
                      </label>
                    </div>
                  </div>
                </div>

                {/* Long description */}
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-slate-700 mb-1.5">Detailed Description</label>
                  <textarea
                    placeholder="Enter detailed artistic notes, model generation tips..."
                    value={newLongDesc}
                    onChange={(e) => setNewLongDesc(e.target.value)}
                    rows={3}
                    className="px-3.5 py-2.5 bg-white border border-slate-200/70 rounded-xl text-slate-800 text-xs font-medium focus:outline-none focus:border-orange-500 transition-colors resize-none"
                  />
                </div>

                {/* Template box */}
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-slate-700 mb-1.5">
                    Prompt Template with Placeholders *
                  </label>
                  <textarea
                    required
                    placeholder="e.g. A romantic couple walking hand in hand in the rain in {location}, style of {art_style}."
                    value={newTemplate}
                    onChange={(e) => setNewTemplate(e.target.value)}
                    rows={4}
                    className="px-3.5 py-2.5 bg-white border border-slate-200/70 rounded-xl text-slate-800 font-mono text-xs focus:outline-none focus:border-orange-500 transition-colors"
                  />
                  <p className="text-[10px] text-slate-450 mt-1.5 font-medium leading-normal">
                    Write variable placeholders enclosed in curly brackets (e.g. {"{location}"}). Ensure you register these variables in the question builder below.
                  </p>
                </div>

                {/* CUSTOM VARIABLES QUESTION BUILDER */}
                <div className="p-4 bg-white border border-slate-200/60 rounded-2xl space-y-4">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-850">Custom Variable Configurator</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Map template placeholders to custom input form elements (Max 5).</p>
                  </div>

                  {/* List of active variables configured */}
                  {variableFields.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-150 rounded-xl">
                      {variableFields.map((field, idx) => (
                        <div
                          key={field.name}
                          className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200/60 rounded-full text-[10px] font-bold text-slate-700"
                        >
                          <span className="text-blue-500">{"{" + field.name + "}"}</span>
                          <span className="text-slate-400 font-normal">({field.label})</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveVariable(idx)}
                            className="text-rose-500 hover:text-rose-700 ml-1 font-extrabold cursor-pointer"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Builder Form Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex flex-col">
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-1">Variable Name</label>
                      <input
                        type="text"
                        placeholder="e.g. location"
                        value={varNameInput}
                        onChange={(e) => setVarNameInput(e.target.value)}
                        className="px-3.5 py-2 bg-slate-50 border border-slate-200/50 rounded-xl text-slate-850 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-1">Field Label</label>
                      <input
                        type="text"
                        placeholder="e.g. City Location"
                        value={varLabelInput}
                        onChange={(e) => setVarLabelInput(e.target.value)}
                        className="px-3.5 py-2 bg-slate-50 border border-slate-200/50 rounded-xl text-slate-850 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col justify-end">
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-1">Default Fallback</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. Paris"
                          value={varDefaultInput}
                          onChange={(e) => setVarDefaultInput(e.target.value)}
                          className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200/50 rounded-xl text-slate-850 text-xs focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleAddVariable}
                          className="px-3 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-850 cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit / Cancel Form buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {editingPromptId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl cursor-pointer transition-colors"
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-2xl shadow-sm hover:shadow-orange-500/10 cursor-pointer transition-colors active:scale-[0.99]"
                  >
                    {editingPromptId ? "Save Prompt Changes" : "Create Showcase Prompt"}
                  </button>
                </div>
              </form>
            )}

            {/* List of active prompts */}
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-850">Active Prompt Database</h3>
              
              <div className="divide-y divide-slate-150">
                {prompts.map((prompt) => (
                  <div key={prompt.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {/* Thumbnail */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={prompt.image}
                        alt={prompt.title}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200/50 shrink-0"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-850">{prompt.title}</h4>
                        <p className="text-[10px] text-slate-450 mt-0.5">
                          {prompt.category} • {(prompt.variables || []).length} parameters • {prompt.copyCount} copies
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(prompt)}
                        className="p-2 border border-slate-200 hover:border-blue-200 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all cursor-pointer"
                        title="Edit Prompt"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeletePrompt(prompt.id)}
                        className="p-2 border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all cursor-pointer"
                        title="Delete Prompt"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: USER FEEDBACKS */}
        {activeTab === "feedbacks" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">User Feedbacks & Ratings</h2>
                <p className="text-slate-500 text-xs mt-0.5">Follower review submissions and feedback ratings.</p>
              </div>

              {feedbacks.length > 0 && (
                <button
                  onClick={onDeleteAllFeedback}
                  className="flex items-center gap-1.5 px-3 py-2 border border-rose-200 bg-rose-50 hover:bg-rose-100 font-bold text-xs text-rose-600 rounded-xl transition-colors duration-150 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete All Reviews
                </button>
              )}
            </div>

            {feedbacks.length > 0 ? (
              <div className="space-y-4">
                {feedbacks.map((f) => (
                  <div
                    key={f.id}
                    className="p-5 bg-slate-50/50 border border-slate-200/40 rounded-2xl space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">{f.reviewer}</span>
                        <span className="text-[9px] font-semibold text-slate-400 block mt-0.5">
                          {new Date(f.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span
                            key={i}
                            className={`text-base ${
                              i < f.rating ? "text-amber-500" : "text-slate-250"
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed italic">
                      &ldquo;{f.comment}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full flex flex-col items-center justify-center py-16 text-center border border-dashed border-slate-200 rounded-3xl">
                <MessageSquare className="w-8 h-8 text-slate-300 animate-pulse mb-2.5" />
                <h3 className="font-bold text-slate-700 text-sm">No Feedbacks Submitted</h3>
                <p className="text-slate-400 text-xs mt-0.5">Reviews submitted by followers will display here.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SETTINGS */}
        {activeTab === "settings" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Creator Profile Settings</h2>
                <p className="text-slate-500 text-xs mt-0.5">Configure landing info, Instagram tags, and credentials.</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("analytics")}
                className="w-8 h-8 rounded-full bg-slate-105 hover:bg-slate-200 border border-slate-200/60 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors duration-150 cursor-pointer shrink-0"
                title="Back to Admin Dashboard"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isSettingsSaved && (
              <div className="p-3 bg-emerald-50 border border-emerald-150 rounded-xl text-emerald-600 text-xs font-semibold flex items-center justify-center gap-1.5 animate-in fade-in">
                <Check className="w-4 h-4" />
                Settings saved successfully!
              </div>
            )}

            <form onSubmit={handleSettingsSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Creator Page Name */}
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-slate-700 mb-1.5">Creator Page Name</label>
                  <input
                    type="text"
                    required
                    value={editPageName}
                    onChange={(e) => setEditPageName(e.target.value)}
                    className="px-3.5 py-2.5 bg-slate-50 border border-slate-200/70 rounded-xl text-slate-800 text-xs font-medium focus:outline-none focus:bg-white focus:border-orange-500 transition-all duration-200"
                  />
                </div>

                {/* Followers count label */}
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-slate-700 mb-1.5">Followers Badge Count</label>
                  <input
                    type="text"
                    required
                    value={editFollowers}
                    onChange={(e) => setEditFollowers(e.target.value)}
                    className="px-3.5 py-2.5 bg-slate-50 border border-slate-200/70 rounded-xl text-slate-800 text-xs font-medium focus:outline-none focus:bg-white focus:border-orange-500 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Instagram Username */}
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-slate-700 mb-1.5">Instagram Username</label>
                  <input
                    type="text"
                    required
                    value={editInstaUser}
                    onChange={(e) => setEditInstaUser(e.target.value)}
                    className="px-3.5 py-2.5 bg-slate-50 border border-slate-200/70 rounded-xl text-slate-800 text-xs font-medium focus:outline-none focus:bg-white focus:border-orange-500 transition-all duration-200"
                  />
                </div>

                {/* Instagram Profile Link */}
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-slate-700 mb-1.5">Instagram Profile Link</label>
                  <input
                    type="url"
                    required
                    value={editInstaLink}
                    onChange={(e) => setEditInstaLink(e.target.value)}
                    className="px-3.5 py-2.5 bg-slate-50 border border-slate-200/70 rounded-xl text-slate-800 text-xs font-medium focus:outline-none focus:bg-white focus:border-orange-500 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Creator Access Key (password) */}
              <div className="flex flex-col max-w-sm">
                <label className="text-xs font-semibold text-slate-700 mb-1.5">
                  Creator Access Key (Password)
                </label>
                <input
                  type="password"
                  required
                  value={editAccessKey}
                  onChange={(e) => setEditAccessKey(e.target.value)}
                  className="px-3.5 py-2.5 bg-slate-50 border border-slate-200/70 rounded-xl text-slate-800 text-xs font-medium focus:outline-none focus:bg-white focus:border-orange-500 transition-all duration-200"
                />
                <span className="text-[10px] text-slate-400 font-medium mt-1">
                  Default access key password is &quot;mkloveart&quot;.
                </span>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="px-6 py-3.5 bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs rounded-2xl shadow-sm hover:shadow-slate-900/10 cursor-pointer transition-colors"
              >
                Save Creator Profile Settings
              </button>
            </form>
          </div>
        )}

      </main>
    </div>
  );
}
