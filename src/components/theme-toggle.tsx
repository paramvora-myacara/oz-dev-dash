'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

export default function ThemeToggle() {
  const [theme, setTheme] = useState(THEME_MODES.SYSTEM);
  const [mounted, setMounted] = useState(false);

  // Detect system preference
  const getSystemTheme = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches 
      ? THEME_MODES.DARK 
      : THEME_MODES.LIGHT;
  };

  // Apply theme to document
  const applyTheme = (newTheme: string) => {
    const root = document.documentElement;
    
    if (newTheme === THEME_MODES.SYSTEM) {
      const systemTheme = getSystemTheme();
      root.classList.toggle('dark', systemTheme === THEME_MODES.DARK);
    } else {
      root.classList.toggle('dark', newTheme === THEME_MODES.DARK);
    }
  };

  // Initialize theme on mount
  useEffect(() => {
    setMounted(true);
    
    // Get saved theme or default to system
    const savedTheme = localStorage.getItem('theme') || THEME_MODES.SYSTEM;
    setTheme(savedTheme);
    applyTheme(savedTheme);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (theme === THEME_MODES.SYSTEM) {
        applyTheme(THEME_MODES.SYSTEM);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [theme]);

  const cycleTheme = () => {
    const themes = [THEME_MODES.LIGHT, THEME_MODES.DARK, THEME_MODES.SYSTEM];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    applyTheme(nextTheme);
  };

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-2xl bg-black/5 dark:bg-white/5 animate-pulse" />
    );
  }

  const getIcon = () => {
    switch (theme) {
      case THEME_MODES.LIGHT:
        return <Sun className="h-5 w-5" />;
      case THEME_MODES.DARK:
        return <Moon className="h-5 w-5" />;
      case THEME_MODES.SYSTEM:
        return <Monitor className="h-5 w-5" />;
      default:
        return <Monitor className="h-5 w-5" />;
    }
  };

  const getTooltip = () => {
    switch (theme) {
      case THEME_MODES.LIGHT:
        return 'Light mode';
      case THEME_MODES.DARK:
        return 'Dark mode';
      case THEME_MODES.SYSTEM:
        return 'System theme';
      default:
        return 'System theme';
    }
  };

  return (
    <button
      onClick={cycleTheme}
      className="p-2.5 glass-card rounded-2xl text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-all hover:bg-black/10 dark:hover:bg-white/10 group bg-white/80 dark:bg-black/20 backdrop-blur-2xl border border-black/10 dark:border-white/10"
      title={getTooltip()}
    >
      {getIcon()}
    </button>
  );
} 