import { ConceptCard } from "@/components/ConceptCard";
import { PageShell } from "@/components/PageShell";

const simulatorLinks = [
  {
    title: "RMI Simulator",
    explanation:
      "Compare a local method call with a remote call that uses a Stub, Registry, Serialization, and RemoteException handling.",
    proof:
      "A remote method call looks simple to the client but depends on service discovery, object transfer, and network failure handling.",
    href: "/rmi-simulator",
  },
  {
    title: "Load Balancer Simulator",
    explanation:
      "Send requests through different routing algorithms, fail Server B, and add or remove backend servers.",
    proof:
      "Traffic distribution, health checks, high availability, scalability, and algorithm trade-offs become visible.",
    href: "/load-balancer",
  },
  {
    title: "RPC vs Message Passing",
    explanation:
      "Send direct RPC requests, produce queued messages, stop the consumer, and observe queue buildup.",
    proof:
      "Synchronous RPC couples the caller to the service, while message passing decouples producer and consumer.",
    href: "/rpc-vs-message-passing",
  },
  {
    title: "Fault Tolerance Lab",
    explanation:
      "Set a service to healthy, slow, or failed and test retry, backoff, circuit breaker, fallback, health check, and heartbeat.",
    proof:
      "A system can continue offering acceptable service even when a dependency is degraded or failed.",
    href: "/fault-tolerance",
  },
  {
    title: "Sharding & Replication",
    explanation:
      "Insert and read records, switch replication modes, sync passive replicas, and fail shards or replicas.",
    proof:
      "Shard keys distribute data, and replicated copies improve availability during storage failures.",
    href: "/sharding-replication",
  },
  {
    title: "Final Summary",
    explanation:
      "Review the concept coverage table and connect each simulator action to its Distributed Systems proof.",
    proof:
      "The project remains frontend-only while demonstrating the approved course concepts clearly.",
    href: "/final-summary",
  },
];

const systemFlow = [
  {
    title: "1. Local program",
    text: "Functions and data live in one process, so calls are direct and failures are easier to reason about.",
  },
  {
    title: "2. Remote service",
    text: "The client reaches another service through a network boundary, so latency, serialization, and partial failure appear.",
  },
  {
    title: "3. Distributed system",
    text: "Multiple services, queues, load balancers, shards, and replicas must coordinate while some parts may be slow or failed.",
  },
];

export default function Home() {
  return (
    <PageShell
      title="Distributed Systems Practical Simulator"
      subtitle="An academic educational interface that explains how a simple local program becomes a Distributed System made of multiple services and servers."
    >
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="max-w-4xl">
          <h2 className="text-2xl font-bold text-slate-950">
            Project Purpose
          </h2>
          <p className="mt-4 leading-8 text-slate-700">
            Distributed Systems Practical Simulator is a frontend-only academic
            app that makes core Distributed Systems behavior visible in the
            browser. Each page turns one course concept into a small simulation
            that can be run, observed, and explained during a university
            discussion.
          </p>
        </div>
        <div className="mt-6 rounded-lg border border-cyan-200 bg-cyan-50 p-4">
          <p className="text-sm font-bold uppercase tracking-normal text-cyan-900">
            Important scope
          </p>
          <p className="mt-2 leading-7 text-cyan-950">
            The app does not implement real infrastructure. It uses React state,
            timers, mock records, and UI status flags to simulate RMI,
            load balancing, RPC, message queues, fault tolerance, sharding, and
            replication.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-950">
          From Local Code to Distributed Services
        </h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {systemFlow.map((item) => (
            <article
              key={item.title}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-slate-950">
                {item.title}
              </h3>
              <p className="mt-3 leading-7 text-slate-700">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold text-slate-950">
          Simulator Flow
        </h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {simulatorLinks.map((item) => (
            <ConceptCard
              key={item.href}
              title={item.title}
              explanation={item.explanation}
              proof={item.proof}
              href={item.href}
              linkLabel="Open simulator"
            />
          ))}
        </div>
      </section>
    </PageShell>
  );
}
