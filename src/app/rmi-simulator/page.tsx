"use client";

import { useEffect, useRef, useState } from "react";
import { PageShell } from "@/components/PageShell";

type Mode = "idle" | "local" | "remote";
type Status = "idle" | "running" | "success" | "error";
type NodeId =
  | "client"
  | "stub"
  | "registry"
  | "serialization"
  | "network"
  | "server"
  | "result";

type SimulationStep = {
  title: string;
  concept: string;
  detail: string;
  importance: string;
  node: NodeId;
};

const REMOTE_STEPS: SimulationStep[] = [
  {
    title: "Client calls bank.withdraw(100)",
    concept: "Remote Call",
    detail: "The client invokes a familiar method signature on its local Stub.",
    importance: "RMI hides distribution, so remote code can look deceptively local.",
    node: "client",
  },
  {
    title: "Stub packages the arguments",
    concept: "Stub",
    detail: "The Stub records the method name and prepares the value 100 for transport.",
    importance: "A proxy separates application code from communication details.",
    node: "stub",
  },
  {
    title: "Registry lookup finds BankService",
    concept: "Service Discovery",
    detail: "The logical service name is resolved to a remote object reference.",
    importance: "Service discovery lets clients find services without hard-coded objects.",
    node: "registry",
  },
  {
    title: "Arguments are serialized",
    concept: "Serialization",
    detail: "withdraw(100) becomes a transportable byte representation.",
    importance: "Separate processes cannot directly share in-memory Java objects.",
    node: "serialization",
  },
  {
    title: "Request crosses the network",
    concept: "Network Latency",
    detail: "The packet waits for the selected simulated network latency.",
    importance: "Remote calls are slower and can fail independently of either process.",
    node: "network",
  },
  {
    title: "Remote object executes and returns",
    concept: "Remote Execution",
    detail: "BankService withdraws $100, then the result travels back to the client.",
    importance: "Execution happens in another process even though invocation looked local.",
    node: "server",
  },
];

const LOCAL_STEPS: SimulationStep[] = [
  {
    title: "Client calls bank.withdraw(100)",
    concept: "Local Call",
    detail: "The client invokes an object that exists in the same process.",
    importance: "The call uses ordinary control flow and shared process memory.",
    node: "client",
  },
  {
    title: "Local object executes immediately",
    concept: "Local Execution",
    detail: "No Stub, Registry, serialization, or network boundary is involved.",
    importance: "Local calls do not experience distributed-systems partial failure.",
    node: "client",
  },
  {
    title: "Result returns directly",
    concept: "Return Value",
    detail: "The updated balance is returned on the same machine in about 2 ms.",
    importance: "This short path is why a local call is cheaper and more predictable.",
    node: "result",
  },
];

const NODES: { id: NodeId; label: string; detail: string; icon: string }[] = [
  { id: "client", label: "Client Program", detail: "bank.withdraw(100)", icon: "C" },
  { id: "stub", label: "Local Stub", detail: "Client-side proxy", icon: "S" },
  { id: "registry", label: "RMI Registry", detail: "Finds BankService", icon: "R" },
  { id: "serialization", label: "Serialization", detail: "Objects → bytes", icon: "{ }" },
  { id: "network", label: "Network", detail: "Latency + failure", icon: "↝" },
  { id: "server", label: "Remote Server Object", detail: "Executes withdraw", icon: "B" },
  { id: "result", label: "Result", detail: "Balance: $900", icon: "✓" },
];

const CONCEPTS = [
  "Local Call",
  "Remote Call",
  "Stub",
  "Registry",
  "Serialization",
  "Latency",
  "RemoteException",
];

const guide = {
  howToUse: [
    "Run a Local Call first, then compare it with a Remote Call.",
    "Change latency to see network cost reflected in the simulation.",
    "Enable Network Failure and retry the remote call.",
  ],
  observe: [
    "Local execution skips the entire RMI infrastructure path.",
    "The active packet and timeline identify each remote-call responsibility.",
    "A network failure becomes a RemoteException even when both endpoints are healthy.",
  ],
  concepts: [
    "Location transparency makes remote invocation look local.",
    "Stubs, discovery, and serialization enable communication between processes.",
    "Latency and partial failure are fundamental costs of distribution.",
  ],
};

