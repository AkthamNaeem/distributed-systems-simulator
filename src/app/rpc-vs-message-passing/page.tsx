"use client";

import { useEffect, useRef, useState } from "react";
import { PageShell } from "@/components/PageShell";

type RpcStatus = "Idle" | "Waiting" | "Success" | "Failed";
type RpcNode = "client" | "service";
type LogTone = "normal" | "success" | "warning" | "error";

type RpcStep = {
  text: string;
  node: RpcNode;
  tone?: LogTone;
};

type QueueMessage = {
  id: number;
  content: string;
};

type LogEntry = {
  id: number;
  text: string;
  tone?: LogTone;
};

const healthyRpcSteps: RpcStep[] = [
  {
    text: "Client sends a direct request to the RPC Service.",
    node: "client",
  },
  {
    text: "Client waits for the response.",
    node: "client",
    tone: "warning",
  },
  {
    text: "RPC Service processes the request.",
    node: "service",
  },
  {
    text: "RPC Service sends the response back.",
    node: "service",
  },
  {
    text: "Client receives the result.",
    node: "client",
    tone: "success",
  },
];

const failedRpcSteps: RpcStep[] = [
  {
    text: "Client sends a direct request.",
    node: "client",
  },
  {
    text: "Client waits for response.",
    node: "client",
    tone: "warning",
  },
  {
    text: "RPC Service is unavailable.",
    node: "service",
    tone: "error",
  },
  {
    text: "RPC call fails because the client is tightly coupled to the service availability.",
    node: "client",
    tone: "error",
  },
];

const messageTemplates = [
  "Create report",
  "Send notification",
  "Update inventory",
  "Generate invoice",
  "Archive audit event",
  "Refresh search index",
];

const stepDelay = 560;
const autoProcessDelay = 850;

const guide = {
  howToUse: [
    "Send RPC requests and toggle RPC service failure.",
    "Produce messages, stop the consumer, and produce more messages.",
    "Process the queue manually or with auto processing.",
  ],
  observe: [
    "RPC makes the client wait for the service response.",
    "RPC failure affects the caller immediately.",
    "Messages build up in the queue while the consumer is stopped.",
  ],
  concepts: [
    "Synchronous RPC and direct service dependency.",
    "Producer, queue, and consumer roles.",
    "Message passing decouples sender and receiver.",
  ],
};

