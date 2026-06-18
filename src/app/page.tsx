import { ConceptCard } from "@/components/ConceptCard";
import { PageShell } from "@/components/PageShell";

const simulatorLinks = [
  {
    title: "RMI Simulator",
    explanation:
      "Shows how a Client calls a method on another Server through RMI using a Stub, Registry, and Serialization.",
    href: "/rmi-simulator",
  },
  {
    title: "Load Balancer Simulator",
    explanation:
      "Introduces how requests can be distributed across multiple Servers when speeds differ or traffic increases.",
    href: "/load-balancer",
  },
  {
    title: "RPC vs Message Passing",
    explanation:
      "Compares direct RPC-style calls with Message Passing between independent services.",
    href: "/rpc-vs-message-passing",
  },
  {
    title: "Fault Tolerance Lab",
    explanation:
      "Explains partial failure and how ideas such as Circuit Breaker reduce the effect of failure.",
    href: "/fault-tolerance",
  },
  {
    title: "Sharding & Replication",
    explanation:
      "Presents the difference between Sharding data and Replication for scalability and reliability.",
    href: "/sharding-replication",
  },
  {
    title: "Final Summary",
    explanation:
      "Summarizes the concepts and connects the simulators to Distributed Systems problems found in practical systems.",
    href: "/final-summary",
  },
];

export default function Home() {
  return (
    <PageShell
      title="Distributed Systems Practical Simulator"
      subtitle="An academic educational interface that explains how a simple local program becomes a Distributed System made of multiple services and servers."
    >
      <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Project Idea</h2>
          <p className="mt-3 leading-8 text-slate-700">
            A system often starts as one local program that calls its functions
            and reads its data inside the same process. In Distributed Systems,
            those parts are separated across multiple services and Servers, so
            the effects of the network, response time, and partial failure
            become visible.
          </p>
          <p className="mt-3 leading-8 text-slate-700">
            In later phases, the simulators will demonstrate problems such as
            latency, partial failure, different server speeds, and network
            congestion. This phase only provides the page structure and
            navigation between concepts.
          </p>
        </div>

        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6">
          <h2 className="text-xl font-semibold text-emerald-950">
            Academic Goal
          </h2>
          <p className="mt-3 leading-8 text-emerald-900">
            The goal is not to build real infrastructure. It is to provide a
            simple visual learning experience that helps students discuss
            Distributed Systems concepts and understand why distributed systems
            are more complex than a local program.
          </p>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-slate-950">
          Simulator Pages
        </h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {simulatorLinks.map((item) => (
            <ConceptCard
              key={item.href}
              title={item.title}
              explanation={item.explanation}
              href={item.href}
            />
          ))}
        </div>
      </section>
    </PageShell>
  );
}
