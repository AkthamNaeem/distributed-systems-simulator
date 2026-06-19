"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";

type RunMode = "local" | "distributed" | null;
type RunStatus = "idle" | "running" | "success" | "partial-failure";

const conceptCards = [
  {
    title: "RMI Simulator",
    proof: "A local-looking method call can cross a network boundary and fail remotely.",
    href: "/rmi-simulator",
    label: "Start simulator",
  },
  {
    title: "Load Balancer",
    proof: "Routing requests across servers improves scale and availability.",
    href: "/load-balancer",
    label: "Open page",
  },
  {
    title: "RPC vs Message Passing",
    proof: "Direct synchronous calls and queued communication create different coupling.",
    href: "/rpc-vs-message-passing",
    label: "Open page",
  },
  {
    title: "Fault Tolerance",
    proof: "Retry, circuit breaker, fallback, and heartbeat contain failures.",
    href: "/fault-tolerance",
    label: "Open lab",
  },
  {
    title: "Sharding & Replication",
    proof: "Distributing and copying data changes capacity and availability.",
    href: "/sharding-replication",
    label: "Open page",
  },
  {
    title: "Final Summary",
    proof: "Observed simulator evidence can be tied back to each lecture concept.",
    href: "/final-summary",
    label: "View evidence",
  },
];

const learningPath = [
  ["Home", "Why distribute?"],
  ["RMI Simulator", "Cross the network boundary"],
  ["Load Balancer", "Distribute requests"],
  ["RPC vs Message Passing", "Compare communication"],
  ["Fault Tolerance", "Respond to failure"],
  ["Sharding & Replication", "Distribute data"],
  ["Final Summary", "Connect evidence"],
];

const localTraits = ["One process", "One machine", "Direct calls", "Low latency", "Simple failure model"];
const distributedTraits = [
  "Multiple services",
  "Network calls",
  "Variable latency",
  "Partial failure",
  "Different server speeds",
  "Network congestion",
];

function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <path d="M4 10h11m-4-4 4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Node({
  name,
  detail,
  state = "normal",
}: {
  name: string;
  detail: string;
  state?: "normal" | "active" | "success" | "waiting" | "failed";
}) {
  const styles = {
    normal: "border-slate-200 bg-white text-slate-700",
    active: "border-cyan-400 bg-cyan-50 text-cyan-900 ring-4 ring-cyan-100",
    success: "border-emerald-300 bg-emerald-50 text-emerald-900",
    waiting: "border-amber-300 bg-amber-50 text-amber-900 ring-4 ring-amber-100",
    failed: "border-rose-300 bg-rose-50 text-rose-900 ring-4 ring-rose-100",
  };

  return (
    <div className={`min-w-0 rounded-xl border p-3 text-center shadow-sm transition-all duration-300 ${styles[state]}`}>
      <div className="mx-auto mb-2 flex size-8 items-center justify-center rounded-lg border border-current/20 bg-white/70">
        <span className={`size-2.5 rounded-full ${state === "failed" ? "bg-rose-500" : state === "waiting" ? "bg-amber-500" : state === "success" ? "bg-emerald-500" : "bg-cyan-500"}`} />
      </div>
      <p className="truncate text-sm font-bold">{name}</p>
      <p className="mt-0.5 truncate text-[11px] text-current/70">{detail}</p>
    </div>
  );
}

