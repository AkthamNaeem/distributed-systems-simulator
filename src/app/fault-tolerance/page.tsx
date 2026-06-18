"use client";

import { useEffect, useRef, useState } from "react";
import { PageShell } from "@/components/PageShell";

type ServiceStatus = "Healthy" | "Slow" | "Failed";
type CircuitBreakerState = "Closed" | "Open" | "Half-Open";
type LogTone = "normal" | "success" | "warning" | "error";

type LogEntry = {
  id: number;
  text: string;
  tone?: LogTone;
};

const retryDelay = 520;
const initialLogs: LogEntry[] = [
  {
    id: 1,
    text: "Lab ready. Payment Service is Healthy and Circuit Breaker is Closed.",
    tone: "success",
  },
];

const conceptCards = [
  {
    title: "Retry + Backoff",
    explanation:
      "Retry tries again after failure. Backoff waits longer between attempts so the failing system has time to recover.",
  },
  {
    title: "Circuit Breaker",
    explanation:
      "Circuit Breaker stops sending requests to a failing service temporarily so the system does not keep overloading it.",
  },
  {
    title: "Fallback",
    explanation:
      "Fallback returns an acceptable alternative response when the ideal service is unavailable.",
  },
  {
    title: "Health Check",
    explanation:
      "Health Check actively checks whether a service is ready to receive traffic.",
  },
  {
    title: "Heartbeat",
    explanation:
      "Heartbeat is a periodic signal used to know if a component is still alive.",
  },
];

const guide = {
  howToUse: [
    "Set the Payment Service to Healthy, Slow, or Failed.",
    "Test Retry + Backoff, Circuit Breaker, Fallback, Health Check, and Heartbeat.",
    "Use Half-Open recovery after the Circuit Breaker opens.",
  ],
  observe: [
    "Slow services trigger retry and backoff before success.",
    "Failed services return fallback responses.",
    "The Circuit Breaker blocks repeated calls after failures.",
  ],
  concepts: [
    "Retry, backoff, circuit breaker, fallback, health check, and heartbeat.",
    "Acceptable service during component failure.",
    "Fault tolerance manages failure instead of eliminating it.",
  ],
};

