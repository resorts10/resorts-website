"use client";

import { useEffect, useState, useRef } from "react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const theme = localStorage.getItem("theme") || "light";
    setIsDark(theme === "dark");
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, []);

  const toggleTheme = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isAnimating) return;
    
    const newTheme = isDark ? "light" : "dark";
    setIsAnimating(true);
    
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = `${rect.top + y}px`;
    overlay.style.left = `${rect.left + x}px`;
    overlay.style.width = "0";
    overlay.style.height = "0";
    overlay.style.borderRadius = "50%";
    overlay.style.transform = "translate(-50%, -50%)";
    overlay.style.pointerEvents = "none";
    overlay.style.zIndex = "9999";
    overlay.style.transition = "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
    
    if (newTheme === "dark") {
      overlay.style.background = "#0a0a0a";
    } else {
      overlay.style.background = "#ffffff";
    }

    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      const maxDimension = Math.max(window.innerWidth, window.innerHeight) * 2;
      overlay.style.width = `${maxDimension}px`;
      overlay.style.height = `${maxDimension}px`;
    });

    setTimeout(() => {
      setIsDark(!isDark);
      localStorage.setItem("theme", newTheme);
      document.documentElement.classList.toggle("dark", newTheme === "dark");
      
      setTimeout(() => {
        document.body.removeChild(overlay);
        setIsAnimating(false);
      }, 100);
    }, 600);
  };

  return (
    <button
      ref={buttonRef}
      onClick={toggleTheme}
      disabled={isAnimating}
      className="relative p-2.5 rounded-xl border border-gray-300/70 bg-white shadow-sm hover:bg-gray-50 transition-all duration-200 overflow-hidden group disabled:opacity-50 dark:bg-background-hover dark:border-background-hover dark:shadow-none dark:hover:bg-primary/20"
      aria-label="Toggle theme"
    >
      <div className="relative z-10">
        {isDark ? (
          <svg
            className="w-5 h-5 text-warning transition-transform duration-300 group-hover:rotate-45"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        ) : (
          <svg
            className="w-5 h-5 text-gray-900 transition-transform duration-300 group-hover:-rotate-12 dark:text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        )}
      </div>
    </button>
  );
}
