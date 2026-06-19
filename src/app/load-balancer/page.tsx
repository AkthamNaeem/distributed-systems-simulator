"use client";

import { useEffect, useRef, useState } from "react";
import { PageShell } from "@/components/PageShell";

type Algorithm =
  | "round-robin"
  | "greedy"
  | "power-two"
  | "least-connections"
  | "least-response-time"
  | "weighted-round-robin"
  | "consistent-hashing"
  | "sticky-sessions"
  | "resource-aware";

type Server = {
  id: string;
  name: string;
  healthy: boolean;
  activeRequests: number;
  totalHandled: number;
  averageResponseTime: number;
  weight: number;
  cpuUsage: number;
  memoryUsage: number;
};

type LogEntry = {
  id: number;
  text: string;
  tone?: "normal" | "success" | "warning";
};

type Packet = {
  id: number;
  requestNumber: number;
  stage: "client" | "balancer" | "decision" | "server" | "failed";
  targetId?: string;
};

type Decision = {
  requestNumber: number;
  serverId?: string;
  serverName?: string;
  reason: string;
  candidates: string[];
  skipped: string[];
};

const algorithms: { id: Algorithm; label: string }[] = [
  { id: "round-robin", label: "Round Robin" },
  { id: "greedy", label: "Greedy" },
  { id: "power-two", label: "Power of Two Choices" },
  { id: "least-connections", label: "Least Connections" },
  { id: "least-response-time", label: "Least Response Time" },
  { id: "weighted-round-robin", label: "Weighted Round Robin" },
  { id: "consistent-hashing", label: "Consistent Hashing" },
  { id: "sticky-sessions", label: "Sticky Sessions" },
  { id: "resource-aware", label: "Resource-Aware LB" },
];

const algorithmDetails: Record<
  Algorithm,
  { reason: string; concept: string; demonstrates: string; matters: string }
> = {
  "round-robin": {
    reason: "Next healthy server in sequence.",
    concept: "Fair sequential distribution",
    demonstrates: "Requests rotate through the available server pool.",
    matters: "Simple rotation prevents one healthy server receiving all traffic.",
  },
  greedy: {
    reason: "Chosen because it has the fewest active connections.",
    concept: "Load-aware routing",
    demonstrates: "New work is sent to the least busy server at decision time.",
    matters: "Current load can be more useful than a fixed sequence.",
  },
  "power-two": {
    reason: "Compared two random servers, then chose the lighter one.",
    concept: "Power of Two Choices",
    demonstrates: "A small random sample can avoid overloaded backends.",
    matters: "It approaches good balance without inspecting every server.",
  },
  "least-connections": {
    reason: "Chosen because it has the fewest active connections.",
    concept: "Least Connections",
    demonstrates: "In-flight work influences the next routing decision.",
    matters: "This adapts when requests have different completion times.",
  },
  "least-response-time": {
    reason: "Chosen because it has the lowest recent response time.",
    concept: "Latency-aware routing",
    demonstrates: "Observed response time guides traffic toward faster servers.",
    matters: "Lower backend latency can improve user-perceived performance.",
  },
  "weighted-round-robin": {
    reason: "Selected from a sequence proportional to server weight.",
    concept: "Capacity-weighted distribution",
    demonstrates: "Higher-capacity servers receive a larger traffic share.",
    matters: "Heterogeneous server pools should not always split work equally.",
  },
  "consistent-hashing": {
    reason: "The client key maps consistently to this healthy server.",
    concept: "Stable key-based routing",
    demonstrates: "The same client key repeatedly maps to a stable backend.",
    matters: "Stable mapping reduces disruption when topology changes.",
  },
  "sticky-sessions": {
    reason: "The session remains assigned to its healthy backend.",
    concept: "Session affinity",
    demonstrates: "Requests from one client return to the same server.",
    matters: "Affinity supports server-local session state, with availability trade-offs.",
  },
  "resource-aware": {
    reason: "Chosen because its combined CPU and memory load is lowest.",
    concept: "Resource-aware routing",
    demonstrates: "Multiple resource signals can guide placement.",
    matters: "Connection count alone may not reflect real server pressure.",
  },
};

