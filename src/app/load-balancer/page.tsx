import { ConceptCard } from "@/components/ConceptCard";
import { PageShell } from "@/components/PageShell";

export default function LoadBalancerPage() {
  return (
    <PageShell
      title="Load Balancer Simulator"
      subtitle="A static page explaining the idea of distributing requests across several Servers instead of depending on one Server."
    >
      <section className="grid gap-4 md:grid-cols-2">
        <ConceptCard
          title="What This Page Will Simulate"
          explanation="It will later show how a request passes through a Load Balancer and is distributed to Servers with different speeds and different levels of load."
        />
        <ConceptCard
          title="Distributed Systems Concept"
          explanation="It proves that load distribution reduces pressure on a single Server, but it does not remove latency, network congestion, or different server speeds."
        />
        <ConceptCard
          title="Later User Action"
          explanation="The user will try sending multiple requests and compare how they are distributed between Servers in a simple visual way."
        />
        <ConceptCard
          title="Current Phase Note"
          explanation="This page is only an educational skeleton. There are no distribution algorithms, timers, or fake requests in this phase."
        />
      </section>
    </PageShell>
  );
}
