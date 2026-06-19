"use client";

import { useEffect, useRef, useState } from "react";
import { PageShell } from "@/components/PageShell";

type RpcStatus = "Idle" | "Waiting" | "Completed";
type RpcPhase = "idle" | "request-start" | "request" | "processing" | "response-start" | "response" | "completed";
type Message = { id: number; label: string };
type LogTone = "normal" | "success" | "warning";
type LogEntry = { id: number; text: string; tone: LogTone };
type Focus = "rpc" | "message";

const RPC_LATENCY = 1800;
const PROCESSING_TIME = 900;
const concepts = [
  "RPC",
  "Synchronous",
  "Direct Request/Response",
  "Producer",
  "Queue",
  "Consumer",
  "Message Passing",
  "Service Decoupling",
];

const messageLabels = [
  "Generate report",
  "Update inventory",
  "Send notification",
  "Create invoice",
  "Archive event",
];

const guide = {
  howToUse: [
    "Run an RPC call and watch the client remain blocked until the response returns.",
    "Send messages while the consumer is paused and observe the queue grow.",
    "Resume the consumer and process queued work one message at a time.",
  ],
  observe: [
    "RPC result data appears only after the direct response returns.",
    "A producer finishes immediately after placing work in the queue.",
    "Consumer availability changes queue length, but does not stop production.",
  ],
  concepts: [
    "Synchronous direct request/response communication.",
    "Asynchronous queue-based communication.",
    "Temporal decoupling between producer and consumer.",
  ],
};

