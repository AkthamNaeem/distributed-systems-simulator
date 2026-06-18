import { ConceptCard } from "@/components/ConceptCard";
import { PageShell } from "@/components/PageShell";

export default function FinalSummaryPage() {
  return (
    <PageShell
      title="Final Summary"
      subtitle="صفحة ثابتة تجمع مفاهيم المشروع وتربطها بمشاكل Distributed Systems الأساسية."
    >
      <section className="grid gap-4 md:grid-cols-2">
        <ConceptCard
          title="ما الذي ستلخصه الصفحة؟"
          explanation="ستلخص لاحقا ما تعلمه المستخدم من RMI و Load Balancing و RPC و Message Passing و Fault Tolerance و Sharding و Replication."
        />
        <ConceptCard
          title="المفهوم الذي تثبته"
          explanation="إثبات أن النظام الموزع ليس مجرد عدة Servers، بل مجموعة قرارات حول التواصل، البيانات، الفشل، والزمن."
        />
        <ConceptCard
          title="ما الذي سيتمكن المستخدم من فعله لاحقا؟"
          explanation="سيستخدم هذه الصفحة لمراجعة النتائج ومقارنة المفاهيم قبل مناقشة المشروع أو عرضه في الجامعة."
        />
        <ConceptCard
          title="ملاحظة المرحلة الحالية"
          explanation="هذه الصفحة لا تجمع نتائج فعلية من المحاكيات بعد، لأن منطق المحاكاة سيتم تنفيذه في مرحلة لاحقة."
        />
      </section>
    </PageShell>
  );
}
