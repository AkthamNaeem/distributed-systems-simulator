import { ConceptCard } from "@/components/ConceptCard";
import { PageShell } from "@/components/PageShell";

export default function LoadBalancerPage() {
  return (
    <PageShell
      title="Load Balancer Simulator"
      subtitle="صفحة ثابتة تشرح فكرة توزيع الطلبات على عدة خوادم بدلا من الاعتماد على Server واحد."
    >
      <section className="grid gap-4 md:grid-cols-2">
        <ConceptCard
          title="ما الذي ستحاكيه الصفحة؟"
          explanation="ستعرض لاحقا كيف يمر الطلب عبر Load Balancer ثم يوزع على Servers بسرعات مختلفة وتحت ضغط مختلف."
        />
        <ConceptCard
          title="المفهوم الذي تثبته"
          explanation="إثبات أن توزيع الحمل يقلل الضغط على الخادم الواحد، لكنه لا يلغي مشكلات latency أو network congestion أو اختلاف أداء الخوادم."
        />
        <ConceptCard
          title="ما الذي سيتمكن المستخدم من فعله لاحقا؟"
          explanation="سيجرب إرسال طلبات متعددة ومقارنة توزيعها بين الخوادم بطريقة مرئية وبسيطة."
        />
        <ConceptCard
          title="ملاحظة المرحلة الحالية"
          explanation="هذه الصفحة هي هيكل تعليمي فقط. لا توجد خوارزميات توزيع، مؤقتات، أو طلبات وهمية في هذه المرحلة."
        />
      </section>
    </PageShell>
  );
}
