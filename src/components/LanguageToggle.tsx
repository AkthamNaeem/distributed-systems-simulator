"use client";

import { useLanguage, type Language } from "./LanguageProvider";

const options: { value: Language; label: string; shortLabel: string }[] = [
  { value: "en", label: "English", shortLabel: "EN" },
  { value: "ar", label: "العربية", shortLabel: "AR" },
];

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className="inline-flex shrink-0 items-stretch"
      role="group"
      aria-label={language === "ar" ? "لغة الواجهة" : "Interface language"}
      dir="ltr"
    >
      {options.map((option) => {
        const selected = language === option.value;

        return (
          <button
            key={option.value}
            type="button"
            lang={option.value}
            onClick={() => setLanguage(option.value)}
            aria-pressed={selected}
            className={`min-h-9 rounded-xl px-3 py-2 text-xs font-semibold transition-colors sm:px-3.5 sm:text-sm ${
              selected
                ? "bg-white text-cyan-700 shadow-sm dark:bg-slate-800 dark:text-cyan-200"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            }`}
          >
            <span className="sm:hidden">{option.shortLabel}</span>
            <span className="hidden sm:inline">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
