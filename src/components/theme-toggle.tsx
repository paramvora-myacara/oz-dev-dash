'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark'
};

export default function ThemeToggle() {
  const [theme, setTheme] = useState(THEME_MODES.LIGHT);
  const [mounted, setMounted] = useState(false);

  // Apply theme to document
  const applyTheme = (newTheme: string) => {
    const root = document.documentElement;
    root.classList.toggle('dark', newTheme === THEME_MODES.DARK);
  };

  // Initialize theme on mount
  useEffect(() => {
    setMounted(true);
    
    // Get saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || THEME_MODES.LIGHT;
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === THEME_MODES.DARK ? THEME_MODES.LIGHT : THEME_MODES.DARK;
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <div className="w-16 h-8 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative w-16 h-8 rounded-full bg-gray-200 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 transition-colors duration-200"
      title={theme === THEME_MODES.DARK ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="absolute inset-1 flex justify-between items-center px-1">
        <Sun className="h-4 w-4 text-yellow-500" />
        <Moon className="h-4 w-4 text-blue-400" />
      </div>
      <div 
        className={`absolute top-1 w-6 h-6 rounded-full bg-white dark:bg-gray-900 shadow-md transition-transform duration-200 ${
          theme === THEME_MODES.DARK ? 'translate-x-8' : 'translate-x-1'
        }`}
      />
    </button>
  );
} 