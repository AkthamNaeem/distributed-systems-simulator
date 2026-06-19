"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/rmi-simulator", label: "RMI Simulator" },
  { href: "/load-balancer", label: "Load Balancer" },
  { href: "/rpc-vs-message-passing", label: "RPC vs Message Passing" },
  { href: "/fault-tolerance", label: "Fault Tolerance" },
  { href: "/sharding-replication", label: "Sharding & Replication" },
  { href: "/final-summary", label: "Final Summary" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="min-w-0 text-base font-bold tracking-normal text-slate-950 outline-none transition-colors hover:text-cyan-800 focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 dark:text-slate-100 dark:hover:text-cyan-200 sm:text-lg"
          >
            Distributed Systems Simulator
          </Link>
          <ThemeToggle />
        </div>
        <nav aria-label="Primary navigation">
          <ul className="flex flex-wrap gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`inline-flex min-h-10 items-center rounded-md border px-3 py-2 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 ${
                      isActive
                        ? "border-cyan-700 bg-cyan-700 text-white dark:border-cyan-500 dark:bg-cyan-600"
                        : "border-slate-200 bg-slate-50 hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-950 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-cyan-700 dark:hover:bg-cyan-950 dark:hover:text-cyan-100"
                    }`}
                  >
                    {link.label}
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
