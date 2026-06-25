"use client";

import React, { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

interface LandingScreenProps {
  onEnter: () => void;
}

interface Star {
  id: number;
  top: string;
  left: string;
  size: string;
  delay: string;
}

export default function LandingScreen({ onEnter }: LandingScreenProps) {
  const [stars, setStars] = useState<Star[]>([]);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Generate random twinkling stars safely on client mount
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

  const handleEnterClick = () => {
    setIsFading(true);
    setTimeout(() => {
      onEnter();
    }, 600); // match transition duration
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white transition-opacity duration-500 ease-out starry-grid ${
        isFading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Starry particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white star"
            style={{
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              animationDelay: star.delay,
              boxShadow: "0 0 4px rgba(255, 255, 255, 0.8)",
            }}
          />
        ))}
      </div>

      {/* Stylized Vector World Map & flight paths */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none">
        <svg
          className="w-[85%] max-w-5xl h-auto opacity-[0.05] text-slate-300"
          viewBox="0 0 1000 500"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        >
          {/* Abstract Grid Map / Globe lines */}
          <ellipse cx="500" cy="250" rx="450" ry="220" />
          <ellipse cx="500" cy="250" rx="300" ry="220" />
          <ellipse cx="500" cy="250" rx="150" ry="220" />
          <line x1="50" y1="250" x2="950" y2="250" />
          <line x1="500" y1="30" x2="500" y2="470" />
          <path d="M 100,250 Q 500,100 900,250" />
          <path d="M 100,250 Q 500,400 900,250" />
          
          {/* Flight dotted route */}
          <path
            d="M -100 650 C 300 550, 200 150, 700 300 C 1200 450, 1000 50, 1600 -100"
            stroke="rgba(249, 115, 22, 0.3)"
            strokeWidth="2"
            strokeDasharray="6 6"
            fill="none"
          />
        </svg>

        {/* Bezier Animated Paper Airplane */}
        <div className="absolute inset-0 w-full h-full">
          <svg
            viewBox="0 0 24 24"
            className="w-8 h-8 text-orange-500 fill-orange-500/10 absolute animate-airplane"
            style={{
              transformBox: "fill-box",
              transformOrigin: "center",
            }}
          >
            {/* Minimal paper plane pointing directly to the right */}
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

      {/* Main typography content container */}
      <div className="relative z-10 flex flex-col items-center max-w-xl px-6 text-center select-none">
        <span className="text-sm font-semibold tracking-[0.3em] uppercase text-orange-500 animate-pulse mb-3">
          MK LOVE ART
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6">
          MK PROMPTS WORLD
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-md">
          A state-of-the-art interactive prompt repository. Customize parameters
          and compile premium AI art templates instantly.
        </p>

        {/* Enter Button */}
        <button
          onClick={handleEnterClick}
          className="group relative flex items-center gap-3 px-8 py-4 bg-white text-slate-950 font-semibold rounded-full hover:bg-orange-500 hover:text-white transition-all duration-300 shadow-xl hover:shadow-orange-500/20 active:scale-95 cursor-pointer overflow-hidden"
        >
          <span className="relative z-10">Enter World</span>
          <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 relative z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
      </div>

      {/* Subtle Bottom Credit */}
      <div className="absolute bottom-6 text-xs text-slate-600 tracking-wider">
        MK PROMPTS WORLD v1.0 • DESIGNED FOR VISUAL ARTISTS
      </div>
    </div>
  );
}
