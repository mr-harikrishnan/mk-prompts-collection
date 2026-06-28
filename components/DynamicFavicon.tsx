"use client";

import { useEffect } from "react";

export default function DynamicFavicon() {
  useEffect(() => {
    const handleFaviconTheme = () => {
      const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const img = new Image();
      img.src = "/logo.png";
      img.crossOrigin = "anonymous";
      
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        
        ctx.drawImage(img, 0, 0);
        
        if (isDarkMode) {
          // Invert colors for dark mode (makes dark elements white)
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;
          for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i];       // Red
            data[i + 1] = 255 - data[i + 1]; // Green
            data[i + 2] = 255 - data[i + 2]; // Blue
            // data[i+3] is Alpha (transparency) - keep it unchanged
          }
          ctx.putImageData(imgData, 0, 0);
        }
        
        // Find or create favicon link element
        let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
        if (!link) {
          link = document.createElement("link");
          link.rel = "shortcut icon";
          document.getElementsByTagName("head")[0].appendChild(link);
        }
        link.href = canvas.toDataURL("image/png");
      };
    };

    // Run initially
    handleFaviconTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    // Compatibility check for older browsers / safari
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleFaviconTheme);
      return () => mediaQuery.removeEventListener("change", handleFaviconTheme);
    } else {
      // @ts-ignore
      mediaQuery.addListener(handleFaviconTheme);
      return () => {
        // @ts-ignore
        mediaQuery.removeListener(handleFaviconTheme);
      };
    }
  }, []);

  return null;
}
