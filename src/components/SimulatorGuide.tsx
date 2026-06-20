"use client";

import { useLanguage } from "./LanguageProvider";

export type SimulatorGuideContent = {
  howToUse: string[];
  observe: string[];
  concepts: string[];
};

type SimulatorGuideProps = {
  guide: SimulatorGuideContent;
};

const guideSections = [
  {
    key: "howToUse",
    title: "How to use this simulator",
  },
  {
    key: "observe",
    title: "What to observe",
  },
  {
    key: "concepts",
    title: "Concepts proven",
  },
] as const;

export function SimulatorGuide({ guide }: SimulatorGuideProps) {
  const { t } = useLanguage();
  return (
    <section
      aria-label={t("Simulator guide")}
      className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:grid-cols-3"
    >
      {guideSections.map((section) => (
        <article
          key={section.key}
          className="rounded-lg border border-slate-200 bg-slate-50 p-4"
        >
          <h2 className="text-sm font-bold uppercase tracking-normal text-slate-950">
            {t(section.title)}
          </h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
            {guide[section.key].map((item) => (
              <li key={item} className="flex gap-2">
                <span
                  aria-hidden="true"
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-700"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </section>
  );
}
