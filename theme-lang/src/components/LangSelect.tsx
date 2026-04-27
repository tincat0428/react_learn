import { useLang, Lang } from '../context/LangContext';

const options: { value: Lang; label: string }[] = [
  { value: 'zh', label: '🇹🇼 中文' },
  { value: 'ja', label: '🇯🇵 日本語' },
  { value: 'en', label: '🇺🇸 English' },
];

export default function LangSelect() {
  const { lang, setLang } = useLang();

  return (
    <select
      value={lang}
      onChange={e => setLang(e.target.value as Lang)}
      className="w-full rounded-lg border border-gray-300 dark:border-gray-600
        bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100
        px-3 py-1.5 text-sm focus:outline-none focus-visible:ring-2
        focus-visible:ring-indigo-500 transition-colors duration-300 cursor-pointer"
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
