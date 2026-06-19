"use client";

import { useState } from "react";
import { PageShell } from "@/components/PageShell";

type ShardKey = "userId" | "region";
type ReplicationMode = "active" | "passive";
type Tone = "normal" | "success" | "warning" | "error";
type ShardPhase = "idle" | "incoming" | "decision" | "shard";
type ReplicaPhase = "idle" | "client" | "primary" | "replicas" | "complete";
type Concept = "Data Sharding" | "Shard Key" | "Active Replication" | "Passive Replication";

type RecordItem = { id: number; name: string; region: string };
type Shard = { id: number; healthy: boolean; records: RecordItem[] };
type Replica = { id: number; role: "Primary" | "Backup"; healthy: boolean; writes: string[] };
type EventItem = { id: string; text: string; tone: Tone };

const shardNames = ["Shard A", "Shard B", "Shard C"];
const regions = ["Americas", "Europe", "Asia"];
const initialShards: Shard[] = [0, 1, 2].map((id) => ({ id, healthy: true, records: [] }));
const initialReplicas: Replica[] = [
  { id: 0, role: "Primary", healthy: true, writes: [] },
  { id: 1, role: "Backup", healthy: true, writes: [] },
  { id: 2, role: "Backup", healthy: true, writes: [] },
];
const initialEvents: EventItem[] = [
  { id: "ready", text: "Simulator ready. Add a record to trace its route.", tone: "normal" },
];

const explanations: Record<Concept, { proven: string; demonstrates: string; matters: string }> = {
  "Data Sharding": {
    proven: "Horizontal partitioning",
    demonstrates: "Records are split across storage nodes instead of being kept in one place.",
    matters: "One server does not need to store or process all of the data.",
  },
  "Shard Key": {
    proven: "Deterministic distribution",
    demonstrates: "The selected key always produces a traceable target shard.",
    matters: "A poor shard key can overload one node while others remain underused.",
  },
  "Active Replication": {
    proven: "Replicated execution",
    demonstrates: "Every healthy replica receives and processes the same write in parallel.",
    matters: "Multiple current copies can keep service available after one replica fails.",
  },
  "Passive Replication": {
    proven: "Primary-backup replication",
    demonstrates: "The primary commits first, then sends its new state to healthy backups.",
    matters: "The recovery model is simple, but the primary remains central to writes.",
  },
};

const guide = {
  howToUse: [
    "Choose a shard key, then add one record or a short burst.",
    "Switch replication mode and simulate a write to compare packet paths.",
    "Fail and recover a selected shard or replica while watching availability.",
  ],
  observe: [
    "Each record pauses at the shard-key decision before reaching its shard.",
    "Active writes fan out; passive writes commit at the primary before backups.",
    "Healthy copies preserve service while failed nodes create degraded states.",
  ],
  concepts: ["Data sharding and deterministic shard keys.", "Active and passive replication.", "High availability and fault tolerance."],
};