const initialServers: Server[] = [
  {
    id: "server-a",
    name: "Server A",
    healthy: true,
    activeRequests: 0,
    totalHandled: 0,
    averageResponseTime: 120,
    weight: 3,
    cpuUsage: 34,
    memoryUsage: 42,
  },
  {
    id: "server-b",
    name: "Server B",
    healthy: true,
    activeRequests: 0,
    totalHandled: 0,
    averageResponseTime: 90,
    weight: 2,
    cpuUsage: 28,
    memoryUsage: 38,
  },
  {
    id: "server-c",
    name: "Server C",
    healthy: true,
    activeRequests: 0,
    totalHandled: 0,
    averageResponseTime: 160,
    weight: 1,
    cpuUsage: 56,
    memoryUsage: 61,
  },
];

const clients = ["Client 1", "Client 2", "Client 3"];
const requestDuration = 1200;

const guide = {
  howToUse: [
    "Select an algorithm and send one request to follow its complete route.",
    "Send a burst to compare distribution, active load, and completions.",
    "Fail a server and observe health filtering and high availability.",
  ],
  observe: [
    "The active packet reveals each routing stage and final destination.",
    "The decision panel explains why the algorithm selected its server.",
    "Server metrics and the event timeline update as requests run.",
  ],
  concepts: [
    "Traffic distribution, health checks, and high availability.",
    "Sequential, load-aware, weighted, and key-based routing.",
    "Scalability and heterogeneous backend capacity.",
  ],
};

