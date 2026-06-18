import { ConceptCard } from "@/components/ConceptCard";
import { PageShell } from "@/components/PageShell";

export default function RpcVsMessagePassingPage() {
  return (
    <PageShell
      title="RPC vs Message Passing"
      subtitle="A static page comparing direct service calls with communication through messages."
    >
      <section className="grid gap-4 md:grid-cols-2">
        <ConceptCard
          title="What This Page Will Simulate"
          explanation="It will later show the difference between RPC as a call that looks like a normal function call and Message Passing as sending a message between independent components."
        />
        <ConceptCard
          title="Distributed Systems Concept"
          explanation="It proves that the communication style affects coupling between services, latency, and how partial failure is handled."
        />
        <ConceptCard
          title="Later User Action"
          explanation="The user will choose a communication style, view the path of a request or message, and compare the clarity of steps and dependency between both sides."
        />
        <ConceptCard
          title="Current Phase Note"
          explanation="There is no real implementation of any broker such as RabbitMQ or Kafka, and there are no queues or message logic yet."
        />
      </section>
    </PageShell>
  );
}