const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export default function ShardingReplicationPage() {
  const [shards, setShards] = useState<Shard[]>(initialShards);
  const [replicas, setReplicas] = useState<Replica[]>(initialReplicas);
  const [shardKey, setShardKey] = useState<ShardKey>("userId");
  const [replicationMode, setReplicationMode] = useState<ReplicationMode>("active");
  const [shardPhase, setShardPhase] = useState<ShardPhase>("idle");
  const [replicaPhase, setReplicaPhase] = useState<ReplicaPhase>("idle");
  const [activeRecord, setActiveRecord] = useState<RecordItem | null>(null);
  const [targetShard, setTargetShard] = useState<number | null>(null);
  const [nextRecordId, setNextRecordId] = useState(104);
  const [writeNumber, setWriteNumber] = useState(1);
  const [latestDecision, setLatestDecision] = useState("No record routed yet.");
  const [replicationStatus, setReplicationStatus] = useState("Ready for a replicated write.");
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [busy, setBusy] = useState(false);
  const [failureType, setFailureType] = useState<"shard" | "replica">("shard");
  const [failureId, setFailureId] = useState(0);
  const [concept, setConcept] = useState<Concept>("Data Sharding");

  const healthyShards = shards.filter((shard) => shard.healthy).length;
  const healthyReplicas = replicas.filter((replica) => replica.healthy).length;
  const primaryHealthy = replicas[0].healthy;
  const totalRecords = shards.reduce((total, shard) => total + shard.records.length, 0);
  const availability = getAvailability(healthyShards, healthyReplicas, primaryHealthy, replicationMode);
  const selectedFailed = failureType === "shard" ? !shards[failureId]?.healthy : !replicas[failureId]?.healthy;
  const explanation = explanations[concept];

  function log(text: string, tone: Tone = "normal") {
    setEvents((current) => [{ id: `${Date.now()}-${text}`, text, tone }, ...current].slice(0, 10));
  }

  function getRoute(record: RecordItem) {
    if (shardKey === "userId") {
      const target = record.id % 3;
      return { target, decision: `userId ${record.id} → ${record.id} % 3 = ${target} → ${shardNames[target]}` };
    }
    const target = regions.indexOf(record.region);
    return { target, decision: `region “${record.region}” → mapping ${target} → ${shardNames[target]}` };
  }

  async function routeRecord(record: RecordItem) {
    const route = getRoute(record);
    setActiveRecord(record);
    setTargetShard(route.target);
    setLatestDecision(`Record #${record.id} is entering the router…`);
    setConcept("Shard Key");
    setShardPhase("incoming");
    log(`Record #${record.id} used ${shardKey} as its shard key.`);
    await wait(450);
    setShardPhase("decision");
    setLatestDecision(route.decision);
    await wait(650);
    setShardPhase("shard");

    const destination = shards[route.target];
    if (!destination.healthy) {
      setLatestDecision(`${route.decision}. Route blocked: ${shardNames[route.target]} is down.`);
      log(`${shardNames[route.target]} is down; Record #${record.id} could not be stored.`, "error");
    } else {
      setShards((current) => current.map((shard) => shard.id === route.target ? { ...shard, records: [...shard.records, record] } : shard));
      setLatestDecision(route.decision);
      log(`Record #${record.id} routed to ${shardNames[route.target]}.`, "success");
    }
    await wait(500);
    setShardPhase("idle");
  }

  async function addRecords(count: number) {
    if (busy) return;
    setBusy(true);
    for (let index = 0; index < count; index += 1) {
      const id = nextRecordId + index;
      await routeRecord({ id, name: `Student ${id}`, region: regions[id % 3] });
      if (index < count - 1) await wait(160);
    }
    setNextRecordId((current) => current + count);
    setBusy(false);
  }

  function changeShardKey(value: ShardKey) {
    setShardKey(value);
    setConcept("Shard Key");
    setLatestDecision(value === "userId" ? "Rule changed: userId % 3 selects the shard." : "Rule changed: region maps to Americas=A, Europe=B, Asia=C.");
    log(`Shard key changed to ${value}.`, "warning");
  }

  function changeReplicationMode(mode: ReplicationMode) {
    setReplicationMode(mode);
    setConcept(mode === "active" ? "Active Replication" : "Passive Replication");
    setReplicationStatus(mode === "active" ? "Next write will fan out to every healthy replica." : "Next write will commit on Primary, then copy to backups.");
    log(`${mode === "active" ? "Active" : "Passive"} Replication selected.`);
  }

  async function simulateWrite() {
    if (busy) return;
    setBusy(true);
    const label = `Write W${writeNumber}`;
    setReplicaPhase("client");
    setReplicationStatus(`${label} left the client.`);
    await wait(450);

    if (replicationMode === "active") {
      setConcept("Active Replication");
      setReplicaPhase("replicas");
      if (healthyReplicas === 0) {
        setReplicationStatus(`${label} failed: every replica is down.`);
        log("Active replication failed because every replica is down.", "error");
      } else {
        setReplicationStatus(`${label} is moving to all ${healthyReplicas} healthy replicas in parallel.`);
        await wait(800);
        setReplicas((current) => current.map((replica) => replica.healthy ? { ...replica, writes: [...replica.writes, label] } : replica));
        setReplicationStatus(`${label} processed by all healthy replicas${healthyReplicas < 3 ? "; service remains degraded" : ""}.`);
        log("Active replication sent the update to all healthy replicas.", healthyReplicas < 3 ? "warning" : "success");
      }
    } else {
      setConcept("Passive Replication");
      setReplicaPhase("primary");
      if (!primaryHealthy) {
        setReplicationStatus(`${label} rejected: Primary is down, so this simple model cannot accept writes.`);
        log("Passive write failed because Primary is down.", "error");
      } else {
        setReplicationStatus(`${label} is committing on Primary…`);
        await wait(700);
        setReplicas((current) => current.map((replica) => replica.id === 0 ? { ...replica, writes: [...replica.writes, label] } : replica));
        setReplicationStatus(`${label} committed. Primary is now copying it to backups…`);
        setReplicaPhase("replicas");
        await wait(750);
        setReplicas((current) => current.map((replica) => replica.id > 0 && replica.healthy ? { ...replica, writes: [...replica.writes, label] } : replica));
        const healthyBackups = replicas.filter((replica) => replica.id > 0 && replica.healthy).length;
        setReplicationStatus(`${label} committed on Primary and copied to ${healthyBackups} healthy backup${healthyBackups === 1 ? "" : "s"}.`);
        log("Passive replication committed on Primary, then copied to healthy backups.", healthyBackups < 2 ? "warning" : "success");
      }
    }

    setReplicaPhase("complete");
    await wait(500);
    setReplicaPhase("idle");
    setWriteNumber((current) => current + 1);
    setBusy(false);
  }

  function toggleSelectedNode() {
    if (failureType === "shard") {
      const wasHealthy = shards[failureId].healthy;
      setShards((current) => current.map((shard) => shard.id === failureId ? { ...shard, healthy: !shard.healthy } : shard));
      log(`${shardNames[failureId]} ${wasHealthy ? "failed; requests for its data are degraded" : "recovered and can receive records again"}.`, wasHealthy ? "error" : "success");
      setConcept("Data Sharding");
    } else {
      const wasHealthy = replicas[failureId].healthy;
      setReplicas((current) => current.map((replica) => replica.id === failureId ? { ...replica, healthy: !replica.healthy } : replica));
      log(`Replica ${failureId + 1} ${wasHealthy ? "failed" : "recovered"}.`, wasHealthy ? "error" : "success");
      setConcept(replicationMode === "active" ? "Active Replication" : "Passive Replication");
    }
  }

  function resetSimulation() {
    setShards(initialShards);
    setReplicas(initialReplicas);
    setShardKey("userId");
    setReplicationMode("active");
    setShardPhase("idle");
    setReplicaPhase("idle");
    setActiveRecord(null);
    setTargetShard(null);
    setNextRecordId(104);
    setWriteNumber(1);
    setLatestDecision("No record routed yet.");
    setReplicationStatus("Ready for a replicated write.");
    setEvents([{ id: `reset-${Date.now()}`, text: "Simulation reset. All nodes are healthy and storage is empty.", tone: "normal" }]);
    setFailureType("shard");
    setFailureId(0);
    setConcept("Data Sharding");
  }

  return (
    <PageShell
      title="Sharding & Replication"
      subtitle="Sharding splits data across nodes using a shard key. Replication keeps copies so the system can stay available during failure."
      guide={guide}
    >
      <div className="flex flex-wrap gap-2" aria-label="Concepts covered">
        {["Data Sharding", "Shard Key", "Active Replication", "Passive Replication", "High Availability", "Fault Tolerance"].map((badge) => (
          <span key={badge} className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-900">{badge}</span>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-cyan-200 bg-gradient-to-br from-white via-sky-50/60 to-cyan-50 shadow-xl shadow-cyan-100/60 dark:border-cyan-800/60 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 dark:shadow-black/20">
        <SectionHeader eyebrow="Sharding canvas" title="Trace a record from request to storage" status={busy && shardPhase !== "idle" ? "Routing now" : "Ready"} />
        <div className="p-4 sm:p-6">
          <div className="grid gap-3 lg:grid-cols-[0.8fr_auto_0.9fr_auto_2fr] lg:items-stretch">
            <FlowNode title="Incoming Record" detail={activeRecord ? `#${activeRecord.id} · ${activeRecord.region}` : "Waiting for a generated record"} active={shardPhase === "incoming"} marker="01" />
            <FlowArrow active={shardPhase === "decision"} label="key" />
            <FlowNode title="Shard Key Decision" detail={shardKey === "userId" ? "userId % 3" : "region → fixed map"} active={shardPhase === "decision"} marker="ƒ(x)" tone="amber" />
            <FlowArrow active={shardPhase === "shard"} label="route" />
            <div className="grid min-w-0 gap-3 sm:grid-cols-3">
              {shards.map((shard) => <ShardCard key={shard.id} shard={shard} active={shardPhase === "shard" && targetShard === shard.id} shardKey={shardKey} />)}
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-sky-200 bg-white p-4" aria-live="polite">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-700">Latest routing decision</p>
            <p className="mt-2 break-words font-mono text-sm font-bold leading-6 text-slate-900">{latestDecision}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-800">Controls</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">Change the routing experiment</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="sm:col-span-2 lg:col-span-1">
              <span className="text-xs font-bold text-slate-600">Shard key</span>
              <select value={shardKey} onChange={(event) => changeShardKey(event.target.value as ShardKey)} disabled={busy} className={selectClass}>
                <option value="userId">userId</option><option value="region">region</option>
              </select>
            </label>
            <ActionButton onClick={() => addRecords(1)} disabled={busy}>Add Record</ActionButton>
            <ActionButton onClick={() => addRecords(5)} disabled={busy} variant="secondary">Add Burst ×5</ActionButton>
            <ActionButton onClick={resetSimulation} disabled={busy} variant="secondary">Reset Simulation</ActionButton>
          </div>
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Status & metrics</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Metric label="Total records" value={totalRecords} />
            <Metric label="Shard key" value={shardKey} />
            {shards.map((shard) => <Metric key={shard.id} label={shardNames[shard.id]} value={`${shard.records.length} records`} />)}
            <Metric label="Mode" value={replicationMode === "active" ? "Active" : "Passive"} />
            <Metric label="Healthy shards" value={`${healthyShards}/3`} tone={healthyShards === 3 ? "success" : "warning"} />
            <Metric label="Healthy replicas" value={`${healthyReplicas}/3`} tone={healthyReplicas === 3 ? "success" : healthyReplicas ? "warning" : "error"} />
            <Metric label="Availability" value={availability} tone={availability === "Available" ? "success" : availability === "Degraded" ? "warning" : "error"} />
          </div>
        </aside>
      </section>

      <section className="overflow-hidden rounded-2xl border border-sky-200 bg-gradient-to-br from-white to-sky-50 shadow-sm dark:border-sky-800/60 dark:from-slate-900 dark:to-slate-800 dark:shadow-black/20">
        <SectionHeader eyebrow="Replication canvas" title="Compare parallel and primary-backup writes" status={replicationMode === "active" ? "Active mode" : "Passive mode"} />
        <div className="p-4 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2" role="group" aria-label="Replication mode">
            {(["active", "passive"] as ReplicationMode[]).map((mode) => (
              <button key={mode} type="button" disabled={busy} onClick={() => changeReplicationMode(mode)} aria-pressed={replicationMode === mode} className={`rounded-xl border p-4 text-left transition-all ${replicationMode === mode ? "border-cyan-600 bg-cyan-50 ring-2 ring-cyan-100" : "border-slate-200 bg-white hover:border-cyan-300"}`}>
                <span className="font-bold text-slate-950">{mode === "active" ? "Active Replication" : "Passive Replication"}</span>
                <span className="mt-1 block text-sm leading-5 text-slate-600">{mode === "active" ? "Client → all replicas in parallel" : "Client → Primary → Backup replicas"}</span>
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-[0.65fr_auto_2fr] lg:items-center">
            <FlowNode title="Client Write" detail={`Next operation: W${writeNumber}`} active={replicaPhase === "client"} marker="W" />
            <FlowArrow active={replicaPhase === "primary" || replicaPhase === "replicas"} label={replicationMode === "active" ? "fan out" : "commit"} />
            <div className="grid gap-3 sm:grid-cols-3">
              {replicas.map((replica) => (
                <ReplicaCard key={replica.id} replica={replica} active={replicationMode === "active" ? replicaPhase === "replicas" : replica.id === 0 ? replicaPhase === "primary" : replicaPhase === "replicas"} pending={replicationMode === "passive" && replica.id > 0 && replicaPhase === "primary"} />
              ))}
            </div>
          </div>
          <div className={`mt-4 rounded-xl border p-4 text-sm font-bold leading-6 ${replicaPhase === "primary" ? "border-amber-200 bg-amber-50 text-amber-950" : "border-sky-200 bg-white text-slate-900"}`} aria-live="polite">{replicationStatus}</div>
          <ActionButton onClick={simulateWrite} disabled={busy} className="mt-4">Simulate Write</ActionButton>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-rose-700">Failure simulation</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">Fail or recover one node</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <label><span className="text-xs font-bold text-slate-600">Node layer</span><select value={failureType} disabled={busy} onChange={(event) => { setFailureType(event.target.value as "shard" | "replica"); setFailureId(0); }} className={selectClass}><option value="shard">Shard</option><option value="replica">Replica</option></select></label>
            <label><span className="text-xs font-bold text-slate-600">Selected node</span><select value={failureId} disabled={busy} onChange={(event) => setFailureId(Number(event.target.value))} className={selectClass}>{[0, 1, 2].map((id) => <option key={id} value={id}>{failureType === "shard" ? shardNames[id] : `Replica ${id + 1}${id === 0 ? " (Primary)" : " (Backup)"}`}</option>)}</select></label>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <ActionButton onClick={toggleSelectedNode} disabled={busy} variant={selectedFailed ? "secondary" : "danger"}>{selectedFailed ? "Recover selected node" : "Fail selected node"}</ActionButton>
            <ActionButton onClick={resetSimulation} disabled={busy} variant="secondary">Reset</ActionButton>
          </div>
          <div className={`mt-4 rounded-xl border p-4 text-sm leading-6 ${toneClass(availability === "Available" ? "success" : availability === "Degraded" ? "warning" : "error")}`}>
            <strong>{availability}.</strong> {availabilityMessage(availability, replicationMode, primaryHealthy)}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-800">Recent event timeline</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">What the system decided</h2>
          <ol className="mt-4 space-y-2" aria-live="polite">
            {events.map((event, index) => <li key={event.id} className={`flex gap-3 rounded-xl border p-3 text-sm leading-6 ${toneClass(event.tone)}`}><span className="shrink-0 font-mono text-xs font-black opacity-60">{String(events.length - index).padStart(2, "0")}</span><span>{event.text}</span></li>)}
          </ol>
        </div>
      </section>

      <section className="rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-white p-5 shadow-sm dark:border-cyan-800/60 dark:from-cyan-950/30 dark:to-slate-900 dark:shadow-black/20 sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-800">Academic explanation</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {(Object.keys(explanations) as Concept[]).map((item) => <button key={item} type="button" onClick={() => setConcept(item)} className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${concept === item ? "border-cyan-700 bg-cyan-700 text-white" : "border-cyan-200 bg-white text-cyan-900 hover:bg-cyan-100"}`}>{item}</button>)}
        </div>
        <h2 className="mt-5 text-2xl font-bold text-slate-950">{concept}</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <Explanation label="Concept proven" text={explanation.proven} />
          <Explanation label="What this demonstrates" text={explanation.demonstrates} />
          <Explanation label="Why it matters" text={explanation.matters} />
        </div>
      </section>
    </PageShell>
  );
}

function SectionHeader({ eyebrow, title, status }: { eyebrow: string; title: string; status: string }) {
  return <div className="flex flex-col gap-3 border-b border-cyan-100 bg-white/80 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-800">{eyebrow}</p><h2 className="mt-1 text-xl font-bold text-slate-950 sm:text-2xl">{title}</h2></div><span className="w-fit rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-bold text-cyan-900"><span className="mr-2 inline-block h-2 w-2 rounded-full bg-cyan-500" />{status}</span></div>;
}

function FlowNode({ title, detail, active, marker, tone = "cyan" }: { title: string; detail: string; active: boolean; marker: string; tone?: "cyan" | "amber" }) {
  const color = tone === "amber" ? "border-amber-200 bg-amber-50" : "border-cyan-200 bg-cyan-50";
  return <article className={`relative min-w-0 rounded-xl border p-4 transition-all duration-300 ${color} ${active ? "-translate-y-1 shadow-lg ring-2 ring-cyan-200 motion-reduce:translate-y-0" : "shadow-sm"}`} aria-current={active ? "step" : undefined}><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white font-mono text-xs font-black text-cyan-900 shadow-sm">{marker}</span><h3 className="mt-3 font-bold text-slate-950">{title}</h3><p className="mt-1 break-words text-sm leading-5 text-slate-600">{detail}</p>{active ? <Packet /> : null}</article>;
}

function FlowArrow({ active, label }: { active: boolean; label: string }) {
  return <div className={`flex min-h-10 items-center justify-center gap-2 text-xs font-bold uppercase tracking-wide transition-colors ${active ? "text-cyan-700" : "text-slate-400"}`}><span className={`h-0.5 w-8 rounded-full transition-all ${active ? "w-12 bg-cyan-500" : "bg-slate-300"}`} /><span>{label}</span><span aria-hidden="true">→</span></div>;
}

function Packet() {
  return <span className="absolute right-3 top-3 flex h-4 w-4" aria-hidden="true"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-500 opacity-40 motion-reduce:animate-none" /><span className="relative inline-flex h-4 w-4 animate-bounce rounded-full border-2 border-white bg-cyan-500 shadow motion-reduce:animate-none" /></span>;
}

function ShardCard({ shard, active, shardKey }: { shard: Shard; active: boolean; shardKey: ShardKey }) {
  return <article className={`relative min-w-0 rounded-xl border p-4 transition-all ${shard.healthy ? active ? "border-cyan-400 bg-cyan-50 shadow-lg ring-2 ring-cyan-100" : "border-slate-200 bg-white" : "border-rose-300 bg-rose-50"}`}><div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="font-bold text-slate-950">{shardNames[shard.id]}</h3><p className={`mt-1 text-xs font-bold ${shard.healthy ? "text-emerald-700" : "text-rose-700"}`}>● {shard.healthy ? "Healthy" : "Failed"}</p></div><span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-bold text-slate-700">{shard.records.length}</span></div><p className="mt-3 text-xs leading-5 text-slate-500">{shardKey === "userId" ? `userId % 3 = ${shard.id}` : `${regions[shard.id]} → ${shardNames[shard.id]}`}</p><div className="mt-3 flex min-h-8 flex-wrap gap-1.5">{shard.records.length ? shard.records.slice(-5).map((record) => <span key={`${record.id}-${record.name}`} className="max-w-full truncate rounded-md border border-cyan-200 bg-white px-2 py-1 font-mono text-xs font-bold text-cyan-900">#{record.id}</span>) : <span className="text-xs italic text-slate-400">No records</span>}</div>{active ? <Packet /> : null}</article>;
}

function ReplicaCard({ replica, active, pending }: { replica: Replica; active: boolean; pending: boolean }) {
  return <article className={`relative min-w-0 rounded-xl border p-4 transition-all ${!replica.healthy ? "border-rose-300 bg-rose-50" : pending ? "border-amber-300 bg-amber-50" : active ? "border-cyan-400 bg-cyan-50 shadow-lg ring-2 ring-cyan-100" : "border-slate-200 bg-white"}`}><div className="flex items-start justify-between gap-2"><div><h3 className="font-bold text-slate-950">Replica {replica.id + 1}</h3><p className="mt-1 text-xs font-semibold text-slate-500">{replica.role}</p></div><span className={`rounded-full px-2 py-1 text-[11px] font-black ${replica.healthy ? pending ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>{replica.healthy ? pending ? "WAITING" : "HEALTHY" : "FAILED"}</span></div><p className="mt-4 text-xs font-semibold text-slate-600">Processed writes: {replica.writes.length}</p><div className="mt-2 flex min-h-7 flex-wrap gap-1">{replica.writes.slice(-4).map((write) => <span key={`${replica.id}-${write}`} className="rounded bg-sky-100 px-2 py-1 font-mono text-xs font-bold text-sky-900">{write}</span>)}</div>{active && replica.healthy ? <Packet /> : null}</article>;
}

function Metric({ label, value, tone = "normal" }: { label: string; value: string | number; tone?: Tone }) {
  return <div className={`min-w-0 rounded-xl border p-3 ${toneClass(tone)}`}><p className="text-xs font-semibold opacity-70">{label}</p><p className="mt-1 break-words font-mono text-sm font-bold sm:text-base">{value}</p></div>;
}

function Explanation({ label, text }: { label: string; text: string }) {
  return <div className="rounded-xl border border-cyan-100 bg-white p-4"><h3 className="text-sm font-bold text-cyan-900">{label}</h3><p className="mt-2 leading-7 text-slate-700">{text}</p></div>;
}

function ActionButton({ children, onClick, disabled = false, variant = "primary", className = "" }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; variant?: "primary" | "secondary" | "danger"; className?: string }) {
  const style = variant === "danger" ? "border-rose-700 bg-rose-700 text-white hover:bg-rose-800" : variant === "secondary" ? "border-slate-300 bg-white text-slate-800 hover:bg-slate-100" : "border-cyan-700 bg-cyan-700 text-white hover:bg-cyan-800";
  return <button type="button" onClick={onClick} disabled={disabled} className={`min-h-11 rounded-lg border px-4 py-2 text-sm font-bold transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 motion-reduce:transition-none ${style} ${className}`}>{children}</button>;
}

const selectClass = "mt-1.5 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-900 shadow-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100 disabled:opacity-50";

function toneClass(tone: Tone) {
  if (tone === "success") return "border-emerald-200 bg-emerald-50 text-emerald-900";
  if (tone === "warning") return "border-amber-200 bg-amber-50 text-amber-900";
  if (tone === "error") return "border-rose-200 bg-rose-50 text-rose-900";
  return "border-slate-200 bg-slate-50 text-slate-700";
}

function getAvailability(healthyShards: number, healthyReplicas: number, primaryHealthy: boolean, mode: ReplicationMode) {
  if (healthyShards === 0 || healthyReplicas === 0 || (mode === "passive" && !primaryHealthy)) return "Unavailable";
  if (healthyShards < 3 || healthyReplicas < 3) return "Degraded";
  return "Available";
}

function availabilityMessage(status: string, mode: ReplicationMode, primaryHealthy: boolean) {
  if (status === "Available") return "All shards and replicas can serve their intended role.";
  if (status === "Unavailable") return mode === "passive" && !primaryHealthy ? "Passive writes need the Primary; this simulator does not perform leader election." : "No healthy copy is available for at least one required layer.";
  return mode === "active" ? "Healthy replicas can still process writes, but redundancy is reduced." : "Service continues, but one shard or backup copy has failed.";
}
