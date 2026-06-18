import { ConceptCard } from "@/components/ConceptCard";
import { PageShell } from "@/components/PageShell";

export default function ShardingReplicationPage() {
  return (
    <PageShell
      title="Sharding & Replication"
      subtitle="A static page explaining the difference between splitting data and copying it inside a Distributed System."
    >
      <section className="grid gap-4 md:grid-cols-2">
        <ConceptCard
          title="What This Page Will Simulate"
          explanation="It will later show how data is distributed across different Shards and how Replication creates extra copies for reading or continuity."
        />
        <ConceptCard
          title="Distributed Systems Concept"
          explanation="It proves that Sharding handles scalability by splitting data, while Replication supports reliability and availability of copies. Each approach has trade-offs."
        />
        <ConceptCard
          title="Later User Action"
          explanation="The user will see where records go during Sharding and how replicated data appears on more than one node."
        />
        <ConceptCard
          title="Current Phase Note"
          explanation="There is no real database, storage, or simulation state. The current content is static and only supports the page skeleton."
        />
      </section>
    </PageShell>
  );
}
