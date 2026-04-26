# Users Manage — 學習筆記

## 1. 為什麼要另外開 `store.ts`？

`store.ts` 是一個 **Repository / Data Access Layer**，負責封裝所有 localStorage 的讀寫邏輯，讓頁面元件只需要呼叫 `getUsers()`、`addUser()` 等函式，不需要自己操作 `localStorage`。

| 類比對象           | 說明                                                                     |
| ------------------ | ------------------------------------------------------------------------ |
| Angular Service    | 最接近。封裝資料存取邏輯，由元件呼叫（pull 模型）                        |
| Angular NgRx Store | **不同概念**。NgRx 是 reactive push 模型，state 變化會自動通知所有訂閱者 |

這份 `store.ts` 沒有響應式（reactive）能力，元件必須主動呼叫 `setUsers(getUsers())` 才能同步畫面，因此更接近 Angular Service。

---

## 2. React 狀態管理怎麼處理？

依需求從輕到重選擇：

| 層級       | 工具                        | 適用情境                        |
| ---------- | --------------------------- | ------------------------------- |
| 元件內部   | `useState`                  | 單一元件的本地狀態              |
| 跨層傳遞   | `useContext` + `useReducer` | 中小型 App，避免 props drilling |
| 輕量全局   | **Zustand**（目前業界主流） | 中大型 App，跨元件共享狀態      |
| 大型企業   | Redux Toolkit               | 複雜狀態、嚴格規範需求          |
| 伺服器狀態 | React Query / SWR           | API 資料快取、同步、refetch     |

---

## 3. `useCallback` 什麼時候該用？

### 核心問題

React 每次 render 都會重新建立函式，新函式 !== 舊函式（referential equality）。

若把一個「每次 render 都不同的函式」放入 `useEffect` 的 deps 陣列，每次 render 就會觸發 effect，造成無限迴圈。

### 解法：`useCallback`

```ts
const load = useCallback(() => setUsers(getUsers()), []);
useEffect(() => {
  load();
}, [load]);
```

`useCallback` 讓 `load` 的參考在 deps 沒變的情況下保持穩定，`useEffect` 只在 `load` 真正改變時才重新執行。

### 什麼時候需要 `useCallback`？

**當同一個函式同時滿足以下兩個條件時：**

1. 需要被抽出來**共用**（如：同時在 `useEffect` 和事件處理中使用）
2. 這個函式需要放入 **`useEffect` 的 deps 陣列**

只要函式沒有被放入 `useEffect` deps，就不需要 `useCallback`。

### 三種等效寫法比較

```ts
// 寫法 A：useCallback（推薦，ESLint 無警告）
const load = useCallback(() => setUsers(getUsers()), []);
useEffect(() => {
  load();
}, [load]);

function handleDelete(id: string) {
  deleteUser(id);
  load();
}
```

```ts
// 寫法 B：內聯，不抽共用函式（ESLint 無警告）
useEffect(() => {
  setUsers(getUsers());
}, []);

function handleDelete(id: string) {
  deleteUser(id);
  setUsers(getUsers());
}
```

```ts
// 寫法 C：一般函式 + [] deps（功能正確，但 ESLint 會警告）
const load = () => setUsers(getUsers());
useEffect(() => {
  load();
}, []); // ⚠️ exhaustive-deps warning

function handleDelete(id: string) {
  deleteUser(id);
  load();
}
```

寫法 C 功能上不會有 bug（`getUsers()` 每次從 localStorage 讀最新資料，`setUsers` 是穩定的），但違反 ESLint 規則，建議避免。

---

## 4. `useCallback` 的 deps vs `useEffect` 的 deps

兩個 deps 陣列是**不同概念**，不要混淆：

|                           | deps 陣列的意思                              |
| ------------------------- | -------------------------------------------- |
| `useCallback(fn, [deps])` | 當 deps 改變時，重新建立函式（更新函式參考） |
| `useEffect(fn, [deps])`   | 當 deps 改變時，重新執行 side effect         |

---

## 5. React Router 路由設計

### 基本設定

```tsx
// App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

<BrowserRouter>
  <Routes>
    <Route path="/" element={<Navigate to="/list" replace />} />
    <Route path="/list" element={<List />} />
    <Route path="/user/:mode" element={<Detail />} />
  </Routes>
</BrowserRouter>;
```

`<Navigate replace />` 表示重新導向時取代 history 紀錄，不會產生多餘的返回步驟。

---

### 一個元件對應多條路由

Detail 頁面有三種模式（新增、編輯、檢視），設計上有兩種做法：

**做法：動態 params 傳 mode**

```
/user/add
/user/edit?id=XXX
/user/view?id=XXX
```

Route 設定只需要一條：`/user/:mode`，由 `:mode` 動態對應到三種模式，id 仍用 query string 傳遞（因為 `add` 模式沒有 id）。

---

### React Router 取值方式

| 資料來源               | Hook                | 範例                                                                          |
| ---------------------- | ------------------- | ----------------------------------------------------------------------------- |
| 動態路由參數 `:mode`   | `useParams()`       | `const { mode } = useParams<{ mode: DetailMode }>()`                          |
| Query string `?id=XXX` | `useSearchParams()` | `const [searchParams] = useSearchParams(); const id = searchParams.get('id')` |
| 程式導航               | `useNavigate()`     | `navigate('/list')` / `navigate(-1)`                                          |

---

### 和 Angular 路由的對比

|                 | Angular                                                | React Router                               |
| --------------- | ------------------------------------------------------ | ------------------------------------------ |
| 動態 params     | `/user/:mode`                                          | `/user/:mode`（語法相同）                  |
| 取 params       | `ActivatedRoute.snapshot.paramMap.get('mode')`         | `useParams()`                              |
| 取 query string | `ActivatedRoute.snapshot.queryParamMap.get('id')`      | `useSearchParams()`                        |
| 導航            | `Router.navigate(['/list'])`                           | `useNavigate()` 回傳的 `navigate('/list')` |
| 預設重新導向    | `{ path: '', redirectTo: '/list', pathMatch: 'full' }` | `<Navigate to="/list" replace />`          |

---

### snapshot vs reactive：Angular 的坑，React 沒有

Angular 的 `snapshot` 只在 component 初始化時讀一次。當你從 `/users/1` 導航到 `/users/2`，Angular 會盡量重用同一個 component 實例（不卸載重掛），snapshot 就過期了，需要改用 `subscribe`：

```typescript
// ❌ snapshot — 元件重用時不更新
const id = this.route.snapshot.paramMap.get('id');

// ✅ subscribe — 持續監聽路由變化
this.route.paramMap.subscribe(params => {
  const id = params.get('id');
});
```

React 的 `useParams` / `useSearchParams` 是 hook，天生 reactive：路由變化 → context value 改變 → component 自動 re-render → 直接拿到新值，不需要 subscribe，也不需要 unsubscribe。

```tsx
function UserDetail() {
  const { id } = useParams();         // 自動跟著 URL 更新
  const [params] = useSearchParams(); // 同上
}
```

唯一要注意：在 `useEffect` 裡用 params 做 API call，必須把 params 放進 deps 陣列，否則只跑一次（等同 snapshot 的問題）：

```tsx
useEffect(() => {
  fetchUser(id);
}, [id]); // ← 缺少會變成只執行一次
```
