# React 學習重點筆記

> 根據 Todo List 專案整理，適合 React 初學者複習用

---

## 1. TypeScript Interface — 定義資料結構

```typescript
interface Todo {
  id: number;
  text: string;
  endTime: string;
  completed: boolean;
}
```

**重點：**
- `interface` 用來描述「一個物件長什麼樣子」，讓 TypeScript 幫你抓型別錯誤
- 用在 `useState<Todo[]>([])` 讓陣列裡的每個元素都有明確型別
- 也可以拿來描述表單的欄位結構（`FormValues`）

---

## 2. useState — 管理元件狀態

```typescript
const [todos, setTodos] = useState<Todo[]>([]);
const [errorToast, setErrorToast] = useState('');
```

**重點：**
- `useState` 回傳 `[目前值, 更新函式]`，習慣用解構賦值取出
- 初始值放在 `useState(初始值)` 裡
- 呼叫 `setTodos(...)` 才會觸發元件重新渲染（re-render）
- 更新時盡量用 callback 形式 `setTodos(prev => ...)` 取得最新值，避免 stale state 問題

---

## 3. 不可變更新（Immutable Update）

```typescript
// 新增：展開舊陣列，加上新項目
setTodos(prev => [...prev, { id: Date.now(), text, endTime, completed: false }]);

// 修改：用 map 產生新陣列
setTodos(prev =>
  prev.map(todo => (todo.id === id ? { ...todo, completed: !todo.completed } : todo))
);

// 刪除：用 filter 過濾掉
setTodos(prev => prev.filter(todo => todo.id !== id));
```

**重點：**
- React 的 state **不能直接改**（不能 `todos.push(...)`），要產生「全新的陣列/物件」
- `...prev`（spread）= 展開舊陣列，再加上新的
- `{ ...todo, completed: !todo.completed }` = 複製整個 todo 物件，只換 `completed` 欄位

---

## 4. 條件渲染

```tsx
// 方法 A：&& 短路運算（true 才渲染）
{errorToast && <div className="toast">{errorToast}</div>}

// 方法 B：三元運算子（有就顯示 A，沒有就顯示 B）
{todos.length === 0 ? (
  <p>還沒有待辦事項</p>
) : (
  <ul>...</ul>
)}
```

**重點：**
- JSX 裡不能直接用 `if`，要改用 `&&` 或 `? :`
- `&&` 左邊要確認是 boolean，否則 `0 && <div/>` 會渲染出 `0`
- React 無法直接渲染 boolean 值，要轉成字串：`{String(isValid)}`

---

## 5. 清單渲染 — map + key

```tsx
{todos.map(todo => (
  <li key={todo.id}>
    {todo.text}
  </li>
))}
```

**重點：**
- 渲染陣列一定要給每個元素一個唯一的 `key`
- `key` 幫助 React 辨識哪個元素變了，優化 DOM 更新效率
- 盡量用穩定的 ID（`Date.now()`），不要用 index（刪除時會亂掉）

---

## 6. 事件處理

```tsx
// onChange：checkbox 切換
<input type="checkbox" onChange={() => toggleTodo(todo.id)} />

// onClick：按鈕刪除
<button onClick={() => deleteTodo(todo.id)}>×</button>

// onSubmit：表單提交（用 react-hook-form 包裝）
<form onSubmit={handleSubmit(onSubmit)}>
```

**重點：**
- 事件 handler 寫成 arrow function `() => fn(id)`，才能傳參數進去
- 直接寫 `onClick={deleteTodo(todo.id)}` 是錯的（會在渲染時立刻執行）

---

## 7. react-hook-form — 表單管理

```typescript
const { register, handleSubmit, reset, formState: { errors, isValid } } = useForm<FormValues>({
  mode: 'onChange'  // 邊打字邊驗證
});
```

```tsx
<input
  {...register('text', {
    required: '請輸入待辦事項',
    maxLength: { value: 5, message: '待辦事項不能超過5字' }
  })}
/>
{errors.text && <p>{errors.text.message}</p>}
```

**重點：**
- `register('欄位名', 驗證規則)` 用 spread `{...register(...)}` 把屬性注入 input
- `errors.欄位名.message` 取得驗證錯誤訊息
- `isValid` 代表目前整張表單是否全部通過驗證
- `reset()` 可以在送出後清空表單
- 也可以在 `register` 裡加 `validate` 自訂驗證邏輯

---

## 8. Tailwind CSS — 動態 className

```tsx
// 依條件切換樣式
className={`border rounded-lg ${errors.text ? 'border-red-500' : 'border-gray-300'}`}

// 群組互動（group / group-hover）
<li className="group">
  <button className="opacity-0 group-hover:opacity-100">×</button>
</li>
```

**重點：**
- 用模板字串 `` ` ` `` + 三元運算子動態加 class
- `group` + `group-hover:` 是 Tailwind 的「父子互動」寫法，滑鼠移到父元素時子元素才顯示

---

## 9. Toast 通知 — setTimeout 自動消失

```typescript
const showError = (msg: string) => {
  setErrorToast(msg);
  setTimeout(() => setErrorToast(''), 3000);  // 3 秒後清掉
};
```

**重點：**
- 顯示 toast → 同時設一個 timer，時間到就清空 state
- state 清空 → 條件渲染消失，toast 就不見了

---

## 10. 日期處理

```typescript
// 驗證：輸入的時間必須在現在之後
new Date(data.endTime) <= new Date()

// 顯示：格式化成繁體中文日期
new Date(endTime).toLocaleString('zh-TW', {
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit',
})
```

**重點：**
- `new Date()` 不傳參數 = 現在時間
- `new Date(字串)` 把字串解析成 Date 物件，才能比大小
- `toLocaleString` 可以依照地區格式化輸出，不用手動組字串

---

## 專案用到的技術清單

| 技術 | 用途 |
|------|------|
| React 19 | UI 框架 |
| TypeScript | 型別安全 |
| useState | 狀態管理 |
| react-hook-form | 表單驗證與管理 |
| Tailwind CSS | 快速寫樣式 |
| Create React App | 專案腳手架 |
