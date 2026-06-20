"use client";

import { useLanguage, type Language } from "./LanguageProvider";

const options: { value: Language; label: string; shortLabel: string }[] = [
  { value: "en", label: "English", shortLabel: "EN" },
  { value: "ar", label: "العربية", shortLabel: "AR" },
];

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="inline-flex shrink-0 rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800" aria-label={language === "ar" ? "لغة الواجهة" : "Interface language"} dir="ltr">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          lang={option.value}
          onClick={() => setLanguage(option.value)}
          aria-pressed={language === option.value}
          className={`min-h-8 rounded-md px-2.5 text-xs font-bold transition-colors sm:px-3 ${language === option.value ? "bg-white text-slate-950 shadow-sm dark:bg-slate-700 dark:text-slate-100" : "text-slate-600 hover:text-cyan-800 dark:text-slate-300 dark:hover:text-cyan-200"}`}
        >
          <span className="sm:hidden">{option.shortLabel}</span>
          <span className="hidden sm:inline">{option.label}</span>
        </button>
      ))}
    </div>
  );
}
