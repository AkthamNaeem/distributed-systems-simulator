"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";
import { useLanguage } from "./LanguageProvider";

const navLinks = [
  { href: "/", label: "Home", arLabel: "الرئيسية" },
  { href: "/rmi-simulator", label: "RMI Simulator", arLabel: "محاكي RMI" },
  { href: "/load-balancer", label: "Load Balancer", arLabel: "Load Balancer" },
  { href: "/rpc-vs-message-passing", label: "RPC vs Message Passing", arLabel: "RPC مقابل Message Passing" },
  { href: "/fault-tolerance", label: "Fault Tolerance", arLabel: "تحمل الأعطال" },
  { href: "/sharding-replication", label: "Sharding & Replication", arLabel: "Sharding & Replication" },
  { href: "/final-summary", label: "Final Summary", arLabel: "الخلاصة النهائية" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { language, t } = useLanguage();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="inline-flex min-w-0 flex-col gap-0.5 self-start rounded-xl outline-none transition-colors hover:text-cyan-700 focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 dark:hover:text-cyan-200"
          >
            <span className="text-base font-bold tracking-tight text-slate-950 dark:text-slate-100 sm:text-lg">
              {t("Distributed Systems Practical Simulator")}
            </span>
          </Link>
          <div
            className="inline-flex shrink-0 items-stretch gap-1 rounded-2xl border border-slate-200 bg-slate-50/90 p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
            dir="ltr"
            role="group"
            aria-label={t("Controls")}
          >
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
        <nav aria-label={t("Primary navigation")} className="min-w-0">
          <ul className="flex flex-wrap gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`inline-flex min-h-10 items-center rounded-full border px-3.5 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 ${
                      isActive
                        ? "border-cyan-600 bg-cyan-600 text-white shadow-sm dark:border-cyan-400 dark:bg-cyan-500/20 dark:text-cyan-100 dark:shadow-none"
                        : "border-slate-200 bg-white/80 text-slate-700 hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-950 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:border-cyan-700 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                    }`}
                  >
                    {language === "ar" ? link.arLabel : link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
