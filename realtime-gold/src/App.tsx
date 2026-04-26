import { useState, useEffect } from 'react';
import axios from 'axios';

// ─── 型別定義 ───────────────────────────────────────────────
interface GoldPrice {
  price: number;
  updatedAt: Date;
}

interface Prices {
  current: GoldPrice | null; // 目前金價
  prev: number | null;       // 上次金價（顯示漲跌）
}

// ─── 常數 ────────────────────────────────────────────────────
const REFRESH_INTERVAL = 10; // 自動刷新間隔（秒）

// 回傳查詢日期（YYYYMMDD）：週六 → 上週五，週日 → 上週五，其餘 → 今天
function getQueryDate(): string {
  const d = new Date();
  const day = d.getDay(); // 0=日, 6=六
  if (day === 6) d.setDate(d.getDate() - 1);
  else if (day === 0) d.setDate(d.getDate() - 2);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${dd}`;
}

const API_BASE = 'https://www.twse.com.tw/exchangeReport/MI_5MINS?response=json&stockNo=00636U';

// ─── 主元件 ──────────────────────────────────────────────────
function App() {
  const [prices, setPrices] = useState<Prices>({ current: null, prev: null });
  const [loading, setLoading] = useState(true);                        // 是否正在載入
  const [error, setError] = useState<string | null>(null);            // 錯誤訊息
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL);       // 倒數秒數

  // ─── 取得金價的函式 ───────────────────────────────────────
  const fetchGoldPrice = async () => {
    try {
      setError(null);

      const { data } = await axios.get(`${API_BASE}&date=${getQueryDate()}`);
      const dataList = data.data;
      const parseNum = (v: string | number) => Number(String(v).replace(/,/g, ''));
      const latestSum = dataList[dataList.length - 1][7];
      const prevSum   = dataList[dataList.length - 2]?.[7] ?? 0;
      const newPrice  = parseNum(latestSum) - parseNum(prevSum);
      if (!newPrice) throw new Error('無法解析 API 回傳的金價資料');

      // 用函式形式 setState(prev => ...)，可以從 prev 取得最新值，避免 stale closure
      setPrices(prev => ({
        current: { price: newPrice, updatedAt: new Date() },
        prev: prev.current?.price ?? null,
      }));
      setCountdown(REFRESH_INTERVAL);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(`伺服器回應錯誤：${err.response?.status ?? '網路異常'}`);
      } else {
        setError(err instanceof Error ? err.message : '取得資料失敗');
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── useEffect 1：資料抓取與定時刷新 ─────────────────────
  // 依賴陣列為空 [] → 只在元件「首次掛載」時執行一次 setup
  // setInterval 每 5 秒呼叫一次 fetchGoldPrice
  // return 的 cleanup 函式會在元件「卸載」時執行，防止記憶體洩漏
  useEffect(() => {
    fetchGoldPrice(); // 掛載後立即抓一次

    const intervalId = setInterval(fetchGoldPrice, REFRESH_INTERVAL * 1000);

    return () => clearInterval(intervalId); // ← cleanup：清除計時器
  }, []);

  // ─── useEffect 2：倒數計時器 ──────────────────────────────
  useEffect(() => {
    const timerId = setInterval(() => {
      setCountdown(prev => (prev <= 1 ? REFRESH_INTERVAL : prev - 1));
    }, 1000);

    return () => clearInterval(timerId); // ← cleanup：清除計時器
  }, []);

  // ─── 計算漲跌 ─────────────────────────────────────────────
  const { current: goldPrice, prev: prevPrice } = prices;
  const change = goldPrice && prevPrice !== null ? goldPrice.price - prevPrice : null;
  const changeText = change === null ? null : `${change > 0 ? '▲' : change < 0 ? '▼' : '─'} $${Math.abs(change).toFixed(2)}`;
  const changeColor = change === null ? '' : change > 0 ? 'text-green-400' : change < 0 ? 'text-red-400' : 'text-gray-400';

  // ─── 畫面 ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4">

        {/* 主卡片 */}
        <div className="bg-gray-800/80 border border-yellow-500/20 rounded-2xl shadow-2xl overflow-hidden">

          {/* 頂部金色裝飾線 */}
          <div className="h-1 bg-gradient-to-r from-yellow-700 via-yellow-400 to-yellow-700" />

          <div className="p-6">

            {/* 標題列 */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🥇</span>
                <div>
                  <h1 className="text-lg font-bold text-yellow-400 leading-none">黃金即時報價</h1>
                  <p className="text-gray-500 text-xs mt-0.5">XAU / USD・金衡盎司</p>
                </div>
              </div>

              {/* 狀態燈 */}
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full transition-colors ${
                  loading ? 'bg-yellow-400 animate-pulse' :
                  error    ? 'bg-red-400' :
                             'bg-green-400'
                }`} />
                <span className="text-gray-500 text-xs">
                  {loading ? '更新中' : error ? '錯誤' : '即時'}
                </span>
              </div>
            </div>

            {/* 主要內容區 */}
            {loading && !goldPrice ? (
              /* 初次載入 */
              <div className="text-center py-10">
                <div className="text-4xl animate-bounce mb-3">💰</div>
                <p className="text-gray-400 text-sm">正在取得金價...</p>
              </div>
            ) : error && !goldPrice ? (
              /* 完全失敗 */
              <div className="text-center py-10">
                <div className="text-4xl mb-3">⚠️</div>
                <p className="text-red-400 text-sm mb-4">{error}</p>
                <button
                  onClick={fetchGoldPrice}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white text-sm rounded-lg transition-colors"
                >
                  重新嘗試
                </button>
              </div>
            ) : goldPrice ? (
              /* 金價顯示 */
              <div className="text-center mb-6">
                <div className={`text-5xl font-bold text-white transition-opacity duration-300 ${loading ? 'opacity-40' : 'opacity-100'}`}>
                  ${goldPrice.price.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <p className="text-gray-500 text-sm mt-1">美元 / 金衡盎司</p>

                {/* 漲跌幅（第二次抓取後才會出現） */}
                {changeText && (
                  <p className={`text-lg font-semibold mt-2 ${changeColor}`}>
                    {changeText}
                  </p>
                )}

                {/* 更新失敗但還有舊資料時的提示 */}
                {error && (
                  <p className="text-red-400/70 text-xs mt-3">⚠️ 更新失敗，顯示上次資料</p>
                )}
              </div>
            ) : null}

            {/* 底部資訊列 */}
            <div className="border-t border-gray-700/50 pt-4 flex justify-between items-center text-xs text-gray-500">
              <span>
                {goldPrice
                  ? `${goldPrice.updatedAt.toLocaleTimeString('zh-TW')} 更新`
                  : '尚未更新'}
              </span>
              <span>{countdown}s 後自動刷新</span>
            </div>
          </div>
        </div>

        {/* 學習重點卡片 */}
        <div className="bg-gray-800/40 border border-gray-700/40 rounded-xl p-4 text-xs text-gray-500">
          <p className="font-semibold text-gray-300 mb-2">🎓 本專案學習重點</p>
          <ul className="space-y-1.5">
            <li>
              <code className="text-yellow-400/90">useState</code>
              <span className="ml-2">管理金價、載入狀態、錯誤訊息</span>
            </li>
            <li>
              <code className="text-yellow-400/90">setState(prev =&gt; ...)</code>
              <span className="ml-2">函式形式更新，可讀取最新 state 避免 stale closure</span>
            </li>
            <li>
              <code className="text-yellow-400/90">useEffect + setInterval</code>
              <span className="ml-2">每 5 秒自動呼叫 API</span>
            </li>
            <li>
              <code className="text-yellow-400/90">cleanup（return 函式）</code>
              <span className="ml-2">元件卸載時清除計時器，防止記憶體洩漏</span>
            </li>
            <li>
              <code className="text-yellow-400/90">axios + async/await</code>
              <span className="ml-2">非同步呼叫外部 REST API</span>
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
}

export default App;
