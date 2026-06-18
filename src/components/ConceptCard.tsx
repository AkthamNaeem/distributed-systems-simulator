import Link from "next/link";

type ConceptCardProps = {
  title: string;
  explanation: string;
  proof?: string;
  href?: string;
  linkLabel?: string;
};

export function ConceptCard({
  title,
  explanation,
  proof,
  href,
  linkLabel = "Open page",
}: ConceptCardProps) {
  const content = (
    <div className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-cyan-300">
      <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
      <p className="mt-3 leading-7 text-slate-700">{explanation}</p>
      {proof ? (
        <p className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700">
          <span className="font-semibold text-slate-950">Concept proven: </span>
          {proof}
        </p>
      ) : null}
      {href ? (
        <p className="mt-auto pt-4 text-sm font-semibold text-cyan-700">
          {linkLabel}
        </p>
      ) : null}
    </div>
  );

  if (!href) {
    return content;
  }

  return (
    <Link
      href={href}
      className="block h-full rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2"
    >
      {content}
    </Link>
  );
}
