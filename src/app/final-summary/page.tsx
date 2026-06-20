import Link from "next/link";
import { PageShell } from "@/components/PageShell";

type SimulatorProof = {
  page: string;
  href: string;
  number: string;
  interaction: string;
  concepts: string[];
  proof: string;
  matters: string;
  discussion: string;
};

const simulatorProofs: SimulatorProof[] = [
  {
    page: "Home",
    href: "/",
    number: "01",
    interaction:
      "The user follows the change from one local program to multiple connected services and servers.",
    concepts: [
      "Multiple services",
      "Latency",
      "Partial failure",
      "Network congestion",
    ],
    proof:
      "Splitting work across services introduces communication delay, unequal server speeds, congestion, and failures that can affect only part of the system.",
    matters:
      "It establishes the central trade-off: distribution enables scale and separation, but coordination across a network has a cost.",
    discussion:
      "The Home page proves that a distributed system is defined not just by multiple servers, but by the communication and failure conditions between them.",
  },
  {
    page: "RMI Simulator",
    href: "/rmi-simulator",
    number: "02",
    interaction:
      "The user compares local and remote calls, performs registry lookup, observes serialization, and tests pass-by-value and Remote object references.",
    concepts: [
      "Remote Method Invocation",
      "Stub",
      "Registry / Service Discovery",
      "Serialization",
    ],
    proof:
      "A local-like method call crosses a Stub, Registry, and network boundary; ordinary data is copied by value while Remote objects are represented by references.",
    matters:
      "RMI simplifies remote communication for the programmer while latency and partial failure still remain part of the operation.",
    discussion:
      "This simulator shows that RMI hides the mechanics of a remote call, but it cannot remove network cost or remote failure.",
  },
  {
    page: "Load Balancer Simulator",
    href: "/load-balancer",
    number: "03",
    interaction:
      "The user sends traffic, switches routing algorithms, changes server health, and compares request distribution across servers with different capacity and speed.",
    concepts: [
      "Traffic Distribution",
      "Health Monitoring",
      "High Availability",
      "Scalability",
    ],
    proof:
      "Routing decisions change with Round Robin, Greedy, Power of Two Choices, health checks, connection count, response time, weights, keys, sessions, and resource usage.",
    matters:
      "A load balancer prevents one server from receiving all work and can keep traffic away from unhealthy or unsuitable servers.",
    discussion:
      "The load balancer proves that routing policy directly affects fairness, response time, scalability, and availability.",
  },
  {
    page: "RPC vs Message Passing",
    href: "/rpc-vs-message-passing",
    number: "04",
    interaction:
      "The user runs a synchronous RPC request and then sends messages through a Producer, Queue, and Consumer, including while the consumer is stopped.",
    concepts: [
      "Synchronous RPC",
      "Producer",
      "Queue / Broker",
      "Service decoupling",
    ],
    proof:
      "RPC makes the caller wait for a direct response, while Message Passing stores work in a queue so production and consumption can happen independently.",
    matters:
      "The communication model determines timing, coupling, and how temporary receiver unavailability affects the sender.",
    discussion:
      "This comparison proves that RPC couples services in time, while a queue decouples the Producer from the Consumer.",
  },
  {
    page: "Fault Tolerance Lab",
    href: "/fault-tolerance",
    number: "05",
    interaction:
      "The user changes service health and triggers Retry with Backoff, Circuit Breaker, Fallback, Health Check, and Heartbeat behavior.",
    concepts: [
      "Retry + Backoff",
      "Circuit Breaker",
      "Fallback",
      "Heartbeat",
    ],
    proof:
      "The system can retry temporary failure, stop harmful repeated calls, return a fallback, detect health changes, and recover without every component collapsing.",
    matters:
      "Distributed systems must provide acceptable service even when one dependency is slow, degraded, or unavailable.",
    discussion:
      "The lab proves that fault tolerance means controlling the effect of failure, not pretending failure can be eliminated.",
  },
  {
    page: "Sharding & Replication",
    href: "/sharding-replication",
    number: "06",
    interaction:
      "The user routes records with a Shard Key, compares Active and Passive Replication, and fails or recovers storage nodes.",
    concepts: [
      "Data Sharding",
      "Shard Key",
      "Active Replication",
      "Passive Replication",
    ],
    proof:
      "A key determines where data is stored, while replicated copies can keep data available or preserve acceptable service when a node fails.",
    matters:
      "Distributed storage needs both placement and redundancy to support scale, High Availability, and Fault Tolerance.",
    discussion:
      "This simulator proves that sharding distributes data, while replication protects its availability.",
  },
];

