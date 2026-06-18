import Link from "next/link";

const navLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/rmi-simulator", label: "RMI Simulator" },
  { href: "/load-balancer", label: "Load Balancer" },
  { href: "/rpc-vs-message-passing", label: "RPC vs Message Passing" },
  { href: "/fault-tolerance", label: "Fault Tolerance" },
  { href: "/sharding-replication", label: "Sharding & Replication" },
  { href: "/final-summary", label: "Final Summary" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-lg font-bold tracking-normal text-slate-950"
        >
          Distributed Systems Simulator
        </Link>
        <nav aria-label="التنقل الرئيسي">
          <ul className="flex flex-wrap gap-2 text-sm font-medium text-slate-700">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-10 items-center rounded-md border border-slate-200 bg-slate-50 px-3 py-2 transition-colors hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-950"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