export default function RmiSimulatorPage() {
  const [mode, setMode] = useState<Mode>("idle");
  const [status, setStatus] = useState<Status>("idle");
  const [activeStep, setActiveStep] = useState(-1);
  const [networkFailure, setNetworkFailure] = useState(false);
  const [latency, setLatency] = useState(800);
  const [result, setResult] = useState("No call has run yet.");
  const runId = useRef(0);

  const steps = mode === "local" ? LOCAL_STEPS : REMOTE_STEPS;
  const activeNode = activeStep >= 0 ? steps[activeStep]?.node : null;
  const packetNode = status === "success" ? "result" : activeNode;
  const packetLabel =
    status === "error"
      ? "Packet stopped at network"
      : status === "success"
        ? "Result returned to client"
        : status === "running" && activeNode === "server"
          ? "Executing on remote object"
          : status === "running"
            ? mode === "local"
              ? "Local call in progress"
              : "Remote request packet in transit"
            : "Waiting to run";

  function pause(ms: number, id: number) {
    return new Promise<boolean>((resolve) => {
      window.setTimeout(() => resolve(runId.current === id), ms);
    });
  }

  function prepareRun(nextMode: Mode) {
    const id = ++runId.current;
    setMode(nextMode);
    setStatus("running");
    setActiveStep(0);
    setResult("Call in progress…");
    return id;
  }

  async function runLocalCall() {
    const id = prepareRun("local");
    for (let index = 0; index < LOCAL_STEPS.length; index += 1) {
      setActiveStep(index);
      if (!(await pause(260, id))) return;
    }
    setStatus("success");
    setResult("Success — withdrawal completed locally. Balance: $900");
  }

  async function runRemoteCall() {
    const id = prepareRun("remote");
    for (let index = 0; index < REMOTE_STEPS.length; index += 1) {
      setActiveStep(index);
      const stepDelay = REMOTE_STEPS[index].node === "network" ? latency : 520;
      if (!(await pause(stepDelay, id))) return;

      if (REMOTE_STEPS[index].node === "network" && networkFailure) {
        setStatus("error");
        setResult(
          "RemoteException: connection timed out — client and server may both be healthy.",
        );
        return;
      }
    }
    setStatus("success");
    setResult("Success — remote BankService returned balance: $900");
  }

  function reset() {
    runId.current += 1;
    setMode("idle");
    setStatus("idle");
    setActiveStep(-1);
    setResult("No call has run yet.");
  }

  useEffect(() => () => void (runId.current += 1), []);

  const explanation =
    activeStep >= 0
      ? steps[activeStep]
      : {
          title: "Choose a call to begin",
          concept: "Local vs Remote",
          detail: "Run the local path first, then watch RMI add infrastructure and risk.",
          importance: "The comparison reveals what location transparency hides.",
        };

  return (
    <PageShell
      title="RMI Simulator"
      subtitle="A remote method call looks like a local method call, but RMI handles registry lookup, serialization, network latency, and remote execution."
      guide={guide}
    >
      <div className="flex flex-wrap gap-2" aria-label="RMI concepts">
        {CONCEPTS.map((concept) => (
          <span
            key={concept}
            className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-900"
          >
            {concept}
          </span>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-cyan-200 bg-gradient-to-br from-white via-sky-50/70 to-cyan-50 shadow-xl shadow-cyan-100/70 ring-1 ring-cyan-100 dark:border-cyan-800/60 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 dark:shadow-black/20 dark:ring-cyan-900/60">
        <div className="border-b border-cyan-200 bg-gradient-to-r from-cyan-50 via-white to-sky-50 px-5 py-5 dark:border-cyan-800/60 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 sm:px-8 sm:py-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-800">
                Live call path
              </p>
              <h2 className="mt-1 text-xl font-bold leading-snug text-slate-950 sm:text-2xl">
                One method signature, two very different journeys
              </h2>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  networkFailure ? "bg-rose-500" : "bg-emerald-500"
                }`}
              />
              Network {networkFailure ? "failure enabled" : "available"}
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-8">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7 lg:gap-2">
            {NODES.map((node, index) => {
              const isActive = packetNode === node.id;
              const isSkipped =
                mode === "local" && !["client", "result"].includes(node.id);
              const isFailed = status === "error" && node.id === "network";
              const isSuccess = status === "success" && node.id === "result";
              const visitedAt = REMOTE_STEPS.findIndex(
                (step) => step.node === node.id,
              );
              const wasVisited =
                mode === "remote" &&
                visitedAt >= 0 &&
                activeStep >= visitedAt;

              return (
                <div key={node.id} className="contents">
                  <article
                    className={`relative min-h-36 rounded-xl border p-4 transition-all duration-300 motion-reduce:transition-none lg:min-h-44 ${
                      isFailed
                        ? "border-rose-300 bg-rose-50 shadow-lg shadow-rose-100 ring-2 ring-rose-200"
                        : isSuccess
                          ? "border-emerald-300 bg-emerald-50 shadow-lg shadow-emerald-100 ring-2 ring-emerald-200"
                          : isActive
                            ? "-translate-y-1 border-cyan-400 bg-cyan-50 shadow-xl shadow-cyan-200/80 ring-2 ring-cyan-200 motion-reduce:translate-y-0"
                          : wasVisited
                            ? "border-emerald-200 bg-emerald-50/70 shadow-sm"
                            : "border-slate-200 bg-white shadow-sm"
                    } ${isSkipped ? "opacity-35" : "opacity-100"}`}
                    aria-current={isActive ? "step" : undefined}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg font-mono text-sm font-black ${
                        isFailed
                          ? "bg-rose-100 text-rose-800 ring-1 ring-rose-200"
                          : isSuccess
                            ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200"
                            : isActive
                            ? "bg-cyan-100 text-cyan-900 ring-1 ring-cyan-200"
                            : "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
                      }`}
                    >
                      {node.icon}
                    </div>
                    <h3 className="mt-3 text-base font-bold leading-tight text-slate-950">
                      {node.label}
                    </h3>
                    <p className="mt-1.5 text-sm leading-5 text-slate-600">{node.detail}</p>
                    {isActive && status === "running" ? (
                      <span className="absolute right-4 top-4 flex h-4 w-4" aria-label="Packet is active here">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-500 opacity-50 motion-reduce:animate-none" />
                        <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-white bg-cyan-500 shadow-lg shadow-cyan-300" />
                      </span>
                    ) : null}
                    {isFailed || isSuccess ? (
                      <span
                        className={`absolute bottom-3 right-3 rounded-full px-2 py-1 text-[11px] font-bold uppercase tracking-wide ${
                          isFailed
                            ? "bg-rose-200 text-rose-950"
                            : "bg-emerald-200 text-emerald-950"
                        }`}
                      >
                        {isFailed ? "Failed" : "Complete"}
                      </span>
                    ) : null}
                    {isSkipped ? (
                      <span className="absolute bottom-2 right-2 text-[10px] font-bold uppercase text-slate-500">
                        skipped
                      </span>
                    ) : null}
                  </article>
                  {index < NODES.length - 1 ? (
                    <div
                      className={`flex h-5 items-center justify-center text-lg transition-colors sm:hidden ${
                        wasVisited && mode === "remote" ? "text-cyan-600" : "text-slate-300"
                      }`}
                      aria-hidden="true"
                    >
                      ↓
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="mt-4 hidden grid-cols-6 px-[7%] lg:grid" aria-hidden="true">
            {NODES.slice(0, -1).map((node, index) => {
              const passed = mode === "remote" && activeStep > index;
              return (
                <div key={node.id} className="flex items-center">
                  <div className={`h-px flex-1 ${passed ? "bg-cyan-500" : "bg-slate-300"}`} />
                  <span className={passed ? "text-cyan-600" : "text-slate-300"}>›</span>
                </div>
              );
            })}
          </div>

          <div
            className={`mt-6 rounded-xl border p-4 sm:p-5 ${
              status === "error"
                ? "border-rose-300 bg-rose-50"
                : status === "success"
                  ? "border-emerald-300 bg-emerald-50"
                  : "border-sky-200 bg-white/90 shadow-sm"
            }`}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span
                  className={`h-3 w-3 shrink-0 rounded-full ${
                    status === "error"
                      ? "bg-rose-500"
                      : status === "success"
                        ? "bg-emerald-500"
                        : status === "running"
                          ? "animate-pulse bg-cyan-500 motion-reduce:animate-none"
                          : "bg-slate-400"
                  }`}
                />
                <p className="text-sm font-bold text-slate-900 sm:text-base">{packetLabel}</p>
              </div>
              <p className="font-mono text-xs font-bold uppercase tracking-wider text-slate-500">
                {mode === "local" ? "Short local path" : "Remote request packet"}
              </p>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200 ring-1 ring-slate-300/80">
              <div
                className={`h-full rounded-full transition-all duration-500 motion-reduce:transition-none ${
                  status === "error"
                    ? "bg-rose-500"
                    : status === "success"
                      ? "bg-emerald-500"
                      : "bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-500 shadow-[0_0_12px_rgba(14,165,233,0.35)]"
                }`}
                style={{
                  width:
                    activeStep < 0
                      ? "0%"
                      : `${((activeStep + (status === "success" ? 1 : 0)) / steps.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-800">Controls</p>
              <h2 className="mt-1 text-xl font-bold text-slate-950">Run the comparison</h2>
            </div>
            <label className="min-w-52 text-sm font-semibold text-slate-700">
              Simulated network latency: {latency} ms
              <input
                type="range"
                min="400"
                max="1600"
                step="200"
                value={latency}
                disabled={status === "running"}
                onChange={(event) => setLatency(Number(event.target.value))}
                className="mt-2 block w-full accent-cyan-700 disabled:opacity-50"
              />
            </label>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <ActionButton onClick={runLocalCall} disabled={status === "running"}>
              Run Local Call
            </ActionButton>
            <ActionButton onClick={runRemoteCall} disabled={status === "running"}>
              Run Remote Call
            </ActionButton>
            <ActionButton
              onClick={() => setNetworkFailure((current) => !current)}
              disabled={status === "running"}
              variant={networkFailure ? "danger" : "secondary"}
              pressed={networkFailure}
            >
              {networkFailure ? "Network Failure: On" : "Toggle Network Failure"}
            </ActionButton>
            <ActionButton onClick={reset} variant="secondary">
              Reset
            </ActionButton>
          </div>
        </div>

        <aside
          className={`rounded-2xl border p-5 shadow-sm sm:p-6 ${
            status === "error"
              ? "border-rose-300 bg-rose-50 ring-2 ring-rose-100"
              : status === "success"
                ? "border-emerald-300 bg-emerald-50 ring-2 ring-emerald-100"
                : "border-slate-200 bg-white"
          }`}
          aria-live="polite"
        >
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Result & metrics</p>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <Metric label="Mode" value={mode === "idle" ? "—" : capitalize(mode)} />
            <Metric label="Latency" value={mode === "local" ? "~2 ms" : mode === "remote" ? `${latency} ms` : "—"} />
          </dl>
          <p className={`mt-4 text-base font-semibold leading-7 ${status === "error" ? "text-rose-800" : "text-slate-800"}`}>
            {result}
          </p>
        </aside>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-800">Step timeline</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">
            {mode === "local" ? "Local call" : "Remote call"} sequence
          </h2>
          <ol className="mt-5 space-y-3">
            {steps.map((step, index) => {
              const complete = status === "success" || index < activeStep;
              const active = index === activeStep && status === "running";
              const failed = index === activeStep && status === "error";
              return (
                <li
                  key={step.title}
                  className={`flex items-start gap-3 rounded-xl border p-4 transition-colors ${
                    failed
                      ? "border-rose-300 bg-rose-50"
                      : active
                        ? "border-cyan-300 bg-cyan-50"
                        : complete
                          ? "border-emerald-200 bg-emerald-50/70"
                          : "border-slate-200 bg-slate-50/70"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      failed
                        ? "bg-rose-600 text-white"
                        : complete
                          ? "bg-emerald-600 text-white"
                          : active
                            ? "bg-cyan-700 text-white"
                            : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {failed ? "!" : complete ? "✓" : index + 1}
                  </span>
                  <div>
                    <p className="text-base font-bold leading-6 text-slate-900">{step.title}</p>
                    {active || failed ? (
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {failed ? "The packet cannot reach the remote object." : step.detail}
                      </p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <aside className="rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-white p-5 shadow-sm dark:border-cyan-800/60 dark:from-cyan-950/30 dark:to-slate-900 dark:shadow-black/20 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-800">Academic explanation</p>
          <p
            className={`mt-4 inline-flex rounded-full border px-3 py-1.5 text-sm font-bold ${
              status === "error"
                ? "border-rose-200 bg-rose-100 text-rose-900"
                : "border-cyan-200 bg-white text-cyan-900"
            }`}
          >
            Concept: {status === "error" ? "RemoteException" : explanation.concept}
          </p>
          <h2 className="mt-3 text-2xl font-bold text-slate-950">{explanation.title}</h2>
          <div className="mt-5 space-y-4">
            <Explanation label="What is happening?" text={explanation.detail} />
            <Explanation label="Why it matters" text={explanation.importance} />
          </div>
          {status === "error" ? (
            <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-900">
              <strong>Partial failure:</strong> client and server may both be healthy while the network fails. RMI reports this as a RemoteException.
            </div>
          ) : null}
        </aside>
      </section>
    </PageShell>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/80 p-3 ring-1 ring-slate-200">
      <dt className="text-xs font-semibold text-slate-500">{label}</dt>
      <dd className="mt-1 font-mono font-bold text-slate-950">{value}</dd>
    </div>
  );
}

function Explanation({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-cyan-900">{label}</h3>
      <p className="mt-1 leading-7 text-slate-700">{text}</p>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  pressed,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
  pressed?: boolean;
}) {
  const variantClass =
    variant === "danger"
      ? "border-rose-700 bg-rose-700 text-white hover:bg-rose-800"
      : variant === "secondary"
        ? "border-slate-300 bg-white text-slate-800 hover:bg-slate-100"
        : "border-cyan-700 bg-cyan-700 text-white hover:bg-cyan-800";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={pressed}
      className={`min-h-11 rounded-lg border px-4 py-2 text-sm font-bold transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 motion-reduce:transition-none ${variantClass}`}
    >
      {children}
    </button>
  );
}
