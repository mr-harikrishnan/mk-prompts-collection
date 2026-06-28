"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Copy, Bot, Sparkles, Check } from "lucide-react";
import { Prompt } from "../types";

interface PromptCustomizerProps {
  prompt: Prompt | null;
  isOpen: boolean;
  onClose: () => void;
  onCopy: (compiledText: string) => void;
}

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
}

export default function PromptCustomizer({
  prompt,
  isOpen,
  onClose,
  onCopy,
}: PromptCustomizerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userText, setUserText] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [compiledText, setCompiledText] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isLimitExceeded, setIsLimitExceeded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize conversation when prompt changes or customizer opens
  useEffect(() => {
    if (prompt && isOpen) {
      // Check customization limit first (max 5 per calendar day)
      const checkLimit = () => {
        try {
          const today = new Date().toDateString();
          const dataStr = localStorage.getItem("mk_customizer_limit");
          if (dataStr) {
            const data = JSON.parse(dataStr);
            if (data.date === today && data.count >= 5) {
              setIsLimitExceeded(true);
              return true;
            }
          }
          setIsLimitExceeded(false);
          return false;
        } catch (e) {
          console.warn("Failed to check customizer limit:", e);
          setIsLimitExceeded(false);
          return false;
        }
      };

      const limitExceeded = checkLimit();

      setMessages([
        {
          id: "initial-msg",
          sender: "bot",
          text: limitExceeded
            ? "Today limit crossed. You have used your 5 free customizations for today. Please try again tomorrow! 🔒"
            : `Hello! I am your AI Prompt Consultant. Let's customize your prompt: **${prompt.title}**.\n\nFirst, let me analyze this prompt to see what details we can optimize for you...`,
        },
      ]);
      setCompiledText(null);
      setIsComplete(false);
      setUserText("");
      setIsCopied(false);

      if (!limitExceeded) {
        // Trigger initial analysis call
        const timer = setTimeout(() => {
          getAIResponse([], "");
        }, 800);

        return () => clearTimeout(timer);
      }
    }
  }, [prompt, isOpen]);

  // Scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  if (!isOpen || !prompt) return null;

  // Retrieve response from the Gemini AI endpoint
  const getAIResponse = async (history: Message[], latestAnswer: string, forceSkip: boolean = false) => {
    if (!prompt) return;
    setIsThinking(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          template: prompt.template,
          title: prompt.title,
          messages: history,
          latestAnswer,
          skipAndGenerate: forceSkip,
        }),
      });

      const responseData = await res.json();
      if (responseData.success && responseData.data) {
        const { isComplete: aiComplete, message, customizedPrompt } = responseData.data;

        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: "bot",
            text: message,
          },
        ]);

        if (aiComplete) {
          setIsComplete(true);
          setCompiledText(customizedPrompt);

          // Increment customization daily limit
          try {
            const today = new Date().toDateString();
            const dataStr = localStorage.getItem("mk_customizer_limit");
            let count = 1;
            if (dataStr) {
              const data = JSON.parse(dataStr);
              if (data.date === today) {
                count = data.count + 1;
              }
            }
            localStorage.setItem("mk_customizer_limit", JSON.stringify({ date: today, count }));
          } catch (e) {
            console.warn("Failed to increment customizer count:", e);
          }
        }
      } else {
        throw new Error(responseData.message || "Failed to get AI consultant response");
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: "bot",
          text: "I encountered a connection error. Please try sending your reply again or click 'Skip & Generate' to compile.",
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  // Handle user send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userText.trim() || isThinking || isComplete) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: userText.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentAnswer = userText.trim();
    setUserText("");

    // Trigger API fetch with updated history (including user message)
    getAIResponse([...messages, userMessage], currentAnswer);
  };

  // Skip step-by-step questions and compile prompt immediately
  const handleSkipAndGenerate = () => {
    if (isThinking || isComplete) return;

    const userMessage: Message = {
      id: `user-skip-${Date.now()}`,
      sender: "user",
      text: "Please skip remaining questions and generate the prompt now.",
    };

    setMessages((prev) => [...prev, userMessage]);

    getAIResponse([...messages, userMessage], "", true);
  };

  // Reset the consultation and start the questions over
  const handleRestart = () => {
    if (!prompt) return;

    // Check limit
    try {
      const today = new Date().toDateString();
      const dataStr = localStorage.getItem("mk_customizer_limit");
      if (dataStr) {
        const data = JSON.parse(dataStr);
        if (data.date === today && data.count >= 5) {
          setIsLimitExceeded(true);
          setMessages([
            {
              id: "initial-msg",
              sender: "bot",
              text: "Today limit crossed. You have used your 5 free customizations for today. Please try again tomorrow! 🔒",
            },
          ]);
          return;
        }
      }
    } catch (e) {
      console.warn("Failed to check customizer limit on restart:", e);
    }

    setIsLimitExceeded(false);
    setMessages([
      {
        id: "initial-msg",
        sender: "bot",
        text: `Hello! I am your AI Prompt Consultant. Let's customize your prompt: **${prompt.title}**.\n\nFirst, let me analyze this prompt to see what details we can optimize for you...`,
      },
    ]);
    setCompiledText(null);
    setIsComplete(false);
    setUserText("");
    setIsCopied(false);

    // Trigger initial analysis call
    setTimeout(() => {
      getAIResponse([], "");
    }, 800);
  };

  // Retry the last step in the consultation
  const handleRetry = () => {
    if (isThinking || !prompt) return;

    // Find the index of the last user message
    let lastUserMsgIdx = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].sender === "user") {
        lastUserMsgIdx = i;
        break;
      }
    }

    if (lastUserMsgIdx !== -1) {
      // History is all messages before that user message
      const history = messages.slice(0, lastUserMsgIdx);
      const userMessage = messages[lastUserMsgIdx];

      // Reset state for generation
      setIsComplete(false);
      setCompiledText(null);
      
      // Roll back messages to only show up to this user message
      setMessages([...history, userMessage]);

      // Call API again
      getAIResponse([...history, userMessage], userMessage.text);
    } else {
      // If no user messages yet, restart the session
      handleRestart();
    }
  };

  const handleCopyClick = () => {
    if (compiledText) {
      onCopy(compiledText);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
        onClose();
      }, 800);
    }
  };

  const renderPromptOutput = () => {
    if (isComplete && compiledText) {
      return (
        <div className="relative bg-slate-50/50 border border-emerald-250/60 rounded-3xl p-6 font-mono text-xs sm:text-sm text-slate-800 leading-relaxed select-all overflow-y-auto flex-1 animate-in fade-in duration-300">
          <span className="absolute top-2.5 right-3 bg-emerald-100/90 text-emerald-700 border border-emerald-200 text-[9px] font-bold px-2 py-0.5 rounded-full select-none">
            AI Customized
          </span>
          <div className="whitespace-pre-wrap">{compiledText}</div>
        </div>
      );
    }

    return (
      <div className="relative bg-slate-50/50 border border-slate-200/60 rounded-3xl p-6 font-mono text-xs sm:text-sm text-slate-400 leading-relaxed overflow-y-auto flex-1 flex flex-col items-center justify-center text-center">
        <Bot className="w-8 h-8 text-slate-300 mb-3 animate-pulse" />
        <span className="font-bold text-slate-500 mb-1">Consultation in Progress</span>
        <p className="max-w-[280px] text-[10px] text-slate-405 leading-normal">
          Answer the consultant's questions in the chat to personalize this prompt. The finalized prompt will compile here.
        </p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-5xl bg-white rounded-3xl border border-slate-200/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] md:max-h-[95vh] md:h-[80vh] z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-250 border border-slate-200/60 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors duration-150 cursor-pointer z-30"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Scrollable Container Wrapper for mobile view */}
        <div className="flex-1 overflow-y-auto md:overflow-hidden flex flex-col md:flex-row w-full h-full">
          {/* LEFT COLUMN: Chatbot Assistant */}
          <div className="w-full md:w-[55%] flex flex-col border-b md:border-b-0 md:border-r border-slate-200/60 h-auto md:h-full bg-slate-50/50">
            {/* Assistant Header */}
            <div className="px-6 py-4 bg-white border-b border-slate-200/60 flex items-center justify-between gap-2.5 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                  <Bot className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 leading-none">
                    MR.MKOFFICIAL AI Consultant
                  </h3>
                  <span className="text-[10px] font-semibold text-emerald-500 flex items-center gap-1 mt-0.5 select-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active Interview Flow
                  </span>
                </div>
              </div>

              {/* Reset/Retry Buttons */}
              <div className="flex items-center gap-1.5">
                {messages.length > 1 && (
                  <button
                    type="button"
                    onClick={handleRetry}
                    disabled={isThinking}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-lg text-slate-650 font-bold text-[10px] uppercase cursor-pointer transition-colors disabled:opacity-50"
                    title="Retry Last Step"
                  >
                    Retry
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleRestart}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-lg text-slate-650 font-bold text-[10px] uppercase cursor-pointer transition-colors"
                  title="Restart Chat"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Chat Stream Log */}
            <div className="p-6 space-y-4 flex-1 overflow-y-auto min-h-[300px] md:min-h-0">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-[85%] ${
                    msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                  }`}
                >
                  {msg.sender === "bot" && (
                    <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center shrink-0 shadow-inner">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-slate-900 text-white rounded-tr-none"
                        : msg.id.includes("err")
                        ? "bg-rose-50 border border-rose-200 text-rose-700 shadow-sm rounded-tl-none"
                        : "bg-white border border-slate-200/50 text-slate-700 shadow-sm rounded-tl-none whitespace-pre-line"
                    }`}
                  >
                    <div>{msg.text}</div>
                    {msg.id.includes("err") && (
                      <button
                        type="button"
                        onClick={handleRetry}
                        disabled={isThinking}
                        className="mt-2.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[10px] rounded-lg cursor-pointer transition-colors flex items-center gap-1 select-none disabled:opacity-50"
                      >
                        🔄 Retry Connection
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {isThinking && (
                <div className="flex gap-3 max-w-[85%] mr-auto">
                  <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center shrink-0 shadow-inner">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200/50 text-slate-700 shadow-sm rounded-tl-none flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* User Message Input Form Panel */}
            <form onSubmit={handleSendMessage} className="bg-white border-t border-slate-200/60 p-6 shrink-0 flex flex-col gap-3">
              {isLimitExceeded ? (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 animate-in fade-in duration-300">
                  <span className="text-orange-600 font-extrabold text-xs">Today limit crossed 🔒</span>
                  <p className="text-[10px] text-slate-500 leading-normal max-w-[280px]">
                    You have used your 5 free AI prompt customizations for today. Please try again tomorrow!
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={userText}
                      onChange={(e) => setUserText(e.target.value)}
                      disabled={isThinking || isComplete}
                      placeholder={
                        isComplete
                          ? "Conversation complete!"
                          : isThinking
                          ? "Consultant is thinking..."
                          : "Type your response here..."
                      }
                      className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200/70 rounded-xl text-slate-800 text-xs font-medium focus:outline-none focus:bg-white focus:border-orange-500 transition-all duration-200"
                    />
                    <button
                      type="submit"
                      disabled={isThinking || isComplete || !userText.trim()}
                      className="px-5 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-850 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer active:scale-95"
                    >
                      Send
                    </button>
                  </div>

                  {!isComplete && (
                    <div className="flex items-center justify-between mt-1">
                      <button
                        type="button"
                        onClick={handleSkipAndGenerate}
                        disabled={isThinking}
                        className="text-[10px] font-bold text-orange-500 hover:text-orange-650 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        ⚡ Skip & Generate Prompt
                      </button>
                    </div>
                  )}
                </>
              )}
            </form>
          </div>

          {/* RIGHT COLUMN: Interactive Live Prompt Visualizer */}
          <div className="w-full md:w-[45%] flex flex-col h-auto md:h-full bg-white">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200/60 flex items-center justify-between shrink-0">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                Live Customized Prompt
              </span>
            </div>

            {/* Compiled Output Viewport */}
            <div className="p-6 sm:p-8 flex flex-col justify-between h-auto md:h-full md:flex-1">
              {renderPromptOutput()}

              {/* Custom copy panel */}
              <div className="mt-6 pt-4 border-t border-slate-100 shrink-0 space-y-2">
                <button
                  onClick={handleCopyClick}
                  disabled={!isComplete || isCopied}
                  className={`w-full flex items-center justify-center gap-2 px-5 py-4 font-bold text-sm rounded-2xl transition-all duration-300 cursor-pointer shadow-sm ${
                    isCopied
                      ? "bg-emerald-500 text-white"
                      : isComplete
                      ? "bg-slate-900 hover:bg-slate-805 text-white active:scale-[0.98] hover:shadow-slate-900/10"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied to Clipboard!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-orange-500 animate-bounce" />
                      Copy Compiled Prompt
                    </>
                  )}
                </button>
                {isComplete && (
                  <button
                    type="button"
                    onClick={handleRetry}
                    disabled={isThinking}
                    className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-655 font-bold text-xs rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50"
                  >
                    🔄 Regenerate / Retry Prompt
                  </button>
                )}
                <p className="text-[10px] text-slate-400 font-medium text-center mt-1">
                  Copying will trigger visitor metrics and follow-up popup.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
