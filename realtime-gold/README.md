# realtime-gold 學習筆記

## 1. useEffect 重點

### 基本結構

```tsx
useEffect(() => {
  // 副作用（side effect）邏輯

  return () => {
    // cleanup 函式：元件卸載時執行
  };
}, [/* 依賴陣列 */]);
```

### 依賴陣列（dependency array）

| 寫法 | 執行時機 |
|------|---------|
| `[]` | 只在元件**首次掛載**時執行一次 |
| `[a, b]` | 掛載後，以及 `a` 或 `b` 變動時執行 |
| 省略 | 每次 render 都執行（幾乎不用） |

本專案兩個 `useEffect` 都用 `[]`，因為計時器只需要在掛載時啟動一次：

```tsx
// useEffect 1：抓資料 + 定時刷新
useEffect(() => {
  fetchGoldPrice();                                          // 掛載後立刻抓一次
  const intervalId = setInterval(fetchGoldPrice, 10_000);   // 每 10 秒再抓
  return () => clearInterval(intervalId);                    // 卸載時清除
}, []);

// useEffect 2：倒數計時器
useEffect(() => {
  const timerId = setInterval(() => {
    setCountdown(prev => (prev <= 1 ? 10 : prev - 1));
  }, 1000);
  return () => clearInterval(timerId);
}, []);
```

### cleanup 的重要性

沒有 cleanup → 元件被移除後 `setInterval` 仍在跑 → 更新已卸載元件的 state → React 警告 + 記憶體洩漏。

---

## 2. axios 非同步呼叫

### 為什麼用 axios 而不是 fetch？

- 自動把 JSON 解析成物件（不需要 `.json()`）
- `axios.isAxiosError(err)` 可以精確判斷是 HTTP 錯誤還是網路錯誤
- 回應物件直接提供 `err.response?.status`

### 本專案的寫法

```tsx
const fetchGoldPrice = async () => {
  try {
    setError(null);

    const { data } = await axios.get(`${API_BASE}&date=${getQueryDate()}`);
    // data 就是解析好的 JSON 物件，不需要再 .json()

    const latestSum = data.data[data.data.length - 1][7];
    const prevSum   = data.data[data.data.length - 2]?.[7] ?? 0;
    const parseNum  = (v: string | number) => Number(String(v).replace(/,/g, ''));
    const newPrice  = parseNum(latestSum) - parseNum(prevSum);

    if (!newPrice) throw new Error('無法解析 API 回傳的金價資料');

    setPrices(prev => ({
      current: { price: newPrice, updatedAt: new Date() },
      prev: prev.current?.price ?? null,
    }));
  } catch (err) {
    if (axios.isAxiosError(err)) {
      // HTTP 層錯誤（4xx / 5xx / 網路斷線）
      setError(`伺服器回應錯誤：${err.response?.status ?? '網路異常'}`);
    } else {
      // 其他錯誤（型別解析、手動 throw）
      setError(err instanceof Error ? err.message : '取得資料失敗');
    }
  } finally {
    setLoading(false); // 不管成功或失敗，都關閉 loading
  }
};
```

### try / catch / finally 流程圖

```
axios.get()
  ├── 成功 → 解析資料 → setPrices
  └── 失敗 ┬── axios 錯誤 → setError（HTTP 狀態碼）
           └── 其他錯誤 → setError（錯誤訊息）
                          ↓
                    finally：setLoading(false)（永遠執行）
```

---

## 3. Stale Closure 問題與函式形式 setState

### 什麼是 stale closure？

`setInterval` 的回呼函式在**建立當下**會把周圍的變數「關」進來（closure）。  
如果 state 之後更新，setInterval 裡的函式拿到的仍是舊值 — 這就是 stale closure。

```tsx
// ❌ 有 stale closure 風險的寫法
const [count, setCount] = useState(0);

useEffect(() => {
  const id = setInterval(() => {
    setCount(count + 1); // count 永遠是 0（建立時的值）
  }, 1000);
  return () => clearInterval(id);
}, []);
```

上面的例子，`setInterval` 的回呼只記住了 `count = 0`，
所以不管跑幾秒，count 都只會變成 `0 + 1 = 1`。

### 解法：傳函式給 setState

React 的 `setState` 支援傳入**更新函式**，參數 `prev` 是執行當下最新的 state 值：

```tsx
// ✅ 正確寫法：用 prev 拿最新值
setCount(prev => prev + 1);
```

本專案兩處都用到這個技巧：

```tsx
// 倒數計時器：每秒從最新的 prev 往下減 1
setCountdown(prev => (prev <= 1 ? 10 : prev - 1));

// 金價更新：讀取目前的 prev.current 作為「上次金價」
setPrices(prev => ({
  current: { price: newPrice, updatedAt: new Date() },
  prev: prev.current?.price ?? null,
}));
```

### 記憶口訣

> 在 `setInterval` / `setTimeout` 裡更新 state，**一律用函式形式** `setState(prev => ...)` 而非直接用變數，就能避免 stale closure。
