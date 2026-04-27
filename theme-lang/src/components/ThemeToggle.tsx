import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle dark mode"
      className={`
        relative inline-flex h-7 w-14 items-center rounded-full
        transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        ${isDark
          ? 'bg-indigo-600 focus-visible:ring-indigo-500'
          : 'bg-gray-300 focus-visible:ring-gray-400'}
      `}
    >
      {/* thumb */}
      <span
        className={`
          inline-block h-5 w-5 transform rounded-full bg-white shadow-md
          transition-transform duration-300
          ${isDark ? 'translate-x-7' : 'translate-x-1'}
        `}
      />
    </button>
  );
}