export default function Home() {
  const [mode, setMode] = useState<RunMode>(null);
  const [status, setStatus] = useState<RunStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [congestion, setCongestion] = useState(false);
  const [partialFailure, setPartialFailure] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (status !== "running" || !mode) return;

    timerRef.current = setInterval(() => {
      const increment = mode === "local" ? 12 : congestion ? 1.4 : 3.2;
      const timeIncrement = 100;

      setElapsed((value) => value + timeIncrement);
      setProgress((value) => {
        const next = Math.min(100, value + increment);
        const failurePoint = 69;

        if (mode === "distributed" && partialFailure && next >= failurePoint) {
          setStatus("partial-failure");
          return failurePoint;
        }

        if (next >= 100) setStatus("success");
        return next;
      });
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, mode, congestion, partialFailure]);

  const startRequest = (nextMode: Exclude<RunMode, null>) => {
    setMode(nextMode);
    setProgress(0);
    setElapsed(0);
    setStatus("running");
  };

  const reset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setMode(null);
    setStatus("idle");
    setProgress(0);
    setElapsed(0);
    setCongestion(false);
    setPartialFailure(false);
  };

  const distributedStep = Math.min(3, Math.floor(progress / 25));
  const isRunning = status === "running";
  const statusCopy =
    status === "idle"
      ? "Choose a request to compare its path."
      : status === "running" && mode === "local"
        ? "Direct function call is executing inside one process."
        : status === "running" && congestion
          ? "Packets are waiting: congestion is increasing network delay."
          : status === "running"
            ? "The request is crossing service and network boundaries."
            : status === "success"
              ? `${mode === "local" ? "Local" : "Distributed"} request completed successfully.`
              : "Service C failed. The client and earlier services are still running: this is a partial failure.";

  return (
    <>
      <SiteHeader />
      <main className="flex-1 overflow-hidden">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <section className="relative overflow-hidden rounded-2xl border border-cyan-200 bg-gradient-to-br from-white via-cyan-50 to-sky-50 p-6 shadow-sm dark:border-cyan-800/60 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 dark:shadow-black/20 sm:p-10">
            <div className="absolute -right-20 -top-24 size-64 rounded-full border-[36px] border-white/60" aria-hidden="true" />
            <div className="relative max-w-4xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-wide text-cyan-800">
                <span className="size-2 rounded-full bg-cyan-500" />
                Interactive academic learning
              </div>
              <h1 className="mt-5 max-w-3xl text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Distributed Systems Practical Simulator
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-700 sm:text-lg">
                A visual web app that turns distributed systems concepts into interactive browser simulations—so you can observe why systems distribute work and what complexity the network introduces.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/rmi-simulator" className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-cyan-800">
                  Start with RMI <ArrowIcon className="size-4" />
                </Link>
                <Link href="/final-summary" className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 shadow-sm transition hover:border-cyan-300 hover:text-cyan-800">
                  View Final Summary
                </Link>
              </div>
            </div>
          </section>

          <section aria-labelledby="why-distributed">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-wide text-cyan-700">The central question</p>
              <h2 id="why-distributed" className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Why distribute a system at all?
              </h2>
              <p className="mt-3 leading-7 text-slate-700">
                A local program is simpler, but one machine has limits. Distributed systems add services and servers so work can scale, resources can be shared, and the system can remain useful when one part fails. The cost is coordination across an uncertain network.
              </p>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Starting point</p>
                    <h3 className="mt-1 text-xl font-bold text-slate-950">Local Program</h3>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Simple path</span>
                </div>
                <div className="mt-6 grid grid-cols-[minmax(0,1fr)_32px_minmax(0,1fr)] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <Node name="Caller" detail="same process" />
                  <ArrowIcon className="size-8 text-cyan-500" />
                  <Node name="Function" detail="direct call" state="success" />
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {localTraits.map((trait) => <span key={trait} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">{trait}</span>)}
                </div>
              </article>

              <div className="flex items-center justify-center lg:w-12" aria-hidden="true">
                <div className="flex size-10 rotate-90 items-center justify-center rounded-full border border-cyan-200 bg-cyan-50 text-cyan-700 lg:rotate-0">
                  <ArrowIcon className="size-5" />
                </div>
              </div>

              <article className="rounded-2xl border border-cyan-200 bg-cyan-50/60 p-5 shadow-sm sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-cyan-700">Scaled architecture</p>
                    <h3 className="mt-1 text-xl font-bold text-slate-950">Distributed System</h3>
                  </div>
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">Complex path</span>
                </div>
                <div className="mt-6 grid grid-cols-4 gap-2 rounded-xl border border-cyan-200 bg-white/70 p-3">
                  {["Client", "Service A", "Service B", "Service C"].map((name, index) => (
                    <div key={name} className="relative min-w-0">
                      {index > 0 ? <span className="absolute -left-2.5 top-1/2 h-px w-3 bg-cyan-300" aria-hidden="true" /> : null}
                      <Node name={name} detail={index === 0 ? "request" : index === 2 ? "slower" : "server"} state={index === 2 ? "waiting" : "normal"} />
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {distributedTraits.map((trait) => <span key={trait} className="rounded-full border border-cyan-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">{trait}</span>)}
                </div>
              </article>
            </div>
          </section>

          <section aria-labelledby="mini-demo" className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5 sm:p-6">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                <div className="max-w-2xl">
                  <p className="text-sm font-bold uppercase tracking-wide text-cyan-700">Mini interactive demo</p>
                  <h2 id="mini-demo" className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">Send one request. Watch the path change.</h2>
                  <p className="mt-2 leading-7 text-slate-600">The same user intent can be a fast in-process call or a multi-step journey exposed to delay and failure.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => startRequest("local")} disabled={isRunning} className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40">Run Local Request</button>
                  <button type="button" onClick={() => startRequest("distributed")} disabled={isRunning} className="rounded-lg bg-cyan-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-40">Run Distributed Request</button>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-[280px_minmax(0,1fr)]">
              <div className="border-b border-slate-200 bg-slate-50 p-5 lg:border-b-0 lg:border-r sm:p-6">
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">Network conditions</h3>
                <div className="mt-4 space-y-3">
                  <button type="button" aria-pressed={congestion} onClick={() => setCongestion((value) => !value)} className={`flex w-full items-center justify-between gap-4 rounded-xl border p-3 text-left transition ${congestion ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-white hover:border-amber-200"}`}>
                    <span><span className="block text-sm font-bold text-slate-900">Network Congestion</span><span className="mt-0.5 block text-xs text-slate-500">Slows packets between services</span></span>
                    <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${congestion ? "bg-amber-500" : "bg-slate-300"}`}><span className={`absolute top-1 size-4 rounded-full bg-white shadow transition-all ${congestion ? "left-6" : "left-1"}`} /></span>
                  </button>
                  <button type="button" aria-pressed={partialFailure} onClick={() => setPartialFailure((value) => !value)} className={`flex w-full items-center justify-between gap-4 rounded-xl border p-3 text-left transition ${partialFailure ? "border-rose-300 bg-rose-50" : "border-slate-200 bg-white hover:border-rose-200"}`}>
                    <span><span className="block text-sm font-bold text-slate-900">Partial Failure</span><span className="mt-0.5 block text-xs text-slate-500">Service C becomes unavailable</span></span>
                    <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${partialFailure ? "bg-rose-500" : "bg-slate-300"}`}><span className={`absolute top-1 size-4 rounded-full bg-white shadow transition-all ${partialFailure ? "left-6" : "left-1"}`} /></span>
                  </button>
                </div>
                <button type="button" onClick={reset} className="mt-4 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-800">Reset</button>
                <p className="mt-4 text-xs leading-5 text-slate-500">Conditions affect distributed requests because local calls do not cross the network.</p>
              </div>

              <div className="min-w-0 p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${mode === "local" ? "bg-slate-900 text-white" : mode === "distributed" ? "bg-cyan-100 text-cyan-800" : "bg-slate-100 text-slate-600"}`}>{mode ? `${mode[0].toUpperCase()}${mode.slice(1)} mode` : "Ready"}</span>
                    {congestion ? <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">Congested</span> : null}
                    {partialFailure ? <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-800">Failure injected</span> : null}
                  </div>
                  <span className="font-mono text-xs font-semibold text-slate-500">{(elapsed / 1000).toFixed(1)}s elapsed</span>
                </div>

                <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                  <div className="relative h-2 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-label="Request progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
                    <div className={`h-full rounded-full transition-all duration-100 ${status === "partial-failure" ? "bg-rose-500" : congestion && isRunning ? "bg-amber-500" : status === "success" ? "bg-emerald-500" : "bg-cyan-500"}`} style={{ width: `${progress}%` }} />
                    {isRunning ? <span className="absolute inset-y-0 left-0 w-1/3 animate-pulse bg-white/35" /> : null}
                  </div>

                  {mode === "local" ? (
                    <div className="mt-6 grid grid-cols-[minmax(0,1fr)_40px_minmax(0,1fr)] items-center gap-2">
                      <Node name="Program" detail="caller" state={progress > 0 ? "success" : "normal"} />
                      <ArrowIcon className={`size-8 justify-self-center ${isRunning ? "animate-pulse text-cyan-600" : "text-slate-300"}`} />
                      <Node name="Function" detail="same process" state={status === "success" ? "success" : progress > 40 ? "active" : "normal"} />
                    </div>
                  ) : (
                    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {["Client", "Service A", "Service B", "Service C"].map((name, index) => {
                        const failed = status === "partial-failure" && index === 3;
                        const waiting = isRunning && congestion && index === distributedStep;
                        const nodeState = failed ? "failed" : waiting ? "waiting" : index < distributedStep || status === "success" ? "success" : index === distributedStep && isRunning ? "active" : "normal";
                        return <Node key={name} name={name} detail={index === 0 ? "request" : index === 2 ? "slow server" : "network hop"} state={nodeState} />;
                      })}
                    </div>
                  )}
                </div>

                <div aria-live="polite" className={`mt-4 rounded-xl border p-4 ${status === "partial-failure" ? "border-rose-200 bg-rose-50 text-rose-900" : status === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : isRunning && congestion ? "border-amber-200 bg-amber-50 text-amber-900" : "border-cyan-200 bg-cyan-50 text-cyan-950"}`}>
                  <p className="text-sm font-bold">{status === "partial-failure" ? "Partial failure observed" : status === "success" ? "Request complete" : isRunning ? "Request in transit" : "Simulation ready"}</p>
                  <p className="mt-1 text-sm leading-6">{statusCopy}</p>
                </div>
              </div>
            </div>
          </section>

          <section aria-labelledby="explore-simulators">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-wide text-cyan-700">Explore the system</p>
              <h2 id="explore-simulators" className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">One concept, one observable proof</h2>
              <p className="mt-3 leading-7 text-slate-600">Each simulator isolates a distributed behavior so the evidence is visible and discussable.</p>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {conceptCards.map((card, index) => (
                <article key={card.href} className="group flex min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-cyan-50 font-mono text-sm font-bold text-cyan-700">{String(index + 1).padStart(2, "0")}</span>
                    <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">Concept proof</span>
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-slate-950">{card.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{card.proof}</p>
                  <Link href={card.href} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-cyan-700 transition group-hover:text-cyan-900">{card.label}<ArrowIcon className="size-4 transition-transform group-hover:translate-x-1" /></Link>
                </article>
              ))}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <p className="text-sm font-bold uppercase tracking-wide text-cyan-700">Recommended learning path</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">Build the model in order</h2>
              <ol className="mt-6 grid gap-3 sm:grid-cols-2">
                {learningPath.map(([title, detail], index) => (
                  <li key={title} className={`flex min-w-0 items-center gap-3 rounded-xl border p-3 ${index === 0 ? "border-cyan-300 bg-cyan-50" : "border-slate-200 bg-slate-50"}`}>
                    <span className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${index === 0 ? "bg-cyan-700 text-white" : "bg-white text-slate-700 shadow-sm"}`}>{index + 1}</span>
                    <span className="min-w-0"><span className="block truncate text-sm font-bold text-slate-900">{title}</span><span className="block truncate text-xs text-slate-500">{detail}</span></span>
                  </li>
                ))}
              </ol>
            </div>

            <aside className="rounded-2xl border border-sky-200 bg-sky-50 p-5 shadow-sm sm:p-7">
              <p className="text-sm font-bold uppercase tracking-wide text-sky-700">Academic proof</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">Behavior, not static text</h2>
              <p className="mt-4 text-sm leading-7 text-slate-700">The project is interactive because users trigger behavior and observe state changes. Visible packets, timers, mock servers, queues, failures, and records expose what the system is doing.</p>
              <div className="mt-5 rounded-xl border border-sky-200 bg-white/80 p-4">
                <p className="text-sm font-bold text-slate-900">The evidence chain</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Action → state change → visible outcome → lecture concept.</p>
              </div>
              <p className="mt-5 text-sm font-semibold leading-6 text-sky-900">Each page proves a course concept through observable behavior.</p>
            </aside>
          </section>
        </div>
      </main>
    </>
  );
}
