"use client";

import { useEffect, useRef, useState } from "react";
import { PageShell } from "@/components/PageShell";

type RmiNode = "client" | "stub" | "registry" | "network" | "server";
type FlowStep = {
  text: string;
  node: RmiNode;
  tone?: "normal" | "success" | "error";
};

const remoteHealthySteps: FlowStep[] = [
  { text: "Client calls local Stub method", node: "client" },
  {
    text: "Stub looks up CalculatorService in RMI Registry",
    node: "stub",
  },
  { text: "Registry returns remote service reference", node: "registry" },
  { text: "Stub serializes arguments { a: 5, b: 3 }", node: "stub" },
  { text: "Request travels over the network", node: "network" },
  { text: "Remote server executes add(5, 3)", node: "server" },
  { text: "Server serializes result 8", node: "server" },
  {
    text: "Client receives result from Stub",
    node: "client",
    tone: "success",
  },
];

const remoteFailedSteps: FlowStep[] = [
  { text: "Client calls local Stub method", node: "client" },
  {
    text: "Stub looks up CalculatorService in RMI Registry",
    node: "stub",
  },
  { text: "Registry returns remote service reference", node: "registry" },
  { text: "Stub serializes arguments { a: 5, b: 3 }", node: "stub" },
  {
    text: "Network/server failure occurs",
    node: "network",
    tone: "error",
  },
  {
    text: "RemoteException: remote call failed",
    node: "client",
    tone: "error",
  },
];

const localSteps: FlowStep[] = [
  { text: "Client calls calculator.add(5, 3)", node: "client" },
  { text: "Method executes in the same process", node: "client" },
  { text: "Result returned immediately: 8", node: "client", tone: "success" },
];

const nodes: { id: RmiNode; label: string; detail: string }[] = [
  { id: "client", label: "Client", detail: "Caller process" },
  { id: "stub", label: "Stub", detail: "Local proxy" },
  { id: "registry", label: "RMI Registry", detail: "Service discovery" },
  { id: "network", label: "Network", detail: "Latency and failure" },
  { id: "server", label: "Remote Server", detail: "Service object" },
];

const waitTime = 460;