const conceptMatrix = [
  {
    concept: "Distributed Systems basics",
    where: "Home",
    simulation: "A local program is reframed as connected services with varied delay, speed, congestion, and health.",
    proof: "Distribution introduces communication cost and partial failure.",
  },
  {
    concept: "Java RMI",
    where: "RMI Simulator",
    simulation: "A call moves through Stub lookup, serialization, network delay, and remote execution.",
    proof: "Remote invocation can look local while behaving differently.",
  },
  {
    concept: "Load Balancing",
    where: "Load Balancer Simulator",
    simulation: "Requests are assigned to healthy servers by selectable routing policies.",
    proof: "Routing and health monitoring support traffic distribution, scalability, and High Availability.",
  },
  {
    concept: "RPC & Message Passing",
    where: "RPC vs Message Passing",
    simulation: "A direct waiting call is compared with Producer, Queue, and Consumer flow.",
    proof: "Queues decouple services; synchronous RPC does not.",
  },
  {
    concept: "Fault Tolerance",
    where: "Fault Tolerance Lab",
    simulation: "Failures trigger Retry + Backoff, Circuit Breaker, Fallback, Health Check, and Heartbeat states.",
    proof: "A system can remain acceptably useful during component failure.",
  },
  {
    concept: "Distributed Storage / Availability",
    where: "Sharding & Replication",
    simulation: "Shard Keys place records and Active or Passive Replication creates copies.",
    proof: "Data placement and redundancy improve scale and availability.",
  },
];

const demoFlow = [
  ["Home", "Explain why distributed systems exist."],
  ["RMI", "Show a remote call hidden behind a local-like method call."],
  ["Load Balancer", "Distribute requests across servers and change the routing decision."],
  ["RPC vs Message Passing", "Compare synchronous communication with queued communication."],
  ["Fault Tolerance", "Handle failure without total system collapse."],
  ["Sharding & Replication", "Distribute data and preserve copies for availability."],
  ["Final Summary", "Tie every observed behavior back to its course concept."],
];

const defenseQuestions = [
  {
    question: "Is this a real distributed system?",
    answer:
      "No, it is a browser-based simulator designed to demonstrate the concepts visually.",
  },
  {
    question: "Why no backend?",
    answer:
      "The project goal is concept simulation, so state, timers, and mock data are enough for the first academic version.",
  },
  {
    question: "What proves understanding?",
    answer:
      "Each page turns a lecture concept into an interactive behavior that the user can trigger and observe.",
  },
  {
    question: "What happens during failure?",
    answer:
      "The simulator shows partial failure, degraded service, fallback, and recovery behavior.",
  },
];

