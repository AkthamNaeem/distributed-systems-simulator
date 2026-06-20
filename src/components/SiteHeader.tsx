"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";
import { useLanguage } from "./LanguageProvider";

const simulatorLinks = [
  { href: "/rmi-simulator", label: "RMI Simulator", arLabel: "محاكي RMI" },
  { href: "/load-balancer", label: "Load Balancer", arLabel: "موازن الأحمال" },
  { href: "/rpc-vs-message-passing", label: "RPC vs Message Passing", arLabel: "RPC مقابل Message Passing" },
  { href: "/fault-tolerance", label: "Fault Tolerance", arLabel: "تحمل الأعطال" },
  { href: "/sharding-replication", label: "Sharding & Replication", arLabel: "Sharding & Replication" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { language, t } = useLanguage();
  const [simulatorsOpen, setSimulatorsOpen] = useState(false);

  const simulatorRouteActive = simulatorLinks.some((link) => link.href === pathname);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-2 px-4 py-2.5 sm:px-6 sm:py-3 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-3 lg:px-8">
        <div className="flex min-w-0 items-center md:col-start-1 md:row-start-1">
          <Link
            href="/"
            onClick={() => setSimulatorsOpen(false)}
            className="inline-flex min-w-0 max-w-full items-center rounded-lg outline-none transition-colors hover:text-cyan-700 focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 dark:hover:text-cyan-200"
          >
            <span className="truncate text-sm font-bold tracking-tight text-slate-950 dark:text-slate-100 sm:text-base">
              {t("Distributed Systems Practical Simulator")}
            </span>
          </Link>
        </div>
        <nav
          aria-label={t("Primary navigation")}
          className="relative col-span-2 min-w-0 md:col-span-1 md:col-start-2 md:row-start-1 md:justify-self-center"
        >
          <ul className="flex flex-nowrap items-center justify-start gap-2 overflow-x-auto whitespace-nowrap text-sm font-medium text-slate-700 [scrollbar-width:none] dark:text-slate-300 [&::-webkit-scrollbar]:hidden md:overflow-visible">
            <li>
              <Link
                href="/"
                aria-current={pathname === "/" ? "page" : undefined}
                onClick={() => setSimulatorsOpen(false)}
                className={`inline-flex min-h-8 items-center rounded-full border px-3 py-1.5 text-xs outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 sm:text-sm ${
                  pathname === "/"
                    ? "border-cyan-600 bg-cyan-600 text-white shadow-sm dark:border-cyan-400 dark:bg-cyan-500/20 dark:text-cyan-100 dark:shadow-none"
                    : "border-slate-200 bg-white/80 text-slate-700 hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-950 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:border-cyan-700 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                }`}
              >
                {language === "ar" ? "الرئيسية" : "Home"}
              </Link>
            </li>
            <li className="static md:relative">
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={simulatorsOpen}
                onClick={() => setSimulatorsOpen((open) => !open)}
                className={`inline-flex min-h-8 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 sm:text-sm ${
                  simulatorRouteActive
                    ? "border-cyan-600 bg-cyan-600 text-white shadow-sm dark:border-cyan-400 dark:bg-cyan-500/20 dark:text-cyan-100 dark:shadow-none"
                    : "border-slate-200 bg-white/80 text-slate-700 hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-950 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:border-cyan-700 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                }`}
              >
                <span>{t("Simulators")}</span>
                <span
                  aria-hidden="true"
                  className={`text-[10px] transition-transform ${simulatorsOpen ? "rotate-180" : ""}`}
                >
                  ▼
                </span>
              </button>
              {simulatorsOpen ? (
                <div
                  role="menu"
                  aria-label={t("Simulators")}
                  className="absolute inset-x-0 top-full z-30 mt-2 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg dark:border-slate-700 dark:bg-slate-900 md:left-1/2 md:right-auto md:w-80 md:-translate-x-1/2"
                >
                  <div className="flex flex-col gap-1">
                    {simulatorLinks.map((link) => {
                      const isActive = pathname === link.href;

                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          role="menuitem"
                          aria-current={isActive ? "page" : undefined}
                          onClick={() => setSimulatorsOpen(false)}
                          className={`rounded-lg px-3 py-2 text-start text-xs outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 sm:text-sm ${
                            isActive
                              ? "bg-cyan-600 text-white dark:bg-cyan-500/20 dark:text-cyan-100"
                              : "text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                          }`}
                        >
                          {language === "ar" ? link.arLabel : link.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </li>
            <li>
              <Link
                href="/final-summary"
                aria-current={pathname === "/final-summary" ? "page" : undefined}
                onClick={() => setSimulatorsOpen(false)}
                className={`inline-flex min-h-8 items-center rounded-full border px-3 py-1.5 text-xs outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 sm:text-sm ${
                  pathname === "/final-summary"
                    ? "border-cyan-600 bg-cyan-600 text-white shadow-sm dark:border-cyan-400 dark:bg-cyan-500/20 dark:text-cyan-100 dark:shadow-none"
                    : "border-slate-200 bg-white/80 text-slate-700 hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-950 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:border-cyan-700 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                }`}
              >
                {language === "ar" ? "الخلاصة النهائية" : "Final Summary"}
              </Link>
            </li>
          </ul>
        </nav>
        <div className="col-start-2 row-start-1 flex justify-end md:col-start-3 md:justify-self-end">
          <div
            className="inline-flex shrink-0 items-stretch gap-0.5 rounded-full border border-slate-200 bg-slate-50/90 p-0.5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
            dir="ltr"
            role="group"
            aria-label={t("Controls")}
          >
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
