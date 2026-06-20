"use client";

import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import {
  SimulatorGuide,
  type SimulatorGuideContent,
} from "./SimulatorGuide";
import { useLanguage } from "./LanguageProvider";

type PageShellProps = {
  title: string;
  subtitle: string;
  guide?: SimulatorGuideContent;
  children: ReactNode;
};

export function PageShell({ title, subtitle, guide, children }: PageShellProps) {
  const { localize } = useLanguage();
  return localize(
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 text-start sm:px-6 lg:px-8">
          <section className="border-b border-slate-200 pb-6">
            <p className="text-sm font-bold uppercase tracking-normal text-cyan-800">
              Distributed Systems Practical Simulator
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl lg:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-700 sm:text-lg">
              {subtitle}
            </p>
          </section>
          {guide ? <SimulatorGuide guide={guide} /> : null}
          {children}
        </div>
      </main>
    </>,
  );
}
