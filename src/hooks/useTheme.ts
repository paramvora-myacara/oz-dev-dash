'use client';

import { useState, useEffect } from 'react';

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = (localStorage.getItem('theme') || 'light') as 'light' | 'dark';
    setTheme(savedTheme);
    // Apply theme using dark class (oz-dev-dash approach)
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    // Apply theme using dark class (oz-dev-dash approach)
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const resolvedTheme = theme;

  return {
    theme,
    resolvedTheme,
    toggleTheme,
    mounted,
  };
}
