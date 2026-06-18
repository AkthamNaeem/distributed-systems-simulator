import { ConceptCard } from "@/components/ConceptCard";
import { PageShell } from "@/components/PageShell";

export default function FaultTolerancePage() {
  return (
    <PageShell
      title="Fault Tolerance Lab"
      subtitle="A static page introducing how a Distributed System can continue when one part fails."
    >
      <section className="grid gap-4 md:grid-cols-2">
        <ConceptCard
          title="What This Page Will Simulate"
          explanation="It will later show a partial failure scenario where a Server fails or becomes slow while other parts of the system continue working."
        />
        <ConceptCard
          title="Distributed Systems Concept"
          explanation="It proves that Fault Tolerance does not mean preventing failure. It means reducing its impact using lecture-scope ideas such as limited retry and Circuit Breaker."
        />
        <ConceptCard
          title="Later User Action"
          explanation="The user will observe how system behavior changes when a service fails and how failure can be isolated instead of spreading to every request."
        />
        <ConceptCard
          title="Current Phase Note"
          explanation="There are no failure toggles, timers, or retry logic now. This page shows only the structure and content."
        />
      </section>
    </PageShell>
  );
}