export default function RmiSimulatorPage() {
  const [serverFailed, setServerFailed] = useState(false);
  const [flowSteps, setFlowSteps] = useState<FlowStep[]>([]);
  const [activeNode, setActiveNode] = useState<RmiNode | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [valueDemoRan, setValueDemoRan] = useState(false);
  const [referenceDemoRan, setReferenceDemoRan] = useState(false);
  const [serverCounter, setServerCounter] = useState(0);
  const timersRef = useRef<number[]>([]);

  function clearTimers() {
    timersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    timersRef.current = [];
  }

  function delay(ms: number) {
    return new Promise<void>((resolve) => {
      const timerId = window.setTimeout(resolve, ms);
      timersRef.current.push(timerId);
    });
  }

  function resetFlow() {
    clearTimers();
    setFlowSteps([]);
    setActiveNode(null);
    setIsRunning(false);
  }

  function runLocalCall() {
    resetFlow();
    setFlowSteps(localSteps);
    setActiveNode("client");
  }

  async function runRemoteCall() {
    resetFlow();
    setIsRunning(true);

    const steps = serverFailed ? remoteFailedSteps : remoteHealthySteps;

    for (const step of steps) {
      setActiveNode(step.node);
      setFlowSteps((currentSteps) => [...currentSteps, step]);
      await delay(waitTime);
    }

    setIsRunning(false);
  }

  function resetAll() {
    resetFlow();
    setValueDemoRan(false);
    setReferenceDemoRan(false);
    setServerCounter(0);
  }

  function runPassByValueDemo() {
    setValueDemoRan(true);
  }

  function runPassByReferenceDemo() {
    setReferenceDemoRan(true);
    setServerCounter(1);
  }

  useEffect(() => {
    return () => clearTimers();
  }, []);

  return (
    <PageShell
      title="RMI and Service Registry Simulator"
      subtitle="This simulator shows how a local method call differs from a remote method call through a Stub, Registry lookup, Serialization, network latency, and possible remote failure."
    >
      <section className="grid gap-4 lg:grid-cols-2">
        <ComparisonCard
          title="Local Call"
          items={[
            "Client calls method directly in the same process.",
            "No network.",
            "No serialization.",
            "No registry lookup.",
            "Very low latency.",
          ]}
        />
        <ComparisonCard
          title="Remote Call"
          items={[
            "Client calls a Stub.",
            "Stub asks the Registry for the remote service.",
            "Arguments are serialized.",
            "Request crosses the network.",
            "Server executes the method.",
            "Result is serialized back.",
            "Failure may happen even if client and server are running.",
          ]}
        />
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">
              Interactive RMI Flow
            </h2>
            <p className="mt-2 max-w-3xl leading-7 text-slate-700">
              Follow the same calculator call as either a local method call or a
              remote method call routed through RMI infrastructure.
            </p>
          </div>
          <div
            className={`w-fit rounded-full px-3 py-1 text-sm font-semibold ${
              serverFailed
                ? "bg-rose-100 text-rose-800"
                : "bg-emerald-100 text-emerald-800"
            }`}
          >
            Server status: {serverFailed ? "Failed" : "Healthy"}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <ActionButton onClick={runLocalCall} disabled={isRunning}>
            Run Local Call
          </ActionButton>
          <ActionButton onClick={runRemoteCall} disabled={isRunning}>
            Run Remote Call
          </ActionButton>
          <ActionButton
            onClick={() => setServerFailed((failed) => !failed)}
            disabled={isRunning}
            variant={serverFailed ? "danger" : "secondary"}
          >
            Toggle Server Failure
          </ActionButton>
          <ActionButton onClick={resetAll} variant="secondary">
            Reset
          </ActionButton>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-normal text-slate-600">
              Visual Nodes
            </h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {nodes.map((node) => (
                <div
                  key={node.id}
                  className={`rounded-lg border p-4 transition-colors ${
                    activeNode === node.id
                      ? "border-cyan-400 bg-cyan-50 shadow-sm ring-2 ring-cyan-100"
                      : "border-slate-200 bg-white"
                  } ${
                    node.id === "server" && serverFailed
                      ? "border-rose-200 bg-rose-50"
                      : ""
                  }`}
                >
                  <p className="font-semibold text-slate-950">{node.label}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {node.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-normal text-slate-600">
              Step Log
            </h3>
            <ol className="mt-4 space-y-3">
              {flowSteps.length === 0 ? (
                <li className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm leading-6 text-slate-600">
                  Choose a call mode to begin the simulation.
                </li>
              ) : (
                flowSteps.map((step, index) => (
                  <li
                    key={`${step.text}-${index}`}
                    className={`rounded-lg border bg-white p-3 text-sm leading-6 ${
                      step.tone === "error"
                        ? "border-rose-200 text-rose-800"
                        : step.tone === "success"
                          ? "border-emerald-200 text-emerald-800"
                          : "border-slate-200 text-slate-700"
                    }`}
                  >
                    <span className="mr-2 font-semibold">{index + 1}.</span>
                    {step.text}
                  </li>
                ))
              )}
            </ol>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <InfoPanel title="Serialization">
          <p>
            In a remote call, Java objects must be converted to bytes before
            crossing the network.
          </p>
          <p>The receiver gets deserialized data.</p>
          <p>This simulator represents serialization visually only.</p>
        </InfoPanel>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                Pass-by-Value Demo
              </h2>
              <p className="mt-2 leading-7 text-slate-700">
                Normal objects crossing RMI are copied, so changes on the client
                copy do not update the original server object.
              </p>
            </div>
            <ActionButton onClick={runPassByValueDemo} variant="secondary">
              Run Pass-by-Value Demo
            </ActionButton>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <ObjectBox
              title="Server-side object"
              code={`UserDTO {\n  name: "Alice",\n  role: "student"\n}`}
              note="Original object remains unchanged."
            />
            <ObjectBox
              title="Client copy"
              code={
                valueDemoRan
                  ? `UserDTO {\n  name: "Alice",\n  role: "admin"\n}`
                  : `Serialized copy not sent yet`
              }
              note={
                valueDemoRan
                  ? "Client changed only its local copy."
                  : "Run the demo to deserialize a copy on the client."
              }
            />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-950">
              Pass-by-Reference for Remote Objects
            </h2>
            <p className="mt-2 max-w-3xl leading-7 text-slate-700">
              Remote objects are accessed through a Stub that acts like a
              reference to the server object.
            </p>
          </div>
          <ActionButton onClick={runPassByReferenceDemo} variant="secondary">
            Run Pass-by-Reference Demo
          </ActionButton>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <ObjectBox
            title="RemoteCounter on server"
            code={`RemoteCounter {\n  value: ${serverCounter}\n}`}
            note="The authoritative object lives on the server."
          />
          <ObjectBox
            title="Client reference"
            code={
              referenceDemoRan
                ? `Stub<RemoteCounter>\nmethod: increment()`
                : "No remote reference yet"
            }
            note="The client receives a Stub, not the real object."
          />
          <ObjectBox
            title="Remote call result"
            code={
              referenceDemoRan
                ? "increment() ran on the server"
                : "Run the demo to call increment()"
            }
            note={
              referenceDemoRan
                ? "Server counter changed from 0 to 1."
                : "The server value is still 0."
            }
          />
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">
          Which Distributed Systems concepts does this prove?
        </h2>
        <ul className="mt-4 grid gap-3 text-slate-700 md:grid-cols-2">
          {[
            "A remote call looks like a local call but depends on the network.",
            "The Stub hides communication details from the client.",
            "The Registry provides service discovery using a logical service name.",
            "Serialization is required to move data across the network.",
            "Remote calls can fail due to partial failure.",
            "Pass-by-value sends a copy.",
            "Pass-by-reference for Remote objects uses a Stub as a remote reference.",
          ].map((concept) => (
            <li key={concept} className="rounded-lg bg-slate-50 p-3 leading-7">
              {concept}
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}

function ComparisonCard({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">{title}</h2>
      <ul className="mt-4 space-y-3 text-slate-700">
        {items.map((item) => (
          <li key={item} className="flex gap-3 leading-7">
            <span className="mt-3 h-2 w-2 shrink-0 rounded-full bg-cyan-600" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function InfoPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">{title}</h2>
      <div className="mt-4 space-y-3 leading-7 text-slate-700">{children}</div>
    </section>
  );
}

function ObjectBox({
  title,
  code,
  note,
}: {
  title: string;
  code: string;
  note: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <h3 className="font-semibold text-slate-950">{title}</h3>
      <pre className="mt-3 overflow-x-auto rounded-md bg-slate-950 p-3 text-sm leading-6 text-slate-100">
        <code>{code}</code>
      </pre>
      <p className="mt-3 text-sm leading-6 text-slate-600">{note}</p>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  disabled = false,
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
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
      className={`rounded-md border px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${variantClass}`}
    >
      {children}
    </button>
  );
}
