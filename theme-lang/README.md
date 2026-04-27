# theme-lang 學習筆記

## 1. React Context API

### 解決什麼問題？

沒有 Context 時，若多個深層元件都需要同一份資料（如 `theme`），必須一層一層透過 props 傳下去 — 這叫 **props drilling**。Context 讓任意深度的子元件都能直接訂閱資料，不需要中間層轉手。

### 三個核心 API

| API | 作用 |
|-----|------|
| `createContext(initialValue)` | 建立一個「資料容器」，初始值通常給 `null`（表示尚無 Provider） |
| `<Context.Provider value={...}>` | 向下廣播資料；所有被它包住的子元件都能讀到 `value` |
| `useContext(Context)` | 在子元件裡訂閱 Context 的當前值；值改變時該元件自動重新渲染 |

### 本專案的實作結構

```
App
├── ThemeProvider   ← 持有 theme state，透過 Context 廣播
│   └── LangProvider  ← 持有 lang state，透過 Context 廣播
│       └── DemoCard  ← 消費 theme + lang（不需要任何 props）
│           ├── ThemeToggle  ← 消費 theme + toggleTheme
│           └── LangSelect   ← 消費 lang + setLang
```

### createContext 初始值為 null

```tsx
const ThemeContext = createContext<ThemeContextValue | null>(null);
```

初始值設 `null` 而非假資料，是為了在元件被「錯誤地放在 Provider 外部」時能夠確實報錯，而不是靜默地拿到預設值。

---

## 2. 自訂 Context Hook（custom hook + null guard）

直接呼叫 `useContext(ThemeContext)` 有兩個問題：
1. 每個用到的地方都要 import Context 物件，耦合度高
2. TypeScript 拿到的型別是 `ThemeContextValue | null`，每次都要自己做 null check

解法是包一層自訂 Hook：

```tsx
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
```

**好處：**
- 呼叫端只需 `import { useTheme }`，不需要知道 Context 物件的存在
- 回傳型別已縮窄為 `ThemeContextValue`（去掉了 `null`），呼叫端無需再做 null check
- 開發時誤用（忘記包 Provider）會立刻得到清楚的錯誤訊息

---

## 3. useState 的 Lazy Initializer

`useState` 的初始值如果需要從外部資源讀取（如 `localStorage`），不要這樣寫：

```tsx
// ❌ 每次 render 都執行 localStorage.getItem，但只有首次有用
const [theme, setTheme] = useState(localStorage.getItem('theme') ?? 'light');
```

應改成傳入**初始化函式**（lazy initializer）：

```tsx
// ✅ 函式只在元件首次掛載時執行一次
const [theme, setTheme] = useState<Theme>(() => {
  return (localStorage.getItem('theme') as Theme) ?? 'light';
});
```

傳函式 vs 傳值的差異：React 看到「括號裡是一個函式」時，只會在首次 render 呼叫它取得初始值；之後 re-render 會直接略過，不再執行。

---

## 4. useEffect 同步 DOM 狀態

本專案的 `useEffect` 用途和 `realtime-gold` 不同，這裡是用來**把 React state 同步到 DOM**：

```tsx
useEffect(() => {
  const root = document.documentElement; // <html> 元素
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  localStorage.setItem('theme', theme);
}, [theme]); // theme 改變時才執行
```

React 管理的是 Virtual DOM，`<html>` 標籤本身不在任何元件的 JSX 裡。要修改它只能透過 `useEffect` 直接操作真實 DOM（`document.documentElement`）。

---

## 5. Tailwind CSS Dark Mode（class 策略）

Tailwind 的深色模式有兩種策略：`media`（跟隨系統）和 `class`（手動控制）。本專案用 `class` 策略：只要 `<html>` 元素有 `.dark` class，所有 `dark:` 前綴的樣式就會生效。

```html
<!-- 淺色模式 -->
<html>...</html>

<!-- 深色模式 -->
<html class="dark">...</html>
```

```tsx
// 元件裡同時寫淺色 / 深色樣式，Tailwind 依 <html class> 決定哪個生效
<div className="bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
```

`transition-colors duration-300` 讓切換主題時顏色平滑漸變而非瞬間跳換。

---

## 6. 靜態 i18n 字典模式

本專案用純物件實作多語系，不依賴任何第三方 i18n 套件：

```tsx
const i18n = {
  zh: { welcome: '歡迎光臨', ... },
  ja: { welcome: 'ようこそ', ... },
  en: { welcome: 'Welcome', ... },
};

// 在元件裡：
const t = i18n[lang]; // 取出當前語系的所有字串
// 使用：{t.welcome}
```

**優點：** 零依賴，TypeScript 可完整推導型別，字串存取若拼錯 key 編譯期就會報錯。  
**侷限：** 字串全部 bundle 進前端；語系文件多或需要動態載入時才考慮 `react-i18next` 等套件。

---

## 7. 無障礙切換按鈕（role="switch"）

Toggle 按鈕在語意上是「開關」而非普通按鈕，應使用 `role="switch"` 讓螢幕閱讀器正確播報狀態：

```tsx
<button
  role="switch"
  aria-checked={isDark}       // true / false，讓輔助技術知道目前狀態
  aria-label="Toggle dark mode"
>
```

`aria-checked` 會隨 `isDark` 自動更新，不需要額外處理。