export default function LoadBalancerPage() {
  const [servers, setServers] = useState<Server[]>(initialServers);
  const [algorithm, setAlgorithm] = useState<Algorithm>("round-robin");
  const [selectedClient, setSelectedClient] = useState(clients[0]);
  const [requestCount, setRequestCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [packets, setPackets] = useState<Packet[]>([]);
  const [latestDecision, setLatestDecision] = useState<Decision | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: 1, text: "Health check: all initial servers are healthy.", tone: "success" },
  ]);

  const requestNumberRef = useRef(0);
  const logIdRef = useRef(1);
  const roundRobinIndexRef = useRef(0);
  const weightedIndexRef = useRef(0);
  const nextServerNumberRef = useRef(4);
  const stickySessionsRef = useRef<Record<string, string>>({});
  const timersRef = useRef<number[]>([]);

  const successfulCount = servers.reduce(
    (total, server) => total + server.totalHandled,
    0,
  );
  const healthyCount = servers.filter((server) => server.healthy).length;
  const activeTargetIds = new Set(
    packets
      .filter((packet) => packet.stage === "server")
      .map((packet) => packet.targetId),
  );
  const distribution = servers.map((server) => server.totalHandled);
  const imbalance = getImbalanceLabel(distribution);

  function rememberTimer(callback: () => void, delay: number) {
    const timerId = window.setTimeout(() => {
      callback();
      timersRef.current = timersRef.current.filter((id) => id !== timerId);
    }, delay);
    timersRef.current.push(timerId);
  }

  function clearTimers() {
    timersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    timersRef.current = [];
  }

  function addLog(text: string, tone: LogEntry["tone"] = "normal") {
    logIdRef.current += 1;
    const nextLog = { id: logIdRef.current, text, tone };
    setLogs((currentLogs) => [nextLog, ...currentLogs].slice(0, 14));
  }

  function scheduleRequestCompletion(
    serverId: string,
    serverName: string,
    requestNumber: number,
  ) {
    rememberTimer(() => {
      setServers((currentServers) =>
        currentServers.map((server) =>
          server.id === serverId
            ? { ...server, activeRequests: Math.max(0, server.activeRequests - 1) }
            : server,
        ),
      );
      addLog(`Request #${requestNumber} completed on ${serverName}.`, "success");
    }, requestDuration);
  }

  function selectServer(draftServers: Server[], currentAlgorithm: Algorithm) {
    const healthyServers = draftServers.filter((server) => server.healthy);
    const skipped = draftServers
      .filter((server) => !server.healthy)
      .map((server) => server.name);

    if (healthyServers.length === 0) {
      return { selected: null, candidates: [] as Server[], skipped };
    }

    let candidates = healthyServers;
    let selected: Server;

    if (currentAlgorithm === "round-robin") {
      selected = healthyServers[roundRobinIndexRef.current % healthyServers.length];
      roundRobinIndexRef.current += 1;
    } else if (
      currentAlgorithm === "greedy" ||
      currentAlgorithm === "least-connections"
    ) {
      selected = findMinimum(healthyServers, (server) => server.activeRequests);
    } else if (currentAlgorithm === "power-two") {
      if (healthyServers.length === 1) {
        candidates = [healthyServers[0]];
      } else {
        const firstIndex = getRandomIndex(healthyServers.length);
        let secondIndex = getRandomIndex(healthyServers.length);
        while (secondIndex === firstIndex) {
          secondIndex = getRandomIndex(healthyServers.length);
        }
        candidates = [healthyServers[firstIndex], healthyServers[secondIndex]];
      }
      selected = findMinimum(candidates, (server) => server.activeRequests);
    } else if (currentAlgorithm === "least-response-time") {
      selected = findMinimum(healthyServers, (server) => server.averageResponseTime);
    } else if (currentAlgorithm === "weighted-round-robin") {
      const weightedPool = healthyServers.flatMap((server) =>
        Array.from({ length: server.weight }, () => server),
      );
      selected = weightedPool[weightedIndexRef.current % weightedPool.length];
      weightedIndexRef.current += 1;
    } else if (currentAlgorithm === "consistent-hashing") {
      selected = healthyServers[simpleHash(selectedClient) % healthyServers.length];
    } else if (currentAlgorithm === "sticky-sessions") {
      const assignedServer = healthyServers.find(
        (server) => server.id === stickySessionsRef.current[selectedClient],
      );
      selected =
        assignedServer ??
        healthyServers[roundRobinIndexRef.current % healthyServers.length];
      if (!assignedServer) {
        roundRobinIndexRef.current += 1;
        stickySessionsRef.current[selectedClient] = selected.id;
      }
    } else {
      selected = findMinimum(
        healthyServers,
        (server) => server.cpuUsage + server.memoryUsage,
      );
    }

    return { selected, candidates, skipped };
  }

  function animatePacket(packet: Packet, burstOffset: number) {
    setPackets((current) => [...current, packet].slice(-10));
    rememberTimer(
      () => updatePacketStage(packet.id, "balancer"),
      180 + burstOffset,
    );
    rememberTimer(
      () => updatePacketStage(packet.id, "decision"),
      480 + burstOffset,
    );
    rememberTimer(
      () => updatePacketStage(packet.id, packet.targetId ? "server" : "failed"),
      800 + burstOffset,
    );
    rememberTimer(
      () => setPackets((current) => current.filter((item) => item.id !== packet.id)),
      1550 + burstOffset,
    );
  }

  function updatePacketStage(id: number, stage: Packet["stage"]) {
    setPackets((current) =>
      current.map((packet) => (packet.id === id ? { ...packet, stage } : packet)),
    );
  }

  function routeRequests(amount: number) {
    const newLogs: LogEntry[] = [];
    let nextRequestCount = requestNumberRef.current;
    let failures = 0;
    let draftServers = servers.map((server) => ({ ...server }));

    for (let index = 0; index < amount; index += 1) {
      nextRequestCount += 1;
      const selection = selectServer(draftServers, algorithm);
      const requestNumber = nextRequestCount;
      const decision: Decision = {
        requestNumber,
        serverId: selection.selected?.id,
        serverName: selection.selected?.name,
        reason: selection.selected
          ? algorithmDetails[algorithm].reason
          : "No healthy backend is available, so the request was rejected.",
        candidates: selection.candidates.map((server) => server.name),
        skipped: selection.skipped,
      };

      logIdRef.current += 1;
      newLogs.push({
        id: logIdRef.current,
        text: `Request #${requestNumber} arrived from ${selectedClient}.`,
      });

      if (selection.skipped.length > 0) {
        logIdRef.current += 1;
        newLogs.push({
          id: logIdRef.current,
          text: `${selection.skipped.join(", ")} skipped because ${selection.skipped.length === 1 ? "it is" : "they are"} down.`,
          tone: "warning",
        });
      }

      if (!selection.selected) {
        failures += 1;
        logIdRef.current += 1;
        newLogs.push({
          id: logIdRef.current,
          text: `Request #${requestNumber} rejected: no healthy server available.`,
          tone: "warning",
        });
      } else {
        draftServers = draftServers.map((server) =>
          server.id === selection.selected?.id
            ? {
                ...server,
                activeRequests: server.activeRequests + 1,
                totalHandled: server.totalHandled + 1,
              }
            : server,
        );
        logIdRef.current += 1;
        newLogs.push({
          id: logIdRef.current,
          text: `${getAlgorithmLabel(algorithm)} selected ${selection.selected.name} for Request #${requestNumber}.`,
          tone: "success",
        });
        scheduleRequestCompletion(
          selection.selected.id,
          selection.selected.name,
          requestNumber,
        );
      }

      setLatestDecision(decision);
      animatePacket(
        {
          id: requestNumber,
          requestNumber,
          stage: "client",
          targetId: selection.selected?.id,
        },
        Math.min(index * 70, 420),
      );
    }

    requestNumberRef.current = nextRequestCount;
    setRequestCount(nextRequestCount);
    setFailedCount((current) => current + failures);
    setServers(draftServers);
    setLogs((currentLogs) => [...newLogs.reverse(), ...currentLogs].slice(0, 14));
  }

  function resetSimulation() {
    clearTimers();
    requestNumberRef.current = 0;
    logIdRef.current = 1;
    roundRobinIndexRef.current = 0;
    weightedIndexRef.current = 0;
    nextServerNumberRef.current = 4;
    stickySessionsRef.current = {};
    setRequestCount(0);
    setFailedCount(0);
    setPackets([]);
    setLatestDecision(null);
    setServers(initialServers);
    setLogs([
      { id: 1, text: "Simulation reset. All initial servers are healthy.", tone: "success" },
    ]);
  }

  function toggleServerHealth(serverId: string) {
    const target = servers.find((server) => server.id === serverId);
    if (!target) return;

    const becomingHealthy = !target.healthy;
    setServers((currentServers) =>
      currentServers.map((server) =>
        server.id === serverId ? { ...server, healthy: becomingHealthy } : server,
      ),
    );

    if (!becomingHealthy) {
      stickySessionsRef.current = removeStickyAssignmentsForServer(
        stickySessionsRef.current,
        serverId,
      );
      addLog(`${target.name} marked down. Health check removed it from routing.`, "warning");
    } else {
      addLog(`${target.name} recovered and returned to the healthy pool.`, "success");
    }
  }

  function addServer() {
    const nextNumber = nextServerNumberRef.current;
    const serverName = `Server ${String.fromCharCode(64 + nextNumber)}`;
    nextServerNumberRef.current += 1;
    setServers((currentServers) => [
      ...currentServers,
      {
        id: `server-${nextNumber}`,
        name: serverName,
        healthy: true,
        activeRequests: 0,
        totalHandled: 0,
        averageResponseTime: 110 + nextNumber * 8,
        weight: nextNumber % 2 === 0 ? 2 : 1,
        cpuUsage: 24 + nextNumber * 5,
        memoryUsage: 32 + nextNumber * 4,
      },
    ]);
    addLog(`${serverName} added to the healthy server pool.`, "success");
  }

  function removeLastServer() {
    if (servers.length <= 2) {
      addLog("At least two servers must remain in the simulator.", "warning");
      return;
    }
    const removedServer = servers[servers.length - 1];
    stickySessionsRef.current = removeStickyAssignmentsForServer(
      stickySessionsRef.current,
      removedServer.id,
    );
    setServers((currentServers) => currentServers.slice(0, -1));
    addLog(`${removedServer.name} removed from the backend pool.`, "warning");
  }

  useEffect(() => () => clearTimers(), []);

  return (
    <PageShell
      title="Load Balancer Simulator"
      subtitle="Requests arrive at a load balancer, which chooses a backend server according to the selected algorithm."
      guide={guide}
    >
      <div className="flex flex-wrap gap-2" aria-label="Supported load balancing concepts">
        {[...algorithms.map((item) => item.label), "Health Check"].map((concept) => (
          <span
            key={concept}
            className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-900"
          >
            {concept}
          </span>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-cyan-200 bg-gradient-to-br from-white via-sky-50/70 to-cyan-50 shadow-xl shadow-cyan-100/70 ring-1 ring-cyan-100 dark:border-cyan-800/60 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 dark:shadow-black/20 dark:ring-cyan-900/60">
        <div className="border-b border-cyan-200 bg-white/80 px-5 py-5 sm:px-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-800">Live traffic path</p>
              <h2 className="mt-1 text-xl font-bold text-slate-950 sm:text-2xl">Incoming request → decision → backend</h2>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <span className={`h-2.5 w-2.5 rounded-full ${healthyCount ? "bg-emerald-500" : "bg-rose-500"}`} />
              {healthyCount}/{servers.length} backends healthy
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-7">
          <div className="grid gap-3 lg:grid-cols-[0.8fr_0.8fr_1.15fr_1.35fr] lg:items-stretch">
            <FlowZone
              step="01"
              title="Clients / Incoming"
              subtitle={`${selectedClient} generates fake traffic`}
              active={packets.some((packet) => packet.stage === "client")}
            >
              <div className="flex flex-wrap gap-2">
                {clients.map((client) => (
                  <span key={client} className={`rounded-lg border px-2.5 py-2 text-xs font-bold ${client === selectedClient ? "border-cyan-300 bg-cyan-100 text-cyan-950" : "border-slate-200 bg-white text-slate-500"}`}>
                    {client}
                  </span>
                ))}
              </div>
              <PacketShelf packets={packets.filter((packet) => packet.stage === "client")} />
            </FlowZone>

            <FlowZone
              step="02"
              title="Load Balancer"
              subtitle="Receives and inspects traffic"
              active={packets.some((packet) => packet.stage === "balancer")}
            >
              <div className="flex h-16 items-center justify-center rounded-xl border border-cyan-200 bg-gradient-to-br from-cyan-600 to-sky-700 text-center text-sm font-black text-white shadow-md shadow-cyan-200">
                LB
                <span className="ml-2 font-mono text-xs font-semibold text-cyan-100">:443</span>
              </div>
              <PacketShelf packets={packets.filter((packet) => packet.stage === "balancer")} />
            </FlowZone>

            <FlowZone
              step="03"
              title="Algorithm Decision"
              subtitle={getAlgorithmLabel(algorithm)}
              active={packets.some((packet) => packet.stage === "decision" || packet.stage === "failed")}
            >
              <p className="rounded-lg bg-cyan-50 p-3 text-sm font-semibold leading-5 text-cyan-950 ring-1 ring-cyan-200">
                {latestDecision?.reason ?? "Send a request to see the routing decision."}
              </p>
              <PacketShelf packets={packets.filter((packet) => packet.stage === "decision" || packet.stage === "failed")} />
            </FlowZone>

            <FlowZone
              step="04"
              title="Backend Servers"
              subtitle="Only healthy servers are eligible"
              active={packets.some((packet) => packet.stage === "server")}
            >
              <div className="space-y-2">
                {servers.map((server) => {
                  const selected = activeTargetIds.has(server.id);
                  return (
                    <div
                      key={server.id}
                      className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 transition-all duration-300 motion-reduce:transition-none ${
                        !server.healthy
                          ? "border-rose-200 bg-rose-50 text-rose-800 opacity-75"
                          : selected
                            ? "scale-[1.02] border-cyan-400 bg-cyan-100 text-cyan-950 shadow-md ring-2 ring-cyan-200 motion-reduce:scale-100"
                            : "border-emerald-200 bg-emerald-50/70 text-emerald-900"
                      }`}
                    >
                      <span className="text-xs font-bold">{server.name}</span>
                      <span className="font-mono text-[11px] font-bold">{!server.healthy ? "DOWN" : selected ? "RECEIVING" : `${server.activeRequests} active`}</span>
                    </div>
                  );
                })}
              </div>
            </FlowZone>
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-white/90 p-3 text-sm text-slate-700" aria-live="polite">
            <span className={`h-3 w-3 shrink-0 rounded-full ${packets.length ? "animate-pulse bg-cyan-500 motion-reduce:animate-none" : "bg-slate-300"}`} />
            <p className="font-semibold">
              {packets.length
                ? `${packets.length} request packet${packets.length === 1 ? " is" : "s are"} moving through the simulated path.`
                : "Traffic is idle. Send one request to follow a routing decision."}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-800">Controls</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">Direct the traffic</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-700">
              Routing algorithm
              <select
                value={algorithm}
                onChange={(event) => {
                  setAlgorithm(event.target.value as Algorithm);
                  setLatestDecision(null);
                }}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-bold text-slate-900 shadow-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
              >
                {algorithms.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Client / session key
              <select
                value={selectedClient}
                onChange={(event) => setSelectedClient(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-bold text-slate-900 shadow-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
              >
                {clients.map((client) => <option key={client}>{client}</option>)}
              </select>
            </label>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <ActionButton onClick={() => routeRequests(1)}>Send One Request</ActionButton>
            <ActionButton onClick={() => routeRequests(10)}>Send Burst (10)</ActionButton>
            <ActionButton onClick={resetSimulation} variant="secondary">Reset Simulation</ActionButton>
            <ActionButton onClick={addServer} variant="secondary">Add Server</ActionButton>
            <ActionButton onClick={removeLastServer} variant="secondary">Remove Last Server</ActionButton>
          </div>
        </div>

        <aside className="rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-white p-5 shadow-sm dark:border-cyan-800/60 dark:from-cyan-950/30 dark:to-slate-900 dark:shadow-black/20 sm:p-6" aria-live="polite">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-800">Latest decision</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">{getAlgorithmLabel(algorithm)}</h2>
          <p className="mt-4 text-sm leading-6 text-slate-700">
            {latestDecision?.reason ?? algorithmDetails[algorithm].reason}
          </p>
          {latestDecision ? (
            <div className="mt-4 space-y-2 text-sm">
              <DecisionLine label="Request" value={`#${latestDecision.requestNumber}`} />
              <DecisionLine label="Selected" value={latestDecision.serverName ?? "Rejected"} />
              {algorithm === "power-two" ? <DecisionLine label="Compared" value={latestDecision.candidates.join(" vs ")} /> : null}
              {latestDecision.skipped.length ? <DecisionLine label="Health check skipped" value={latestDecision.skipped.join(", ")} warning /> : null}
            </div>
          ) : null}
        </aside>
      </section>

      <section>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-800">Backend pool</p>
            <h2 className="mt-1 text-xl font-bold text-slate-950">Live server state</h2>
          </div>
          <p className="text-sm text-slate-600">Fail or recover any server to test health-aware routing.</p>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {servers.map((server) => (
            <ServerCard
              key={server.id}
              server={server}
              selected={activeTargetIds.has(server.id)}
              showWeight={algorithm === "weighted-round-robin"}
              onToggle={() => toggleServerHealth(server.id)}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-800">Metrics</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">Traffic summary</h2>
          <dl className="mt-5 grid grid-cols-2 gap-3">
            <Metric label="Total requests" value={requestCount} />
            <Metric label="Successful" value={successfulCount} />
            <Metric label="Failed" value={failedCount} warning={failedCount > 0} />
            <Metric label="Balance" value={imbalance} warning={imbalance === "Hot spot detected"} />
          </dl>
          <div className="mt-5 space-y-3">
            {servers.map((server) => {
              const share = successfulCount ? Math.round((server.totalHandled / successfulCount) * 100) : 0;
              return (
                <div key={server.id}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold text-slate-700">{server.name}</span>
                    <span className="font-mono font-bold text-slate-950">{server.totalHandled} · {share}%</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-sky-600 transition-all duration-500 motion-reduce:transition-none" style={{ width: `${share}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-800">Event timeline</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">Latest routing events</h2>
          <ol className="mt-5 max-h-[28rem] space-y-2 overflow-y-auto pr-1" aria-live="polite">
            {logs.map((log) => (
              <li key={log.id} className={`flex gap-3 rounded-xl border p-3 text-sm leading-6 ${log.tone === "warning" ? "border-amber-200 bg-amber-50 text-amber-950" : log.tone === "success" ? "border-emerald-200 bg-emerald-50/70 text-emerald-950" : "border-slate-200 bg-slate-50 text-slate-700"}`}>
                <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${log.tone === "warning" ? "bg-amber-500" : log.tone === "success" ? "bg-emerald-500" : "bg-slate-400"}`} />
                {log.text}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="rounded-2xl border border-cyan-200 bg-gradient-to-r from-cyan-50 via-white to-sky-50 p-5 shadow-sm dark:border-cyan-800/60 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 dark:shadow-black/20 sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-800">Academic explanation</p>
        <h2 className="mt-1 text-xl font-bold text-slate-950">What {getAlgorithmLabel(algorithm)} proves</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <Explanation label="Concept proven" text={algorithmDetails[algorithm].concept} />
          <Explanation label="Simulation demonstrates" text={algorithmDetails[algorithm].demonstrates} />
          <Explanation label="Why it matters" text={algorithmDetails[algorithm].matters} />
        </div>
      </section>
    </PageShell>
  );
}

function FlowZone({ step, title, subtitle, active, children }: { step: string; title: string; subtitle: string; active: boolean; children: React.ReactNode }) {
  return (
    <article className={`relative min-w-0 rounded-xl border p-4 transition-all duration-300 motion-reduce:transition-none ${active ? "border-cyan-400 bg-white shadow-lg shadow-cyan-100 ring-2 ring-cyan-200" : "border-slate-200 bg-white/80 shadow-sm"}`}>
      <div className="flex items-start gap-3">
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-black ${active ? "bg-cyan-700 text-white" : "bg-slate-100 text-slate-500"}`}>{step}</span>
        <div className="min-w-0">
          <h3 className="text-sm font-bold leading-5 text-slate-950">{title}</h3>
          <p className="mt-0.5 text-xs leading-5 text-slate-500">{subtitle}</p>
        </div>
      </div>
      <div className="mt-4 space-y-3">{children}</div>
      {active ? <span className="absolute right-3 top-3 flex h-3 w-3"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-500 opacity-50 motion-reduce:animate-none" /><span className="relative inline-flex h-3 w-3 rounded-full bg-cyan-500" /></span> : null}
    </article>
  );
}

function PacketShelf({ packets }: { packets: Packet[] }) {
  if (!packets.length) return <div className="h-7 rounded-lg border border-dashed border-slate-200" />;
  return (
    <div className="flex min-h-7 flex-wrap gap-1.5" aria-label="Active request packets">
      {packets.slice(-6).map((packet) => (
        <span key={packet.id} className={`inline-flex items-center rounded-md px-2 py-1 font-mono text-[10px] font-black shadow-sm transition-all motion-reduce:transition-none ${packet.stage === "failed" ? "bg-rose-600 text-white" : "animate-pulse bg-cyan-600 text-white motion-reduce:animate-none"}`}>
          REQ #{packet.requestNumber}
        </span>
      ))}
      {packets.length > 6 ? <span className="px-1 py-1 text-xs font-bold text-slate-500">+{packets.length - 6}</span> : null}
    </div>
  );
}

function ServerCard({ server, selected, showWeight, onToggle }: { server: Server; selected: boolean; showWeight: boolean; onToggle: () => void }) {
  const busy = server.activeRequests >= 3 || server.cpuUsage >= 70;
  return (
    <article className={`rounded-2xl border p-5 shadow-sm transition-all duration-300 motion-reduce:transition-none ${!server.healthy ? "border-rose-200 bg-rose-50/80" : selected ? "-translate-y-1 border-cyan-400 bg-cyan-50 shadow-xl shadow-cyan-100 ring-2 ring-cyan-200 motion-reduce:translate-y-0" : busy ? "border-amber-300 bg-amber-50/70" : "border-emerald-200 bg-white"}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-950">{server.name}</h3>
          <span className={`mt-2 inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-bold ${server.healthy ? busy ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-900" : "bg-rose-100 text-rose-900"}`}>
            <span className={`h-2 w-2 rounded-full ${server.healthy ? busy ? "bg-amber-500" : "bg-emerald-500" : "bg-rose-500"}`} />
            {server.healthy ? busy ? "Healthy · Busy" : "Healthy" : "Down"}
          </span>
        </div>
        {showWeight ? <span className="rounded-lg bg-slate-900 px-2.5 py-1.5 font-mono text-xs font-bold text-white">W {server.weight}</span> : null}
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-2 text-sm">
        <ServerMetric label="Active connections" value={server.activeRequests} />
        <ServerMetric label="CPU load" value={`${server.cpuUsage}%`} />
        <ServerMetric label="Avg. response" value={`${server.averageResponseTime} ms`} />
        <ServerMetric label="Total handled" value={server.totalHandled} />
      </dl>
      <div className="mt-4">
        <div className="flex justify-between text-xs font-semibold text-slate-500"><span>CPU utilization</span><span>{server.cpuUsage}%</span></div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-200"><div className={`h-full rounded-full ${server.healthy ? busy ? "bg-amber-500" : "bg-cyan-500" : "bg-rose-400"}`} style={{ width: `${server.cpuUsage}%` }} /></div>
      </div>
      <button type="button" onClick={onToggle} aria-pressed={!server.healthy} className={`mt-5 min-h-10 w-full rounded-lg border px-3 py-2 text-sm font-bold transition-colors ${server.healthy ? "border-rose-200 bg-white text-rose-700 hover:bg-rose-50" : "border-emerald-300 bg-emerald-700 text-white hover:bg-emerald-800"}`}>
        {server.healthy ? `Mark ${server.name} Down` : `Recover ${server.name}`}
      </button>
    </article>
  );
}

function ServerMetric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-lg bg-white/80 p-3 ring-1 ring-slate-200"><dt className="text-xs leading-4 text-slate-500">{label}</dt><dd className="mt-1 font-mono font-bold text-slate-950">{value}</dd></div>;
}

function Metric({ label, value, warning = false }: { label: string; value: string | number; warning?: boolean }) {
  return <div className={`rounded-xl border p-3 ${warning ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-slate-50"}`}><dt className="text-xs font-semibold text-slate-500">{label}</dt><dd className={`mt-1 font-mono text-lg font-black ${warning ? "text-amber-900" : "text-slate-950"}`}>{value}</dd></div>;
}

function DecisionLine({ label, value, warning = false }: { label: string; value: string; warning?: boolean }) {
  return <div className={`flex flex-col gap-1 rounded-lg border px-3 py-2 sm:flex-row sm:items-center sm:justify-between ${warning ? "border-amber-200 bg-amber-50" : "border-cyan-100 bg-white"}`}><span className="font-semibold text-slate-500">{label}</span><span className={`font-mono text-xs font-bold ${warning ? "text-amber-900" : "text-slate-950"}`}>{value || "—"}</span></div>;
}

function Explanation({ label, text }: { label: string; text: string }) {
  return <div className="rounded-xl border border-cyan-100 bg-white/80 p-4"><h3 className="text-sm font-bold text-cyan-900">{label}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{text}</p></div>;
}

function ActionButton({ children, onClick, variant = "primary" }: { children: React.ReactNode; onClick: () => void; variant?: "primary" | "secondary" }) {
  const classes = variant === "secondary" ? "border-slate-300 bg-white text-slate-800 hover:bg-slate-100" : "border-cyan-700 bg-cyan-700 text-white hover:bg-cyan-800";
  return <button type="button" onClick={onClick} className={`min-h-11 rounded-lg border px-4 py-2 text-sm font-bold transition-all hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${classes}`}>{children}</button>;
}

function findMinimum(servers: Server[], getValue: (server: Server) => number) {
  return servers.reduce((bestServer, server) => getValue(server) < getValue(bestServer) ? server : bestServer);
}

function getAlgorithmLabel(algorithm: Algorithm) {
  return algorithms.find((item) => item.id === algorithm)?.label ?? "Unknown";
}

function getImbalanceLabel(values: number[]) {
  if (!values.some(Boolean)) return "No traffic yet";
  const difference = Math.max(...values) - Math.min(...values);
  if (difference <= 2) return "Balanced";
  if (difference <= 5) return "Slightly uneven";
  return "Hot spot detected";
}

function getRandomIndex(length: number) {
  return Math.floor(Math.random() * length);
}

function simpleHash(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) hash = (hash * 31 + value.charCodeAt(index)) % 100000;
  return hash;
}

function removeStickyAssignmentsForServer(assignments: Record<string, string>, serverId: string) {
  return Object.fromEntries(Object.entries(assignments).filter(([, assignedServerId]) => assignedServerId !== serverId));
}
