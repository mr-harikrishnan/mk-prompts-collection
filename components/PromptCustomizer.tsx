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
  // Key-value store for variable inputs
  const [inputs, setInputs] = useState<{ [key: string]: string }>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize variables with default values when prompt changes
  useEffect(() => {
    if (prompt) {
      const initialInputs: { [key: string]: string } = {};
      (prompt.variables || []).forEach((v) => {
        initialInputs[v.name] = v.defaultValue;
      });

      const botMsg = `Hello! I'm your MK Art Assistant. Let's customize "${prompt.title}" together. \n\nI've populated the default values for you. You can adjust the parameters in the fields below or click them to get my custom design tips!`;
      
      const timer = setTimeout(() => {
        setInputs(initialInputs);
        setMessages([
          {
            id: "msg-1",
            sender: "bot",
            text: botMsg,
          },
        ]);
        setIsCopied(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [prompt]);

  // Scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isOpen || !prompt) return null;

  // Handle inputs changing
  const handleInputChange = (varName: string, value: string) => {
    setInputs((prev) => ({
      ...prev,
      [varName]: value,
    }));
  };

  // Chat message response when user selects or focuses on a field
  const handleFieldFocus = (varName: string, label: string) => {
    if (activeField === varName) return;
    setActiveField(varName);

    // Bot suggests creative ideas based on the variable
    let tip = `Tell me what you'd like to use for the "${label}".`;
    if (varName.includes("name")) {
      tip = `For names, try using classic cinematic character names like "Arthur", "Mia", or "Clara" to invoke beautiful aesthetic features.`;
    } else if (varName.includes("location")) {
      tip = `Locations define the ambient backdrop! Try atmospheric spots like "Kyoto cherry blossom gardens", "a rainy cyberpunk street in Neo-Seoul", or "a misty Scandinavian cabin".`;
    } else if (varName.includes("atmosphere") || varName.includes("weather") || varName.includes("effect")) {
      tip = `Atmosphere sets the lighting mood! Try choices like "golden hour sunbeams", "foggy twilight with amber streetlights", or "cinematic moody volumetric neon lights".`;
    } else if (varName.includes("subject") || varName.includes("style")) {
      tip = `This defines the central artistic style or structure. Try keywords like "abstract minimalist fine line art", "mid-century modern gouache illustration", or "hyper-detailed 4k poster".`;
    } else if (varName.includes("color") || varName.includes("tone")) {
      tip = `Color palettes invoke emotional response! Select harmonious schemes like "sage green and warm oatmeal", "deep indigo with touches of sunset gold", or "monochrome slate grey with electric orange outlines".`;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: `tip-${Date.now()}`,
        sender: "bot",
        text: `🎨 Assistant Tip for ${label}: ${tip}`,
      },
    ]);
  };

  // Compile the final prompt string
  const compiledPrompt = (() => {
    let result = prompt.template;
    (prompt.variables || []).forEach((v) => {
      const val = inputs[v.name] || v.defaultValue;
      result = result.replace(`{${v.name}}`, val);
    });
    return result;
  })();

  // Render the compiled template inside JSX, highlighting variable placeholders
  const renderCompiledPreview = () => {
    const parts = prompt.template.split(/(\{.*?\})/g);
    return parts.map((part, index) => {
      // check if this part is a variable placeholder like "{boy_name}"
      if (part.startsWith("{") && part.endsWith("}")) {
        const varName = part.substring(1, part.length - 1);
        const variable = (prompt.variables || []).find((v) => v.name === varName);
        const value = inputs[varName] !== undefined ? inputs[varName] : (variable?.defaultValue || "");
        
        return (
          <span
            key={index}
            className={`inline-block px-1.5 py-0.5 rounded-md font-bold text-xs border transition-colors duration-200 ${
              inputs[varName] !== variable?.defaultValue
                ? "bg-orange-50 border-orange-200 text-orange-600 shadow-sm"
                : "bg-blue-50 border-blue-200 text-blue-600"
            }`}
          >
            {value || `[${variable?.label}]`}
          </span>
        );
      }
      return <React.Fragment key={index}>{part}</React.Fragment>;
    });
  };

  const handleCopyClick = () => {
    onCopy(compiledPrompt);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
      onClose(); // close customizer
    }, 800);
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
          {/* LEFT COLUMN: Chatbot Assistant and Input Fields Form */}
          <div className="w-full md:w-[55%] flex flex-col border-b md:border-b-0 md:border-r border-slate-200/60 h-auto md:h-full bg-slate-50/50">
            {/* Assistant Header */}
            <div className="px-6 py-4 bg-white border-b border-slate-200/60 flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                <Bot className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 leading-none">
                  MK AI Prompt Assistant
                </h3>
                <span className="text-[10px] font-semibold text-emerald-500 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active Guide
                </span>
              </div>
            </div>

            {/* Chat Stream Log */}
            <div className="p-6 space-y-4 h-auto md:flex-1 md:overflow-y-auto">
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
                        : "bg-white border border-slate-200/50 text-slate-700 shadow-sm rounded-tl-none whitespace-pre-line"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Variables Input Form Panel */}
            <div className="bg-white border-t border-slate-200/60 p-6 shrink-0 space-y-4">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Parameters & Input Settings
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(prompt.variables || []).map((variable) => (
                  <div key={variable.name} className="flex flex-col">
                    <label className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                      {variable.label}
                      {activeField === variable.name && (
                        <span className="text-[9px] font-bold text-orange-500 animate-pulse">
                          active
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={inputs[variable.name] || ""}
                      onFocus={() => handleFieldFocus(variable.name, variable.label)}
                      onChange={(e) => handleInputChange(variable.name, e.target.value)}
                      placeholder={variable.defaultValue}
                      className="px-3.5 py-2.5 bg-slate-50 border border-slate-200/70 rounded-xl text-slate-800 text-xs font-medium focus:outline-none focus:bg-white focus:border-orange-500 transition-all duration-200"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Live Prompt Visualizer */}
          <div className="w-full md:w-[45%] flex flex-col h-auto md:h-full bg-white">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200/60 flex items-center justify-between shrink-0">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                Live Compiled Prompt
              </span>
            </div>

            {/* Compiled Output Viewport */}
            <div className="p-6 sm:p-8 flex flex-col justify-between h-auto md:h-full md:flex-1">
              <div className="relative bg-slate-50/50 border border-slate-200/60 rounded-3xl p-6 font-mono text-xs sm:text-sm text-slate-800 leading-relaxed select-all min-h-[150px] md:min-h-0 overflow-y-auto md:flex-1">
                {renderCompiledPreview()}
              </div>

              {/* Custom copy panel */}
              <div className="mt-6 pt-4 border-t border-slate-100 shrink-0">
                <button
                  onClick={handleCopyClick}
                  disabled={isCopied}
                  className={`w-full flex items-center justify-center gap-2 px-5 py-4 font-bold text-sm rounded-2xl transition-all duration-300 cursor-pointer shadow-sm ${
                    isCopied
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-900 hover:bg-slate-800 text-white active:scale-[0.98] hover:shadow-slate-900/10"
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied to Clipboard!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-orange-500" />
                      Copy Compiled Prompt
                    </>
                  )}
                </button>
                <p className="text-[10px] text-slate-400 font-medium text-center mt-2.5">
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
