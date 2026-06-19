import Link from "next/link";
import { PageShell } from "@/components/PageShell";

const conceptCoverage = [
  {
    page: "Home",
    href: "/",
    action:
      "The user sees the shift from one local program to multiple services and servers.",
    concept:
      "Basic Distributed Systems motivation: latency, partial failure, different server speeds, and network congestion.",
    proof:
      "The page frames why separating one program into services introduces communication cost, timing differences, and failure cases that do not appear in a single local process.",
  },
  {
    page: "RMI Simulator",
    href: "/rmi-simulator",
    action:
      "The user runs local call, remote call, server failure, pass-by-value, and pass-by-reference demos.",
    concept:
      "RMI, Stub, Registry / Service Discovery, Serialization, RemoteException, pass-by-value, and pass-by-reference for Remote objects.",
    proof:
      "The simulation shows how a client uses a stub and registry to call remote behavior, how serialized data is copied, and how failures must be reported as remote exceptions.",
  },
  {
    page: "Load Balancer Simulator",
    href: "/load-balancer",
    action:
      "The user selects Round Robin, Greedy, Power of Two Choices, Least Connections, Least Response Time, Weighted Round Robin, Consistent Hashing, Sticky Sessions, or Resource-Aware routing and sends requests to servers.",
    concept:
      "Traffic distribution, health checks, high availability, scalability, and algorithm trade-offs.",
    proof:
      "The simulation routes requests only to healthy servers, changes distribution when algorithms change, and shows how adding or removing servers affects routing capacity.",
  },
  {
    page: "RPC vs Message Passing",
    href: "/rpc-vs-message-passing",
    action:
      "The user compares direct RPC calls with queue-based message passing.",
    concept:
      "Synchronous communication, producer, queue, consumer, and service decoupling.",
    proof:
      "The simulation contrasts immediate request/response behavior with queued work that can continue to accumulate when the consumer is stopped.",
  },
  {
    page: "Fault Tolerance Lab",
    href: "/fault-tolerance",
    action:
      "The user tests service states, retry/backoff, circuit breaker, fallback, health check, and heartbeat.",
    concept:
      "Fault tolerance manages failure and keeps acceptable service during component failure.",
    proof:
      "The simulation shows that retries, fallback responses, circuit breaking, and health signals reduce the effect of a failed dependency.",
  },
  {
    page: "Sharding & Replication",
    href: "/sharding-replication",
    action:
      "The user inserts and reads records using a shard key and tests replication or failure scenarios.",
    concept:
      "Data sharding, shard key, active replication, passive replication, high availability, and fault tolerance.",
    proof:
      "The simulation maps data to shards through a key and demonstrates how replicated copies can preserve availability when a shard or replica fails.",
  },
];

const implementationPoints = [
  "The app is built with Next.js, TypeScript, React, and Tailwind CSS.",
  "React state models the changing state of each distributed component.",
  "Controlled records make routing, storage, and replication decisions observable.",
  "Timers represent latency, waiting, backoff, and processing delays.",
  "Health states expose server availability, degradation, and failure behavior.",
];

const implementationFocus = [
  "Clear interactions reveal the sequence of each distributed operation.",
  "Observable state changes connect user actions to system behavior.",
  "Deterministic controls support repeatable demonstrations and comparison.",
  "Each simulator maps directly to approved Distributed Systems course concepts.",
  "Concept-proof sections explain the evidence produced by every simulation.",
];

const testingChecklist = [
  "Open RMI Simulator and compare local vs remote call.",
  "Open Load Balancer and send requests using different algorithms.",
  "Open RPC vs Message Passing and stop the consumer to observe queue buildup.",
  "Open Fault Tolerance and fail the Payment Service to test fallback and circuit breaker.",
  "Open Sharding & Replication and fail a shard to test replica availability.",
  "Open Final Summary and connect each simulator to its concept.",
];

