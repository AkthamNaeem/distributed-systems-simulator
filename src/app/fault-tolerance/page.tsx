"use client";

import { useEffect, useRef, useState } from "react";
import { PageShell } from "@/components/PageShell";

type BreakerState = "Closed" | "Open" | "Half-Open";
type Phase = "idle" | "client" | "controller" | "primary" | "backoff" | "fallback" | "return" | "heartbeat";
type Tone = "normal" | "success" | "warning" | "error";
type Concept = "Retry + Backoff" | "Circuit Breaker" | "Fallback" | "Heartbeat";
type Event = { id: number; text: string; tone: Tone };

const BACKOFFS = [0, 1, 2, 4];
const SCALED_MS = [0, 360, 620, 900];
const initialEvents: Event[] = [
  { id: 1, text: "Lab ready. Primary service is healthy; circuit is Closed.", tone: "success" },
];

const guide = {
  howToUse: [
    "Send a healthy request, then switch Primary Failure on and send another.",
    "Watch retries wait longer, the breaker open, and fallback preserve service.",
    "Restore the primary, run a heartbeat, then test the Half-Open circuit.",
  ],
  observe: [
    "Packets show where each request is allowed to travel.",
    "An Open circuit blocks primary calls immediately.",
    "Health information guides recovery without real networking.",
  ],
  concepts: [
    "Retry, exponential backoff, circuit breaker, fallback, and heartbeat.",
    "Partial failure and acceptable degraded service.",
    "Fault tolerance manages failure; it does not prevent it.",
  ],
};

const explanations: Record<Concept, { proven: string; demonstrates: string; matters: string }> = {
  "Retry + Backoff": {
    proven: "Controlled recovery",
    demonstrates: "The controller retries, but waits longer before every new attempt.",
    matters: "Immediate repeated retries can overload a service that is already struggling.",
  },
  "Circuit Breaker": {
    proven: "Failure isolation",
    demonstrates: "The system stops sending traffic to a failing component, then allows one recovery test.",
    matters: "Protecting the rest of the system is better than making endless failed calls.",
  },
  Fallback: {
    proven: "Acceptable service during failure",
    demonstrates: "The user receives a safe cached response when the ideal service is unavailable.",
    matters: "A useful degraded response is often better than a total failure.",
  },
  Heartbeat: {
    proven: "Health monitoring",
    demonstrates: "A liveness check updates service health and informs breaker recovery.",
    matters: "Routing and recovery decisions need current health information.",
  },
};