export default function RpcVsMessagePassingPage() {
  const [rpcStatus, setRpcStatus] = useState<RpcStatus>("Idle");
  const [rpcPhase, setRpcPhase] = useState<RpcPhase>("idle");
  const [rpcProgress, setRpcProgress] = useState(0);
  const [rpcResult, setRpcResult] = useState("No RPC result yet");
  const [queue, setQueue] = useState<Message[]>([]);
  const [produced, setProduced] = useState(0);
  const [processed, setProcessed] = useState(0);
  const [consumerPaused, setConsumerPaused] = useState(false);
  const [processing, setProcessing] = useState<Message | null>(null);
  const [latestResult, setLatestResult] = useState("No result yet");
  const [producerTransit, setProducerTransit] = useState<string | null>(null);
  const [producerMoving, setProducerMoving] = useState(false);
  const [consumerMoving, setConsumerMoving] = useState(false);
  const [focus, setFocus] = useState<Focus>("rpc");
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: 1, text: "Simulator ready. Choose a communication style to begin.", tone: "normal" },
  ]);

  const timerIds = useRef<number[]>([]);
  const runId = useRef(0);
  const messageId = useRef(0);
  const logId = useRef(1);

  function later(callback: () => void, delay: number) {
    const id = window.setTimeout(() => {
      timerIds.current = timerIds.current.filter((timer) => timer !== id);
      callback();
    }, delay);
    timerIds.current.push(id);
  }

  function wait(delay: number, currentRun: number) {
    return new Promise<boolean>((resolve) => {
      later(() => resolve(runId.current === currentRun), delay);
    });
  }

  function addLog(text: string, tone: LogTone = "normal") {
    const entry = { id: ++logId.current, text, tone };
    setLogs((current) => [entry, ...current].slice(0, 8));
  }

  async function runRpcCall() {
    if (rpcStatus === "Waiting") return;
    const currentRun = ++runId.current;
    setFocus("rpc");
    setRpcStatus("Waiting");
    setRpcPhase("request-start");
    setRpcProgress(0);
    setRpcResult("Hidden until the response returns");
    addLog("RPC request sent; client is waiting.", "warning");

    if (!(await wait(80, currentRun))) return;
    setRpcPhase("request");
    if (!(await wait(650, currentRun))) return;
    setRpcPhase("processing");
    for (const progress of [20, 40, 60, 80, 100]) {
      if (!(await wait(RPC_LATENCY / 5, currentRun))) return;
      setRpcProgress(progress);
    }
    setRpcPhase("response-start");
    if (!(await wait(80, currentRun))) return;
    setRpcPhase("response");
    if (!(await wait(750, currentRun))) return;
    setRpcPhase("completed");
    setRpcStatus("Completed");
    setRpcResult("Customer record #42 returned");
    setLatestResult("RPC: Customer record #42 returned");
    addLog("RPC response returned; the client can continue.", "success");
  }

  function enqueue(count: number) {
    setFocus("message");
    const nextMessages = Array.from({ length: count }, () => {
      const id = ++messageId.current;
      return { id, label: messageLabels[(id - 1) % messageLabels.length] };
    });
    setQueue((current) => [...current, ...nextMessages]);
    setProduced((current) => current + count);
    setProducerTransit(count === 1 ? `MSG #${nextMessages[0].id}` : `+${count} MSG`);
    setProducerMoving(false);
    later(() => setProducerMoving(true), 40);
    later(() => setProducerTransit(null), 600);

    if (count === 1) {
      addLog(`Message #${nextMessages[0].id} added to queue. Producer is free.`, "success");
    } else {
      addLog(`${count} messages added in a burst; producer did not wait.`, "success");
    }
    if (consumerPaused) addLog("Consumer paused; messages remain queued.", "warning");
  }

  function processOne() {
    setFocus("message");
    if (consumerPaused) {
      addLog("Consumer paused; messages remain queued.", "warning");
      return;
    }
    if (processing) return;
    const nextMessage = queue[0];
    if (!nextMessage) {
      addLog("Queue is empty; there is no message to process.");
      return;
    }

    setQueue((current) => current.slice(1));
    setProcessing(nextMessage);
    setConsumerMoving(false);
    later(() => setConsumerMoving(true), 40);
    addLog(`Consumer started processing Message #${nextMessage.id}.`);
    later(() => {
      setProcessing(null);
      setConsumerMoving(false);
      setProcessed((current) => current + 1);
      setLatestResult(`Message #${nextMessage.id}: ${nextMessage.label} completed`);
      addLog(`Consumer processed Message #${nextMessage.id}.`, "success");
    }, PROCESSING_TIME);
  }

  function toggleConsumer() {
    setFocus("message");
    setConsumerPaused((current) => {
      const next = !current;
      addLog(
        next
          ? "Consumer paused; messages remain queued."
          : "Consumer resumed and is ready for queued work.",
        next ? "warning" : "success",
      );
      return next;
    });
  }

  function reset() {
    runId.current += 1;
    timerIds.current.forEach((id) => window.clearTimeout(id));
    timerIds.current = [];
    messageId.current = 0;
    logId.current = 1;
    setRpcStatus("Idle");
    setRpcPhase("idle");
    setRpcProgress(0);
    setRpcResult("No RPC result yet");
    setQueue([]);
    setProduced(0);
    setProcessed(0);
    setConsumerPaused(false);
    setProcessing(null);
    setLatestResult("No result yet");
    setProducerTransit(null);
    setProducerMoving(false);
    setConsumerMoving(false);
    setFocus("rpc");
    setLogs([{ id: 1, text: "Simulation reset. Both communication paths are idle.", tone: "normal" }]);
  }

  useEffect(() => {
    return () => timerIds.current.forEach((id) => window.clearTimeout(id));
  }, []);

  const academic = focus === "rpc"
    ? {
        title: "Synchronous direct communication",
        demonstrates: "The client waits while the remote service processes the request and returns a response.",
        matters: "RPC is simple to reason about, but the caller depends on remote service latency and availability.",
      }
    : {
        title: "Service decoupling",
        demonstrates: "The producer can enqueue work even when the consumer is slow or paused.",
        matters: "A queue absorbs temporary delay and separates producer timing from consumer timing.",
      };

  return (
    <PageShell
      title="RPC vs Message Passing"
      subtitle="RPC sends a direct request and waits for a response. Message Passing sends work to a queue so producer and consumer can operate independently."
      guide={guide}
    >
      <section className="rounded-2xl border border-cyan-200 bg-gradient-to-r from-white via-cyan-50 to-sky-50 p-5 shadow-sm sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-800">Communication models</p>
        <div className="mt-4 flex flex-wrap gap-2" aria-label="Concepts covered">
          {concepts.map((concept) => (
            <span key={concept} className="rounded-full border border-cyan-200 bg-white px-3 py-1.5 text-xs font-bold text-cyan-900 shadow-sm">
              {concept}
            </span>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-800">Live comparison canvas</p>
            <h2 className="mt-1 text-xl font-bold text-slate-950">Same goal, different communication behavior</h2>
          </div>
          <p className="text-sm text-slate-600">Follow the moving packet, then compare who has to wait.</p>
        </div>

        <div className="grid min-w-0 gap-5 xl:grid-cols-2">
          <LaneCard
            label="Lane A"
            title="RPC Direct Call"
            description="One direct request/response path. The caller is blocked."
            accent="cyan"
          >
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)_minmax(0,1fr)] items-center gap-2">
              <Node label="Client" detail={rpcStatus === "Waiting" ? "WAITING" : "Ready"} state={rpcStatus === "Waiting" ? "waiting" : rpcStatus === "Completed" ? "success" : "idle"} />
              <div className="min-w-0 text-center">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">RPC Stub / Request</p>
                <FlowTrack
                  direction={rpcPhase === "response" ? "back" : rpcPhase === "response-start" ? "response-start" : rpcPhase === "request" ? "forward" : rpcPhase === "request-start" ? "request-start" : "idle"}
                  packet={rpcPhase === "response" || rpcPhase === "response-start" ? "RES" : "REQ"}
                />
                <p className="mt-1 truncate text-[10px] font-bold text-slate-500">{rpcPhase === "response" ? "Response returning" : "Direct channel"}</p>
              </div>
              <Node label="Remote Service" detail={rpcPhase === "processing" ? "Processing" : "Available"} state={rpcPhase === "processing" ? "active" : rpcPhase === "completed" ? "success" : "idle"} />
            </div>

            <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-bold text-slate-700">Server latency / progress</span>
                <span className="font-mono font-black text-cyan-800">{rpcProgress}%</span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-sky-600 transition-all duration-300 motion-reduce:transition-none" style={{ width: `${rpcProgress}%` }} />
              </div>
            </div>

            <div className={`mt-3 rounded-xl border p-3 transition-colors ${rpcPhase === "completed" ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"}`} aria-live="polite">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Response / Result</p>
              <p className={`mt-1 text-sm font-bold ${rpcPhase === "completed" ? "text-emerald-900" : "text-slate-600"}`}>{rpcResult}</p>
            </div>
          </LaneCard>

          <LaneCard
            label="Lane B"
            title="Message Passing"
            description="The queue separates producer timing from consumer timing."
            accent="sky"
          >
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)_minmax(0,1fr)] items-center gap-2">
              <Node label="Producer" detail={producerTransit ? "Sent · Free" : "Ready"} state={producerTransit ? "success" : "idle"} />
              <div className="min-w-0 text-center">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Queue / Broker</p>
                <MessageTrack producerTransit={producerTransit} producerMoving={producerMoving} processing={processing} consumerMoving={consumerMoving} />
                <p className="mt-1 text-[10px] font-bold text-slate-500">Store first · process later</p>
              </div>
              <Node label="Consumer" detail={consumerPaused ? "PAUSED" : processing ? `MSG #${processing.id}` : "Running"} state={consumerPaused ? "paused" : processing ? "active" : "idle"} />
            </div>

            <div className={`mt-5 rounded-xl border p-4 ${consumerPaused && queue.length ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-white"}`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-950">Stored messages</h3>
                  <p className="mt-0.5 text-xs text-slate-500">FIFO · oldest message leaves first</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 font-mono text-xs font-black ${queue.length ? "bg-amber-100 text-amber-900" : "bg-slate-100 text-slate-600"}`}>{queue.length} queued</span>
              </div>
              <div className="mt-3 flex min-h-20 flex-wrap content-start gap-2" aria-live="polite">
                {queue.length ? queue.map((message, index) => (
                  <span key={message.id} className="max-w-full rounded-lg border border-amber-200 bg-white px-2.5 py-2 font-mono text-[10px] font-bold text-amber-950 shadow-sm">
                    #{message.id} · {message.label}{index === 0 ? " · NEXT" : ""}
                  </span>
                )) : (
                  <p className="w-full rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-center text-xs text-slate-500">Queue empty · send a message</p>
                )}
              </div>
            </div>

            <div className={`mt-3 rounded-xl border p-3 ${processing ? "border-cyan-200 bg-cyan-50" : processed ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Processed Result</p>
              <p className="mt-1 truncate text-sm font-bold text-slate-700">{processing ? `Processing Message #${processing.id}…` : processed ? latestResult : "No message processed yet"}</p>
            </div>
          </LaneCard>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-800">Controls</p>
        <h2 className="mt-1 text-xl font-bold text-slate-950">Drive both communication paths</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <ActionButton onClick={runRpcCall} disabled={rpcStatus === "Waiting"}>Run RPC Call</ActionButton>
          <ActionButton onClick={() => enqueue(1)}>Send Message</ActionButton>
          <ActionButton onClick={() => enqueue(4)}>Send Message Burst</ActionButton>
          <ActionButton onClick={processOne} disabled={Boolean(processing)}>Process One Message</ActionButton>
          <ActionButton onClick={toggleConsumer} variant={consumerPaused ? "resume" : "pause"}>{consumerPaused ? "Resume Consumer" : "Pause Consumer"}</ActionButton>
          <ActionButton onClick={reset} variant="secondary">Reset</ActionButton>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-800">Status & metrics</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">Current system state</h2>
          <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Metric label="RPC status" value={rpcStatus} tone={rpcStatus === "Waiting" ? "warning" : rpcStatus === "Completed" ? "success" : "normal"} />
            <Metric label="RPC latency" value={`${RPC_LATENCY} ms`} />
            <Metric label="Queue length" value={queue.length} tone={queue.length ? "warning" : "normal"} />
            <Metric label="Produced" value={produced} />
            <Metric label="Processed" value={processed} tone={processed ? "success" : "normal"} />
            <Metric label="Consumer" value={consumerPaused ? "Paused" : processing ? "Processing" : "Running"} tone={consumerPaused ? "paused" : "success"} />
          </dl>
          <div className="mt-3 rounded-xl border border-cyan-100 bg-cyan-50 p-3">
            <dt className="text-xs font-bold text-cyan-800">Latest result</dt>
            <dd className="mt-1 break-words text-sm font-bold text-slate-950">{latestResult}</dd>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-800">Event timeline</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">Recent communication events</h2>
          <ol className="mt-5 space-y-2" aria-live="polite">
            {logs.map((log) => (
              <li key={log.id} className={`flex gap-3 rounded-xl border p-3 text-sm leading-5 ${toneClasses(log.tone)}`}>
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${log.tone === "success" ? "bg-emerald-500" : log.tone === "warning" ? "bg-amber-500" : "bg-slate-400"}`} />
                {log.text}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="rounded-2xl border border-cyan-200 bg-gradient-to-r from-cyan-50 via-white to-sky-50 p-5 shadow-sm sm:p-6" aria-live="polite">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-800">Academic explanation</p>
            <h2 className="mt-1 text-xl font-bold text-slate-950">What the current action proves</h2>
          </div>
          <span className="rounded-full bg-cyan-800 px-3 py-1.5 text-xs font-bold text-white">{focus === "rpc" ? "RPC focus" : "Message Passing focus"}</span>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <Explanation label="Concept proven" text={academic.title} />
          <Explanation label="Simulation demonstrates" text={academic.demonstrates} />
          <Explanation label="Why it matters" text={academic.matters} />
        </div>
      </section>
    </PageShell>
  );
}

function LaneCard({ label, title, description, accent, children }: { label: string; title: string; description: string; accent: "cyan" | "sky"; children: React.ReactNode }) {
  return (
    <article className={`min-w-0 overflow-hidden rounded-2xl border bg-gradient-to-b p-4 shadow-sm sm:p-5 ${accent === "cyan" ? "border-cyan-200 from-cyan-50 to-white" : "border-sky-200 from-sky-50 to-white"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-800">{label}</p>
          <h3 className="mt-1 text-xl font-black text-slate-950">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
        </div>
        <span className="mt-1 h-3 w-3 shrink-0 animate-pulse rounded-full bg-cyan-500 motion-reduce:animate-none" />
      </div>
      <div className="mt-6">{children}</div>
    </article>
  );
}

function Node({ label, detail, state }: { label: string; detail: string; state: "idle" | "active" | "waiting" | "success" | "paused" }) {
  const style = state === "paused"
    ? "border-rose-300 bg-rose-50 text-rose-900"
    : state === "waiting"
      ? "border-amber-300 bg-amber-50 text-amber-950 ring-2 ring-amber-100"
      : state === "active"
        ? "border-cyan-400 bg-cyan-50 text-cyan-950 ring-2 ring-cyan-100"
        : state === "success"
          ? "border-emerald-300 bg-emerald-50 text-emerald-950"
          : "border-slate-200 bg-white text-slate-800";
  return (
    <div className={`min-w-0 rounded-xl border px-2 py-3 text-center shadow-sm transition-all duration-300 ${style}`}>
      <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-current/10 font-mono text-xs font-black">{label.charAt(0)}</div>
      <h4 className="break-words text-xs font-black leading-4 sm:text-sm">{label}</h4>
      <p className="mt-1 break-words font-mono text-[9px] font-bold uppercase sm:text-[10px]">{detail}</p>
    </div>
  );
}

function FlowTrack({ direction, packet }: { direction: "request-start" | "forward" | "response-start" | "back" | "idle"; packet: string }) {
  return (
    <div className="relative mt-2 h-8" aria-hidden="true">
      <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-cyan-200" />
      <span className="absolute right-0 top-1/2 -translate-y-1/2 text-cyan-500">›</span>
      <span className="absolute left-0 top-1/2 -translate-y-1/2 text-cyan-500">‹</span>
      {direction !== "idle" ? (
        <span className={`absolute top-1/2 z-10 -translate-y-1/2 rounded-md px-1.5 py-1 font-mono text-[9px] font-black text-white shadow-md transition-[left] duration-700 motion-reduce:transition-none ${direction === "back" ? "left-0 bg-emerald-600" : direction === "response-start" ? "left-[calc(100%-2.25rem)] bg-emerald-600" : direction === "forward" ? "left-[calc(100%-2.25rem)] bg-cyan-700" : "left-0 bg-cyan-700"}`}>{packet}</span>
      ) : null}
    </div>
  );
}

function MessageTrack({ producerTransit, producerMoving, processing, consumerMoving }: { producerTransit: string | null; producerMoving: boolean; processing: Message | null; consumerMoving: boolean }) {
  return (
    <div className="relative mt-2 h-8" aria-hidden="true">
      <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-sky-200" />
      <span className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded border-2 border-sky-500 bg-white" />
      {producerTransit ? <span className={`absolute top-1/2 z-10 -translate-y-1/2 rounded-md bg-sky-700 px-1.5 py-1 font-mono text-[8px] font-black text-white shadow-md transition-[left] duration-500 motion-reduce:transition-none ${producerMoving ? "left-[42%]" : "left-0"}`}>{producerTransit}</span> : null}
      {processing ? <span className={`absolute top-1/2 z-10 -translate-y-1/2 rounded-md bg-cyan-700 px-1.5 py-1 font-mono text-[8px] font-black text-white shadow-md transition-[left] duration-700 motion-reduce:transition-none ${consumerMoving ? "left-[calc(100%-2.5rem)]" : "left-1/2"}`}>#{processing.id}</span> : null}
    </div>
  );
}

function ActionButton({ children, onClick, disabled = false, variant = "primary" }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; variant?: "primary" | "secondary" | "pause" | "resume" }) {
  const style = variant === "secondary"
    ? "border-slate-300 bg-white text-slate-800 hover:bg-slate-100"
    : variant === "pause"
      ? "border-rose-700 bg-rose-700 text-white hover:bg-rose-800"
      : variant === "resume"
        ? "border-emerald-700 bg-emerald-700 text-white hover:bg-emerald-800"
        : "border-cyan-700 bg-cyan-700 text-white hover:bg-cyan-800";
  return <button type="button" onClick={onClick} disabled={disabled} className={`min-h-11 min-w-0 rounded-lg border px-3 py-2 text-sm font-bold transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${style}`}>{children}</button>;
}

function Metric({ label, value, tone = "normal" }: { label: string; value: string | number; tone?: "normal" | "warning" | "success" | "paused" }) {
  const style = tone === "paused" ? "border-rose-200 bg-rose-50 text-rose-900" : tone === "warning" ? "border-amber-200 bg-amber-50 text-amber-900" : tone === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-slate-50 text-slate-950";
  return <div className={`min-w-0 rounded-xl border p-3 ${style}`}><dt className="text-xs font-semibold opacity-70">{label}</dt><dd className="mt-1 break-words font-mono text-base font-black sm:text-lg">{value}</dd></div>;
}

function Explanation({ label, text }: { label: string; text: string }) {
  return <div className="rounded-xl border border-cyan-100 bg-white/90 p-4"><h3 className="text-sm font-bold text-cyan-900">{label}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{text}</p></div>;
}

function toneClasses(tone: LogTone) {
  if (tone === "success") return "border-emerald-200 bg-emerald-50 text-emerald-950";
  if (tone === "warning") return "border-amber-200 bg-amber-50 text-amber-950";
  return "border-slate-200 bg-slate-50 text-slate-700";
}
