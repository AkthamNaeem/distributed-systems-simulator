"use client";

import { useState } from "react";
import { PageShell } from "@/components/PageShell";

type ReplicationMode = "none" | "active" | "passive";
type LogTone = "normal" | "success" | "warning" | "error";

type StoredRecord = {
  id: number;
  name: string;
};

type Shard = {
  id: number;
  healthy: boolean;
  records: StoredRecord[];
  replicaRecords: StoredRecord[];
  pendingReplicaRecords: StoredRecord[];
};

type LogEntry = {
  id: string;
  text: string;
  tone?: LogTone;
};

const shardCount = 3;

const initialShards: Shard[] = [
  { id: 0, healthy: true, records: [], replicaRecords: [], pendingReplicaRecords: [] },
  { id: 1, healthy: true, records: [], replicaRecords: [], pendingReplicaRecords: [] },
  { id: 2, healthy: true, records: [], replicaRecords: [], pendingReplicaRecords: [] },
];

const mockRecords: StoredRecord[] = [
  { id: 101, name: "Ada" },
  { id: 102, name: "Grace" },
  { id: 103, name: "Linus" },
  { id: 104, name: "Barbara" },
];

const replicationModes: { id: ReplicationMode; label: string }[] = [
  { id: "none", label: "No Replication" },
  { id: "active", label: "Active Replication" },
  { id: "passive", label: "Passive Replication" },
];

const conceptCards = [
  {
    title: "Data Sharding",
    explanation:
      "Splits data across multiple nodes so one server does not store everything.",
  },
  {
    title: "Shard Key",
    explanation: "A value used to decide which shard owns a record.",
  },
  {
    title: "Active Replication",
    explanation: "Writes are applied to multiple replicas immediately.",
  },
  {
    title: "Passive Replication",
    explanation:
      "A primary node receives writes first, then updates backup replicas later.",
  },
  {
    title: "High Availability",
    explanation:
      "The system can continue serving requests when one component fails.",
  },
  {
    title: "Fault Tolerance",
    explanation: "The system manages failures instead of completely stopping.",
  },
];

const proofItems = [
  "Sharding distributes data across multiple storage nodes.",
  "A shard key determines where each record belongs.",
  "Failed shards can make part of the data unavailable.",
  "Replication keeps additional copies of data.",
  "Active replication updates copies immediately.",
  "Passive replication updates backup copies after the primary.",
  "Replicas can improve availability during failure.",
  "Distributed storage must handle partial failure.",
];

