'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  // Check localStorage first, else default to dark
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return 'dark';  // default to dark
    }
    return 'dark';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-4 bg-zinc-300 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-200 p-2 rounded-full shadow-md transition"
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
    >
      {theme === 'dark' ? '🌞' : '🌙'}
    </button>
  );
}
