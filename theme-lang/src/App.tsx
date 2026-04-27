import { ThemeProvider, useTheme } from './context/ThemeContext';
import { LangProvider, useLang } from './context/LangContext';
import ThemeToggle from './components/ThemeToggle';
import LangSelect from './components/LangSelect';

const i18n = {
  zh: {
    welcome: '歡迎光臨',
    currentTheme: '目前主題',
    dark: '深色',
    light: '淺色',
    currentLang: '目前語系',
  },
  ja: {
    welcome: 'ようこそ',
    currentTheme: '現在のテーマ',
    dark: 'ダーク',
    light: 'ライト',
    currentLang: '現在の言語',
  },
  en: {
    welcome: 'Welcome',
    currentTheme: 'Current theme',
    dark: 'Dark',
    light: 'Light',
    currentLang: 'Current language',
  },
};

const langLabel: Record<string, string> = {
  zh: '中文',
  ja: '日本語',
  en: 'English',
};

function DemoCard() {
  const { theme } = useTheme();
  const { lang } = useLang();
  const t = i18n[lang];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-10 flex flex-col items-center gap-6 w-80 transition-colors duration-300">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {t.welcome}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t.currentTheme}：<span className="font-semibold">{theme === 'dark' ? t.dark : t.light}</span>
        </p>
        <ThemeToggle />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t.currentLang}：<span className="font-semibold">{langLabel[lang]}</span>
        </p>
        <LangSelect />
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LangProvider>
        <DemoCard />
      </LangProvider>
    </ThemeProvider>
  );
}

export default App;
