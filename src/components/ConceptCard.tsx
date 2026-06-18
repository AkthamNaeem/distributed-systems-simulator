import Link from "next/link";

type ConceptCardProps = {
  title: string;
  explanation: string;
  href?: string;
};

export function ConceptCard({ title, explanation, href }: ConceptCardProps) {
  const content = (
    <div className="h-full rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-cyan-300">
      <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
      <p className="mt-3 leading-7 text-slate-700">{explanation}</p>
      {href ? (
        <p className="mt-4 text-sm font-semibold text-cyan-700">Open page</p>
      ) : null}
    </div>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} className="block h-full">
      {content}
    </Link>
  );
}