export default function FinalSummaryPage() {
  return (
    <PageShell
      title="Final Summary"
      subtitle="This page connects every simulator to the distributed systems concept it demonstrates."
    >
      <section className="overflow-hidden rounded-2xl border border-cyan-200 bg-gradient-to-br from-white via-cyan-50 to-sky-50 shadow-sm dark:border-cyan-800/60 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 dark:shadow-black/20">
        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-800 dark:text-cyan-200">
              Project goal
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-slate-100">
              Make distributed behavior visible and defensible
            </h2>
            <p className="mt-4 max-w-3xl leading-7 text-slate-700 dark:text-slate-300">
              This frontend educational simulator uses visual state, timers,
              mock data, and user interactions to model the decisions and
              failure conditions studied in Distributed Systems.
            </p>
            <p className="mt-3 max-w-3xl leading-7 text-slate-700 dark:text-slate-300">
              It intentionally models concepts rather than deploying real
              infrastructure, so each behavior stays controlled, repeatable,
              and easy to explain in an academic demonstration.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Metric value="6" label="Concept pages" />
            <Metric value="100%" label="Browser based" />
            <Metric value="0" label="Backend services" />
            <Metric value="1" label="Connected story" />
          </div>
        </div>
      </section>

      <section aria-labelledby="proof-cards-title">
        <SectionIntro
          eyebrow="Simulator proof cards"
          title="What does each simulator prove?"
          description="Each card connects an observable interaction to the concept it demonstrates and gives you a sentence ready for academic discussion."
          id="proof-cards-title"
        />
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {simulatorProofs.map((item) => (
            <ProofCard key={item.page} item={item} />
          ))}
        </div>
      </section>

      <section aria-labelledby="matrix-title">
        <SectionIntro
          eyebrow="Concept matrix"
          title="From course concept to observable evidence"
          description="A compact map of where each concept appears, how the browser models it, and what the result proves."
          id="matrix-title"
        />
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/20">
          <div className="hidden lg:block">
            <table className="w-full table-fixed border-collapse text-start text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-950 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-100">
                <tr>
                  <th className="w-[19%] px-4 py-3 font-bold">Concept</th>
                  <th className="w-[18%] px-4 py-3 font-bold">Where it appears</th>
                  <th className="w-[34%] px-4 py-3 font-bold">How it is simulated</th>
                  <th className="w-[29%] px-4 py-3 font-bold">What it proves</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700 dark:divide-slate-700 dark:text-slate-300">
                {conceptMatrix.map((row) => (
                  <tr key={row.concept} className="align-top">
                    <th className="px-4 py-4 font-bold leading-6 text-cyan-900 dark:text-cyan-200">
                      {row.concept}
                    </th>
                    <td className="px-4 py-4 font-semibold leading-6 text-slate-900 dark:text-slate-100">
                      {row.where}
                    </td>
                    <td className="px-4 py-4 leading-6">{row.simulation}</td>
                    <td className="px-4 py-4 leading-6">{row.proof}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-700 lg:hidden">
            {conceptMatrix.map((row) => (
              <article key={row.concept} className="min-w-0 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-800 dark:text-cyan-200">
                  {row.where}
                </p>
                <h3 className="mt-1 font-bold text-slate-950 dark:text-slate-100">{row.concept}</h3>
                <dl className="mt-4 space-y-3 text-sm leading-6">
                  <MatrixDetail label="How it is simulated" value={row.simulation} />
                  <MatrixDetail label="What it proves" value={row.proof} />
                </dl>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-5 shadow-sm dark:border-cyan-800/60 dark:bg-cyan-950/30 dark:shadow-black/20 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-800 dark:text-cyan-200">
            Recommended demo flow
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-slate-100">
            Present one connected argument
          </h2>
          <ol className="mt-5 space-y-3">
            {demoFlow.map(([page, purpose], index) => (
              <li
                key={page}
                className="flex min-w-0 gap-3 rounded-xl border border-sky-200 bg-white p-3.5 dark:border-cyan-800/60 dark:bg-slate-900/80"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-700 font-mono text-xs font-bold text-white">
                  {index + 1}
                </span>
                <p className="min-w-0 pt-1 text-sm leading-6 text-slate-700 dark:text-slate-300">
                  <strong className="text-slate-950 dark:text-slate-100">{page}:</strong> {purpose}
                </p>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/20 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-800 dark:text-cyan-200">
            Academic defense
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-slate-100">
            Short answers to likely questions
          </h2>
          <div className="mt-5 space-y-3">
            {defenseQuestions.map((item) => (
              <article
                key={item.question}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70"
              >
                <h3 className="font-bold text-slate-950 dark:text-slate-100">{item.question}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-cyan-200 bg-gradient-to-r from-cyan-50 to-white p-5 shadow-sm dark:border-cyan-800/60 dark:from-cyan-950/40 dark:to-slate-900 dark:shadow-black/20 sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-800 dark:text-cyan-200">
          Final conclusion
        </p>
        <p className="mt-3 max-w-4xl text-lg font-bold leading-8 text-slate-950 dark:text-slate-100 sm:text-xl">
          The project demonstrates that distributed systems are not only
          multiple servers, but also communication cost, routing decisions,
          failure handling, and data availability.
        </p>
      </section>
    </PageShell>
  );
}

function ProofCard({ item }: { item: SimulatorProof }) {
  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/20">
      <div className="border-b border-cyan-100 bg-gradient-to-r from-cyan-50 to-white p-5 dark:border-cyan-800/60 dark:from-slate-900 dark:to-slate-800">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-200 bg-white font-mono text-xs font-bold text-cyan-800 dark:border-cyan-800 dark:bg-cyan-950/50 dark:text-cyan-200">
            {item.number}
          </span>
          <div className="min-w-0">
            <h3 className="text-xl font-bold text-slate-950 dark:text-slate-100">{item.page}</h3>
            <Link
              href={item.href}
              className="mt-1 inline-flex text-sm font-bold text-cyan-800 underline-offset-4 hover:underline focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700 dark:text-cyan-200"
            >
              Open page <span aria-hidden="true" className="ms-1">→</span>
            </Link>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {item.concepts.map((concept) => (
            <span
              key={concept}
              className="max-w-full rounded-full border border-cyan-200 bg-white px-2.5 py-1 text-xs font-bold text-cyan-900 dark:border-cyan-800 dark:bg-cyan-950/50 dark:text-cyan-200"
            >
              {concept}
            </span>
          ))}
        </div>
      </div>
      <dl className="flex flex-1 flex-col gap-4 p-5 text-sm leading-6">
        <CardDetail label="What the user interacts with" value={item.interaction} />
        <CardDetail label="Concept proven" value={item.proof} />
        <CardDetail label="Why it matters" value={item.matters} />
        <div className="mt-auto rounded-xl border border-sky-200 bg-sky-50 p-4 dark:border-cyan-800/60 dark:bg-cyan-950/30">
          <dt className="text-xs font-bold uppercase tracking-[0.14em] text-sky-800 dark:text-cyan-200">
            Discussion sentence
          </dt>
          <dd className="mt-2 font-semibold leading-6 text-slate-900 dark:text-slate-200">
            “{item.discussion}”
          </dd>
        </div>
      </dl>
    </article>
  );
}

function SectionIntro({
  eyebrow,
  title,
  description,
  id,
}: {
  eyebrow: string;
  title: string;
  description: string;
  id: string;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-800 dark:text-cyan-200">
        {eyebrow}
      </p>
      <h2 id={id} className="mt-2 text-2xl font-bold text-slate-950 dark:text-slate-100 sm:text-3xl">
        {title}
      </h2>
      <p className="mt-3 max-w-3xl leading-7 text-slate-700 dark:text-slate-300">{description}</p>
    </div>
  );
}

function CardDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-bold text-slate-950 dark:text-slate-100">{label}</dt>
      <dd className="mt-1 text-slate-700 dark:text-slate-300">{value}</dd>
    </div>
  );
}

function MatrixDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-bold text-slate-950 dark:text-slate-100">{label}</dt>
      <dd className="mt-1 text-slate-700 dark:text-slate-300">{value}</dd>
    </div>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-cyan-200 bg-white p-4 shadow-sm dark:border-cyan-800/60 dark:bg-slate-800/70 dark:shadow-black/20">
      <p className="font-mono text-2xl font-black text-cyan-800 dark:text-cyan-200 sm:text-3xl">
        {value}
      </p>
      <p className="mt-1 text-xs font-bold leading-5 text-slate-600 dark:text-slate-400">{label}</p>
    </div>
  );
}
