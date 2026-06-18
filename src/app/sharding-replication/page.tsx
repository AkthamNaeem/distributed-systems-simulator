import { ConceptCard } from "@/components/ConceptCard";
import { PageShell } from "@/components/PageShell";

export default function ShardingReplicationPage() {
  return (
    <PageShell
      title="Sharding & Replication"
      subtitle="صفحة ثابتة تشرح الفرق بين تقسيم البيانات ونسخها داخل نظام موزع."
    >
      <section className="grid gap-4 md:grid-cols-2">
        <ConceptCard
          title="ما الذي ستحاكيه الصفحة؟"
          explanation="ستعرض لاحقا كيف يتم توزيع البيانات على Shards مختلفة، وكيف تساعد Replication في وجود نسخ احتياطية للقراءة أو الاستمرارية."
        />
        <ConceptCard
          title="المفهوم الذي تثبته"
          explanation="إثبات أن Sharding يعالج التوسع بتقسيم البيانات، بينما Replication يعالج الاعتمادية وتوفر النسخ، ولكل منهما trade-offs."
        />
        <ConceptCard
          title="ما الذي سيتمكن المستخدم من فعله لاحقا؟"
          explanation="سيشاهد أين تذهب السجلات عند التقسيم، وكيف تظهر نسخة مكررة من البيانات في أكثر من عقدة."
        />
        <ConceptCard
          title="ملاحظة المرحلة الحالية"
          explanation="لا توجد قاعدة بيانات أو تخزين حقيقي أو حالة محاكاة. المحتوى الحالي ثابت ومخصص لهيكل الصفحة فقط."
        />
      </section>
    </PageShell>
  );
}