export default function ShardingReplicationPage() {
  const [shards, setShards] = useState<Shard[]>(initialShards);
  const [replicationMode, setReplicationMode] =
    useState<ReplicationMode>("none");
  const [selectedRecordId, setSelectedRecordId] = useState(mockRecords[0].id);
  const [recordName, setRecordName] = useState(mockRecords[0].name);
  const [readRecordId, setReadRecordId] = useState(mockRecords[0].id);
  const [replicaFailed, setReplicaFailed] = useState(false);
  const [routeMessage, setRouteMessage] = useState(
    "Insert or read a record to see the shard key calculation.",
  );
  const [readResult, setReadResult] = useState("No read request sent yet.");
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: "initial",
      text: "Simulator ready. Shard key rule is recordId % shardCount.",
      tone: "normal",
    },
  ]);

  const selectedShardOne = shards.find((shard) => shard.id === 1);

  function addLogs(entries: Omit<LogEntry, "id">[]) {
    const timestamp = Date.now();
    const nextLogs = entries.map((entry, index) => ({
      ...entry,
      id: `${timestamp}-${index}-${entry.text}`,
    }));

    setLogs((currentLogs) => [...nextLogs.reverse(), ...currentLogs].slice(0, 12));
  }

  function selectMockRecord(recordId: number) {
    const record = mockRecords.find((item) => item.id === recordId);

    setSelectedRecordId(recordId);

    if (record) {
      setRecordName(record.name);
    }
  }

  function changeReplicationMode(nextMode: ReplicationMode) {
    setReplicationMode(nextMode);
    setShards((currentShards) =>
      currentShards.map((shard) => {
        if (nextMode === "none") {
          return { ...shard, replicaRecords: [], pendingReplicaRecords: [] };
        }

        if (nextMode === "active") {
          return {
            ...shard,
            replicaRecords: shard.records,
            pendingReplicaRecords: [],
          };
        }

        return {
          ...shard,
          replicaRecords: [],
          pendingReplicaRecords: shard.records,
        };
      }),
    );

    const modeLabel = getReplicationLabel(nextMode);
    addLogs([
      {
        text:
          nextMode === "active"
            ? "Active Replication selected. Future writes update primary and replica immediately."
            : nextMode === "passive"
              ? "Passive Replication selected. Replica copies wait for manual sync."
              : "No Replication selected. Data is stored only on the target shard.",
        tone: nextMode === "none" ? "warning" : "success",
      },
      { text: `Replication mode changed to ${modeLabel}.`, tone: "normal" },
    ]);
  }

  function insertRecord() {
    const record: StoredRecord = {
      id: selectedRecordId,
      name: recordName.trim() || `User #${selectedRecordId}`,
    };
    const targetShardId = getShardId(record.id);
    const calculation = `Shard key calculation: ${record.id} % ${shardCount} = ${targetShardId}`;
    const targetShard = shards.find((shard) => shard.id === targetShardId);

    setRouteMessage(calculation);

    if (!targetShard?.healthy) {
      addLogs([
        { text: calculation, tone: "normal" },
        {
          text: "Primary shard is unavailable. Write cannot complete without a healthy target shard.",
          tone: "error",
        },
      ]);
      return;
    }

    setShards((currentShards) =>
      currentShards.map((shard) => {
        if (shard.id !== targetShardId) {
          return shard;
        }

        const records = upsertRecord(shard.records, record);

        if (replicationMode === "active") {
          return {
            ...shard,
            records,
            replicaRecords: upsertRecord(shard.replicaRecords, record),
            pendingReplicaRecords: removePendingRecord(
              shard.pendingReplicaRecords,
              record.id,
            ),
          };
        }

        if (replicationMode === "passive") {
          return {
            ...shard,
            records,
            pendingReplicaRecords: upsertRecord(
              shard.pendingReplicaRecords,
              record,
            ),
          };
        }

        return { ...shard, records };
      }),
    );

    const recordLabel = getRecordLabel(record);
    const nextLogs: Omit<LogEntry, "id">[] = [
      { text: calculation, tone: "normal" },
      {
        text: `Inserted ${recordLabel} into Shard ${targetShardId}`,
        tone: "success",
      },
    ];

    if (replicationMode === "active") {
      nextLogs.push({
        text: `Active replication copied ${recordLabel} to replica`,
        tone: "success",
      });
    }

    if (replicationMode === "passive") {
      nextLogs.push({
        text: "Passive replica is waiting for sync",
        tone: "warning",
      });
    }

    addLogs(nextLogs);
  }

  function readRecord() {
    const targetShardId = getShardId(readRecordId);
    const calculation = `Shard key calculation: ${readRecordId} % ${shardCount} = ${targetShardId}`;
    const targetShard = shards.find((shard) => shard.id === targetShardId);
    const primaryRecord = targetShard?.records.find(
      (record) => record.id === readRecordId,
    );
    const replicaRecord = targetShard?.replicaRecords.find(
      (record) => record.id === readRecordId,
    );

    setRouteMessage(calculation);

    if (targetShard?.healthy) {
      if (primaryRecord) {
        const message = `Read ${getRecordLabel(primaryRecord)} from primary Shard ${targetShardId}`;
        setReadResult(message);
        addLogs([
          { text: calculation, tone: "normal" },
          { text: message, tone: "success" },
        ]);
        return;
      }

      setReadResult("Record not found");
      addLogs([
        { text: calculation, tone: "normal" },
        { text: "Record not found", tone: "warning" },
      ]);
      return;
    }

    if (replicationMode !== "none" && !replicaFailed && replicaRecord) {
      const message = `Primary shard failed. Read served from replica: ${getRecordLabel(replicaRecord)}`;
      setReadResult(message);
      addLogs([
        { text: calculation, tone: "normal" },
        { text: "Primary shard failed. Read served from replica", tone: "success" },
      ]);
      return;
    }

    if (replicationMode === "none") {
      const message =
        "Read failed because the primary shard is unavailable and replication is disabled.";
      setReadResult(message);
      addLogs([
        { text: calculation, tone: "normal" },
        { text: "Read failed because primary and replica are unavailable", tone: "error" },
      ]);
      return;
    }

    if (replicaFailed) {
      const message =
        "Read failed because primary and replica are unavailable.";
      setReadResult(message);
      addLogs([
        { text: calculation, tone: "normal" },
        { text: "Read failed because primary and replica are unavailable", tone: "error" },
      ]);
      return;
    }

    const message =
      "Primary shard failed and the replica does not contain this record.";
    setReadResult(message);
    addLogs([
      { text: calculation, tone: "normal" },
      { text: message, tone: "error" },
    ]);
  }

  function syncPassiveReplicas() {
    if (replicationMode !== "passive") {
      addLogs([
        {
          text: "Passive sync is only available in Passive Replication mode.",
          tone: "warning",
        },
      ]);
      return;
    }

    const syncedCount = shards.reduce(
      (count, shard) => count + shard.pendingReplicaRecords.length,
      0,
    );

    setShards((currentShards) =>
      currentShards.map((shard) => {
        return {
          ...shard,
          replicaRecords: shard.records,
          pendingReplicaRecords: [],
        };
      }),
    );

    addLogs([
      {
        text:
          syncedCount === 0
            ? "Passive replicas already match their primary shards."
            : `Passive replication synced ${syncedCount} pending record ${getCopyWord(syncedCount)}.`,
        tone: "success",
      },
    ]);
  }

  function toggleShardOneFailure() {
    const nextHealthy = !(selectedShardOne?.healthy ?? true);

    setShards((currentShards) =>
      currentShards.map((shard) =>
        shard.id === 1 ? { ...shard, healthy: nextHealthy } : shard,
      ),
    );

    addLogs([
      {
        text: nextHealthy
          ? "Shard 1 recovered and can receive reads and writes again."
          : "Shard 1 failed. Writes to Shard 1 are blocked.",
        tone: nextHealthy ? "success" : "error",
      },
    ]);
  }

  function toggleReplicaFailure() {
    const nextReplicaFailed = !replicaFailed;

    setReplicaFailed(nextReplicaFailed);
    addLogs([
      {
        text: nextReplicaFailed
          ? "Replica failure enabled. Replica reads are unavailable."
          : "Replica recovered. Replica reads are available again.",
        tone: nextReplicaFailed ? "error" : "success",
      },
    ]);
  }

  function resetStorage() {
    setShards(initialShards);
    setReplicationMode("none");
    setSelectedRecordId(mockRecords[0].id);
    setRecordName(mockRecords[0].name);
    setReadRecordId(mockRecords[0].id);
    setReplicaFailed(false);
    setRouteMessage("Insert or read a record to see the shard key calculation.");
    setReadResult("No read request sent yet.");
    setLogs([
      {
        id: "reset",
        text: "Reset Storage cleared records, statuses, logs, and replication state.",
        tone: "normal",
      },
    ]);
  }

  return (
    <PageShell
      title="Sharding & Replication Simulator"
      subtitle="This simulator shows how distributed storage divides records across shards using a shard key, and how replication keeps extra copies of data to improve availability and fault tolerance."
    >
      <section className="grid gap-4 lg:grid-cols-3">
        {shards.map((shard) => (
          <ShardCard
            key={shard.id}
            shard={shard}
            replicationMode={replicationMode}
            replicaFailed={replicaFailed}
          />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <SimulatorPanel
          title="Shard Key and Record Routing"
          summary="Insert a mock user record and watch the browser calculate which shard owns it."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">
                Record ID
              </span>
              <select
                value={selectedRecordId}
                onChange={(event) => selectMockRecord(Number(event.target.value))}
                className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
              >
                {mockRecords.map((record) => (
                  <option key={record.id} value={record.id}>
                    User #{record.id}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">
                User name
              </span>
              <input
                value={recordName}
                onChange={(event) => setRecordName(event.target.value)}
                className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
              />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <ActionButton onClick={insertRecord}>Insert Record</ActionButton>
            <ActionButton onClick={resetStorage} variant="secondary">
              Reset Storage
            </ActionButton>
          </div>

          <ResultBox text={routeMessage} />
        </SimulatorPanel>

        <SimulatorPanel
          title="Read Record"
          summary="Reads use the same shard key. A healthy replica can answer when the primary shard has failed."
        >
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">
              Record ID to read
            </span>
            <input
              type="number"
              value={readRecordId}
              onChange={(event) => setReadRecordId(Number(event.target.value))}
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
            />
          </label>

          <div className="mt-5 flex flex-wrap gap-3">
            <ActionButton onClick={readRecord}>Read Record</ActionButton>
          </div>

          <ResultBox text={readResult} />
        </SimulatorPanel>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <SimulatorPanel
          title="Replication Mode"
          summary={getReplicationExplanation(replicationMode)}
        >
          <div className="grid gap-3 sm:grid-cols-3">
            {replicationModes.map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => changeReplicationMode(mode.id)}
                className={`rounded-md border px-4 py-3 text-sm font-semibold transition-colors ${
                  replicationMode === mode.id
                    ? "border-cyan-700 bg-cyan-700 text-white"
                    : "border-slate-300 bg-white text-slate-800 hover:bg-slate-100"
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <ActionButton
              onClick={syncPassiveReplicas}
              disabled={replicationMode !== "passive"}
              variant="secondary"
            >
              Sync Passive Replicas
            </ActionButton>
          </div>
        </SimulatorPanel>

        <SimulatorPanel
          title="Failure Simulation"
          summary="Fail Shard 1 to test primary shard failure. Fail replicas to show when the backup copy cannot help."
        >
          <div className="flex flex-wrap gap-3">
            <ActionButton
              onClick={toggleShardOneFailure}
              variant={selectedShardOne?.healthy ? "danger" : "secondary"}
            >
              Toggle Shard 1 Failure
            </ActionButton>
            <ActionButton
              onClick={toggleReplicaFailure}
              variant={replicaFailed ? "secondary" : "danger"}
            >
              Toggle Replica Failure
            </ActionButton>
            <ActionButton onClick={resetStorage} variant="secondary">
              Reset Storage
            </ActionButton>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <MetricBox
              label="Shard 1 primary"
              value={selectedShardOne?.healthy ? "Healthy" : "Failed"}
              tone={selectedShardOne?.healthy ? "success" : "error"}
            />
            <MetricBox
              label="Replica layer"
              value={replicaFailed ? "Failed" : "Healthy"}
              tone={replicaFailed ? "error" : "success"}
            />
          </div>
        </SimulatorPanel>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <InfoPanel title="Shard Key Explanation">
          <ul className="space-y-3">
            <li>A Shard Key decides where a record belongs.</li>
            <li>Records with different keys can be stored on different nodes.</li>
            <li>This reduces the amount of data each node must store.</li>
            <li>
              This simulator uses <code>recordId % shardCount</code> for
              simplicity.
            </li>
          </ul>
        </InfoPanel>

        <InfoPanel title="High Availability">
          <ul className="space-y-3">
            <li>
              Without replication: failure of a shard makes its data
              unavailable.
            </li>
            <li>With replication: another copy may answer read requests.</li>
            <li>
              Replication improves availability but adds coordination
              complexity.
            </li>
          </ul>
        </InfoPanel>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">Recent Event Log</h2>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className={`rounded-lg border p-3 text-sm leading-6 ${getToneClass(log.tone)}`}
            >
              {log.text}
            </div>
          ))}
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
          {proofItems.map((concept) => (
            <li key={concept} className="rounded-lg bg-slate-50 p-3 leading-7">
              {concept}
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}

function ShardCard({
  shard,
  replicationMode,
  replicaFailed,
}: {
  shard: Shard;
  replicationMode: ReplicationMode;
  replicaFailed: boolean;
}) {
  return (
    <article
      className={`rounded-lg border bg-white p-5 shadow-sm ${
        shard.healthy ? "border-slate-200" : "border-rose-200 bg-rose-50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-950">Shard {shard.id}</h2>
          <StatusPill
            label="Status"
            value={shard.healthy ? "Healthy" : "Failed"}
            tone={shard.healthy ? "success" : "error"}
          />
        </div>
        <div className="rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white">
          Key % {shardCount}
        </div>
      </div>

      <RecordList
        title="Records stored in the shard"
        records={shard.records}
        emptyText="No primary records yet."
      />

      {replicationMode !== "none" ? (
        <div className="mt-5 border-t border-slate-200 pt-4">
          <StatusPill
            label="Replica status"
            value={replicaFailed ? "Failed" : "Healthy"}
            tone={replicaFailed ? "error" : "success"}
          />
          <RecordList
            title="Replica records"
            records={shard.replicaRecords}
            emptyText={
              replicationMode === "passive"
                ? "Replica has no synced records yet."
                : "Replica has no records yet."
            }
          />
          {replicationMode === "passive" ? (
            <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
              Pending passive sync: {shard.pendingReplicaRecords.length} record
              {" "}
              {getCopyWord(shard.pendingReplicaRecords.length)}.
            </p>
          ) : null}
        </div>
      ) : (
        <p className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-600">
          Replica status is hidden because No Replication is selected.
        </p>
      )}
    </article>
  );
}

function RecordList({
  title,
  records,
  emptyText,
}: {
  title: string;
  records: StoredRecord[];
  emptyText: string;
}) {
  return (
    <div className="mt-5">
      <h3 className="text-sm font-semibold uppercase tracking-normal text-slate-600">
        {title}
      </h3>
      <div className="mt-3 space-y-2">
        {records.length === 0 ? (
          <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-3 text-sm leading-6 text-slate-600">
            {emptyText}
          </p>
        ) : (
          records.map((record) => (
            <p
              key={record.id}
              className="rounded-md border border-cyan-100 bg-cyan-50 p-3 text-sm font-semibold text-cyan-950"
            >
              {getRecordLabel(record)}
            </p>
          ))
        )}
      </div>
    </div>
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
      <div className="mt-4 leading-7 text-slate-700">{children}</div>
    </section>
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

function StatusPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: LogTone;
}) {
  const toneClass =
    tone === "success"
      ? "bg-emerald-100 text-emerald-800"
      : "bg-rose-100 text-rose-800";

  return (
    <p className={`mt-2 w-fit rounded-full px-3 py-1 text-sm font-semibold ${toneClass}`}>
      {label}: {value}
    </p>
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

function getShardId(recordId: number) {
  return ((recordId % shardCount) + shardCount) % shardCount;
}

function getRecordLabel(record: StoredRecord) {
  return `User #${record.id} (${record.name})`;
}

function getCopyWord(count: number) {
  return count === 1 ? "copy" : "copies";
}

function upsertRecord(records: StoredRecord[], nextRecord: StoredRecord) {
  const recordExists = records.some((record) => record.id === nextRecord.id);

  if (!recordExists) {
    return [...records, nextRecord];
  }

  return records.map((record) =>
    record.id === nextRecord.id ? nextRecord : record,
  );
}

function removePendingRecord(records: StoredRecord[], recordId: number) {
  return records.filter((record) => record.id !== recordId);
}

function getReplicationLabel(mode: ReplicationMode) {
  if (mode === "active") {
    return "Active Replication";
  }

  if (mode === "passive") {
    return "Passive Replication";
  }

  return "No Replication";
}

function getReplicationExplanation(mode: ReplicationMode) {
  if (mode === "active") {
    return "Active replication updates the primary shard and replica immediately when a record is inserted.";
  }

  if (mode === "passive") {
    return "Passive replication writes to the primary shard first. Backup replicas update only after manual sync in this simulator.";
  }

  return "No Replication stores data only on the target shard. If that shard fails, reads for its data fail.";
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