export default function FaultTolerancePage() {
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus>("Healthy");
  const [retryRunning, setRetryRunning] = useState(false);
  const [retrySteps, setRetrySteps] = useState<LogEntry[]>([]);
  const [retryResult, setRetryResult] = useState("No retry request sent yet.");
  const [activeNode, setActiveNode] = useState<string | null>(null);

  const [breakerState, setBreakerState] =
    useState<CircuitBreakerState>("Closed");
  const [failureCount, setFailureCount] = useState(0);
  const [breakerResult, setBreakerResult] = useState(
    "No circuit breaker request sent yet.",
  );

  const [healthMessage, setHealthMessage] = useState(
    "Run a health check to classify the Payment Service.",
  );
  const [heartbeatMessage, setHeartbeatMessage] = useState(
    "Send a heartbeat to monitor liveness.",
  );
  const [heartbeatsSent, setHeartbeatsSent] = useState(0);
  const [heartbeatsMissed, setHeartbeatsMissed] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);

  const logIdRef = useRef(1);
  const timersRef = useRef<number[]>([]);

  function clearTimers() {
    timersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    timersRef.current = [];
  }

  function addLog(text: string, tone: LogTone = "normal") {
    logIdRef.current += 1;
    const nextLog = { id: logIdRef.current, text, tone };
    setLogs((currentLogs) => [nextLog, ...currentLogs].slice(0, 14));
    return nextLog;
  }

  function addRetryStep(text: string, tone: LogTone = "normal") {
    const step = addLog(text, tone);
    setRetrySteps((currentSteps) => [...currentSteps, step]);
  }

  function delay(ms: number) {
    return new Promise<void>((resolve) => {
      const timerId = window.setTimeout(() => {
        timersRef.current = timersRef.current.filter((id) => id !== timerId);
        resolve();
      }, ms);
      timersRef.current.push(timerId);
    });
  }

  function setService(nextStatus: ServiceStatus) {
    clearTimers();
    setRetryRunning(false);
    setActiveNode(null);
    setServiceStatus(nextStatus);
    addLog(`Payment Service status set to ${nextStatus}`, getStatusTone(nextStatus));
  }

  function resetLab() {
    clearTimers();
    logIdRef.current = 1;
    setServiceStatus("Healthy");
    setRetryRunning(false);
    setRetrySteps([]);
    setRetryResult("No retry request sent yet.");
    setActiveNode(null);
    setBreakerState("Closed");
    setFailureCount(0);
    setBreakerResult("No circuit breaker request sent yet.");
    setHealthMessage("Run a health check to classify the Payment Service.");
    setHeartbeatMessage("Send a heartbeat to monitor liveness.");
    setHeartbeatsSent(0);
    setHeartbeatsMissed(0);
    setLogs(initialLogs);
  }

  async function sendRetryRequest() {
    clearTimers();
    setRetryRunning(true);
    setRetrySteps([]);
    setRetryResult("Request in progress...");
    setActiveNode("Payment Service");
    addRetryStep("Request sent to Payment Service");

    if (serviceStatus === "Healthy") {
      addRetryStep("Attempt 1 succeeded", "success");
      setRetryResult("Payment processed successfully.");
      setRetryRunning(false);
      setActiveNode(null);
      return;
    }

    if (serviceStatus === "Slow") {
      addRetryStep("Attempt 1 failed", "warning");
      addRetryStep("Backing off for 1s", "normal");
      await delay(retryDelay);
      addRetryStep("Attempt 2 failed", "warning");
      addRetryStep("Backing off for 2s", "normal");
      await delay(retryDelay + 260);
      addRetryStep("Attempt 3 succeeded", "success");
      setRetryResult("Payment processed successfully.");
      setRetryRunning(false);
      setActiveNode(null);
      return;
    }

    addRetryStep("Attempt 1 failed", "error");
    addRetryStep("Backing off for 1s", "normal");
    await delay(retryDelay);
    addRetryStep("Attempt 2 failed", "error");
    addRetryStep("Backing off for 2s", "normal");
    await delay(retryDelay + 260);
    addRetryStep("Attempt 3 failed", "error");
    addRetryStep("Fallback response returned", "warning");
    setRetryResult(
      "Fallback response returned: payment status is temporarily unavailable.",
    );
    setActiveNode("Fallback Cache");
    setRetryRunning(false);
  }

  function sendCircuitBreakerRequest() {
    addLog("Request sent through Circuit Breaker");

    if (breakerState === "Open") {
      setBreakerResult(
        "Circuit Breaker is Open. Fallback response returned immediately.",
      );
      setActiveNode("Fallback Cache");
      addLog("Circuit Breaker blocked the request", "warning");
      addLog("Fallback response returned", "warning");
      return;
    }

    setActiveNode("Payment Service");

    if (serviceStatus === "Healthy") {
      setBreakerResult("Payment processed successfully.");
      setFailureCount(0);
      setBreakerState("Closed");
      addLog("Payment Service request succeeded", "success");
      addLog("Circuit Breaker is Closed", "success");
      return;
    }

    const nextFailureCount = breakerState === "Half-Open" ? 3 : failureCount + 1;
    setFailureCount(nextFailureCount);
    setBreakerResult(
      serviceStatus === "Slow"
        ? "Payment Service timed out. Fallback response returned."
        : "Payment Service failed. Fallback response returned.",
    );
    setActiveNode("Fallback Cache");
    addLog("Payment Service request failed", "error");
    addLog("Fallback response returned", "warning");

    if (nextFailureCount >= 3) {
      setBreakerState("Open");
      addLog("Circuit Breaker opened after 3 failures", "error");
    }
  }

  function tryHalfOpenRecovery() {
    setBreakerState("Half-Open");
    setBreakerResult(
      "Circuit Breaker is Half-Open. Send one test request through the breaker.",
    );
    addLog("Circuit Breaker moved to Half-Open for a recovery test", "warning");
  }

  function runHealthCheck() {
    if (serviceStatus === "Healthy") {
      setHealthMessage("Health Check passed");
      addLog("Health Check passed", "success");
      return;
    }

    if (serviceStatus === "Slow") {
      setHealthMessage("Health Check warning: high latency");
      addLog("Health Check warning: high latency", "warning");
      return;
    }

    setHealthMessage("Health Check failed: service marked unhealthy");
    addLog("Health Check failed", "error");
  }

  function sendHeartbeat() {
    setHeartbeatsSent((count) => count + 1);

    if (serviceStatus === "Healthy") {
      setHeartbeatMessage("Heartbeat received");
      addLog("Heartbeat received", "success");
      return;
    }

    if (serviceStatus === "Slow") {
      setHeartbeatMessage("Heartbeat delayed");
      addLog("Heartbeat delayed", "warning");
      return;
    }

    setHeartbeatMessage("Heartbeat missed");
    setHeartbeatsMissed((count) => count + 1);
    addLog("Heartbeat missed", "error");
  }

  useEffect(() => {
    return () => clearTimers();
  }, []);

  const systemAvailability = getSystemAvailability(serviceStatus);

  return (
    <PageShell
      title="Fault Tolerance Lab"
      subtitle="This lab shows how distributed systems continue providing acceptable service when a component fails. It demonstrates retry with backoff, circuit breaker, fallback responses, health checks, and heartbeat monitoring."
      guide={guide}
    >
      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-950">
                Service Visualization
              </h2>
              <p className="mt-2 max-w-3xl leading-7 text-slate-700">
                The Payment Service is the main dependency. Change its state to
                observe retries, fallback, and protection behavior.
              </p>
            </div>
            <StatusBadge label="Payment Service" value={serviceStatus} />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {[
              ["Client", "Starts the request"],
              ["API Gateway", "Routes and protects calls"],
              ["Payment Service", serviceStatus],
              ["Fallback Cache", "Last known safe status"],
              ["Health Monitor", systemAvailability],
            ].map(([name, detail]) => (
              <NodeCard
                key={name}
                title={name}
                detail={detail}
                active={activeNode === name}
                status={name === "Payment Service" ? serviceStatus : undefined}
              />
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <ActionButton onClick={() => setService("Healthy")}>
              Set Service Healthy
            </ActionButton>
            <ActionButton
              onClick={() => setService("Slow")}
              variant="secondary"
            >
              Set Service Slow
            </ActionButton>
            <ActionButton onClick={() => setService("Failed")} variant="danger">
              Set Service Failed
            </ActionButton>
            <ActionButton onClick={resetLab} variant="secondary">
              Reset Lab
            </ActionButton>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Try the same request under each service state to compare normal,
            degraded, and failed behavior.
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">
            Acceptable Service During Failure
          </h2>
          <p className="mt-3 leading-7 text-slate-700">
            When the live Payment Service is slow or failed, the lab still
            returns a safe fallback response instead of a total user-facing
            failure.
          </p>
          <div className="mt-4 grid gap-3">
            <MetricBox label="System view" value={systemAvailability} />
            <MetricBox label="Circuit Breaker" value={breakerState} />
            <MetricBox label="Failure count" value={failureCount} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <SimulatorPanel
          title="Retry + Backoff Demo"
          summary="Retry attempts the same request again. Backoff waits longer before each next attempt."
        >
          <ActionButton onClick={sendRetryRequest} disabled={retryRunning}>
            Send Request with Retry + Backoff
          </ActionButton>

          <ResultBox text={retryResult} />

          <ol className="mt-4 space-y-3">
            {retrySteps.length === 0 ? (
              <li className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                Send a request to see attempt logs and conceptual backoff.
              </li>
            ) : (
              retrySteps.map((step) => (
                <li
                  key={step.id}
                  className={`rounded-lg border p-3 text-sm leading-6 ${getToneClass(step.tone)}`}
                >
                  {step.text}
                </li>
              ))
            )}
          </ol>
        </SimulatorPanel>

        <SimulatorPanel
          title="Circuit Breaker Demo"
          summary="Closed allows calls, Open blocks calls, and Half-Open allows one recovery test request."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <MetricBox label="Current state" value={breakerState} />
            <MetricBox label="Failed requests" value={failureCount} />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <ActionButton onClick={sendCircuitBreakerRequest}>
              Send Request through Circuit Breaker
            </ActionButton>
            <ActionButton onClick={tryHalfOpenRecovery} variant="secondary">
              Try Half-Open Recovery
            </ActionButton>
          </div>
          <ResultBox text={breakerResult} />
        </SimulatorPanel>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <SimulatorPanel
          title="Fallback Demo"
          summary="Fallback provides a graceful Plan B instead of showing a total failure to the user."
        >
          <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-4">
            <p className="text-sm font-semibold text-cyan-900">
              Source: Fallback Cache
            </p>
            <p className="mt-3 leading-7 text-cyan-950">
              We cannot confirm the live payment status now. Showing last known
              safe status.
            </p>
          </div>
        </SimulatorPanel>

        <SimulatorPanel
          title="Health Check Demo"
          summary="Health checks actively test whether the dependency is ready for traffic."
        >
          <ActionButton onClick={runHealthCheck}>Run Health Check</ActionButton>
          <ResultBox text={healthMessage} />
          <MetricBox label="System considers service" value={systemAvailability} />
        </SimulatorPanel>

        <SimulatorPanel
          title="Heartbeat Demo"
          summary="Heartbeats are lightweight liveness signals sent to monitored components."
        >
          <ActionButton onClick={sendHeartbeat}>Send Heartbeat</ActionButton>
          <ResultBox text={heartbeatMessage} />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <MetricBox label="Heartbeats sent" value={heartbeatsSent} />
            <MetricBox label="Heartbeats missed" value={heartbeatsMissed} />
          </div>
        </SimulatorPanel>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">Recent Event Log</h2>
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

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {conceptCards.map((concept) => (
          <article
            key={concept.title}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-xl font-bold text-slate-950">
              {concept.title}
            </h2>
            <p className="mt-3 leading-7 text-slate-700">
              {concept.explanation}
            </p>
          </article>
        ))}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">
          Which Distributed Systems concepts does this prove?
        </h2>
        <ul className="mt-4 grid gap-3 text-slate-700 md:grid-cols-2">
          {[
            "A distributed system can continue operating even when one component fails.",
            "Retry handles temporary failures.",
            "Backoff prevents aggressive repeated calls.",
            "Circuit Breaker protects a struggling service from more traffic.",
            "Fallback provides acceptable service instead of total failure.",
            "Health Checks help detect unavailable services.",
            "Heartbeats help monitor whether components are still alive.",
            "Fault tolerance manages failure; it does not eliminate failure.",
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
      <h2 className="text-2xl font-bold text-slate-950">{title}</h2>
      <p className="mt-2 leading-7 text-slate-700">{summary}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function NodeCard({
  title,
  detail,
  active,
  status,
}: {
  title: string;
  detail: string;
  active: boolean;
  status?: ServiceStatus;
}) {
  const statusClass =
    status === "Failed"
      ? "border-rose-200 bg-rose-50"
      : status === "Slow"
        ? "border-amber-200 bg-amber-50"
        : active
          ? "border-cyan-400 bg-cyan-50 ring-2 ring-cyan-100"
          : "border-slate-200 bg-slate-50";

  return (
    <article className={`rounded-lg border p-4 transition-colors ${statusClass}`}>
      <h3 className="font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
    </article>
  );
}

function StatusBadge({
  label,
  value,
}: {
  label: string;
  value: ServiceStatus;
}) {
  const toneClass =
    value === "Healthy"
      ? "bg-emerald-100 text-emerald-800"
      : value === "Slow"
        ? "bg-amber-100 text-amber-800"
        : "bg-rose-100 text-rose-800";

  return (
    <div className={`w-fit rounded-full px-3 py-1 text-sm font-semibold ${toneClass}`}>
      {label}: {value}
    </div>
  );
}

function ResultBox({ text }: { text: string }) {
  return (
    <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-800">
      {text}
    </div>
  );
}

function MetricBox({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-sm font-semibold text-slate-600">{label}</p>
      <p className="mt-1 text-lg font-bold text-slate-950">{value}</p>
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

function getSystemAvailability(status: ServiceStatus) {
  if (status === "Healthy") {
    return "Available";
  }

  if (status === "Slow") {
    return "Degraded";
  }

  return "Unavailable";
}

function getStatusTone(status: ServiceStatus): LogTone {
  if (status === "Healthy") {
    return "success";
  }

  if (status === "Slow") {
    return "warning";
  }

  return "error";
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
