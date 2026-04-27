import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

// Context 的資料型別：外部元件可拿到 theme 值和切換函式
interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

// 1. createContext：建立一個「全域資料倉庫」
//    初始值設 null，代表還沒有 Provider 包住時不給資料
const ThemeContext = createContext<ThemeContextValue | null>(null);

// 2. Provider 元件：把 theme 狀態「放進」Context，讓底下所有子元件都能讀到
export function ThemeProvider({ children }: { children: ReactNode }) {
  // 從 localStorage 讀取上次儲存的主題，沒有則預設 'light'
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) ?? 'light';
  });

  // theme 改變時，同步更新 <html> 的 class（Tailwind dark mode 依賴 .dark）
  // 並將新主題存進 localStorage，下次重整頁面還能記住
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  // 將 { theme, toggleTheme } 透過 Context.Provider 向下廣播給所有子元件
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 3. useContext：在任意子元件裡「訂閱」Context 的值
//    只要元件被 ThemeProvider 包住，呼叫 useTheme() 就能拿到最新的 theme 和 toggleTheme
//    當 Context 的值更新時，所有呼叫 useTheme() 的元件都會自動重新渲染
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  // 若元件不在 ThemeProvider 內部，ctx 會是 null，直接報錯提醒開發者
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