export default function FinalSummaryPage() {
  return (
    <PageShell
      title="Final Summary & Documentation"
      subtitle="This page connects each interactive feature to the Distributed Systems concept it demonstrates."
    >
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-2xl font-bold text-slate-950">Project Overview</h2>
        <div className="mt-4 space-y-4 leading-8 text-slate-700">
          <p>
            Distributed Systems Practical Simulator demonstrates core
            Distributed Systems concepts through interactive simulations that
            students can inspect, test, compare, and explain during discussion.
          </p>
          <p>
            The simulations expose the behavior behind remote calls, routing
            decisions, queues, failures, retries, sharding, and replication,
            then connect each observable result to the concept it proves.
          </p>
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-slate-950">
            Concept Coverage Table
          </h2>
          <p className="mt-2 max-w-3xl leading-7 text-slate-700">
            Each implemented page is mapped to the action the user performs,
            the concept being demonstrated, and the evidence produced by the
            simulation.
          </p>
        </div>

        <div className="hidden overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:block">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-100 text-slate-950">
              <tr>
                <th className="w-[16%] px-4 py-3 font-semibold">
                  Page / Simulator
                </th>
                <th className="w-[27%] px-4 py-3 font-semibold">
                  What the user does
                </th>
                <th className="w-[27%] px-4 py-3 font-semibold">
                  Distributed Systems concept proven
                </th>
                <th className="w-[30%] px-4 py-3 font-semibold">
                  How the simulation proves it
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {conceptCoverage.map((row) => (
                <tr key={row.page} className="align-top">
                  <th className="px-4 py-4 font-semibold text-slate-950">
                    <Link
                      href={row.href}
                      className="text-cyan-800 underline-offset-4 hover:underline"
                    >
                      {row.page}
                    </Link>
                  </th>
                  <td className="px-4 py-4 leading-7">{row.action}</td>
                  <td className="px-4 py-4 leading-7">{row.concept}</td>
                  <td className="px-4 py-4 leading-7">{row.proof}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-4 lg:hidden">
          {conceptCoverage.map((row) => (
            <article
              key={row.page}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h3 className="text-lg font-bold text-slate-950">
                <Link
                  href={row.href}
                  className="text-cyan-800 underline-offset-4 hover:underline"
                >
                  {row.page}
                </Link>
              </h3>
              <dl className="mt-4 space-y-4 text-sm leading-7">
                <div>
                  <dt className="font-semibold text-slate-950">
                    What the user does
                  </dt>
                  <dd className="mt-1 text-slate-700">{row.action}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-950">
                    Distributed Systems concept proven
                  </dt>
                  <dd className="mt-1 text-slate-700">{row.concept}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-950">
                    How the simulation proves it
                  </dt>
                  <dd className="mt-1 text-slate-700">{row.proof}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <InfoListCard
          title="Implementation Style"
          items={implementationPoints}
        />
        <InfoListCard
          title="Implementation Focus"
          items={implementationFocus}
        />
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-2xl font-bold text-slate-950">
          How to explain this project in discussion
        </h2>
        <p className="mt-4 leading-8 text-slate-700">
          This project makes Distributed Systems behavior visible and
          explainable. Each simulator presents controlled interactions for
          routing, remote calls, queues, retries, failures, sharding, and
          replication, with observable evidence that supports academic
          discussion.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {conceptCoverage
            .filter((row) => row.page !== "Home")
            .map((row) => (
              <Link
                key={row.href}
                href={row.href}
                className="inline-flex min-h-10 items-center rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 transition-colors hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-950"
              >
                Open {row.page}
              </Link>
            ))}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-2xl font-bold text-slate-950">
          Quick Testing Checklist
        </h2>
        <ul className="mt-4 grid gap-3 text-slate-700 md:grid-cols-2">
          {testingChecklist.map((item) => (
            <li
              key={item}
              className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 leading-7"
            >
              <span
                aria-hidden="true"
                className="mt-1 h-5 w-5 shrink-0 rounded border border-cyan-700 bg-white"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg border border-cyan-200 bg-cyan-50 p-5 shadow-sm sm:p-6">
        <h2 className="text-2xl font-bold text-cyan-950">
          Final Proof Statement
        </h2>
        <p className="mt-4 text-lg font-semibold leading-8 text-cyan-950">
          The project proves understanding of Distributed Systems by turning
          theoretical concepts into visible, interactive simulations.
        </p>
      </section>
    </PageShell>
  );
}

function InfoListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-2xl font-bold text-slate-950">{title}</h2>
      <ul className="mt-4 space-y-3 text-slate-700">
        {items.map((item) => (
          <li key={item} className="flex gap-3 leading-7">
            <span
              aria-hidden="true"
              className="mt-3 h-2 w-2 shrink-0 rounded-full bg-cyan-700"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
