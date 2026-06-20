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
    <div
      className="inline-flex shrink-0 rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800"
      aria-label={t("Color theme")}
    >
      {(["light", "dark"] as const).map((option) => {
        const selected = theme === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => selectTheme(option)}
            aria-pressed={selected}
            className={`min-h-8 rounded-md px-2.5 text-xs font-bold transition-colors sm:px-3 ${
              selected
                ? "bg-white text-slate-950 shadow-sm dark:bg-slate-700 dark:text-slate-100"
                : "text-slate-600 hover:text-cyan-800 dark:text-slate-300 dark:hover:text-cyan-200"
            }`}
          >
            <span aria-hidden="true">{option === "light" ? "☀" : "☾"}</span>{" "}
            <span className="hidden sm:inline">{t(option === "light" ? "Light" : "Dark")}</span>
          </button>
        );
      })}
    </div>
  );
}