export default function RpcVsMessagePassingPage() {
  const [rpcFailed, setRpcFailed] = useState(false);
  const [rpcStatus, setRpcStatus] = useState<RpcStatus>("Idle");
  const [rpcSteps, setRpcSteps] = useState<RpcStep[]>([]);
  const [activeRpcNode, setActiveRpcNode] = useState<RpcNode | null>(null);
  const [rpcRunning, setRpcRunning] = useState(false);
  const [rpcRequestCount, setRpcRequestCount] = useState(0);

  const [queue, setQueue] = useState<QueueMessage[]>([]);
  const [consumerRunning, setConsumerRunning] = useState(true);
  const [autoProcessing, setAutoProcessing] = useState(false);
  const [producedCount, setProducedCount] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [activeMessage, setActiveMessage] = useState<QueueMessage | null>(null);

  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 1,
      text: "Simulator ready. Compare a direct RPC call with queue-based Message Passing.",
      tone: "normal",
    },
  ]);

  const rpcTimersRef = useRef<number[]>([]);
  const queueTimersRef = useRef<number[]>([]);
  const logIdRef = useRef(1);
  const messageIdRef = useRef(0);
  const queueRef = useRef<QueueMessage[]>([]);
  const consumerRunningRef = useRef(true);

  function clearRpcTimers() {
    rpcTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    rpcTimersRef.current = [];
  }

  function clearQueueTimers() {
    queueTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    queueTimersRef.current = [];
  }

  function addLog(text: string, tone: LogTone = "normal") {
    logIdRef.current += 1;
    const nextLog = { id: logIdRef.current, text, tone };
    setLogs((currentLogs) => [nextLog, ...currentLogs].slice(0, 16));
  }

  function delay(ms: number) {
    return new Promise<void>((resolve) => {
      const timerId = window.setTimeout(resolve, ms);
      rpcTimersRef.current.push(timerId);
    });
  }

  async function sendRpcRequest() {
    clearRpcTimers();
    const nextRequestNumber = rpcRequestCount + 1;
    const steps = rpcFailed ? failedRpcSteps : healthyRpcSteps;

    setRpcRequestCount(nextRequestNumber);
    setRpcSteps([]);
    setActiveRpcNode(null);
    setRpcRunning(true);
    setRpcStatus("Waiting");
    addLog(`RPC Request #${nextRequestNumber} sent to service`, "normal");

    for (const step of steps) {
      setActiveRpcNode(step.node);
      setRpcSteps((currentSteps) => [...currentSteps, step]);
      await delay(stepDelay);
    }

    if (rpcFailed) {
      setRpcStatus("Failed");
      addLog(`RPC Request #${nextRequestNumber} failed because the service is unavailable`, "error");
    } else {
      setRpcStatus("Success");
      addLog(`RPC Request #${nextRequestNumber} completed successfully`, "success");
    }

    setRpcRunning(false);
    setActiveRpcNode(null);
  }

  function toggleRpcFailure() {
    setRpcFailed((currentValue) => {
      const nextValue = !currentValue;
      addLog(
        nextValue
          ? "RPC Service failure enabled. Direct calls now fail immediately."
          : "RPC Service recovered. Direct calls can complete again.",
        nextValue ? "error" : "success",
      );
      return nextValue;
    });
  }

  function produceMessage() {
    const nextId = messageIdRef.current + 1;
    const content = messageTemplates[(nextId - 1) % messageTemplates.length];
    const nextMessage = { id: nextId, content };

    messageIdRef.current = nextId;
    setQueue((currentQueue) => [...currentQueue, nextMessage]);
    setProducedCount((count) => count + 1);
    addLog(`Message #${nextId} added to queue: ${content}`, "success");

    if (!consumerRunningRef.current) {
      addLog("Consumer is stopped. Message remains in queue.", "warning");
    }
  }

  function processNextMessage() {
    if (!consumerRunningRef.current) {
      addLog("Consumer is stopped. Message remains in queue.", "warning");
      return false;
    }

    const nextMessage = queueRef.current[0];

    if (!nextMessage) {
      addLog("Queue is empty. No message is available for the consumer.", "normal");
      return false;
    }

    setQueue((currentQueue) => currentQueue.slice(1));
    setProcessedCount((count) => count + 1);
    setActiveMessage(nextMessage);
    addLog(`Consumer processed Message #${nextMessage.id}`, "success");

    const timerId = window.setTimeout(() => {
      setActiveMessage((currentMessage) =>
        currentMessage?.id === nextMessage.id ? null : currentMessage,
      );
      queueTimersRef.current = queueTimersRef.current.filter((id) => id !== timerId);
    }, 600);
    queueTimersRef.current.push(timerId);

    return true;
  }

  function autoProcessQueue() {
    if (autoProcessing) {
      return;
    }

    if (!consumerRunningRef.current) {
      addLog("Auto processing cannot continue because the consumer is stopped.", "warning");
      return;
    }

    if (queueRef.current.length === 0) {
      addLog("Auto processing found an empty queue.", "normal");
      return;
    }

    setAutoProcessing(true);
    addLog("Auto Process Queue started.", "normal");
    scheduleAutoProcess();
  }

  function scheduleAutoProcess() {
    const timerId = window.setTimeout(() => {
      queueTimersRef.current = queueTimersRef.current.filter((id) => id !== timerId);

      if (!consumerRunningRef.current) {
        setAutoProcessing(false);
        addLog("Auto processing paused because the consumer is stopped.", "warning");
        return;
      }

      const processed = processNextMessage();

      if (!processed || queueRef.current.length <= 1) {
        setAutoProcessing(false);
        addLog("Auto Process Queue finished.", "success");
        return;
      }

      scheduleAutoProcess();
    }, autoProcessDelay);

    queueTimersRef.current.push(timerId);
  }

  function toggleConsumer() {
    setConsumerRunning((currentValue) => {
      const nextValue = !currentValue;

      if (!nextValue) {
        setAutoProcessing(false);
        setActiveMessage(null);
        clearQueueTimers();
      }

      addLog(
        nextValue
          ? "Consumer is running again and can process queued messages."
          : "Consumer stopped. New messages will wait in the queue.",
        nextValue ? "success" : "warning",
      );

      return nextValue;
    });
  }

  function resetQueue() {
    clearQueueTimers();
    messageIdRef.current = 0;
    logIdRef.current = 1;
    setQueue([]);
    setProducedCount(0);
    setProcessedCount(0);
    setActiveMessage(null);
    setAutoProcessing(false);
    setConsumerRunning(true);
    setLogs([
      {
        id: 1,
        text: "Queue reset. Producer, Queue, and Consumer counters are clear.",
        tone: "normal",
      },
    ]);
  }

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    consumerRunningRef.current = consumerRunning;
  }, [consumerRunning]);

  useEffect(() => {
    return () => {
      clearRpcTimers();
      clearQueueTimers();
    };
  }, []);

  return (
    <PageShell
      title="RPC vs Message Passing Simulator"
      subtitle="This simulator compares direct synchronous RPC calls with queue-based Message Passing. It shows how RPC makes the client wait for a service response, while Message Passing lets a producer place work into a queue for consumers to process later."
      guide={guide}
    >
      <section className="grid gap-4 xl:grid-cols-2">
        <SimulatorPanel
          title="RPC Direct Call"
          summary="A client calls a service directly and waits until the service responds or fails."
        >
          <div className="grid gap-4 md:grid-cols-[1fr_120px_1fr] md:items-center">
            <RpcNodeCard
              title="Client"
              detail={rpcStatus === "Waiting" ? "Waiting for response" : "Caller"}
              active={activeRpcNode === "client"}
            />
            <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-3 text-center text-sm font-semibold text-cyan-900">
              Direct synchronous call
            </div>
            <RpcNodeCard
              title="RPC Service"
              detail={rpcFailed ? "Unavailable" : "Healthy service"}
              active={activeRpcNode === "service"}
              failed={rpcFailed}
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <ActionButton onClick={sendRpcRequest} disabled={rpcRunning}>
              Send RPC Request
            </ActionButton>
            <ActionButton
              onClick={toggleRpcFailure}
              disabled={rpcRunning}
              variant={rpcFailed ? "danger" : "secondary"}
            >
              Toggle RPC Service Failure
            </ActionButton>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <MetricBox label="RPC status" value={rpcStatus} tone={getRpcTone(rpcStatus)} />
            <MetricBox
              label="Service availability"
              value={rpcFailed ? "Failed" : "Healthy"}
              tone={rpcFailed ? "error" : "success"}
            />
          </div>

          <StepList steps={rpcSteps} emptyText="Send an RPC request to see the synchronous call flow." />
        </SimulatorPanel>

        <SimulatorPanel
          title="Message Passing"
          summary="A producer places work into a queue, and a consumer processes messages when it is able to run."
        >
          <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr_1fr]">
            <MessageNodeCard title="Producer" detail="Adds work without waiting" />
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-950">Queue</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Oldest message is processed first.
                  </p>
                </div>
                <span className="rounded-full bg-cyan-100 px-3 py-1 text-sm font-semibold text-cyan-900">
                  {queue.length} waiting
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {queue.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm leading-6 text-slate-600">
                    No messages in queue. Produce a message first.
                  </div>
                ) : (
                  queue.map((message) => (
                    <div
                      key={message.id}
                      className="rounded-lg border border-cyan-200 bg-white p-3 text-sm shadow-sm"
                    >
                      <p className="font-semibold text-slate-950">
                        Message #{message.id}: {message.content}
                      </p>
                      <p className="mt-1 text-slate-600">Waiting for consumer</p>
                    </div>
                  ))
                )}
              </div>
            </div>
            <MessageNodeCard
              title="Consumer"
              detail={
                activeMessage
                  ? `Processed Message #${activeMessage.id}`
                  : consumerRunning
                    ? "Running"
                    : "Stopped"
              }
              active={Boolean(activeMessage)}
              stopped={!consumerRunning}
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <ActionButton onClick={produceMessage}>Produce Message</ActionButton>
            <ActionButton onClick={processNextMessage} disabled={autoProcessing}>
              Process Next Message
            </ActionButton>
            <ActionButton onClick={autoProcessQueue} disabled={autoProcessing}>
              Auto Process Queue
            </ActionButton>
            <ActionButton
              onClick={toggleConsumer}
              variant={consumerRunning ? "danger" : "secondary"}
            >
              {consumerRunning ? "Stop Consumer" : "Start Consumer"}
            </ActionButton>
            <ActionButton onClick={resetQueue} variant="secondary">
              Reset Queue
            </ActionButton>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricBox label="Queue length" value={queue.length} />
            <MetricBox label="Produced count" value={producedCount} />
            <MetricBox label="Processed count" value={processedCount} />
            <MetricBox
              label="Consumer status"
              value={consumerRunning ? "Running" : "Stopped"}
              tone={consumerRunning ? "success" : "warning"}
            />
          </div>
        </SimulatorPanel>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">Simulation Log</h2>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {logs.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              No events yet. Run a simulation to see the flow.
            </p>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className={`rounded-lg border p-3 text-sm leading-6 ${getToneClass(log.tone)}`}
              >
                {log.text}
              </div>
            ))
          )}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <ExplanationCard
          title="RPC"
          items={[
            "Direct communication",
            "Synchronous request/response",
            "Client waits",
            "Simple mental model",
            "Failure affects the caller immediately",
          ]}
        />
        <ExplanationCard
          title="Message Passing"
          items={[
            "Producer sends message to queue",
            "Consumer processes later",
            "Producer and consumer are decoupled",
            "Queue absorbs bursts of work",
            "Useful when consumers are slow or temporarily unavailable",
          ]}
        />
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">
          Which Distributed Systems concepts does this prove?
        </h2>
        <ul className="mt-4 grid gap-3 text-slate-700 md:grid-cols-2">
          {[
            "RPC is direct and synchronous.",
            "Message Passing uses a queue between producer and consumer.",
            "Queues decouple services.",
            "Producers can continue sending work even if consumers are temporarily stopped.",
            "Slow consumers cause queue buildup instead of immediate producer failure.",
            "Different communication styles create different failure and latency behavior.",
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

function SimulatorPanel({
  title,
  summary,
  children,
}: {
  title: string;
  summary: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-2xl font-bold text-slate-950">{title}</h2>
        <p className="mt-2 leading-7 text-slate-700">{summary}</p>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function RpcNodeCard({
  title,
  detail,
  active,
  failed = false,
}: {
  title: string;
  detail: string;
  active: boolean;
  failed?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-4 transition-colors ${
        failed
          ? "border-rose-200 bg-rose-50"
          : active
            ? "border-cyan-400 bg-cyan-50 ring-2 ring-cyan-100"
            : "border-slate-200 bg-slate-50"
      }`}
    >
      <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
      <p
        className={`mt-2 text-sm leading-6 ${
          failed ? "text-rose-700" : "text-slate-600"
        }`}
      >
        {detail}
      </p>
    </div>
  );
}

function MessageNodeCard({
  title,
  detail,
  active = false,
  stopped = false,
}: {
  title: string;
  detail: string;
  active?: boolean;
  stopped?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-4 transition-colors ${
        stopped
          ? "border-amber-200 bg-amber-50"
          : active
            ? "border-emerald-300 bg-emerald-50 ring-2 ring-emerald-100"
            : "border-slate-200 bg-slate-50"
      }`}
    >
      <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
    </div>
  );
}

function StepList({
  steps,
  emptyText,
}: {
  steps: RpcStep[];
  emptyText: string;
}) {
  return (
    <ol className="mt-5 space-y-3">
      {steps.length === 0 ? (
        <li className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
          {emptyText}
        </li>
      ) : (
        steps.map((step, index) => (
          <li
            key={`${step.text}-${index}`}
            className={`rounded-lg border p-3 text-sm leading-6 ${getToneClass(step.tone)}`}
          >
            <span className="mr-2 font-semibold">{index + 1}.</span>
            {step.text}
          </li>
        ))
      )}
    </ol>
  );
}

function ExplanationCard({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">{title}</h2>
      <ul className="mt-4 space-y-3 text-slate-700">
        {items.map((item) => (
          <li key={item} className="flex gap-3 leading-7">
            <span className="mt-3 h-2 w-2 shrink-0 rounded-full bg-cyan-600" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function MetricBox({
  label,
  value,
  tone = "normal",
}: {
  label: string;
  value: string | number;
  tone?: LogTone;
}) {
  return (
    <div className={`rounded-lg border p-3 ${getToneClass(tone)}`}>
      <p className="text-sm font-semibold">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
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

function getRpcTone(status: RpcStatus): LogTone {
  if (status === "Success") {
    return "success";
  }

  if (status === "Failed") {
    return "error";
  }

  if (status === "Waiting") {
    return "warning";
  }

  return "normal";
}

function getToneClass(tone: LogTone = "normal") {
  if (tone === "success") {
    return "border-emerald-200 bg-emerald-50 text-emerald-900";
  }

  if (tone === "warning") {
    return "border-amber-200 bg-amber-50 text-amber-900";
  }

  if (tone === "error") {
    return "border-rose-200 bg-rose-50 text-rose-900";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}
