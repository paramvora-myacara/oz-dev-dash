"use client";
import { useTheme } from '@/hooks/useTheme';
import { Switch } from '@headlessui/react';
import { Sun, Moon } from 'lucide-react';

const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Switch
      checked={isDark}
      onChange={toggleTheme}
      className={`${
        isDark ? 'bg-gray-700' : 'bg-gray-200'
      } relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
      aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
    >
      <span
        className={`${
          isDark ? 'translate-x-7' : 'translate-x-1'
        } inline-flex h-6 w-6 transform items-center justify-center rounded-full bg-white transition-transform`}
      >
        {isDark ? (
          <Moon size={20} className="text-gray-700" />
        ) : (
          <Sun size={20} className="text-yellow-500" />
        )}
      </span>
    </Switch>
  );
};

export default ThemeSwitcher;
