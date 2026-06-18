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

const algorithms: { id: Algorithm; label: string }[] = [
  { id: "round-robin", label: "Round Robin" },
  { id: "greedy", label: "Greedy" },
  { id: "power-two", label: "Power of Two Choices" },
  { id: "least-connections", label: "Least Connections" },
  { id: "least-response-time", label: "Least Response Time" },
  { id: "weighted-round-robin", label: "Weighted Round Robin" },
  { id: "consistent-hashing", label: "Consistent Hashing" },
  { id: "sticky-sessions", label: "Sticky Sessions" },
  { id: "resource-aware", label: "Resource-Aware" },
];

const explanations: Record<Algorithm, string> = {
  "round-robin": "Round Robin rotates requests sequentially across healthy servers.",
  greedy: "Greedy chooses the server with the fewest active requests.",
  "power-two":
    "Power of Two Choices randomly samples two healthy servers and chooses the less loaded one.",
  "least-connections":
    "Least Connections chooses the server with the fewest active connections.",
  "least-response-time":
    "Least Response Time chooses the server with the lowest average response time.",
  "weighted-round-robin":
    "Weighted Round Robin gives stronger servers more requests based on weight.",
  "consistent-hashing":
    "Consistent Hashing maps a client/session key to a stable server.",
  "sticky-sessions":
    "Sticky Sessions keep the same client session on the same backend server.",
  "resource-aware":
    "Resource-Aware chooses based on CPU and memory usage.",
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
const requestDuration = 900;

const guide = {
  howToUse: [
    "Select a routing algorithm and choose a client/session key.",
    "Send requests, fail Server B, then send more requests.",
    "Add or remove servers to observe scalability behavior.",
  ],
  observe: [
    "Requests are distributed differently by each algorithm.",
    "Failed servers are avoided by health checking.",
    "Weighted, sticky, hashing, and resource-aware modes show different trade-offs.",
  ],
  concepts: [
    "Traffic distribution, health check, high availability, and scalability.",
    "Weighted routing, sticky sessions, and consistent hashing.",
    "Resource-aware routing based on simulated server load.",
  ],
};

export default function LoadBalancerPage() {
  const [servers, setServers] = useState<Server[]>(initialServers);
  const [algorithm, setAlgorithm] = useState<Algorithm>("round-robin");
  const [selectedClient, setSelectedClient] = useState(clients[0]);
  const [requestCount, setRequestCount] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 1,
      text: "Health Monitoring shows all initial servers are Healthy.",
      tone: "success",
    },
  ]);

  const requestNumberRef = useRef(0);
  const logIdRef = useRef(1);
  const roundRobinIndexRef = useRef(0);
  const weightedIndexRef = useRef(0);
  const nextServerNumberRef = useRef(4);
  const stickySessionsRef = useRef<Record<string, string>>({});
  const timersRef = useRef<number[]>([]);

  function clearTimers() {
    timersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    timersRef.current = [];
  }

  function addLog(text: string, tone: LogEntry["tone"] = "normal") {
    logIdRef.current += 1;
    const nextLog = { id: logIdRef.current, text, tone };
    setLogs((currentLogs) => [nextLog, ...currentLogs].slice(0, 12));
  }

  function scheduleRequestCompletion(serverId: string) {
    const timerId = window.setTimeout(() => {
      setServers((currentServers) =>
        currentServers.map((server) =>
          server.id === serverId
            ? {
                ...server,
                activeRequests: Math.max(0, server.activeRequests - 1),
              }
            : server,
        ),
      );
      timersRef.current = timersRef.current.filter((id) => id !== timerId);
    }, requestDuration);

    timersRef.current.push(timerId);
  }

  function selectServer(
    draftServers: Server[],
    currentAlgorithm: Algorithm,
  ) {
    const healthyServers = draftServers.filter((server) => server.healthy);

    if (healthyServers.length === 0) {
      return null;
    }

    if (currentAlgorithm === "round-robin") {
      const selected =
        healthyServers[roundRobinIndexRef.current % healthyServers.length];
      roundRobinIndexRef.current += 1;
      return selected;
    }

    if (
      currentAlgorithm === "greedy" ||
      currentAlgorithm === "least-connections"
    ) {
      return findMinimum(healthyServers, (server) => server.activeRequests);
    }

    if (currentAlgorithm === "power-two") {
      if (healthyServers.length === 1) {
        return healthyServers[0];
      }

      const firstIndex = Math.floor(Math.random() * healthyServers.length);
      let secondIndex = Math.floor(Math.random() * healthyServers.length);

      while (secondIndex === firstIndex) {
        secondIndex = Math.floor(Math.random() * healthyServers.length);
      }

      const candidates = [healthyServers[firstIndex], healthyServers[secondIndex]];
      return findMinimum(candidates, (server) => server.activeRequests);
    }

    if (currentAlgorithm === "least-response-time") {
      return findMinimum(healthyServers, (server) => server.averageResponseTime);
    }

    if (currentAlgorithm === "weighted-round-robin") {
      const weightedPool = healthyServers.flatMap((server) =>
        Array.from({ length: server.weight }, () => server),
      );
      const selected = weightedPool[weightedIndexRef.current % weightedPool.length];
      weightedIndexRef.current += 1;
      return selected;
    }

    if (currentAlgorithm === "consistent-hashing") {
      const hashKey = selectedClient;
      const index = simpleHash(hashKey) % healthyServers.length;
      return healthyServers[index];
    }

    if (currentAlgorithm === "sticky-sessions") {
      const assignedServerId = stickySessionsRef.current[selectedClient];
      const assignedServer = healthyServers.find(
        (server) => server.id === assignedServerId,
      );

      if (assignedServer) {
        return assignedServer;
      }

      const selected =
        healthyServers[roundRobinIndexRef.current % healthyServers.length];
      roundRobinIndexRef.current += 1;
      stickySessionsRef.current[selectedClient] = selected.id;
      return selected;
    }

    return findMinimum(
      healthyServers,
      (server) => server.cpuUsage + server.memoryUsage,
    );
  }

  function routeRequests(amount: number) {
    const newLogs: LogEntry[] = [];
    let nextRequestCount = requestNumberRef.current;
    let draftServers = servers.map((server) => ({ ...server }));

    for (let index = 0; index < amount; index += 1) {
      nextRequestCount += 1;
      const selectedServer = selectServer(draftServers, algorithm);
      logIdRef.current += 1;

      if (!selectedServer) {
        newLogs.push({
          id: logIdRef.current,
          text: `Request #${nextRequestCount} could not be routed because no healthy servers are available.`,
          tone: "warning",
        });
        continue;
      }

      draftServers = draftServers.map((server) =>
        server.id === selectedServer.id
          ? {
              ...server,
              activeRequests: server.activeRequests + 1,
              totalHandled: server.totalHandled + 1,
            }
          : server,
      );

      newLogs.push({
        id: logIdRef.current,
        text: `Request #${nextRequestCount} routed to ${selectedServer.name} using ${getAlgorithmLabel(
          algorithm,
        )}.`,
        tone: "success",
      });
      scheduleRequestCompletion(selectedServer.id);
    }

    requestNumberRef.current = nextRequestCount;
    setRequestCount(nextRequestCount);
    setServers(draftServers);
    setLogs((currentLogs) => [...newLogs.reverse(), ...currentLogs].slice(0, 12));
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
    setServers(initialServers);
    setLogs([
      {
        id: 1,
        text: "Simulation reset. Health Monitoring shows all initial servers are Healthy.",
        tone: "success",
      },
    ]);
  }

  function toggleServerBFailure() {
    setServers((currentServers) =>
      currentServers.map((server) =>
        server.id === "server-b" ? { ...server, healthy: !server.healthy } : server,
      ),
    );

    const serverB = servers.find((server) => server.id === "server-b");

    if (serverB?.healthy) {
      stickySessionsRef.current = removeStickyAssignmentsForServer(
        stickySessionsRef.current,
        "server-b",
      );
      addLog(
        "Server B is unhealthy. Health Check removed it from routing.",
        "warning",
      );
    } else {
      addLog("Server B recovered. Health Monitoring returned it to routing.", "success");
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

    addLog(`${serverName} added. Scalability increases the healthy server pool.`, "success");
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
    addLog(
      `${removedServer.name} removed. Routing continues with the remaining healthy servers.`,
      "warning",
    );
  }

  useEffect(() => {
    return () => clearTimers();
  }, []);

  return (
    <PageShell
      title="Load Balancer Simulator"
      subtitle="This simulator shows how a load balancer distributes incoming client requests across multiple backend servers using different routing algorithms."
      guide={guide}
    >
      <section className="grid gap-4 lg:grid-cols-3">
        {servers.map((server) => (
          <ServerCard key={server.id} server={server} />
        ))}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">
              Routing Controls
            </h2>
            <p className="mt-2 max-w-3xl leading-7 text-slate-700">
              Choose an algorithm, pick a mock client for session-based routing,
              and send fake browser-only requests through the load balancer.
            </p>
          </div>
          <div className="rounded-lg border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-900">
            Requests sent: {requestCount}
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_220px]">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">
              Algorithm selector
            </span>
            <select
              value={algorithm}
              onChange={(event) => setAlgorithm(event.target.value as Algorithm)}
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
            >
              {algorithms.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">
              Client/session key
            </span>
            <select
              value={selectedClient}
              onChange={(event) => setSelectedClient(event.target.value)}
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
            >
              {clients.map((client) => (
                <option key={client} value={client}>
                  {client}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          The client/session key matters most for Sticky Sessions and Consistent
          Hashing because those algorithms try to keep routing stable.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <ActionButton onClick={() => routeRequests(1)}>
            Send One Request
          </ActionButton>
          <ActionButton onClick={() => routeRequests(10)}>
            Send 10 Requests
          </ActionButton>
          <ActionButton onClick={resetSimulation} variant="secondary">
            Reset
          </ActionButton>
          <ActionButton
            onClick={toggleServerBFailure}
            variant={
              servers.find((server) => server.id === "server-b")?.healthy
                ? "danger"
                : "secondary"
            }
          >
            Toggle Server B Failure
          </ActionButton>
          <ActionButton onClick={addServer} variant="secondary">
            Add Server
          </ActionButton>
          <ActionButton onClick={removeLastServer} variant="secondary">
            Remove Last Server
          </ActionButton>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">
            Algorithm Explanation
          </h2>
          <p className="mt-3 leading-7 text-slate-700">
            {explanations[algorithm]}
          </p>
          <div className="mt-5 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
            <MetricPill label="Traffic Distribution" value="Active" />
            <MetricPill label="High Availability" value="Health checks" />
            <MetricPill label="Scalability" value={`${servers.length} servers`} />
            <MetricPill label="Health Monitoring" value="Mock status" />
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">Request Log</h2>
          <div className="mt-4 space-y-3">
            {logs.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                No events yet. Run a simulation to see the flow.
              </p>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className={`rounded-lg border p-3 text-sm leading-6 ${
                    log.tone === "warning"
                      ? "border-amber-200 bg-amber-50 text-amber-900"
                      : log.tone === "success"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                        : "border-slate-200 bg-slate-50 text-slate-700"
                  }`}
                >
                  {log.text}
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">
          Which Distributed Systems concepts does this prove?
        </h2>
        <ul className="mt-4 grid gap-3 text-slate-700 md:grid-cols-2">
          {[
            "Traffic distribution prevents one server from receiving all requests.",
            "Health checks improve availability by avoiding failed servers.",
            "Different algorithms make different trade-offs.",
            "Weighted routing models servers with different capacities.",
            "Sticky sessions keep session-related requests on the same server.",
            "Consistent hashing reduces remapping when servers join or leave.",
            "Resource-aware routing reacts to server load.",
            "Adding or removing servers demonstrates scalability.",
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

function ServerCard({ server }: { server: Server }) {
  return (
    <article
      className={`rounded-lg border bg-white p-5 shadow-sm ${
        server.healthy ? "border-slate-200" : "border-rose-200 bg-rose-50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-950">{server.name}</h2>
          <p
            className={`mt-2 w-fit rounded-full px-3 py-1 text-sm font-semibold ${
              server.healthy
                ? "bg-emerald-100 text-emerald-800"
                : "bg-rose-100 text-rose-800"
            }`}
          >
            Status: {server.healthy ? "Healthy" : "Failed"}
          </p>
        </div>
        <div className="rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white">
          Weight {server.weight}
        </div>
      </div>

      <dl className="mt-5 grid gap-3 text-sm">
        <ServerMetric label="Active requests" value={server.activeRequests} />
        <ServerMetric label="Total handled requests" value={server.totalHandled} />
        <ServerMetric
          label="Average response time"
          value={`${server.averageResponseTime} ms`}
        />
        <ServerMetric label="CPU usage" value={`${server.cpuUsage}%`} />
        <ServerMetric label="Memory usage" value={`${server.memoryUsage}%`} />
      </dl>
    </article>
  );
}

function ServerMetric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md bg-slate-50 px-3 py-2">
      <dt className="text-slate-600">{label}</dt>
      <dd className="font-semibold text-slate-950">{value}</dd>
    </div>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="font-semibold text-slate-950">{label}</p>
      <p className="mt-1 text-slate-600">{value}</p>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick: () => void;
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
      className={`rounded-md border px-4 py-2 text-sm font-semibold transition-colors ${variantClass}`}
    >
      {children}
    </button>
  );
}

function findMinimum(
  servers: Server[],
  getValue: (server: Server) => number,
) {
  return servers.reduce((bestServer, server) =>
    getValue(server) < getValue(bestServer) ? server : bestServer,
  );
}

function getAlgorithmLabel(algorithm: Algorithm) {
  return algorithms.find((item) => item.id === algorithm)?.label ?? "Unknown";
}

function simpleHash(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 100000;
  }

  return hash;
}

function removeStickyAssignmentsForServer(
  assignments: Record<string, string>,
  serverId: string,
) {
  return Object.fromEntries(
    Object.entries(assignments).filter(([, assignedServerId]) => {
      return assignedServerId !== serverId;
    }),
  );
}
