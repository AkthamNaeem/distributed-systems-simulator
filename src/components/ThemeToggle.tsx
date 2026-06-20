"use client";

import { useSyncExternalStore } from "react";
import { useLanguage } from "./LanguageProvider";

type Theme = "light" | "dark";

const STORAGE_KEY = "ds-simulator-theme";

function getTheme(): Theme {
  return localStorage.getItem(STORAGE_KEY) === "dark" ? "dark" : "light";
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("themechange", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("themechange", callback);
  };
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getTheme, () => "light");
  const { t } = useLanguage();

  function selectTheme(nextTheme: Theme) {
    localStorage.setItem(STORAGE_KEY, nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    window.dispatchEvent(new Event("themechange"));
  }

  return (
    <div className="inline-flex shrink-0 items-stretch" role="group" aria-label={t("Color theme")}>
      {(["light", "dark"] as const).map((option) => {
        const selected = theme === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => selectTheme(option)}
            aria-pressed={selected}
            className={`min-h-8 rounded-full px-2.5 py-1.5 text-[11px] font-semibold transition-colors sm:px-3 sm:text-xs ${
              selected
                ? "bg-white text-cyan-700 shadow-sm dark:bg-slate-800 dark:text-cyan-200"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            }`}
          >
            {t(option === "light" ? "Light" : "Dark")}
          </button>
        );
      })}
    </div>
  );
}