export default function FaultTolerancePage() {
  const [primaryFailing, setPrimaryFailing] = useState(false);
  const [fallbackEnabled, setFallbackEnabled] = useState(true);
  const [breaker, setBreaker] = useState<BreakerState>("Closed");
  const [phase, setPhase] = useState<Phase>("idle");
  const [busy, setBusy] = useState(false);
  const [requestId, setRequestId] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [backoff, setBackoff] = useState(0);
  const [retryStates, setRetryStates] = useState<Array<"pending" | "active" | "failed" | "success">>(["pending", "pending", "pending", "pending"]);
  const [successes, setSuccesses] = useState(0);
  const [failures, setFailures] = useState(0);
  const [fallbacks, setFallbacks] = useState(0);
  const [heartbeat, setHeartbeat] = useState("Not checked");
  const [result, setResult] = useState("Ready for a request.");
  const [concept, setConcept] = useState<Concept>("Retry + Backoff");
  const [events, setEvents] = useState<Event[]>(initialEvents);

  const runRef = useRef(0);
  const eventIdRef = useRef(1);
  const requestIdRef = useRef(0);
  const primaryFailingRef = useRef(false);
  const fallbackEnabledRef = useRef(true);
  const breakerRef = useRef<BreakerState>("Closed");

  function log(text: string, tone: Tone = "normal") {
    const id = ++eventIdRef.current;
    const event = { id, text, tone };
    setEvents((current) => [event, ...current].slice(0, 9));
  }

  function updateBreaker(next: BreakerState) {
    breakerRef.current = next;
    setBreaker(next);
  }

  async function pause(ms: number, run: number) {
    await new Promise((resolve) => window.setTimeout(resolve, ms));
    return runRef.current === run;
  }

  async function finishWithFallback(id: number, run: number) {
    if (fallbackEnabledRef.current) {
      setConcept("Fallback");
      setPhase("fallback");
      setFallbacks((value) => value + 1);
      setResult("Safe cached response returned — service is degraded, but still useful.");
      log(`Fallback response returned for request #${id}.`, "warning");
      if (!(await pause(420, run))) return;
      setPhase("return");
    } else {
      setFailures((value) => value + 1);
      setResult("Request failed — no fallback is available.");
      log(`Request #${id} failed with no fallback.`, "error");
      setPhase("return");
    }
    await pause(380, run);
    if (runRef.current === run) setPhase("idle");
  }

  async function runOneRequest(run: number) {
    requestIdRef.current += 1;
    const id = requestIdRef.current;
    setRequestId(id);
    setAttempt(0);
    setBackoff(0);
    setRetryStates(["pending", "pending", "pending", "pending"]);
    setResult(`Request #${id} is moving through the system…`);
    setPhase("client");
    log(`Request #${id} sent by the client.`);
    if (!(await pause(300, run))) return;

    setPhase("controller");
    if (!(await pause(340, run))) return;

    if (breakerRef.current === "Open") {
      setConcept("Circuit Breaker");
      setResult("Circuit is Open — primary call blocked immediately.");
      log(`Circuit blocked request #${id}; primary service was not called.`, "error");
      await finishWithFallback(id, run);
      return;
    }

    const halfOpenTest = breakerRef.current === "Half-Open";
    if (halfOpenTest) log(`Half-Open circuit allowed one test request #${id}.`, "warning");

    for (let index = 0; index < BACKOFFS.length; index += 1) {
      const attemptNumber = index + 1;
      setAttempt(attemptNumber);
      setBackoff(BACKOFFS[index]);
      setRetryStates((states) => states.map((state, i) => (i === index ? "active" : state)));

      if (index > 0) {
        setConcept("Retry + Backoff");
        setPhase("backoff");
        log(`Waiting ${BACKOFFS[index]}s simulated backoff before attempt ${attemptNumber}.`, "warning");
        if (!(await pause(SCALED_MS[index], run))) return;
        setPhase("controller");
        if (!(await pause(180, run))) return;
      }

      setPhase("primary");
      log(`Request #${id}, attempt ${attemptNumber}, sent to primary service.`);
      if (!(await pause(420, run))) return;

      if (!primaryFailingRef.current) {
        setRetryStates((states) => states.map((state, i) => (i === index ? "success" : state)));
        setSuccesses((value) => value + 1);
        setBackoff(0);
        setResult(`Request #${id} succeeded from the primary service.`);
        log(`Attempt ${attemptNumber} succeeded.`, "success");
        if (halfOpenTest) {
          updateBreaker("Closed");
          setConcept("Circuit Breaker");
          log("Recovery test passed; Circuit Breaker closed.", "success");
        }
        setPhase("return");
        await pause(420, run);
        if (runRef.current === run) setPhase("idle");
        return;
      }

      setRetryStates((states) => states.map((state, i) => (i === index ? "failed" : state)));
      log(`Attempt ${attemptNumber} failed.`, "error");

      if (halfOpenTest) {
        updateBreaker("Open");
        setConcept("Circuit Breaker");
        log("Recovery test failed; Circuit Breaker opened again.", "error");
        await finishWithFallback(id, run);
        return;
      }
    }

    updateBreaker("Open");
    setConcept("Circuit Breaker");
    log("Circuit Breaker opened after repeated failures.", "error");
    setResult("Retries exhausted; circuit opened to isolate the failure.");
    await finishWithFallback(id, run);
  }

  async function sendRequests(count: number) {
    if (busy) return;
    const run = ++runRef.current;
    setBusy(true);
    for (let index = 0; index < count; index += 1) {
      if (runRef.current !== run) break;
      await runOneRequest(run);
      if (index < count - 1 && !(await pause(220, run))) break;
    }
    if (runRef.current === run) setBusy(false);
  }

  function toggleFailure() {
    const next = !primaryFailingRef.current;
    primaryFailingRef.current = next;
    setPrimaryFailing(next);
    setHeartbeat("Not checked");
    log(`Primary service switched ${next ? "to failing" : "back to healthy"}.`, next ? "error" : "success");
  }

  function toggleFallback() {
    const next = !fallbackEnabledRef.current;
    fallbackEnabledRef.current = next;
    setFallbackEnabled(next);
    log(`Fallback ${next ? "enabled" : "disabled"}.`, next ? "success" : "warning");
  }

  async function runHeartbeat() {
    if (busy) return;
    const run = ++runRef.current;
    setBusy(true);
    setConcept("Heartbeat");
    setPhase("heartbeat");
    setHeartbeat("Checking…");
    log("Health Monitor sent a heartbeat to the primary service.");
    if (!(await pause(700, run))) return;
    if (primaryFailingRef.current) {
      setHeartbeat("Missed — service down");
      log("Heartbeat missed; primary service is down.", "error");
    } else {
      setHeartbeat("Received — healthy");
      log("Heartbeat received; primary service is healthy.", "success");
      if (breakerRef.current === "Open") {
        updateBreaker("Half-Open");
        log("Heartbeat detected recovery; circuit moved to Half-Open.", "warning");
      }
    }
    setPhase("idle");
    setBusy(false);
  }

  function resetLab() {
    runRef.current += 1;
    eventIdRef.current = 1;
    requestIdRef.current = 0;
    primaryFailingRef.current = false;
    fallbackEnabledRef.current = true;
    breakerRef.current = "Closed";
    setPrimaryFailing(false);
    setFallbackEnabled(true);
    setBreaker("Closed");
    setPhase("idle");
    setBusy(false);
    setRequestId(0);
    setAttempt(0);
    setBackoff(0);
    setRetryStates(["pending", "pending", "pending", "pending"]);
    setSuccesses(0);
    setFailures(0);
    setFallbacks(0);
    setHeartbeat("Not checked");
    setResult("Ready for a request.");
    setConcept("Retry + Backoff");
    setEvents(initialEvents);
  }

  useEffect(() => () => void (runRef.current += 1), []);

  const primaryStatus = primaryFailing ? (heartbeat.startsWith("Missed") ? "Down" : "Failing") : "Healthy";
  const explanation = explanations[concept];

  return (
    <PageShell
      title="Fault Tolerance Lab"
      subtitle="Fault tolerance does not prevent failure. It keeps the system useful by retrying carefully, stopping harmful traffic, using fallback, and monitoring service health."
      guide={guide}
    >
      <div className="flex flex-wrap gap-2" aria-label="Fault tolerance concepts">
        {["Retry + Backoff", "Circuit Breaker", "Fallback", "Health Check", "Heartbeat", "Partial Failure"].map((item) => (
          <span key={item} className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-900">{item}</span>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-cyan-200 bg-gradient-to-br from-white via-sky-50/70 to-cyan-50 shadow-xl shadow-cyan-100/70 ring-1 ring-cyan-100">
        <div className="flex flex-col gap-3 border-b border-cyan-200 bg-white/80 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-800">Live resilience path</p>
            <h2 className="mt-1 text-xl font-bold text-slate-950 sm:text-2xl">Follow one request through partial failure</h2>
          </div>
          <BreakerPill state={breaker} />
        </div>

        <div className="p-4 sm:p-7">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1fr_1fr]">
            <Node title="Client" detail={requestId ? `User request #${requestId}` : "Starts a user request"} icon="U" active={phase === "client" || phase === "return"} tone="cyan" />
            <Node title="FT Controller" detail={breaker === "Open" ? "Blocks harmful traffic" : "Routes, retries & protects"} icon="FT" active={phase === "controller" || phase === "backoff"} tone={breaker === "Open" ? "rose" : breaker === "Half-Open" ? "amber" : "cyan"} />
            <Node title="Primary Service" detail={primaryStatus} icon="P" active={phase === "primary" || phase === "heartbeat"} tone={primaryFailing ? "rose" : "emerald"} />
            <Node title="Fallback Cache" detail={fallbackEnabled ? "Safe response ready" : "Disabled"} icon="F" active={phase === "fallback"} tone={fallbackEnabled ? "amber" : "slate"} />
            <Node title="Health Monitor" detail={heartbeat} icon="♥" active={phase === "heartbeat"} tone={heartbeat.startsWith("Missed") ? "rose" : "cyan"} />
          </div>

          <div className="mt-4 rounded-xl border border-sky-200 bg-white/90 p-4 shadow-sm" aria-live="polite">
            <div className="flex items-center gap-3">
              <span className={`relative flex h-3 w-3 shrink-0 rounded-full ${phase === "idle" ? "bg-slate-400" : phase === "primary" && primaryFailing ? "bg-rose-500" : phase === "backoff" || phase === "fallback" ? "bg-amber-500" : "bg-cyan-500"}`}>
                {phase !== "idle" ? <span className="absolute inset-0 animate-ping rounded-full bg-current opacity-40 motion-reduce:animate-none" /> : null}
              </span>
              <p className="text-sm font-bold text-slate-900 sm:text-base">{result}</p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
              <div className={`h-full rounded-full transition-all duration-500 motion-reduce:transition-none ${phase === "primary" && primaryFailing ? "bg-rose-500" : phase === "backoff" ? "bg-amber-500" : "bg-gradient-to-r from-cyan-500 to-blue-500"}`} style={{ width: phaseWidth(phase) }} />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Retry and backoff attempts">
            {BACKOFFS.map((delay, index) => <AttemptCard key={delay} number={index + 1} delay={delay} state={retryStates[index]} />)}
          </div>
          <p className="mt-2 text-xs text-slate-500">Backoff labels use simulated seconds; real animation time is compressed for learning.</p>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-800">Controls</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">Change the failure conditions</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <ActionButton onClick={() => sendRequests(1)} disabled={busy}>Send Request</ActionButton>
            <ActionButton onClick={() => sendRequests(3)} disabled={busy} variant="secondary">Send Burst ×3</ActionButton>
            <ActionButton onClick={toggleFailure} disabled={busy} variant={primaryFailing ? "danger" : "secondary"} pressed={primaryFailing}>{primaryFailing ? "Primary Failure: On" : "Toggle Primary Failure"}</ActionButton>
            <ActionButton onClick={toggleFallback} disabled={busy} variant={fallbackEnabled ? "secondary" : "danger"} pressed={fallbackEnabled}>{fallbackEnabled ? "Fallback: Enabled" : "Fallback: Disabled"}</ActionButton>
            <ActionButton onClick={runHeartbeat} disabled={busy} variant="secondary">Run Health Check / Heartbeat</ActionButton>
            <ActionButton onClick={resetLab} variant="secondary">Reset Lab</ActionButton>
          </div>
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Status & metrics</p>
          <dl className="mt-4 grid grid-cols-2 gap-3">
            <Metric label="Primary" value={primaryStatus} tone={primaryFailing ? "error" : "success"} />
            <Metric label="Circuit" value={breaker} tone={breaker === "Open" ? "error" : breaker === "Half-Open" ? "warning" : "success"} />
            <Metric label="Retry attempt" value={attempt || "—"} />
            <Metric label="Backoff delay" value={backoff ? `${backoff}s sim.` : "—"} />
            <Metric label="Successful" value={successes} />
            <Metric label="Failed" value={failures} />
            <Metric label="Fallback" value={fallbacks} tone="warning" />
            <Metric label="Heartbeat" value={heartbeat} />
          </dl>
        </aside>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-800">Recent event timeline</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">What the system decided</h2>
          <ol className="mt-5 space-y-2" aria-live="polite">
            {events.map((event, index) => (
              <li key={event.id} className={`flex gap-3 rounded-xl border p-3 text-sm leading-6 ${toneClass(event.tone)}`}>
                <span className="font-mono text-xs font-black opacity-60">{String(events.length - index).padStart(2, "0")}</span>
                <span>{event.text}</span>
              </li>
            ))}
          </ol>
        </div>

        <aside className="rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-800">Academic explanation</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(Object.keys(explanations) as Concept[]).map((item) => (
              <button key={item} type="button" onClick={() => setConcept(item)} className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${concept === item ? "border-cyan-700 bg-cyan-700 text-white" : "border-cyan-200 bg-white text-cyan-900 hover:bg-cyan-100"}`}>{item}</button>
            ))}
          </div>
          <h2 className="mt-5 text-2xl font-bold text-slate-950">{concept}</h2>
          <div className="mt-5 space-y-4">
            <Explanation label="Concept proven" text={explanation.proven} />
            <Explanation label="What this demonstrates" text={explanation.demonstrates} />
            <Explanation label="Why it matters" text={explanation.matters} />
          </div>
          <div className="mt-5 rounded-xl border border-sky-200 bg-white p-4 text-sm leading-6 text-slate-700">
            <strong className="text-slate-950">Partial failure:</strong> the client, controller, cache, and monitor can remain healthy while only the primary service fails. The system can still provide acceptable service.
          </div>
        </aside>
      </section>
    </PageShell>
  );
}

function Node({ title, detail, icon, active, tone }: { title: string; detail: string; icon: string; active: boolean; tone: "cyan" | "emerald" | "amber" | "rose" | "slate" }) {
  const tones = { cyan: "border-cyan-200 bg-cyan-50 text-cyan-900", emerald: "border-emerald-200 bg-emerald-50 text-emerald-900", amber: "border-amber-200 bg-amber-50 text-amber-900", rose: "border-rose-200 bg-rose-50 text-rose-900", slate: "border-slate-200 bg-slate-50 text-slate-700" };
  return (
    <article className={`relative min-h-36 rounded-xl border p-4 transition-all duration-300 motion-reduce:transition-none ${tones[tone]} ${active ? "-translate-y-1 shadow-lg ring-2 ring-current/15 motion-reduce:translate-y-0" : "shadow-sm"}`} aria-current={active ? "step" : undefined}>
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/80 font-mono text-sm font-black shadow-sm ring-1 ring-current/15">{icon}</span>
      <h3 className="mt-3 font-bold text-slate-950">{title}</h3>
      <p className="mt-1.5 text-sm leading-5 text-slate-600">{detail}</p>
      {active ? <span className="absolute right-4 top-4 flex h-3 w-3"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-40 motion-reduce:animate-none" /><span className="relative inline-flex h-3 w-3 rounded-full bg-current" /></span> : null}
    </article>
  );
}

function AttemptCard({ number, delay, state }: { number: number; delay: number; state: "pending" | "active" | "failed" | "success" }) {
  const style = state === "success" ? "border-emerald-300 bg-emerald-50 text-emerald-900" : state === "failed" ? "border-rose-300 bg-rose-50 text-rose-900" : state === "active" ? "border-amber-400 bg-amber-50 text-amber-950 ring-2 ring-amber-100" : "border-slate-200 bg-slate-50 text-slate-600";
  return <div className={`rounded-xl border p-3 transition-all ${style}`}><div className="flex items-center justify-between gap-2"><p className="text-sm font-bold">Attempt {number}</p><span className="text-xs font-black uppercase">{state === "pending" ? "—" : state}</span></div><p className="mt-1 text-xs">{delay === 0 ? "Immediate" : `Wait ${delay}s`}</p></div>;
}

function BreakerPill({ state }: { state: BreakerState }) {
  const style = state === "Open" ? "border-rose-200 bg-rose-100 text-rose-900" : state === "Half-Open" ? "border-amber-200 bg-amber-100 text-amber-900" : "border-emerald-200 bg-emerald-100 text-emerald-900";
  return <div className={`w-fit rounded-full border px-3 py-1.5 text-sm font-bold ${style}`}><span className="mr-2 inline-block h-2 w-2 rounded-full bg-current" />Circuit: {state}</div>;
}

function Metric({ label, value, tone = "normal" }: { label: string; value: string | number; tone?: Tone }) {
  return <div className={`min-w-0 rounded-xl border p-3 ${toneClass(tone)}`}><dt className="text-xs font-semibold opacity-70">{label}</dt><dd className="mt-1 break-words font-mono text-sm font-bold sm:text-base">{value}</dd></div>;
}

function Explanation({ label, text }: { label: string; text: string }) {
  return <div><h3 className="text-sm font-bold text-cyan-900">{label}</h3><p className="mt-1 leading-7 text-slate-700">{text}</p></div>;
}

function ActionButton({ children, onClick, disabled = false, variant = "primary", pressed }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; variant?: "primary" | "secondary" | "danger"; pressed?: boolean }) {
  const style = variant === "danger" ? "border-rose-700 bg-rose-700 text-white hover:bg-rose-800" : variant === "secondary" ? "border-slate-300 bg-white text-slate-800 hover:bg-slate-100" : "border-cyan-700 bg-cyan-700 text-white hover:bg-cyan-800";
  return <button type="button" onClick={onClick} disabled={disabled} aria-pressed={pressed} className={`min-h-11 rounded-lg border px-4 py-2 text-sm font-bold transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 motion-reduce:transition-none ${style}`}>{children}</button>;
}

function toneClass(tone: Tone) {
  if (tone === "success") return "border-emerald-200 bg-emerald-50 text-emerald-900";
  if (tone === "warning") return "border-amber-200 bg-amber-50 text-amber-900";
  if (tone === "error") return "border-rose-200 bg-rose-50 text-rose-900";
  return "border-slate-200 bg-slate-50 text-slate-700";
}

function phaseWidth(phase: Phase) {
  if (phase === "idle") return "0%";
  if (phase === "client") return "12%";
  if (phase === "controller" || phase === "backoff") return "36%";
  if (phase === "primary" || phase === "heartbeat") return "62%";
  if (phase === "fallback") return "82%";
  return "100%";
}
