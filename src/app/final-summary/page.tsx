import { ConceptCard } from "@/components/ConceptCard";
import { PageShell } from "@/components/PageShell";

export default function FinalSummaryPage() {
  return (
    <PageShell
      title="Final Summary"
      subtitle="A static page that gathers the project concepts and connects them to core Distributed Systems problems."
    >
      <section className="grid gap-4 md:grid-cols-2">
        <ConceptCard
          title="What This Page Will Summarize"
          explanation="It will later summarize what the user learned from RMI, Load Balancing, RPC, Message Passing, Fault Tolerance, Sharding, and Replication."
        />
        <ConceptCard
          title="Distributed Systems Concept"
          explanation="It proves that a Distributed System is not only several Servers. It is a set of decisions about communication, data, failure, and time."
        />
        <ConceptCard
          title="Later User Action"
          explanation="The user will use this page to review results and compare concepts before discussing or presenting the project."
        />
        <ConceptCard
          title="Current Phase Note"
          explanation="This page does not collect real results from the simulators yet because simulator logic will be implemented in a later phase."
        />
      </section>
    </PageShell>
  );
}
