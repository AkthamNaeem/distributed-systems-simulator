import { ConceptCard } from "@/components/ConceptCard";
import { PageShell } from "@/components/PageShell";

export default function RmiSimulatorPage() {
  return (
    <PageShell
      title="RMI Simulator"
      subtitle="A static page that prepares for a Remote Method Invocation simulation between a Client and a Server."
    >
      <section className="grid gap-4 md:grid-cols-2">
        <ConceptCard
          title="What This Page Will Simulate"
          explanation="It will later show the path of calling a remote method from a Client to a Server through a Stub and Registry, then returning the result after Serialization."
        />
        <ConceptCard
          title="Distributed Systems Concept"
          explanation="It proves that RMI hides some network details, but the call is still distributed and affected by latency, failure, and communication between processes."
        />
        <ConceptCard
          title="Later User Action"
          explanation="The user will choose a remote method and visually follow Registry lookup, data preparation, request sending, and response receiving."
        />
        <ConceptCard
          title="Current Phase Note"
          explanation="There is no simulation or interactive logic now. The educational RMI simulator logic will be implemented in a later phase."
        />
      </section>
    </PageShell>
  );
}
